'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Fragment, createElement, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  GripVertical,
  Layers3,
  Monitor,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
} from 'lucide-react';
import type { BuilderComponentProps } from '@/components/page-builder/components';
import { PropertiesInspector } from '@/components/page-builder/editor/properties-inspector';
import { allPageComponentDefinitions, getPageComponentDefinition } from '@/components/page-builder/registry';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import {
  canDropComponent,
  deleteComponent,
  duplicateComponent,
  getComponentLocation,
  insertComponent,
  moveComponent,
  moveComponentByOffset,
  moveSectionByOffset,
  reorderSection,
  type ComponentTarget,
  type EditorMutationResult,
} from '@/lib/page-builder/editor-mutations';
import type { ComponentNodeOf, ComponentStyles, PageComponentType, PageSchema, ResponsiveBreakpoint } from '@/lib/page-builder/schema';
import { styleToReact, themeStyle } from '@/lib/page-builder/styles';

type Breakpoint = 'desktop' | ResponsiveBreakpoint;
type DragData =
  | { kind: 'palette'; componentType: PageComponentType }
  | { kind: 'component'; componentId: string }
  | { kind: 'section'; sectionId: string }
  | { kind: 'target'; target: ComponentTarget };

const VIEWPORTS: Record<Breakpoint, number> = { desktop: 1280, laptop: 1100, tablet: 768, mobile: 390 };

const collisionStrategy: CollisionDetection = args => {
  const activeData = dragData(args.active.data.current);
  const droppableContainers = args.droppableContainers.filter(container => {
    const overData = dragData(container.data.current);
    if (!overData || overData.kind === 'palette') return false;
    if (activeData?.kind !== 'section') return true;
    return overData.kind === 'section' || overData.kind === 'target' && overData.target.kind === 'new-section';
  });
  const scopedArgs = { ...args, droppableContainers };
  const pointer = pointerWithin(scopedArgs);
  if (pointer.length > 0) {
    const kindRank: Record<DragData['kind'], number> = { target: 0, component: 1, section: 2, palette: 3 };
    const containersById = new Map(droppableContainers.map(container => [String(container.id), container]));
    return [...pointer].sort((left, right) => {
      const leftKind = dragData(containersById.get(String(left.id))?.data.current)?.kind ?? 'palette';
      const rightKind = dragData(containersById.get(String(right.id))?.data.current)?.kind ?? 'palette';
      return kindRank[leftKind] - kindRank[rightKind];
    });
  }
  return closestCenter(scopedArgs);
};

function dragData(value: unknown): DragData | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as DragData;
  return ['palette', 'component', 'section', 'target'].includes(candidate.kind) ? candidate : null;
}

function targetFromOver(schema: PageSchema, overData: DragData | null): ComponentTarget | null {
  if (!overData) return null;
  if (overData.kind === 'target') return overData.target;
  if (overData.kind === 'component') {
    const location = getComponentLocation(schema, overData.componentId);
    if (!location) return null;
    return location.kind === 'section'
      ? { kind: 'section', sectionId: location.sectionId, index: location.index }
      : { kind: 'component', parentId: location.parentId, index: location.index };
  }
  if (overData.kind === 'section') {
    const section = schema.sections[overData.sectionId];
    return section ? { kind: 'section', sectionId: section.id, index: section.componentIds.length } : null;
  }
  return null;
}

function effectiveStyles(base: ComponentStyles, responsive: Partial<Record<ResponsiveBreakpoint, ComponentStyles>>, breakpoint: Breakpoint): ComponentStyles {
  const style = { ...base };
  if (breakpoint === 'laptop' || breakpoint === 'tablet' || breakpoint === 'mobile') Object.assign(style, responsive.laptop ?? {});
  if (breakpoint === 'tablet' || breakpoint === 'mobile') Object.assign(style, responsive.tablet ?? {});
  if (breakpoint === 'mobile') Object.assign(style, responsive.mobile ?? {});
  return style;
}

function applyResult(
  result: EditorMutationResult,
  setSchema: (schema: PageSchema) => void,
  setSelectedId: (id: string | null) => void,
  setAnnouncement: (message: string) => void,
  successMessage: string
) {
  if ('error' in result) {
    setAnnouncement(`Operación rechazada: ${result.error}.`);
    return;
  }
  setSchema(result.schema);
  if (result.componentId) setSelectedId(result.componentId);
  setAnnouncement(successMessage);
}

type SourcePreview = { title: string; url: string };

export function PageBuilderWorkspace({ initialSchema, name, sourcePreview }: { initialSchema: PageSchema; name: string; sourcePreview?: SourcePreview }) {
  const [schema, setSchema] = useState(() => structuredClone(initialSchema));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [preview, setPreview] = useState(Boolean(sourcePreview));
  const [active, setActive] = useState<DragData | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [invalidOverId, setInvalidOverId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('Editor listo.');
  const pageId = schema.site.defaultPageId;
  const page = schema.pages[pageId];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const componentCount = Object.keys(schema.components).length;

  function addAtEnd(type: PageComponentType) {
    applyResult(
      insertComponent(schema, type, { kind: 'new-section', pageId, index: page.sectionIds.length }),
      setSchema,
      setSelectedId,
      setAnnouncement,
      `${getPageComponentDefinition(type).label} añadido al final de la página.`
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const data = dragData(event.active.data.current);
    setActive(data);
    setAnnouncement(data?.kind === 'palette' ? `Arrastrando ${getPageComponentDefinition(data.componentType).label}.` : 'Elemento levantado.');
  }

  function handleDragOver(event: DragOverEvent) {
    const activeData = dragData(event.active.data.current);
    const overData = dragData(event.over?.data.current);
    const id = event.over ? String(event.over.id) : null;
    setOverId(id);
    if (!activeData || !overData || activeData.kind === 'section') {
      setInvalidOverId(null);
      return;
    }
    const target = targetFromOver(schema, overData);
    if (!target) {
      setInvalidOverId(id);
      return;
    }
    const type = activeData.kind === 'palette'
      ? activeData.componentType
      : activeData.kind === 'component'
        ? schema.components[activeData.componentId]?.type
        : undefined;
    const rejected = type ? canDropComponent(schema, type, target, activeData.kind === 'component' ? activeData.componentId : undefined) : 'component-missing';
    setInvalidOverId(rejected ? id : null);
  }

  function resetDrag() {
    setActive(null);
    setOverId(null);
    setInvalidOverId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeData = dragData(event.active.data.current);
    const overData = dragData(event.over?.data.current);
    const overKey = event.over ? String(event.over.id) : null;
    if (!activeData || !overData || !overKey || invalidOverId === overKey) {
      setAnnouncement(invalidOverId === overKey ? 'Destino no permitido.' : 'Arrastre cancelado.');
      resetDrag();
      return;
    }

    if (activeData.kind === 'section') {
      const targetIndex = overData.kind === 'target' && overData.target.kind === 'new-section'
        ? overData.target.index
        : overData.kind === 'section'
          ? page.sectionIds.indexOf(overData.sectionId)
          : -1;
      if (targetIndex >= 0) applyResult(reorderSection(schema, pageId, activeData.sectionId, targetIndex), setSchema, setSelectedId, setAnnouncement, 'Sección reordenada.');
      resetDrag();
      return;
    }

    const target = targetFromOver(schema, overData);
    if (!target) {
      setAnnouncement('No se encontró un destino válido.');
      resetDrag();
      return;
    }
    const result = activeData.kind === 'palette'
      ? insertComponent(schema, activeData.componentType, target)
      : activeData.kind === 'component'
        ? moveComponent(schema, activeData.componentId, target)
        : { error: 'component-missing' as const };
    applyResult(result, setSchema, setSelectedId, setAnnouncement, activeData.kind === 'palette' ? 'Componente añadido.' : 'Componente movido.');
    resetDrag();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={() => { setAnnouncement('Arrastre cancelado.'); resetDrag(); }}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-[760px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e13] text-white lg:h-[min(88vh,920px)] lg:min-h-[680px]" data-page-builder>
        <BuilderToolbar name={name} breakpoint={breakpoint} onBreakpoint={setBreakpoint} preview={preview} sourcePreview={Boolean(sourcePreview)} onPreview={() => setPreview(value => !value)} sectionCount={page.sectionIds.length} componentCount={componentCount} />
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {!preview ? <ComponentLibrary onAdd={addAtEnd} /> : null}
          <main className="min-h-[560px] min-w-0 flex-1" aria-label="Canvas del sitio">
            {preview ? (
              <div className="h-full overflow-auto bg-[#08090d] p-2 sm:p-4">
                <div className="mx-auto h-full min-h-[540px] overflow-hidden rounded-xl bg-white shadow-2xl transition-[width] duration-200" style={{ width: VIEWPORTS[breakpoint], maxWidth: '100%' }}>
                  {sourcePreview
                    ? <iframe title={`Página original: ${sourcePreview.title}`} src={sourcePreview.url} className="size-full border-0 bg-white" />
                    : <PageRenderer schema={schema} />}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto bg-[#08090d] p-4 sm:p-7" onClick={() => setSelectedId(null)}>
                <div className="mx-auto transition-[width] duration-200" style={{ width: VIEWPORTS[breakpoint], maxWidth: '100%' }}>
                  <div
                    className="min-h-[620px] overflow-hidden rounded-xl bg-white text-slate-950 shadow-2xl shadow-black/40 ring-1 ring-white/10"
                    style={{
                      ...themeStyle(schema.site.theme),
                      background: 'var(--ps-colors-background)',
                      color: 'var(--ps-colors-text)',
                      fontFamily: 'var(--ps-typography-bodyFontFamily)',
                    }}
                  >
                    <SortableContext items={page.sectionIds.map(id => `section:${id}`)} strategy={verticalListSortingStrategy}>
                      <SectionDropZone target={{ kind: 'new-section', pageId, index: 0 }} active={Boolean(active)} overId={overId} invalidOverId={invalidOverId} />
                      {page.sectionIds.map((sectionId, index) => (
                        <Fragment key={sectionId}>
                          <SectionEditor
                          schema={schema}
                          sectionId={sectionId}
                          breakpoint={breakpoint}
                          selectedId={selectedId}
                          onSelect={setSelectedId}
                          overId={overId}
                          invalidOverId={invalidOverId}
                          active={Boolean(active)}
                          onMoveSection={offset => applyResult(moveSectionByOffset(schema, pageId, sectionId, offset), setSchema, setSelectedId, setAnnouncement, 'Sección movida.')}
                          onMove={(id, offset) => applyResult(moveComponentByOffset(schema, id, offset), setSchema, setSelectedId, setAnnouncement, 'Componente movido.')}
                          onDuplicate={id => applyResult(duplicateComponent(schema, id), setSchema, setSelectedId, setAnnouncement, 'Componente duplicado.')}
                          onDelete={id => { applyResult(deleteComponent(schema, id), setSchema, setSelectedId, setAnnouncement, 'Componente eliminado.'); if (selectedId === id) setSelectedId(null); }}
                          />
                          <SectionDropZone target={{ kind: 'new-section', pageId, index: index + 1 }} active={Boolean(active)} overId={overId} invalidOverId={invalidOverId} />
                        </Fragment>
                      ))}
                    </SortableContext>
                    {page.sectionIds.length === 0 ? <EmptyCanvas onAdd={() => addAtEnd('hero')} /> : null}
                  </div>
                </div>
              </div>
            )}
          </main>
          {!preview ? <PropertiesInspector schema={schema} selectedId={selectedId} breakpoint={breakpoint} onSchemaChange={setSchema} onAnnounce={setAnnouncement} /> : null}
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 px-3 py-1.5 text-[11px] text-zinc-400">
          <span>{page.sectionIds.length} secciones</span><span>{componentCount} componentes</span><span className="ml-auto" aria-live="polite">{announcement}</span>
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {active ? <div className="rounded-lg border border-violet-300/40 bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-xl">{dragLabel(active, schema)}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}

function BuilderToolbar({ name, breakpoint, onBreakpoint, preview, sourcePreview, onPreview, sectionCount, componentCount }: { name: string; breakpoint: Breakpoint; onBreakpoint: (value: Breakpoint) => void; preview: boolean; sourcePreview: boolean; onPreview: () => void; sectionCount: number; componentCount: number }) {
  const options: Array<{ value: Breakpoint; label: string; icon: ReactNode }> = [
    { value: 'desktop', label: 'Desktop', icon: <Monitor className="size-3.5" /> },
    { value: 'laptop', label: 'Laptop', icon: <Monitor className="size-3.5" /> },
    { value: 'tablet', label: 'Tablet', icon: <Tablet className="size-3.5" /> },
    { value: 'mobile', label: 'Mobile', icon: <Smartphone className="size-3.5" /> },
  ];
  const previewLabel = sourcePreview ? preview ? 'Editar por bloques' : 'Ver página original' : preview ? 'Volver al editor' : 'Vista previa';
  return <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2 sm:gap-3"><div className="min-w-0 flex-1 sm:flex-none"><p className="truncate text-xs font-black">{name}</p><p className="text-[10px] text-zinc-500">{sourcePreview && preview ? 'Original aislado · responsive' : `PageSchema · ${sectionCount} secciones · ${componentCount} componentes`}</p></div><div className="order-3 flex w-full items-center justify-center gap-1 rounded-full border border-white/10 p-0.5 sm:order-none sm:ml-auto sm:w-auto" role="tablist" aria-label="Viewport">{options.map(option => <button key={option.value} type="button" role="tab" aria-label={option.label} aria-selected={breakpoint === option.value} onClick={() => onBreakpoint(option.value)} className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${breakpoint === option.value ? 'bg-violet-600' : 'text-zinc-400 hover:bg-white/10'}`}>{option.icon}<span className="hidden md:inline">{option.label}</span></button>)}</div><button type="button" onClick={onPreview} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${preview ? 'bg-emerald-600' : 'bg-violet-600'}`}><Eye className="size-3.5" />{previewLabel}</button></header>;
}

function ComponentLibrary({ onAdd }: { onAdd: (type: PageComponentType) => void }) {
  return <aside className="max-h-56 w-full shrink-0 overflow-y-auto border-b border-white/10 p-3 lg:max-h-none lg:w-[250px] lg:border-b-0 lg:border-r" aria-label="Biblioteca de componentes"><div className="mb-3 flex items-center gap-2"><Layers3 className="size-4 text-violet-300" /><div><h2 className="text-xs font-black">Componentes</h2><p className="text-[10px] text-zinc-500">Arrastra o pulsa + para añadir</p></div></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">{allPageComponentDefinitions().map(definition => <PaletteItem key={definition.type} type={definition.type} label={definition.label} onAdd={() => onAdd(definition.type)} />)}</div></aside>;
}

function PaletteItem({ type, label, onAdd }: { type: PageComponentType; label: string; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette:${type}`, data: { kind: 'palette', componentType: type } satisfies DragData });
  return <div ref={setNodeRef} className={`flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.04] p-2 ${isDragging ? 'opacity-35' : 'hover:border-violet-400/40 hover:bg-violet-500/10'}`}><button type="button" {...attributes} {...listeners} className="cursor-grab rounded p-1 text-zinc-500 hover:text-white active:cursor-grabbing" aria-label={`Arrastrar ${label}`}><GripVertical className="size-4" /></button><span className="min-w-0 flex-1 truncate text-xs font-semibold">{label}</span><button type="button" onClick={onAdd} className="rounded p-1 text-violet-300 hover:bg-white/10" aria-label={`Añadir ${label} al final`}><Plus className="size-4" /></button></div>;
}

function SectionDropZone({ target, active, overId, invalidOverId }: { target: Extract<ComponentTarget, { kind: 'new-section' }>; active: boolean; overId: string | null; invalidOverId: string | null }) {
  const id = `target:new-section:${target.index}`;
  const { setNodeRef, isOver } = useDroppable({ id, data: { kind: 'target', target } satisfies DragData });
  const invalid = invalidOverId === id;
  return <div ref={setNodeRef} data-drop-zone="section" data-drop-index={target.index} className={`relative grid transition-all ${active ? 'h-8 place-items-center' : 'h-2'} ${isOver ? invalid ? 'bg-rose-500/20' : 'bg-violet-500/20' : ''}`}><span className={`h-0.5 w-[96%] rounded-full ${isOver ? invalid ? 'bg-rose-400' : 'bg-violet-500' : active ? 'bg-violet-400/25' : 'bg-transparent'}`} />{active && isOver ? <span className={`absolute rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${invalid ? 'bg-rose-500 text-white' : 'bg-violet-600 text-white'}`}>{invalid ? 'No permitido' : 'Nueva sección'}</span> : null}{overId === id ? null : null}</div>;
}

function SectionEditor({ schema, sectionId, breakpoint, selectedId, onSelect, overId, invalidOverId, active, onMoveSection, onMove, onDuplicate, onDelete }: { schema: PageSchema; sectionId: string; breakpoint: Breakpoint; selectedId: string | null; onSelect: (id: string) => void; overId: string | null; invalidOverId: string | null; active: boolean; onMoveSection: (offset: -1 | 1) => void; onMove: (id: string, offset: -1 | 1) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void }) {
  const section = schema.sections[sectionId];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `section:${sectionId}`, data: { kind: 'section', sectionId } satisfies DragData });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1, ...styleToReact(effectiveStyles(section.styles, section.responsive, breakpoint)) };
  const invalid = invalidOverId === `section:${sectionId}`;
  return <section ref={setNodeRef} style={style} data-builder-section={sectionId} className={`group/section relative min-h-20 border-y ${invalid ? 'border-rose-400 bg-rose-500/10' : 'border-transparent hover:border-violet-400/25'}`}><div className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950/90 px-1.5 py-1 text-white opacity-0 shadow-lg transition group-hover/section:opacity-100 focus-within:opacity-100"><button type="button" {...attributes} {...listeners} className="cursor-grab rounded p-1 hover:bg-white/10 active:cursor-grabbing" aria-label={`Reordenar sección ${section.name}`}><GripVertical className="size-3.5" /></button><span className="px-1 text-[10px] font-bold">{section.name}</span><MiniAction label="Subir sección" onClick={() => onMoveSection(-1)}><ArrowUp className="size-3" /></MiniAction><MiniAction label="Bajar sección" onClick={() => onMoveSection(1)}><ArrowDown className="size-3" /></MiniAction></div><SortableContext items={section.componentIds.map(id => `component:${id}`)} strategy={verticalListSortingStrategy}><div className="min-h-16">{section.componentIds.map(id => <ComponentEditor key={id} schema={schema} componentId={id} breakpoint={breakpoint} selectedId={selectedId} onSelect={onSelect} overId={overId} invalidOverId={invalidOverId} active={active} onMove={onMove} onDuplicate={onDuplicate} onDelete={onDelete} />)}<ComponentDropZone target={{ kind: 'section', sectionId, index: section.componentIds.length }} label="Soltar en la sección" active={active} overId={overId} invalidOverId={invalidOverId} /></div></SortableContext></section>;
}

function ComponentEditor({ schema, componentId, breakpoint, selectedId, onSelect, overId, invalidOverId, active, onMove, onDuplicate, onDelete }: { schema: PageSchema; componentId: string; breakpoint: Breakpoint; selectedId: string | null; onSelect: (id: string) => void; overId: string | null; invalidOverId: string | null; active: boolean; onMove: (id: string, offset: -1 | 1) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void }) {
  const node = schema.components[componentId];
  const definition = getPageComponentDefinition(node.type);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `component:${componentId}`, data: { kind: 'component', componentId } satisfies DragData });
  const Component = definition.component as unknown as ComponentType<BuilderComponentProps<PageComponentType>>;
  const compatibleNode = node as unknown as ComponentNodeOf<PageComponentType>;
  const canHaveChildren = definition.allowedChildren === '*' || definition.allowedChildren.length > 0;
  const componentStyle = effectiveStyles({ ...definition.defaultStyles, ...node.styles }, node.responsive, breakpoint);
  if (node.type === 'columns') {
    const breakpointOrder: Record<Breakpoint, number> = {
      desktop: 0,
      laptop: 1,
      tablet: 2,
      mobile: 3,
    };
    if (breakpointOrder[breakpoint] >= breakpointOrder[node.props.stackAt]) {
      componentStyle.gridTemplateColumns = '1fr';
    }
  }
  const children = node.children.map(childId => <ComponentEditor key={childId} schema={schema} componentId={childId} breakpoint={breakpoint} selectedId={selectedId} onSelect={onSelect} overId={overId} invalidOverId={invalidOverId} active={active} onMove={onMove} onDuplicate={onDuplicate} onDelete={onDelete} />);
  if (canHaveChildren) children.push(<ComponentDropZone key={`inside-${componentId}`} target={{ kind: 'component', parentId: componentId, index: node.children.length }} label="Soltar dentro" active={active} overId={overId} invalidOverId={invalidOverId} />);
  const rendered = createElement(Component, { node: compatibleNode, className: `ps-component-${componentId}`, style: styleToReact(componentStyle) }, ...children);
  const selected = selectedId === componentId;
  const invalid = invalidOverId === `component:${componentId}`;
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }} data-builder-component={componentId} data-component-type={node.type} className={`group/component relative ${invalid ? 'outline outline-2 outline-rose-500 outline-offset-[-2px]' : selected ? 'z-10 outline outline-2 outline-violet-500 outline-offset-[-2px]' : 'hover:outline hover:outline-1 hover:outline-violet-400/50 hover:outline-offset-[-1px]'}`} onClick={event => { event.stopPropagation(); onSelect(componentId); }}><div className={`absolute right-2 top-2 z-30 flex items-center gap-0.5 rounded-full border border-white/10 bg-zinc-950/90 p-1 text-white shadow-lg ${selected ? 'opacity-100' : 'opacity-0 group-hover/component:opacity-100 focus-within:opacity-100'}`}><button type="button" {...attributes} {...listeners} className="cursor-grab rounded p-1 hover:bg-white/10 active:cursor-grabbing" aria-label={`Arrastrar ${definition.label}`}><GripVertical className="size-3.5" /></button><MiniAction label="Mover arriba" onClick={() => onMove(componentId, -1)}><ArrowUp className="size-3" /></MiniAction><MiniAction label="Mover abajo" onClick={() => onMove(componentId, 1)}><ArrowDown className="size-3" /></MiniAction><MiniAction label="Duplicar" onClick={() => onDuplicate(componentId)}><Copy className="size-3" /></MiniAction><MiniAction label="Eliminar" onClick={() => onDelete(componentId)} danger><Trash2 className="size-3" /></MiniAction></div>{rendered}</div>;
}

function ComponentDropZone({ target, label, active, overId, invalidOverId }: { target: Exclude<ComponentTarget, { kind: 'new-section' }>; label: string; active: boolean; overId: string | null; invalidOverId: string | null }) {
  const owner = target.kind === 'section' ? target.sectionId : target.parentId;
  const id = `target:${target.kind}:${owner}:${target.index}`;
  const { setNodeRef, isOver } = useDroppable({ id, data: { kind: 'target', target } satisfies DragData });
  const invalid = invalidOverId === id;
  return <div ref={setNodeRef} data-drop-zone={target.kind} className={`grid min-h-3 place-items-center border border-dashed transition-all ${active ? 'my-1 h-8' : 'h-3 border-transparent'} ${isOver ? invalid ? 'border-rose-400 bg-rose-500/15 text-rose-600' : 'border-violet-500 bg-violet-500/15 text-violet-700' : active ? 'border-violet-300/40 text-violet-400/70' : ''}`}><span className={`text-[9px] font-black uppercase ${active ? 'block' : 'sr-only'}`}>{isOver && invalid ? 'Destino no permitido' : label}</span>{overId === id ? null : null}</div>;
}

function MiniAction({ label, onClick, children, danger }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return <button type="button" aria-label={label} title={label} onClick={event => { event.stopPropagation(); onClick(); }} className={`rounded p-1 hover:bg-white/10 ${danger ? 'text-rose-300' : ''}`}>{children}</button>;
}

function EmptyCanvas({ onAdd }: { onAdd: () => void }) {
  return <div className="grid min-h-[560px] place-items-center p-8 text-center" data-empty-canvas><div><Layers3 className="mx-auto size-8 text-violet-500" /><h2 className="mt-4 text-lg font-black">El lienzo está vacío</h2><p className="mt-2 max-w-sm text-sm text-slate-500">Arrastra un componente desde la biblioteca o crea un Hero para comenzar.</p><button type="button" onClick={event => { event.stopPropagation(); onAdd(); }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white"><Plus className="size-4" />Añadir Hero</button></div></div>;
}

function dragLabel(data: DragData, schema: PageSchema): string {
  if (data.kind === 'palette') return getPageComponentDefinition(data.componentType).label;
  if (data.kind === 'component') return getPageComponentDefinition(schema.components[data.componentId]?.type ?? 'text').label;
  if (data.kind === 'section') return schema.sections[data.sectionId]?.name ?? 'Sección';
  return 'Destino';
}

export default PageBuilderWorkspace;

'use client';

import { useEditor, useEditorStore } from '@/components/editor/editor-store-context';
import { isOverridden, resolveStyles, type Breakpoint, type EditorNode } from '@/lib/editor/document';
import { getDefinition } from '@/lib/editor/registry';
import { DEFAULT_TOKENS, UNITS, formatLength, parseLength, tokensByGroup, type Unit } from '@/lib/editor/tokens';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlignCenter, AlignEndHorizontal, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignStartHorizontal, Link2, Link2Off, MoveHorizontal, MoveVertical, RotateCcw } from 'lucide-react';
import { useState } from 'react';

const TABS = ['content', 'style', 'layout', 'mobile', 'interactions', 'data', 'advanced'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  content: 'Contenido',
  style: 'Estilo',
  layout: 'Disposición',
  mobile: 'Móvil',
  interactions: 'Interacción',
  data: 'Datos',
  advanced: 'Avanzado',
};

/**
 * Panel de propiedades.
 *
 * Todo lo que se edita aquí sale del **registro** (`defaultProps` del tipo) y de
 * los estilos del nodo; el panel no conoce ningún tipo por nombre. Añadir un
 * componente al registro le da panel de propiedades gratis, que es lo que
 * rompía el constructor anterior: sus controles estaban escritos a mano para 18
 * variables fijas.
 *
 * Cada cambio se escribe como comando (`setProps` / `setStyles`) **en el
 * breakpoint activo**, así que entra en el historial y respeta la herencia.
 */
export function InspectorPanel() {
  const store = useEditorStore();
  const selectedId = useEditor(state => (state.selection.length === 1 ? state.selection[0] : null));
  const node = useEditor(state => (selectedId ? state.document.nodes[selectedId] : undefined));
  const breakpoint = useEditor(state => state.editor.breakpoint);
  const [tab, setTab] = useState<Tab>('content');

  if (!node || !selectedId) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-xs text-muted-foreground">
        Selecciona un elemento del lienzo para editar sus propiedades.
      </div>
    );
  }

  const definition = getDefinition(node.type);
  const style = resolveStyles(node, breakpoint);

  const setStyle = (patch: Record<string, string | number | null>) =>
    store.run({ kind: 'setStyles', id: selectedId, breakpoint, patch });
  const setProp = (patch: Record<string, unknown>) => store.run({ kind: 'setProps', id: selectedId, patch });

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-white/10 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-400">{definition?.label ?? node.type}</p>
        <p className="mt-0.5 truncate text-sm font-bold">{node.name ?? definition?.label ?? node.type}</p>
        {breakpoint !== 'desktop' ? (
          <p className="mt-1 text-[10px] text-amber-300">
            Editando solo en {breakpoint}. Lo que no cambies se hereda del tamaño mayor.
          </p>
        ) : null}
      </header>

      <nav className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-white/10 p-1.5" role="tablist">
        {TABS.map(value => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold transition ${
              tab === value ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:bg-white/5'
            }`}
          >
            {TAB_LABELS[value]}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === 'content' ? <ContentTab node={node} onChange={setProp} /> : null}
        {tab === 'style' ? <StyleTab node={node} breakpoint={breakpoint} style={style} onChange={setStyle} /> : null}
        {tab === 'layout' ? <LayoutTab node={node} breakpoint={breakpoint} style={style} onChange={setStyle} /> : null}
        {tab === 'mobile' ? <MobileTab node={node} breakpoint={breakpoint} style={style} onStyleChange={setStyle} onPropChange={setProp} /> : null}
        {tab === 'interactions' ? <Placeholder text="Las interacciones y animaciones llegan en la fase 4. El modelo ya reserva su sitio en el nodo." /> : null}
        {tab === 'data' ? <Placeholder text="El binding de datos y las variables llegan en la fase 4." /> : null}
        {tab === 'advanced' ? <AdvancedTab node={node} onChange={setProp} /> : null}
      </div>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return <p className="p-2 text-xs leading-relaxed text-muted-foreground">{text}</p>;
}

/* ------------------------------------------------------------- contenido --- */

function ContentTab({ node, onChange }: { node: EditorNode; onChange: (patch: Record<string, unknown>) => void }) {
  const definition = getDefinition(node.type);
  const keys = Object.keys({ ...(definition?.defaultProps ?? {}), ...node.props });

  if (keys.length === 0) return <Placeholder text="Este componente no tiene contenido propio; su contenido son sus hijos." />;

  return (
    <div className="grid gap-3">
      {keys.map(key => {
        const value = node.props[key] ?? definition?.defaultProps[key] ?? '';
        if (typeof value === 'boolean') {
          return (
            <label key={key} className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold capitalize">{key}</span>
              <input type="checkbox" checked={value} onChange={event => onChange({ [key]: event.target.checked })} />
            </label>
          );
        }
        if (Array.isArray(value)) {
          return (
            <Field key={key} label={`${key} (uno por línea)`}>
              <textarea
                value={value.join('\n')}
                onChange={event => onChange({ [key]: event.target.value.split('\n') })}
                rows={Math.min(Math.max(value.length, 2), 6)}
                className="w-full rounded-md border border-white/15 bg-black/30 p-2 text-xs"
              />
            </Field>
          );
        }
        return (
          <Field key={key} label={key}>
            <Input
              value={String(value)}
              onChange={event => onChange({ [key]: typeof value === 'number' ? Number(event.target.value) : event.target.value })}
              type={typeof value === 'number' ? 'number' : 'text'}
              className="h-8 text-xs"
            />
          </Field>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- estilo --- */

function StyleTab({
  node,
  breakpoint,
  style,
  onChange,
}: {
  node: EditorNode;
  breakpoint: Breakpoint;
  style: Record<string, string | number>;
  onChange: (patch: Record<string, string | number | null>) => void;
}) {
  return (
    <div className="grid gap-4">
      <ColorField label="Color de texto" property="color" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <ColorField label="Fondo" property="background" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <Field label="Tipografía">
        <select
          value={String(style.fontFamily ?? '')}
          onChange={event => onChange({ fontFamily: event.target.value || null })}
          className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"
        >
          <option value="">Heredada</option>
          {tokensByGroup(DEFAULT_TOKENS, 'font').map(([key]) => (
            <option key={key} value={`token:${key}`}>{key}</option>
          ))}
        </select>
      </Field>
      <LengthField label="Tamaño de fuente" property="fontSize" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <Field label="Grosor">
        <select
          value={String(style.fontWeight ?? '')}
          onChange={event => onChange({ fontWeight: event.target.value || null })}
          className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"
        >
          {['', '400', '500', '600', '700', '800', '900'].map(weight => (
            <option key={weight} value={weight}>{weight || 'Heredado'}</option>
          ))}
        </select>
      </Field>
      <LinkedBox label="Radio de borde" properties={['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius']} shorthand="borderRadius" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <Field label="Sombra">
        <select
          value={String(style.boxShadow ?? '')}
          onChange={event => onChange({ boxShadow: event.target.value || null })}
          className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"
        >
          <option value="">Ninguna</option>
          {tokensByGroup(DEFAULT_TOKENS, 'shadow').map(([key]) => (
            <option key={key} value={`token:${key}`}>{key}</option>
          ))}
        </select>
      </Field>
      <Field label={`Opacidad · ${style.opacity ?? 1}`}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={Number(style.opacity ?? 1)}
          onChange={event => onChange({ opacity: Number(event.target.value) })}
          className="w-full"
        />
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------ disposición --- */

function LayoutTab({
  node,
  breakpoint,
  style,
  onChange,
}: {
  node: EditorNode;
  breakpoint: Breakpoint;
  style: Record<string, string | number>;
  onChange: (patch: Record<string, string | number | null>) => void;
}) {
  const display = String(style.display ?? '');
  return (
    <div className="grid gap-4">
      <Field label="Display">
        <div className="flex gap-1">
          {['block', 'flex', 'grid', 'inline-flex', 'none'].map(value => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ display: value })}
              className={`flex-1 rounded-md px-1.5 py-1 text-[10px] font-bold transition ${display === value ? 'bg-violet-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </Field>

      {display === 'flex' || display === 'inline-flex' ? (
        <>
          <IconChoice
            label="Dirección"
            property="flexDirection"
            value={String(style.flexDirection ?? 'row')}
            options={[
              { value: 'row', icon: <MoveHorizontal className="h-3.5 w-3.5" />, title: 'Fila' },
              { value: 'column', icon: <MoveVertical className="h-3.5 w-3.5" />, title: 'Columna' },
            ]}
            onChange={onChange}
          />
          <IconChoice
            label="Justificar"
            property="justifyContent"
            value={String(style.justifyContent ?? 'flex-start')}
            options={[
              { value: 'flex-start', icon: <AlignHorizontalJustifyStart className="h-3.5 w-3.5" />, title: 'Inicio' },
              { value: 'center', icon: <AlignHorizontalJustifyCenter className="h-3.5 w-3.5" />, title: 'Centro' },
              { value: 'flex-end', icon: <AlignHorizontalJustifyEnd className="h-3.5 w-3.5" />, title: 'Final' },
              { value: 'space-between', icon: <AlignCenter className="h-3.5 w-3.5" />, title: 'Espaciado' },
            ]}
            onChange={onChange}
          />
          <IconChoice
            label="Alinear"
            property="alignItems"
            value={String(style.alignItems ?? 'stretch')}
            options={[
              { value: 'flex-start', icon: <AlignStartHorizontal className="h-3.5 w-3.5" />, title: 'Arriba' },
              { value: 'center', icon: <AlignCenter className="h-3.5 w-3.5" />, title: 'Centro' },
              { value: 'flex-end', icon: <AlignEndHorizontal className="h-3.5 w-3.5" />, title: 'Abajo' },
              { value: 'stretch', icon: <MoveVertical className="h-3.5 w-3.5" />, title: 'Estirar' },
            ]}
            onChange={onChange}
          />
          <Field label="Wrap">
            <div className="flex gap-1">
              {['nowrap', 'wrap'].map(value => (
                <button key={value} type="button" onClick={() => onChange({ flexWrap: value })} className={`flex-1 rounded-md px-2 py-1 text-[10px] font-bold ${String(style.flexWrap ?? 'nowrap') === value ? 'bg-violet-600 text-white' : 'bg-white/5'}`}>
                  {value}
                </button>
              ))}
            </div>
          </Field>
        </>
      ) : null}

      {display === 'grid' ? (
        <>
          <Field label="Columnas">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 6].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChange({ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` })}
                  className={`flex-1 rounded-md py-1 text-[10px] font-bold ${String(style.gridTemplateColumns ?? '').includes(`repeat(${count},`) ? 'bg-violet-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  {count}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Auto flow">
            <select value={String(style.gridAutoFlow ?? 'row')} onChange={event => onChange({ gridAutoFlow: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs">
              {['row', 'column', 'dense'].map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
        </>
      ) : null}

      <LengthField label="Gap" property="gap" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <LengthField label="Ancho" property="width" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <LengthField label="Ancho máximo" property="maxWidth" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <LengthField label="Alto" property="height" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <LengthField label="Alto mínimo" property="minHeight" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <LinkedBox label="Relleno" properties={['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']} shorthand="padding" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <LinkedBox label="Margen" properties={['marginTop', 'marginRight', 'marginBottom', 'marginLeft']} shorthand="margin" node={node} breakpoint={breakpoint} style={style} onChange={onChange} />
      <Field label="Posición">
        <select value={String(style.position ?? 'static')} onChange={event => onChange({ position: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs">
          {['static', 'relative', 'absolute', 'sticky', 'fixed'].map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </Field>
      <Field label="Overflow">
        <select value={String(style.overflow ?? 'visible')} onChange={event => onChange({ overflow: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs">
          {['visible', 'hidden', 'auto', 'scroll'].map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </Field>
    </div>
  );
}

/* --------------------------------------------------------------- móvil --- */

/**
 * Controles complementarios para interfaces táctiles. No duplica Layout:
 * concentra tamaños avanzados, posicionamiento fino, efectos y semántica
 * móvil que no cabían en los controles cotidianos.
 */
function MobileTab({
  node,
  breakpoint,
  style,
  onStyleChange,
  onPropChange,
}: {
  node: EditorNode;
  breakpoint: Breakpoint;
  style: Record<string, string | number>;
  onStyleChange: (patch: Record<string, string | number | null>) => void;
  onPropChange: (patch: Record<string, unknown>) => void;
}) {
  return (
    <div className="grid gap-4">
      <PropertyGroup title="Tamaño móvil">
        <div className="grid grid-cols-2 gap-2">
          <LengthField label="Ancho mín." property="minWidth" node={node} breakpoint={breakpoint} style={style} onChange={onStyleChange} />
          <LengthField label="Ancho máx." property="maxWidth" node={node} breakpoint={breakpoint} style={style} onChange={onStyleChange} />
          <LengthField label="Alto mín." property="minHeight" node={node} breakpoint={breakpoint} style={style} onChange={onStyleChange} />
          <LengthField label="Alto máx." property="maxHeight" node={node} breakpoint={breakpoint} style={style} onChange={onStyleChange} />
        </div>
        <Field label="Aspect ratio"><Input value={String(style.aspectRatio ?? '')} placeholder="p. ej. 16 / 9" onChange={event => onStyleChange({ aspectRatio: event.target.value || null })} className="h-8 text-xs" /></Field>
      </PropertyGroup>

      <PropertyGroup title="Anclaje y profundidad">
        <div className="grid grid-cols-2 gap-2">
          {([['Top', 'top'], ['Right', 'right'], ['Bottom', 'bottom'], ['Left', 'left']] as const).map(([label, property]) => <LengthField key={property} label={label} property={property} node={node} breakpoint={breakpoint} style={style} onChange={onStyleChange} />)}
        </div>
        <Field label="Z-index"><Input type="number" value={String(style.zIndex ?? '')} onChange={event => onStyleChange({ zIndex: event.target.value ? Number(event.target.value) : null })} className="h-8 text-xs" /></Field>
      </PropertyGroup>

      <PropertyGroup title="Efectos">
        <Field label={`Blur · ${style.filter ? 'activo' : 'ninguno'}`}><input type="range" min="0" max="24" value={Number(String(style.filter ?? '').match(/\d+/)?.[0] ?? 0)} onChange={event => onStyleChange({ filter: Number(event.target.value) ? `blur(${event.target.value}px)` : null })} className="w-full" /></Field>
        <Field label="Backdrop blur"><select value={String(style.backdropFilter ?? '')} onChange={event => onStyleChange({ backdropFilter: event.target.value || null })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="">Ninguno</option><option value="blur(4px)">Sutil</option><option value="blur(12px)">Medio</option><option value="blur(24px)">Intenso</option></select></Field>
        <Field label="Touch action"><select value={String(style.touchAction ?? 'auto')} onChange={event => onStyleChange({ touchAction: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="auto">Auto</option><option value="manipulation">Manipulación</option><option value="pan-y">Scroll vertical</option><option value="none">Desactivado</option></select></Field>
      </PropertyGroup>

      <PropertyGroup title="Plataforma y safe area">
        <Field label="Plataforma objetivo"><select value={String(node.props.platform ?? 'universal')} onChange={event => onPropChange({ platform: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="universal">Universal (Web, iOS y Android)</option><option value="ios">iOS</option><option value="android">Android</option></select></Field>
        <Field label="Safe area"><select value={String(node.props.safeArea ?? 'none')} onChange={event => onPropChange({ safeArea: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="none">Sin aplicar</option><option value="top">Superior</option><option value="bottom">Inferior</option><option value="vertical">Vertical</option><option value="all">Todos los bordes</option></select></Field>
        <Field label="Orientación"><select value={String(node.props.orientation ?? 'any')} onChange={event => onPropChange({ orientation: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="any">Cualquiera</option><option value="portrait">Vertical</option><option value="landscape">Horizontal</option></select></Field>
        <label className="flex items-center justify-between gap-2 text-xs"><span className="font-semibold">Adaptar a modo oscuro</span><input type="checkbox" checked={Boolean(node.props.adaptiveDarkMode)} onChange={event => onPropChange({ adaptiveDarkMode: event.target.checked })} /></label>
      </PropertyGroup>

      <PropertyGroup title="Estados táctiles y gestos">
        <Field label="Estado de vista"><select value={String(node.props.mobileState ?? 'default')} onChange={event => onPropChange({ mobileState: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="default">Default</option><option value="pressed">Pressed</option><option value="disabled">Disabled</option><option value="loading">Loading</option><option value="error">Error</option></select></Field>
        <Field label="Gesto"><select value={String(node.props.gesture ?? 'tap')} onChange={event => onPropChange({ gesture: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="tap">Tap</option><option value="longPress">Long press</option><option value="swipe">Swipe</option><option value="drag">Drag</option><option value="pinch">Pinch</option></select></Field>
        <Field label="Respuesta háptica"><select value={String(node.props.haptic ?? 'none')} onChange={event => onPropChange({ haptic: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="none">Ninguna</option><option value="light">Ligera</option><option value="medium">Media</option><option value="success">Éxito</option><option value="warning">Aviso</option></select></Field>
      </PropertyGroup>

      <PropertyGroup title="Navegación e inputs móviles">
        <Field label="Patrón de navegación"><select value={String(node.props.navigationPattern ?? 'none')} onChange={event => onPropChange({ navigationPattern: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="none">No aplica</option><option value="appBar">App bar</option><option value="tabBar">Tab bar</option><option value="bottomSheet">Bottom sheet</option><option value="modal">Modal</option></select></Field>
        <Field label="Teclado"><select value={String(node.props.keyboardType ?? 'default')} onChange={event => onPropChange({ keyboardType: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="default">Predeterminado</option><option value="email">Email</option><option value="numeric">Numérico</option><option value="phone">Teléfono</option><option value="url">URL</option></select></Field>
        <Field label="Return key"><select value={String(node.props.returnKey ?? 'done')} onChange={event => onPropChange({ returnKey: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="done">Done</option><option value="next">Next</option><option value="search">Search</option><option value="send">Send</option></select></Field>
      </PropertyGroup>

      <PropertyGroup title="Accesibilidad y visibilidad">
        <Field label="Rol"><Input value={String(node.props.role ?? '')} placeholder="button, navigation…" onChange={event => onPropChange({ role: event.target.value })} className="h-8 text-xs" /></Field>
        <Field label="Etiqueta accesible"><Input value={String(node.props.ariaLabel ?? '')} onChange={event => onPropChange({ ariaLabel: event.target.value })} className="h-8 text-xs" /></Field>
        <Field label="Dirección"><select value={String(node.props.textDirection ?? 'auto')} onChange={event => onPropChange({ textDirection: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="auto">Automática</option><option value="ltr">LTR</option><option value="rtl">RTL</option></select></Field>
        <Field label="Dynamic Type"><select value={String(node.props.dynamicType ?? 'body')} onChange={event => onPropChange({ dynamicType: event.target.value })} className="h-8 w-full rounded-md border border-white/15 bg-black/30 px-2 text-xs"><option value="fixed">Tamaño fijo</option><option value="caption">Caption</option><option value="body">Body</option><option value="headline">Headline</option><option value="title">Title</option><option value="largeTitle">Large title</option></select></Field>
        <label className="flex items-center justify-between gap-2 text-xs"><span className="font-semibold">Ocultar en este breakpoint</span><input type="checkbox" checked={style.display === 'none'} onChange={event => onStyleChange({ display: event.target.checked ? 'none' : null })} /></label>
      </PropertyGroup>
    </div>
  );
}

function PropertyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return <section className="rounded-lg border border-white/10 p-2.5"><button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className="flex w-full items-center justify-between text-left text-[10px] font-black uppercase tracking-[.14em] text-violet-300">{title}<span>{open ? '−' : '+'}</span></button>{open ? <div className="mt-3 grid gap-3">{children}</div> : null}</section>;
}

/* -------------------------------------------------------------- avanzado --- */

function AdvancedTab({ node, onChange }: { node: EditorNode; onChange: (patch: Record<string, unknown>) => void }) {
  return (
    <div className="grid gap-3">
      <Field label="ID en el HTML">
        <Input value={String(node.props.domId ?? '')} onChange={event => onChange({ domId: event.target.value })} className="h-8 text-xs" placeholder="hero-principal" />
      </Field>
      <Field label="Clases CSS">
        <Input value={String(node.props.className ?? '')} onChange={event => onChange({ className: event.target.value })} className="h-8 text-xs" placeholder="mi-clase otra-clase" />
      </Field>
      <Field label="aria-label">
        <Input value={String(node.props.ariaLabel ?? '')} onChange={event => onChange({ ariaLabel: event.target.value })} className="h-8 text-xs" />
      </Field>
      <p className="rounded-md border border-amber-500/25 bg-amber-500/5 p-2 text-[11px] leading-relaxed text-amber-200">
        El CSS y el HTML propios llegan cuando esté el saneado del contenido. Pintar HTML del usuario
        sin sanear es una vía directa de XSS, así que no se habilita antes.
      </p>
      <p className="text-[11px] text-muted-foreground">
        Tipo: <code className="rounded bg-black/40 px-1">{node.type}</code> · id:{' '}
        <code className="rounded bg-black/40 px-1">{node.id}</code>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- controles --- */

/**
 * Control gráfico de una propiedad enumerada.
 *
 * Iconos en vez de un `select`: en flexbox y grid, ver la dirección y la
 * alineación vale más que leerlas, que es justo la diferencia entre un
 * formulario y un editor visual.
 */
function IconChoice({
  label,
  property,
  value,
  options,
  onChange,
}: {
  label: string;
  property: string;
  value: string;
  options: Array<{ value: string; icon: React.ReactNode; title: string }>;
  onChange: (patch: Record<string, string | number | null>) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-1" role="group" aria-label={label}>
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-label={option.title}
            aria-pressed={value === option.value}
            onClick={() => onChange({ [property]: option.value })}
            className={`grid h-8 flex-1 place-items-center rounded-md transition ${
              value === option.value ? 'bg-violet-600 text-white' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {option.icon}
          </button>
        ))}
      </div>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/** Marca de sobrescritura: un punto ámbar si el valor se fijó en este breakpoint. */
function OverrideDot({ node, breakpoint, property, onReset }: { node: EditorNode; breakpoint: Breakpoint; property: string; onReset: () => void }) {
  if (!isOverridden(node, breakpoint, property)) return null;
  return (
    <button
      type="button"
      onClick={onReset}
      title={`Sobrescrito en ${breakpoint} — pulsa para volver al valor heredado`}
      aria-label={`Quitar la sobrescritura de ${property} en ${breakpoint}`}
      className="flex items-center gap-1 text-[10px] font-bold text-amber-300"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
      <RotateCcw className="h-3 w-3" />
    </button>
  );
}

function LengthField({
  label,
  property,
  node,
  breakpoint,
  style,
  onChange,
}: {
  label: string;
  property: string;
  node: EditorNode;
  breakpoint: Breakpoint;
  style: Record<string, string | number>;
  onChange: (patch: Record<string, string | number | null>) => void;
}) {
  const parsed = parseLength(style[property]);
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</Label>
        <OverrideDot node={node} breakpoint={breakpoint} property={property} onReset={() => onChange({ [property]: null })} />
      </div>
      <div className="flex gap-1">
        <Input
          type="number"
          value={parsed && parsed.unit !== 'auto' ? parsed.value : ''}
          placeholder="—"
          onChange={event => {
            const raw = event.target.value;
            if (raw === '') return onChange({ [property]: null });
            onChange({ [property]: formatLength({ value: Number(raw), unit: parsed?.unit === 'auto' ? 'px' : (parsed?.unit ?? 'px') }) });
          }}
          className="h-8 flex-1 text-xs"
        />
        <select
          value={parsed?.unit ?? 'px'}
          onChange={event => {
            const unit = event.target.value as Unit;
            if (unit === 'auto') return onChange({ [property]: 'auto' });
            onChange({ [property]: formatLength({ value: parsed?.value ?? 0, unit }) });
          }}
          className="h-8 w-16 rounded-md border border-white/15 bg-black/30 px-1 text-[11px]"
          aria-label={`Unidad de ${label}`}
        >
          {UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
        </select>
      </div>
    </div>
  );
}

/**
 * Caja de cuatro lados con vínculo.
 *
 * Vinculado escribe la abreviatura (`padding`); desvinculado escribe los cuatro
 * lados. Es el comportamiento de Figma y Webflow, y evita el problema de tener
 * `padding` y `paddingTop` peleándose en el mismo nodo.
 */
function LinkedBox({
  label,
  properties,
  shorthand,
  node,
  breakpoint,
  style,
  onChange,
}: {
  label: string;
  properties: string[];
  shorthand: string;
  node: EditorNode;
  breakpoint: Breakpoint;
  style: Record<string, string | number>;
  onChange: (patch: Record<string, string | number | null>) => void;
}) {
  const shorthandValue = style[shorthand];
  const [linked, setLinked] = useState(() => shorthandValue !== undefined || properties.every(p => style[p] === undefined));
  const sides = ['Arriba', 'Derecha', 'Abajo', 'Izquierda'];

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-1.5">
          <OverrideDot node={node} breakpoint={breakpoint} property={linked ? shorthand : properties[0]} onReset={() => onChange(Object.fromEntries([[shorthand, null], ...properties.map(p => [p, null])]))} />
          <button
            type="button"
            onClick={() => {
              const next = !linked;
              setLinked(next);
              // Al cambiar de modo se limpia el otro para que no queden ambos.
              if (next) onChange(Object.fromEntries(properties.map(p => [p, null])));
              else onChange({ [shorthand]: null });
            }}
            title={linked ? 'Desvincular los cuatro lados' : 'Vincular los cuatro lados'}
            aria-label={linked ? 'Desvincular' : 'Vincular'}
            className={`rounded p-1 ${linked ? 'text-violet-300' : 'text-muted-foreground'} hover:bg-white/10`}
          >
            {linked ? <Link2 className="h-3 w-3" /> : <Link2Off className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {linked ? (
        <Input
          value={String(shorthandValue ?? '')}
          placeholder="p. ej. 16px o token:spacing.md"
          onChange={event => onChange({ [shorthand]: event.target.value || null })}
          className="h-8 text-xs"
        />
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {properties.map((property, index) => (
            <Input
              key={property}
              value={String(style[property] ?? '')}
              placeholder={sides[index]}
              aria-label={`${label} ${sides[index]}`}
              onChange={event => onChange({ [property]: event.target.value || null })}
              className="h-8 text-xs"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ColorField({
  label,
  property,
  node,
  breakpoint,
  style,
  onChange,
}: {
  label: string;
  property: string;
  node: EditorNode;
  breakpoint: Breakpoint;
  style: Record<string, string | number>;
  onChange: (patch: Record<string, string | number | null>) => void;
}) {
  const value = String(style[property] ?? '');
  const isToken = value.startsWith('token:');
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</Label>
        <OverrideDot node={node} breakpoint={breakpoint} property={property} onReset={() => onChange({ [property]: null })} />
      </div>
      <div className="flex gap-1">
        <select
          value={isToken ? value : ''}
          onChange={event => onChange({ [property]: event.target.value || null })}
          className="h-8 min-w-0 flex-1 rounded-md border border-white/15 bg-black/30 px-2 text-[11px]"
        >
          <option value="">Personalizado</option>
          {tokensByGroup(DEFAULT_TOKENS, 'color').map(([key]) => (
            <option key={key} value={`token:${key}`}>{key}</option>
          ))}
        </select>
        <input
          type="color"
          value={isToken ? (DEFAULT_TOKENS[value.slice(6)] ?? '#000000') : value || '#000000'}
          onChange={event => onChange({ [property]: event.target.value })}
          aria-label={`${label} personalizado`}
          className="h-8 w-10 cursor-pointer rounded-md border border-white/15 bg-transparent"
        />
      </div>
    </div>
  );
}

export default InspectorPanel;

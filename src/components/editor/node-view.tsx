'use client';

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useEditor, useEditorStore } from '@/components/editor/editor-store-context';
import { resolveStyles, type Breakpoint, type EditorNode } from '@/lib/editor/document';
import { getDefinition, validateChild } from '@/lib/editor/registry';
import { DEFAULT_TOKENS, DARK_TOKENS, isTokenRef, resolveToken, type DesignTokens } from '@/lib/editor/tokens';
import { hasEditorDrag, readEditorDrag, resolveDropPosition, writeEditorDrag, type DropPosition } from '@/lib/editor/drag';
import { Maximize2, Minimize2, Move, Scaling } from 'lucide-react';

/** Estilos efectivos del nodo, con tokens resueltos. */
function cssFor(node: EditorNode, breakpoint: Breakpoint, tokens: DesignTokens): CSSProperties {
  const resolved = resolveStyles(node, breakpoint);
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(resolved)) {
    out[key] = isTokenRef(value) ? resolveToken(value, tokens) : value;
  }
  return out as CSSProperties;
}

type NodeViewProps = { id: string; depth?: number };

/**
 * Renderiza un nodo del documento.
 *
 * Cada vista **se suscribe a su propio nodo**: editar un título no repinta los
 * otros 999 nodos, porque ningún otro selector cambia de identidad. Los hijos se
 * renderizan por id, no por objeto, para que reordenar no recree sus subárboles.
 */
export const NodeView = memo(function NodeView({ id, depth = 0 }: NodeViewProps) {
  const store = useEditorStore();
  const node = useEditor(state => state.document.nodes[id]);
  const breakpoint = useEditor(state => state.editor.breakpoint);
  const zoom = useEditor(state => state.editor.zoom);
  const preview = useEditor(state => state.editor.preview);
  const dark = useEditor(state => state.editor.darkCanvas);
  const isSelected = useEditor(state => state.selection.includes(id));
  const isHover = useEditor(state => state.runtime.hoverId === id);
  const dragging = useEditor(state => state.runtime.draggingId);
  const [dropHint, setDropHint] = useState<DropPosition | null>(null);
  const [editing, setEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const tokens = dark ? DARK_TOKENS : DEFAULT_TOKENS;
  const definition = node ? getDefinition(node.type) : undefined;
  const style = useMemo(
    () => (node ? cssFor(node, breakpoint, tokens) : {}),
    [node, breakpoint, tokens]
  );

  useEffect(() => {
    if (!editing) return;
    const element = elementRef.current?.querySelector<HTMLElement>('[data-inline-edit]');
    element?.focus();
    if (element && document.createRange) {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [editing]);

  if (!node || node.hidden) return null;

  const acceptsChildren = Boolean(definition?.rules.canHaveChildren);
  const inlineProp = definition?.inlineTextProp;
  const isBeingDragged = dragging === id;

  /** Traduce el punto donde se suelta a una posición concreta del documento. */
  function commitDrop(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDropHint(null);
    store.setRuntime({ dropTarget: null, invalidDrop: false, draggingId: null });

    const payload = readEditorDrag(event);
    if (!payload) return;
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;
    const position = resolveDropPosition(rect, event.clientY, acceptsChildren);

    const parentId = position === 'inside' ? id : node.parentId;
    if (!parentId) return;
    const siblings = store.getState().document.nodes[parentId]?.children ?? [];
    const index =
      position === 'inside'
        ? siblings.length
        : siblings.indexOf(id) + (position === 'after' ? 1 : 0);

    if (payload.source === 'tree') {
      store.run({ kind: 'move', id: payload.id, parentId, index });
      return;
    }
    if (payload.source === 'palette') {
      store.insertType(payload.type, parentId, index);
    }
  }

  function previewDrop(event: React.DragEvent) {
    if (!hasEditorDrag(event)) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;
    const position = resolveDropPosition(rect, event.clientY, acceptsChildren);
    setDropHint(position);

    // `getData` solo está disponible de manera consistente al soltar. El
    // feedback de posición sí puede mostrarse durante el arrastre.
    const payload = readEditorDrag(event);
    if (!payload) return;

    // Rechazo visible: si la regla no lo permite, el indicador se pinta en rojo.
    const targetParentId = position === 'inside' ? id : node.parentId;
    const targetParent = targetParentId ? store.getState().document.nodes[targetParentId] : undefined;
    const childType =
      payload.source === 'tree' ? store.getState().document.nodes[payload.id]?.type : payload.source === 'palette' ? payload.type : undefined;
    const invalid = Boolean(
      targetParent && childType && validateChild(targetParent.type, childType, targetParent.children.length)
    );
    store.setRuntime({ invalidDrop: invalid });
  }

  const outline = preview
    ? undefined
    : isSelected
      ? '2px solid var(--editor-accent)'
      : isHover
        ? '1px dashed color-mix(in srgb, var(--editor-accent) 55%, transparent)'
        : undefined;

  const children = node.children.map(childId => <NodeView key={childId} id={childId} depth={depth + 1} />);

  const content = (() => {
    const text = (prop: string) => String(node.props[prop] ?? '');
    const border = `1px solid ${resolveToken('token:color.border', tokens)}`;
    const muted = resolveToken('token:color.muted', tokens);
    switch (node.type) {
      case 'heading': {
        const Tag = (`h${Math.min(Math.max(Number(node.props.level ?? 2), 1), 6)}`) as 'h2';
        return <Tag data-inline-edit={editing || undefined} suppressContentEditableWarning contentEditable={editing} onBlur={e => finishInline(e)}>{text('text')}</Tag>;
      }
      case 'text':
        return <p data-inline-edit={editing || undefined} suppressContentEditableWarning contentEditable={editing} onBlur={e => finishInline(e)}>{text('text')}</p>;
      case 'button':
      case 'submitButton':
        return (
          <span
            data-inline-edit={editing || undefined}
            suppressContentEditableWarning
            contentEditable={editing}
            onBlur={e => finishInline(e)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: resolveToken('token:color.primary', tokens), color: '#fff', fontWeight: 700 }}
          >
            {text('label') || 'Botón'}
          </span>
        );
      case 'link':
        return (
          <span
            data-inline-edit={editing || undefined}
            suppressContentEditableWarning
            contentEditable={editing}
            onBlur={e => finishInline(e)}
            style={{ color: resolveToken('token:color.primary', tokens), textDecoration: 'underline', cursor: 'pointer' }}
          >
            {text('text') || 'Enlace'}
          </span>
        );
      case 'badge':
        return (
          <span
            data-inline-edit={editing || undefined}
            suppressContentEditableWarning
            contentEditable={editing}
            onBlur={e => finishInline(e)}
            style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 10px', background: resolveToken('token:color.primary', tokens), color: '#fff', fontSize: 12, fontWeight: 700 }}
          >
            {text('text') || 'Nuevo'}
          </span>
        );
      case 'avatar':
        return node.props.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(node.props.src)} alt={text('alt')} style={{ display: 'block', width: '48px', height: '48px', borderRadius: '999px', objectFit: 'cover' }} />
        ) : (
          <span style={{ display: 'grid', width: 48, height: 48, placeItems: 'center', borderRadius: '999px', background: resolveToken('token:color.primary', tokens), color: '#fff', fontSize: 12, fontWeight: 800 }}>
            {text('initials') || 'PS'}
          </span>
        );
      case 'image':
        return node.props.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(node.props.src)} alt={text('alt')} style={{ display: 'block', width: '100%' }} />
        ) : (
          <span style={{ display: 'grid', placeItems: 'center', minHeight: 120, background: 'color-mix(in srgb, currentColor 8%, transparent)', fontSize: 12 }}>
            Imagen
          </span>
        );
      case 'divider':
        return <span style={{ display: 'block', height: 1, background: resolveToken('token:color.border', tokens) }} />;
      case 'spacer':
        return <span style={{ display: 'block' }} />;
      case 'input':
      case 'textarea':
        return (
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: resolveToken('token:color.muted', tokens) }}>{text('label')}</span>
            <span
              data-inline-edit={editing || undefined}
              suppressContentEditableWarning
              contentEditable={editing}
              onBlur={e => finishInline(e)}
              style={{ display: 'block', minHeight: node.type === 'textarea' ? 84 : 40, border: `1px solid ${resolveToken('token:color.border', tokens)}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: resolveToken('token:color.muted', tokens) }}
            >
              {text('placeholder')}
            </span>
          </label>
        );
      case 'login':
        return (
          <div style={{ display: 'grid', gap: 16, padding: 28, border: `1px solid ${resolveToken('token:color.border', tokens)}`, borderRadius: 16, background: 'color-mix(in srgb, currentColor 3%, transparent)' }}>
            <div><strong style={{ display: 'block', fontSize: 22 }}>{text('title') || 'Iniciar sesión'}</strong><span style={{ fontSize: 13, color: resolveToken('token:color.muted', tokens) }}>Accede a tu cuenta para continuar.</span></div>
            {[text('emailLabel') || 'Correo electrónico', text('passwordLabel') || 'Contraseña'].map((label, index) => <label key={label} style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}><span>{label}</span><span style={{ height: 42, border: `1px solid ${resolveToken('token:color.border', tokens)}`, borderRadius: 10, padding: '11px 12px', color: resolveToken('token:color.muted', tokens), fontWeight: 400 }}>{index === 0 ? 'user@example.com' : '••••••••'}</span></label>)}
            <span style={{ display: 'inline-flex', justifyContent: 'center', borderRadius: 10, padding: '11px 16px', background: resolveToken('token:color.primary', tokens), color: '#fff', fontWeight: 800 }}>{text('submitLabel') || 'Iniciar sesión'}</span>
            <span style={{ fontSize: 12, textAlign: 'center', color: resolveToken('token:color.primary', tokens) }}>{text('helper') || '¿Olvidaste tu contraseña?'}</span>
          </div>
        );
      case 'tabs':
        return <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${resolveToken('token:color.border', tokens)}`, paddingBottom: 8 }}>{(Array.isArray(node.props.tabs) ? node.props.tabs : ['Uno', 'Dos']).map((tab, index) => <span key={String(tab)} style={{ borderRadius: 8, padding: '8px 12px', background: index === 0 ? resolveToken('token:color.primary', tokens) : 'transparent', color: index === 0 ? '#fff' : resolveToken('token:color.muted', tokens), fontSize: 13, fontWeight: 700 }}>{String(tab)}</span>)}</div>;
      case 'navbar':
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: `1px solid ${resolveToken('token:color.border', tokens)}`, borderRadius: 12 }}><strong>Marca</strong><span style={{ display: 'flex', gap: 16, fontSize: 13, color: resolveToken('token:color.muted', tokens) }}>Inicio · Producto · Contacto</span><span style={{ color: resolveToken('token:color.primary', tokens), fontWeight: 800 }}>Menú</span></div>;
      case 'checkbox':
      case 'radio':
      case 'switch':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 16, height: 16, borderRadius: node.type === 'switch' ? 999 : 4, border: `1px solid ${resolveToken('token:color.primary', tokens)}` }} />
            <span data-inline-edit={editing || undefined} suppressContentEditableWarning contentEditable={editing} onBlur={e => finishInline(e)}>{text('label')}</span>
          </span>
        );
      case 'select':
        return <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}><span>{text('label') || 'Selecciona una opción'}</span><span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border, borderRadius: 10, padding: '10px 12px', color: muted, fontWeight: 400 }}>{String((node.props.options as string[] | undefined)?.[0] ?? 'Opción')} <b>⌄</b></span></label>;
      case 'breadcrumbs': {
        const items = Array.isArray(node.props.items) ? node.props.items : ['Inicio', 'Sección'];
        return <span style={{ display: 'flex', gap: 8, color: muted, fontSize: 13 }}>{items.map((item, index) => <span key={String(item)}>{index ? '› ' : ''}{String(item)}</span>)}</span>;
      }
      case 'sidebar':
        return <aside style={{ display: 'grid', gap: 12, padding: 16, border, borderRadius: 12 }}><strong>Menú</strong>{['Inicio', 'Proyecto', 'Ajustes'].map(item => <span key={item} style={{ color: muted, fontSize: 13 }}>{item}</span>)}</aside>;
      case 'list': {
        const items = Array.isArray(node.props.items) ? node.props.items : ['Primero', 'Segundo'];
        return <ul style={{ display: 'grid', gap: 8, paddingLeft: 20, color: muted }}>{items.map(item => <li key={String(item)}>{String(item)}</li>)}</ul>;
      }
      case 'table': {
        const columns = Array.isArray(node.props.columns) ? node.props.columns : ['Plan', 'Precio'];
        const rows = Array.isArray(node.props.rows) ? node.props.rows as unknown[][] : [['Free', '$0']];
        return <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border }}><thead><tr>{columns.map(column => <th key={String(column)} style={{ padding: 10, textAlign: 'left', borderBottom: border }}>{String(column)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} style={{ padding: 10, color: muted, borderBottom: border }}>{String(cell)}</td>)}</tr>)}</tbody></table>;
      }
      case 'accordion': {
        const item = Array.isArray(node.props.items) ? node.props.items[0] as { title?: string; body?: string } : undefined;
        return <div style={{ border, borderRadius: 12, padding: 14 }}><strong>{item?.title ?? 'Pregunta frecuente'} <span style={{ float: 'right' }}>⌄</span></strong><p style={{ marginTop: 10, color: muted, fontSize: 13 }}>{item?.body ?? 'Respuesta visible para esta sección.'}</p></div>;
      }
      case 'carousel':
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 150, padding: 18, border, borderRadius: 14, background: 'color-mix(in srgb, currentColor 4%, transparent)' }}><b>‹</b><span style={{ color: muted }}>Slide 1 de {Number(node.props.slides ?? 3)}</span><b>›</b></div>;
      case 'modal':
        return <div style={{ maxWidth: 360, margin: 'auto', padding: 22, border, borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,.18)' }}><strong style={{ fontSize: 18 }}>{text('title') || 'Título del modal'}</strong><p style={{ marginTop: 8, color: muted, fontSize: 13 }}>Contenido del diálogo.</p><span style={{ display: 'inline-flex', marginTop: 16, borderRadius: 8, padding: '8px 12px', background: resolveToken('token:color.primary', tokens), color: '#fff', fontSize: 12, fontWeight: 700 }}>Confirmar</span></div>;
      case 'tooltip':
        return <span style={{ display: 'inline-flex', borderRadius: 8, padding: '8px 10px', background: '#18181b', color: '#fff', fontSize: 12 }}>{text('text') || 'Ayuda'}</span>;
      case 'video':
        return <div style={{ display: 'grid', minHeight: 170, placeItems: 'center', borderRadius: 12, background: '#18181b', color: '#fff' }}><span style={{ borderRadius: 999, padding: '10px 14px', background: resolveToken('token:color.primary', tokens) }}>▶ Reproducir vídeo</span></div>;
      case 'audio':
        return <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border, borderRadius: 12 }}><span style={{ color: resolveToken('token:color.primary', tokens) }}>▶</span><span style={{ flex: 1, height: 4, borderRadius: 99, background: 'color-mix(in srgb, currentColor 14%, transparent)' }} /><span style={{ color: muted, fontSize: 11 }}>0:00</span></div>;
      case 'gallery':
        return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>{[1, 2, 3].map(item => <span key={item} style={{ display: 'grid', minHeight: 90, placeItems: 'center', borderRadius: 8, background: 'color-mix(in srgb, currentColor 8%, transparent)', color: muted, fontSize: 11 }}>Imagen {item}</span>)}</div>;
      case 'chart':
        return <div style={{ display: 'flex', alignItems: 'end', gap: 10, height: 150, padding: 16, border, borderRadius: 12 }}>{[45, 80, 60, 110, 75].map((height, index) => <span key={index} style={{ width: '15%', height, borderRadius: '5px 5px 0 0', background: resolveToken('token:color.primary', tokens) }} />)}</div>;
      case 'code':
      case 'html':
      case 'embed':
        return <pre style={{ overflow: 'hidden', borderRadius: 10, padding: 14, background: '#18181b', color: '#d4d4d8', fontSize: 12 }}>{text('code') || text('html') || '<Component />'}</pre>;
      case 'apiData':
      case 'dynamic':
        return <div style={{ padding: 14, border, borderRadius: 10, color: muted, fontSize: 12 }}><b style={{ color: resolveToken('token:color.primary', tokens) }}>{node.type === 'apiData' ? 'API' : 'Dinámico'}</b><br />{text('url') || text('source') || 'Configura una fuente de datos'}</div>;
      default:
        // Los hijos se montan una sola vez al final del wrapper. Renderizarlos
        // también aquí duplicaba cada sección del borrador de una plantilla.
        return children.length > 0 ? null : <span style={{ fontSize: 11, opacity: 0.5 }}>{definition?.label ?? node.type}</span>;
    }
  })();

  function finishInline(event: React.FocusEvent<HTMLElement>) {
    setEditing(false);
    if (!inlineProp) return;
    const next = event.currentTarget.textContent ?? '';
    if (next !== String(node.props[inlineProp] ?? '')) {
      store.run({ kind: 'setProps', id, patch: { [inlineProp]: next } });
    }
  }

  const layoutMode = String(node.props.__editorLayoutMode ?? 'normal');

  function snapshotLayout() {
    const keys = ['position', 'left', 'top', 'width', 'height', 'minHeight', 'maxWidth', 'overflow'] as const;
    return Object.fromEntries(keys.map(key => [key, style[key] ?? null]));
  }

  function restoreLayout() {
    const saved = node.props.__editorLayoutRestore;
    const patch = saved && typeof saved === 'object' ? saved as Record<string, string | number | null> : {
      position: null, left: null, top: null, width: null, height: null, minHeight: null, maxWidth: null, overflow: null,
    };
    store.run({ kind: 'setStyles', id, breakpoint, patch });
    store.run({ kind: 'setProps', id, patch: { __editorLayoutMode: 'normal', __editorLayoutRestore: null } });
  }

  function setLayoutMode(mode: 'minimized' | 'maximized') {
    if (layoutMode === mode) {
      restoreLayout();
      return;
    }
    const restore = layoutMode === 'normal' ? snapshotLayout() : node.props.__editorLayoutRestore;
    store.run({ kind: 'setProps', id, patch: { __editorLayoutMode: mode, __editorLayoutRestore: restore } });
    store.run({
      kind: 'setStyles', id, breakpoint, patch: mode === 'minimized'
        ? { height: 48, minHeight: 48, overflow: 'hidden' }
        : { position: 'relative', left: null, top: null, width: '100%', maxWidth: '100%', height: 'auto', minHeight: null, overflow: 'visible' },
    });
  }

  function beginDirectManipulation(event: React.PointerEvent<HTMLElement>, kind: 'move' | 'resize') {
    if (preview || node.locked || !elementRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    store.select([id]);
    const element = elementRef.current;
    const parent = element.parentElement;
    if (!parent) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const rect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const initialLeft = (rect.left - parentRect.left) / zoom;
    const initialTop = (rect.top - parentRect.top) / zoom;
    const initialWidth = rect.width / zoom;
    const initialHeight = rect.height / zoom;
    const pointerId = event.pointerId;
    const control = event.currentTarget;
    control.setPointerCapture(pointerId);

    const movePointer = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      if (kind === 'move') {
        element.style.position = 'absolute';
        element.style.left = `${Math.max(0, initialLeft + dx)}px`;
        element.style.top = `${Math.max(0, initialTop + dy)}px`;
      } else {
        element.style.width = `${Math.max(48, initialWidth + dx)}px`;
        element.style.height = `${Math.max(32, initialHeight + dy)}px`;
        element.style.overflow = 'hidden';
      }
    };
    const finishPointer = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', movePointer);
      window.removeEventListener('pointerup', finishPointer);
      window.removeEventListener('pointercancel', finishPointer);
      const finalRect = element.getBoundingClientRect();
      if (kind === 'move') {
        store.run({ kind: 'setStyles', id, breakpoint, patch: {
          position: 'absolute', left: Math.max(0, (finalRect.left - parentRect.left) / zoom), top: Math.max(0, (finalRect.top - parentRect.top) / zoom),
        } });
      } else {
        store.run({ kind: 'setStyles', id, breakpoint, patch: {
          width: Math.max(48, finalRect.width / zoom), height: Math.max(32, finalRect.height / zoom), overflow: 'hidden',
        } });
      }
      if (control.hasPointerCapture(pointerId)) control.releasePointerCapture(pointerId);
      void upEvent;
    };
    window.addEventListener('pointermove', movePointer);
    window.addEventListener('pointerup', finishPointer);
    window.addEventListener('pointercancel', finishPointer);
  }

  const isLeafWithContent = !['section', 'container', 'row', 'column', 'grid', 'flex', 'stack', 'form', 'card', 'navbar', 'sidebar', 'tabs', 'modal', 'list'].includes(node.type);

  return (
    <div
      ref={elementRef}
      data-node-id={id}
      data-selected={isSelected || undefined}
      draggable={!preview && !node.locked}
      onDragStart={event => {
        if (preview || node.locked) return;
        if ((event.target as HTMLElement).closest('[data-editor-control]')) {
          event.preventDefault();
          return;
        }
        event.stopPropagation();
        writeEditorDrag(event, { source: 'tree', id });
        store.setRuntime({ draggingId: id });
      }}
      onDragEnd={() => store.setRuntime({ draggingId: null, invalidDrop: false })}
      onDragOver={previewDrop}
      onDragLeave={() => setDropHint(null)}
      onDrop={commitDrop}
      onMouseEnter={event => {
        if (preview) return;
        event.stopPropagation();
        store.setRuntime({ hoverId: id });
      }}
      onMouseLeave={() => {
        if (!preview && store.getState().runtime.hoverId === id) store.setRuntime({ hoverId: null });
      }}
      onClick={event => {
        if (preview) return;
        event.stopPropagation();
        if (event.shiftKey) store.toggleInSelection(id);
        else store.select([id]);
      }}
      onDoubleClick={event => {
        if (preview || !inlineProp) return;
        event.stopPropagation();
        setEditing(true);
      }}
      style={{
        ...style,
        position: style.position ?? 'relative',
        outline,
        outlineOffset: 1,
        opacity: isBeingDragged ? 0.4 : node.locked && !preview ? 0.75 : 1,
        cursor: preview ? undefined : editing ? 'text' : 'default',
        ...(isLeafWithContent ? {} : { minHeight: node.children.length === 0 ? 56 : undefined }),
      }}
    >
      {isSelected && !preview ? (
        <div data-editor-control className="absolute right-1 top-1 z-[30] flex items-center gap-0.5 rounded-md border border-white/15 bg-black/90 p-1 text-white shadow-xl" onClick={event => event.stopPropagation()}>
          <button type="button" title="Mover libremente" aria-label="Mover libremente" className="cursor-move rounded p-1 hover:bg-white/15 touch-none" onPointerDown={event => beginDirectManipulation(event, 'move')}><Move className="size-3.5" /></button>
          <button type="button" title={layoutMode === 'minimized' ? 'Restaurar tamaño' : 'Minimizar componente'} aria-label={layoutMode === 'minimized' ? 'Restaurar tamaño' : 'Minimizar componente'} className="rounded p-1 hover:bg-white/15" onClick={() => setLayoutMode('minimized')}><Minimize2 className="size-3.5" /></button>
          <button type="button" title={layoutMode === 'maximized' ? 'Restaurar tamaño' : 'Maximizar componente'} aria-label={layoutMode === 'maximized' ? 'Restaurar tamaño' : 'Maximizar componente'} className="rounded p-1 hover:bg-white/15" onClick={() => setLayoutMode('maximized')}><Maximize2 className="size-3.5" /></button>
        </div>
      ) : null}
      {/* Indicador de posición: línea antes/después, marco al soltar dentro. */}
      {dropHint && !preview ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            ...(dropHint === 'before' ? { top: -2 } : dropHint === 'after' ? { bottom: -2 } : { inset: 0 }),
            height: dropHint === 'inside' ? undefined : 3,
            borderRadius: 3,
            border: dropHint === 'inside' ? '2px dashed var(--editor-accent)' : undefined,
            background: dropHint === 'inside' ? 'color-mix(in srgb, var(--editor-accent) 10%, transparent)' : 'var(--editor-accent)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      ) : null}
      {content}
      {isLeafWithContent ? null : children}
      {isSelected && !preview && layoutMode !== 'minimized' ? (
        <button data-editor-control type="button" title="Cambiar tamaño" aria-label="Cambiar tamaño" className="absolute bottom-0 right-0 z-[29] grid size-5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize place-items-center rounded-sm bg-violet-600 text-white shadow-lg touch-none" onPointerDown={event => beginDirectManipulation(event, 'resize')}><Scaling className="size-3" /></button>
      ) : null}
    </div>
  );
});

export default NodeView;

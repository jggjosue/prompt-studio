'use client';

import { ComponentsPanel } from '@/components/editor/components-panel';
import { EditorCanvas, VIEWPORT_WIDTH, nudge } from '@/components/editor/editor-canvas';
import { EditorPagePreview } from '@/components/editor/editor-page-preview';
import { EditorStoreProvider, useEditor, useEditorStore } from '@/components/editor/editor-store-context';
import { InspectorPanel } from '@/components/editor/inspector-panel';
import { LayersPanel } from '@/components/editor/layers-panel';
import { Button } from '@/components/ui/button';
import { BREAKPOINTS, countNodes, type Breakpoint } from '@/lib/editor/document';
import { copySubtree, parseClipboard, pasteSubtree, serializeClipboard, type ClipboardPayload } from '@/lib/editor/clipboard';
import { matchShortcut, SHORTCUTS, shortcutLabel } from '@/lib/editor/shortcuts';
import { ZOOM_STEPS, type EditorStore } from '@/lib/editor/store';
import { buildEditorPrompt } from '@/lib/editor/prompt';
import {
  Check,
  Copy as CopyIcon,
  Eye,
  FileText,
  Keyboard,
  Laptop,
  Layers,
  Monitor,
  PanelLeftClose,
  PanelRightClose,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Undo2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const BREAKPOINT_META: Record<Breakpoint, { icon: React.ReactNode; label: string }> = {
  desktop: { icon: <Monitor className="h-3.5 w-3.5" />, label: 'Desktop' },
  laptop: { icon: <Laptop className="h-3.5 w-3.5" />, label: 'Laptop' },
  tablet: { icon: <Tablet className="h-3.5 w-3.5" />, label: 'Tablet' },
  mobile: { icon: <Smartphone className="h-3.5 w-3.5" />, label: 'Mobile' },
};

/**
 * Editor completo: barra, paneles y lienzo.
 *
 * El layout es el de cualquier editor visual —componentes y capas a la
 * izquierda, lienzo en medio, propiedades a la derecha, estado abajo— y los
 * paneles se colapsan porque en un portátil de 13" el lienzo se queda sin sitio.
 */
export function EditorShell({ store, name = 'Proyecto sin título', showCanvasCoordinates = false, onSave }: { store?: EditorStore; name?: string; showCanvasCoordinates?: boolean; onSave?: () => void }) {
  return (
    <EditorStoreProvider store={store}>
      <EditorWorkspace name={name} showCanvasCoordinates={showCanvasCoordinates} onSave={onSave} />
    </EditorStoreProvider>
  );
}

function EditorWorkspace({ name, showCanvasCoordinates, onSave }: { name: string; showCanvasCoordinates: boolean; onSave?: () => void }) {
  const store = useEditorStore();
  const ui = useEditor(state => state.ui);
  const preview = useEditor(state => state.editor.preview);
  const clipboard = useRef<ClipboardPayload | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ------------------------------------------------------------- atajos --- */
  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      const action = matchShortcut({
        key: event.key,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        target: event.target as { tagName?: string; isContentEditable?: boolean } | null,
      });
      if (!action) return;

      const state = store.getState();
      const id = state.selection[0];

      // Solo se intercepta el evento si la acción hace algo: así ⌘C sigue
      // copiando texto cuando no hay nada seleccionado en el lienzo.
      const needsSelection = ['delete', 'duplicate', 'copy', 'cut', 'enter', 'selectParent', 'moveUp', 'moveDown', 'nudgeUp', 'nudgeDown', 'nudgeUpFast', 'nudgeDownFast'];
      if (needsSelection.includes(action) && !id) return;

      event.preventDefault();

      switch (action) {
        case 'delete':
          state.selection.forEach(nodeId => store.run({ kind: 'remove', id: nodeId }));
          break;
        case 'duplicate':
          store.run({ kind: 'duplicate', id });
          break;
        case 'copy':
          clipboard.current = copySubtree(state.document, id);
          if (clipboard.current) void navigator.clipboard?.writeText(serializeClipboard(clipboard.current)).catch(() => {});
          break;
        case 'cut':
          clipboard.current = copySubtree(state.document, id);
          store.run({ kind: 'remove', id });
          break;
        case 'paste': {
          const payload = clipboard.current;
          if (!payload) return;
          const target = state.selection[0] ?? state.document.rootId;
          const node = state.document.nodes[target];
          const parentId = node?.children !== undefined && node.type !== 'text' ? target : node?.parentId ?? state.document.rootId;
          const index = state.document.nodes[parentId]?.children.length ?? 0;
          const result = pasteSubtree(state.document, payload, parentId, index, store.nextId);
          if ('error' in result) {
            store.setRuntime({ lastError: result.error });
            return;
          }
          store.replaceDocument(result.document);
          store.select([result.rootId]);
          break;
        }
        case 'undo':
          store.undo();
          break;
        case 'redo':
          store.redo();
          break;
        case 'deselect':
          store.select([]);
          break;
        case 'enter': {
          const first = state.document.nodes[id]?.children[0];
          if (first) store.select([first]);
          break;
        }
        case 'selectParent': {
          const parent = state.document.nodes[id]?.parentId;
          if (parent) store.select([parent]);
          break;
        }
        case 'nudgeUp':
        case 'moveUp':
          nudge(store, id, -1);
          break;
        case 'nudgeDown':
        case 'moveDown':
          nudge(store, id, 1);
          break;
        case 'nudgeUpFast':
          nudge(store, id, -5);
          break;
        case 'nudgeDownFast':
          nudge(store, id, 5);
          break;
        case 'preview':
          store.setEditor({ preview: !state.editor.preview });
          break;
        case 'zoomIn':
          store.setEditor({ zoom: ZOOM_STEPS[Math.min(ZOOM_STEPS.indexOf(state.editor.zoom as 1) + 1, ZOOM_STEPS.length - 1)] ?? 1 });
          break;
        case 'zoomOut':
          store.setEditor({ zoom: ZOOM_STEPS[Math.max(ZOOM_STEPS.indexOf(state.editor.zoom as 1) - 1, 0)] ?? 1 });
          break;
        case 'zoomReset':
          store.setEditor({ zoom: 1 });
          break;
        case 'palette':
          setShowShortcuts(value => !value);
          break;
      }
    },
    [store]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  /** Pegado desde el portapapeles del sistema (otra pestaña, otro proyecto). */
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text/plain');
      if (!text) return;
      const payload = parseClipboard(text);
      if (payload) clipboard.current = payload;
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  return (
    <div className="flex h-[min(88vh,900px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e13] text-white">
      <Toolbar onToggleShortcuts={() => setShowShortcuts(value => !value)} onShowPrompt={() => setShowPrompt(true)} isMac={isMac} onSave={onSave} />

      <div className="flex min-h-0 flex-1">
        {ui.leftPanel && !preview ? (
          <aside className="flex w-[268px] shrink-0 flex-col border-r border-white/10" aria-label="Componentes y capas">
            <div className="min-h-0 flex-1 overflow-hidden border-b border-white/10">
              <ComponentsPanel />
            </div>
            {ui.layers ? (
              <div className="h-[38%] min-h-[160px] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-violet-400">
                  <span className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> Capas</span>
                </div>
                <div className="h-[calc(100%-32px)]">
                  <LayersPanel />
                </div>
              </div>
            ) : null}
          </aside>
        ) : null}

        <main className="min-w-0 flex-1">
          {preview ? <EditorPagePreview name={name} /> : <EditorCanvas showCoordinates={showCanvasCoordinates} />}
        </main>

        {ui.rightPanel && !preview ? (
          <aside className="w-[300px] shrink-0 border-l border-white/10" aria-label="Propiedades">
            <InspectorPanel />
          </aside>
        ) : null}
      </div>

      <StatusBar />
      {showShortcuts ? <ShortcutsDialog isMac={isMac} onClose={() => setShowShortcuts(false)} /> : null}
      {showPrompt ? <PromptDialog name={name} onClose={() => setShowPrompt(false)} /> : null}
    </div>
  );
}

function Toolbar({ onToggleShortcuts, onShowPrompt, isMac, onSave }: { onToggleShortcuts: () => void; onShowPrompt: () => void; isMac: boolean; onSave?: () => void }) {
  const store = useEditorStore();
  const breakpoint = useEditor(state => state.editor.breakpoint);
  const zoom = useEditor(state => state.editor.zoom);
  const preview = useEditor(state => state.editor.preview);
  const dark = useEditor(state => state.editor.darkCanvas);
  const ui = useEditor(state => state.ui);
  const canUndo = useEditor(state => state.history.past.length > 0);
  const canRedo = useEditor(state => state.history.future.length > 0);

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
      <div className="flex items-center gap-1">
        <ToolbarButton label={`Deshacer (${shortcutLabel('undo', isMac)})`} onClick={() => store.undo()} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label={`Rehacer (${shortcutLabel('redo', isMac)})`} onClick={() => store.redo()} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <span className="mx-1 h-5 w-px bg-white/10" />

      <div className="flex items-center gap-0.5 rounded-full border border-white/10 p-0.5" role="tablist" aria-label="Viewport">
        {BREAKPOINTS.map(value => (
          <button
            key={value}
            role="tab"
            aria-selected={breakpoint === value}
            onClick={() => store.setEditor({ breakpoint: value })}
            title={`${BREAKPOINT_META[value].label} · ${VIEWPORT_WIDTH[value]}px`}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
              breakpoint === value ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {BREAKPOINT_META[value].icon}
            <span className="hidden sm:inline">{BREAKPOINT_META[value].label}</span>
          </button>
        ))}
      </div>

      <select
        value={zoom}
        onChange={event => store.setEditor({ zoom: Number(event.target.value) })}
        aria-label="Zoom"
        className="h-7 rounded-md border border-white/15 bg-black/30 px-1.5 text-[11px]"
      >
        {ZOOM_STEPS.map(step => (
          <option key={step} value={step}>{Math.round(step * 100)}%</option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-1">
        {onSave ? (
          <Button size="sm" variant="outline" onClick={onSave} className="h-7 rounded-full border-blue-400/30 bg-blue-500/10 px-3 text-[11px] text-blue-100 hover:bg-blue-500/20 hover:text-white">
            <Save className="mr-1.5 h-3.5 w-3.5" /> Guardar en DB
          </Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={onShowPrompt} className="h-7 rounded-full border-violet-400/30 bg-violet-500/10 px-3 text-[11px] text-violet-100 hover:bg-violet-500/20 hover:text-white">
          <FileText className="mr-1.5 h-3.5 w-3.5" /> Ver prompt completo
        </Button>
        <ToolbarButton label="Tema del lienzo" onClick={() => store.setEditor({ darkCanvas: !dark })}>
          <span className="text-[11px] font-bold">{dark ? 'Oscuro' : 'Claro'}</span>
        </ToolbarButton>
        <ToolbarButton label="Panel izquierdo" onClick={() => store.setUi({ leftPanel: !ui.leftPanel })} active={ui.leftPanel}>
          <PanelLeftClose className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Panel derecho" onClick={() => store.setUi({ rightPanel: !ui.rightPanel })} active={ui.rightPanel}>
          <PanelRightClose className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label={`Atajos (${shortcutLabel('palette', isMac)})`} onClick={onToggleShortcuts}>
          <Keyboard className="h-4 w-4" />
        </ToolbarButton>
        <Button
          size="sm"
          onClick={() => store.setEditor({ preview: !preview })}
          className={`h-7 rounded-full px-3 text-[11px] ${preview ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-violet-600 hover:bg-violet-500'}`}
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          {preview ? 'Salir de vista previa' : 'Vista previa'}
        </Button>
      </div>
    </header>
  );
}

function ToolbarButton({ label, onClick, children, disabled, active }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`rounded-md p-1.5 transition disabled:opacity-30 ${active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}
    >
      {children}
    </button>
  );
}

function StatusBar() {
  const nodes = useEditor(state => countNodes(state.document));
  const selection = useEditor(state => state.selection.length);
  const breakpoint = useEditor(state => state.editor.breakpoint);
  const zoom = useEditor(state => state.editor.zoom);
  const save = useEditor(state => state.runtime.save);
  const error = useEditor(state => state.runtime.lastError);

  const saveLabel: Record<typeof save, string> = {
    idle: 'Sin cambios',
    dirty: 'Cambios sin guardar',
    saving: 'Guardando…',
    saved: 'Guardado',
    error: 'Error al guardar',
  };

  return (
    <footer className="flex flex-wrap items-center gap-3 border-t border-white/10 px-3 py-1.5 text-[11px] text-zinc-400">
      <span>{nodes} elementos</span>
      {selection > 0 ? <span>{selection} seleccionado{selection > 1 ? 's' : ''}</span> : null}
      <span>{breakpoint} · {VIEWPORT_WIDTH[breakpoint]}px</span>
      <span>{Math.round(zoom * 100)}%</span>
      <span className={`ml-auto font-semibold ${save === 'error' ? 'text-rose-300' : save === 'saved' ? 'text-emerald-300' : save === 'dirty' ? 'text-amber-300' : ''}`}>
        {saveLabel[save]}
      </span>
      {error ? <span className="text-rose-300">{traduceError(error)}</span> : null}
    </footer>
  );
}

/** Los errores del modelo son códigos; aquí se convierten en algo legible. */
function traduceError(code: string): string {
  const map: Record<string, string> = {
    'leaf-parent': 'Ese componente no admite hijos',
    'child-not-allowed': 'El contenedor no admite ese componente',
    'parent-not-allowed': 'Ese componente necesita otro contenedor',
    'max-children': 'El contenedor ya está lleno',
    cycle: 'No puedes mover un elemento dentro de sí mismo',
    'unknown-type': 'Componente desconocido',
    locked: 'El elemento está bloqueado',
    root: 'La página no se puede eliminar',
  };
  return map[code] ?? code;
}

function PromptDialog({ name, onClose }: { name: string; onClose: () => void }) {
  const document = useEditor(state => state.document);
  const selection = useEditor(state => state.selection);
  const [scope, setScope] = useState<'page' | 'selection'>('page');
  const [copied, setCopied] = useState(false);
  const selectedIds = scope === 'selection' ? selection : [];
  const prompt = buildEditorPrompt(document, name, selectedIds);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/75 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="editor-prompt-title" onClick={onClose}>
      <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#12131a] shadow-2xl" onClick={event => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
          <div>
            <h2 id="editor-prompt-title" className="flex items-center gap-2 text-sm font-black"><FileText className="size-4 text-violet-300" /> Prompt completo</h2>
            <p className="mt-1 text-xs text-zinc-400">Se genera con la estructura, contenido, estilos responsive, tamaños y posiciones actuales.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Cerrar"><X className="size-4" /></button>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex rounded-lg border border-white/10 bg-black/20 p-1" role="tablist" aria-label="Alcance del prompt">
            <button type="button" role="tab" aria-selected={scope === 'page'} onClick={() => setScope('page')} className={`rounded-md px-3 py-1.5 text-[11px] font-bold ${scope === 'page' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Página completa</button>
            <button type="button" role="tab" aria-selected={scope === 'selection'} disabled={selection.length === 0} onClick={() => setScope('selection')} className={`rounded-md px-3 py-1.5 text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-35 ${scope === 'selection' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Componente seleccionado{selection.length > 1 ? ` (${selection.length})` : ''}</button>
          </div>
          <Button type="button" size="sm" onClick={() => void copyPrompt()} className="h-8 bg-violet-600 text-xs text-white hover:bg-violet-500">
            {copied ? <Check className="mr-1.5 size-3.5" /> : <CopyIcon className="mr-1.5 size-3.5" />}{copied ? 'Copiado' : 'Copiar prompt'}
          </Button>
        </div>

        <div className="min-h-0 flex-1 p-4">
          <textarea readOnly value={prompt} aria-label="Prompt generado" className="h-[min(58vh,560px)] w-full resize-none rounded-xl border border-white/10 bg-black/35 p-4 font-mono text-[11px] leading-relaxed text-zinc-200 outline-none focus:border-violet-500/60" />
        </div>
      </div>
    </div>
  );
}

function ShortcutsDialog({ isMac, onClose }: { isMac: boolean; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/70 p-6" role="dialog" aria-modal="true" aria-label="Atajos de teclado" onClick={onClose}>
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#12131a] p-5" onClick={event => event.stopPropagation()}>
        <h2 className="text-sm font-black">Atajos de teclado</h2>
        <p className="mt-1 text-xs text-zinc-400">
          Todas las operaciones de estructura están también en el panel de capas, con botones: el
          editor no depende del arrastre.
        </p>
        <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
          {SHORTCUTS.map(shortcut => (
            <li key={shortcut.action} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs">
              <span>{shortcut.label}</span>
              <kbd className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px]">{shortcutLabel(shortcut.action, isMac)}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default EditorShell;

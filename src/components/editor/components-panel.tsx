'use client';

import { useEditor, useEditorStore } from '@/components/editor/editor-store-context';
import { writeEditorDrag } from '@/lib/editor/drag';
import { definitionsByCategory, searchDefinitions, type ComponentDefinition, type EditorCategory } from '@/lib/editor/registry';
import { Input } from '@/components/ui/input';
import * as Icons from 'lucide-react';
import { ChevronDown, Clock, Search, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

const CATEGORY_LABELS: Record<EditorCategory, string> = {
  basic: 'Básicos',
  layout: 'Estructura',
  form: 'Formulario',
  navigation: 'Navegación',
  content: 'Contenido',
  media: 'Medios',
  advanced: 'Avanzado',
};

const FAVORITES_KEY = 'prompt-studio-editor-favorites-v1';

function readFavorites(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Icono por nombre: el registro guarda el nombre, no el componente. */
function DefinitionIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Box;
  return <Icon className="h-4 w-4" />;
}

/**
 * Biblioteca de componentes.
 *
 * Tres formas de llegar al mismo sitio, porque cada una gana en un momento
 * distinto: búsqueda difusa cuando sabes el nombre, categorías cuando exploras,
 * y favoritos/recientes cuando repites. Todas las fichas son arrastrables **y**
 * pulsables: sin el clic, el panel sería inutilizable con teclado.
 */
export function ComponentsPanel() {
  const store = useEditorStore();
  const selection = useEditor(state => state.selection);
  const recent = useEditor(state => state.runtime.recentTypes);
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => (typeof window === 'undefined' ? [] : readFavorites()));
  const [collapsed, setCollapsed] = useState<Set<EditorCategory>>(new Set());

  const results = useMemo(() => (query ? searchDefinitions(query) : null), [query]);

  function toggleFavorite(type: string) {
    setFavorites(current => {
      const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        /* modo privado: los favoritos se quedan en memoria */
      }
      return next;
    });
  }

  /**
   * Destino al pulsar (no arrastrar): dentro del seleccionado si acepta hijos,
   * y si no, junto a él. Insertar siempre en la raíz sería inútil.
   */
  function insert(type: string) {
    const state = store.getState();
    const selectedId = selection[0];
    const selected = selectedId ? state.document.nodes[selectedId] : undefined;
    if (selected) {
      const asChild = store.insertType(type, selected.id, selected.children.length);
      if (asChild.ok) return;
      if (selected.parentId) {
        const siblings = state.document.nodes[selected.parentId].children;
        const result = store.insertType(type, selected.parentId, siblings.indexOf(selected.id) + 1);
        if (result.ok) return;
      }
    }
    store.insertTypeOnCanvas(type);
  }

  const renderCard = (definition: ComponentDefinition) => (
    <button
      key={definition.type}
      type="button"
      draggable
      onDragStart={event => writeEditorDrag(event, { source: 'palette', type: definition.type })}
      onClick={() => insert(definition.type)}
      title={`${definition.label} — arrastra al lienzo o pulsa para insertar`}
      className="group relative flex cursor-grab flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 text-[11px] font-semibold transition hover:border-violet-500/50 hover:bg-violet-500/10 active:cursor-grabbing"
    >
      <DefinitionIcon name={definition.icon} />
      <span className="truncate">{definition.label}</span>
      <span
        role="button"
        tabIndex={-1}
        aria-label={favorites.includes(definition.type) ? 'Quitar de favoritos' : 'Marcar como favorito'}
        onClick={event => {
          event.stopPropagation();
          toggleFavorite(definition.type);
        }}
        className="absolute right-1 top-1 rounded p-0.5 opacity-0 transition group-hover:opacity-100"
      >
        <Star className={`h-3 w-3 ${favorites.includes(definition.type) ? 'fill-amber-400 text-amber-400 opacity-100' : ''}`} />
      </span>
    </button>
  );

  const favoriteDefinitions = definitionsByCategory()
    .flatMap(group => group.items)
    .filter(d => favorites.includes(d.type));
  const recentDefinitions = definitionsByCategory()
    .flatMap(group => group.items)
    .filter(d => recent.includes(d.type))
    .sort((a, b) => recent.indexOf(a.type) - recent.indexOf(b.type));

  return (
    <div className="flex h-full flex-col">
      <div className="relative p-3">
        <Search className="absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Buscar componente…"
          aria-label="Buscar componente"
          className="h-9 pl-8 text-xs"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {results ? (
          <div className="grid grid-cols-3 gap-2">
            {results.length === 0 ? (
              <p className="col-span-3 py-6 text-center text-xs text-muted-foreground">Nada coincide con «{query}».</p>
            ) : (
              results.map(renderCard)
            )}
          </div>
        ) : (
          <>
            {favoriteDefinitions.length > 0 ? (
              <Section title="Favoritos" icon={<Star className="h-3 w-3" />}>
                <div className="grid grid-cols-3 gap-2">{favoriteDefinitions.map(renderCard)}</div>
              </Section>
            ) : null}
            {recentDefinitions.length > 0 ? (
              <Section title="Recientes" icon={<Clock className="h-3 w-3" />}>
                <div className="grid grid-cols-3 gap-2">{recentDefinitions.slice(0, 6).map(renderCard)}</div>
              </Section>
            ) : null}
            {definitionsByCategory().map(group => {
              const isCollapsed = collapsed.has(group.category);
              return (
                <section key={group.category} className="mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed(current => {
                        const next = new Set(current);
                        if (next.has(group.category)) next.delete(group.category);
                        else next.add(group.category);
                        return next;
                      })
                    }
                    aria-expanded={!isCollapsed}
                    className="mb-2 flex w-full items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-violet-400"
                  >
                    {CATEGORY_LABELS[group.category]}
                    <ChevronDown className={`h-3 w-3 transition ${isCollapsed ? '-rotate-90' : ''}`} />
                  </button>
                  {isCollapsed ? null : <div className="grid grid-cols-3 gap-2">{group.items.map(renderCard)}</div>}
                </section>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-3">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {title}
      </p>
      {children}
    </section>
  );
}

export default ComponentsPanel;

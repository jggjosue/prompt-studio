'use client';

import { cn } from '@/lib/utils';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import type { ChatMode } from '@/lib/chat-types';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Trash2,
  Video,
  Globe,
  MessageSquarePlus,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Session {
  id: string;
  title: string;
  mode: ChatMode;
}

function modeIcon(mode: ChatMode) {
  if (mode === 'image') return <ImageIcon className="h-3 w-3 shrink-0 text-violet-400" aria-hidden="true" />;
  if (mode === 'video') return <Video className="h-3 w-3 shrink-0 text-rose-400" aria-hidden="true" />;
  return <Globe className="h-3 w-3 shrink-0 text-cyan-400" aria-hidden="true" />;
}

function modeLabel(mode: ChatMode): string {
  if (mode === 'image') return 'Imagen';
  if (mode === 'video') return 'Video';
  return 'Web';
}

function groupSessionsByDate(sessions: Session[]): Array<{ label: string; items: Session[] }> {
  // Since we don't have createdAt in the session list shape, we group them all under "Recientes"
  // If backend ever exposes dates, we can group by Today / Yesterday / Earlier
  return sessions.length > 0 ? [{ label: 'Recientes', items: sessions }] : [];
}

export function ChatHistorySidebar({ chat }: { chat: ChatGeneratorReturn }) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return chat.sessions;
    return chat.sessions.filter(s => s.title.toLowerCase().includes(q));
  }, [chat.sessions, query]);

  const groups = useMemo(() => groupSessionsByDate(filtered), [filtered]);

  const handleNew = async () => {
    setCreating(true);
    await chat.createSession();
    setCreating(false);
  };

  return (
    <aside
      className={cn(
        'hidden flex-col border-r border-border/60 bg-background/50 backdrop-blur-sm transition-all duration-300 overflow-hidden shrink-0 lg:flex',
        collapsed ? 'w-12' : 'w-60'
      )}
      aria-label="Historial de creaciones"
    >
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-border/60 px-2 shrink-0">
        {!collapsed && (
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">
            Creaciones
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className={cn(
            'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expandir panel' : 'Colapsar panel'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* New creation button */}
          <div className="p-2 shrink-0">
            <button
              type="button"
              onClick={handleNew}
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              aria-label="Nueva creación"
            >
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Nueva creación
            </button>
          </div>

          {/* Search */}
          <div className="px-2 pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Buscar..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="h-7 pl-6 text-xs bg-muted/40 border-border/60 focus-visible:ring-1"
                aria-label="Buscar creaciones"
              />
            </div>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto px-1 pb-2 space-y-3">
            {groups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquarePlus className="h-6 w-6 text-muted-foreground/40 mb-2" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">
                  {query ? 'Sin resultados' : 'Aún no hay creaciones'}
                </p>
              </div>
            )}
            {groups.map(group => (
              <section key={group.label} aria-label={group.label}>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(session => {
                    const isActive = chat.activeSessionId === session.id;
                    return (
                      <div key={session.id} className="group flex items-center gap-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => void chat.loadSession(session.id)}
                          className={cn(
                            'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors',
                            isActive
                              ? 'bg-blue-600/15 text-blue-400 font-medium'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {modeIcon(session.mode)}
                          <span className="truncate">{session.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void chat.deleteSession(session.id)}
                          className="shrink-0 rounded p-1 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          aria-label={`Eliminar: ${session.title}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {/* Collapsed: mini new button */}
      {collapsed && (
        <div className="flex flex-col items-center gap-2 p-2">
          <button
            type="button"
            onClick={handleNew}
            disabled={creating}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-border/60 text-muted-foreground transition-colors hover:border-blue-500/40 hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            aria-label="Nueva creación"
          >
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
          {chat.sessions.slice(0, 8).map(session => {
            const isActive = chat.activeSessionId === session.id;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => void chat.loadSession(session.id)}
                title={`${modeLabel(session.mode)}: ${session.title}`}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  isActive ? 'bg-blue-600/15 text-blue-400' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-label={`${modeLabel(session.mode)}: ${session.title}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {modeIcon(session.mode)}
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}

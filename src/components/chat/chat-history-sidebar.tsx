'use client';

import { Button } from '@/components/ui/button';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import { Plus, Trash2 } from 'lucide-react';

export function ChatHistorySidebar({ chat }: { chat: ChatGeneratorReturn }) {
  return (
    <aside className="w-64 border-r border-border flex flex-col bg-muted/30">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="font-bold text-sm">Conversaciones</h2>
        <Button variant="ghost" size="icon" onClick={() => void chat.createSession()}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {chat.sessions.map(s => (
          <div key={s.id} className="flex items-center gap-1">
          <button onClick={() => void chat.loadSession(s.id)} className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-muted flex items-center justify-between group">
            <span className="truncate">{s.title}</span>
            <span className="text-[10px] uppercase text-muted-foreground">{s.mode}</span>
          </button>
          <Button variant="ghost" size="icon" aria-label="Eliminar conversación" onClick={() => void chat.deleteSession(s.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
      </div>
    </aside>
  );
}

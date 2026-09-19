'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatGeneratorReturn } from '@/lib/chat-types';

export function ChatHistorySidebar({ chat }: { chat: ChatGeneratorReturn }) {
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; mode: string }>>([]);

  useEffect(() => {
    fetch('/api/ai/chats')
      .then(r => r.json())
      .then((data: { chats: Array<{ id: string; title: string; mode: string }> }) => setSessions(data.chats))
      .catch(() => {});
  }, []);

  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/ai/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Nueva conversación', mode: chat.selectedMode }) });
      const session = await res.json();
      if (session.chat) setSessions(prev => [{ id: session.chat.id, title: session.chat.title, mode: session.chat.mode }, ...prev]);
    } catch {}
  };

  return (
    <aside className="w-64 border-r border-border flex flex-col bg-muted/30">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="font-bold text-sm">Conversaciones</h2>
        <Button variant="ghost" size="icon" onClick={handleNewChat}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {sessions.map(s => (
          <button key={s.id} className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-muted flex items-center justify-between group">
            <span className="truncate">{s.title}</span>
            <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </aside>
  );
}

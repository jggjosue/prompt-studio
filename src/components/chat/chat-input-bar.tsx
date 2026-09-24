'use client';

import { useState, useEffect } from 'react';
import { Send, Image, Video, Globe } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import { ChatMode } from '@/lib/chat-types';

export function ChatInputBar({ chat }: { chat: ChatGeneratorReturn }) {
  const [prompt, setPrompt] = useState('');
  const searchParams = useSearchParams();
  const { selectedMode, setSelectedMode, generate, localGenerating, messages } = chat;

  // Pre-fill from URL params
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && messages.length === 0) {
      setPrompt(decodeURIComponent(promptParam));
    }
  }, [searchParams, messages.length]);

  const handleSend = async () => {
    if (!prompt.trim() || localGenerating) return;
    const trimmed = prompt.trim();
    setPrompt('');

    // Crear chat session primero si no hay
    try {
      const createRes = await fetch('/api/ai/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed.slice(0, 80), mode: selectedMode }),
      });
      const createData = await createRes.json();
      if (createData.chat) {
        // Enviar mensaje
        await fetch(`/api/ai/chats/${createData.chat.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: trimmed, mode: selectedMode, role: 'user' }),
        });
      }
    } catch (err) {
      console.error('Error creating chat:', err);
    }

    // Ejecutar generación
    await generate(trimmed, { model: selectedMode }, selectedMode);
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="flex items-end gap-2">
        <Tabs value={selectedMode} onValueChange={(v) => setSelectedMode(v as ChatMode)} className="w-fit">
          <TabsList>
            <TabsTrigger value="image"><Image className="h-3 w-3 mr-1" />Imagen</TabsTrigger>
            <TabsTrigger value="video"><Video className="h-3 w-3 mr-1" />Video</TabsTrigger>
            <TabsTrigger value="project"><Globe className="h-3 w-3 mr-1" />Web</TabsTrigger>
          </TabsList>
        </Tabs>
        <Textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Escribe tu prompt..."
          className="flex-1 min-h-[40px] max-h-32 resize-none"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <Button onClick={handleSend} disabled={localGenerating || !prompt.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

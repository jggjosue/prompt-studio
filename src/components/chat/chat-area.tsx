'use client';

import { useRef, useEffect } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { ChatMessageItem } from './chat-message-item';
import { GenerationProgress } from '@/components/generation/generation-feedback';
import type { ChatGeneratorReturn } from '@/lib/chat-types';

export function ChatArea({ chat }: { chat: ChatGeneratorReturn }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, genProgress, genStatus, generationError, localGenerating } = chat;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Sparkles className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm">Envía un prompt para comenzar</p>
          <p className="text-xs mt-1">Selecciona el modo (Imagen, Video, Web) antes de escribir</p>
        </div>
      )}
      {messages.map(msg => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}
      {localGenerating && (
        <GenerationProgress active={true} progress={genProgress} status={genStatus} pending={false} />
      )}
      {generationError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold">{generationError.title}</p>
              <p className="text-muted-foreground">{generationError.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

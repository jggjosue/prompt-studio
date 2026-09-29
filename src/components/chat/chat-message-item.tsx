'use client';

import { cn } from '@/lib/utils';
import type { ChatGeneratorMessage } from '@/lib/chat-types';
import { Bot, Loader2, User } from 'lucide-react';
import { ImageResult, VideoResult, WebResult } from './message-renderers';

const MODE_LABELS: Record<string, string> = {
  image: 'Imagen',
  video: 'Video',
  project: 'Web',
  vision: 'Visión',
  text: 'Texto',
  videoUnderstanding: 'Video IA',
};

export function ChatMessageItem({ message }: { message: ChatGeneratorMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {/* Avatar */}
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      )}

      <div className={cn(
        'min-w-0 max-w-[85%] rounded-xl px-3.5 py-2.5',
        isUser
          ? 'bg-blue-600 text-white'
          : 'border border-border/60 bg-card/60'
      )}>
        {/* Header row */}
        <div className="mb-1.5 flex items-center gap-2">
          <span className={cn(
            'text-[10px] font-semibold uppercase tracking-wider',
            isUser ? 'text-blue-200' : 'text-muted-foreground'
          )}>
            {isUser ? 'Tú' : `Prompt Studio · ${MODE_LABELS[message.mode] ?? message.mode}`}
          </span>
          {message.status === 'pending' && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" aria-label="Generando..." />
          )}
        </div>

        {/* Prompt text */}
        <p className={cn(
          'text-sm whitespace-pre-wrap leading-relaxed',
          isUser ? 'text-white' : 'text-foreground'
        )}>
          {message.prompt}
        </p>

        {/* Result */}
        {message.result && (
          <div className="mt-3">
            {(message.result.imageUrl || message.result.imageUrls) ? (
              <ImageResult result={message.result} />
            ) : null}
            {message.result.videoUrl ? (
              <VideoResult result={message.result} />
            ) : null}
            {message.result.html ? (
              <WebResult result={message.result} />
            ) : null}
            {message.result.text ? (
              <div className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/30 p-3 text-sm text-foreground">
                {message.result.text}
              </div>
            ) : null}
            {message.result.error && (
              <p className="text-xs text-destructive mt-1">{message.result.error}</p>
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

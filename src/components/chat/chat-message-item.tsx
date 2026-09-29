'use client';

import { cn } from '@/lib/utils';
import type { ChatGeneratorMessage } from '@/lib/chat-types';
import { friendlyError } from '@/lib/chat-error';
import { selectedChatConfiguration } from '@/lib/chat-configuration';
import { Bot, Loader2, RotateCcw, Sparkles, User } from 'lucide-react';
import { ImageResult, VideoResult, WebResult } from './message-renderers';

const MODE_LABELS: Record<string, string> = {
  image: 'Imagen',
  video: 'Video',
  project: 'Web',
  vision: 'Visión',
  text: 'Texto',
  videoUnderstanding: 'Video IA',
};

export function ChatMessageItem({ message, onRetry }: { message: ChatGeneratorMessage; onRetry?: () => void }) {
  const isUser = message.role === 'user';
  const isPending = !isUser && message.status === 'pending';
  const configuration = selectedChatConfiguration(message.mode, message.params);

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

        {isUser && (
          <div className="space-y-2">
            <p className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words pr-1 text-sm leading-relaxed text-white">
              {message.prompt}
            </p>
            <dl className="flex max-w-xl flex-wrap gap-1.5" aria-label="Configuración usada">
              {configuration.map(item => (
                <div key={item.label} className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[10px] leading-none text-blue-50">
                  <dt className="sr-only">{item.label}</dt>
                  <dd><span className="text-blue-200">{item.label}:</span> {item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {isPending && (
          <div className="min-w-[220px] space-y-3 py-1 sm:min-w-[300px]" role="status" aria-live="polite">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <Sparkles className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Creando tu {MODE_LABELS[message.mode]?.toLowerCase() ?? 'contenido'}…</p>
                <p className="text-[11px] text-muted-foreground">Trabajando en segundo plano</p>
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/5 animate-pulse rounded-full bg-gradient-to-r from-blue-600 via-violet-500 to-blue-400" />
            </div>
          </div>
        )}

        {/* Result */}
        {message.result && (
          <div className="mt-3 max-h-80 overflow-y-auto pr-1">
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
              <div className="space-y-2">
                <p className="mt-1 text-xs text-destructive">{friendlyError(message.result.error)}</p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1 text-[11px] font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <RotateCcw className="h-3 w-3" /> Reintentar
                  </button>
                )}
              </div>
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

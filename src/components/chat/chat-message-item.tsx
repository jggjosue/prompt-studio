'use client';

import { User, Bot, Loader2 } from 'lucide-react';
import { ImageResult, VideoResult, WebResult } from './message-renderers';
import type { ChatGeneratorMessage } from '@/lib/chat-types';

export function ChatMessageItem({ message }: { message: ChatGeneratorMessage }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-xl p-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted border'}`}>
        <div className="flex items-center gap-2 mb-1">
          {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
          <span className="text-xs font-semibold capitalize">{message.mode}</span>
          {message.status === 'pending' && <Loader2 className="h-3 w-3 animate-spin" />}
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.prompt}</p>
        {isAssistant && message.result && (
          <div className="mt-2">
            {message.result.imageUrl || message.result.imageUrls ? <ImageResult result={message.result} /> : null}
            {message.result.videoUrl ? <VideoResult result={message.result} /> : null}
            {message.result.html ? <WebResult result={message.result} /> : null}
            {message.result.error ? <div className="text-xs text-destructive">{message.result.error}</div> : null}
          </div>
        )}
      </div>
    </div>
  );
}

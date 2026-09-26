'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Image, Video, Globe, ListPlus, Play, RotateCcw, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import type { ChatGeneratorReturn, ChatQueueItem, ChatQueueStatus } from '@/lib/chat-types';
import { ChatMode } from '@/lib/chat-types';

export function ChatInputBar({ chat }: { chat: ChatGeneratorReturn }) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const { selectedMode, setSelectedMode, params, generate, localGenerating, messages, queue, queueRunning, enqueue, startQueue, removeQueueItem, retryQueueItem, clearQueue } = chat;

  // Pre-fill from URL params
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && messages.length === 0) {
      setPrompt(decodeURIComponent(promptParam));
    }
  }, [searchParams, messages.length]);

  // Auto-grow del textarea hasta max-h
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 288)}px`;
  }, [prompt]);

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
    await generate(trimmed, params, selectedMode);
  };

  const handleAddToQueue = () => {
    if (!prompt.trim()) return;
    enqueue(prompt);
    setPrompt('');
  };

  const handleStartQueue = () => {
    startQueue();
    // Vaciar la caja de texto pendiente como nuevo ítem encolado
    if (prompt.trim()) {
      enqueue(prompt);
      setPrompt('');
    }
  };

  const queueStatusConfig: Record<ChatQueueStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    queued: { label: 'En cola', variant: 'secondary' },
    processing: { label: 'Generando…', variant: 'default' },
    completed: { label: 'Listo', variant: 'outline' },
    failed: { label: 'Error', variant: 'destructive' },
  };

  const renderQueueItem = (item: ChatQueueItem) => {
    const config = queueStatusConfig[item.status];
    const modeMeta = item.mode === 'image'
      ? { icon: <Image className="h-3 w-3 text-violet-400" />, label: 'Imagen' }
      : item.mode === 'video'
        ? { icon: <Video className="h-3 w-3 text-rose-400" />, label: 'Video' }
        : { icon: <Globe className="h-3 w-3 text-cyan-400" />, label: 'Web' };
    return (
      <li key={item.id} className="rounded-lg border border-border/60 bg-card/40 p-2 pl-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="flex items-center gap-1 rounded border border-border/50 px-1 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {modeMeta.icon}
              <span className="hidden sm:inline">{modeMeta.label}</span>
            </span>
            <p className="min-w-0 flex-1 truncate text-xs">{item.prompt}</p>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
          {item.status !== 'processing' && (
            <button
              type="button"
              onClick={() => removeQueueItem(item.id)}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Quitar de la cola: ${item.prompt}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {item.status === 'processing' && <Progress value={item.progress} className="mt-2 h-2" />}
        {item.status === 'failed' && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="truncate text-[11px] text-destructive">{item.error}</p>
            <button
              type="button"
              onClick={() => retryQueueItem(item.id)}
              className="inline-flex shrink-0 items-center gap-1 rounded border border-border/60 px-2 py-0.5 text-[11px] font-semibold transition-colors hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" /> Reintentar
            </button>
          </div>
        )}
        {item.status === 'completed' && item.result?.imageUrl && (
          <img src={item.result.imageUrl} alt={item.prompt} className="mt-2 h-16 rounded-md object-cover" />
        )}
      </li>
    );
  };

  return (
    <div className="border-t border-border bg-background p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
        <Tabs value={selectedMode} onValueChange={(v) => setSelectedMode(v as ChatMode)} className="w-fit">
          <TabsList>
            <TabsTrigger value="image"><Image className="h-3 w-3 mr-1" />Imagen</TabsTrigger>
            <TabsTrigger value="video"><Video className="h-3 w-3 mr-1" />Video</TabsTrigger>
            <TabsTrigger value="project"><Globe className="h-3 w-3 mr-1" />Web</TabsTrigger>
          </TabsList>
        </Tabs>
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Escribe tu prompt..."
          className="w-full min-h-[110px] resize-none text-sm leading-relaxed sm:min-h-[120px] max-h-72"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" onClick={handleAddToQueue} disabled={!prompt.trim()} className="h-10 px-3 text-xs sm:text-sm" title="Agregar a la cola de generación">
            <ListPlus className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Agregar a cola</span>
          </Button>
          <Button onClick={handleSend} disabled={localGenerating || !prompt.trim()} size="icon" className="h-10 w-10">
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="mx-auto mt-3 w-full max-w-3xl space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Cola de generación ({queue.filter(i => i.status !== 'completed').length} pendientes · {queue.length} total)
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={handleStartQueue}
                disabled={queueRunning || !queue.some(i => i.status === 'queued')}
              >
                <Play className="mr-1 h-3 w-3" />
                {queueRunning ? 'Generando…' : 'Generar'}
              </Button>
              <Button
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={clearQueue}
                disabled={queueRunning}
                title="Quitar los ítems finalizados"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <ul className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {queue.map(renderQueueItem)}
          </ul>
        </div>
      )}
    </div>
  );
}

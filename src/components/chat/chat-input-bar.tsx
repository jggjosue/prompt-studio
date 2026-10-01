'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Video,
  Globe,
  ListPlus,
  Play,
  RotateCcw,
  Trash2,
  SendHorizonal,
  Zap,
  ChevronDown,
  Loader2,
  ScanSearch,
} from 'lucide-react';
import { OptimizedImage } from '@/components/optimized-image';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import type { ChatGeneratorReturn, ChatQueueItem, ChatQueueStatus } from '@/lib/chat-types';
import { ChatMode } from '@/lib/chat-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useClerk } from '@clerk/nextjs';
import { trackInterest } from '@/lib/interest-analytics';

// ── Actual models from ai-credit-config (no invented IDs) ──
const MODEL_OPTIONS = {
  image: [
    { provider: 'google', model: 'imagen-4.0-fast-generate-001', label: 'Imagen 4.0 Fast', credits: 10, description: 'Rápido · Google' },
    { provider: 'openai', model: 'dall-e-3', label: 'DALL-E 3', credits: 10, description: 'Calidad alta · OpenAI' },
    { provider: 'openai', model: 'gpt-image-1-mini', label: 'GPT Image Mini', credits: 15, description: 'Avanzado · OpenAI' },
    { provider: 'fal', model: 'fal-ai/flux/schnell', label: 'Flux Schnell', credits: 10, description: 'Rápido · Fal.ai' },
  ],
  video: [
    { provider: 'google', model: 'gemini-omni-flash', label: 'Gemini Omni Flash', credits: 15, description: 'Edición conversacional · Google' },
    { provider: 'google', model: 'veo-3.1-generate-001', label: 'Veo 3.1', credits: 25, description: 'Audio nativo · Google' },
    { provider: 'google', model: 'veo-2.0-generate-001', label: 'Veo 2.0', credits: 20, description: 'Calidad · Google' },
    { provider: 'runway', model: 'gen-3', label: 'Gen-3 Alpha', credits: 20, description: 'Cinemático · Runway' },
  ],
  project: [
    { provider: 'google', model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', credits: 1, description: 'Rápido · Google' },
    { provider: 'google', model: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', credits: 3, description: 'Avanzado · Google' },
    { provider: 'google', model: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', credits: 1, description: 'Rápido · Google' },
    { provider: 'openai', model: 'gpt-4o', label: 'GPT-4o', credits: 4, description: 'Avanzado · OpenAI' },
    { provider: 'anthropic', model: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet', credits: 8, description: 'Premium · Anthropic' },
  ],
  vision: [
    { provider: 'google', model: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Vision)', credits: 1, description: 'Visión rápida · Google' },
  ],
  text: [
    { provider: 'google', model: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', credits: 1, description: 'Generación rápida de texto · Google' },
  ],
  videoUnderstanding: [
    { provider: 'google', model: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', credits: 2, description: 'Análisis de video · Google' },
  ],
} as const satisfies Record<ChatMode, Array<{ provider: string; model: string; label: string; credits: number; description: string }>>;

const MODE_CONFIG: Record<ChatMode, { label: string; icon: React.ReactNode; color: string; placeholder: string }> = {
  image: {
    label: 'Imagen',
    icon: <ImageIcon className="h-3.5 w-3.5" />,
    color: 'text-violet-400 border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20',
    placeholder: 'Describe la imagen que quieres crear...',
  },
  video: {
    label: 'Video',
    icon: <Video className="h-3.5 w-3.5" />,
    color: 'text-rose-400 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20',
    placeholder: 'Describe el video que quieres crear...',
  },
  project: {
    label: 'Web',
    icon: <Globe className="h-3.5 w-3.5" />,
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20',
    placeholder: 'Describe la página o componente web que quieres crear...',
  },
  vision: {
    label: 'Visión',
    icon: <ImageIcon className="h-3.5 w-3.5" />,
    color: 'text-green-400 border-green-500/40 bg-green-500/10 hover:bg-green-500/20',
    placeholder: 'Analiza una imagen o detecta objetos...',
  },
  text: {
    label: 'Texto',
    icon: <Globe className="h-3.5 w-3.5" />,
    color: 'text-orange-400 border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20',
    placeholder: 'Redacta un ensayo, traduce texto o explora ideas...',
  },
  videoUnderstanding: {
    label: 'Video IA',
    icon: <ScanSearch className="h-3.5 w-3.5" />,
    color: 'text-teal-400 border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20',
    placeholder: 'Pregunta sobre el video, resume, extrae momentos clave...',
  },
};

export function ChatInputBar({ chat }: { chat: ChatGeneratorReturn }) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const { selectedMode, setSelectedMode, params, generate, localGenerating, messages, queue, queueRunning, enqueue, startQueue, removeQueueItem, retryQueueItem, clearQueue } = chat;
  const activeResponses = messages.filter(message => message.role === 'assistant' && message.status === 'pending').length;

  // Pre-fill from URL params
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && messages.length === 0) {
      // URLSearchParams already decodes the value. Decoding it again corrupts
      // valid prompt content containing percent signs or encoded-looking text.
      setPrompt(promptParam);
    }
  }, [searchParams, messages.length]);

  // Auto-grow del textarea hasta max-h
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 288)}px`;
  }, [prompt]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    const trimmed = prompt.trim();
    trackInterest('generate_action', { action: 'send_prompt', mode: selectedMode, model: params.model });
    setPrompt('');
    void generate(trimmed, params, selectedMode);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleAddToQueue = () => {
    if (!prompt.trim()) return;
    trackInterest('generate_action', { action: 'add_to_queue', mode: selectedMode });
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
      ? { icon: <ImageIcon className="h-3 w-3 text-violet-400" />, label: 'Imagen' }
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
          <div className="relative mt-2 h-16 w-16 overflow-hidden rounded-md">
            <OptimizedImage src={item.result.imageUrl} alt={item.prompt} fill forceUnoptimized className="object-cover" />
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="border-t border-border bg-background p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
        <Tabs value={selectedMode} onValueChange={(v) => { trackInterest('generate_option_click', { option: 'mode', value: v }); setSelectedMode(v as ChatMode); }} className="w-fit">
          <TabsList>
            <TabsTrigger value="image"><ImageIcon className="h-3 w-3 mr-1" />Imagen</TabsTrigger>
            <TabsTrigger value="video" disabled><Video className="h-3 w-3 mr-1" />Video</TabsTrigger>
            <TabsTrigger value="project" disabled><Globe className="h-3 w-3 mr-1" />Web</TabsTrigger>
          </TabsList>
        </Tabs>
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={localGenerating ? 'Pide otra creación mientras terminamos…' : 'Escribe tu prompt...'}
          className="w-full min-h-[110px] resize-none text-sm leading-relaxed sm:min-h-[120px] max-h-72"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <div className="flex flex-wrap items-center gap-2">
          {activeResponses > 0 && (
            <span className="mr-auto inline-flex items-center gap-2 text-[11px] text-muted-foreground" role="status">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              {activeResponses === 1 ? '1 creación en segundo plano' : `${activeResponses} creaciones en segundo plano`}
            </span>
          )}
          <Button variant="outline" onClick={handleAddToQueue} disabled={!prompt.trim()} className="h-10 px-3 text-xs sm:text-sm" title="Agregar a la cola de generación">
            <ListPlus className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Agregar a cola</span>
          </Button>
          <Button onClick={handleSend} disabled={!prompt.trim()} size="icon" className="h-10 w-10">
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

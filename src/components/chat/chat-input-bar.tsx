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
  Zap,
  ScanSearch,
  Wand2,
  MessageSquareText,
  Sparkles,
  Search,
  FileText,
  Code2,
  LayoutTemplate,
  Clapperboard,
  Settings2,
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
import { trackInterest } from '@/lib/interest-analytics';

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

export function ChatInputBar({
  chat,
  variant = 'docked',
  onOpenSettings,
}: {
  chat: ChatGeneratorReturn;
  variant?: 'hero' | 'docked';
  onOpenSettings: () => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [selectedSlashCommand, setSelectedSlashCommand] = useState<{ id: string; label: string; description: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const { selectedMode, setSelectedMode, params, generate, localGenerating, messages, queue, queueRunning, enqueue, startQueue, removeQueueItem, retryQueueItem, clearQueue, draftPrompt, setDraftPrompt } = chat;
  const activeResponses = messages.filter(message => message.role === 'assistant' && message.status === 'pending').length;

  const slashQuery = prompt.startsWith('/') ? prompt.slice(1).trim().toLowerCase() : null;
  const commandMode = selectedMode === 'vision' ? 'image' : selectedMode === 'videoUnderstanding' ? 'video' : selectedMode;
  const commandCatalog: Partial<Record<ChatMode, Array<{ id: string; label: string; description: string; icon: React.ReactNode; mode: ChatMode; instruction: string }>>> = {
    text: [
      { id: 'write', label: 'Redactar', description: 'Escribe o mejora cualquier texto', icon: <MessageSquareText className="h-4 w-4" />, mode: 'text', instruction: 'Redacta con claridad y buena estructura: ' },
      { id: 'summarize', label: 'Resumir', description: 'Resume el contenido conservando lo esencial', icon: <FileText className="h-4 w-4" />, mode: 'text', instruction: 'Resume de forma clara y concisa: ' },
      { id: 'research', label: 'Investigar', description: 'Desarrolla una investigación estructurada', icon: <Search className="h-4 w-4" />, mode: 'text', instruction: 'Investiga y explica con estructura, contexto y conclusiones: ' },
      { id: 'improve', label: 'Mejorar texto', description: 'Corrige estilo, claridad y redacción', icon: <Sparkles className="h-4 w-4" />, mode: 'text', instruction: 'Mejora la redacción, claridad y estilo del siguiente texto: ' },
      { id: 'optimize-prompt', label: 'Optimizar prompt', description: 'Mejora objetivos, contexto, restricciones y formato', icon: <Wand2 className="h-4 w-4" />, mode: 'text', instruction: 'Optimiza el siguiente prompt. Conserva la intención y mejora objetivo, contexto, restricciones, criterios de calidad y formato de salida: ' },
      { id: 'audit-code', label: 'Auditar código', description: 'Detecta errores, riesgos y oportunidades de mejora', icon: <Code2 className="h-4 w-4" />, mode: 'text', instruction: 'Audita el siguiente código. Identifica errores, riesgos de seguridad, problemas de rendimiento y mantenibilidad, y propón correcciones concretas: ' },
    ],
    image: [
      { id: 'create-image', label: 'Crear imagen', description: 'Genera una imagen desde tu descripción', icon: <ImageIcon className="h-4 w-4" />, mode: 'image', instruction: 'Crea una imagen: ' },
      { id: 'edit-image', label: 'Editar imagen', description: 'Transforma una imagen siguiendo instrucciones', icon: <Wand2 className="h-4 w-4" />, mode: 'vision', instruction: 'Edita esta imagen siguiendo estas instrucciones: ' },
      { id: 'analyze-image', label: 'Analizar imagen', description: 'Describe y extrae información visual', icon: <ScanSearch className="h-4 w-4" />, mode: 'vision', instruction: 'Analiza esta imagen y responde a esta petición: ' },
      { id: 'image-to-video', label: 'Imagen a video', description: 'Prepara una imagen para convertirla en video', icon: <Video className="h-4 w-4" />, mode: 'video', instruction: 'Convierte esta imagen en video con estas instrucciones: ' },
    ],
    video: [
      { id: 'create-video', label: 'Crear video', description: 'Genera un video desde tu descripción', icon: <Clapperboard className="h-4 w-4" />, mode: 'video', instruction: 'Crea un video: ' },
      { id: 'image-to-video', label: 'Imagen a video', description: 'Anima una imagen siguiendo tu idea', icon: <ImageIcon className="h-4 w-4" />, mode: 'video', instruction: 'Convierte esta imagen en video: ' },
      { id: 'analyze-video', label: 'Analizar video', description: 'Resume o extrae información de un video', icon: <ScanSearch className="h-4 w-4" />, mode: 'videoUnderstanding', instruction: 'Analiza este video y responde a esta petición: ' },
      { id: 'video-prompt', label: 'Mejorar prompt de video', description: 'Optimiza escena, cámara, movimiento y estilo', icon: <Sparkles className="h-4 w-4" />, mode: 'video', instruction: 'Optimiza este prompt de video incluyendo escena, cámara, movimiento, iluminación y estilo: ' },
    ],
    project: [
      { id: 'create-web', label: 'Crear página web', description: 'Genera una página desde una descripción', icon: <Globe className="h-4 w-4" />, mode: 'project', instruction: 'Crea una página web: ' },
      { id: 'landing', label: 'Landing page', description: 'Crea una landing enfocada en conversión', icon: <LayoutTemplate className="h-4 w-4" />, mode: 'project', instruction: 'Crea una landing page moderna y responsive para: ' },
      { id: 'component', label: 'Componente UI', description: 'Genera un componente reutilizable', icon: <Code2 className="h-4 w-4" />, mode: 'project', instruction: 'Crea un componente UI accesible y responsive: ' },
      { id: 'improve-web', label: 'Mejorar interfaz', description: 'Mejora UX, accesibilidad y diseño', icon: <Wand2 className="h-4 w-4" />, mode: 'project', instruction: 'Mejora esta interfaz en UX, accesibilidad, responsive y diseño visual: ' },
    ],
  };
  const modeCommands = commandCatalog[commandMode] ?? commandCatalog.text ?? [];
  const slashCommands = modeCommands.filter(command => !slashQuery || command.label.toLowerCase().includes(slashQuery) || command.id.includes(slashQuery) || command.description.toLowerCase().includes(slashQuery));
  const slashOpen = slashQuery !== null;

  const selectSlashCommand = (command: (typeof modeCommands)[number]) => {
    setSelectedMode(command.mode);
    setPrompt(command.instruction);
    setSelectedSlashCommand({ id: command.id, label: command.label, description: command.description });
    trackInterest('generate_option_click', { option: 'slash_command', value: command.id, mode: command.mode });
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  // Pre-fill from URL params
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && messages.length === 0) {
      // URLSearchParams already decodes the value. Decoding it again corrupts
      // valid prompt content containing percent signs or encoded-looking text.
      setPrompt(promptParam);
      setSelectedSlashCommand(null);
    }
  }, [searchParams, messages.length]);

  useEffect(() => {
    if (!draftPrompt) return;
    setPrompt(draftPrompt);
    setDraftPrompt('');
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [draftPrompt, setDraftPrompt]);

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
    setSelectedSlashCommand(null);
    void generate(trimmed, params, selectedMode);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleAddToQueue = () => {
    if (!prompt.trim()) return;
    trackInterest('generate_action', { action: 'add_to_queue', mode: selectedMode });
    enqueue(prompt);
    setPrompt('');
    setSelectedSlashCommand(null);
  };

  const handleStartQueue = () => {
    startQueue();
    // Vaciar la caja de texto pendiente como nuevo ítem encolado
    if (prompt.trim()) {
      enqueue(prompt);
      setPrompt('');
      setSelectedSlashCommand(null);
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
    <div className={variant === 'hero' ? 'bg-transparent' : 'border-t border-border/60 bg-background/95 p-3 backdrop-blur-xl sm:p-4'}>
      <div className={variant === 'hero'
        ? 'mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-3xl border border-border/70 bg-card/80 p-2.5 shadow-[0_18px_55px_rgba(0,0,0,0.18)]'
        : 'mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-border/60 bg-card/60 p-2.5 shadow-lg'}>
        <div className="flex items-center justify-between gap-2">
        <Tabs value={selectedMode} onValueChange={(v) => { trackInterest('generate_option_click', { option: 'mode', value: v }); setSelectedSlashCommand(null); setSelectedMode(v as ChatMode); }} className="w-fit">
          <TabsList>
            <TabsTrigger value="text"><MessageSquareText className="h-3 w-3 mr-1" />Chat</TabsTrigger>
            <TabsTrigger value="image"><ImageIcon className="h-3 w-3 mr-1" />Imagen</TabsTrigger>
            <TabsTrigger value="video"><Video className="h-3 w-3 mr-1" />Video</TabsTrigger>
            <TabsTrigger value="project"><Globe className="h-3 w-3 mr-1" />Web</TabsTrigger>
          </TabsList>
        </Tabs>
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-border/60 px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Abrir configuración de creación"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Configurar</span>
          </button>
        </div>
        {selectedSlashCommand && !slashOpen && (
          <div className="flex min-h-6 items-center gap-1.5 px-1 text-xs text-muted-foreground" role="status" aria-label={`Capacidad del chat seleccionada: ${selectedSlashCommand.label}`}>
            <Zap className="h-3.5 w-3.5 text-blue-500" />
            <span>Capacidad del chat:</span>
            <span className="font-semibold text-blue-500 underline decoration-blue-500/50 underline-offset-4" title={selectedSlashCommand.description}>
              /{selectedSlashCommand.label}
            </span>
          </div>
        )}
        <div className="relative">
          {slashOpen && (
            <div className="absolute bottom-full left-0 z-50 mb-2 w-full max-w-md overflow-hidden rounded-xl border border-border/70 bg-popover p-1.5 shadow-2xl">
              <div className="flex items-center justify-between px-2.5 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Acciones · {MODE_CONFIG[commandMode].label}</p>
                <span className="text-[10px] text-muted-foreground">Esc para cerrar</span>
              </div>
              {slashCommands.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">No hay acciones que coincidan con “{slashQuery}”.</p>
              ) : slashCommands.map(command => (
                <button key={command.id} type="button" onMouseDown={event => event.preventDefault()} onClick={() => selectSlashCommand(command)} className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none">
                  <span className="mt-0.5 rounded-md bg-blue-500/10 p-1.5 text-blue-500">{command.icon}</span>
                  <span className="min-w-0"><span className="block text-sm font-semibold">{command.label}</span><span className="block text-xs text-muted-foreground">{command.description}</span></span>
                </button>
              ))}
            </div>
          )}
          <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => { setPrompt(e.target.value); if (!e.target.value) setSelectedSlashCommand(null); }}
          placeholder={localGenerating ? 'Pide otra creación mientras terminamos…' : `${MODE_CONFIG[selectedMode].placeholder}  ·  Escribe / para acciones`}
          className={variant === 'hero'
            ? 'min-h-[72px] max-h-72 w-full resize-none border-0 bg-transparent px-2 py-3 text-sm leading-relaxed shadow-none focus-visible:ring-0 sm:min-h-[82px]'
            : 'min-h-[64px] max-h-72 w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-relaxed shadow-none focus-visible:ring-0 sm:min-h-[72px]'}
          onKeyDown={e => {
            if (e.key === 'Escape' && slashOpen) { e.preventDefault(); setPrompt(''); setSelectedSlashCommand(null); return; }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (slashOpen) {
                if (slashCommands.length === 1) selectSlashCommand(slashCommands[0]);
                return;
              }
              handleSend();
            }
          }}
        />
        </div>
        <div className="flex flex-wrap items-center gap-2 px-1 pb-0.5">
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

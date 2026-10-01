'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import { Wand2, Camera, Film, Layout, Shuffle, MessageSquare, ScanSearch } from 'lucide-react';
import { ChatMessageItem } from './chat-message-item';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import type { ChatMode } from '@/lib/chat-types';

interface QuickStart {
  label: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  mode: ChatMode;
}

const QUICK_STARTS: QuickStart[] = [
  {
    label: 'Foto de producto',
    description: 'Imagen profesional para e-commerce',
    icon: <Camera className="h-5 w-5 text-violet-400" />,
    prompt: 'Foto de producto minimalista sobre fondo blanco, iluminación de estudio profesional, alta calidad',
    mode: 'image',
  },
  {
    label: 'Video cinemático',
    description: 'Escena con movimiento de cámara',
    icon: <Film className="h-5 w-5 text-rose-400" />,
    prompt: 'Video cinemático al atardecer con movimiento de cámara suave, estilo cinematográfico',
    mode: 'video',
  },
  {
    label: 'Landing page',
    description: 'Página web moderna con hero y CTA',
    icon: <Layout className="h-5 w-5 text-cyan-400" />,
    prompt: 'Landing page moderna para startup SaaS, diseño glassmorphism con hero section y call to action',
    mode: 'project',
  },
  {
    label: 'Generar texto',
    description: 'Ensayos, traducciones, ideas',
    icon: <MessageSquare className="h-5 w-5 text-orange-400" />,
    prompt: 'Explica cómo funciona la inteligencia artificial de manera sencilla para un público general',
    mode: 'text' as ChatMode,
  },
  {
    label: 'Sorpréndeme',
    description: 'Idea creativa aleatoria',
    icon: <Shuffle className="h-5 w-5 text-amber-400" />,
    prompt: 'Arte conceptual surrealista con colores vibrantes y composición única',
    mode: 'image',
  },
  {
    label: 'Analizar video',
    description: 'Resumir o responder preguntas',
    icon: <ScanSearch className="h-5 w-5 text-teal-400" />,
    prompt: 'Resume este video e identifica los momentos más importantes con timestamps.',
    mode: 'videoUnderstanding' as ChatMode,
  },
];

interface ChatAreaProps {
  chat: ChatGeneratorReturn;
  emptyComposer: ReactNode;
}

export function ChatArea({ chat, emptyComposer }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages } = chat;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  const handleQuickStart = (qs: QuickStart) => {
    chat.setSelectedMode(qs.mode);
    void chat.generate(qs.prompt, chat.params, qs.mode);
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto" role="log" aria-label="Conversación de creación" aria-live="polite">
      {messages.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 text-center sm:py-12">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 sm:h-14 sm:w-14">
            <Wand2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            ¿Qué quieres crear?
          </h1>
          <p className="mb-6 max-w-md text-sm leading-6 text-muted-foreground">
            Describe una idea y Prompt Studio te ayudará a convertirla en una imagen, video o experiencia web.
          </p>

          <div className="w-full max-w-3xl text-left">
            {emptyComposer}
          </div>

          {/* Quick-start cards */}
          <div className="mt-5 grid w-full max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-3">
            {QUICK_STARTS.map(qs => (
              <button
                key={qs.label}
                type="button"
                onClick={() => handleQuickStart(qs)}
                className="group flex min-h-24 flex-col items-start gap-2 rounded-2xl border border-border/60 bg-card/40 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Empezar con: ${qs.label}`}
              >
                <span className="transition-transform duration-200 group-hover:scale-110">{qs.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{qs.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{qs.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-4xl space-y-7 px-4 py-8 sm:px-6">
          {messages.map(msg => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onRetry={msg.role === 'assistant' && msg.status === 'failed'
                ? () => void chat.generate(msg.prompt, msg.params, msg.mode)
                : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

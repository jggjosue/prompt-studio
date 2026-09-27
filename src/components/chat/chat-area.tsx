'use client';

import { useRef, useEffect } from 'react';
import { Wand2, Camera, Film, Layout, Shuffle } from 'lucide-react';
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
    label: 'Sorpréndeme',
    description: 'Idea creativa aleatoria',
    icon: <Shuffle className="h-5 w-5 text-amber-400" />,
    prompt: 'Arte conceptual surrealista con colores vibrantes y composición única',
    mode: 'image',
  },
];

interface ChatAreaProps {
  chat: ChatGeneratorReturn;
}

export function ChatArea({ chat }: ChatAreaProps) {
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
    chat.setDraftPrompt(qs.prompt);
    chat.setSelectedMode(qs.mode);
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto" role="log" aria-label="Conversación de creación" aria-live="polite">
      {messages.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Wand2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            ¿Qué quieres crear?
          </h2>
          <p className="mb-10 max-w-sm text-sm text-muted-foreground">
            Describe una idea y Prompt Studio te ayudará a convertirla en una imagen, video o experiencia web.
          </p>

          {/* Quick-start cards */}
          <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_STARTS.map(qs => (
              <button
                key={qs.label}
                type="button"
                onClick={() => handleQuickStart(qs)}
                className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-card/50 p-3 text-left transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <div className="space-y-6 p-4 pb-2">
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

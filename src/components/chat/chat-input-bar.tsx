'use client';

import { useState, useEffect } from 'react';
import { Send, Image, Video, Globe } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import { ChatMode, type ChatParams } from '@/lib/chat-types';
import {
  Globe,
  Image as ImageIcon,
  SendHorizonal,
  Video,
  Zap,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useRef, useEffect } from 'react';
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

// Los IDs se mantienen internos; la interfaz presenta capacidades y niveles.
const MODEL_OPTIONS = {
  image: [
    { provider: 'google', model: 'imagen-4.0-fast-generate-001', tier: 'fast', icon: '⚡', label: 'Fast', credits: 5, description: 'Resultados rápidos para explorar ideas' },
    { provider: 'google', model: 'imagen-4.0-fast-generate-001', tier: 'quality', icon: '✨', label: 'Quality', credits: 10, description: 'Más detalle y consistencia visual' },
    { provider: 'google', model: 'imagen-4.0-fast-generate-001', tier: 'pro', icon: '💎', label: 'Pro', credits: 25, description: 'La mejor calidad para entregables finales' },
  ],
  video: [
    { provider: 'google', model: 'veo-2.0-generate-001', tier: 'fast', icon: '⚡', label: 'Fast', credits: 60, description: 'Itera rápidamente sobre tu concepto' },
    { provider: 'google', model: 'veo-2.0-generate-001', tier: 'quality', icon: '✨', label: 'Quality', credits: 120, description: 'Movimiento y detalle equilibrados' },
    { provider: 'google', model: 'veo-2.0-generate-001', tier: 'cinematic', icon: '💎', label: 'Cinematic', credits: 400, description: 'Máximo detalle para escenas finales' },
  ],
  project: [
    { provider: 'google', model: 'gemini-2.5-flash', tier: 'fast', icon: '⚡', label: 'Fast', credits: 10, description: 'Una web funcional en pocos segundos' },
    { provider: 'google', model: 'gemini-2.5-pro', tier: 'advanced', icon: '✨', label: 'Advanced', credits: 20, description: 'Mejor estructura, contenido y componentes' },
    { provider: 'google', model: 'gemini-2.5-pro', tier: 'pro', icon: '💎', label: 'Pro', credits: 50, description: 'La experiencia web más completa' },
  ],
} as const satisfies Record<ChatMode, Array<{ provider: string; model: string; tier: string; icon: string; label: string; credits: number; description: string }>>;

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
};

export function ChatInputBar({ chat }: { chat: ChatGeneratorReturn }) {
  const {
    selectedMode, setSelectedMode, generate, localGenerating,
    draftPrompt: prompt, setDraftPrompt, params, setParams,
    imageGen,
  } = chat;

  const { userId } = useAuth();
  const clerk = useClerk();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resolve selected model/provider from params, defaulting to first option for the mode
  const modeModels = MODEL_OPTIONS[selectedMode];
  const currentModel = modeModels.find(
    m => m.tier === params.generationTier || (m.provider === params.provider && m.model === params.model)
  ) ?? modeModels[0];

  const modelKey = currentModel.tier;

  const handleModelSelect = (key: string) => {
    const selected = modeModels.find(m => m.tier === key) ?? modeModels[0];
    setParams(prev => ({ ...prev, provider: selected.provider, model: selected.model, generationTier: selected.tier as ChatParams['generationTier'] }));
  };

  // When mode switches, reset provider/model to first available
  const handleModeChange = (mode: ChatMode) => {
    const defaults = MODEL_OPTIONS[mode][0];
    setSelectedMode(mode);
    setParams(prev => ({ ...prev, provider: defaults.provider, model: defaults.model, generationTier: defaults.tier as ChatParams['generationTier'] }));
  };

  const handleSend = () => {
    if (!userId) {
      clerk.openSignUp({ fallbackRedirectUrl: '/generate' });
      return;
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
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); } }}
        />

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 pb-2.5 pt-1 flex-wrap">
          {/* Mode selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/40 p-0.5" role="group" aria-label="Modo de creación">
            {(Object.entries(MODE_CONFIG) as Array<[ChatMode, typeof MODE_CONFIG[ChatMode]]>).map(([mode, config]) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeChange(mode)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
                  selectedMode === mode
                    ? config.color + ' shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                aria-pressed={selectedMode === mode}
                aria-label={`Modo ${config.label}`}
              >
                {config.icon}
                {config.label}
              </button>
            ))}
          </div>

          {/* Model selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Seleccionar modelo de IA"
              >
                <span className="max-w-[120px] truncate">{currentModel.icon} {MODE_CONFIG[selectedMode].label} Model</span>
                <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {MODE_CONFIG[selectedMode].label} Model · elige tu nivel
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={modelKey} onValueChange={handleModelSelect}>
                {modeModels.map(m => (
                  <DropdownMenuRadioItem
                    key={`${m.provider}:${m.model}`}
                    value={m.tier}
                    className="flex flex-col items-start gap-0.5 py-2.5"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{m.icon} {m.label}</span>
                      <span className="text-[10px] text-muted-foreground">~{m.credits} créditos</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{m.description}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Spacer */}
          <div className="flex-1" aria-hidden="true" />

          {/* Credit estimate */}
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              hasInsufficientCredits ? 'text-destructive' : 'text-muted-foreground'
            )}
            aria-label={`Créditos disponibles: ${creditsDisplay}. Costo estimado: ~${currentModel.credits} créditos`}
          >
            <Zap className="h-3 w-3" aria-hidden="true" />
            <span>
              {hasInsufficientCredits
                ? `Sin créditos · ${creditsDisplay} disponibles`
                : `~${currentModel.credits} · ${creditsDisplay} disponibles`
              }
            </span>
          </div>

          {/* Send button */}
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={localGenerating || !prompt.trim() || hasInsufficientCredits}
            className="h-8 gap-1.5 rounded-lg px-3"
            aria-label={localGenerating ? 'Generando...' : 'Generar'}
          >
            {localGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <SendHorizonal className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{localGenerating ? 'Generando...' : 'Crear'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

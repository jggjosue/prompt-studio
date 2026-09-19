'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import { ChatMode } from '@/lib/chat-types';
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

// ── Actual models from ai-credit-config (no invented IDs) ──
const MODEL_OPTIONS = {
  image: [
    { provider: 'google', model: 'imagen-4.0-fast-generate-001', label: 'Imagen 4.0 Fast', credits: 10, description: 'Rápido · Google' },
    { provider: 'openai', model: 'dall-e-3', label: 'DALL-E 3', credits: 10, description: 'Calidad alta · OpenAI' },
    { provider: 'openai', model: 'gpt-image-1-mini', label: 'GPT Image Mini', credits: 15, description: 'Avanzado · OpenAI' },
    { provider: 'fal', model: 'fal-ai/flux/schnell', label: 'Flux Schnell', credits: 10, description: 'Rápido · Fal.ai' },
  ],
  video: [
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
    m => m.provider === (params.provider ?? modeModels[0].provider) && m.model === (params.model ?? modeModels[0].model)
  ) ?? modeModels[0];

  const modelKey = `${currentModel.provider}:${currentModel.model}`;

  const handleModelSelect = (key: string) => {
    const [provider, ...rest] = key.split(':');
    const model = rest.join(':');
    setParams(prev => ({ ...prev, provider, model }));
  };

  // When mode switches, reset provider/model to first available
  const handleModeChange = (mode: ChatMode) => {
    const defaults = MODEL_OPTIONS[mode][0];
    setSelectedMode(mode);
    setParams(prev => ({ ...prev, provider: defaults.provider, model: defaults.model }));
  };

  const handleSend = () => {
    if (!userId) {
      clerk.openSignUp({ fallbackRedirectUrl: '/generate' });
      return;
    }
    if (!prompt.trim() || localGenerating) return;
    generate(prompt.trim(), { ...params, provider: currentModel.provider, model: currentModel.model }, selectedMode);
    setDraftPrompt('');
  };

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [prompt]);

  const credits = imageGen.credits;
  const creditsDisplay = Number.isInteger(credits) ? credits.toString() : credits.toFixed(1);
  const hasInsufficientCredits = credits < currentModel.credits;

  return (
    <div className="shrink-0 border-t border-border/60 bg-background/80 backdrop-blur-sm p-3">
      {/* Composer card */}
      <div className={cn(
        'rounded-xl border border-border/60 bg-card/60 transition-all duration-200',
        'focus-within:border-blue-500/60 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]'
      )}>
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          id="chat-composer"
          value={prompt}
          onChange={e => setDraftPrompt(e.target.value)}
          placeholder={MODE_CONFIG[selectedMode].placeholder}
          disabled={localGenerating}
          className="min-h-[72px] max-h-[200px] resize-none border-0 bg-transparent px-4 pt-3 pb-1 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          aria-label="Describe lo que quieres crear"
          aria-multiline="true"
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
                <span className="max-w-[120px] truncate">{currentModel.label}</span>
                <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Modelos para {MODE_CONFIG[selectedMode].label}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={modelKey} onValueChange={handleModelSelect}>
                {modeModels.map(m => (
                  <DropdownMenuRadioItem
                    key={`${m.provider}:${m.model}`}
                    value={`${m.provider}:${m.model}`}
                    className="flex flex-col items-start gap-0.5 py-2.5"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{m.label}</span>
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

      {/* Insufficient credits warning */}
      {hasInsufficientCredits && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Necesitas {currentModel.credits} créditos para esta generación.{' '}
          <Link href="/prices" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">
            Ver planes
          </Link>
        </p>
      )}

      <p className="mt-1.5 text-center text-[11px] text-muted-foreground/40">
        Enter para crear · Shift+Enter para nueva línea
      </p>
    </div>
  );
}

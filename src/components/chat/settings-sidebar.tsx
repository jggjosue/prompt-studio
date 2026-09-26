'use client';

import { cn } from '@/lib/utils';
import { MODEL_TIERS } from '@/lib/models-data';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import { ChevronRight, Zap, Settings2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

type Params = ChatGeneratorReturn['params'];
type SetParams = ChatGeneratorReturn['setParams'];

function updateParam(setParams: SetParams, key: keyof Params, value: string | number) {
  setParams(prev => ({ ...prev, [key]: value }));
}

// ── Visual aspect-ratio segmented control ──
function AspectControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap" role="group" aria-label="Relación de aspecto">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md border px-2.5 py-1 text-[11px] font-mono font-semibold transition-all',
            value === opt.value
              ? 'border-blue-500/60 bg-blue-500/15 text-blue-300'
              : 'border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground'
          )}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Tier-based model selector ──
function ModelTiersSelect({
  group,
  value,
  onChange,
}: {
  group: keyof typeof MODEL_TIERS;
  value: string;
  onChange: (modelId: string) => void;
}) {
  const tiers = MODEL_TIERS[group].tiers;
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Modelo</label>
      <div className="grid grid-cols-3 gap-1">
        {tiers.map(tier => {
          const active = value === tier.modelId;
          return (
            <button
              key={tier.key}
              type="button"
              onClick={() => onChange(tier.modelId)}
              className={cn(
                'flex flex-col items-center rounded-lg border px-1.5 py-2 text-[10px] font-semibold transition-all',
                active
                  ? 'border-blue-500/60 bg-blue-500/15 text-blue-300'
                  : 'border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground'
              )}
              aria-pressed={active}
            >
              <span className="text-base leading-none">{tier.icon}</span>
              <span className="mt-0.5">{tier.label}</span>
              <span className="text-[9px] opacity-70">{tier.credits} cr</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Select wrapper ──
function ParamSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-border focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
      >
        {children}
      </select>
    </div>
  );
}

function Divider() {
  return <hr className="border-border/40" />;
}

export function SettingsSidebar({ chat }: { chat: ChatGeneratorReturn }) {
  const [open, setOpen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { imageGen, selectedMode, params, setParams } = chat;

  const credits = imageGen.credits;
  const creditsDisplay = Number.isInteger(credits) ? credits.toString() : credits.toFixed(1);

  // Estimate credit cost from current model config
  const CREDIT_ESTIMATES_RAW: Record<string, number> = {
    'dall-e-3': 10, 'gpt-image-1-mini': 15, 'fal-ai/flux/schnell': 10,
    'veo-2.0-generate-001': 20, 'gen-3': 20,
    'gpt-4o': 4, 'claude-3-5-sonnet-20240620': 8,
  };
  const getEstimatedCredits = (modelId: string) => {
    for (const group of Object.values(MODEL_TIERS)) {
      const tier = group.tiers.find(t => t.modelId === modelId);
      if (tier) return tier.credits;
    }
    return CREDIT_ESTIMATES_RAW[modelId] ?? (selectedMode === 'image' ? 10 : selectedMode === 'video' ? 20 : 2);
  };
  const currentModel = params.model ?? '';
  const estimatedCredits = getEstimatedCredits(currentModel);
  const balanceAfter = Math.max(0, credits - estimatedCredits);
  const insufficient = credits < estimatedCredits;

  return (
    <aside
      className={cn(
        'hidden flex-col border-l border-border/60 bg-background/50 backdrop-blur-sm transition-all duration-300 overflow-hidden shrink-0 md:flex',
        open ? 'w-72' : 'w-10'
      )}
      aria-label="Configuración de creación"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex h-12 w-full items-center justify-between border-b border-border/60 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-label={open ? 'Colapsar configuración' : 'Expandir configuración'}
      >
        {open ? (
          <>
            <div className="flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="uppercase tracking-widest">Configuración</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 rotate-180" aria-hidden="true" />
          </>
        ) : (
          <Settings2 className="mx-auto h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="space-y-4 p-3">
            {/* Mode label */}
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">
              {selectedMode === 'image' ? '✦ Imagen' : selectedMode === 'video' ? '▶ Video' : '◈ Web'}
            </p>

            {/* ── IMAGE settings ── */}
            {selectedMode === 'image' && (
              <div className="space-y-3">
                <ModelTiersSelect group="image" value={params.model ?? 'nano-banana-2'} onChange={v => updateParam(setParams, 'model', v)} />

                <Divider />

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Aspecto
                  </label>
                  <AspectControl
                    value={params.imageRatio ?? '1-1'}
                    options={[
                      { value: '1-1', label: '1:1' },
                      { value: '16-9', label: '16:9' },
                      { value: '9-16', label: '9:16' },
                      { value: '4-3', label: '4:3' },
                    ]}
                    onChange={v => updateParam(setParams, 'imageRatio', v)}
                  />
                </div>

                <ParamSelect
                  label="Estilo"
                  value={params.imageStyle ?? 'cinematic'}
                  onChange={v => updateParam(setParams, 'imageStyle', v)}
                >
                  <option value="cinematic">Cinematográfico</option>
                  <option value="photorealistic">Fotorrealista</option>
                  <option value="anime">Anime</option>
                  <option value="surreal">Surrealista</option>
                  <option value="watercolor">Acuarela</option>
                  <option value="sketch">Boceto / Sketch</option>
                </ParamSelect>

                {/* Advanced (collapsed by default) */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(v => !v)}
                  className="flex w-full items-center justify-between text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-none"
                  aria-expanded={showAdvanced}
                >
                  <span>Configuración avanzada</span>
                  <ChevronRight className={cn('h-3 w-3 transition-transform', showAdvanced && 'rotate-90')} />
                </button>

                {showAdvanced && (
                  <div className="space-y-3">
                    <Divider />
                    <ParamSelect
                      label="Iluminación"
                      value={params.imageLighting ?? 'volumetric'}
                      onChange={v => updateParam(setParams, 'imageLighting', v)}
                    >
                      <option value="volumetric">Volumétrica</option>
                      <option value="studio">Estudio</option>
                      <option value="neon">Neón / Cyberpunk</option>
                      <option value="sunset">Atardecer</option>
                      <option value="moody">Dramática / Moody</option>
                    </ParamSelect>

                    <ParamSelect
                      label="Cámara / Plano"
                      value={params.imageCamera ?? 'eye-level'}
                      onChange={v => updateParam(setParams, 'imageCamera', v)}
                    >
                      <option value="eye-level">A nivel de ojos</option>
                      <option value="close-up">Primer plano</option>
                      <option value="wide">Plano general</option>
                      <option value="aerial">Vista aérea</option>
                    </ParamSelect>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Prompt Negativo
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs transition-colors hover:border-border focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                        value={params.imageNegative ?? 'blurry, low quality'}
                        onChange={e => updateParam(setParams, 'imageNegative', e.target.value)}
                        placeholder="Ej. blurry, extra limbs"
                        aria-label="Prompt negativo"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── VIDEO settings ── */}
            {selectedMode === 'video' && (
              <div className="space-y-3">
                <ParamSelect
                  label="Proveedor"
                  value={params.provider ?? 'google'}
                  onChange={v => updateParam(setParams, 'provider', v)}
                >
                  <option value="google">Google (Veo)</option>
                  <option value="runway">Runway</option>
                </ParamSelect>

                {params.provider === 'google' ? (
                  <ModelTiersSelect group="video" value={params.model ?? 'veo-fast'} onChange={v => updateParam(setParams, 'model', v)} />
                ) : (
                  <ParamSelect
                    label="Modelo"
                    value={params.model ?? 'gen-3'}
                    onChange={v => updateParam(setParams, 'model', v)}
                  >
                    <option value="gen-3">Gen-3 Alpha</option>
                  </ParamSelect>
                )}

                <Divider />

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Aspecto
                  </label>
                  <AspectControl
                    value={params.videoAspect ?? '16-9'}
                    options={[
                      { value: '16-9', label: '16:9' },
                      { value: '9-16', label: '9:16' },
                      { value: '1-1', label: '1:1' },
                      { value: '21-9', label: '21:9' },
                    ]}
                    onChange={v => updateParam(setParams, 'videoAspect', v)}
                  />
                </div>

                <ParamSelect
                  label="Estilo"
                  value={params.videoStyle ?? 'photorealistic'}
                  onChange={v => updateParam(setParams, 'videoStyle', v)}
                >
                  <option value="photorealistic">Fotorrealista</option>
                  <option value="cinematic">Cinematográfico</option>
                  <option value="3d-animation">Animación 3D</option>
                  <option value="anime">Anime Movie</option>
                </ParamSelect>

                <button
                  type="button"
                  onClick={() => setShowAdvanced(v => !v)}
                  className="flex w-full items-center justify-between text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-none"
                  aria-expanded={showAdvanced}
                >
                  <span>Configuración avanzada</span>
                  <ChevronRight className={cn('h-3 w-3 transition-transform', showAdvanced && 'rotate-90')} />
                </button>

                {showAdvanced && (
                  <div className="space-y-3">
                    <Divider />
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Duración (segundos)
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={30}
                        className="w-full rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                        value={params.videoDuration ?? 8}
                        onChange={e => updateParam(setParams, 'videoDuration', Number(e.target.value))}
                        aria-label="Duración del video en segundos"
                      />
                    </div>

                    <ParamSelect
                      label="Movimiento"
                      value={params.videoMotion ?? 'medium'}
                      onChange={v => updateParam(setParams, 'videoMotion', v)}
                    >
                      <option value="low">Suave / Bajo</option>
                      <option value="medium">Medio</option>
                      <option value="high">Intenso / Alto</option>
                    </ParamSelect>

                    <ParamSelect
                      label="Movimiento de Cámara"
                      value={params.videoCamera ?? 'none'}
                      onChange={v => updateParam(setParams, 'videoCamera', v)}
                    >
                      <option value="none">Sin movimiento</option>
                      <option value="zoom-in">Acercamiento</option>
                      <option value="zoom-out">Alejamiento</option>
                      <option value="pan-left">Panorámica Izquierda</option>
                      <option value="pan-right">Panorámica Derecha</option>
                      <option value="orbit">Órbita 360°</option>
                    </ParamSelect>
                  </div>
                )}
              </div>
            )}

            {/* ── WEB settings ── */}
            {selectedMode === 'project' && (
              <div className="space-y-3">
                <ParamSelect
                  label="Proveedor"
                  value={params.provider ?? 'google'}
                  onChange={v => updateParam(setParams, 'provider', v)}
                >
                  <option value="google">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </ParamSelect>

                {params.provider === 'google' ? (
                  <ModelTiersSelect group="project" value={params.model ?? 'gemini-2.5-flash'} onChange={v => updateParam(setParams, 'model', v)} />
                ) : (
                  <ParamSelect
                    label="Modelo"
                    value={params.model ?? (params.provider === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20240620')}
                    onChange={v => updateParam(setParams, 'model', v)}
                  >
                    {params.provider === 'openai' && (<option value="gpt-4o">GPT-4o</option>)}
                    {params.provider === 'anthropic' && (<option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>)}
                  </ParamSelect>
                )}

                <Divider />

                <ParamSelect
                  label="Sección"
                  value={params.webComponent ?? 'hero'}
                  onChange={v => updateParam(setParams, 'webComponent', v)}
                >
                  <option value="hero">Hero Header Section</option>
                  <option value="pricing">Planes de Precios</option>
                  <option value="features">Características</option>
                  <option value="full-page">Landing Page Completa</option>
                </ParamSelect>

                <ParamSelect
                  label="Framework"
                  value={params.webFramework ?? 'nextjs'}
                  onChange={v => updateParam(setParams, 'webFramework', v)}
                >
                  <option value="nextjs">Next.js</option>
                  <option value="react">React Component</option>
                  <option value="html">HTML5 Bundle</option>
                </ParamSelect>

                <button
                  type="button"
                  onClick={() => setShowAdvanced(v => !v)}
                  className="flex w-full items-center justify-between text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-none"
                  aria-expanded={showAdvanced}
                >
                  <span>Configuración avanzada</span>
                  <ChevronRight className={cn('h-3 w-3 transition-transform', showAdvanced && 'rotate-90')} />
                </button>

                {showAdvanced && (
                  <div className="space-y-3">
                    <Divider />
                    <ParamSelect
                      label="Tema Visual"
                      value={params.webTheme ?? 'glassmorphism'}
                      onChange={v => updateParam(setParams, 'webTheme', v)}
                    >
                      <option value="glassmorphism">Glassmorphism</option>
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Minimalist</option>
                      <option value="neon">Neon Cyberpunk</option>
                    </ParamSelect>

                    <ParamSelect
                      label="Color Accent"
                      value={params.webColor ?? 'blue'}
                      onChange={v => updateParam(setParams, 'webColor', v)}
                    >
                      <option value="blue">Azul / Cyan</option>
                      <option value="emerald">Verde Esmeralda</option>
                      <option value="rose">Rosa / Magenta</option>
                      <option value="amber">Ámbar / Dorado</option>
                    </ParamSelect>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Credit summary ── */}
          <div className="mt-auto border-t border-border/60 p-3 space-y-2.5">
            <div className="space-y-1.5 rounded-xl border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Costo estimado</span>
                <span className="flex items-center gap-1 font-semibold">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  ~{estimatedCredits} créditos
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Disponibles</span>
                <span className={cn('font-semibold', insufficient && 'text-destructive')}>
                  {creditsDisplay}
                </span>
              </div>
              {!insufficient && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tras generar</span>
                  <span className="font-semibold text-muted-foreground">~{balanceAfter}</span>
                </div>
              )}
              {insufficient && (
                <p className="text-[11px] text-destructive">
                  Necesitas {estimatedCredits - credits} créditos más.
                </p>
              )}
            </div>

            {insufficient && (
              <a
                href="/prices"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Comprar créditos
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

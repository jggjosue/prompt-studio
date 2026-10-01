'use client';

import { cn } from '@/lib/utils';
import { MODEL_TIERS } from '@/lib/models-data';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import { GUIDED_PRESETS, applyGuidedPreset, type GuidedMode } from '@/lib/chat-guided-presets';
import { ChevronRight, Zap, Settings2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useSuperAdmin } from '@/hooks/use-super-admin';

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
      <div className={cn('grid gap-1', tiers.length === 1 ? 'grid-cols-1' : 'grid-cols-3')}>
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

function GuidedPresetSelector({
  mode,
  value,
  onSelect,
}: {
  mode: GuidedMode;
  value?: string;
  onSelect: (preset: (typeof GUIDED_PRESETS)[GuidedMode][number]) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground">¿Qué quieres crear?</p>
        <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
          Elige una opción y ajustaremos los detalles por ti.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Objetivo de creación">
        {GUIDED_PRESETS[mode].map(preset => {
          const active = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={cn(
                'min-h-20 rounded-xl border p-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                active
                  ? 'border-blue-500/70 bg-blue-500/15 shadow-[0_0_18px_rgba(37,99,235,0.12)]'
                  : 'border-border/50 bg-muted/20 hover:border-blue-500/40 hover:bg-blue-500/5'
              )}
              role="radio"
              aria-checked={active}
            >
              <span className={cn('block text-[11px] font-semibold leading-4', active ? 'text-blue-300' : 'text-foreground')}>
                {preset.label}
              </span>
              <span className="mt-1 block text-[10px] leading-3.5 text-muted-foreground">{preset.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AdvancedToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg py-1 text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-none"
      aria-expanded={open}
    >
      <span>Configuración avanzada</span>
      <ChevronRight className={cn('h-3 w-3 transition-transform', open && 'rotate-90')} />
    </button>
  );
}

export function SettingsSidebar({ chat, desktopOpen, onDesktopOpenChange, mobileOpen, onMobileClose }: {
  chat: ChatGeneratorReturn;
  desktopOpen: boolean;
  onDesktopOpenChange: (open: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const { imageGen, selectedMode, params, setParams } = chat;
  const [advancedMode, setAdvancedMode] = useState<typeof selectedMode | null>(null);
  const showAdvanced = advancedMode === selectedMode;
  const toggleAdvanced = () => setAdvancedMode(current => current === selectedMode ? null : selectedMode);
  const isSuperAdmin = useSuperAdmin();

  // Credit balances/costs are private to the super administrator. All other
  // users see a neutral zero state regardless of plan or backend balance.
  const credits = isSuperAdmin ? imageGen.credits : 0;
  const creditsDisplay = Number.isInteger(credits) ? credits.toString() : credits.toFixed(1);

  // Estimate credit cost from current model config
  const CREDIT_ESTIMATES: Record<string, number> = {
    'imagen-4.0-fast-generate-001': 10,
    'gemini-3.1-flash-image': 10,
    'gemini-3.1-flash-lite-image': 5,
    'dall-e-3': 10,
    'gpt-image-1-mini': 15,
    'fal-ai/flux/schnell': 10,
    'veo-2.0-generate-001': 20,
    'gen-3': 20,
    'gemini-2.5-flash': 1,
    'gemini-2.5-pro': 3,
    'gemini-2.0-flash': 1,
    'gpt-4o': 4,
    'claude-3-5-sonnet-20240620': 8,
    'gemini-3.8-flash': 1,
  };
  const currentModel = params.model ?? '';
  const estimatedCredits = isSuperAdmin ? (CREDIT_ESTIMATES[currentModel] ?? 10) : 0;
  const balanceAfter = isSuperAdmin ? Math.max(0, credits - estimatedCredits) : 0;
  const insufficient = isSuperAdmin && credits < estimatedCredits;
  const selectGuidedPreset = (preset: (typeof GUIDED_PRESETS)[GuidedMode][number]) => {
    setParams(previous => applyGuidedPreset(previous, preset));
  };

  const settingsMarkup = (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="space-y-4 p-3">
        {/* Mode label */}
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">
          {selectedMode === 'image'
            ? '✦ Imagen'
            : selectedMode === 'video'
            ? '▶ Video'
            : selectedMode === 'project'
            ? '◈ Web'
            : selectedMode === 'vision'
            ? '◉ Visión'
            : selectedMode === 'text'
            ? '✎ Texto'
            : '🔍 Video IA'}
        </p>

        {/* ── IMAGE settings ── */}
        {selectedMode === 'image' && (
          <div className="space-y-3">
            <GuidedPresetSelector mode="image" value={params.imageGoal} onSelect={selectGuidedPreset} />

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
            <AdvancedToggle open={showAdvanced} onClick={toggleAdvanced} />

            {showAdvanced && (
              <div className="space-y-3">
                <Divider />
                <ModelTiersSelect group="image" value={params.model ?? 'nano-banana-2'} onChange={v => updateParam(setParams, 'model', v)} />
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
                  label="Modelo"
                  value={params.model ?? (params.provider === 'openai' ? 'dall-e-3' : params.provider === 'fal' ? 'fal-ai/flux/schnell' : 'gemini-3.1-flash-image')}
                  onChange={v => updateParam(setParams, 'model', v)}
                >
                  {params.provider === 'openai' && (
                    <>
                      <option value="dall-e-3">DALL-E 3</option>
                      <option value="gpt-image-1-mini">GPT Image 1 Mini</option>
                    </>
                  )}
                  {params.provider === 'fal' && (
                    <option value="fal-ai/flux/schnell">Flux Schnell</option>
                  )}
                  {(!params.provider || params.provider === 'google') && (
                    <>
                      <option value="gemini-3.1-flash-image">Nano Banana 2 (Flash)</option>
                      <option value="gemini-3.1-flash-lite-image">Nano Banana 2 Lite</option>
                      <option value="imagen-4.0-fast-generate-001">Imagen 4.0 Fast</option>
                    </>
                  )}
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
            <GuidedPresetSelector mode="video" value={params.videoGoal} onSelect={selectGuidedPreset} />

            <Divider />

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

            <AdvancedToggle open={showAdvanced} onClick={toggleAdvanced} />

            {showAdvanced && (
              <div className="space-y-3">
                <Divider />
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
                  <ParamSelect label="Modelo" value={params.model ?? 'gen-3'} onChange={v => updateParam(setParams, 'model', v)}>
                    <option value="gen-3">Gen-3 Alpha</option>
                  </ParamSelect>
                )}
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

        {/* ── VIDEO UNDERSTANDING settings ── */}
        {selectedMode === 'videoUnderstanding' && (
          <div className="space-y-3">
            <ParamSelect
              label="Modelo"
              value={params.model ?? 'gemini-3.8-flash'}
              onChange={v => updateParam(setParams, 'model', v)}
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
            </ParamSelect>

            <Divider />

            <ParamSelect
              label="Fuente de video"
              value={params.videoInputMethod ?? 'url'}
              onChange={v => updateParam(setParams, 'videoInputMethod', v)}
            >
              <option value="url">URL pública / File API</option>
              <option value="youtube">YouTube URL</option>
              <option value="inline">Subir archivo (base64)</option>
            </ParamSelect>

            <ParamSelect
              label="Modo de procesamiento"
              value={params.videoProcessingMode ?? 'agentic'}
              onChange={v => updateParam(setParams, 'videoProcessingMode', v)}
            >
              <option value="agentic">Agéntico (eficiente, largo)</option>
              <option value="static">Estático (1 FPS, clips cortos)</option>
            </ParamSelect>

            <button
              type="button"
              onClick={toggleAdvanced}
              className="flex w-full items-center justify-between text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-none"
              aria-expanded={showAdvanced}
            >
              <span>Recorte / FPS personalizado</span>
              <ChevronRight className={cn('h-3 w-3 transition-transform', showAdvanced && 'rotate-90')} />
            </button>

            {showAdvanced && (
              <div className="space-y-3">
                <Divider />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Inicio (s)</label>
                    <input
                      type="number" min={0}
                      className="w-full rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs focus:border-teal-500/60 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                      placeholder="0"
                      onChange={e => updateParam(setParams, 'startOffset', Number(e.target.value))}
                      aria-label="Offset de inicio en segundos"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fin (s)</label>
                    <input
                      type="number" min={0}
                      className="w-full rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs focus:border-teal-500/60 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                      placeholder="fin"
                      onChange={e => updateParam(setParams, 'endOffset', Number(e.target.value))}
                      aria-label="Offset de fin en segundos"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">FPS de muestreo</label>
                  <input
                    type="number" min={0.1} max={60} step={0.1}
                    className="w-full rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs focus:border-teal-500/60 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                    placeholder="1 (default)"
                    onChange={e => updateParam(setParams, 'fps', Number(e.target.value))}
                    aria-label="Tasa de muestreo de frames por segundo"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WEB settings ── */}
        {selectedMode === 'project' && (
          <div className="space-y-3">
            <GuidedPresetSelector mode="project" value={params.webGoal} onSelect={selectGuidedPreset} />

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

            <AdvancedToggle open={showAdvanced} onClick={toggleAdvanced} />

            {showAdvanced && (
              <div className="space-y-3">
                <Divider />
                <ParamSelect label="Proveedor" value={params.provider ?? 'google'} onChange={v => updateParam(setParams, 'provider', v)}>
                  <option value="google">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </ParamSelect>

                {params.provider === 'google' ? (
                  <ModelTiersSelect group="project" value={params.model ?? 'gemini-3.1-flash-lite'} onChange={v => updateParam(setParams, 'model', v)} />
                ) : (
                  <ParamSelect label="Modelo" value={params.model ?? (params.provider === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20240620')} onChange={v => updateParam(setParams, 'model', v)}>
                    {params.provider === 'openai' && (<option value="gpt-4o">GPT-4o</option>)}
                    {params.provider === 'anthropic' && (<option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>)}
                  </ParamSelect>
                )}

                <ParamSelect label="Framework" value={params.webFramework ?? 'nextjs'} onChange={v => updateParam(setParams, 'webFramework', v)}>
                  <option value="nextjs">Next.js</option>
                  <option value="react">React Component</option>
                  <option value="html">HTML5 Bundle</option>
                </ParamSelect>
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

        {/* ── VISION settings ── */}
        {selectedMode === 'vision' && (
          <div className="space-y-3">
            <ParamSelect
              label="Proveedor"
              value={params.provider ?? 'google'}
              onChange={v => updateParam(setParams, 'provider', v)}
            >
              <option value="google">Google</option>
            </ParamSelect>

            <ParamSelect
              label="Modelo"
              value={params.model ?? 'gemini-3.8-flash'}
              onChange={v => updateParam(setParams, 'model', v)}
            >
              {(!params.provider || params.provider === 'google') && (
                <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
              )}
            </ParamSelect>

            <Divider />

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                URL de la Imagen
              </label>
              <input
                type="url"
                className="w-full rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs transition-colors hover:border-border focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                value={params.referenceImage ?? ''}
                onChange={e => updateParam(setParams, 'referenceImage', e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                aria-label="URL de la Imagen para analizar"
              />
              <p className="text-[10px] text-muted-foreground">Pega la URL de una imagen pública para analizar o procesar con el modelo de visión.</p>
            </div>
          </div>
        )}

        {/* ── TEXT settings ── */}
        {selectedMode === 'text' && (
          <div className="space-y-3">
            <GuidedPresetSelector mode="text" value={params.textGoal} onSelect={selectGuidedPreset} />

            <Divider />

            <AdvancedToggle open={showAdvanced} onClick={toggleAdvanced} />

            {showAdvanced && (
              <div className="space-y-3">
                <ParamSelect label="Proveedor" value={params.provider ?? 'google'} onChange={v => updateParam(setParams, 'provider', v)}>
                  <option value="google">Google</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="deepseek">DeepSeek</option>
                </ParamSelect>

                <ParamSelect label="Modelo" value={params.model ?? 'gemini-3.8-flash'} onChange={v => updateParam(setParams, 'model', v)}>
                  {(!params.provider || params.provider === 'google') && (<option value="gemini-3.8-flash">Gemini 3.8 Flash</option>)}
                  {params.provider === 'openai' && (<option value="gpt-4o">GPT-4o</option>)}
                  {params.provider === 'anthropic' && (<option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>)}
                  {params.provider === 'deepseek' && (<option value="deepseek-chat">DeepSeek Chat</option>)}
                </ParamSelect>

                <ParamSelect label="Nivel de razonamiento" value={params.thinkingLevel ?? 'low'} onChange={v => updateParam(setParams, 'thinkingLevel', v)}>
                  <option value="minimal">Rápido</option>
                  <option value="low">Equilibrado</option>
                  <option value="high">Profundo</option>
                </ParamSelect>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Instrucción personalizada</label>
                  <textarea
                    className="min-h-20 w-full resize-y rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs transition-colors hover:border-border focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    value={params.systemInstruction ?? ''}
                    onChange={e => updateParam(setParams, 'systemInstruction', e.target.value)}
                    placeholder="Ej. Responde como un asesor de marketing..."
                    aria-label="Instrucción personalizada"
                  />
                </div>
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
          <Link
            href="/prices"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Comprar créditos
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden flex-col border-l border-border/60 bg-background/50 backdrop-blur-sm transition-all duration-300 overflow-hidden shrink-0 md:flex',
          desktopOpen ? 'w-72' : 'w-10'
        )}
        aria-label="Configuración de creación"
      >
        {/* Header */}
        <button
          type="button"
          onClick={() => onDesktopOpenChange(!desktopOpen)}
          className="flex h-12 w-full items-center justify-between border-b border-border/60 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={desktopOpen}
          aria-label={desktopOpen ? 'Colapsar configuración' : 'Expandir configuración'}
        >
          {desktopOpen ? (
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

        {desktopOpen && settingsMarkup}
      </aside>

      {/* Hoja inferior de configuración (solo móvil) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Configuración de creación"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-background shadow-2xl">
            <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Configuración
              </span>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Cerrar configuración"
              >
                <ChevronRight className="h-4 w-4 rotate-90" />
              </button>
            </div>
            {settingsMarkup}
          </div>
        </div>
      )}
    </>
  );
}

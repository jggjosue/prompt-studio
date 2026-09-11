'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clapperboard, Copy, Download, Eye, Film, Link2, Music2, Play, RotateCcw, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { useMemo, useState } from 'react';

type ContinuityBible = {
  characters: string;
  wardrobe: string;
  product: string;
  location: string;
  lighting: string;
  artDirection: string;
};

type PlatformKey = 'tiktok' | 'reels' | 'shorts' | 'youtube' | 'meta' | 'product-demo' | 'cinematic';
type AdTemplateKey = 'ugc' | 'problem-solution' | 'before-after' | 'product-demo' | 'unboxing' | 'limited-offer' | 'launch' | 'retargeting';
type VideoModelKey = 'sora' | 'veo' | 'runway' | 'kling' | 'luma' | 'pika' | 'hailuo';

const PLATFORM_PRESETS: Record<PlatformKey, {
  label: string;
  aspectRatio: string;
  recommendedDuration: string;
  delivery: string;
  promptRule: string;
}> = {
  tiktok: { label: 'TikTok', aspectRatio: '9:16', recommendedDuration: '15–30s', delivery: 'Hook en 1 segundo · texto centrado', promptRule: 'TikTok-native vertical video, immediate first-second hook, fast pattern interrupts, authentic creator aesthetic, keep captions and subjects inside mobile safe zones, finish with a direct CTA' },
  reels: { label: 'Instagram Reels', aspectRatio: '9:16', recommendedDuration: '15–30s', delivery: 'Visual aspiracional · loop final', promptRule: 'premium Instagram Reel, vertical composition, aspirational visual hook, rhythmic edits synchronized to audio, polished social aesthetic, safe space for interface overlays, seamless looping ending' },
  shorts: { label: 'YouTube Shorts', aspectRatio: '9:16', recommendedDuration: '20–45s', delivery: 'Retención progresiva · payoff', promptRule: 'YouTube Short in vertical format, curiosity-driven opening, escalating visual beats, clear narrative payoff, readable mobile framing, no important details near interface overlays' },
  youtube: { label: 'YouTube horizontal', aspectRatio: '16:9', recommendedDuration: '30–60s', delivery: 'Narrativa amplia · CTA final', promptRule: 'cinematic YouTube video in horizontal 16:9, strong establishing compositions, paced narrative progression, room for titles and lower thirds, polished final call to action' },
  meta: { label: 'Anuncio de Meta', aspectRatio: '4:5', recommendedDuration: '15–30s', delivery: 'Problema → beneficio → CTA', promptRule: 'conversion-focused Meta ad in feed-first 4:5 format, communicate the problem and product benefit without sound, prominent product visibility, concise on-screen copy safe zones, decisive CTA ending' },
  'product-demo': { label: 'Product demo', aspectRatio: '16:9', recommendedDuration: '30–60s', delivery: 'Función → uso → resultado', promptRule: 'clear product demonstration, keep the exact product design and UI consistent, show setup then core action then measurable outcome, controlled camera movement, uncluttered instructional composition' },
  cinematic: { label: 'Cinemática', aspectRatio: '2.39:1', recommendedDuration: '30–60s', delivery: 'Atmósfera · lenguaje cinematográfico', promptRule: 'cinematic widescreen sequence, deliberate visual storytelling, sophisticated blocking, motivated camera movement, filmic lighting, coherent production design, controlled pacing and immersive sound design' },
};

const AD_TEMPLATES: Record<AdTemplateKey, {
  label: string;
  hook: string;
  beats: string[];
  overlays: string[];
  cta: string;
  voiceStyle: string;
}> = {
  ugc: { label: 'UGC testimonial', hook: 'No esperaba que esto funcionara tan bien…', beats: ['Selfie hook with a natural reaction', 'Relatable personal problem', 'How the product was discovered', 'Real use demonstration', 'Specific result or benefit', 'Honest recommendation', 'Proof detail or close-up', 'Direct creator-style CTA'], overlays: ['No esperaba esto', 'Mi problema era…', 'Entonces probé esto', 'Así lo uso', 'El resultado', 'Mi opinión real', 'Mira este detalle', 'Pruébalo hoy'], cta: 'Descubre por qué funciona para ti', voiceStyle: 'natural first-person creator voice, conversational, credible, lightly imperfect, never corporate' },
  'problem-solution': { label: 'Problema–solución', hook: '¿Sigues perdiendo tiempo con este problema?', beats: ['Visualize the painful problem', 'Show its daily consequence', 'Introduce the solution', 'Demonstrate the core mechanism', 'Reveal the immediate benefit', 'Add supporting proof', 'Remove the main objection', 'Close with the solution and CTA'], overlays: ['¿Te pasa esto?', 'Tiempo y dinero perdidos', 'Hay una forma mejor', 'Así funciona', 'Resultado inmediato', 'Resultados reales', 'Sin complicaciones', 'Resuélvelo hoy'], cta: 'Empieza a resolverlo ahora', voiceStyle: 'clear persuasive narrator, empathetic opening, confident solution, concise benefit-led delivery' },
  'before-after': { label: 'Before/after', hook: 'De esto… a esto.', beats: ['Show the undesirable before state', 'Highlight the visible frustration', 'Introduce the transformation trigger', 'Show the transformation process', 'Reveal the after state', 'Compare details side by side', 'Reinforce the difference', 'Invite the viewer to transform'], overlays: ['ANTES', 'El problema', 'El cambio comienza', 'Transformación', 'DESPUÉS', 'Compara', 'La diferencia es real', 'Consigue tu resultado'], cta: 'Crea tu propio antes y después', voiceStyle: 'visual transformation narrator, short dramatic phrases, rising energy toward the reveal' },
  'product-demo': { label: 'Demostración de producto', hook: 'Mira lo que puede hacer en segundos.', beats: ['Hero product hook', 'Name the primary use case', 'Show setup in one action', 'Demonstrate the main feature', 'Show a second useful feature', 'Reveal the finished result', 'Summarize key benefits', 'Product hero shot and CTA'], overlays: ['Míralo en acción', 'Diseñado para esto', 'Listo en segundos', 'Función principal', 'Más posibilidades', 'Resultado final', 'Rápido · Fácil · Efectivo', 'Descúbrelo'], cta: 'Mira todas las funciones', voiceStyle: 'precise product specialist, simple instructional language, benefit after every feature' },
  unboxing: { label: 'Unboxing', hook: 'Acaba de llegar y vamos a abrirlo.', beats: ['Sealed package anticipation', 'Break the seal', 'First reveal reaction', 'Show included items', 'Texture and material close-ups', 'First setup or use', 'Initial verdict', 'Product lineup and CTA'], overlays: ['Acaba de llegar', 'Vamos a abrirlo', 'Primera impresión', 'Todo lo que incluye', 'Detalles premium', 'Primera prueba', '¿Vale la pena?', 'Conócelo aquí'], cta: 'Vive la experiencia completa', voiceStyle: 'excited but authentic creator, sensory descriptions, spontaneous reactions, short social-friendly sentences' },
  'limited-offer': { label: 'Oferta limitada', hook: 'Esta oferta termina muy pronto.', beats: ['Urgent offer reveal', 'Show the product value', 'State the regular situation', 'Reveal the limited benefit', 'Demonstrate what is included', 'Add urgency signal', 'Remove purchase friction', 'Countdown-style CTA'], overlays: ['OFERTA LIMITADA', 'Todo este valor', 'Ahora por menos', 'Beneficio exclusivo', 'Esto incluye', 'Últimas horas', 'Compra segura', 'Aprovecha ahora'], cta: 'Obtén la oferta antes de que termine', voiceStyle: 'energetic retail voice, urgent without sounding deceptive, emphasize concrete value and deadline' },
  launch: { label: 'Lanzamiento', hook: 'Lo que estabas esperando ya está aquí.', beats: ['Tease the new arrival', 'Reveal the product silhouette', 'Full product reveal', 'Show signature innovation', 'Demonstrate key experience', 'Present launch benefits', 'Create cultural momentum', 'Launch date and CTA'], overlays: ['Algo nuevo llega', 'Prepárate', 'Presentamos…', 'Una nueva forma de…', 'Diseñado para ti', 'Disponible muy pronto', 'Sé de los primeros', 'Descúbrelo ahora'], cta: 'Sé de los primeros en probarlo', voiceStyle: 'premium launch narrator, cinematic restraint, confident pauses, crescendo toward availability' },
  retargeting: { label: 'Retargeting', hook: '¿Todavía lo estás pensando?', beats: ['Reconnect with the viewed product', 'Recall the viewer intent', 'Restate the strongest benefit', 'Show product proof', 'Address the likely objection', 'Add a relevant incentive', 'Reduce risk and friction', 'Return-to-cart CTA'], overlays: ['¿Aún lo piensas?', 'Esto te interesó', 'Recuerda el beneficio', 'Personas reales · resultados reales', 'Sí, es para ti', 'Una razón más', 'Compra sin complicaciones', 'Continúa donde lo dejaste'], cta: 'Vuelve y completa tu compra', voiceStyle: 'warm direct-response voice, familiar and helpful, objection-aware, no aggressive pressure' },
};

const CAMERA_MOVEMENTS = [
  { id: 'dolly-in', label: 'Dolly in', prompt: 'smooth dolly in toward the subject' },
  { id: 'dolly-out', label: 'Dolly out', prompt: 'smooth dolly out revealing the environment' },
  { id: 'orbit', label: 'Orbit', prompt: 'controlled orbital camera movement around the subject' },
  { id: 'tracking', label: 'Tracking', prompt: 'steady tracking shot matching the subject movement' },
  { id: 'crane', label: 'Crane', prompt: 'cinematic crane movement changing height and scale' },
  { id: 'handheld', label: 'Handheld', prompt: 'natural handheld camera with subtle human movement' },
  { id: 'drone', label: 'Drone', prompt: 'wide aerial drone movement with stable cinematic flight' },
  { id: 'rack-focus', label: 'Rack focus', prompt: 'precise rack focus shifting attention between foreground and background' },
  { id: 'slow-motion', label: 'Slow motion', prompt: 'high-frame-rate slow motion with fluid subject movement' },
  { id: 'timelapse', label: 'Timelapse', prompt: 'locked-composition timelapse showing accelerated environmental change' },
] as const;

const VIDEO_MODEL_PRESETS: Record<VideoModelKey, {
  label: string;
  durationRange: string;
  parameters: Record<string, string | number | boolean>;
  guidance: string;
}> = {
  runway: { label: 'Runway Gen-3', durationRange: '5–10s', parameters: { mode: 'image-to-video', motionStrength: 5, cameraControl: true, seed: 'locked' }, guidance: 'Use a concise positive prompt, describe subject motion before camera motion, and upload the first frame as the visual reference.' },
  veo: { label: 'Google Veo', durationRange: '4–8s', parameters: { mode: 'first-and-last-frame', resolution: '1080p', aspectRatio: 'from-platform', audio: true }, guidance: 'Describe cinematography, action, ambience, and sound explicitly; provide matching first and last frames.' },
  kling: { label: 'Kling 2.5', durationRange: '5–10s', parameters: { mode: 'image-to-video', creativity: 0.45, relevance: 0.8, negativePrompt: true }, guidance: 'Keep identity cues identical in both frames and describe physical motion with direction and speed.' },
  sora: { label: 'OpenAI Sora', durationRange: '4–12s', parameters: { mode: 'storyboard', resolution: '1080p', aspectRatio: 'from-platform', variations: 1 }, guidance: 'Use timestamped visual actions, persistent identity descriptions, and a clear final composition.' },
  luma: { label: 'Luma Dream Machine', durationRange: '5–10s', parameters: { mode: 'keyframes', loop: false, aspectRatio: 'from-platform', promptWeight: 0.8 }, guidance: 'Prioritize start and end keyframes, natural physics, a single camera action, and clear spatial relationships.' },
  pika: { label: 'Pika', durationRange: '3–5s', parameters: { mode: 'image-to-video', motion: 2, guidanceScale: 12, negativePrompt: true }, guidance: 'Use short action phrases, one primary movement, a stable subject, and restrained motion strength for commercial shots.' },
  hailuo: { label: 'Hailuo AI', durationRange: '5–6s', parameters: { mode: 'image-to-video', promptOptimizer: true, cameraInstruction: true, subjectReference: 'locked' }, guidance: 'Describe the subject first, then action, environment, camera, and atmosphere while repeating identity anchors.' },
};

export type StoryboardScene = {
  number: number;
  title: string;
  prompt: string;
  camera: string;
  duration: number;
  audio: string;
  transition: string;
  continuity: ContinuityBible;
  onScreenText: string;
  voicePrompt: string;
  cta?: string;
  framePackage: {
    firstFramePrompt: string;
    lastFramePrompt: string;
    motionPrompt: string;
    negativePrompt: string;
    recommendedDuration: string;
    model: string;
    parameters: Record<string, string | number | boolean>;
  };
  modelVariants: Record<VideoModelKey, {
    model: string;
    optimizedMotionPrompt: string;
    durationRange: string;
    guidance: string;
    parameters: Record<string, string | number | boolean>;
  }>;
};

const CONTINUITY_FIELDS: { key: keyof ContinuityBible; label: string; placeholder: string }[] = [
  { key: 'characters', label: 'Personajes', placeholder: 'Rasgos, edad, cabello, accesorios…' },
  { key: 'wardrobe', label: 'Vestuario', placeholder: 'Prendas, materiales y colores exactos…' },
  { key: 'product', label: 'Producto', placeholder: 'Modelo, forma, color, logo y acabado…' },
  { key: 'location', label: 'Ubicación', placeholder: 'Espacio, arquitectura y elementos fijos…' },
  { key: 'lighting', label: 'Iluminación', placeholder: 'Hora, fuente, temperatura y contraste…' },
  { key: 'artDirection', label: 'Dirección artística', placeholder: 'Estética, paleta, textura y época…' },
];
const BEATS = [
  ['Apertura', 'Establish the world and immediately introduce the visual hook', 'slow push-in', 'ambient rise and subtle impact', 'fade from black'],
  ['Contexto', 'Reveal the subject, product, or protagonist in its environment', 'controlled lateral dolly', 'environmental sound and rhythmic pulse', 'match cut'],
  ['Problema', 'Show the tension, need, or obstacle with a clear visual contrast', 'handheld medium shot', 'low cinematic hit and tension bed', 'hard cut'],
  ['Transformación', 'Present the decisive action or transformation with visual energy', 'dynamic orbit', 'riser, movement effects, and music lift', 'whip transition'],
  ['Beneficio', 'Demonstrate the result through a clean, aspirational moment', 'smooth tracking shot', 'bright musical resolution and tactile effects', 'light leak'],
  ['Detalle', 'Focus on a memorable detail, texture, expression, or feature', 'macro close-up', 'precise foley and reduced music', 'focus pull'],
  ['Clímax', 'Deliver the strongest campaign image and emotional peak', 'crane up to wide hero shot', 'full music peak and cinematic impact', 'seamless cut'],
  ['Cierre', 'Finish with a clear final image and space for the call to action', 'locked-off hero frame', 'logo sting and clean tail', 'fade to brand color'],
] as const;

export function VideoStoryboardGenerator({ initialIdea, onUseScene }: { initialIdea: string; onUseScene: (scene: StoryboardScene) => void }) {
  const [idea, setIdea] = useState(initialIdea);
  const [sceneCount, setSceneCount] = useState('6');
  const [totalDuration, setTotalDuration] = useState('30');
  const [platform, setPlatform] = useState<PlatformKey>('tiktok');
  const [adTemplate, setAdTemplate] = useState<AdTemplateKey>('ugc');
  const [cameraPlan, setCameraPlan] = useState<string[]>([]);
  const [videoModel, setVideoModel] = useState<VideoModelKey>('runway');
  const [previewScene, setPreviewScene] = useState(0);
  const [previewFrame, setPreviewFrame] = useState<'first' | 'last'>('first');
  const [continuity, setContinuity] = useState<ContinuityBible>({
    characters: '', wardrobe: '', product: '', location: '', lighting: '', artDirection: '',
  });
  const [generated, setGenerated] = useState(false);
  const storyboard = useMemo(() => {
    const count = Number(sceneCount);
    const seconds = Number(totalDuration);
    const platformPreset = PLATFORM_PRESETS[platform];
    const templatePreset = AD_TEMPLATES[adTemplate];
    const modelPreset = VIDEO_MODEL_PRESETS[videoModel];
    const baseDuration = Math.floor(seconds / count);
    const remainder = seconds % count;
    const continuityPrompt = CONTINUITY_FIELDS
      .filter(field => continuity[field.key].trim())
      .map(field => `${field.label}: ${continuity[field.key].trim()}`)
      .join('. ');
    const scenes: StoryboardScene[] = BEATS.slice(0, count).map((beat, index) => {
      const templateIndex = Math.round(index * (templatePreset.beats.length - 1) / Math.max(count - 1, 1));
      const isLastScene = index === count - 1;
      const voicePrompt = `${templatePreset.voiceStyle}. Voice-over line: ${templatePreset.overlays[templateIndex]}.`;
      const selectedCamera = cameraPlan.length
        ? CAMERA_MOVEMENTS.find(movement => movement.id === cameraPlan[index % cameraPlan.length])
        : undefined;
      const cameraPrompt = selectedCamera?.prompt ?? beat[2];
      const visualIdentity = continuityPrompt || `same recognizable subjects, product, wardrobe, location, lighting, and ${platformPreset.label} art direction`;
      const firstFramePrompt = `${templatePreset.beats[templateIndex]}. Opening composition for scene ${index + 1}, before the action begins. ${visualIdentity}. ${platformPreset.aspectRatio}, sharp subject identity, production-ready still frame.`;
      const nextTemplateIndex = Math.min(templateIndex + 1, templatePreset.beats.length - 1);
      const lastFramePrompt = `${templatePreset.beats[nextTemplateIndex]}. Resolved end composition for scene ${index + 1}, after the action completes. Preserve exactly: ${visualIdentity}. ${platformPreset.aspectRatio}, coherent spatial layout and matching color grade.`;
      const motionPrompt = `Animate from the supplied first frame toward the supplied last frame using ${cameraPrompt}. Maintain subject geometry, identity, wardrobe, product design, background layout, lighting direction, and color grade. No cuts inside the shot.`;
      const negativePrompt = 'identity drift, face changes, wardrobe changes, product deformation, logo mutation, extra limbs, missing fingers, duplicate subjects, warped geometry, background replacement, lighting flicker, color shift, camera jitter, sudden cuts, text artifacts, subtitles, watermark, low resolution, blur';
      const modelVariants = Object.fromEntries(Object.entries(VIDEO_MODEL_PRESETS).map(([modelId, preset]) => [modelId, {
        model: preset.label,
        optimizedMotionPrompt: `${motionPrompt} MODEL GUIDANCE — ${preset.guidance}`,
        durationRange: preset.durationRange,
        guidance: preset.guidance,
        parameters: { ...preset.parameters, aspectRatio: platformPreset.aspectRatio },
      }])) as unknown as StoryboardScene['modelVariants'];
      return ({
      number: index + 1,
      title: beat[0],
      prompt: `${templatePreset.beats[templateIndex]}. Story idea: ${idea}. CAMERA MOVEMENT — ${cameraPrompt}. CONVERSION TEMPLATE — ${templatePreset.label}. ${index === 0 ? `Opening hook: “${templatePreset.hook}”. ` : ''}On-screen text: “${templatePreset.overlays[templateIndex]}”. Voice direction: ${voicePrompt} ${isLastScene ? `CTA: “${templatePreset.cta}”. ` : ''}PLATFORM DELIVERY — ${platformPreset.promptRule}. Required aspect ratio: ${platformPreset.aspectRatio}.${continuityPrompt ? ` CONTINUITY LOCK — preserve these exact details without redesigning or replacing them: ${continuityPrompt}.` : ' Preserve the same characters, wardrobe, product, location, lighting, art direction, and color continuity across every scene.'}`,
      camera: cameraPrompt,
      duration: baseDuration + (index < remainder ? 1 : 0),
      audio: beat[3],
      transition: beat[4],
      continuity: { ...continuity },
      onScreenText: templatePreset.overlays[templateIndex],
      voicePrompt,
      cta: isLastScene ? templatePreset.cta : undefined,
      framePackage: { firstFramePrompt, lastFramePrompt, motionPrompt, negativePrompt, recommendedDuration: `${sceneCount === '8' ? Math.max(2, baseDuration) : baseDuration + (index < remainder ? 1 : 0)}s por escena · modelo admite ${modelPreset.durationRange}`, model: modelPreset.label, parameters: { ...modelPreset.parameters, aspectRatio: platformPreset.aspectRatio } },
      modelVariants,
    }); });
    return { concept: `${templatePreset.label} para ${platformPreset.label}: ${idea}`, platform: { id: platform, ...platformPreset }, conversionTemplate: { id: adTemplate, ...templatePreset }, videoModel: { id: videoModel, ...modelPreset }, cameraPlan, continuity, script: scenes.map(scene => `${scene.number}. ${scene.title}: ${scene.prompt}\nPRIMER FRAME: ${scene.framePackage.firstFramePrompt}\nÚLTIMO FRAME: ${scene.framePackage.lastFramePrompt}\nMOVIMIENTO: ${scene.framePackage.motionPrompt}\nNEGATIVE: ${scene.framePackage.negativePrompt}\nVOZ: ${scene.voicePrompt}`).join('\n\n'), scenes };
  }, [idea, sceneCount, totalDuration, platform, adTemplate, cameraPlan, videoModel, continuity]);
  const download = () => { const blob = new Blob([JSON.stringify(storyboard, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'storyboard.json'; anchor.click(); URL.revokeObjectURL(url); };

  return <section className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4"><div className="mb-4 flex items-center gap-2"><Clapperboard className="size-5 text-rose-600" /><div><h3 className="text-sm font-bold">Generador de storyboard</h3><p className="text-xs text-muted-foreground">Convierte una idea en un plan de producción escena por escena.</p></div></div><div className="grid gap-3 sm:grid-cols-[1fr_110px_110px_190px]"><div className="space-y-1.5"><Label className="text-xs">Idea</Label><Input value={idea} onChange={event => { setIdea(event.target.value); setGenerated(false); }} placeholder="Describe la historia o campaña…" className="bg-background text-xs" /></div><div className="space-y-1.5"><Label className="text-xs">Escenas</Label><Select value={sceneCount} onValueChange={value => { setSceneCount(value); setGenerated(false); }}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{['3','4','5','6','7','8'].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label className="text-xs">Duración</Label><Select value={totalDuration} onValueChange={value => { setTotalDuration(value); setGenerated(false); }}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{['15','30','45','60'].map(value => <SelectItem key={value} value={value}>{value}s</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label className="text-xs">Plataforma</Label><Select value={platform} onValueChange={value => { setPlatform(value as PlatformKey); setGenerated(false); }}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PLATFORM_PRESETS).map(([key, preset]) => <SelectItem key={key} value={key}>{preset.label}</SelectItem>)}</SelectContent></Select></div></div>

  <div className="mt-3 flex flex-wrap gap-2 rounded-lg border bg-background/70 p-3 text-[11px]"><span className="font-bold text-rose-600">{PLATFORM_PRESETS[platform].label}</span><span className="rounded-full bg-muted px-2 py-0.5">{PLATFORM_PRESETS[platform].aspectRatio}</span><span className="rounded-full bg-muted px-2 py-0.5">{PLATFORM_PRESETS[platform].recommendedDuration}</span><span className="text-muted-foreground">{PLATFORM_PRESETS[platform].delivery}</span></div>

  <div className="mt-4 rounded-lg border border-violet-500/25 bg-violet-500/5 p-4"><div className="grid gap-3 sm:grid-cols-[220px_1fr]"><div className="space-y-1.5"><Label className="text-xs">Plantilla de conversión</Label><Select value={adTemplate} onValueChange={value => { setAdTemplate(value as AdTemplateKey); setGenerated(false); }}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(AD_TEMPLATES).map(([key, template]) => <SelectItem key={key} value={key}>{template.label}</SelectItem>)}</SelectContent></Select></div><div className="rounded-md border bg-background px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Hook sugerido</p><p className="mt-1 text-sm font-semibold">“{AD_TEMPLATES[adTemplate].hook}”</p><p className="mt-1 text-[11px] text-muted-foreground"><strong>CTA:</strong> {AD_TEMPLATES[adTemplate].cta}</p></div></div></div>

  <div className="mt-4 rounded-lg border border-blue-500/25 bg-blue-500/5 p-4"><div className="mb-3 flex items-start justify-between gap-3"><div className="flex items-start gap-2"><Video className="mt-0.5 size-4 text-blue-600" /><div><h4 className="text-sm font-bold">Editor de cámara y movimiento</h4><p className="text-xs text-muted-foreground">Selecciona uno o varios movimientos. Se aplicarán a las escenas en el orden elegido.</p></div></div>{cameraPlan.length ? <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => { setCameraPlan([]); setGenerated(false); }}><RotateCcw className="mr-1 size-3" />Restablecer</Button> : null}</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{CAMERA_MOVEMENTS.map(movement => { const selectedIndex = cameraPlan.indexOf(movement.id); return <button key={movement.id} type="button" aria-pressed={selectedIndex >= 0} onClick={() => { setCameraPlan(current => current.includes(movement.id) ? current.filter(id => id !== movement.id) : [...current, movement.id]); setGenerated(false); }} className={`relative rounded-lg border px-3 py-2 text-left text-xs transition ${selectedIndex >= 0 ? 'border-blue-500 bg-blue-500/10 font-semibold text-blue-700 dark:text-blue-300' : 'bg-background hover:border-blue-500/50'}`}><Film className="mb-1.5 size-4" />{movement.label}{selectedIndex >= 0 ? <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">{selectedIndex + 1}</span> : null}</button>; })}</div>{cameraPlan.length ? <p className="mt-3 text-[11px] text-blue-700 dark:text-blue-300"><strong>Secuencia:</strong> {cameraPlan.map(id => CAMERA_MOVEMENTS.find(movement => movement.id === id)?.label).join(' → ')}</p> : <p className="mt-3 text-[11px] text-muted-foreground">Sin selección manual: el sistema elegirá un movimiento apropiado para cada escena.</p>}</div>

  <div className="mt-4 grid gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-4 sm:grid-cols-[220px_1fr]"><div className="space-y-1.5"><Label className="text-xs">Modelo principal</Label><Select value={videoModel} onValueChange={value => { setVideoModel(value as VideoModelKey); setGenerated(false); }}><SelectTrigger className="bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(VIDEO_MODEL_PRESETS).map(([key, model]) => <SelectItem key={key} value={key}>{model.label}</SelectItem>)}</SelectContent></Select></div><div className="rounded-md border bg-background px-3 py-2 text-[11px]"><p className="font-bold text-emerald-700 dark:text-emerald-400">{VIDEO_MODEL_PRESETS[videoModel].label} · {VIDEO_MODEL_PRESETS[videoModel].durationRange}</p><p className="mt-1 text-muted-foreground">{VIDEO_MODEL_PRESETS[videoModel].guidance}</p><div className="mt-2 flex flex-wrap gap-1">{Object.values(VIDEO_MODEL_PRESETS).map(model => <span key={model.label} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold">{model.label}</span>)}</div><p className="mt-2 font-semibold">El JSON incluirá las 7 versiones optimizadas; el selector define cuál se muestra como principal.</p></div></div>

  <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 p-4"><div className="mb-3 flex items-start gap-2"><Link2 className="mt-0.5 size-4 text-amber-600" /><div><h4 className="text-sm font-bold">Biblia de continuidad</h4><p className="text-xs text-muted-foreground">Define una sola vez los elementos que ningún modelo debe cambiar entre escenas.</p></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CONTINUITY_FIELDS.map(field => <div key={field.key} className="space-y-1.5"><Label className="text-xs">{field.label}</Label><Input value={continuity[field.key]} onChange={event => { setContinuity(current => ({ ...current, [field.key]: event.target.value })); setGenerated(false); }} placeholder={field.placeholder} className="bg-background text-xs" /></div>)}</div><p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400"><ShieldCheck className="size-3.5" />Los detalles completados se bloquearán y repetirán automáticamente en cada prompt.</p></div>

  <Button type="button" disabled={!idea.trim()} onClick={() => { setPreviewScene(0); setPreviewFrame('first'); setGenerated(true); }} className="mt-4 bg-rose-600 text-white hover:bg-rose-700"><Sparkles className="mr-2 size-4" />Crear storyboard</Button>{generated ? <div className="mt-5 space-y-4"><div className="rounded-lg border bg-background p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Concepto</p><p className="mt-1 text-sm font-semibold">{storyboard.concept}</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-md bg-violet-500/5 p-2"><p className="text-[10px] font-bold uppercase text-violet-600">Hook</p><p className="text-xs font-semibold">“{storyboard.conversionTemplate.hook}”</p></div><div className="rounded-md bg-violet-500/5 p-2"><p className="text-[10px] font-bold uppercase text-violet-600">CTA</p><p className="text-xs font-semibold">{storyboard.conversionTemplate.cta}</p></div></div><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-rose-600">Guion</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{storyboard.scenes.map(scene => scene.title).join(' → ')}</p>{CONTINUITY_FIELDS.some(field => storyboard.continuity[field.key]) ? <div className="mt-3 flex flex-wrap gap-1.5">{CONTINUITY_FIELDS.filter(field => storyboard.continuity[field.key]).map(field => <span key={field.key} className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400"><ShieldCheck className="mr-1 inline size-3" />{field.label} bloqueado</span>)}</div> : null}</div>

  <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/5 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Eye className="size-4 text-cyan-600" /><div><h3 className="text-sm font-bold">Previsualización del storyboard</h3><p className="text-[11px] text-muted-foreground">Representación conceptual; las imágenes finales se generan con el modelo seleccionado.</p></div></div><div className="flex rounded-md border bg-background p-0.5"><button type="button" onClick={() => setPreviewFrame('first')} className={`rounded px-2 py-1 text-[11px] ${previewFrame === 'first' ? 'bg-cyan-600 font-semibold text-white' : ''}`}>Primer frame</button><button type="button" onClick={() => setPreviewFrame('last')} className={`rounded px-2 py-1 text-[11px] ${previewFrame === 'last' ? 'bg-cyan-600 font-semibold text-white' : ''}`}>Último frame</button></div></div><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]"><div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-950 via-cyan-950 to-violet-950 p-6 text-white" style={{ aspectRatio: storyboard.platform.aspectRatio.replace(':', ' / ') }}><div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #67e8f9 0, transparent 35%), radial-gradient(circle at 75% 70%, #c084fc 0, transparent 32%)' }} /><div className="relative max-w-xl text-center"><span className="rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">Escena {storyboard.scenes[previewScene].number} · {previewFrame === 'first' ? 'Inicio' : 'Final'}</span><p className="mt-4 text-xl font-black sm:text-3xl">{storyboard.scenes[previewScene].onScreenText}</p><p className="mx-auto mt-3 line-clamp-3 max-w-lg text-xs text-white/75">{previewFrame === 'first' ? storyboard.scenes[previewScene].framePackage.firstFramePrompt : storyboard.scenes[previewScene].framePackage.lastFramePrompt}</p></div><div className="absolute bottom-3 left-3 rounded bg-black/45 px-2 py-1 text-[10px]">{storyboard.scenes[previewScene].camera}</div><div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-black/45 px-2 py-1 text-[10px]"><Play className="size-3" />{storyboard.scenes[previewScene].duration}s</div></div><div className="rounded-lg border bg-background p-3 text-xs"><p className="font-bold">{storyboard.scenes[previewScene].title}</p><p className="mt-2 text-muted-foreground">{storyboard.scenes[previewScene].framePackage.motionPrompt}</p><div className="mt-3 space-y-1 text-[11px]"><p><strong>Formato:</strong> {storyboard.platform.aspectRatio}</p><p><strong>Modelo:</strong> {storyboard.videoModel.label}</p><p><strong>Transición:</strong> {storyboard.scenes[previewScene].transition}</p><p><strong>Audio:</strong> {storyboard.scenes[previewScene].audio}</p></div></div></div><div className="mt-4 flex gap-2 overflow-x-auto pb-1">{storyboard.scenes.map((scene, index) => <button key={scene.number} type="button" onClick={() => setPreviewScene(index)} className={`min-w-36 overflow-hidden rounded-lg border text-left transition ${previewScene === index ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'bg-background hover:border-cyan-500/50'}`}><div className="relative h-20 bg-gradient-to-br from-slate-900 via-cyan-950 to-violet-950 p-2 text-white"><span className="text-[9px] font-bold">{scene.number.toString().padStart(2, '0')}</span><p className="mt-2 line-clamp-2 text-[10px] font-semibold">{scene.onScreenText}</p><span className="absolute bottom-1.5 right-1.5 text-[9px]">{scene.duration}s</span></div><p className="truncate px-2 py-1.5 text-[10px] font-semibold">{scene.title}</p></button>)}</div></div>

  <div className="grid gap-3 sm:grid-cols-2">{storyboard.scenes.map(scene => <article key={scene.number} className="rounded-lg border bg-background p-4"><div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-bold"><span className="mr-2 text-rose-600">{scene.number.toString().padStart(2, '0')}</span>{scene.title}</h4><span className="text-xs font-bold">{scene.duration}s</span></div><p className="line-clamp-4 text-xs leading-5 text-muted-foreground">{scene.prompt}</p><div className="mt-3 rounded-md bg-violet-500/5 p-2 text-[11px]"><p><strong>Texto en pantalla:</strong> “{scene.onScreenText}”</p><p className="mt-1"><strong>Prompt de voz:</strong> {scene.voicePrompt}</p>{scene.cta ? <p className="mt-1 font-semibold text-violet-700 dark:text-violet-400">CTA: {scene.cta}</p> : null}</div><div className="mt-3 space-y-1 text-[11px]"><p><Film className="mr-1 inline size-3 text-blue-500" /><strong>Cámara:</strong> {scene.camera}</p><p><Music2 className="mr-1 inline size-3 text-violet-500" /><strong>Audio:</strong> {scene.audio}</p><p><strong>Transición:</strong> {scene.transition}</p><p className="text-amber-700 dark:text-amber-400"><Link2 className="mr-1 inline size-3" /><strong>Continuidad:</strong> {CONTINUITY_FIELDS.filter(field => scene.continuity[field.key]).length || 6} elementos protegidos</p></div><details className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-[11px]"><summary className="cursor-pointer font-bold text-emerald-700 dark:text-emerald-400">Paquete frame-to-frame · 7 generadores</summary><div className="mt-2 space-y-2"><p><strong>Primer frame:</strong> {scene.framePackage.firstFramePrompt}</p><p><strong>Último frame:</strong> {scene.framePackage.lastFramePrompt}</p><p><strong>Movimiento:</strong> {scene.framePackage.motionPrompt}</p><p><strong>Negative prompt:</strong> {scene.framePackage.negativePrompt}</p><p><strong>Duración:</strong> {scene.framePackage.recommendedDuration}</p><div className="rounded-md border bg-background p-2"><p className="font-bold">Versión principal: {scene.modelVariants[videoModel].model}</p><p className="mt-1">{scene.modelVariants[videoModel].optimizedMotionPrompt}</p><p className="mt-1"><strong>Parámetros:</strong> {Object.entries(scene.modelVariants[videoModel].parameters).map(([key, value]) => `${key}: ${String(value)}`).join(' · ')}</p></div><Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => void navigator.clipboard.writeText(JSON.stringify({ framePackage: scene.framePackage, modelVariants: scene.modelVariants }, null, 2))}><Copy className="mr-1 size-3" />Copiar las 7 versiones</Button></div></details><Button type="button" variant="outline" size="sm" className="mt-3 h-7 text-xs" onClick={() => onUseScene(scene)}>Usar escena</Button></article>)}</div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={download}><Download className="mr-2 size-3.5" />Exportar JSON</Button><Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(storyboard.script)}><Copy className="mr-2 size-3.5" />Copiar guion</Button></div></div> : null}</section>;
}

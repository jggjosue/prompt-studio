import type { ChatMode, ChatParams } from '@/lib/chat-types';

export type GuidedMode = Extract<ChatMode, 'text' | 'image' | 'video' | 'project'>;

export interface GuidedPreset {
  id: string;
  label: string;
  description: string;
  params: Partial<ChatParams>;
}

export const GUIDED_PRESETS: Record<GuidedMode, GuidedPreset[]> = {
  text: [
    {
      id: 'quick',
      label: 'Respuesta rápida',
      description: 'Directa y fácil de leer',
      params: {
        textGoal: 'quick',
        thinkingLevel: 'minimal',
        systemInstruction: 'Responde de forma breve, directa y con lenguaje sencillo.',
      },
    },
    {
      id: 'explain',
      label: 'Explicar un tema',
      description: 'Paso a paso y sin tecnicismos',
      params: {
        textGoal: 'explain',
        thinkingLevel: 'high',
        systemInstruction: 'Explica paso a paso, con lenguaje sencillo y ejemplos claros. Evita tecnicismos innecesarios.',
      },
    },
    {
      id: 'ideas',
      label: 'Generar ideas',
      description: 'Varias opciones creativas',
      params: {
        textGoal: 'ideas',
        thinkingLevel: 'low',
        systemInstruction: 'Propón varias ideas distintas, creativas y accionables. Resume la ventaja de cada una.',
      },
    },
    {
      id: 'professional',
      label: 'Trabajo profesional',
      description: 'Pulido y bien estructurado',
      params: {
        textGoal: 'professional',
        thinkingLevel: 'high',
        systemInstruction: 'Entrega una respuesta profesional, precisa, bien estructurada y lista para utilizar.',
      },
    },
  ],
  image: [
    {
      id: 'social',
      label: 'Publicación social',
      description: 'Cuadrada y llamativa',
      params: { imageGoal: 'social', imageRatio: '1-1', imageStyle: 'cinematic', imageLighting: 'studio' },
    },
    {
      id: 'story',
      label: 'Historia o portada',
      description: 'Vertical para móvil',
      params: { imageGoal: 'story', imageRatio: '9-16', imageStyle: 'cinematic', imageLighting: 'volumetric' },
    },
    {
      id: 'product',
      label: 'Foto de producto',
      description: 'Limpia y realista',
      params: { imageGoal: 'product', imageRatio: '4-3', imageStyle: 'photorealistic', imageLighting: 'studio' },
    },
    {
      id: 'banner',
      label: 'Banner horizontal',
      description: 'Para web o presentación',
      params: { imageGoal: 'banner', imageRatio: '16-9', imageStyle: 'cinematic', imageLighting: 'volumetric' },
    },
  ],
  video: [
    {
      id: 'reel',
      label: 'Reel o historia',
      description: 'Vertical y dinámico',
      params: { videoGoal: 'reel', videoAspect: '9-16', videoDuration: 8, videoStyle: 'cinematic', videoMotion: 'high', videoCamera: 'zoom-in' },
    },
    {
      id: 'product',
      label: 'Mostrar producto',
      description: 'Recorrido claro y atractivo',
      params: { videoGoal: 'product', videoAspect: '16-9', videoDuration: 8, videoStyle: 'photorealistic', videoMotion: 'medium', videoCamera: 'orbit' },
    },
    {
      id: 'cinematic',
      label: 'Escena cinematográfica',
      description: 'Amplia y narrativa',
      params: { videoGoal: 'cinematic', videoAspect: '16-9', videoDuration: 12, videoStyle: 'cinematic', videoMotion: 'medium', videoCamera: 'pan-right' },
    },
    {
      id: 'subtle',
      label: 'Animación suave',
      description: 'Movimiento discreto',
      params: { videoGoal: 'subtle', videoAspect: '1-1', videoDuration: 5, videoStyle: 'photorealistic', videoMotion: 'low', videoCamera: 'none' },
    },
  ],
  project: [
    {
      id: 'landing',
      label: 'Página completa',
      description: 'Presenta una idea o negocio',
      params: { webGoal: 'landing', webComponent: 'full-page', webTheme: 'glassmorphism', webColor: 'blue' },
    },
    {
      id: 'hero',
      label: 'Portada principal',
      description: 'Título, mensaje y botón',
      params: { webGoal: 'hero', webComponent: 'hero', webTheme: 'glassmorphism', webColor: 'blue' },
    },
    {
      id: 'features',
      label: 'Beneficios o servicios',
      description: 'Explica lo más importante',
      params: { webGoal: 'features', webComponent: 'features', webTheme: 'light', webColor: 'blue' },
    },
    {
      id: 'pricing',
      label: 'Planes y precios',
      description: 'Compara opciones de compra',
      params: { webGoal: 'pricing', webComponent: 'pricing', webTheme: 'dark', webColor: 'blue' },
    },
  ],
};

export function applyGuidedPreset(params: ChatParams, preset: GuidedPreset): ChatParams {
  return { ...params, ...preset.params };
}

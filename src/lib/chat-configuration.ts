import type { ChatMode, ChatParams } from '@/lib/chat-types';

export interface ChatConfigurationItem {
  label: string;
  value: string;
}

const labels: Record<string, string> = {
  cinematic: 'Cinematográfico', photorealistic: 'Fotorrealista', anime: 'Anime',
  surreal: 'Surrealista', watercolor: 'Acuarela', sketch: 'Boceto',
  volumetric: 'Volumétrica', studio: 'Estudio', neon: 'Neón', sunset: 'Atardecer', moody: 'Dramática',
  'eye-level': 'A nivel de ojos', 'close-up': 'Primer plano', wide: 'Plano general', aerial: 'Vista aérea',
  nextjs: 'Next.js', react: 'React', html: 'HTML5', glassmorphism: 'Glassmorphism',
  hero: 'Hero', pricing: 'Precios', features: 'Características', 'full-page': 'Landing completa',
};

const display = (value: string | number | undefined, fallback: string | number) => {
  const resolved = String(value ?? fallback);
  return labels[resolved] ?? (/^\d+-\d+$/.test(resolved) ? resolved.replace('-', ':') : resolved);
};

export function selectedChatConfiguration(mode: ChatMode, params: ChatParams): ChatConfigurationItem[] {
  if (mode === 'image') {
    return [
      { label: 'Aspecto', value: display(params.imageRatio, '1-1') },
      { label: 'Estilo', value: display(params.imageStyle, 'cinematic') },
      { label: 'Iluminación', value: display(params.imageLighting, 'volumetric') },
      { label: 'Cámara', value: display(params.imageCamera, 'eye-level') },
      { label: 'Formato', value: display(params.imageFormat, 'png').toUpperCase() },
      { label: 'Resolución', value: display(params.imageRes, '1k').toUpperCase() },
      { label: 'Evitar', value: display(params.imageNegative, 'blurry, low quality') },
    ];
  }
  if (mode === 'video') {
    return [
      { label: 'Aspecto', value: display(params.videoAspect, '16-9') },
      { label: 'Estilo', value: display(params.videoStyle, 'photorealistic') },
      { label: 'Duración', value: `${params.videoDuration ?? 8} s` },
      { label: 'Movimiento', value: display(params.videoMotion, 'medium') },
      { label: 'Cámara', value: display(params.videoCamera, 'none') },
    ];
  }
  return [
    { label: 'Sección', value: display(params.webComponent, 'hero') },
    { label: 'Framework', value: display(params.webFramework, 'nextjs') },
    { label: 'Tema', value: display(params.webTheme, 'glassmorphism') },
    { label: 'Color', value: display(params.webColor, 'blue') },
  ];
}

export function buildConfiguredImagePrompt(prompt: string, params: ChatParams): string {
  const configuration = selectedChatConfiguration('image', params)
    .map(item => `${item.label}: ${item.value}`)
    .join('; ');
  return `${prompt.trim()}\n\nConfiguración seleccionada: ${configuration}.`;
}

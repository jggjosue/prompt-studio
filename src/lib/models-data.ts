export type AiModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  tags: string[];
};

export type ModelTier = {
  key: string;
  label: string;
  icon: string;
  credits: number;
  modelId: string;
};

export type ModelTierGroup = {
  label: string;
  tiers: ModelTier[];
};

export const MODEL_TIERS: Record<'image' | 'video' | 'project', ModelTierGroup> = {
  image: {
    label: 'Image Model',
    tiers: [
      { key: 'fast', icon: '⚡', label: 'Fast', credits: 5, modelId: 'gemini-2.0-flash' },
      { key: 'quality', icon: '✨', label: 'Quality', credits: 10, modelId: 'gemini-2.5-flash' },
      { key: 'pro', icon: '💎', label: 'Pro', credits: 25, modelId: 'nano-banana-pro' },
    ],
  },
  video: {
    label: 'Video Model',
    tiers: [
      { key: 'fast', icon: '⚡', label: 'Fast', credits: 60, modelId: 'veo-fast' },
      { key: 'quality', icon: '✨', label: 'Quality', credits: 120, modelId: 'veo-quality' },
      { key: 'cinematic', icon: '💎', label: 'Cinematic', credits: 400, modelId: 'veo-cinematic' },
    ],
  },
  project: {
    label: 'Website Model',
    tiers: [
      { key: 'fast', icon: '⚡', label: 'Fast', credits: 10, modelId: 'gemini-2.0-flash' },
      { key: 'advanced', icon: '✨', label: 'Advanced', credits: 20, modelId: 'gemini-2.5-flash' },
      { key: 'pro', icon: '💎', label: 'Pro', credits: 50, modelId: 'gemini-2.5-pro' },
    ],
  },
};

export const AiModels: AiModel[] = [
  {
    id: 'veo-3-1',
    name: 'Veo 3.1',
    provider: 'Google',
    description:
      "Google DeepMind's upgraded AI video model for realistic motion generation.",
    imageUrl: 'https://picsum.photos/seed/veo/600/400',
    imageHint: 'earth hands',
    tags: ['Text to Video', 'Image to Video'],
  },
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    provider: 'Google',
    description:
      "Google DeepMind's Nano Banana Pro delivers sharper 2K imagery, intelligent 4...",
    imageUrl: 'https://picsum.photos/seed/banana/600/400',
    imageHint: 'superhero banana',
    tags: ['Text to Image', 'Image to Image'],
  },
  {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    provider: 'OpenAI',
    description:
      "Sora 2 is OpenAI's latest AI video generation model, supporting both text-t...",
    imageUrl: 'https://picsum.photos/seed/sora/600/400',
    imageHint: 'abstract purple',
    tags: ['Text to Video', 'Image to Video'],
  },
  {
    id: 'flux-2-pro',
    name: 'Flux.2 Pro',
    provider: 'Black Forest Labs',
    description:
      "Flux 2 is Black Forest Labs' advanced image generation model that delivers...",
    imageUrl: 'https://picsum.photos/seed/flux/600/400',
    imageHint: 'retro computer',
    tags: ['Text to Image', 'Image to Image'],
  },
  {
    id: 'z-image',
    name: 'Z-Image',
    provider: 'Qwen',
    description: 'Z-Image is a powerful image generation model.',
    imageUrl: 'https://picsum.photos/seed/zimage/600/400',
    imageHint: 'modern art',
    tags: ['Text to Image'],
  },
];

export type ImagePromptModel = 'gpt-image' | 'midjourney' | 'gemini' | 'flux' | 'stable-diffusion' | 'ideogram';
export type ModelPromptVariant = { id: ImagePromptModel; name: string; prompt: string; note: string };

type Options = { prompt: string; negative: string; ratio: string; realism: number };
const ratio = (value: string) => value.replace('-', ':');

export function buildImageModelPromptVariants({ prompt, negative, ratio: aspect, realism }: Options): ModelPromptVariant[] {
  const clean = prompt.trim();
  const avoid = negative.trim();
  return [
    { id: 'gpt-image', name: 'GPT Image', note: 'Lenguaje natural y edición precisa', prompt: `Create an image based on this art direction: ${clean}. Preserve semantic consistency and render coherent geometry. Target aspect ratio ${ratio(aspect)} and ${realism}% photorealism.${avoid ? ` Do not include: ${avoid}.` : ''}` },
    { id: 'midjourney', name: 'Midjourney', note: 'Prompt visual con parámetros', prompt: `${clean}, cohesive art direction, highly refined composition --ar ${ratio(aspect)} --stylize 250${avoid ? ` --no ${avoid.replace(/,/g, ' ')}` : ''}` },
    { id: 'gemini', name: 'Gemini', note: 'Instrucciones explícitas y contextuales', prompt: `Generate a polished ${ratio(aspect)} image. Subject and intent: ${clean}. Maintain accurate spatial relationships, consistent lighting, and a professional final composition. Realism target: ${realism}/100.${avoid ? ` Exclude these elements: ${avoid}.` : ''}` },
    { id: 'flux', name: 'Flux', note: 'Descripción compacta y ponderada', prompt: `${clean}, professional composition, precise materials, coherent lighting, visual consistency, realism ${realism}/100, aspect ratio ${ratio(aspect)}${avoid ? `. Negative: ${avoid}` : ''}` },
    { id: 'stable-diffusion', name: 'Stable Diffusion', note: 'Positive y negative prompt separados', prompt: `POSITIVE PROMPT:\n${clean}, masterpiece, high detail, coherent anatomy, professional lighting, realism:${realism / 10}\n\nNEGATIVE PROMPT:\n${avoid || 'low quality, artifacts, malformed geometry'}\n\nSETTINGS: aspect ratio ${ratio(aspect)}, CFG 7, 30 steps` },
    { id: 'ideogram', name: 'Ideogram', note: 'Composición y texto legible', prompt: `${clean}. Compose for ${ratio(aspect)}. Prioritize clean layout, accurate objects, and legible typography when text is present. Realism ${realism}/100.${avoid ? ` Avoid: ${avoid}.` : ''}` },
  ];
}

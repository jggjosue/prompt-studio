'use server';
/**
 * @fileOverview A flow that generates an image based on a text prompt.
 *
 * - generateImage - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {GOOGLE_IMAGE_MODEL} from '@/lib/google-image-config';
import {z} from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
  model: z.string().optional().describe('The model ID to use for generation.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

/**
 * Tope del data URI en línea. El valor acaba dentro de `AIGenerationJob.result`,
 * que Mongo guarda como documento, y el límite duro de BSON son 16 MB. Sin acotar
 * aquí, una imagen grande revienta la escritura mucho después —con créditos ya
 * gastados— y además infla cada lectura del job.
 *
 * Es el mismo techo que `callWorker` aplica al resultado del worker externo
 * (`ai-job-runner.ts`), para que los dos caminos tengan el mismo límite.
 */
const MAX_INLINE_IMAGE_CHARS = 2_000_000;

export async function generateImage(
  input: GenerateImageInput
): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async input => {
    try {
      // Usa la constante canónica, no el literal: ese archivo existe justo para
      // que el runner, este fallback y el verificador de producción no divergan.
      const modelName = input.model || GOOGLE_IMAGE_MODEL;
      const resolvedModel = modelName.includes('/') ? modelName : `googleai/${modelName}`;
      
      let lastErr: unknown;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const {media} = await ai.generate({
            model: resolvedModel,
            prompt: input.prompt,
            config: {responseModalities: ['TEXT', 'IMAGE']},
          });
          
          const imageUrl = media?.url;
          if (!imageUrl) {
              throw new Error('Image generation failed.');
          }
          if (imageUrl.length > MAX_INLINE_IMAGE_CHARS) {
              throw new Error(
                  `La imagen generada excede el límite en línea de 2 MB (${imageUrl.length} caracteres).`
              );
          }
          return { imageUrl };
        } catch (err: any) {
          lastErr = err;
          const msg = err instanceof Error ? err.message : String(err);
          if (attempt < 3 && (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED'))) {
            const delayMs = attempt * 4000;
            console.warn(`[Genkit Retry] Attempt ${attempt} failed with 429. Retrying in ${delayMs}ms...`);
            await new Promise(r => setTimeout(r, delayMs));
            continue;
          }
          throw err;
        }
      }
      throw lastErr;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'unknown';
      const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
      console.warn('Genkit image generation failed.', msg.replace(key, '[KEY_REDACTED]'));
      throw err;
    }
  }
);

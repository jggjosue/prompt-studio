'use server';
/**
 * @fileOverview A flow that generates an image based on a text prompt.
 *
 * - generateImage - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

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
      const {media} = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: input.prompt,
      });
      
      const imageUrl = media?.url;
      if (!imageUrl) {
          throw new Error('Image generation failed.');
      }
      return { imageUrl };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'unknown';
      const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
      console.warn('Genkit image generation failed. Falling back to mock image.', msg.replace(key, '[KEY_REDACTED]'));
      // Fallback mock image for testing
      return { imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' };
    }
  }
);

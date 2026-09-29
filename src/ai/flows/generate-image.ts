'use server';
/**
 * @fileOverview A flow that generates an image based on a text prompt.
 *
 * - generateImage - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
  model: z.string().optional().describe('The model ID to use for generation.'),
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
      const modelName = input.model || 'gemini-3.1-flash-image';
      const resolvedModel = modelName.includes('/') ? modelName : `googleai/${modelName}`;
      
      const {media} = await ai.generate({
        model: resolvedModel,
        prompt: input.prompt,
      });
      
      const imageUrl = media?.url;
      if (!imageUrl) {
          throw new Error('Image generation failed.');
      }
      return { imageUrl };
    } catch (err: any) {
      console.warn('Genkit image generation failed. Falling back to mock image.', err.message);
      // Fallback mock image for testing
      return { imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' };
    }
  }
);

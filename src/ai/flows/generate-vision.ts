'use server';
/**
 * @fileOverview A flow that generates text based on a text prompt and an optional image.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisionInputSchema = z.object({
  prompt: z.string().describe('The text prompt to analyze.'),
  model: z.string().optional().describe('The model ID to use for generation.'),
  referenceImage: z.string().optional().describe('An optional base64 image or url to analyze.')
});
export type GenerateVisionInput = z.infer<typeof GenerateVisionInputSchema>;

const GenerateVisionOutputSchema = z.object({
  text: z.string().describe('The generated response text.'),
});
export type GenerateVisionOutput = z.infer<typeof GenerateVisionOutputSchema>;

export async function generateVision(
  input: GenerateVisionInput
): Promise<GenerateVisionOutput> {
  return generateVisionFlow(input);
}

const generateVisionFlow = ai.defineFlow(
  {
    name: 'generateVisionFlow',
    inputSchema: GenerateVisionInputSchema,
    outputSchema: GenerateVisionOutputSchema,
  },
  async input => {
    try {
      const modelName = input.model || 'gemini-3.8-flash';
      const resolvedModel = modelName.includes('/') ? modelName : `googleai/${modelName}`;
      
      const promptParts: any[] = [{ text: input.prompt }];
      if (input.referenceImage) {
        promptParts.push({ media: { url: input.referenceImage } });
      }

      const {text} = await ai.generate({
        model: resolvedModel,
        prompt: promptParts,
        config: {
          // Gemini 3.8 segmentation recommendation
          thinkingLevel: 'minimal'
        }
      });
      
      return { text: text || '' };
    } catch (err: any) {
      console.warn('Genkit vision generation failed.', err.message);
      throw err;
    }
  }
);

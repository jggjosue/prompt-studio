'use server';
/**
 * @fileOverview A flow that generates image or video creation prompts based on keywords.
 *
 * - generateImageVideoPrompt - A function that generates image or video creation prompts based on keywords.
 * - GenerateImageVideoPromptInput - The input type for the generateImageVideoPrompt function.
 * - GenerateImageVideoPromptOutput - The return type for the generateImageVideoPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageVideoPromptInputSchema = z.object({
  keywords: z
    .string()
    .describe('Keywords to base the image or video prompt on.'),
});
export type GenerateImageVideoPromptInput = z.infer<
  typeof GenerateImageVideoPromptInputSchema
>;

const GenerateImageVideoPromptOutputSchema = z.object({
  prompt: z.string().describe('The generated image or video creation prompt.'),
});
export type GenerateImageVideoPromptOutput = z.infer<
  typeof GenerateImageVideoPromptOutputSchema
>;

export async function generateImageVideoPrompt(
  input: GenerateImageVideoPromptInput
): Promise<GenerateImageVideoPromptOutput> {
  return generateImageVideoPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImageVideoPromptPrompt',
  input: {schema: GenerateImageVideoPromptInputSchema},
  output: {schema: GenerateImageVideoPromptOutputSchema},
  prompt: `You are an AI prompt generator. Generate a detailed and creative prompt for image or video creation based on the following keywords: {{{keywords}}}. The prompt should be suitable for use with AI image and video generation models. Consider including details about style, composition, subject matter, and overall mood. Keep the prompt under 200 characters.`,
});

const generateImageVideoPromptFlow = ai.defineFlow(
  {
    name: 'generateImageVideoPromptFlow',
    inputSchema: GenerateImageVideoPromptInputSchema,
    outputSchema: GenerateImageVideoPromptOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (err: any) {
      console.warn('Genkit prompt generation failed (likely missing/invalid GEMINI_API_KEY). Falling back to mock prompt.', err.message);
      return { prompt: `A stunning cinematic masterpiece featuring ${input.keywords}. Shot in 8k, hyper-realistic, dramatic lighting, highly detailed.` };
    }
  }
);

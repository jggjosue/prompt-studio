'use server';
/**
 * @fileOverview A flow that generates text based on a prompt, optional system instruction, and thinking level.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTextInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate from.'),
  model: z.string().optional().describe('The model ID to use for generation.'),
  systemInstruction: z.string().optional().describe('Optional system instruction for guiding the model.'),
  thinkingLevel: z.string().optional().describe('Optional thinking level (e.g. minimal, low, high).')
});
export type GenerateTextInput = z.infer<typeof GenerateTextInputSchema>;

const GenerateTextOutputSchema = z.object({
  text: z.string().describe('The generated response text.'),
});
export type GenerateTextOutput = z.infer<typeof GenerateTextOutputSchema>;

export async function generateText(
  input: GenerateTextInput
): Promise<GenerateTextOutput> {
  return generateTextFlow(input);
}

const generateTextFlow = ai.defineFlow(
  {
    name: 'generateTextFlow',
    inputSchema: GenerateTextInputSchema,
    outputSchema: GenerateTextOutputSchema,
  },
  async input => {
    try {
      const modelName = input.model || 'gemini-3.8-flash';
      const resolvedModel = modelName.includes('/') ? modelName : `googleai/${modelName}`;
      
      const {text} = await ai.generate({
        model: resolvedModel,
        prompt: input.prompt,
        system: input.systemInstruction,
        config: {
          thinkingLevel: input.thinkingLevel || 'low'
        }
      });
      
      return { text: text || '' };
    } catch (err: any) {
      console.warn('Genkit text generation failed.', err.message);
      throw err;
    }
  }
);

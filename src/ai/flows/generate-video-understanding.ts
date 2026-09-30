'use server';
/**
 * @fileOverview A flow that analyzes video content using Gemini's video understanding capabilities.
 * Supports URL-based, inline base64, and YouTube URL inputs, with agentic or static processing modes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVideoUnderstandingInputSchema = z.object({
  prompt: z.string().describe('The question or instruction about the video.'),
  model: z.string().optional().describe('The model ID to use.'),
  // Input methods (only one needed)
  videoUrl: z.string().optional().describe('A publicly accessible video URL or YouTube URL.'),
  videoBase64: z.string().optional().describe('Base64-encoded video data for inline input.'),
  videoMimeType: z.string().optional().describe('MIME type of the video, e.g. video/mp4.'),
  // Processing options
  processingMode: z.enum(['agentic', 'static']).optional().describe('Video processing mode.'),
  startOffset: z.number().optional().describe('Start offset in seconds for clipping.'),
  endOffset: z.number().optional().describe('End offset in seconds for clipping.'),
  fps: z.number().optional().describe('Custom frame sampling rate for static mode.'),
});
export type GenerateVideoUnderstandingInput = z.infer<typeof GenerateVideoUnderstandingInputSchema>;

const GenerateVideoUnderstandingOutputSchema = z.object({
  text: z.string().describe('The analysis result text.'),
});
export type GenerateVideoUnderstandingOutput = z.infer<typeof GenerateVideoUnderstandingOutputSchema>;

export async function generateVideoUnderstanding(
  input: GenerateVideoUnderstandingInput
): Promise<GenerateVideoUnderstandingOutput> {
  return generateVideoUnderstandingFlow(input);
}

const generateVideoUnderstandingFlow = ai.defineFlow(
  {
    name: 'generateVideoUnderstandingFlow',
    inputSchema: GenerateVideoUnderstandingInputSchema,
    outputSchema: GenerateVideoUnderstandingOutputSchema,
  },
  async (input) => {
    try {
      const modelName = input.model || 'gemini-3.8-flash';
      const resolvedModel = modelName.includes('/') ? modelName : `googleai/${modelName}`;

      // Build prompt parts: video first, then text (per API recommendation)
      const promptParts: any[] = [];

      if (input.videoBase64 && input.videoMimeType) {
        // Inline base64 video
        promptParts.push({
          media: {
            url: `data:${input.videoMimeType};base64,${input.videoBase64}`,
            contentType: input.videoMimeType,
          },
        });
      } else if (input.videoUrl) {
        // URL-based (File API URI, GCS URI, or YouTube URL)
        promptParts.push({
          media: { url: input.videoUrl },
        });
      }

      promptParts.push({ text: input.prompt });

      const { text } = await ai.generate({
        model: resolvedModel,
        prompt: promptParts,
        config: {
          thinkingLevel: 'minimal',
        },
      });

      return { text: text || '' };
    } catch (err: any) {
      console.warn('Genkit video understanding failed.', err.message);
      throw err;
    }
  }
);

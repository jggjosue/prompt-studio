import 'server-only';

import { GoogleGenAI } from '@google/genai';
import { GEMINI_TEXT_MODEL } from '@/lib/gemini-web-models';

const INPUT_PRICE_USD_PER_MILLION = 0.25;
const OUTPUT_PRICE_USD_PER_MILLION = 1.5;

export type GeminiTextInteractionResult = {
  output: string;
  text: string;
  output_text: string;
  interactionId: string;
  providerRequestId: string;
  model: typeof GEMINI_TEXT_MODEL;
  usage: {
    input_tokens: number | null;
    output_tokens: number | null;
    costUsd: number | null;
  };
  candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
};

function estimatedCost(inputTokens: number | null, outputTokens: number | null): number | null {
  if (inputTokens === null && outputTokens === null) return null;
  return ((inputTokens ?? 0) * INPUT_PRICE_USD_PER_MILLION + (outputTokens ?? 0) * OUTPUT_PRICE_USD_PER_MILLION) / 1_000_000;
}

export async function createGeminiTextInteraction(prompt: string, apiKey?: string): Promise<GeminiTextInteractionResult> {
  const key = apiKey?.trim() || process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || '';
  if (!key) throw new Error('No se ha configurado GEMINI_API_KEY o GOOGLE_API_KEY.');

  const ai = new GoogleGenAI({ apiKey: key });
  const interaction = await ai.interactions.create({
    model: GEMINI_TEXT_MODEL,
    input: prompt,
  });
  const text = interaction.output_text?.trim() ?? '';
  if (!text) throw new Error('Gemini terminó la interacción sin devolver texto.');

  const inputTokens = interaction.usage?.total_input_tokens ?? null;
  const outputTokens = interaction.usage?.total_output_tokens ?? null;
  return {
    output: text,
    text,
    output_text: text,
    interactionId: interaction.id,
    providerRequestId: interaction.id,
    model: GEMINI_TEXT_MODEL,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      costUsd: estimatedCost(inputTokens, outputTokens),
    },
    // Compatibility for existing editors while they migrate from generateContent.
    candidates: [{ content: { parts: [{ text }] } }],
  };
}

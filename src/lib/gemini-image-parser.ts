export type GeminiImagePart = {
  text?: string;
  inlineData?: { mimeType: string; data: string };
};

export type GeminiCandidate = {
  finishReason?: string;
  content?: { parts?: GeminiImagePart[] };
};

export type GeminiImageSuccess = {
  kind: 'IMAGE';
  imageUrl: string;
  mimeType: string;
  finishReason: string | null;
  base64Length: number;
  hasText: boolean;
};

export type GeminiImageNoImage = {
  kind: 'NO_IMAGE';
  finishReason: string | null;
  hasText: boolean;
};
export type GeminiImageResult = GeminiImageSuccess | GeminiImageNoImage;

export function parseGeminiImageResponse(data: unknown): GeminiImageResult {
  const response = data as Record<string, unknown>;
  const candidates = (response.candidates as GeminiCandidate[]) ?? [];
  const candidate = candidates[0];
  const finishReason = candidate?.finishReason ?? null;
  const parts = candidate?.content?.parts ?? [];

  const inlineDataPart = parts.find((p) => p?.inlineData?.data && p.inlineData.data.length > 0);
  if (inlineDataPart?.inlineData) {
    const { mimeType, data: base64Data } = inlineDataPart.inlineData;
    const hasText = parts.some((p) => typeof p.text === 'string' && p.text.length > 0);
    return {
      kind: 'IMAGE',
      imageUrl: `data:${mimeType};base64,${base64Data}`,
      mimeType,
      finishReason,
      base64Length: base64Data.length,
      hasText,
    };
  }

  const hasText = parts.some((p) => typeof p.text === 'string' && p.text.length > 0);
  return { kind: 'NO_IMAGE', finishReason, hasText };
}

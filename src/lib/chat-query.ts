import type { ChatMode, ChatParams } from './chat-types';

export type GenerateQueryState = {
  prompt: string;
  mode: ChatMode;
  params: ChatParams;
};

export function parseGenerateQuery(value: string | null | undefined): GenerateQueryState {
  if (!value) return { prompt: '', mode: 'image', params: {} };

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // The URLSearchParams value may already be decoded.
  }

  try {
    const source = JSON.parse(decoded) as Record<string, unknown>;
    if (!source || typeof source !== 'object') throw new Error('Not an object');
    const type = source.type === 'video' ? 'video' : source.type === 'web' ? 'project' : 'image';
    const params = source.params && typeof source.params === 'object' && !Array.isArray(source.params)
      ? source.params as ChatParams
      : {};
    return {
      prompt: typeof source.description === 'string'
        ? source.description
        : typeof source.prompt === 'string'
          ? source.prompt
          : typeof source.title === 'string' ? source.title : '',
      mode: type,
      params,
    };
  } catch {
    return { prompt: decoded, mode: 'image', params: {} };
  }
}
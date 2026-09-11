'use client';

import {
  proxyAnthropicChat,
  proxyDeepSeekChat,
  proxyGemini,
  proxyPremiumGeminiWeb,
  proxyOpenAIChat,
  proxyOpenAIImage,
  proxyOpenAIImageEdit,
  proxyRunwayPoll,
  proxyRunwayStart,
  proxyVeoVideo,
} from '@/app/actions';

const e2eMode = process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true';
let e2eOpenAIFailures = 0;

function e2eChatResponse(prompt: string) {
  if (prompt.includes('[fail-once]') && e2eOpenAIFailures++ === 0) {
    return { error: 'Temporary provider failure' };
  }
  return {
    choices: [{ message: { content: '```html\n<!doctype html><html><body><main><h1>E2E generated landing page</h1></main></body></html>\n```' } }],
  };
}

// Provider-specific response shapes stay inside this boundary. Editors depend on
// one shared registry instead of importing every server action independently.
export const generationProviders = {
  openai: {
    chat: (...args: Parameters<typeof proxyOpenAIChat>) => e2eMode ? Promise.resolve(e2eChatResponse(String(args[2]))) : proxyOpenAIChat(...args),
    image: (...args: Parameters<typeof proxyOpenAIImage>) => e2eMode ? Promise.resolve({ data: [{ url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%232563eb"/></svg>' }] }) : proxyOpenAIImage(...args),
    editImage: (...args: Parameters<typeof proxyOpenAIImageEdit>) => e2eMode ? Promise.resolve({ data: [{ url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%232563eb"/></svg>' }] }) : proxyOpenAIImageEdit(...args),
  },
  anthropic: {
    chat: (...args: Parameters<typeof proxyAnthropicChat>) => proxyAnthropicChat(...args),
  },
  google: {
    generate: (...args: Parameters<typeof proxyGemini>) => proxyGemini(...args),
    premiumWeb: (...args: Parameters<typeof proxyPremiumGeminiWeb>) => proxyPremiumGeminiWeb(...args),
    video: (...args: Parameters<typeof proxyVeoVideo>) => proxyVeoVideo(...args),
  },
  runway: {
    start: (...args: Parameters<typeof proxyRunwayStart>) => proxyRunwayStart(...args),
    poll: (...args: Parameters<typeof proxyRunwayPoll>) => proxyRunwayPoll(...args),
  },
  deepseek: {
    chat: (...args: Parameters<typeof proxyDeepSeekChat>) => proxyDeepSeekChat(...args),
  },
} as const;

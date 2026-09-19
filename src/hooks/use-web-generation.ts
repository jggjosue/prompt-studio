'use client';

import { useCallback, useState } from 'react';
import { generationProviders } from '@/lib/generation/provider-adapters';
import type { ChatParams, ChatMessageResult } from '@/lib/chat-types';


export function useWebGeneration() {
  const [webProvider, setWebProvider] = useState<'anthropic' | 'openai' | 'google'>('openai');
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [vertexKey, setVertexKey] = useState('');
  const [credits, setCredits] = useState(12.0);
  const [webFramework, setWebFramework] = useState('nextjs');
  const [webTheme, setWebTheme] = useState('glassmorphism');
  const [webComponent, setWebComponent] = useState('hero');
  const [webColor, setWebColor] = useState('blue');
  const [webModel, setWebModel] = useState('gemini-2.5-flash');
  const [outputWebHTML, setOutputWebHTML] = useState('');

  const generate = useCallback(async (prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    const provider = (params.provider || webProvider) as string;
    const creditCost = 2.0;
    if (credits < creditCost) return { error: `Sin créditos. Requiere ${creditCost}.` };

    const systemInstruction = `You are a premium web developer and designer.
Generate a fully responsive, visually stunning single-file HTML landing page utilizing Tailwind CSS.
Integrate modern design trends: smooth CSS gradients, custom Google fonts (Inter/Outfit), clean layout, card components, buttons with hover effects, micro-animations, and interactive navigation elements.
DO NOT include surrounding markdown explanation, ONLY return the full code block. Your response must begin with \`\`\`html and end with \`\`\`.
Requirements:
- Target Layout: ${params.webComponent === 'hero' ? 'Hero Header Section' : params.webComponent === 'pricing' ? 'Pricing plans grid' : params.webComponent === 'features' ? 'Features outline grid' : 'Complete Full Page Landing Layout'}
- Framework style: ${params.webFramework === 'nextjs' ? 'Next.js structure emulated' : params.webFramework === 'react' ? 'React component structure emulated' : 'HTML5 Bundle'}
- Theme: ${params.webTheme || webTheme}
- Accent palette: ${params.webColor || webColor}
- Prompt: ${prompt}`;

        let generatedHTML = '';
    let apiError = '';

    try {
      if (provider === 'anthropic' && anthropicKey) {
                const data = await generationProviders.anthropic.chat(anthropicKey, systemInstruction, systemInstruction, params.model || 'claude-3-5-sonnet-20240620');
        if (data && 'error' in data && data.error) { apiError = data.error; }
        else { generatedHTML = data.content?.[0]?.text || ''; }
      } else if (provider === 'openai' && openAIKey) {
                const data = await generationProviders.openai.chat(openAIKey, systemInstruction, systemInstruction, params.model || 'gpt-4o');
        if (data && 'error' in data && data.error) { apiError = data.error; }
        else { generatedHTML = data.choices?.[0]?.message?.content || ''; }
      } else if (provider === 'google' && vertexKey) {
                const data = await generationProviders.google.generate(vertexKey, systemInstruction, params.model || 'gemini-2.5-flash');
        if (data && 'error' in data && data.error) { apiError = data.error; }
        else { generatedHTML = data.candidates?.[0]?.content?.parts?.[0]?.text || ''; }
      }
    } catch (err: any) { apiError = err.message || 'Error contacting provider'; }

    if (apiError || !generatedHTML) return { error: apiError || 'Generación web fallida.' };
    let cleanHTML = generatedHTML.trim();
    if (cleanHTML.startsWith('```html')) cleanHTML = cleanHTML.substring(7);
    else if (cleanHTML.startsWith('```')) cleanHTML = cleanHTML.substring(3);
    if (cleanHTML.endsWith('```')) cleanHTML = cleanHTML.substring(0, cleanHTML.length - 3);
    cleanHTML = cleanHTML.trim();
    setOutputWebHTML(cleanHTML);
    setCredits(prev => Math.max(0, prev - creditCost));
    return { result: { html: cleanHTML, creditsUsed: creditCost, provider } };
  }, [webProvider, credits, openAIKey, anthropicKey, vertexKey]);

  return {
    webProvider, setWebProvider, openAIKey, setOpenAIKey, anthropicKey, setAnthropicKey,
    vertexKey, setVertexKey, credits, setCredits,
    webFramework, setWebFramework, webTheme, setWebTheme, webComponent, setWebComponent,
    webColor, setWebColor, webModel, setWebModel, outputWebHTML, setOutputWebHTML, generate,
  };
}

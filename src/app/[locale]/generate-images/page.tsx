import type { Metadata } from 'next';
import { Suspense } from 'react';
import PromptEditorClient from './prompt-editor-client';

export const metadata: Metadata = {
  title: 'Create AI Images & Videos | Prompt Studio',
  description: 'Create and discover stunning AI videos & images. Explore thousands of prompts, get inspired, and generate professional-quality content.',
  alternates: {
    canonical: '/generate-images',
  },
  keywords: [
    'Chatgpt',
    'chatgpt go bbva',
    'how to use chatgpt effectively',
    'chatgpt health',
    'chatgpt search',
    'chatgpt go',
    'AI Prompts',
    'Video Prompts',
    'Image Prompts',
    'AI Video Generator',
    'AI Image Generator',
    'chatgpt 5.2',
    'chatgpt christmas photo',
    'chatgpt 5.1',
    'chatgpt wrapped',
    'chatgpt adult mode',
    'how to cancel chatgpt plus subscription',
    'challenges cloudflare chatgpt',
    'chatgpt news',
    'notebooklm',
    'grok ai',
    'banana pro',
    'nano banana pro',
    'prompts',
    'chat gpt prompts for christmas pictures',
    'voice mail prompts',
    'christmas ai photo prompts',
    'darlink ai',
    'voicemail prompts crossword',
    'best grok spicy prompts',
    'grok prompts for images',
    'daily writing prompts',
    'awesome chatgpt prompts',
  ],
};

export default function PromptEditorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PromptEditorClient />
        </Suspense>
    )
}

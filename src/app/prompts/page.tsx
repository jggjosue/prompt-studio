import type { Metadata } from 'next';
import PromptsClient from './prompts-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Prompts Library | Prompt Studio',
  description: 'Explore our complete library of AI image and video prompts. Get inspired by thousands of community-crafted examples.',
  keywords: [
    'AI Prompts',
    'Image Prompts',
    'Video Prompts',
    'AI Art',
    'Prompt Engineering',
    'Stable Diffusion Prompts',
    'Midjourney Prompts',
  ],
};

export default function PromptsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <PromptsClient />
    </Suspense>
  );
}

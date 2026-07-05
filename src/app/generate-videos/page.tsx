import type { Metadata } from 'next';
import { Suspense } from 'react';
import GenerateVideosClient from './generate-videos-client';

export const metadata: Metadata = {
  title: 'AI Video Editor & Workspace | Prompt Studio',
  description: 'Create and refine AI video prompts. Send your prompts directly to AI models for analysis and optimization.',
  alternates: {
    canonical: '/generate-videos',
  },
};

export default function PromptEditorPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <GenerateVideosClient />
    </Suspense>
  );
}

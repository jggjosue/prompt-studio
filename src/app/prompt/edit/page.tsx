import type { Metadata } from 'next';
import { Suspense } from 'react';
import PromptEditorClient from './prompt-editor-client';

export const metadata: Metadata = {
  title: 'Create AI Images & Videos | Prompt Studio',
  description: 'Create and discover stunning AI videos & images. Explore thousands of prompts, get inspired, and generate professional-quality content.',
};

export default function PromptEditorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PromptEditorClient />
        </Suspense>
    )
}

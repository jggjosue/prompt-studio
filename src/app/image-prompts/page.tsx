import type { Metadata } from 'next';
import ImagePromptsClient from './image-prompts-client';

export const metadata: Metadata = {
  title: 'AI Image Prompts | Prompt Studio',
  description: 'Discover thousands of AI image prompts and examples. Get inspired and create your own AI generated images.',
};

export default function ImagePromptsPage() {
  return <ImagePromptsClient />;
}

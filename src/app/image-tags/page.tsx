import type { Metadata } from 'next';
import ImageTagsClient from './image-tags-client';

export const metadata: Metadata = {
  title: 'Image Prompts by Tags | Prompt Studio',
  description:
    'Explore AI-generated images organized by unique tags across visual styles, subjects, and more.',
  alternates: {
    canonical: '/image-tags',
  },
  keywords: [
    'AI Prompts',
    'Image Prompts',
    'Image Tags',
    'Visual Styles',
    'AI Image Generator',
  ],
};

export default function ImageTagsPage() {
  return <ImageTagsClient />;
}

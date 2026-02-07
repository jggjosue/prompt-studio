import type { Metadata } from 'next';
import VideoTagsClient from './video-tags-client';

export const metadata: Metadata = {
  title: 'Video Prompts by Tags | Prompt Studio',
  description:
    'Explore AI-generated videos organized by unique tags across visual styles, subjects, and more.',
  keywords: [
    'AI Prompts',
    'Video Prompts',
    'Video Tags',
    'Visual Styles',
    'AI Video Generator',
  ],
};

export default function VideoTagsPage() {
  return <VideoTagsClient />;
}

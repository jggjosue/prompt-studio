import type { Metadata } from 'next';
import VideoPromptsClient from './video-prompts-client';

export const metadata: Metadata = {
  title: 'AI Video Prompts | Prompt Studio',
  description: 'Discover thousands of AI video prompts and examples. Get inspired and create your own AI generated videos.',
};

export default function VideoPromptsPage() {
  return <VideoPromptsClient />;
}

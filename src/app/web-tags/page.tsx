import type { Metadata } from 'next';
import WebTagsClient from './web-tags-client';

export const metadata: Metadata = {
  title: 'Web Prompts by Tags | Prompt Studio',
  description:
    'Explore landing page prompts and HTML demos organized by tags, tech stack, and membership.',
  keywords: [
    'AI Prompts',
    'Landing Page',
    'Web Tags',
    'HTML',
    'SaaS',
    'Website Prompts',
  ],
};

export default function WebTagsPage() {
  return <WebTagsClient />;
}

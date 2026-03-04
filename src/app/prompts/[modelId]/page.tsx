import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import ModelDetailClient from './model-detail-client';
import { promptModels } from '../prompts-client';

type Props = {
  params: { modelId: string }
}

function findModelName(slug: string) {
  return promptModels.find(m => m.toLowerCase().replace(/\s+/g, '-') === slug);
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const modelName = findModelName(params.modelId);

  if (!modelName) {
    return {
      title: 'Model Not Found | Prompt Studio',
    }
  }

  return {
    title: `${modelName} AI Prompts | Prompt Studio`,
    description: `Explore curated AI prompts and examples for ${modelName}. Get inspired and create amazing content with ${modelName} models.`,
  }
}

export default function ModelDetailPage({ params }: Props) {
    const modelName = findModelName(params.modelId);

    if (!modelName) {
        notFound();
    }

    return <ModelDetailClient modelName={modelName} />;
}


import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import ModelDetailClient from './model-detail-client';
import { promptModels } from '@/lib/models-list';
import fs from 'fs';
import path from 'path';

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

    // El archivo YAML solo es para el modelo Amp por ahora
    let specialPrompt = '';
    if (params.modelId === 'amp') {
      try {
        const yamlPath = path.join(process.cwd(), 'src/lib/amp.yaml');
        if (fs.existsSync(yamlPath)) {
          specialPrompt = fs.readFileSync(yamlPath, 'utf8');
        }
      } catch (error) {
        console.error('Error reading amp.yaml:', error);
      }
    }

    let jsonPrompts = [];
    try {
      const jsonPath = path.join(process.cwd(), `src/lib/prompts/${params.modelId}.json`);
      if (fs.existsSync(jsonPath)) {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        jsonPrompts = jsonData[params.modelId] || [];
      }
    } catch (error) {
      console.error(`Error reading ${params.modelId}.json:`, error);
    }

    return (
      <ModelDetailClient 
        modelName={modelName} 
        specialPrompt={specialPrompt} 
        jsonPrompts={jsonPrompts}
      />
    );
}

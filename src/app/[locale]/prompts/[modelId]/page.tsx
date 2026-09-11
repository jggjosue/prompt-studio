
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import ModelDetailClient from './model-detail-client';
import { promptModels } from '@/lib/models-list';
import {
  chromeToolsToPromptBlocks,
  localizePromptBlocks,
  type RawPromptBlock,
} from '@/lib/prompt-catalog';
import { readCachedUtf8File } from '@/lib/cached-fs';
import { getClaudeChromeData, getModelPromptData } from '@/data/model-prompts';
import fs from 'fs';
import path from 'path';

type Props = {
  params: Promise<{ modelId: string }>
}

function findModelName(slug: string) {
  return promptModels.find(m => m.toLowerCase().replace(/\s+/g, '-') === slug);
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const modelName = findModelName(params.modelId);

  if (!modelName) {
    return {
      title: 'Model Not Found | Prompt Studio',
    }
  }

  return {
    title: `${modelName} AI Prompts | Prompt Studio`,
    description: `Explore curated AI prompts and examples for ${modelName}. Get inspired and create amazing content with ${modelName} models.`,
    alternates: {
      canonical: `/prompts/${params.modelId}`,
    },
  }
}

export default async function ModelDetailPage(props: Props) {
    const params = await props.params;
    const locale = await getLocale();
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

    let jsonPrompts: any[] = [];
    
    // Caso especial para Anthropic: combinar protocolos generales con herramientas de Chrome
    if (params.modelId === 'anthropic') {
      try {
        const anthropicData = getModelPromptData('anthropic') as
          | { anthropic?: RawPromptBlock[] }
          | null;
        if (anthropicData) {
          jsonPrompts = localizePromptBlocks(anthropicData.anthropic ?? [], locale);
        }

        jsonPrompts = [
          ...jsonPrompts,
          ...chromeToolsToPromptBlocks(getClaudeChromeData(), locale),
        ];
      } catch (error) {
        console.error('Error merging Anthropic JSONs:', error);
      }
    } else {
      try {
        const jsonData = getModelPromptData(params.modelId) as
          | Record<string, RawPromptBlock[]>
          | null;
        if (jsonData) {
          jsonPrompts = localizePromptBlocks(jsonData[params.modelId] ?? [], locale);
        }
      } catch (error) {
        console.error(`Error reading prompts for ${params.modelId}:`, error);
      }
    }

    return (
      <ModelDetailClient 
        modelName={modelName} 
        specialPrompt={specialPrompt} 
        jsonPrompts={jsonPrompts}
      />
    );
}

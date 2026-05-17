
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

export default async function ModelDetailPage({ params }: Props) {
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

    let jsonPrompts = [];
    
    // Caso especial para Anthropic: combinar protocolos generales con herramientas de Chrome
    if (params.modelId === 'anthropic') {
      try {
        const anthropicPath = path.join(process.cwd(), 'public/prompts/anthropic.json');
        const chromePath = path.join(process.cwd(), 'public/prompts/claude-chrome.json');
        
        if (fs.existsSync(anthropicPath)) {
          const anthropicData = JSON.parse(fs.readFileSync(anthropicPath, 'utf8'));
          jsonPrompts = localizePromptBlocks(
            (anthropicData.anthropic || []) as RawPromptBlock[],
            locale
          );
        }
        
        if (fs.existsSync(chromePath)) {
          const chromeData = JSON.parse(fs.readFileSync(chromePath, 'utf8'));
          jsonPrompts = [
            ...jsonPrompts,
            ...chromeToolsToPromptBlocks(chromeData, locale),
          ];
        }
      } catch (error) {
        console.error('Error merging Anthropic JSONs:', error);
      }
    } else {
      // Lógica estándar para otros modelos
      try {
        const jsonPath = path.join(process.cwd(), `public/prompts/${params.modelId}.json`);
        if (fs.existsSync(jsonPath)) {
          const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          jsonPrompts = localizePromptBlocks(
            (jsonData[params.modelId] || []) as RawPromptBlock[],
            locale
          );
        }
      } catch (error) {
        console.error(`Error reading ${params.modelId}.json:`, error);
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

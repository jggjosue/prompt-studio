
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
    
    // Caso especial para Anthropic: combinar protocolos generales con herramientas de Chrome
    if (params.modelId === 'anthropic') {
      try {
        const anthropicPath = path.join(process.cwd(), 'src/lib/prompts/anthropic.json');
        const chromePath = path.join(process.cwd(), 'src/lib/prompts/claude-chrome.json');
        
        if (fs.existsSync(anthropicPath)) {
          const anthropicData = JSON.parse(fs.readFileSync(anthropicPath, 'utf8'));
          jsonPrompts = [...(anthropicData.anthropic || [])];
        }
        
        if (fs.existsSync(chromePath)) {
          const chromeData = JSON.parse(fs.readFileSync(chromePath, 'utf8'));
          const chromePrompts = chromeData.map((tool: any) => ({
            title: tool.name === 'computer' ? 'Computer Use' : tool.name.charAt(0).toUpperCase() + tool.name.slice(1),
            description: tool.description,
            how_to_use_prompt: `Low-level automation tool for browser control. Integrated into the ${tool.name} protocol.`,
            // Podríamos incluir el esquema como ejemplo técnico si quisiéramos
          }));
          jsonPrompts = [...jsonPrompts, ...chromePrompts];
        }
      } catch (error) {
        console.error('Error merging Anthropic JSONs:', error);
      }
    } else {
      // Lógica estándar para otros modelos
      try {
        const jsonPath = path.join(process.cwd(), `src/lib/prompts/${params.modelId}.json`);
        if (fs.existsSync(jsonPath)) {
          const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          jsonPrompts = jsonData[params.modelId] || [];
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

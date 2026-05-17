import type { Locale } from '@/i18n/config';
import { pickLocalized, type LocalizedField } from '@/lib/localized-string';

export type PromptExample = {
  step?: number;
  action?: LocalizedField;
  user?: string;
  response?: string;
};

export type RawPromptBlock = {
  title: LocalizedField;
  description: LocalizedField;
  how_to_use_prompt?: LocalizedField;
  examples?: PromptExample[];
};

export type PromptBlock = {
  title: string;
  description: string;
  how_to_use_prompt?: string;
  examples?: Array<{
    step?: number;
    action?: string;
    user?: string;
    response?: string;
  }>;
};

export function localizePromptBlocks(
  blocks: RawPromptBlock[],
  locale: Locale | string
): PromptBlock[] {
  return blocks.map(block => ({
    title: pickLocalized(block.title, locale),
    description: pickLocalized(block.description, locale),
    how_to_use_prompt: block.how_to_use_prompt
      ? pickLocalized(block.how_to_use_prompt, locale)
      : undefined,
    examples: block.examples?.map(ex => ({
      ...ex,
      action: ex.action ? pickLocalized(ex.action, locale) : undefined,
    })),
  }));
}

export type ChromeToolRaw = {
  name: string;
  description: LocalizedField;
  displayTitle?: LocalizedField;
  input_schema?: unknown;
};

export function chromeToolsToPromptBlocks(
  tools: ChromeToolRaw[],
  locale: Locale | string
): PromptBlock[] {
  return tools.map(tool => {
    const displayTitle =
      tool.displayTitle != null
        ? pickLocalized(tool.displayTitle, locale)
        : tool.name === 'computer'
          ? locale === 'es'
            ? 'Uso del ordenador'
            : 'Computer Use'
          : tool.name.charAt(0).toUpperCase() + tool.name.slice(1);

    return {
      title: displayTitle,
      description: pickLocalized(tool.description, locale),
      how_to_use_prompt:
        locale === 'es'
          ? `Herramienta de automatización de bajo nivel para control del navegador. Integrada en el protocolo ${tool.name}.`
          : `Low-level automation tool for browser control. Integrated into the ${tool.name} protocol.`,
    };
  });
}

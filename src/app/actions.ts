
'use server';

import { generateImageVideoPrompt } from '@/ai/flows/generate-image-video-prompts';
import { generateImage } from '@/ai/flows/generate-image';
import { z } from 'zod';

const promptSchema = z.object({
  keywords: z.string().min(3, 'Keywords must be at least 3 characters long.'),
});

export type PromptGenerationFormState = {
  message: string;
  prompt?: string;
  issues?: string[];
};

export async function handlePromptGeneration(
  prevState: PromptGenerationFormState,
  formData: FormData
): Promise<PromptGenerationFormState> {
  const keywords = formData.get('keywords');

  const validatedFields = promptSchema.safeParse({ keywords });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      issues: validatedFields.error.flatten().fieldErrors.keywords,
    };
  }

  try {
    const result = await generateImageVideoPrompt({
      keywords: validatedFields.data.keywords,
    });
    if (result.prompt) {
      return { message: 'success', prompt: result.prompt };
    } else {
      return { message: 'Failed to generate prompt. Please try again.' };
    }
  } catch (error) {
    console.error(error);
    return { message: 'An unexpected error occurred.' };
  }
}

const imagePromptSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty.'),
});

export type ImageGenerationFormState = {
  message: string;
  imageUrl?: string;
  issues?: string[];
};

export async function handleImageGeneration(
  prevState: ImageGenerationFormState,
  formData: FormData
): Promise<ImageGenerationFormState> {
  const prompt = formData.get('prompt');

  const validatedFields = imagePromptSchema.safeParse({ prompt });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      issues: validatedFields.error.flatten().fieldErrors.prompt,
    };
  }

  try {
    const result = await generateImage({
      prompt: validatedFields.data.prompt,
    });
    if (result.imageUrl) {
      return { message: 'success', imageUrl: result.imageUrl };
    } else {
      return { message: 'Failed to generate image. Please try again.' };
    }
  } catch (error) {
    console.error(error);
    return { message: 'An unexpected error occurred during image generation.' };
  }
}

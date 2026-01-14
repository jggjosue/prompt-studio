
'use server';

import { generateImageVideoPrompt } from '@/ai/flows/generate-image-video-prompts';
import { z } from 'zod';

const promptSchema = z.object({
  keywords: z.string().min(3, 'Keywords must be at least 3 characters long.'),
});

export type FormState = {
  message: string;
  prompt?: string;
  issues?: string[];
};

export async function handlePromptGeneration(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
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


'use server';

import { isPremiumJoAdmin } from '@/lib/admin-auth';
import { isGeminiWebModel } from '@/lib/gemini-web-models';
import { reportOperationalError } from '@/lib/observability-server';
import { auth } from '@clerk/nextjs/server';
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
    const { generateImageVideoPrompt } = await import('@/ai/flows/generate-image-video-prompts');
    const result = await generateImageVideoPrompt({
      keywords: validatedFields.data.keywords,
    });
    if (result.prompt) {
      return { message: 'success', prompt: result.prompt };
    } else {
      return { message: 'Failed to generate prompt. Please try again.' };
    }
  } catch (error) {
    reportOperationalError({ category: 'ai_generation', name: 'prompt_generation', route: 'server-action', metadata: { provider: 'genkit', operation: 'generate_prompt' } }, error);
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
    const { generateImage } = await import('@/ai/flows/generate-image');
    const result = await generateImage({
      prompt: validatedFields.data.prompt,
    });
    if (result.imageUrl) {
      return { message: 'success', imageUrl: result.imageUrl };
    } else {
      return { message: 'Failed to generate image. Please try again.' };
    }
  } catch (error) {
    reportOperationalError({ category: 'ai_generation', name: 'image_generation', route: 'server-action', metadata: { provider: 'genkit', operation: 'generate_image' } }, error);
    return { message: 'An unexpected error occurred during image generation.' };
  }
}

// --- PROXY API ENDPOINTS (Bypassing CORS) ---

function configuredKey(key: string, envName: 'OPENAI_API_KEY' | 'GEMINI_API_KEY'): string {
  return key || process.env[envName] || '';
}

export async function proxyOpenAIImage(apiKey: string, prompt: string, model: string = 'dall-e-3', size: string = '1024x1024') {
  apiKey = configuredKey(apiKey, 'OPENAI_API_KEY');
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        n: 1,
        size
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { error: errData.error?.message || `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (err: any) {
    return { error: err.message || 'Network error contacting OpenAI' };
  }
}

export async function proxyOpenAIImageEdit(apiKey: string, prompt: string, imageDataUrl: string, model: string = 'gpt-image-1-mini', size: string = '1024x1024') {
  apiKey = configuredKey(apiKey, 'OPENAI_API_KEY');
  try {
    const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(imageDataUrl);
    if (!match) return { error: 'Invalid reference image.' };
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > 4 * 1024 * 1024) return { error: 'Reference image exceeds 4 MB.' };
    const form = new FormData();
    form.set('model', model.startsWith('gpt-image') ? model : 'gpt-image-1-mini');
    form.set('prompt', prompt);
    form.set('size', size);
    form.set('image', new Blob([Uint8Array.from(bytes)], { type: match[1] }), `reference.${match[1] === 'image/png' ? 'png' : 'jpg'}`);
    const response = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { error: error.error?.message || `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (error: any) {
    return { error: error.message || 'Network error contacting OpenAI' };
  }
}

export async function proxyOpenAIChat(apiKey: string, systemPrompt: string, userPrompt: string, model: string = 'gpt-4o') {
  apiKey = configuredKey(apiKey, 'OPENAI_API_KEY');
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { error: errData.error?.message || `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (err: any) {
    return { error: err.message || 'Network error contacting OpenAI' };
  }
}

export async function proxyDeepSeekChat(apiKey: string, systemPrompt: string, userPrompt: string, model: string = 'deepseek-coder') {
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { error: errData.error?.message || `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (err: any) {
    return { error: err.message || 'Network error contacting DeepSeek' };
  }
}

export async function proxyAnthropicChat(apiKey: string, systemPrompt: string, userPrompt: string, model: string = 'claude-3-5-sonnet-20240620') {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { error: errData.error?.message || `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (err: any) {
    return { error: err.message || 'Network error contacting Anthropic' };
  }
}

export async function proxyRunwayStart(apiKey: string, prompt: string, duration: number) {
  try {
    const response = await fetch('https://api.runwayml.com/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        taskType: 'text_to_video',
        prompt: prompt,
        duration: duration || 4,
        aspectRatio: '16:9'
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { error: errData.message || `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (err: any) {
    return { error: err.message || 'Network error contacting Runway' };
  }
}

export async function proxyRunwayPoll(apiKey: string, taskId: string) {
  try {
    const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06'
      }
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { error: errData.message || `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (err: any) {
    return { error: err.message || 'Network error polling Runway' };
  }
}


import crypto from 'crypto';

async function getAccessTokenFromServiceAccount(serviceAccountJsonStr: string) {
  const sa = JSON.parse(serviceAccountJsonStr);
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform'
  };

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const base64UrlEncode = (obj: any) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const jwtHeader = base64UrlEncode(header);
  const jwtPayload = base64UrlEncode(payload);
  const tokenInput = `${jwtHeader}.${jwtPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(tokenInput);
  signer.end();
  
  const signature = signer.sign(sa.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${tokenInput}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to generate Google OAuth token: ${err.error_description || response.statusText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token as string,
    projectId: sa.project_id as string
  };
}

function findVideoInResponse(obj: any): string | null {
  if (!obj) return null;
  if (typeof obj === 'string') {
    if (obj.startsWith('data:video') || obj.startsWith('http') || (obj.length > 1000 && !obj.includes(' '))) {
      return obj;
    }
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (key === 'bytesBase64Encoded' || key === 'videoBytes' || key === 'videoUri' || key === 'gcsUri') {
        if (typeof val === 'string') return val;
      }
      const found = findVideoInResponse(val);
      if (found) return found;
    }
  }
  return null;
}

export async function proxyVeoVideo(apiKey: string, prompt: string, durationSeconds: number, model: string = 'veo-2.0-generate-001') {
  apiKey = configuredKey(apiKey, 'GEMINI_API_KEY');
  try {
    let accessToken = apiKey.trim();
    let projectId = '';
    
    if (accessToken.startsWith('{')) {
      const saInfo = await getAccessTokenFromServiceAccount(accessToken);
      accessToken = saInfo.accessToken;
      projectId = saInfo.projectId;
    } else {
      return { error: 'Google Veo requires a Vertex AI service account key JSON structure.' };
    }

    if (!projectId) {
      projectId = process.env.GOOGLE_CLOUD_PROJECT || 'prompt-studio';
    }

    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predictLongRunning`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt
          }
        ],
        parameters: {
          durationSeconds: durationSeconds
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { error: `Vertex AI Request Failed: ${errText || response.statusText}` };
    }

    const operation = await response.json();
    const operationName = operation.name;
    if (!operationName) {
      return { error: 'No operation name returned from Vertex AI' };
    }

    // Poll the operation
    let completed = false;
    let attempts = 0;
    const operationUrl = `https://us-central1-aiplatform.googleapis.com/v1/${operationName}`;
    
    while (!completed && attempts < 15) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const pollResponse = await fetch(operationUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!pollResponse.ok) {
        return { error: `Polling operation failed: ${pollResponse.statusText}` };
      }
      
      const opResult = await pollResponse.json();
      if (opResult.done) {
        completed = true;
        if (opResult.error) {
          return { error: opResult.error.message || 'Vertex AI operation failed' };
        }
        const videoUri = findVideoInResponse(opResult.response);
        if (videoUri) {
          return { videoUri };
        } else {
          return { error: 'No video URI or bytes found in completed operation response' };
        }
      }
    }

    return { error: 'Timeout waiting for Google Veo generation.' };
  } catch (err: any) {
    return { error: err.message || 'An error occurred during Vertex AI request.' };
  }
}

export async function proxyGemini(apiKey: string, prompt: string, model: string = 'gemini-2.5-flash') {
  apiKey = configuredKey(apiKey, 'GEMINI_API_KEY');
  try {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!key) {
      return { error: 'No Gemini API Key configured on platform or provided.' };
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { error: errData.error?.message || `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (err: any) {
    return { error: err.message || 'Network error contacting Gemini API' };
  }
}

/** Gemini administrado por Prompt Studio para el generador web Premium. */
export async function proxyPremiumGeminiWeb(prompt: string, model: string = 'gemini-2.5-flash') {
  const { userId } = await auth();
  if (!userId) return { error: 'Inicia sesión para generar páginas web.' };
  if (!(await isPremiumJoAdmin())) {
    return { error: 'La generación de páginas web está disponible únicamente para el superadministrador.' };
  }
  if (!isGeminiWebModel(model)) return { error: 'Modelo Gemini no compatible.' };
  const cleanPrompt = prompt.trim().slice(0, 20_000);
  if (!cleanPrompt) return { error: 'El prompt está vacío.' };
  // No se acepta una clave del cliente: proxyGemini utiliza GEMINI_API_KEY o
  // GOOGLE_API_KEY del entorno del servidor.
  return proxyGemini('', cleanPrompt, model);
}

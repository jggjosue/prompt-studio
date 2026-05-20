
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

// --- PROXY API ENDPOINTS (Bypassing CORS) ---

export async function proxyOpenAIImage(apiKey: string, prompt: string, model: string = 'dall-e-3') {
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
        size: '1024x1024'
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

export async function proxyOpenAIChat(apiKey: string, systemPrompt: string, userPrompt: string, model: string = 'gpt-4o') {
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

export async function proxyGemini(apiKey: string, prompt: string, model: string = 'gemini-1.5-flash') {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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

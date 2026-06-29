const LOOPS_API_BASE = 'https://app.loops.so/api/v1';

type LoopsContactPayload = {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  subscribed?: boolean;
  userGroup?: string;
  userId?: string;
  [key: string]: unknown;
};

type LoopsEventPayload = {
  email?: string;
  userId?: string;
  eventName: string;
  eventProperties?: Record<string, unknown>;
  mailingLists?: Record<string, boolean>;
  [key: string]: unknown;
};

function getLoopsApiKey(): string {
  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing LOOPS_API_KEY environment variable');
  }
  return apiKey;
}

async function loopsRequest<T>(
  path: string,
  body: Record<string, unknown>,
  options?: { method?: 'POST' | 'PUT'; idempotencyKey?: string }
): Promise<T> {
  const response = await fetch(`${LOOPS_API_BASE}${path}`, {
    method: options?.method ?? 'POST',
    headers: {
      Authorization: `Bearer ${getLoopsApiKey()}`,
      'Content-Type': 'application/json',
      ...(options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`Loops API error (${response.status}): ${message || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function upsertLoopsContact(contact: LoopsContactPayload) {
  return loopsRequest<{ success: boolean; id: string }>('/contacts/update', contact, { method: 'PUT' });
}

export async function sendLoopsEvent(event: LoopsEventPayload, idempotencyKey?: string) {
  return loopsRequest<{ success: boolean }>('/events/send', event, {
    method: 'POST',
    idempotencyKey,
  });
}

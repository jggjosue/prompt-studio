import { isAIJobKind } from '@/lib/ai-job-config';
import connectToDatabase from '@/lib/mongoose';
import {
  GENERATION_TRAINING_EVENTS,
  recordGenerationTrainingEvent,
  type GenerationTrainingEventName,
} from '@/lib/generation-training-events';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { resolveAuthoritativeTrainingConsent } from '@/lib/training-consent';

const MAX_PAYLOAD_BYTES = 12_000;
const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function isEventName(value: unknown): value is GenerationTrainingEventName {
  return typeof value === 'string' &&
    (GENERATION_TRAINING_EVENTS as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!raw || !isEventName(raw.eventName)) {
    return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 });
  }

  // This endpoint intentionally rejects prompt content and arbitrary large payloads.
  // prompt_submitted stores lifecycle metadata only; the canonical prompt is already
  // persisted with the generation job and will be gated by consent before training.
  if ('prompt' in raw || 'text' in raw || 'content' in raw) {
    return NextResponse.json({ error: 'No envíes contenido del prompt a telemetría.' }, { status: 400 });
  }
  if (JSON.stringify(raw).length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'Evento demasiado grande.' }, { status: 413 });
  }

  const modality = isAIJobKind(raw.modality) ? raw.modality : null;
  const payload = raw.payload && typeof raw.payload === 'object' && !Array.isArray(raw.payload)
    ? raw.payload as Record<string, unknown>
    : {};

  await connectToDatabase();
  const consent = await resolveAuthoritativeTrainingConsent(userId);
  await recordGenerationTrainingEvent({
    eventName: raw.eventName,
    userId,
    jobId: clean(raw.jobId, 160) || null,
    sessionId: clean(raw.sessionId, 160) || null,
    requestId: clean(raw.requestId, 160) || null,
    outputId: clean(raw.outputId, 160) || null,
    modality,
    provider: clean(raw.provider, 120) || null,
    modelId: clean(raw.modelId, 160) || null,
    correlationId: clean(raw.correlationId, 120) || null,
    clientEventId: clean(raw.clientEventId, 160) || null,
    parameters: raw.parameters && typeof raw.parameters === 'object' && !Array.isArray(raw.parameters)
      ? raw.parameters as Record<string, unknown>
      : {},
    payload,
    consent,
  });

  return NextResponse.json({ accepted: true }, { status: 202 });
}

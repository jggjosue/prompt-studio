import 'server-only';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { buildPreferenceExample, serializePreferenceJsonl, type PreferenceExampleV1, type PreferenceSignalType } from '@/lib/datasets/preference';

async function bodyText(body: any) {
  if (typeof body?.transformToString === 'function') return body.transformToString();
  const chunks: Uint8Array[] = [];
  for await (const chunk of body ?? []) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString('utf8');
}

function candidate(value: any) {
  if (!value?.outputId) return null;
  return {
    outputId: String(value.outputId),
    contentRef: typeof value.contentRef === 'string' ? value.contentRef : null,
    modelId: typeof value.modelId === 'string' ? value.modelId : null,
  };
}

export async function collectPreferenceExamples(input: { client: S3Client; bucket: string; prefix?: string }) {
  const prefix = input.prefix ?? 'processed/preference/';
  const examples: PreferenceExampleV1[] = [];
  let continuationToken: string | undefined;
  do {
    const page = await input.client.send(new ListObjectsV2Command({ Bucket: input.bucket, Prefix: prefix, ContinuationToken: continuationToken }));
    for (const object of page.Contents ?? []) {
      if (!object.Key?.endsWith('.json')) continue;
      const response = await input.client.send(new GetObjectCommand({ Bucket: input.bucket, Key: object.Key }));
      const parsed = JSON.parse(await bodyText(response.Body)) as any;
      if (!parsed.quality?.passes) continue;
      const chosen = candidate(parsed.payload?.chosen);
      const rejected = candidate(parsed.payload?.rejected);
      const signalType = parsed.payload?.preferenceSignal as PreferenceSignalType;
      if (!chosen || !rejected) continue;
      const example = buildPreferenceExample({
        requestId: parsed.requestId ?? parsed.payload?.requestId ?? '',
        context: parsed.payload?.context ?? parsed.payload?.promptContext ?? '',
        chosen,
        rejected,
        signalType,
        eventIds: Array.isArray(parsed.payload?.eventIds) ? parsed.payload.eventIds.filter((x: unknown) => typeof x === 'string') : [],
        sourceRecordIds: [parsed.recordId, ...(Array.isArray(parsed.provenance?.parentIds) ? parsed.provenance.parentIds : [])].filter(Boolean),
        occurredAt: parsed.occurredAt,
      });
      if (example) examples.push(example);
    }
    continuationToken = page.NextContinuationToken;
  } while (continuationToken);
  examples.sort((a, b) => a.exampleId.localeCompare(b.exampleId));
  const unique = [...new Map(examples.map((example) => [example.exampleId, example])).values()];
  return { examples: unique, jsonl: serializePreferenceJsonl(unique) };
}

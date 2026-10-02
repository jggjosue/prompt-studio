import 'server-only';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { buildPromptEnhancementExample, serializePromptEnhancementJsonl, type PromptEnhancementExampleV1 } from '@/lib/datasets/prompt-enhancement';

async function bodyText(body: any) {
  if (typeof body?.transformToString === 'function') return body.transformToString();
  const chunks: Uint8Array[] = [];
  for await (const chunk of body ?? []) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export async function collectPromptEnhancementExamples(input: {
  client: S3Client;
  bucket: string;
  prefix?: string;
}) {
  const prefix = input.prefix ?? 'processed/prompt-enhancement/';
  const examples: PromptEnhancementExampleV1[] = [];
  let continuationToken: string | undefined;
  do {
    const page = await input.client.send(new ListObjectsV2Command({
      Bucket: input.bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    for (const object of page.Contents ?? []) {
      if (!object.Key?.endsWith('.json')) continue;
      const response = await input.client.send(new GetObjectCommand({ Bucket: input.bucket, Key: object.Key }));
      const parsed = JSON.parse(await bodyText(response.Body)) as any;
      const example = buildPromptEnhancementExample({
        recordId: parsed.recordId,
        requestId: parsed.requestId ?? null,
        outputId: parsed.outputId ?? null,
        modality: parsed.modality ?? null,
        occurredAt: parsed.occurredAt,
        payload: parsed.payload ?? {},
        quality: parsed.quality,
      });
      if (example) examples.push(example);
    }
    continuationToken = page.NextContinuationToken;
  } while (continuationToken);
  examples.sort((a, b) => a.exampleId.localeCompare(b.exampleId));
  const unique = [...new Map(examples.map((example) => [example.exampleId, example])).values()];
  return { examples: unique, jsonl: serializePromptEnhancementJsonl(unique) };
}

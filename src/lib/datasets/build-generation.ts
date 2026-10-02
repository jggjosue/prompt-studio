import 'server-only';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { buildGenerationDatasetExample, serializeGenerationJsonl, type GenerationDatasetExampleV1, type GenerationDatasetModality } from '@/lib/datasets/generation';

async function bodyText(body: any) {
  if (typeof body?.transformToString === 'function') return body.transformToString();
  const chunks: Uint8Array[] = [];
  for await (const chunk of body ?? []) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export async function collectGenerationExamples(input: {
  client: S3Client;
  bucket: string;
  modality: GenerationDatasetModality;
}) {
  const prefix = `processed/${input.modality}-generation/`;
  const examples: GenerationDatasetExampleV1[] = [];
  let continuationToken: string | undefined;
  do {
    const page = await input.client.send(new ListObjectsV2Command({ Bucket: input.bucket, Prefix: prefix, ContinuationToken: continuationToken }));
    for (const object of page.Contents ?? []) {
      if (!object.Key?.endsWith('.json')) continue;
      const response = await input.client.send(new GetObjectCommand({ Bucket: input.bucket, Key: object.Key }));
      const parsed = JSON.parse(await bodyText(response.Body)) as any;
      if (parsed.modality !== input.modality) continue;
      const assets = Array.isArray(parsed.assets)
        ? parsed.assets.filter((asset: any) => asset?.provider === 'cloudflare-r2')
        : [];
      const example = buildGenerationDatasetExample({
        modality: input.modality,
        recordId: parsed.recordId,
        requestId: parsed.requestId ?? null,
        outputId: parsed.outputId ?? null,
        occurredAt: parsed.occurredAt,
        payload: parsed.payload ?? {},
        model: parsed.model ?? null,
        parameters: parsed.parameters ?? {},
        assets,
        quality: parsed.quality,
      });
      if (example) examples.push(example);
    }
    continuationToken = page.NextContinuationToken;
  } while (continuationToken);
  examples.sort((a, b) => a.exampleId.localeCompare(b.exampleId));
  const unique = [...new Map(examples.map((example) => [example.exampleId, example])).values()];
  return { examples: unique, jsonl: serializeGenerationJsonl(unique) };
}

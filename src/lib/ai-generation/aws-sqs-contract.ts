export const AWS_SQS_GENERATION_MESSAGE_VERSION = 1 as const;

export const AWS_SQS_GENERATION_WORKLOADS = [
  "image",
  "video",
  "web",
] as const;

export type AwsSqsGenerationWorkload =
  (typeof AWS_SQS_GENERATION_WORKLOADS)[number];

export type AwsSqsGenerationMessage = {
  version: typeof AWS_SQS_GENERATION_MESSAGE_VERSION;
  generationId: string;
  workload: AwsSqsGenerationWorkload;
  enqueuedAt: string;
};

/**
 * SQS is transport only. MongoDB's canonical GenerationJob remains the source
 * of truth; never copy prompts, credentials, provider payloads, or user data
 * into the queue message.
 */
export function createAwsSqsGenerationMessage(input: {
  generationId: string;
  workload: AwsSqsGenerationWorkload;
  now?: Date;
}): AwsSqsGenerationMessage {
  const generationId = input.generationId.trim();

  if (!generationId) {
    throw new Error("generationId is required");
  }

  return {
    version: AWS_SQS_GENERATION_MESSAGE_VERSION,
    generationId,
    workload: input.workload,
    enqueuedAt: (input.now ?? new Date()).toISOString(),
  };
}

export function parseAwsSqsGenerationMessage(
  value: unknown,
): AwsSqsGenerationMessage {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("SQS generation message must be an object");
  }

  const candidate = value as Record<string, unknown>;

  if (candidate.version !== AWS_SQS_GENERATION_MESSAGE_VERSION) {
    throw new Error("Unsupported SQS generation message version");
  }

  if (
    typeof candidate.generationId !== "string" ||
    candidate.generationId.trim().length === 0
  ) {
    throw new Error("generationId is required");
  }

  if (
    typeof candidate.workload !== "string" ||
    !AWS_SQS_GENERATION_WORKLOADS.includes(
      candidate.workload as AwsSqsGenerationWorkload,
    )
  ) {
    throw new Error("Unsupported generation workload");
  }

  if (
    typeof candidate.enqueuedAt !== "string" ||
    Number.isNaN(Date.parse(candidate.enqueuedAt))
  ) {
    throw new Error("enqueuedAt must be an ISO-compatible timestamp");
  }

  return {
    version: AWS_SQS_GENERATION_MESSAGE_VERSION,
    generationId: candidate.generationId.trim(),
    workload: candidate.workload as AwsSqsGenerationWorkload,
    enqueuedAt: candidate.enqueuedAt,
  };
}

export function generationSubmissionKey(job: {
  _id: unknown;
  generationIdempotencyKey?: string | null;
}): string {
  const persisted = job.generationIdempotencyKey?.trim();
  return persisted || String(job._id);
}

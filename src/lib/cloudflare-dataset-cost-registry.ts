/**
 * Cloudflare dataset/RAG planning economics for Prompt Studio.
 * Public list-price benchmarks; actual invoices and measured usage are authoritative.
 */
export const CLOUDFLARE_DATASET_COSTS = {
  r2StandardGbMonthUsd: 0.015,
  r2ClassAPerRequestUsd: 4.5 / 1_000_000,
  r2ClassBPerRequestUsd: 0.36 / 1_000_000,
  vectorizeStoredDimensionsPerMonthUsd: 0.05 / 100_000_000,
  vectorizeQueriedDimensionsUsd: 0.01 / 50_000_000,
  workersAiNeuronsUsd: 0.011,
} as const;

export function estimateR2DatasetStorageUsd(gb: number, months = 1) {
  return Math.max(0, gb) * Math.max(0, months) * CLOUDFLARE_DATASET_COSTS.r2StandardGbMonthUsd;
}

export function estimateVectorizeUsd(input: {
  vectors: number; dimensions: number; months?: number; queries?: number; topK?: number;
}) {
  const dimensions = Math.max(0, input.vectors) * Math.max(0, input.dimensions);
  const storedUsd = dimensions * Math.max(0, input.months ?? 1) * CLOUDFLARE_DATASET_COSTS.vectorizeStoredDimensionsPerMonthUsd;
  const queriedDimensions = Math.max(0, input.queries ?? 0) * Math.max(0, input.topK ?? 0) * Math.max(0, input.dimensions);
  const queriedUsd = queriedDimensions * CLOUDFLARE_DATASET_COSTS.vectorizeQueriedDimensionsUsd;
  return { storedUsd, queriedUsd, totalUsd: storedUsd + queriedUsd };
}

export function estimateDatasetLifecycleUsd(input: {
  datasetGb: number; storageMonths: number;
  vectors?: number; dimensions?: number; queries?: number; topK?: number;
  embeddingCostUsd?: number; trainingGpuCostUsd?: number;
}) {
  const storageUsd = estimateR2DatasetStorageUsd(input.datasetGb, input.storageMonths);
  const vectorUsd = estimateVectorizeUsd({
    vectors: input.vectors ?? 0, dimensions: input.dimensions ?? 0,
    months: input.storageMonths, queries: input.queries, topK: input.topK,
  }).totalUsd;
  const embeddingCostUsd = Math.max(0, input.embeddingCostUsd ?? 0);
  const trainingGpuCostUsd = Math.max(0, input.trainingGpuCostUsd ?? 0);
  return { storageUsd, vectorUsd, embeddingCostUsd, trainingGpuCostUsd, totalUsd: storageUsd + vectorUsd + embeddingCostUsd + trainingGpuCostUsd };
}

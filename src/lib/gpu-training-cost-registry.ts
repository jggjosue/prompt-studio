export type GpuComputePrice = {
  id: string; provider: 'Runpod' | 'NVIDIA'; gpu: string; vramGb: number;
  workload: 'pod' | 'serverless' | 'cluster' | 'license';
  hourlyUsd: number; verifiedAt: string;
};

export const GPU_COMPUTE_REGISTRY: GpuComputePrice[] = [
  { id: 'runpod-community-4090', provider: 'Runpod', gpu: 'RTX 4090', vramGb: 24, workload: 'pod', hourlyUsd: 0.34, verifiedAt: '2026-10-03' },
  { id: 'runpod-secure-4090', provider: 'Runpod', gpu: 'RTX 4090', vramGb: 24, workload: 'pod', hourlyUsd: 0.74, verifiedAt: '2026-10-03' },
  { id: 'runpod-serverless-4090', provider: 'Runpod', gpu: 'RTX 4090', vramGb: 24, workload: 'serverless', hourlyUsd: 1.10, verifiedAt: '2026-10-03' },
  { id: 'runpod-community-a100', provider: 'Runpod', gpu: 'A100 80GB', vramGb: 80, workload: 'pod', hourlyUsd: 1.19, verifiedAt: '2026-10-03' },
  { id: 'runpod-secure-a100', provider: 'Runpod', gpu: 'A100 80GB', vramGb: 80, workload: 'pod', hourlyUsd: 1.59, verifiedAt: '2026-10-03' },
  { id: 'runpod-cluster-a100', provider: 'Runpod', gpu: 'A100 SXM', vramGb: 80, workload: 'cluster', hourlyUsd: 1.79, verifiedAt: '2026-10-03' },
  { id: 'runpod-community-h100', provider: 'Runpod', gpu: 'H100 PCIe', vramGb: 80, workload: 'pod', hourlyUsd: 1.99, verifiedAt: '2026-10-03' },
  { id: 'runpod-secure-h100', provider: 'Runpod', gpu: 'H100 SXM', vramGb: 80, workload: 'pod', hourlyUsd: 3.49, verifiedAt: '2026-10-03' },
  { id: 'runpod-serverless-h100', provider: 'Runpod', gpu: 'H100', vramGb: 80, workload: 'serverless', hourlyUsd: 4.79, verifiedAt: '2026-10-03' },
  { id: 'runpod-cluster-h200', provider: 'Runpod', gpu: 'H200 SXM', vramGb: 141, workload: 'cluster', hourlyUsd: 4.31, verifiedAt: '2026-10-03' },
  { id: 'nvidia-ai-enterprise-license', provider: 'NVIDIA', gpu: 'licensed production GPU', vramGb: 0, workload: 'license', hourlyUsd: 4500 / 8760, verifiedAt: '2026-10-03' },
];

export const RUNPOD_STORAGE = {
  containerDiskUsdPerGbMonth: 0.10,
  networkUnder1TbUsdPerGbMonth: 0.07,
  networkOver1TbUsdPerGbMonth: 0.05,
  highPerformanceUsdPerGbMonth: 0.14,
} as const;

export function estimateGpuTrainingRunUsd(input: {
  hourlyUsd: number; gpuCount: number; hours: number;
  storageGb?: number; storageUsdPerGbMonth?: number; storageMonths?: number;
}) {
  const computeUsd = Math.max(0, input.hourlyUsd) * Math.max(1, input.gpuCount) * Math.max(0, input.hours);
  const storageUsd = Math.max(0, input.storageGb ?? 0) * Math.max(0, input.storageUsdPerGbMonth ?? 0) * Math.max(0, input.storageMonths ?? 0);
  return { computeUsd, storageUsd, totalUsd: computeUsd + storageUsd };
}

export function amortizedTrainingCostPerCreditUsd(trainingCostUsd: number, expectedLifetimeCredits: number) {
  return expectedLifetimeCredits > 0 ? Math.max(0, trainingCostUsd) / expectedLifetimeCredits : 0;
}

import fs from "node:fs/promises";
import path from "node:path";

import {
  calculateCostUsd,
  estimateTokenCount,
  scoreContract,
  summarize,
  type BenchmarkSample,
} from "../../src/lib/generation/text-model-benchmark.ts";

type BenchmarkCase = {
  id: string;
  category: "short" | "medium" | "long";
  prompt: string;
  maxOutputTokens: number;
  criteria: {
    minWords?: number;
    maxWords?: number;
    requiredAny?: string[];
    forbidden?: string[];
    requiredHeadings?: string[];
  };
};

type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
};

type Metrics = {
  gpuMemoryUsedMb?: number;
  gpuMemoryTotalMb?: number;
  ramUsedMb?: number;
  ramTotalMb?: number;
};

const baseUrl = required("BENCHMARK_BASE_URL").replace(/\/$/, "");
const apiKey = process.env.BENCHMARK_API_KEY ?? "";
const model = process.env.BENCHMARK_MODEL ?? "Qwen/Qwen3-8B";
const label = process.env.BENCHMARK_LABEL ?? model;
const runs = numberEnv("BENCHMARK_RUNS", 5);
const concurrencyLevels = (process.env.BENCHMARK_CONCURRENCY ?? "1,5,10")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isInteger(value) && value > 0);
const hourlyCostUsd = optionalNumber("BENCHMARK_HOURLY_COST_USD");
const inputCostPerMillion = optionalNumber(
  "BENCHMARK_INPUT_COST_PER_MILLION",
);
const outputCostPerMillion = optionalNumber(
  "BENCHMARK_OUTPUT_COST_PER_MILLION",
);
const metricsUrl = process.env.BENCHMARK_METRICS_URL;
const outputPath = process.env.BENCHMARK_OUTPUT;

const fixturePath =
  process.env.BENCHMARK_CASES ??
  "docs/ai/benchmarks/text-generation-cases.json";
const benchmarkCases = JSON.parse(
  await fs.readFile(fixturePath, "utf8"),
) as BenchmarkCase[];

const samples: BenchmarkSample[] = [];

for (const concurrency of concurrencyLevels) {
  for (let iteration = 0; iteration < runs; iteration += 1) {
    for (let offset = 0; offset < benchmarkCases.length; offset += concurrency) {
      const batch = benchmarkCases.slice(offset, offset + concurrency);
      const batchSamples = await Promise.all(
        batch.map((benchmarkCase) => runCase(benchmarkCase, concurrency)),
      );
      samples.push(...batchSamples);
    }
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  label,
  endpoint: redactUrl(baseUrl),
  model,
  runsPerConcurrency: runs,
  concurrencyLevels,
  pricing: {
    hourlyCostUsd,
    inputCostPerMillion,
    outputCostPerMillion,
  },
  summary: summarize(samples),
  byConcurrency: Object.fromEntries(
    concurrencyLevels.map((level) => [
      String(level),
      summarize(samples.filter((sample) => sample.concurrency === level)),
    ]),
  ),
  byCase: Object.fromEntries(
    benchmarkCases.map((benchmarkCase) => [
      benchmarkCase.id,
      summarize(samples.filter((sample) => sample.caseId === benchmarkCase.id)),
    ]),
  ),
  quality: {
    automaticContractScoreAverage: average(
      samples
        .map((sample) => sample.contractScore)
        .filter((value): value is number => value != null),
    ),
    note:
      "Automatic contract score checks output shape only. Complete the blind human rubric in docs/ai/TEXT_MODEL_BENCHMARK.md before a production quality decision.",
  },
  samples,
};

const serialized = JSON.stringify(report, null, 2);
console.log(serialized);

if (outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, serialized + "\n", "utf8");
}

async function runCase(
  benchmarkCase: BenchmarkCase,
  concurrency: number,
): Promise<BenchmarkSample> {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  let firstTokenAt: number | undefined;
  let output = "";
  let usage: Usage | undefined;

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are PromptStudio AI. Follow the user request precisely and return production-ready prompt text without meta commentary.",
          },
          { role: "user", content: benchmarkCase.prompt },
        ],
        temperature: 0.7,
        max_tokens: benchmarkCase.maxOutputTokens,
        stream: true,
        stream_options: { include_usage: true },
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(
        `HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`,
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        const chunk = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
          usage?: Usage;
        };

        const content = chunk.choices?.[0]?.delta?.content ?? "";
        if (content && firstTokenAt == null) {
          firstTokenAt = performance.now();
        }
        output += content;
        if (chunk.usage) usage = chunk.usage;
      }
    }

    const ended = performance.now();
    const totalLatencyMs = ended - started;
    const outputTokens =
      usage?.completion_tokens ?? estimateTokenCount(output);
    const tokenCountEstimated = usage?.completion_tokens == null;
    const generationWindowMs = Math.max(
      1,
      ended - (firstTokenAt ?? started),
    );
    const metrics = await readMetrics();

    return {
      caseId: benchmarkCase.id,
      concurrency,
      startedAt,
      ttftMs: (firstTokenAt ?? ended) - started,
      totalLatencyMs,
      outputTokens,
      tokenCountEstimated,
      tokensPerSecond: outputTokens / (generationWindowMs / 1000),
      inputTokens: usage?.prompt_tokens,
      costUsd: calculateCostUsd({
        durationMs: totalLatencyMs,
        inputTokens: usage?.prompt_tokens,
        outputTokens,
        hourlyCostUsd,
        inputCostPerMillion,
        outputCostPerMillion,
      }),
      ...metrics,
      contractScore: scoreContract(output, benchmarkCase.criteria),
    };
  } catch (error) {
    const ended = performance.now();
    return {
      caseId: benchmarkCase.id,
      concurrency,
      startedAt,
      ttftMs: ended - started,
      totalLatencyMs: ended - started,
      outputTokens: 0,
      tokenCountEstimated: true,
      tokensPerSecond: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function readMetrics(): Promise<Metrics> {
  if (!metricsUrl) return {};

  try {
    const response = await fetch(metricsUrl, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });
    if (!response.ok) return {};
    return (await response.json()) as Metrics;
  } catch {
    return {};
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function numberEnv(name: string, fallback: number): number {
  return optionalNumber(name) ?? fallback;
}

function optionalNumber(name: string): number | undefined {
  const value = process.env[name];
  if (value == null || value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be numeric`);
  }
  return parsed;
}

function average(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function redactUrl(value: string): string {
  const url = new URL(value);
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

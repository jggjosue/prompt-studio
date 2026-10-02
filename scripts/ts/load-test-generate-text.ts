import { performance } from "node:perf_hooks";

type Result = {
  ok: boolean;
  status: number;
  latencyMs: number;
};

const baseUrl = required("LOAD_TEST_BASE_URL").replace(/\/$/, "");
const cookie = process.env.LOAD_TEST_COOKIE ?? "";
const concurrency = positiveInt(process.env.LOAD_TEST_CONCURRENCY, 5);
const requests = positiveInt(process.env.LOAD_TEST_REQUESTS, 50);
const prompt = process.env.LOAD_TEST_PROMPT ?? "Return exactly: LOAD_OK";

if (!cookie) {
  throw new Error("LOAD_TEST_COOKIE is required; use a dedicated staging test account session.");
}

const results: Result[] = [];
let next = 0;

await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (true) {
      const index = next++;
      if (index >= requests) return;
      const started = performance.now();
      try {
        const response = await fetch(`${baseUrl}/api/ai/generate-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookie,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            maxTokens: 64,
            temperature: 0,
            stream: true,
          }),
        });
        if (response.body) {
          const reader = response.body.getReader();
          while (!(await reader.read()).done) {}
        }
        results.push({
          ok: response.ok,
          status: response.status,
          latencyMs: performance.now() - started,
        });
      } catch {
        results.push({ ok: false, status: 0, latencyMs: performance.now() - started });
      }
    }
  }),
);

const latencies = results.map((result) => result.latencyMs).sort((a, b) => a - b);
const successes = results.filter((result) => result.ok).length;
const summary = {
  requests: results.length,
  concurrency,
  successRate: results.length ? successes / results.length : 0,
  p50LatencyMs: percentile(latencies, 0.5),
  p95LatencyMs: percentile(latencies, 0.95),
  statuses: Object.fromEntries(
    [...new Set(results.map((result) => result.status))].map((status) => [
      String(status),
      results.filter((result) => result.status === status).length,
    ]),
  ),
};

console.log(JSON.stringify(summary, null, 2));
process.exitCode = summary.successRate >= 0.97 ? 0 : 1;

function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  return values[Math.max(0, Math.ceil(values.length * p) - 1)] ?? null;
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

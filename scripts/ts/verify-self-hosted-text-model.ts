import assert from "node:assert/strict";

const baseUrl = required("PROMPTSTUDIO_TEXT_MODEL_URL").replace(/\/$/, "");
const apiKey = required("PROMPTSTUDIO_TEXT_MODEL_API_KEY");
const expectedModel = "promptstudio-fast";

await waitForHealthy();

const modelsResponse = await fetch(`${baseUrl}/v1/models`, {
  headers: authHeaders(),
});
assert.equal(modelsResponse.ok, true, await modelsResponse.text());
const models = (await modelsResponse.json()) as {
  data?: Array<{ id?: string }>;
};
assert.ok(
  models.data?.some((model) => model.id === expectedModel),
  `Expected served model ${expectedModel}`,
);

const nonStreaming = await fetch(`${baseUrl}/v1/chat/completions`, {
  method: "POST",
  headers: {
    ...authHeaders(),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: expectedModel,
    messages: [{ role: "user", content: "Reply with exactly: READY" }],
    temperature: 0,
    max_tokens: 16,
  }),
});
assert.equal(nonStreaming.ok, true, await nonStreaming.text());
const completion = (await nonStreaming.json()) as {
  choices?: Array<{ message?: { content?: string } }>;
};
assert.match(completion.choices?.[0]?.message?.content ?? "", /READY/i);

const streaming = await fetch(`${baseUrl}/v1/chat/completions`, {
  method: "POST",
  headers: {
    ...authHeaders(),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: expectedModel,
    messages: [{ role: "user", content: "Count from 1 to 3." }],
    temperature: 0,
    max_tokens: 32,
    stream: true,
  }),
});
assert.equal(streaming.ok, true, await streaming.text());
assert.ok(streaming.body, "Expected streaming body");

const reader = streaming.body!.getReader();
const decoder = new TextDecoder();
let sawData = false;
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  if (buffer.includes("data:")) sawData = true;
}

assert.equal(sawData, true, "Expected SSE data chunks");
console.log("Self-hosted text model smoke test passed.");

async function waitForHealthy() {
  const deadline = Date.now() + 30 * 60_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`, {
        headers: authHeaders(),
      });
      if (response.ok) return;
    } catch {
      // Cold start / deployment not ready yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  throw new Error("Timed out waiting for self-hosted model health endpoint");
}

function authHeaders() {
  return { Authorization: `Bearer ${apiKey}` };
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

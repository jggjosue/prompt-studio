import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('/generate keeps progress inside the conversation instead of using a page overlay', async () => {
  const chatArea = await source('src/components/chat/chat-area.tsx');
  const messageItem = await source('src/components/chat/chat-message-item.tsx');

  assert.doesNotMatch(chatArea, /GenerationProgress/);
  assert.match(messageItem, /Trabajando en segundo plano/);
  assert.match(messageItem, /role="status"/);
});

test('/generate keeps the composer available while another response is pending', async () => {
  const input = await source('src/components/chat/chat-input-bar.tsx');

  assert.match(input, /disabled=\{!prompt\.trim\(\)\}/);
  assert.doesNotMatch(input, /disabled=\{localGenerating \|\| !prompt\.trim\(\)\}/);
  assert.match(input, /creaciones en segundo plano/);
});

test('/generate separates the user prompt from the assistant result', async () => {
  const generator = await source('src/hooks/use-chat-generator.ts');

  assert.match(generator, /role: 'user'.*status: 'completed'/);
  assert.match(generator, /role: 'assistant'.*status: 'pending'/);
  assert.match(generator, /updateMessage\(responseEntry\.id/);
});

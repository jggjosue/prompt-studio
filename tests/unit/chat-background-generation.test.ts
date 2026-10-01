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

test('/generate identifies the selected slash command as a chat capability', async () => {
  const input = await source('src/components/chat/chat-input-bar.tsx');

  assert.match(input, /Capacidad del chat:/);
  assert.match(input, /Capacidad del chat seleccionada:/);
  assert.match(input, /text-blue-500 underline/);
  assert.match(input, /\/{selectedSlashCommand\.label}/);
});

test('/generate offers prompt optimization and code auditing as slash commands', async () => {
  const input = await source('src/components/chat/chat-input-bar.tsx');

  assert.match(input, /id: 'optimize-prompt', label: 'Optimizar prompt'/);
  assert.match(input, /id: 'audit-code', label: 'Auditar código'/);
  assert.match(input, /mejora objetivo, contexto, restricciones/);
  assert.match(input, /riesgos de seguridad, problemas de rendimiento/);
});

test('/generate separates the user prompt from the assistant result', async () => {
  const generator = await source('src/hooks/use-chat-generator.ts');

  assert.match(generator, /role: 'user'.*status: 'completed'/);
  assert.match(generator, /role: 'assistant'.*status: 'pending'/);
  assert.match(generator, /updateMessage\(responseEntry\.id/);
});

test('/generate uses a viewport shell with independent history scrolling', async () => {
  const layout = await source('src/components/chat/chat-layout.tsx');
  const history = await source('src/components/chat/chat-history-sidebar.tsx');

  assert.match(layout, /h-dvh/);
  assert.doesNotMatch(layout, /<Footer/);
  assert.match(history, /overflow-y-auto/);
  assert.match(history, /overscroll-contain/);
  assert.match(history, /scrollbar-gutter:stable/);
});

test('queued generations keep the settings selected when they were added', async () => {
  const generator = await source('src/hooks/use-chat-generator.ts');

  assert.match(generator, /params: \{ \.\.\.params \}/);
  assert.match(generator, /imageGenerate\(next\.prompt, next\.params\)/);
  assert.match(generator, /role: 'user'.*params: next\.params/);
});

test('/generate displays the settings used beside the original prompt', async () => {
  const message = await source('src/components/chat/chat-message-item.tsx');

  assert.match(message, /selectedChatConfiguration\(message\.mode, message\.params\)/);
  assert.match(message, /aria-label="Configuración usada"/);
});

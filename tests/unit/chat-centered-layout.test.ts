import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layoutSource = readFileSync('src/components/chat/chat-layout.tsx', 'utf8');
const areaSource = readFileSync('src/components/chat/chat-area.tsx', 'utf8');
const inputSource = readFileSync('src/components/chat/chat-input-bar.tsx', 'utf8');

test('centers the hero composer before a conversation starts', () => {
  assert.match(layoutSource, /emptyComposer={<ChatInputBar chat={chat} variant="hero"/);
  assert.match(areaSource, /{emptyComposer}/);
  assert.ok(areaSource.indexOf('{emptyComposer}') < areaSource.indexOf('QUICK_STARTS.map'));
});

test('moves the composer below the conversation after the first message', () => {
  assert.match(layoutSource, /const conversationStarted = chat\.messages\.length > 0/);
  assert.match(layoutSource, /conversationStarted && \(\s*<ChatInputBar chat={chat} variant="docked"/);
  assert.match(areaSource, /max-w-4xl space-y-7/);
});

test('keeps all creation settings available from the composer', () => {
  assert.match(inputSource, /aria-label="Abrir configuración de creación"/);
  assert.match(layoutSource, /const \[desktopSettingsOpen, setDesktopSettingsOpen\] = useState\(false\)/);
  assert.match(layoutSource, /desktopOpen={desktopSettingsOpen}/);
});

test('quick starts select their mode and begin the conversational flow', () => {
  assert.match(areaSource, /chat\.setSelectedMode\(qs\.mode\)/);
  assert.match(areaSource, /chat\.generate\(qs\.prompt, chat\.params, qs\.mode\)/);
});

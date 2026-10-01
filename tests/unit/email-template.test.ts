import assert from 'node:assert/strict';
import test from 'node:test';
import { isPromptStudioLink, renderBrandedEmail, validateEmailTemplate } from '../../src/lib/email-template.ts';

const input = { title: 'Welcome', previewText: 'Start creating today', body: ['Create your first project.'], cta: { label: 'Open Prompt Studio', url: 'https://app.promptstudio.com/projects' } };

test('renders responsive html and plain text', () => {
  const rendered = renderBrandedEmail(input);
  assert.match(rendered.html, /viewport/);
  assert.match(rendered.html, /<h1/);
  assert.match(rendered.text, /Open Prompt Studio: https:\/\/app\.promptstudio\.com\/projects/);
});

test('validates accessible labels, preview and trusted domains', () => {
  assert.deepEqual(validateEmailTemplate(input), []);
  assert.equal(isPromptStudioLink('https://evil.example/path'), false);
  assert.ok(validateEmailTemplate({ ...input, previewText: '', cta: { label: '', url: 'https://example.com/todo' } }).length >= 3);
});

test('escapes untrusted copy in html output', () => {
  const rendered = renderBrandedEmail({ ...input, title: '<script>alert(1)</script>' });
  assert.doesNotMatch(rendered.html, /<script>/);
});

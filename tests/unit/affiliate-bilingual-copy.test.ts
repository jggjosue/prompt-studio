import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('affiliate public experience is locale-aware for legacy interactive copy', () => {
  const source = fs.readFileSync('src/app/[locale]/affiliate-program/affiliate-client.tsx', 'utf8');
  assert.match(source, /useLocale/);
  assert.match(source, /Interactive calculator/);
  assert.match(source, /Discover your potential/);
  assert.match(source, /Referred users/);
  assert.match(source, /Annual plan/);
  assert.match(source, /Monthly plan/);
  assert.match(source, /Partner summary/);
  assert.match(source, /Commission rate/);
  assert.match(source, /Cookie duration/);
  assert.match(source, /Promotional resources/);
});

test('site locale contract remains English-first with Spanish support', () => {
  const config = fs.readFileSync('src/i18n/config.ts', 'utf8');
  assert.match(config, /locales = \['en', 'es'\]/);
  assert.match(config, /defaultLocale: Locale = 'en'/);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  canCopyLandingPrompt,
  needsLandingPromptEmailGate,
} from '../../src/lib/landing-preview-access.ts';

const purchaseSource = readFileSync(
  new URL('../../src/app/[locale]/landing-pages/[slug]/preview/preview-purchase.tsx', import.meta.url),
  'utf8'
);

test('la vista previa reemplaza la recompra por copiar cuando existe acceso', () => {
  assert.equal(canCopyLandingPrompt({ membership: 'Premium', hasPaidPlan: true, hasPurchased: false }), true);
  assert.equal(canCopyLandingPrompt({ membership: 'Premium', hasPaidPlan: false, hasPurchased: true }), true);
  assert.equal(canCopyLandingPrompt({ membership: 'Premium', hasPaidPlan: false, hasPurchased: false }), false);
  assert.equal(canCopyLandingPrompt({ membership: 'Free', hasPaidPlan: false, hasPurchased: false }), true);
  assert.match(purchaseSource, /purchasedPages\.includes\(pageId\)/);
  assert.match(purchaseSource, /Copy prompt/);
  assert.match(purchaseSource, /Copiar prompt/);
});

test('solo el visitante de una landing gratuita pasa por captura de correo', () => {
  assert.equal(needsLandingPromptEmailGate({ membership: 'Free', isSignedIn: false }), true);
  assert.equal(needsLandingPromptEmailGate({ membership: 'Free', isSignedIn: true }), false);
  assert.equal(needsLandingPromptEmailGate({ membership: 'Premium', isSignedIn: false }), false);
  assert.match(purchaseSource, /<FreeEmailGate/);
  assert.match(purchaseSource, /onSuccess=\{\(\) => void copyPrompt\(\)\}/);
  assert.match(purchaseSource, /onClick=\{needsEmailGate \? undefined/);
});

test('el servidor usa el id canónico del catálogo para comprobar la compra', () => {
  const pageSource = readFileSync(
    new URL('../../src/app/[locale]/landing-pages/[slug]/preview/page.tsx', import.meta.url),
    'utf8'
  );
  assert.match(pageSource, /getCatalogIdByDemoSlug\(slug\) \?\? query\.pageId \?\? slug/);
  assert.match(pageSource, /membership=\{page\.membership\}/);
  assert.match(pageSource, /prompt=\{prompt\}/);
});

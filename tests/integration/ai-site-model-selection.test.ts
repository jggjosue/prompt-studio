import assert from 'node:assert/strict';
import test from 'node:test';
import { resolvePlannerModel } from '../../src/lib/ai-site-plan-config.ts';
import { AIPlanError } from '../../src/lib/editor/ai-site-planner.ts';

test('el planner usa el modelo server-owned por defecto', () => {
  assert.equal(resolvePlannerModel('google'), 'gemini-2.5-flash');
});

test('el planner rechaza un modelo explícito no permitido sin fallback silencioso', () => {
  assert.throws(
    () => resolvePlannerModel('google', 'modelo-inventado'),
    (error: unknown) => error instanceof AIPlanError && error.code === 'MODEL_NOT_ALLOWED'
  );
});

test('el planner rechaza proveedores sin modelo project habilitado', () => {
  assert.throws(
    () => resolvePlannerModel('fal'),
    (error: unknown) => error instanceof AIPlanError && error.code === 'MODEL_NOT_ALLOWED'
  );
});

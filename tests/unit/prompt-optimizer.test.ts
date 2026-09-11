import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { isPromptGoal, PROMPT_GOALS } from '../../src/ai/flows/prompt-goals.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('el optimizador solo acepta los objetivos soportados', () => {
  for (const goal of PROMPT_GOALS) {
    assert.equal(isPromptGoal(goal), true, `${goal} debería aceptarse`);
  }
  for (const invalid of ['ignore-safety', 'jailbreak', '', 'LOWER-COST', 42, null]) {
    assert.equal(isPromptGoal(invalid), false, `${String(invalid)} NO debería aceptarse`);
  }
});

test('la lista de objetivos no tiene duplicados y es estable', () => {
  assert.equal(new Set(PROMPT_GOALS).size, PROMPT_GOALS.length);
  // El orden y los identificadores viajan al cliente y a los registros de
  // observabilidad: cambiarlos rompe los datos ya almacenados.
  assert.deepEqual([...PROMPT_GOALS], [
    'lower-cost',
    'consistency',
    'realism',
    'fewer-hallucinations',
    'structured-output',
    'provider-adaptation',
    'translation',
  ]);
});

test('el fichero "use server" no exporta objetos', async () => {
  // Next solo admite exportaciones de funciones asíncronas en un fichero
  // `'use server'`. Exportar un esquema de Zod desde ahí rompía el build
  // *después* de compilar, al recopilar los datos de página.
  const flow = await source('src/ai/flows/optimize-prompt.ts');
  assert.ok(/^'use server';/m.test(flow));

  const exports = [...flow.matchAll(/^export\s+(?:async\s+)?(\w+)/gm)].map(match => match[1]);
  for (const kind of exports) {
    assert.ok(
      kind === 'function' || kind === 'type',
      `'use server' solo admite funciones asíncronas y tipos; se encontró "${kind}"`
    );
  }
  assert.ok(!/^export const/m.test(flow), 'una const exportada volvería a romper el build');
});

test('la ruta valida los objetivos sin depender de genkit', async () => {
  // Importar el flujo arrastra `@/ai/genkit`, que no resuelve al ejecutar los
  // tests con Node a secas. La validación vive en un módulo sin dependencias.
  const route = await source('src/app/api/prompt-optimizer/route.ts');
  assert.ok(route.includes("from '@/ai/flows/prompt-goals'"));
  assert.ok(route.includes('.filter(isPromptGoal)'));

  const shared = await source('src/ai/flows/prompt-goals.ts');
  assert.ok(!/^import /m.test(shared), 'el módulo compartido debe seguir sin dependencias');
});

test('la ruta exige sesión y limita el uso', async () => {
  const route = await source('src/app/api/prompt-optimizer/route.ts');
  assert.ok(route.includes('await auth()'));
  assert.ok(route.includes('401'));
  assert.ok(route.includes('`prompt-optimizer:${userId}`'), 'la cuota va por usuario, no por IP');
  assert.ok(route.includes('tooManyRequests(quota)'));
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const runbookPath = new URL('../../docs/operaciones/vercel-pro-readiness.md', import.meta.url);

test('Vercel Pro gate does not present historical usage as the optimized baseline', async () => {
  const runbook = await readFile(runbookPath, 'utf8');

  assert.match(runbook, /BLOQUEADO — NO ACTUALIZAR EL PLAN/);
  assert.match(runbook, /28\.13 GB/);
  assert.match(runbook, /27\.24 GB/);
  assert.match(runbook, /no cumplen[\s\S]*línea\s+base solicitada/i);
  assert.match(runbook, /no fue posible leer su Usage ni configurar Spend Management/);
});

test('Vercel Pro gate requires real cost inputs and hard spend controls', async () => {
  const runbook = await readFile(runbookPath, 'utf8');

  assert.match(runbook, /estimado mensual = 20 \+ S \+ A \+ max\(0, U - 20\)/);
  assert.match(runbook, /USD 20\/mes antes de impuestos/);
  assert.match(runbook, /50 %, 75 % y 100 %/);
  assert.match(runbook, /Pause all production deployments at 100%/);
  assert.match(runbook, /Si una\s+sola casilla queda abierta[\s\S]*\*\*NO-GO\*\*/);
});

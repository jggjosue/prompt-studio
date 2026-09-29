import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  DEFAULT_GENERATION_POLL_SCHEDULE,
  LONG_GENERATION_POLL_SCHEDULE,
  TERMINAL_GENERATION_STATUSES,
  TEXT_GENERATION_POLL_SCHEDULE,
  isGenerationPollingPaused,
  isTerminalGenerationStatus,
  nextGenerationPollDelayMs,
  plannedGenerationPollRequests,
  terminalGenerationMessage,
  waitForGenerationPollWindow,
} from '../../src/lib/generation-polling.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

const HOOKS = [
  'src/hooks/use-text-generation.ts',
  'src/hooks/use-vision-generation.ts',
  'src/hooks/use-image-generation.ts',
  'src/hooks/use-video-generation.ts',
  'src/hooks/use-web-generation.ts',
  'src/hooks/use-video-understanding.ts',
];

test('los cuatro estados que ya no cambian cortan el sondeo', () => {
  assert.deepEqual([...TERMINAL_GENERATION_STATUSES], ['completed', 'failed', 'cancelled', 'dead_letter']);
  for (const status of TERMINAL_GENERATION_STATUSES) {
    assert.equal(isTerminalGenerationStatus(status), true, `${status} debe ser terminal`);
  }
  // Los estados en vuelo son los que mantienen el bucle girando.
  for (const status of ['queued', 'processing', 'retrying', 'uploading', 'finalizing']) {
    assert.equal(isTerminalGenerationStatus(status), false, `${status} no es terminal`);
  }
  assert.equal(isTerminalGenerationStatus(undefined), false);
  assert.equal(isTerminalGenerationStatus(null), false);
  assert.equal(isTerminalGenerationStatus('COMPLETED'), false);
  assert.equal(isTerminalGenerationStatus(42), false);
});

test('un trabajo detenido dice qué pasó con los créditos', () => {
  // `lastError` solo se serializa para `failed`.
  assert.equal(terminalGenerationMessage({ lastError: 'Timeout del proveedor' }, 'failed'), 'Timeout del proveedor');
  assert.equal(terminalGenerationMessage({ progressMessage: 'Subiendo…' }, 'cancelled'), 'La generación se canceló y los créditos fueron devueltos.');
  assert.equal(terminalGenerationMessage({ progressMessage: 'Intentando…' }, 'dead_letter'), 'La generación se detuvo y los créditos fueron devueltos.');
  assert.equal(terminalGenerationMessage(undefined, 'failed'), 'El trabajo falló en el servidor.');
  assert.equal(terminalGenerationMessage({ lastError: '' }, 'failed'), 'El trabajo falló en el servidor.');
});

test('el primer sondeo es rápido y luego se aleja hasta el techo', () => {
  assert.equal(nextGenerationPollDelayMs(0), DEFAULT_GENERATION_POLL_SCHEDULE.firstDelayMs);
  // Un trabajo largo no puede depender de una cadencia de pocos segundos.
  const delays = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(attempt => nextGenerationPollDelayMs(attempt));
  for (let i = 1; i < delays.length; i += 1) {
    assert.ok(delays[i] >= delays[i - 1], `el intervalo debe ser monótono: ${delays.join(',')}`);
  }
  assert.equal(delays.at(-1), DEFAULT_GENERATION_POLL_SCHEDULE.maxDelayMs, 'el intervalo debe saturar en maxDelayMs');
});

test('el volumen de peticiones baja de forma medible en cada flujo', () => {
  // Intervalos fijos que había antes, medidos sobre el mismo presupuesto.
  const flows = [
    { name: 'texto/visión', schedule: TEXT_GENERATION_POLL_SCHEDULE, before: 25 },
    { name: 'video/web', schedule: LONG_GENERATION_POLL_SCHEDULE, before: 40 },
  ];
  for (const { name, schedule, before } of flows) {
    const now = plannedGenerationPollRequests(schedule.maxElapsedMs, schedule);
    assert.ok(now < before, `${name}: ${now} peticiones no puede ser peor que las ${before} de antes`);
    // Y no debe desplomarse: si no vuelve a preguntar, el usuario espera a ciegas.
    assert.ok(now >= 5, `${name}: ${now} peticiones es demasiado pocas para ver progreso`);
  }
  // Cifras concretas para el PR: video de 40 a 12, texto de 25 a 7.
  assert.equal(plannedGenerationPollRequests(120_000, LONG_GENERATION_POLL_SCHEDULE), 12);
  assert.equal(plannedGenerationPollRequests(50_000, TEXT_GENERATION_POLL_SCHEDULE), 7);
});

test('una pestaña oculta no gasta peticiones', async () => {
  const slept: number[] = [];
  let hidden = true;
  let resumed = 0;
  // Al tercer corte la pestaña vuelve a estar visible. El sleep decide el
  // estado, así el test no depende de temporizadores reales.
  const sleep = async (ms: number) => {
    slept.push(ms);
    if (slept.length === 3) hidden = false;
  };

  const result = await waitForGenerationPollWindow(5_000, { sleep, isPaused: () => hidden, onResume: () => { resumed += 1; } });

  assert.equal(result, true);
  assert.equal(resumed, 1, 'onResume debe avisar una sola vez al volver a ser visible');
  // Oculta: solo comprueba visibilidad, sin consumir la ventana.
  assert.deepEqual(slept.slice(0, 3), [1_000, 1_000, 1_000]);
  // Visible: 5 s en rebanadas de 1 s, sin las 3 comprobaciones previas.
  assert.equal(slept.length, 8, `esperaba 3 comprobaciones + 5 rebanadas, hubo ${slept.length}`);

  // Visible desde el principio: consume la espera en rebanadas de un segundo.
  const visibleSlept: number[] = [];
  assert.equal(await waitForGenerationPollWindow(3_000, { sleep: async ms => { visibleSlept.push(ms); }, isPaused: () => false }), true);
  assert.deepEqual(visibleSlept, [1_000, 1_000, 1_000]);
});

test('el sondeo respeta la cancelación del llamante', async () => {
  const controller = new AbortController();
  controller.abort();
  assert.equal(await waitForGenerationPollWindow(5_000, { signal: controller.signal, isPaused: () => false }), false);

  // Sin señal activa, la espera termina sola.
  assert.equal(await waitForGenerationPollWindow(0, { isPaused: () => false, sleep: async () => {} }), true);
});

test('el sondeo pausado no se confunde con una ventana visible', async () => {
  assert.equal(isGenerationPollingPaused({ hidden: true }), true);
  assert.equal(isGenerationPollingPaused({ hidden: false }), false);
  assert.equal(isGenerationPollingPaused(null), false, 'sin document no hay pestaña que ocultar');
});

test('cada generador usa la política compartida y no un intervalo fijo', async () => {
  for (const hook of HOOKS) {
    const code = await source(hook);
    assert.ok(code.includes("from '@/lib/generation-polling'"), `${hook} debe importar la política compartida`);
    assert.ok(code.includes('waitForGenerationPollWindow('), `${hook} debe esperar con la política compartida`);
    assert.ok(code.includes('isTerminalGenerationStatus('), `${hook} debe cortar el sondeo en todos los terminales`);
    // El patrón `for (let attempts = 0; attempts < N)` es el sondeo fijo que se eliminó.
    assert.ok(!/attempts\s*<\s*\d+/.test(code), `${hook} conserva un tope fijo de intentos`);
  }
});

test('el cliente de generate-webs y el listado comparten la política', async () => {
  const webs = await source('src/app/[locale]/generate-webs/generate-webs-client.tsx');
  assert.ok(webs.includes("from '@/lib/generation-polling'"), 'generate-webs-client debe usar la política compartida');
  assert.ok(!/attempts\s*<\s*\d+/.test(webs), 'generate-webs-client conserva topes fijos de intentos');

  const dashboard = await source('src/app/[locale]/dashboard/generations/generations-client.tsx');
  assert.ok(dashboard.includes('isTerminalGenerationStatus'), 'el listado debe saber qué trabajos siguen en curso');
  assert.ok(dashboard.includes('activeRef.current'), 'el listado debe dejar de preguntar cuando nada está en curso');
  assert.ok(dashboard.includes('document.hidden'), 'el listado no debe preguntar con la pestaña oculta');
  // Si el sondeo se detiene al quedar la lista quieta, reintentar un trabajo
  // (que lo devuelve a `retrying`) tiene que volver a arrancar el ciclo: si no,
  // el botón «Reintentar» dejaba la vista congelada.
  assert.ok(dashboard.includes('setPollNonce(value=>value+1)'), 'reintentar debe reanudar el sondeo');
  assert.ok(dashboard.includes('[load,pollNonce]'), 'el ciclo debe depender del nonce de reintento');
});

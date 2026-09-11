import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
const ROUTE = 'src/app/api/ai/jobs/[id]/feedback/route.ts';

/** Quita comentarios: la documentación menciona conceptos que no son código. */
function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

test('una valoración por usuario y trabajo, actualizable', async () => {
  const model = await source('src/models/AIGenerationFeedback.ts');
  assert.ok(
    model.includes("index({ jobId: 1, userId: 1 }, { unique: true })"),
    'sin índice único, un doble clic crearía dos valoraciones del mismo trabajo'
  );
  assert.ok(
    model.includes("index({ provider: 1, kind: 1, createdAt: -1 })"),
    'la consulta principal es la tasa de aprobación por proveedor en el tiempo'
  );
  // `kind` y `provider` se copian del trabajo para agregar sin `$lookup`.
  assert.ok(/kind: \{ type: String, required: true/.test(model));
  assert.ok(/provider: \{ type: String, required: true/.test(model));
});

test('solo el dueño puede valorar su generación', async () => {
  const route = await source(ROUTE);
  // Buscar por _id sin userId permitiría valorar —y deducir la existencia de—
  // trabajos ajenos.
  assert.ok(route.includes('findOne({ _id: id, userId })'));
  assert.ok(route.includes('deleteOne({ jobId: id, userId })'));
  assert.ok(!/findOne\(\{\s*_id: id\s*\}\)/.test(route));
});

test('no se puede valorar un trabajo que aún no ha terminado', async () => {
  const route = await source(ROUTE);
  assert.ok(
    route.includes("job.status !== 'completed' && job.status !== 'failed'"),
    'en cola o procesando no hay resultado que juzgar'
  );
  assert.ok(route.includes('409'));
});

test('las dos operaciones exigen sesión y están limitadas', async () => {
  const route = await source(ROUTE);
  const handlers = route.split(/export async function /).slice(1);
  assert.equal(handlers.length, 2, 'se esperaban POST y DELETE');
  for (const handler of handlers) {
    const name = handler.slice(0, handler.indexOf('('));
    assert.ok(handler.includes('await auth()'), `${name} no comprueba la sesión`);
    assert.ok(handler.includes('401'), `${name} no responde 401 sin sesión`);
    assert.ok(handler.includes('tooManyRequests(quota)'), `${name} no está limitada`);
  }
  assert.ok(route.includes('`ai-feedback:${userId}`'), 'la cuota va por usuario, no por IP');
});

test('el guardado es idempotente', async () => {
  const route = await source(ROUTE);
  assert.ok(route.includes('upsert: true'), 'debe ser upsert contra el índice único');
  assert.ok(route.includes('$setOnInsert'), 'createdAt no debe reescribirse al actualizar');
});

test('motivo y comentario solo se guardan en una valoración negativa', async () => {
  const route = stripComments(await source(ROUTE));
  // Guardarlos en una positiva ensuciaría los agregados por motivo.
  assert.ok(/const reason = !useful &&/.test(route));
  assert.ok(/const comment =\s*\n?\s*!useful &&/.test(route));
});

test('el comentario libre no se copia a observabilidad', async () => {
  const route = await source(ROUTE);
  // Es texto de usuario y puede contener datos personales: solo se registra
  // si lo hubo, no su contenido.
  assert.ok(route.includes('hasComment: Boolean(comment)'));
  assert.ok(!/metadata: \{[^}]*\bcomment,/.test(route), 'no debe volcarse el comentario');
});

test('el motivo se valida contra la lista cerrada', async () => {
  const route = await source(ROUTE);
  assert.ok(route.includes('isFeedbackReason(body.reason)'));
  const model = await source('src/models/AIGenerationFeedback.ts');
  assert.ok(model.includes('enum: [...FEEDBACK_REASONS, null]'));
});

test('el componente de interfaz no arrastra mongoose al navegador', async () => {
  // Un import de VALOR desde un modelo no se borra al compilar y mete mongoose
  // —y sus drivers— en el bundle del cliente. Rompió el build una vez.
  const ui = await source('src/components/generation-feedback.tsx');
  assert.ok(!ui.includes("from '@/models/"), 'el componente no debe importar de models/');
  assert.ok(ui.includes("from '@/lib/generation-feedback'"));

  const shared = await source('src/lib/generation-feedback.ts');
  assert.ok(!/^import /m.test(shared), 'el módulo compartido debe seguir sin dependencias');
});

test('el trabajo denormaliza el veredicto y se expone al cliente', async () => {
  const job = await source('src/models/AIGenerationJob.ts');
  assert.ok(job.includes('feedbackUseful: { type: Boolean, default: null }'));

  const serializer = await source('src/lib/ai-job-serializer.ts');
  assert.ok(serializer.includes('feedbackUseful: job.feedbackUseful ?? null'));

  // Retirar la valoración debe limpiar también la copia.
  const route = await source(ROUTE);
  assert.ok(route.includes('feedbackUseful: null'));
});

test('el modelo no presupone consentimiento para licenciar', async () => {
  const model = await source('src/models/AIGenerationFeedback.ts');
  // Un opt-in retroactivo no es válido bajo GDPR: el esquema no debe simular
  // un consentimiento que nunca se pidió.
  assert.ok(!/consent/i.test(stripComments(model)), 'no debe haber campo de consentimiento fingido');
  assert.ok(/GDPR/.test(model), 'la limitación debe quedar documentada en el modelo');
});

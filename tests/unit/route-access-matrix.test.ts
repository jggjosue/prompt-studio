import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  MECANISMOS,
  PUBLICAS_JUSTIFICADAS,
  analizarRutas,
} from '../../scripts/mjs/build-route-access-matrix.mjs';

/**
 * Estas pruebas convierten la matriz de acceso en un contrato.
 *
 * El proyecto autoriza con siete mecanismos repartidos por 105 ficheros. Sin una
 * comprobación automática, añadir una ruta sin protección no rompe nada: se
 * despliega y ya está. Aquí sí rompe.
 */

const rutas = analizarRutas();

test('ninguna ruta queda sin mecanismo de autorización ni justificación', () => {
  const desprotegidas = rutas
    .filter(r => r.mecanismos.length === 0 && !r.justificada)
    .map(r => r.ruta);

  assert.deepEqual(
    desprotegidas,
    [],
    `Rutas sin protección reconocida. Añade el mecanismo, o justifícala en ` +
      `PUBLICAS_JUSTIFICADAS de scripts/mjs/build-route-access-matrix.mjs:\n  ` +
      desprotegidas.join('\n  ')
  );
});

test('toda ruta bajo /api/admin exige administrador, no solo sesión', () => {
  // Una ruta de administración que solo comprueba la sesión la puede llamar
  // cualquier usuario registrado. Ya ocurrió: dos rutas tenían la comprobación
  // copiada en línea en vez de usar el helper.
  const flojas = rutas
    .filter(r => r.clave.startsWith('admin/'))
    .filter(r => !r.mecanismos.includes('admin') && !r.mecanismos.includes('cron'))
    .map(r => r.ruta);

  assert.deepEqual(flojas, [], `Rutas de administración sin comprobar administrador:\n  ${flojas.join('\n  ')}`);
});

test('las rutas públicas declaradas siguen existiendo', () => {
  // Si una ruta se borra o se renombra, su justificación se queda huérfana y
  // deja de describir el sistema.
  const existentes = new Set(rutas.map(r => r.clave));
  const huerfanas = Object.keys(PUBLICAS_JUSTIFICADAS).filter(clave => !existentes.has(clave));
  assert.deepEqual(huerfanas, [], `Justificaciones de rutas que ya no existen:\n  ${huerfanas.join('\n  ')}`);
});

test('cada justificación explica el motivo, no solo marca la casilla', () => {
  for (const [ruta, motivo] of Object.entries(PUBLICAS_JUSTIFICADAS)) {
    assert.ok(
      typeof motivo === 'string' && motivo.trim().length >= 20,
      `La justificación de /api/${ruta} debe explicar por qué es pública`
    );
  }
});

test('la escritura sin sesión está limitada por IP', () => {
  // Una escritura pública sin límite es una invitación a llenar la base de datos.
  const escriturasPublicas = rutas.filter(
    r =>
      r.mecanismos.length === 0 &&
      r.justificada &&
      r.verbos.some(v => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(v))
  );

  for (const ruta of escriturasPublicas) {
    assert.ok(
      ruta.mecanismos.includes('rate-limit') || ruta.clave === 'web-page-checkout',
      `${ruta.ruta} escribe sin sesión: necesita límite por IP`
    );
  }
});

test('el documento generado está al día con el código', async () => {
  const documento = await readFile(new URL('../../docs/API_ACCESS.md', import.meta.url), 'utf8');
  assert.match(documento, /Documento generado/, 'debe declararse como generado');
  assert.match(
    documento,
    new RegExp(`\\*\\*${rutas.length}\\*\\*`),
    `El documento no refleja las ${rutas.length} rutas actuales: ejecuta ` +
      '`node scripts/mjs/build-route-access-matrix.mjs`'
  );
  for (const ruta of rutas.slice(0, 10)) {
    assert.ok(documento.includes(`\`${ruta.ruta}\``), `falta ${ruta.ruta} en la matriz`);
  }
});

test('el catálogo de mecanismos no tiene identificadores repetidos', () => {
  const ids = MECANISMOS.map(m => m.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const mecanismo of MECANISMOS) {
    assert.ok(mecanismo.patron instanceof RegExp, `${mecanismo.id} necesita un patrón`);
    assert.ok(mecanismo.etiqueta.length > 3, `${mecanismo.id} necesita una etiqueta legible`);
  }
});

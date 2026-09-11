import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyAsset, recordFingerprintSource } from '../../src/lib/catalog-provenance.ts';

test('los activos de la cuenta propia son licenciables', () => {
  const asset = classifyAsset(
    'https://raw.githubusercontent.com/jggjosue/Prompts-images/refs/heads/main/images/x.png'
  );
  assert.equal(asset?.license, 'owned');
  assert.equal(asset?.licensable, true);
});

test('un repositorio de GitHub ajeno NO es licenciable', () => {
  // El dominio no basta: lo que decide es la cuenta propietaria.
  const asset = classifyAsset(
    'https://raw.githubusercontent.com/otra-persona/fotos/main/x.png'
  );
  assert.equal(asset?.license, 'unknown');
  assert.equal(asset?.licensable, false);
  assert.match(asset!.reason, /terceros/i);
});

test('Unsplash queda marcado como restringido', () => {
  // Su licencia prohíbe expresamente entrenar modelos: es el bloqueo más duro.
  const asset = classifyAsset('https://images.unsplash.com/photo-123?w=1920');
  assert.equal(asset?.license, 'restricted');
  assert.equal(asset?.licensable, false);
});

test('el alojamiento genérico queda como procedencia desconocida', () => {
  for (const url of ['https://i.imgur.com/abc.png', 'https://ejemplo-no-clasificado.com/a.png']) {
    const asset = classifyAsset(url);
    assert.equal(asset?.licensable, false, `${url} no debería darse por licenciable`);
    assert.equal(asset?.license, 'unknown');
  }
});

test('ningún host desconocido se cuela como licenciable', () => {
  // La clasificación falla hacia el lado seguro: si no consta, no se licencia.
  const hosts = [
    'https://cdn.aleatorio.io/x.png',
    'https://scontent.ftpq1-1.fna.fbcdn.net/x.jpg',
    'https://picsum.photos/800',
    'https://placehold.co/600x400',
  ];
  for (const url of hosts) {
    assert.equal(classifyAsset(url)?.licensable, false, url);
  }
});

test('un registro sin activo externo no produce clasificación', () => {
  for (const value of [undefined, null, '', '/local/imagen.png', 42]) {
    assert.equal(classifyAsset(value), null);
  }
});

test('una URL malformada no lanza, se marca como desconocida', () => {
  const asset = classifyAsset('http://[malformada');
  assert.equal(asset?.licensable, false);
});

test('la huella de contenido ignora campos ausentes y etiquetas no válidas', () => {
  const a = recordFingerprintSource({
    id: 'img-1',
    title: 'Submerged',
    tags: ['Realistic', null, 'Modern'],
  });
  assert.ok(a.includes('Submerged'));
  assert.ok(a.includes('Realistic'));
  assert.ok(!a.includes('null'), 'las etiquetas nulas del catálogo no deben entrar en el hash');

  // Mismo contenido = misma huella, para poder deduplicar.
  const b = recordFingerprintSource({ id: 'img-1', title: 'Submerged', tags: ['Realistic', 'Modern'] });
  assert.equal(a, b);
});

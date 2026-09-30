import assert from 'node:assert/strict';
import test from 'node:test';
import {
  defaultFormFields,
  isValidEmail,
  parseFormFields,
  validateSubmission,
} from '../../src/lib/form-fields.ts';

test('parseFormFields: parses fields tolerante con sub-campos opcionales', () => {
  const fields = parseFormFields([
    { name: 'email', type: 'email', required: true },
    { name: 'nombre' },
    'basura',
    null,
  ]);
  assert.equal(fields.length, 2);
  assert.equal(fields[0].type, 'email');
  assert.equal(fields[0].required, true);
  assert.equal(fields[0].label, 'Email');
  assert.equal(fields[1].type, 'text');
  assert.equal(fields[1].label, 'Nombre');
});

test('defaultFormFields: variantes con los campos esperados', () => {
  assert.deepEqual(defaultFormFields('newsletter').map(f => f.name), ['email']);
  assert.deepEqual(defaultFormFields('waitlist').map(f => f.name), ['name', 'email']);
  assert.deepEqual(defaultFormFields('lead').map(f => f.name), ['name', 'email', 'message']);
  assert.deepEqual(defaultFormFields('contact').map(f => f.name), ['name', 'email', 'message']);
  assert.deepEqual(defaultFormFields('custom'), []);
});

test('isValidEmail: solo emails con forma correcta', () => {
  assert.equal(isValidEmail('hola@ejemplo.com'), true);
  assert.equal(isValidEmail('  a@b.co '), true);
  assert.equal(isValidEmail('no-es-email'), false);
  assert.equal(isValidEmail('a@b'), false);
  assert.equal(isValidEmail(null), false);
});

test('validateSubmission: campos obligatorios y email', () => {
  const fields = [
    { name: 'email', label: 'Email', type: 'email' as const, required: true, consent: false },
    { name: 'mensaje', label: 'Mensaje', type: 'textarea' as const, required: false, consent: false },
  ];
  assert.equal(validateSubmission(fields, { email: '', mensaje: '' }, false, false).length, 1);
  assert.equal(validateSubmission(fields, { email: 'malo', mensaje: '' }, false, false).length, 1);
  assert.deepEqual(validateSubmission(fields, { email: 'hola@x.com', mensaje: 'ok' }, false, false), []);
});

test('validateSubmission: consentimiento requerido', () => {
  const fields = [{ name: 'email', label: 'Email', type: 'email' as const, required: true, consent: false }];
  assert.equal(validateSubmission(fields, { email: 'a@b.com' }, true, false).length, 1);
  assert.deepEqual(validateSubmission(fields, { email: 'a@b.com' }, true, true), []);
});

test('validateSubmission: un campo consent no se exige salvo consentRequired', () => {
  const fields = [
    { name: 'email', label: 'Email', type: 'email' as const, required: true, consent: false },
    { name: 'news', label: 'Newsletter', type: 'text' as const, required: false, consent: true },
  ];
  // consentRequired=false → el checkbox no bloquea aunque falte.
  assert.deepEqual(validateSubmission(fields, { email: 'a@b.com' }, false, false), []);
});
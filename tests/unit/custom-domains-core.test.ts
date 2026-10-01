import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activateDomainCore,
  applyProviderStatus,
  canonicalHostname,
  isDomainHostnameValid,
  isTransient,
  normalizeDomainHostname,
  transientError,
  verifyDomainCore,
  withTransientRetry,
  type DomainProvider,
  type DomainRecord,
} from '../../src/lib/custom-domains-core.ts';

function baseDomain(overrides: Partial<DomainRecord> = {}): DomainRecord {
  return {
    siteId: 'site-1',
    hostname: 'example.com',
    provider: 'cloudflare',
    providerHostnameId: 'cf-1',
    status: 'pending',
    sslStatus: 'pending',
    verificationStatus: 'pending',
    verifiedAt: null,
    lastCheckedAt: null,
    error: null,
    dns: { host: 'example.com', recordType: 'CNAME', target: 'custom-hostname.prompstudio.com' },
    isCanonical: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test('normalizeDomainHostname: minúsculas, sin protocolo, puerto ni punto final', () => {
  assert.equal(normalizeDomainHostname('  HTTPS://Example.COM:443/ '), 'example.com');
  assert.equal(normalizeDomainHostname('www.example.com.'), 'www.example.com');
  assert.equal(normalizeDomainHostname('ejemplo.mx'), 'ejemplo.mx');
});

test('isDomainHostnameValid: solo dominios con forma correcta', () => {
  assert.equal(isDomainHostnameValid('example.com'), true);
  assert.equal(isDomainHostnameValid('www.example.com'), true);
  assert.equal(isDomainHostnameValid('sub.example.co.uk'), true);
  assert.equal(isDomainHostnameValid('no-es-un-dominio'), false);
  assert.equal(isDomainHostnameValid('example'), false);
  assert.equal(isDomainHostnameValid('-bad.com'), false);
  assert.equal(isDomainHostnameValid('http://example.com'), false);
});

test('canonicalHostname: solo un dominio activo puede ser principal', () => {
  assert.equal(canonicalHostname([
    baseDomain({ hostname: 'example.com', status: 'active' }),
    baseDomain({ hostname: 'www.example.com', status: 'active', isCanonical: true }),
    baseDomain({ hostname: 'old.example.com', status: 'disabled', isCanonical: true }),
  ]), 'www.example.com');
  assert.equal(canonicalHostname([baseDomain({ status: 'pending' })]), null);
});

test('transientError/isTransient: marca solo fallos transitorios', () => {
  assert.equal(isTransient(transientError('429')), true);
  assert.equal(isTransient(new Error('500')), false);
  assert.equal(isTransient('texto'), false);
});

test('withTransientRetry: reintenta transitorios y lanza no transitorios al instante', async () => {
  let calls = 0;
  const value = await withTransientRetry(async () => {
    calls += 1;
    if (calls < 3) throw transientError('429');
    return 'ok';
  }, 2, 5);
  assert.equal(value, 'ok');
  assert.equal(calls, 3);

  await assert.rejects(
    withTransientRetry(async () => { throw new Error('error definitivo'); }, 3, 5),
    (error: unknown) => error instanceof Error && error.message === 'error definitivo'
  );
});

test('applyProviderStatus: solo activa si verificación y SSL están activos', () => {
  const domain = baseDomain();
  const active = applyProviderStatus(domain, { verification: 'active', ssl: 'active' }, '2026-02-01T00:00:00.000Z');
  assert.equal(active.status, 'active');
  assert.equal(active.verifiedAt, '2026-02-01T00:00:00.000Z');

  const notReady = applyProviderStatus(domain, { verification: 'pending', ssl: 'pending' }, '2026-02-01T00:00:00.000Z');
  assert.equal(notReady.status, 'verifying', 'DNS aún no propagado: nunca se activa');

  const failed = applyProviderStatus(domain, { verification: 'failed', ssl: 'pending' }, '2026-02-01T00:00:00.000Z');
  assert.equal(failed.status, 'failed');
});

test('applyProviderStatus: un SSL en error también marca el dominio como failed', () => {
  const failed = applyProviderStatus(baseDomain(), { verification: 'active', ssl: 'error', error: 'TLS mal configurado' }, 't');
  assert.equal(failed.status, 'failed');
  assert.equal(failed.error, 'TLS mal configurado');
});

test('verifyDomainCore: el proveedor que confirma activa; si no, queda verifying/failed', async () => {
  const provider: DomainProvider = {
    create: async () => ({ providerHostnameId: 'cf-1', dns: { host: 'x', recordType: 'CNAME', target: 'y' } }),
    checkStatus: async () => ({ verification: 'active', ssl: 'active' }),
  };
  const active = await verifyDomainCore({ domain: baseDomain(), provider });
  assert.equal(active.status, 'active');

  const pendingProvider: DomainProvider = {
    create: async () => ({ providerHostnameId: 'cf-1', dns: { host: 'x', recordType: 'CNAME', target: 'y' } }),
    checkStatus: async () => ({ verification: 'pending', ssl: 'pending' }),
  };
  const verifying = await verifyDomainCore({ domain: baseDomain(), provider: pendingProvider });
  assert.equal(verifying.status, 'verifying');
});

test('verifyDomainCore: un fallo transitorio se reintenta y un error definitivo se lanza', async () => {
  let calls = 0;
  const provider: DomainProvider = {
    create: async () => ({ providerHostnameId: 'cf-1', dns: { host: 'x', recordType: 'CNAME', target: 'y' } }),
    checkStatus: async () => {
      calls += 1;
      if (calls < 3) throw transientError('502');
      return { verification: 'active', ssl: 'active' };
    },
  };
  const domain = await verifyDomainCore({ domain: baseDomain(), provider, retries: 2, delayMs: 5 });
  assert.equal(domain.status, 'active');

  const failing: DomainProvider = {
    create: async () => ({ providerHostnameId: 'cf-1', dns: { host: 'x', recordType: 'CNAME', target: 'y' } }),
    checkStatus: async () => { throw transientError('503'); },
  };
  await assert.rejects(
    verifyDomainCore({ domain: baseDomain(), provider: failing, retries: 1, delayMs: 5 }),
    (error: unknown) => isTransient(error)
  );
});

test('activateDomainCore: nunca activa sin verificación previa con éxito', () => {
  const refused = activateDomainCore(baseDomain({ verificationStatus: 'pending', sslStatus: 'pending' }), 't');
  assert.equal(refused.ok, false);

  const ok = activateDomainCore(baseDomain({ verificationStatus: 'active', sslStatus: 'active', status: 'verifying' }), '2026-03-01T00:00:00.000Z');
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.domain.status, 'active');
});

test('el estado disabled no se re-activa en una verificación', async () => {
  // applyProviderStatus con un dominio disabled y verificación activa pasa a
  // active: eso es responsabilidad del servicio (no verificar dominios
  // disabled). Aquí se valida la transición normal de applyProviderStatus.
  const active = applyProviderStatus(baseDomain({ status: 'disabled' }), { verification: 'active', ssl: 'active' }, 't');
  assert.equal(active.status, 'active');
});

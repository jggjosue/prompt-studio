import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DomainProviderError,
  buildHostname,
  isFresh,
  isTransientDomainError,
  normalizeDomainTerm,
  tldOf,
  withDomainRetry,
  type DomainCheckResult,
  type DomainProvider,
} from '../../src/lib/domain-provider.ts';
import {
  authoritativeCheck,
  clearDomainSuggestionCache,
  registerDomain,
  searchDomains,
} from '../../src/lib/domain-search.ts';

function check(hostname: string, available: DomainCheckResult['available'], checkedAt = new Date().toISOString()): DomainCheckResult {
  return { hostname, tld: tldOf(hostname), available, provider: 'fake', checkedAt };
}

function fakeProvider(overrides: Partial<DomainProvider> = {}): DomainProvider & { calls: number } {
  const provider: DomainProvider & { calls: number } = {
    id: 'fake',
    calls: 0,
    async check(hostname) {
      provider.calls += 1;
      return {
        ...check(hostname, 'available'),
        price: { registration: 12, renewal: 12, currency: 'USD', period: 'year' },
      };
    },
    async getPrice(_hostname) {
      return { registration: 12, renewal: 12, currency: 'USD', period: 'year' };
    },
    async register(hostname) {
      return { orderId: `order-${hostname}`, status: 'pending' };
    },
    async getStatus() {
      return 'active';
    },
    ...overrides,
  };
  return provider;
}

test('normalizeDomainTerm y buildHostname', () => {
  assert.equal(normalizeDomainTerm('  Mi Empresa! '), 'mi-empresa');
  assert.equal(normalizeDomainTerm(''), '');
  assert.equal(buildHostname('companyname', 'com'), 'companyname.com');
  assert.equal(tldOf('companyname.com'), 'com');
});

test('searchDomains: sugiere un hostname por TLD con disponibilidad y precio', async () => {
  clearDomainSuggestionCache();
  const provider = fakeProvider();
  const results = await searchDomains('companyname', provider, ['com', 'ai']);
  assert.equal(results.length, 2);
  assert.deepEqual(results.map(r => r.hostname).sort(), ['companyname.ai', 'companyname.com']);
  assert.ok(results.every(r => r.available === 'available'));
  assert.ok(results.every(r => r.price?.registration === 12));
});

test('searchDomains: la caché de sugerencias evita repetir llamadas', async () => {
  clearDomainSuggestionCache();
  const provider = fakeProvider();
  await searchDomains('miempresa', provider, ['com']);
  const callsAfterFirst = provider.calls;
  await searchDomains('miempresa', provider, ['com']);
  assert.equal(provider.calls, callsAfterFirst, 'la segunda búsqueda reutiliza la caché');
});

test('authoritativeCheck: nunca usa caché y es fresco', async () => {
  clearDomainSuggestionCache();
  const provider = fakeProvider();
  const first = await authoritativeCheck('ejemplo.com', provider);
  await authoritativeCheck('ejemplo.com', provider);
  assert.equal(provider.calls, 2, 'sin caché: cada comprobación consulta al proveedor');
  assert.equal(isFresh(first, 60_000, Date.now()), true);
});

test('registerDomain: hace una comprobación fresca justo antes de registrar', async () => {
  clearDomainSuggestionCache();
  // La caché sugiere "available" vieja; el registro debe re-verificar.
  let checks = 0;
  const provider = fakeProvider({
    async check(hostname) {
      checks += 1;
      return check(hostname, 'available', new Date(Date.now()).toISOString());
    },
  });
  const outcome = await registerDomain('ejemplo.com', provider);
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.equal(outcome.orderId, 'order-ejemplo.com');
  assert.equal(outcome.price?.registration, 12);
  assert.ok(checks >= 1, 'el registro re-verifica disponibilidad');
});

test('registerDomain: rechaza si el dominio ya no está disponible', async () => {
  const provider = fakeProvider({
    async check(hostname) {
      return check(hostname, 'registered', new Date(Date.now()).toISOString());
    },
  });
  const outcome = await registerDomain('ejemplo.com', provider);
  assert.equal(outcome.ok, false);
  if (!outcome.ok) assert.equal(outcome.code, 'NOT_AVAILABLE');
});

test('un error transitorio del proveedor se reintenta; un error permanente no', async () => {
  let calls = 0;
  const provider = fakeProvider({
    async check(hostname) {
      calls += 1;
      if (calls < 3) throw new DomainProviderError('TRANSIENT', '502');
      return check(hostname, 'available', new Date(Date.now()).toISOString());
    },
  });
  const result = await authoritativeCheck('ejemplo.com', provider);
  assert.equal(result.available, 'available');
  assert.equal(calls, 3);

  await assert.rejects(
    authoritativeCheck('ejemplo.com', fakeProvider({
      async check() {
        throw new DomainProviderError('PERMANENT', 'error definitivo');
      },
    })),
    (error: unknown) => error instanceof DomainProviderError && error.code === 'PERMANENT'
  );
});

test('rate limit: un error RATE_LIMITED es transitorio y se reintenta', async () => {
  let calls = 0;
  const provider = fakeProvider({
    async check(hostname) {
      calls += 1;
      if (calls === 1) throw new DomainProviderError('RATE_LIMITED', '429');
      return check(hostname, 'available', new Date(Date.now()).toISOString());
    },
  });
  const result = await withDomainRetry(() => provider.check('ejemplo.com'), 2, 5);
  assert.equal(result.available, 'available');
  assert.equal(isTransientDomainError(new DomainProviderError('RATE_LIMITED', 'x')), true);
});

test('registerDomain: si el proveedor no soporta registro, devuelve error tipado', async () => {
  const provider = fakeProvider({
    async register() {
      throw new DomainProviderError('NOT_SUPPORTED', 'Registro no disponible.');
    },
  });
  const outcome = await registerDomain('ejemplo.com', provider);
  assert.equal(outcome.ok, false);
  if (!outcome.ok) assert.equal(outcome.code, 'REGISTER_FAILED');
});
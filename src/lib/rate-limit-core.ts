/**
 * Núcleo del rate limiting, sin dependencias de Next.
 *
 * Vive separado de `rate-limit.ts` para poder probarlo con `node --test`:
 * `next/server` no resuelve fuera del bundler, así que todo lo que se quiera
 * cubrir con tests tiene que quedar de este lado.
 *
 * Dos backends, se elige solo:
 *  - **Upstash Redis** (exacto, compartido entre instancias) si están definidas
 *    `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`. Se habla por REST
 *    con `fetch`, sin añadir dependencias al bundle.
 *  - **Memoria** (por instancia) como respaldo. En serverless cada lambda tiene
 *    su propio contador, así que el límite real es `limit × instancias activas`.
 *    No es exacto, pero corta en seco los abusos desde una sola IP.
 *
 * Ventana fija por `Math.floor(now / windowMs)`: barata y suficiente aquí.
 */

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Epoch en ms en que se reinicia la ventana. */
  resetAt: number;
};

export type RateLimitOptions = {
  /** Identificador del sujeto limitado, normalmente `ruta:ip`. */
  key: string;
  /** Peticiones permitidas por ventana. */
  limit: number;
  /** Duración de la ventana en milisegundos. */
  windowMs: number;
};

/** Presets para no repetir números mágicos en cada ruta. */
export const RATE_LIMITS = {
  /** Escrituras anónimas que insertan en base de datos. */
  publicWrite: { limit: 5, windowMs: 60_000 },
  /** Lecturas anónimas con cómputo apreciable en servidor. */
  publicRead: { limit: 30, windowMs: 60_000 },
  /** Acciones autenticadas que cuestan dinero (generación con IA). */
  expensiveAuthed: { limit: 10, windowMs: 60_000 },
} as const;

const memoryStore = new Map<string, { count: number; resetAt: number }>();
/** Cota del Map en memoria: evita que un atacante con IPs rotativas lo haga crecer sin fin. */
const MEMORY_STORE_MAX_ENTRIES = 10_000;

/** Solo para tests: deja el contador en memoria a cero. */
export function resetMemoryStore(): void {
  memoryStore.clear();
}

function pruneMemoryStore(now: number): void {
  for (const [key, entry] of memoryStore) {
    if (entry.resetAt <= now) memoryStore.delete(key);
  }
  if (memoryStore.size <= MEMORY_STORE_MAX_ENTRIES) return;
  // Sigue por encima del tope tras limpiar lo caducado: descarta lo más antiguo.
  const excess = memoryStore.size - MEMORY_STORE_MAX_ENTRIES;
  let removed = 0;
  for (const key of memoryStore.keys()) {
    memoryStore.delete(key);
    if (++removed >= excess) break;
  }
}

export function limitInMemory({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const resetAt = (Math.floor(now / windowMs) + 1) * windowMs;

  if (memoryStore.size > MEMORY_STORE_MAX_ENTRIES) pruneMemoryStore(now);

  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt });
    return { ok: true, limit, remaining: limit - 1, resetAt };
  }

  entry.count++;
  return {
    ok: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

function upstashConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

async function limitInRedis(
  { key, limit, windowMs }: RateLimitOptions,
  config: { url: string; token: string }
): Promise<RateLimitResult | null> {
  const now = Date.now();
  const window = Math.floor(now / windowMs);
  const resetAt = (window + 1) * windowMs;
  const redisKey = `ratelimit:${key}:${window}`;
  const ttlSeconds = Math.ceil(windowMs / 1000);

  // INCR + EXPIRE en un pipeline: una sola ida y vuelta.
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', redisKey],
      ['EXPIRE', redisKey, String(ttlSeconds), 'NX'],
    ]),
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as Array<{ result?: unknown; error?: string }>;
  const count = Number(payload?.[0]?.result);
  if (!Number.isFinite(count)) return null;

  return {
    ok: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

/**
 * Consume una unidad de cuota para `key`.
 *
 * Nunca lanza: si Redis falla, cae al contador en memoria en vez de tumbar la
 * ruta. Un limitador caído no debe convertirse en una caída del servicio.
 */
export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const config = upstashConfig();
  if (config) {
    try {
      const result = await limitInRedis(options, config);
      if (result) return result;
    } catch {
      // Se ignora a propósito y se usa el respaldo en memoria.
    }
  }
  return limitInMemory(options);
}

/**
 * IP del cliente. En Vercel `x-forwarded-for` lo fija el edge y no es
 * falsificable desde fuera; el primer valor de la lista es el cliente real.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Cabeceras `RateLimit-*` para que el cliente sepa cuánta cuota le queda. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000))),
  };
}

/** Segundos que faltan para que se reinicie la ventana, mínimo 1. */
export function retryAfterSeconds(result: RateLimitResult): number {
  return Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
}

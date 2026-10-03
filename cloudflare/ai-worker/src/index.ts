interface SecretsStoreSecret {
  get(): Promise<string>;
}

interface Env {
  /**
   * Secreto compartido con el backend Next.js.
   * El endpoint /api/ai/jobs/process lo acepta como "Authorization: Bearer <secret>"
   * a través de hasValidCronSecret().
   */
  CRON_SECRET: SecretsStoreSecret;

  /**
   * URL base del backend Next.js (e.g. https://app.promptstudio.dev).
   * Si no se configura se usa la URL de producción por defecto.
   */
  NEXTJS_UPSTREAM_URL?: string;

  /**
   * Producer binding a la Queue de AI Jobs.
   * Permite al Worker re-encolar un job si lo necesita (e.g. después de un
   * split o de una lógica de priorización interna).
   *
   * El consumer de esta Queue está declarado en cloudflare.config.ts
   * (triggers.queue) y llama al handler `queue` de este Worker.
   *
   * Arquitectura de almacenamiento (Opción C — Híbrida):
   *   - MongoDB (via Next.js HTTP):  fuente de verdad para el estado del job
   *     y todas las operaciones de créditos (ACID garantizado por Mongoose).
   *   - Cloudflare Queue:  mecanismo de despacho que reemplaza QStash/cron,
   *     con reintentos nativos y dead-letter queue.
   *
   * NO se usa Mongoose directamente en el Worker; toda la persistencia va
   * a través del endpoint Next.js con el CRON_SECRET como autenticación.
   */
  AI_JOBS_QUEUE: Queue<{ jobId: string }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private" },
  });
}

/**
 * Determina el jobId y limit a partir del request.
 * - POST: lee el body JSON { jobId?, limit? }
 * - GET:  lee los query params ?jobId=&limit=
 */
async function resolveParams(
  request: Request,
  url: URL,
): Promise<{ jobId: string | undefined; limit: number }> {
  if (request.method === "POST") {
    try {
      const body = await request.json() as Record<string, unknown>;
      const jobId =
        typeof body.jobId === "string" && body.jobId.trim()
          ? body.jobId.trim()
          : undefined;
      const rawLimit = Number(body.limit);
      const limit = Number.isFinite(rawLimit) ? Math.min(5, Math.max(1, Math.floor(rawLimit))) : 1;
      return { jobId, limit };
    } catch {
      return { jobId: undefined, limit: 1 };
    }
  }

  // GET — query params
  const jobId = url.searchParams.get("jobId")?.trim() || undefined;
  const rawLimit = Number(url.searchParams.get("limit") ?? (jobId ? 1 : 3));
  const limit = Number.isFinite(rawLimit) ? Math.min(5, Math.max(1, Math.floor(rawLimit))) : 3;
  return { jobId, limit };
}

/**
 * Construye la URL del endpoint upstream en Next.js.
 * Para GET pasamos jobId/limit como query params.
 * Para POST el body se reenvía directamente.
 */
function buildUpstreamUrl(
  upstreamBase: string,
  method: string,
  jobId: string | undefined,
  limit: number,
): string {
  const base = upstreamBase.replace(/\/$/, "");
  const target = new URL(`${base}/api/ai/jobs/process`);
  if (method === "GET") {
    if (jobId) target.searchParams.set("jobId", jobId);
    target.searchParams.set("limit", String(limit));
  }
  return target.toString();
}

// ─── Worker ──────────────────────────────────────────────────────────────────

export default {
  // ── HTTP handler ────────────────────────────────────────────────────────────
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ── Health check ────────────────────────────────────────────────────────
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "prompt-studio-ai" });
    }

    // ── AI jobs processor ───────────────────────────────────────────────────
    if (
      url.pathname === "/api/ai/jobs/process" &&
      ["GET", "POST"].includes(request.method)
    ) {
      // 1. Obtener el secreto del Secrets Store
      let secret: string;
      try {
        secret = await env.CRON_SECRET.get();
      } catch {
        return json({ error: "Worker secret not available" }, 503);
      }

      if (!secret) {
        return json({ error: "CRON_SECRET is not configured" }, 503);
      }

      // 2. Resolver parámetros (jobId, limit)
      const { jobId, limit } = await resolveParams(request.clone() as unknown as Request, url);

      // 3. Resolver URL upstream
      const upstreamBase =
        env.NEXTJS_UPSTREAM_URL?.trim() || "https://app.promptstudio.dev";
      const upstreamUrl = buildUpstreamUrl(
        upstreamBase,
        request.method,
        jobId,
        limit,
      );

      // 4. Construir body para POST
      const upstreamBody =
        request.method === "POST"
          ? JSON.stringify({ jobId, limit })
          : undefined;

      // 5. Llamar al backend Next.js con el secreto como Authorization
      let upstreamResponse: Response;
      try {
        upstreamResponse = await fetch(upstreamUrl, {
          method: request.method,
          headers: {
            "Authorization": `Bearer ${secret}`,
            "Content-Type": "application/json",
            "X-Forwarded-By": "prompt-studio-ai-worker",
          },
          body: upstreamBody,
          // Cloudflare Workers tienen un timeout máximo; la función Next.js
          // tiene maxDuration=300 s así que damos margen suficiente.
          signal: AbortSignal.timeout(290_000),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown upstream error";
        return json({ error: "Upstream unreachable", detail: message }, 502);
      }

      // 6. Parsear y reenviar la respuesta
      let responseBody: Record<string, unknown>;
      try {
        responseBody = await upstreamResponse.json() as Record<string, unknown>;
      } catch {
        return json(
          { error: "Invalid response from upstream", status: upstreamResponse.status },
          502,
        );
      }

      // Normalizar la respuesta al contrato esperado por el Worker
      // { processed: [...], count: number }
      const processed = Array.isArray(responseBody.processed)
        ? responseBody.processed
        : [];
      const count =
        typeof responseBody.count === "number" ? responseBody.count : processed.length;

      return json(
        { processed, count },
        upstreamResponse.ok ? 200 : upstreamResponse.status,
      );
    }

    return json({ error: "Not found" }, 404);
  },

  // ── Queue consumer ──────────────────────────────────────────────────────────
  /**
   * Se invoca cuando la Cloudflare Queue entrega mensajes al Worker.
   * Cada mensaje tiene la forma `{ jobId: string }`.
   *
   * Estrategia de almacenamiento (Opción C — Híbrida):
   *   - MongoDB sigue siendo la fuente de verdad (estado del job, créditos,
   *     auditoría). El acceso va SIEMPRE a través de la API HTTP de Next.js.
   *   - La Queue gestiona el ciclo de vida del despacho: entrega, reintentos
   *     y dead-letter. No requiere ningún store adicional en el Worker.
   *
   * Semántica de ack/retry:
   *   - 2xx upstream  → msg.ack()   (éxito; MongoDB ya actualizó el estado)
   *   - 5xx / timeout → msg.retry() (error transitorio; la Queue reintentará)
   *   - 4xx upstream  → msg.ack()   (error permanente; no reintentar para
   *     evitar bucles; el job quedará en estado de error en MongoDB)
   */
  async queue(
    batch: MessageBatch<{ jobId: string }>,
    env: Env,
  ): Promise<void> {
    // Obtener el secreto una vez por batch (todas las llamadas lo comparten)
    let secret: string;
    try {
      secret = await env.CRON_SECRET.get();
    } catch {
      // Si el secreto no está disponible, reintentamos el batch completo
      batch.retryAll();
      return;
    }

    const upstreamBase =
      env.NEXTJS_UPSTREAM_URL?.trim() || "https://app.promptstudio.dev";
    const upstreamUrl = buildUpstreamUrl(upstreamBase, "POST", undefined, 1);

    for (const msg of batch.messages) {
      const { jobId } = msg.body;

      try {
        const res = await fetch(upstreamUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${secret}`,
            "Content-Type": "application/json",
            "X-Forwarded-By": "prompt-studio-ai-worker/queue",
          },
          body: JSON.stringify({ jobId, limit: 1 }),
          signal: AbortSignal.timeout(290_000),
        });

        if (res.ok) {
          // Job procesado con éxito; MongoDB ya actualizó el estado
          msg.ack();
        } else if (res.status >= 500) {
          // Error transitorio del servidor; la Queue reintentará
          console.error(
            `[queue] jobId=${jobId} upstream error ${res.status}; retrying`,
          );
          msg.retry();
        } else {
          // 4xx: error permanente (ej. job no encontrado, ya procesado)
          // Hacemos ack para no llenar la DLQ con mensajes irrecuperables
          console.warn(
            `[queue] jobId=${jobId} upstream client error ${res.status}; acking to avoid loop`,
          );
          msg.ack();
        }
      } catch (error) {
        // Error de red o timeout → reintentamos
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `[queue] jobId=${jobId} fetch failed: ${message}; retrying`,
        );
        msg.retry();
      }
    }
  },
};


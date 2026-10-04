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
  /**
   * Clave API para generación de imágenes/visión.
   * Usado cuando el worker procesa el job de forma autónoma.
   */
  GEMINI_API_KEY?: string;
}

// ─── AI Providers (Direct Fetch) ─────────────────────────────────────────────

async function generateImageDirectly(prompt: string, model: string, apiKey: string) {
  const resolvedModel = model.includes("/") ? model : `googleai/${model}`;
  
  // En Google AI Studio, el endpoint para generar imágenes con Gemini es predict/generateImages
  // o el nuevo `models/imagen-3.0-generate-001:predict`.
  // Para simplificar, asumiremos que usamos la API estándar de Gemini para imágenes.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image API error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await response.json() as any;
  const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64Image) {
    throw new Error("No image data returned from provider");
  }

  return {
    result: { imageUrl: `data:image/jpeg;base64,${base64Image}` },
    usage: { inputTokens: 0, outputTokens: 0, costUsd: 0.03 } // aprox
  };
}

// ─── Queue consumer ──────────────────────────────────────────────────────────
  async queue(
    batch: MessageBatch<{ jobId: string }>,
    env: Env,
  ): Promise<void> {
    let secret: string;
    try {
      secret = await env.CRON_SECRET.get();
    } catch {
      batch.retryAll();
      return;
    }

    const upstreamBase = env.NEXTJS_UPSTREAM_URL?.trim() || "https://app.promptstudio.dev";
    const claimUrl = `${upstreamBase.replace(/\/$/, "")}/api/ai/jobs/worker/claim`;
    const resolveUrl = `${upstreamBase.replace(/\/$/, "")}/api/ai/jobs/worker/resolve`;
    const fallbackUrl = buildUpstreamUrl(upstreamBase, "POST", undefined, 1);

    for (const msg of batch.messages) {
      const { jobId } = msg.body;
      const startTime = Date.now();

      try {
        // 1. Reclamar el trabajo
        const claimRes = await fetch(claimUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobId, owner: "cloudflare-ai-worker", leaseMs: 5 * 60000 }),
        });

        if (!claimRes.ok) {
          msg.retry();
          continue;
        }

        const claimData = await claimRes.json() as any;
        if (claimData.exhausted) {
          msg.ack(); // Se acabaron los intentos
          continue;
        }
        if (!claimData.claimed) {
          msg.ack(); // Alguien más lo tomó o no es procesable
          continue;
        }

        const { kind, input, lockToken, provider, modelId } = claimData;

        // 2. Procesar Autónomamente (solo imágenes por ahora)
        if (kind === "image" && env.GEMINI_API_KEY) {
          try {
            console.log(`[queue] Processing image job ${jobId} autonomously`);
            const prompt = input.prompt;
            const { result, usage } = await generateImageDirectly(prompt, modelId || "imagen-3.0-generate-001", env.GEMINI_API_KEY);
            
            // 3. Resolver el trabajo
            await fetch(resolveUrl, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${secret}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jobId,
                lockToken,
                result,
                durationMs: Date.now() - startTime,
                usage,
              }),
            });
            msg.ack();
          } catch (error: any) {
            console.error(`[queue] Image processing failed for ${jobId}: ${error.message}`);
            await fetch(resolveUrl, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${secret}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jobId,
                lockToken,
                error: error.message,
                errorCategory: 'provider_error'
              }),
            });
            msg.retry(); // Reencola para que la Queue reintente
          }
        } else {
          // Fallback para texto, video, web, o si no hay API key: usa el monolito
          console.log(`[queue] Falling back to Next.js monolithic processing for ${jobId} (${kind})`);
          const res = await fetch(fallbackUrl, {
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
            msg.ack();
          } else if (res.status >= 500) {
            msg.retry();
          } else {
            msg.ack();
          }
        }
      } catch (error) {
        msg.retry();
      }
    }
  },
};


# Cola de generación de IA

La cola usa MongoDB como almacenamiento durable. El navegador crea un trabajo y consulta su estado; el cron protegido reclama trabajos mediante un lease, por lo que una petición del usuario no permanece abierta.

## Crear un trabajo

`POST /api/ai/jobs` requiere sesión y el header `Idempotency-Key` (mínimo 8 caracteres).

```json
{
  "kind": "image",
  "provider": "google",
  "input": { "prompt": "Fotografía editorial de producto…" },
  "notifyOnComplete": true
}
```

Tipos y costos actuales: `image` (1 crédito), `video` (3) y `project` (2). El servidor define el costo; el cliente no puede modificarlo.

## Procesamiento

- Vercel invoca `GET /api/ai/jobs/process?limit=3` cada minuto usando `CRON_SECRET`.
- Google Image puede ejecutarse localmente. Video, proyectos y otros proveedores se delegan a `AI_GENERATION_WORKER_URL`.
- El worker recibe `jobId`, `kind`, `provider` e `input`, junto con `Idempotency-Key` y un bearer token.
- Puede reportar avances (10–95) con `PATCH /api/ai/jobs/:id/progress` usando `AI_GENERATION_WORKER_TOKEN`.
- Debe guardar artefactos grandes en almacenamiento privado y devolver URLs; la respuesta JSON está limitada a 2 MB.

Los fallos se reintentan tres veces con backoff. Los créditos se reservan al crear, se capturan al completar y se devuelven tras el fallo definitivo. Cada movimiento queda en `ai_credit_ledger`.

# SOP — Generación con IA

Procedimiento del ciclo de vida completo de un trabajo de generación, desde que
el usuario lo pide hasta que se entrega o se devuelve el crédito.

Implementación: [`src/app/api/ai/jobs/route.ts`](../../src/app/api/ai/jobs/route.ts)
(creación), [`src/app/api/ai/jobs/process/route.ts`](../../src/app/api/ai/jobs/process/route.ts)
(procesamiento), [`src/lib/ai-job-service.ts`](../../src/lib/ai-job-service.ts)
(créditos).

## 1. Catálogo de operaciones soportadas

| Tipo | Créditos | Coste estimado | Proveedores admitidos |
|---|---|---|---|
| `image` | 1 | $0,04 | google, openai, fal, replicate |
| `video` | 3 | $0,35 | runway, veo, kling, luma, pika, hailuo, sora |
| `project` | 2 | $0,08 | google, openai, anthropic, deepseek |

Definidos en [`src/lib/ai-job-config.ts`](../../src/lib/ai-job-config.ts). El par
tipo/proveedor se valida en servidor: una combinación no listada se rechaza con
400.

## 2. Alta del trabajo

Precondiciones que se comprueban **en este orden**, y cada una corta:

1. **Sesión activa.** Sin `userId` → 401.
2. **Cuota.** 10 creaciones por minuto **por usuario**, no por IP: el coste se
   imputa a la cuenta, así que limitar por IP dejaría abusar desde varias
   conexiones. Superarla → 429 con `Retry-After`.
3. **Tipo válido** → 400.
4. **Tamaño del payload.** `input` serializado por encima de 50.000 caracteres →
   413. El prompt se recorta a 20.000.
5. **Clave de idempotencia.** Cabecera `Idempotency-Key` de 8 caracteres o más.
   Sin ella → 400.
6. **Correo principal** en la cuenta de Clerk → 400 si falta.

### Idempotencia

El índice único `{ userId, idempotencyKey }` sobre `AIGenerationJob` es lo que
garantiza que un reenvío —por doble clic, por reintento de red— **no crea un
segundo trabajo ni cobra dos veces**. Antes de insertar se busca el existente y,
si está, se devuelve ese.

No es una optimización: es la garantía. Quien toque ese índice rompe el cobro.

### Reserva de créditos

Se reservan **antes** de llamar al proveedor. La cuenta
(`AICreditAccount`) separa `balance` de `reserved` justamente para esto: el
saldo comprometido no se puede gastar dos veces, y si la generación falla se
devuelve sin haber llegado a cobrarse.

Cada movimiento queda en `AICreditLedger`, que es append-only. La cuenta es el
agregado; el ledger, la historia auditable.

## 3. Procesamiento

Lo ejecuta un cron de Vercel, **cada minuto, hasta 3 trabajos por pasada**
(`vercel.json`). El endpoint exige `CRON_SECRET` con comparación en tiempo
constante.

La creación nunca espera al proveedor. Esto es deliberado: un proveedor de vídeo
puede tardar minutos y la petición del usuario no puede quedarse abierta.

### Reclamo del trabajo

Un solo `findOneAndUpdate` atómico selecciona el siguiente candidato y le fija
un **arrendamiento de 5 minutos** (`leaseExpiresAt`). El índice
`{ status, nextAttemptAt, leaseExpiresAt }` sirve a esa consulta.

Consecuencia práctica: si el procesador muere a mitad, el arrendamiento caduca y
otro lo recoge pasados 5 minutos. No hace falta intervención manual.

### Progreso

El trabajo publica avance para que la interfaz lo muestre: 10 % al reclamarlo,
35 % al empezar a generar, 100 % al terminar.

## 4. Fallos y reintentos

Al fallar el proveedor se guarda `lastError` (recortado a 500 caracteres) y:

- **Si quedan intentos** (`attempts < maxAttempts`, por defecto 3, tope 5):
  estado `retrying` y nuevo intento con **backoff exponencial de
  `2^(attempts-1)` minutos** — es decir 1, 2, 4 minutos.
- **Si se agotaron**: estado `failed`, **se devuelven los créditos**
  (`refundCredits`), se notifica al usuario y se registra un evento
  `ai_generation / generation_failed` en observabilidad con proveedor, intentos
  y coste estimado.

**Regla operativa: un fallo del proveedor nunca consume saldo del usuario.** Si
alguna vez se observa lo contrario, es un incidente, no un comportamiento
esperado.

## 5. Qué revisar cuando algo va mal

| Síntoma | Dónde mirar |
|---|---|
| Trabajos atascados en `queued` | ¿Corre el cron? ¿`CRON_SECRET` coincide entre Vercel y el entorno? |
| Trabajos atascados en `processing` | `leaseExpiresAt` en el pasado significa que el procesador murió; se recogerá solo |
| Saldo descuadrado | Comparar `AICreditAccount` con la suma de `AICreditLedger`; el ledger manda |
| Fallos repetidos de un proveedor | Filtrar observabilidad por `category: ai_generation`, `status: failed`, agrupando por `metadata.provider` |
| Usuario dice que pagó y no recibió | Buscar por `{ userId, idempotencyKey }`; si el estado es `failed`, comprobar que `creditsState` sea `refunded` |

Panel: `/dashboard/observability` (solo el correo administrador configurado).

## 6. Lo que este procedimiento no cubre

No se registra **ninguna valoración humana del resultado**. Se sabe si el
proveedor devolvió algo y cuánto costó, no si sirvió. Ver
[feedback-ia.md](feedback-ia.md).

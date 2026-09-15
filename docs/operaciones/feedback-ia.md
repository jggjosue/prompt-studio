# Feedback sobre salidas de IA

Qué se registra de cada generación, incluido el juicio humano sobre el
resultado.

## 1. Traza de ejecución

`AIGenerationJob` guarda por cada trabajo:

| Campo | Contenido |
|---|---|
| `userId`, `userEmail` | Quién lo pidió |
| `kind` | `image` \| `video` \| `project` |
| `provider` | google, openai, fal, replicate, runway, veo, kling, luma, pika, hailuo, sora, anthropic, deepseek |
| `input` | El prompt y la configuración enviada |
| `result` | Lo que devolvió el proveedor |
| `status` | `queued` \| `processing` \| `retrying` \| `completed` \| `failed` |
| `attempts` / `maxAttempts` | Intentos consumidos |
| `lastError` | Mensaje del proveedor al fallar, recortado a 500 caracteres |
| `creditCost` / `estimatedCostUsd` | Coste en créditos y en dólares |
| `createdAt`, `startedAt`, `completedAt` | Latencia real de extremo a extremo |

Y en `ObservabilityEvent`, categoría `ai_generation`: finalización, fallo,
intentos, créditos y coste estimado.

Responde a **qué se pidió, a quién, cuánto tardó, cuánto costó y si el proveedor
respondió**. No responde a si el resultado sirvió: `status: 'completed'`
significa que el proveedor devolvió algo, nada más.

## 2. Juicio humano

Colección `ai_generation_feedback`
([`src/models/AIGenerationFeedback.ts`](../../src/models/AIGenerationFeedback.ts)):

| Campo | Contenido |
|---|---|
| `jobId`, `userId` | A qué generación y de quién |
| `kind`, `provider` | Copiados del trabajo |
| `useful` | El veredicto |
| `reason` | Solo en negativas: no sigue el prompt, baja calidad, incorrecto, lento, otro |
| `comment` | Texto libre, opcional, hasta 1.000 caracteres |
| `createdAt`, `updatedAt` | Se puede cambiar de opinión |

**Índice único `{ jobId, userId }`** — una valoración por usuario y trabajo,
actualizable. Sin él, un doble clic crearía dos.

**Índice `{ provider, kind, createdAt }`** — sirve a la consulta principal: tasa
de aprobación por proveedor y tipo a lo largo del tiempo.

`kind` y `provider` se copian del trabajo. Es redundante, pero permite agregar
sin `$lookup`. En `AIGenerationJob` se denormaliza `feedbackUseful` para filtrar
sin cruzar colecciones; retirar la valoración lo devuelve a `null`.

### Interfaz

Pulgar arriba y abajo en cada generación terminada de `/dashboard/generations`.
Volver a pulsar la opción activa retira la valoración.

El motivo se pide **solo al marcar negativo**, y es opcional: exigirlo siempre
hunde la tasa de respuesta, y una valoración sin motivo ya es la señal que antes
no existía.

### API

`POST` y `DELETE` en `/api/ai/jobs/[id]/feedback`:

- Sesión obligatoria en ambas.
- El trabajo se busca con `{ _id, userId }`: uno ajeno responde igual que uno
  inexistente, así que no se puede deducir su existencia.
- Rechaza con 409 los trabajos que aún no han terminado — en cola o procesando
  no hay resultado que juzgar.
- Upsert contra el índice único: idempotente.
- 20 por minuto **por usuario**.
- Deja un `ObservabilityEvent` `ai_generation / generation_feedback`. El
  comentario **no** se copia ahí: es texto libre y puede contener datos
  personales, así que solo se registra si lo hubo.

## 3. Qué permite responder

| Pregunta | Cómo |
|---|---|
| ¿Qué proveedor da mejores resultados por tipo? | Tasa de `useful` agrupando por `provider` y `kind` |
| ¿Se ha degradado un modelo tras actualizarse? | La misma tasa como serie temporal |
| ¿Qué prompts producen salidas que se descartan? | Cruzar `jobId` con el `input` del trabajo |
| ¿Qué falla más? | Distribución de `reason` en las negativas |
| Prueba social honesta | «X de Y personas encontraron útil este resultado» |

## 4. Lo que el código no resuelve

Tres cosas que siguen abiertas y que no se arreglan programando:

- **Consentimiento para licenciar.** La política de privacidad declara que los
  datos de usuario no se usan para entrenar modelos salvo consentimiento
  específico. Estas valoraciones son datos de usuario. Un opt-in retroactivo no
  vale bajo GDPR: si algún día se licencian, hay que pedirlo **en el momento de
  valorar**, y hoy no se pide. El esquema no finge lo contrario: no tiene campo
  de consentimiento, y hay un test que lo impide.
- **Saneado de PII.** El comentario libre puede contener datos personales. En
  observabilidad no se guarda su contenido, pero la colección sí. Cualquier
  exportación necesita saneado previo.
- **Propiedad.** Los Términos no dicen de quién son las valoraciones.

## 5. Estado

Implementado. Lo que falta es **tiempo**: la señal solo vale con volumen
acumulado, y un dataset de preferencia con veinte valoraciones no le interesa a
nadie. La utilidad para el producto —ordenar el catálogo por lo que funciona,
elegir proveedor— llega antes que la utilidad como dato licenciable.

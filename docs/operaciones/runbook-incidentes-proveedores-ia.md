# Runbook — Incidentes de proveedores de IA

Guía de respuesta para degradaciones o caídas de los proveedores usados por la
generación de imágenes, vídeo y proyectos. Complementa el
[SOP de generación](sop-generacion-ia.md): el SOP describe el flujo normal; este
documento define cómo declarar, contener, recuperar y cerrar un incidente.

## 1. Alcance y fuentes de verdad

| Tipo | Proveedores admitidos |
|---|---|
| `image` | google, openai, fal, replicate |
| `video` | runway, veo, kling, luma, pika, hailuo, sora |
| `project` | google, openai, anthropic, deepseek |

El catálogo efectivo vive en
[`src/lib/ai-job-config.ts`](../../src/lib/ai-job-config.ts). Las fuentes
operativas son:

- `/dashboard/observability`: eventos de la cola y sus identificadores de
  correlación; acceso administrativo.
- `/dashboard/provider-quality`: tasa de éxito, latencia, reintentos, coste y
  errores normalizados de los últimos trabajos terminales; acceso
  administrativo.
- El panel del proveedor y su página oficial de estado: confirman cuota,
  credenciales, mantenimiento o una caída externa.
- `AIGenerationJob`, `AICreditAccount` y `AICreditLedger`: estado del trabajo y
  contabilidad. El ledger append-only es la fuente auditable del saldo.

No copiar prompts, resultados, correos, secretos ni otros datos personales al
canal del incidente. Para correlacionar, usar `jobId`, `correlationId`, tipo,
proveedor, código de error y marcas de tiempo.

## 2. Severidad y declaración

| Nivel | Criterio práctico | Respuesta |
|---|---|---|
| SEV-1 | Posible exposición de secretos/datos, cobro incorrecto o pérdida de la garantía de créditos | Declarar de inmediato, detener la operación afectada y escalar a seguridad/finanzas |
| SEV-2 | Proveedor o tipo completo indisponible, cola sin avanzar o impacto amplio | Responsable del incidente y actualización interna cada 30 minutos |
| SEV-3 | Degradación parcial, latencia alta o aumento de fallos con alternativa disponible | Contener, vigilar y actualizar al cambiar el estado |
| SEV-4 | Un trabajo o usuario aislado, sin patrón común | Soporte normal y seguimiento por `jobId` |

Disparadores orientativos para revisión manual: tres fallos del mismo proveedor
en diez minutos, tasa de éxito inferior a 80 % con al menos diez muestras, o el
trabajo en cola más antiguo por encima de cinco minutos. Son umbrales de este
procedimiento, **no alertas automáticas implementadas**.

## 3. Primeros diez minutos

1. Abrir el registro del incidente: hora UTC, responsable, severidad, tipo,
   proveedor, entorno y primera evidencia.
2. Comprobar alcance en los dos paneles: un trabajo, un proveedor, un tipo o
   toda la cola. Guardar únicamente IDs y métricas no sensibles.
3. Clasificar el error con la taxonomía de la sección 4 y contrastar el estado
   oficial del proveedor.
4. Para una cola detenida, verificar el cron de `/api/ai/jobs/process`, su
   frecuencia y que `CRON_SECRET` coincida en el entorno. No imprimir el valor.
5. Verificar invariantes antes de intervenir: no duplicar trabajos, no mutar el
   estado directamente y no consumir créditos de un trabajo fallido.
6. Elegir una contención de la sección 5, registrar quién la aplica y fijar la
   siguiente revisión.

Eventos útiles de `category: ai_generation`:

- `generation_completed`: confirma recuperación con proveedor, duración e ID.
- `generation_retry_scheduled`: el backoff automático sigue activo.
- `generation_failed`: agotó intentos; debe terminar con créditos reembolsados.

## 4. Matriz de diagnóstico

La normalización se implementa en
[`src/lib/provider-quality.ts`](../../src/lib/provider-quality.ts).

| Código | Comprobación | Contención segura |
|---|---|---|
| `authentication` | Vigencia y alcance de la credencial en el servidor; cambios recientes de entorno | Detener llamadas al proveedor afectado. Rotar solo desde el gestor de secretos si hay compromiso; nunca versionar la clave |
| `rate_limit` | Cuota, ventana de reinicio y crecimiento del tráfico | Evitar reintentos manuales en masa; reducir tráfico o seleccionar otro proveedor admitido |
| `timeout` | Latencia, estado externo y región | Permitir backoff; desviar nuevas solicitudes cuando exista alternativa compatible |
| `provider_unavailable` | Estado oficial y errores 5xx | Igual que `timeout`; comunicar dependencia externa si el impacto continúa |
| `content_policy` | Entrada y política aplicable, sin copiar contenido sensible | Tratarlo como rechazo del trabajo, no como caída; no eludir los controles de seguridad |
| `invalid_request` | Contrato de entrada, modelo y despliegue reciente | Corregir o revertir el cambio incompatible; no reintentar el mismo payload sin modificación |
| `provider_error` | Muestra representativa, despliegue y estado externo | Contener como degradación hasta identificar el patrón |
| `unknown` | Integridad de la observabilidad y error original protegido | Escalar con IDs de correlación; no publicar el mensaje bruto si contiene datos sensibles |

## 5. Contención por escenario

### Un proveedor degradado

- Dejar que los trabajos existentes sigan el backoff automático de 1, 2 y 4
  minutos. No disparar una tormenta de reintentos.
- Para solicitudes nuevas, elegir manualmente otro proveedor del mismo tipo
  cuando el flujo lo permita.
- La selección `auto` excluye modelos marcados como degradados para el usuario y
  tipo actuales; no equivale a un corte global del proveedor.
- No existe hoy un interruptor global en tiempo de ejecución. Bloquear por
  completo un proveedor requiere un cambio de código/configuración y despliegue,
  con su rollback preparado.

### Toda la cola detenida

- Confirmar que el cron se ejecuta cada minuto y que su autorización no devuelve
  401.
- Un trabajo `processing` con `leaseExpiresAt` vencido debe ser reclamado de
  nuevo automáticamente. El lease normal es de cinco minutos.
- Tras restaurar cron o secreto, procesar lotes pequeños (el endpoint admite un
  límite de 1 a 5) y observar éxito, latencia y crecimiento de la cola.
- No editar `status`, `attempts` o `leaseExpiresAt` directamente en la base.

### Créditos o idempotencia en riesgo

- Elevar a SEV-1. Pausar la operación afectada y preservar ledger, IDs y marcas
  de tiempo.
- Comparar cuenta y ledger; no “arreglar” el saldo con una edición manual.
- Un fallo final debe llamar a `refundCredits`. Una discrepancia requiere una
  corrección auditada e idempotente antes de reanudar.

## 6. Recuperación y verificación

1. Confirmar estabilidad externa y observar al menos diez trabajos nuevos o 15
   minutos sin el patrón de fallo, lo que ocurra después.
2. Verificar `generation_completed` para cada tipo reactivado y que la latencia
   vuelve a su rango habitual.
3. Confirmar que los trabajos `retrying` drenan y que no quedan leases vencidos
   acumulándose.
4. Muestrear fallos finales: `creditsState` debe ser `refunded` y el ledger debe
   contener el movimiento correspondiente.
5. Solo después de recuperar el proveedor, el propietario puede reintentar un
   trabajo `failed` mediante `/api/ai/jobs/[id]/retry`. El endpoint vuelve a
   reservar créditos y puede responder 402 si ya no hay saldo suficiente.
6. Cerrar la contención gradualmente y registrar hora, evidencia y responsable.

## 7. Rollback

- Si el incidente coincide con un despliegue de adaptador, modelo o contrato,
  revertir ese cambio y validar un trabajo canario antes de ampliar tráfico.
- Si coincide con una credencial, restaurar o rotar el secreto desde la
  plataforma y volver a desplegar; jamás copiarlo al repositorio o al incidente.
- Si se desplegó un bloqueo temporal de proveedor, revertirlo únicamente después
  de cumplir la verificación de recuperación.
- Si el rollback falla, mantener la contención, no forzar estados de trabajos y
  escalar la severidad.

## 8. Comunicación

Actualización interna mínima:

> [SEV-N] Proveedor/tipo afectado desde [hora UTC]. Impacto: [alcance].
> Contención: [acción]. Créditos: [verificados/por verificar]. Próxima revisión:
> [hora UTC]. Responsable: [rol].

Mensaje externo, solo si hay impacto visible:

> Las generaciones de [tipo] presentan retrasos o fallos temporales. Los
> trabajos fallidos no consumirán sus créditos. Estamos recuperando el servicio
> y publicaremos una actualización cuando se normalice.

No atribuir la causa al proveedor hasta confirmarla y no prometer una hora de
recuperación sin evidencia.

## 9. Cierre y postmortem

Cerrar solo cuando la recuperación esté verificada, la cola esté drenando y la
contabilidad sea correcta. En un máximo de dos días hábiles para SEV-1/SEV-2,
registrar:

- línea de tiempo, impacto y detección;
- causa raíz y factores contribuyentes;
- qué funcionó y qué prolongó el incidente;
- acciones con responsable, fecha y prueba de cierre;
- necesidad de alerta, proveedor alternativo o interruptor global.

Ejecutar un simulacro trimestral alternando caída de proveedor, cron detenido y
credencial inválida. El simulacro no debe usar secretos reales ni generar gasto
externo innecesario.

## 10. Implementación verificable

- Cola, lease, eventos, reintentos y reembolso:
  [`src/app/api/ai/jobs/process/route.ts`](../../src/app/api/ai/jobs/process/route.ts).
- Reintento manual y reserva de crédito:
  [`src/app/api/ai/jobs/[id]/retry/route.ts`](../../src/app/api/ai/jobs/%5Bid%5D/retry/route.ts).
- Métricas y taxonomía:
  [`src/lib/provider-quality.ts`](../../src/lib/provider-quality.ts) y
  [`src/lib/provider-quality-server.ts`](../../src/lib/provider-quality-server.ts).
- Invariantes de crédito:
  [`src/lib/ai-job-service.ts`](../../src/lib/ai-job-service.ts).


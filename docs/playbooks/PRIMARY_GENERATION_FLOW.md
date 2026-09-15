# Flujo principal de generación

**Backlog:** [DOC-008](https://github.com/jggjosue/prompt-studio/issues/40) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32)

Usa esta guía al modificar la experiencia que convierte un prompt en una imagen,
video o página web. El flujo interactivo y la cola durable son intencionalmente
distintos: no cambies uno suponiendo que el otro se ejecuta en la misma ruta.

## Etapas y responsables

```mermaid
flowchart LR
    P[Localized page] --> U[Client editor]
    U --> S[useGenerationEditor state]
    S --> R[generationProviders registry]
    R --> A[Server actions]
    A --> X[Provider response]
    X --> S
    S --> O[Preview, code or error]

    J[POST /api/ai/jobs] --> Q[AIGenerationJob]
    Q --> W[/api/ai/jobs/process]
    W --> V[validate, capture or refund]
```

| Etapa | Responsabilidad | Implementación |
|---|---|---|
| Página | Declara metadatos y carga el editor dentro de `Suspense` | [Image page](<../../src/app/[locale]/generate-images/page.tsx>), [Video page](<../../src/app/[locale]/generate-videos/page.tsx>), [Web page](<../../src/app/[locale]/generate-webs/page.tsx>) |
| Acceso web | Exige sesión y plan de descarga antes de montar el editor web | [Web page gate](<../../src/app/[locale]/generate-webs/page.tsx>), [`src/lib/server-subscription-status.ts`](../../src/lib/server-subscription-status.ts) |
| UI y formulario | Mantiene el prompt, proveedor, parámetros, historial y el submit de cada producto | [Image editor](<../../src/app/[locale]/generate-images/prompt-editor-client.tsx>), [Video editor](<../../src/app/[locale]/generate-videos/generate-videos-client.tsx>), [Web editor](<../../src/app/[locale]/generate-webs/generate-webs-client.tsx>) |
| Estado de generación | Expone progreso, estado, resultado y error; los clientes llaman `beginGeneration`, `finishGeneration` o `failGeneration` | [`src/hooks/use-generation-editor.ts`](../../src/hooks/use-generation-editor.ts), [`src/components/generation/generation-feedback.tsx`](../../src/components/generation/generation-feedback.tsx) |
| Servicio cliente | Aísla las formas de respuesta específicas de proveedor y llama a las server actions | [`src/lib/generation/provider-adapters.ts`](../../src/lib/generation/provider-adapters.ts) |
| Límite servidor | Las server actions validan/transforman la comunicación con OpenAI, Anthropic, Google, Runway y DeepSeek | [`src/app/actions.ts`](../../src/app/actions.ts) |
| Resultado | El editor almacena URL de imagen/video o HTML, actualiza el preview y presenta errores normalizados | [`src/hooks/use-generation-editor.ts`](../../src/hooks/use-generation-editor.ts), [`src/components/generation/generation-cost-disclosure.tsx`](../../src/components/generation/generation-cost-disclosure.tsx) |

## Camino interactivo

1. Una página localizada monta su cliente correspondiente. La página de webs
   valida sesión y suscripción antes de renderizar; imágenes y videos no hacen
   ese gate en su page entry point.
2. El cliente prepara el prompt y las opciones del proveedor en
   `handleGenerationSubmit`, y cambia el estado de UI mediante
   [`useGenerationEditor`](../../src/hooks/use-generation-editor.ts).
3. El cliente invoca el adaptador de
   [`generationProviders`](../../src/lib/generation/provider-adapters.ts). El
   registro evita que cada editor importe directamente cada server action y
   contiene el modo determinista de E2E.
4. La server action de [`src/app/actions.ts`](../../src/app/actions.ts) llama al
   proveedor y devuelve su respuesta. Runway es el caso asíncrono de este flujo:
   el cliente inicia la tarea y hace polling a través del mismo registro.
5. El cliente extrae el resultado y actualiza `outputImageUrl`, `outputVideoUrl`
   u `outputWebHTML`; ante fallo llama `failGeneration` para que el feedback
   sea consistente.

El estado de este camino es estado de interfaz. No representa el ledger de
créditos ni sustituye una ejecución durable.

## Camino durable de jobs

Para generación que necesita reserva de créditos, idempotencia, reintentos y
procesamiento externo, el contrato es el de jobs:

1. [`POST /api/ai/jobs`](../../src/app/api/ai/jobs/route.ts) valida el request,
   crea [`AIGenerationJob`](../../src/models/AIGenerationJob.ts) y reserva
   créditos mediante [`ai-job-service.ts`](../../src/lib/ai-job-service.ts).
2. [`/api/ai/jobs/process`](../../src/app/api/ai/jobs/process/route.ts) reclama
   el job y ejecuta [`runAIJob`](../../src/lib/ai-job-runner.ts).
3. El resultado válido se captura; los fallos terminales reembolsan. El worker
   puede publicar progreso en
   [`PATCH /api/ai/jobs/:id/progress`](<../../src/app/api/ai/jobs/[id]/progress/route.ts>).
4. El estado persistente, clave de idempotencia y resultado pertenecen a
   [`AIGenerationJob`](../../src/models/AIGenerationJob.ts), no al hook de UI.

El diseño completo de estados, créditos y contratos de salida está en
[AI Generation playbook](AI_GENERATION.md) y
[AI_ARCHITECTURE.md](../AI_ARCHITECTURE.md).

## Invariantes de cambio

1. Mantén la forma específica de proveedor dentro del adaptador o server action;
   los editores no deben aprender contratos de cada API externa.
2. Conserva los tres resultados del hook (imagen, video y HTML) y el feedback
   de error al agregar una modalidad de UI.
3. No uses el estado local para declarar una generación cobrada o duradera.
   Para ello usa la API de jobs y su ciclo reserve/capture/refund.
4. Los cambios en gates de acceso de `/generate-webs` deben conservar la sesión,
   el plan requerido y el `redirect_url` de retorno.
5. Para un proveedor nuevo, actualiza configuración, adaptador, pruebas y el
   playbook de IA antes de exponerlo en un editor.

## Verificación

```bash
node --import tsx --test tests/unit/output-contract.test.ts
node --import tsx --test tests/unit/credit-topup.test.ts
npm run typecheck
```

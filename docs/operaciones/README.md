# Catálogo de documentación operativa — Prompt Studio

Documentación de cómo opera Prompt Studio (Magzin LLC): procedimientos,
flujos de negocio, control de calidad, modelo de CRM e historial del proyecto.

## Alcance y método

Todo lo que hay aquí está **derivado del código y del historial del
repositorio**, no de entrevistas ni de memoria. Cada procedimiento apunta al
fichero que lo implementa, de modo que se puede verificar y, cuando el código
cambie, se puede detectar que el documento quedó obsoleto.

Los números citados (importes, límites, reintentos, tamaños de catálogo) se
leyeron de la fuente en el momento de escribir, no se estimaron.

## Índice

| Documento | Qué cubre |
|---|---|
| [sop-generacion-ia.md](sop-generacion-ia.md) | Ciclo de vida de un trabajo de generación con IA: cola, créditos, reintentos, fallos |
| [runbook-incidentes-proveedores-ia.md](runbook-incidentes-proveedores-ia.md) | Respuesta, contención, recuperación y postmortem ante fallos de proveedores de IA |
| [verificacion-gemini-produccion.md](verificacion-gemini-produccion.md) | Verificación segura de credencial, alcance Vercel, API y modelo de imagen de Google |
| [sop-comercial.md](sop-comercial.md) | Venta, cobro, reembolso, y el programa de afiliados de punta a punta |
| [sop-catalogo.md](sop-catalogo.md) | Cómo se publica contenido nuevo y cómo se regenera el catálogo |
| [sop-despliegue-y-qa.md](sop-despliegue-y-qa.md) | Puertas de calidad, CI, proceso de release y qué hacer si falla |
| [crm.md](crm.md) | Modelo de datos de cliente y los procesos que lo alimentan |
| [../crm/README.md](../crm/README.md) | Auditoría, selección e implementación propuesta de un CRM dedicado |
| [historial-proyecto.md](historial-proyecto.md) | Evolución del proyecto medida sobre el historial de git |
| [../historial/](../historial/README.md) | Historial ampliado: cronología por fases, trazas de decisión, métricas, registro de fallos, inventario de derechos y dataset |
| [base-de-conocimiento.md](base-de-conocimiento.md) | Trampas conocidas, decisiones tomadas y su porqué |
| [feedback-ia.md](feedback-ia.md) | Qué se registra hoy de las generaciones y qué falta |
| [vercel-static-media.md](vercel-static-media.md) | Inventario y migración de videos de demos desde Vercel hacia Cloudflare R2 |

También en `docs/`, generados antes: [ai-generation-queue.md](../ai-generation-queue.md),
[observability.md](../observability.md), [testing.md](../testing.md).

Documentos relacionados fuera de esta carpeta: [../prd.md](../prd.md) (qué es el
producto), [../dm.md](../dm.md) (modelo de datos completo),
[../rotacion-de-credenciales.md](../rotacion-de-credenciales.md) (procedimiento
de seguridad).

## Qué NO contiene esta carpeta

Se dice explícitamente para que nadie lo busque ni lo presuponga:

- **Ningún registro de cliente real.** [crm.md](crm.md) documenta el *modelo* y
  los *procesos*; los datos viven en MongoDB y en Clerk, y no se exportan aquí.
  Extraer datos personales a un documento versionado sería una infracción de la
  propia política de privacidad de la plataforma, que se acoge a GDPR y CCPA.
- **Ningún feedback humano sobre salidas de IA.** No existe: el modelo
  `AIGenerationJob` no tiene campo de valoración. [feedback-ia.md](feedback-ia.md)
  documenta qué sí se registra y especifica qué haría falta para recogerlo.
- **Historiales de proyecto de cliente.** La plataforma vende recursos
  digitales; no ejecuta proyectos para terceros, así que no hay tal cosa.

## Tamaño real de la operación

Relevante si estos documentos se van a usar para evaluar la empresa ante un
tercero. Medido sobre el repositorio:

- **364 commits** entre diciembre de 2025 y julio de 2026.
- **2 autores humanos** (`Josue Glez`, 252 commits; `Joshuesito`, 111).
- El control de acceso administrativo compara contra **dos direcciones de
  correo** (`PROMPT_STUDIO_PREMIUM_JO`, `PROMPT_STUDIO_STARTUP_JO`).

Es documentación operativa real de una operación pequeña. Presentarla como la de
una organización mayor sería tergiversarla.

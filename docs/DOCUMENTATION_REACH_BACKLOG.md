# Backlog de Documentation Reach (DOC-001 a DOC-025)

**Issue principal:** [#32 [Docs] Backlog de Documentation Reach](https://github.com/jggjosue/prompt-studio/issues/32)  
**Plan general:** [#3 [Docs] Plan de Cobertura y Vinculación de Código (Documentation Reach - Swimm)](https://github.com/jggjosue/prompt-studio/issues/3)  
**Línea base histórica:** Tier D (0% de 75,995 líneas, 3/575 archivos)  
**Objetivo:** Tier B (≥40%) / Tier A (≥60%)  

---

## 1. Visión general

Este backlog desglosa de manera granular y verificable las 25 tareas de cobertura documental (DOC-001 a DOC-025) de Prompt Studio. Cada tarea está priorizada (P0–P3), clasificada por fase, y vinculada a sus artefactos técnicos, playbooks y trazabilidad de GitHub.

---

## 2. Matriz de tareas y estado

### Prioridad P0 (Fundacionales / Entry Points / Flujos Críticos)

| ID | Issue | Título | Entregable / Artefacto | Estado |
|---|---|---|---|---|
| **DOC-001** | [#33](https://github.com/jggjosue/prompt-studio/issues/33) | Auditar la documentación existente | [`docs/audits/DOCUMENTATION_REACH_AUDIT.md`](audits/DOCUMENTATION_REACH_AUDIT.md) | Completado |
| **DOC-002** | [#34](https://github.com/jggjosue/prompt-studio/issues/34) | Crear el mapa de archivos fuente | [`docs/audits/SOURCE_FILE_MAP.md`](audits/SOURCE_FILE_MAP.md) | Completado |
| **DOC-003** | [#35](https://github.com/jggjosue/prompt-studio/issues/35) | Priorizar archivos de mayor impacto | [`docs/audits/HIGH_IMPACT_SOURCE_PRIORITIES.md`](audits/HIGH_IMPACT_SOURCE_PRIORITIES.md) | Completado |
| **DOC-006** | [#38](https://github.com/jggjosue/prompt-studio/issues/38) | Mejorar README con estructura de código | [`README.md`](../README.md) | Completado |
| **DOC-007** | [#39](https://github.com/jggjosue/prompt-studio/issues/39) | Documentar runtime entry points | [`docs/audits/RUNTIME_ENTRY_POINTS.md`](audits/RUNTIME_ENTRY_POINTS.md) | Completado |
| **DOC-008** | [#40](https://github.com/jggjosue/prompt-studio/issues/40) | Documentar el flujo principal | [`docs/playbooks/PRIMARY_GENERATION_FLOW.md`](playbooks/PRIMARY_GENERATION_FLOW.md) | Completado |

### Prioridad P1 (Subsistemas, Mapas y Features)

| ID | Issue | Título | Entregable / Artefacto | Estado |
|---|---|---|---|---|
| **DOC-004** | [#36](https://github.com/jggjosue/prompt-studio/issues/36) | Arquitectura general enlazada | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | Completado |
| **DOC-005** | [#37](https://github.com/jggjosue/prompt-studio/issues/37) | Mapa documentación a código | [`docs/audits/DOCUMENTATION_TO_CODE_MAP.md`](audits/DOCUMENTATION_TO_CODE_MAP.md) | Completado |
| **DOC-009** | [#41](https://github.com/jggjosue/prompt-studio/issues/41) | Componentes principales | [`docs/playbooks/PRIORITY_FEATURE_COMPONENTS.md`](playbooks/PRIORITY_FEATURE_COMPONENTS.md) | Completado |
| **DOC-010** | [#42](https://github.com/jggjosue/prompt-studio/issues/42) | Servicios y APIs | [`docs/playbooks/SERVICES_AND_APIS.md`](playbooks/SERVICES_AND_APIS.md) | Completado |
| **DOC-011** | [#43](https://github.com/jggjosue/prompt-studio/issues/43) | Gestión de estado | `docs/playbooks/STATE_MANAGEMENT.md` | En progreso / PR #91 |
| **DOC-014** | [#46](https://github.com/jggjosue/prompt-studio/issues/46) | Documentación por feature | Guías por dominio funcional bajo `docs/` | Pendiente |

### Prioridad P2 (Reutilización, Configuración y Limpieza)

| ID | Issue | Título | Entregable / Artefacto | Estado |
|---|---|---|---|---|
| **DOC-012** | [#44](https://github.com/jggjosue/prompt-studio/issues/44) | Hooks y utilidades reutilizadas | `docs/playbooks/HOOKS_AND_UTILS.md` | Pendiente |
| **DOC-013** | [#45](https://github.com/jggjosue/prompt-studio/issues/45) | Configuración del proyecto | `docs/PROJECT_CONFIGURATION.md` | Pendiente |
| **DOC-015** | [#47](https://github.com/jggjosue/prompt-studio/issues/47) | Estandarizar Related source files | Secciones normalizadas en docs | Pendiente |
| **DOC-016** | [#48](https://github.com/jggjosue/prompt-studio/issues/48) | Revisar enlaces existentes | Verificación de enlaces Markdown rotos | Pendiente |
| **DOC-017** | [#49](https://github.com/jggjosue/prompt-studio/issues/49) | Detectar documentación huérfana | Auditoría de documentos sin enlaces | Pendiente |
| **DOC-024** | [#56](https://github.com/jggjosue/prompt-studio/issues/56) | Mantener índice central de documentación | [`docs/README.md`](README.md) y [`docs/SWIMM.md`](SWIMM.md) | En mantenimiento continuo |

### Prioridad P3 (Automatización, CI, Métricas y Decisiones)

| ID | Issue | Título | Entregable / Artefacto | Estado |
|---|---|---|---|---|
| **DOC-018** | [#50](https://github.com/jggjosue/prompt-studio/issues/50) | Detectar módulos sin documentación | Reporte de módulos fuente desprovistos de guía | Pendiente |
| **DOC-019** | [#51](https://github.com/jggjosue/prompt-studio/issues/51) | Script local de documentation reach | `scripts/mjs/check-documentation-reach.mjs` | Implementado / PR #355 |
| **DOC-020** | [#52](https://github.com/jggjosue/prompt-studio/issues/52) | Integrar la comprobación en CI | `.github/workflows/documentation-reach.yml` | Implementado / PR #379 |
| **DOC-021** | [#53](https://github.com/jggjosue/prompt-studio/issues/53) | Establecer objetivos incrementales | Metas de reach por milestone | Pendiente |
| **DOC-022** | [#54](https://github.com/jggjosue/prompt-studio/issues/54) | Añadir checklist documental al PR template | `.github/pull_request_template.md` | Completado |
| **DOC-023** | [#55](https://github.com/jggjosue/prompt-studio/issues/55) | Documentar decisiones arquitectónicas (ADRs) | Directorio `docs/adr/` | Pendiente |
| **DOC-025** | [#57](https://github.com/jggjosue/prompt-studio/issues/57) | Reejecutar Documentation Reach | `docs/audits/DOCUMENTATION_REACH_REPORT.md` | Implementado / PR #417 |

---

## 3. Estructura de documentos y directorios asociados

- **Auditorías:** [`docs/audits/`](audits/) — Contiene diagnósticos, matrices de acceso, baselines e inventarios.
- **Playbooks:** [`docs/playbooks/`](playbooks/) — Guías operativas de subsistemas de código acoplado (*code-coupled*).
- **Guía Swimm:** [`docs/SWIMM.md`](SWIMM.md) — Explicación de la métrica Reach, tiers y setup de herramientas.
- **Exclusiones:** [`.swmignore`](../.swmignore) — Reglas para excluir catálogos estáticos, tests y scripts del denominador de reach.

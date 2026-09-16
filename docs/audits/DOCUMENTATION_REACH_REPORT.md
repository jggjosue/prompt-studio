# DOC-025 — Re-ejecución de Documentation Reach

**Fecha:** 2026-09-15  
**Backlog:** [DOC-025](https://github.com/jggjosue/prompt-studio/issues/57) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32) · [plan #3](https://github.com/jggjosue/prompt-studio/issues/3)

Compara el estado actual contra la línea base histórica de Swimm. La medición
la publica la métrica local (DOC-019, `npm run docs:reach`); Swimm sigue siendo
la referencia del servicio externo y debe re-ejecutarse sobre `develop` para
confirmar este resultado con su propia herramienta.

## Método

Script [`scripts/mjs/measure-documentation-reach.mjs`](../../scripts/mjs/measure-documentation-reach.mjs),
sin dependencias. Un fichero cuenta entero cuando al menos un documento del
corpus apunta a él (enlace relativo o token ruta con extensión de código); los
directorios no cuentan. `CODEBASE_MAP.md` es un inventario generado y se reporta
aparte. Reproducción:

```bash
nvm use
npm ci
npm run docs:reach          # resume y tier
npm run docs:reach:json     # valores completos
```

## Antes

Baseline histórico de Swimm (documentación previa, sin enlaces de código):

| Métrica | Valor |
|---|---|
| Ficheros apuntados | **3 de 575** |
| Líneas apuntadas | **0 de 75.995** |
| Porcentaje | **0 % — Tier D** |

## Después (2026-09-15)

| Métrica | Valor |
|---|---|
| Ficheros apuntados (explicativos) | **235 de 684** |
| Líneas apuntadas | **33.730 de 78.523** |
| Porcentaje | **42,96 % — Tier B** |
| Con inventario `CODEBASE_MAP.md` | **99,46 %** (678 ficheros; 443 solo del inventario) |
| Alto impacto sin cubrir | 5 módulos |

Diferencia frente a la línea base: **+232 ficheros producto y +33.730 líneas**, de
Tier D a **Tier B** en la métrica explicativa.

## Cambios de alcance desde la línea base

- **Exclusiones (`.swmignore`):** `tests/`, `test-results/`, `coverage/`,
  `scripts/`, `.next/`, `public/webpages/`, `src/data/`, artefactos temporales.
- **Corpus:** de 9 documentos a **25** (9 núcleo + `SWIMM.md` + audits +
  playbooks + `README.md`/`CONTRIBUTING.md`).
- **Inventario separado:** `CODEBASE_MAP.md` deja de contar como cobertura
  explicativa; se reporta como `reachInclInventory`. Es la distinción que pedía
  DOC-001 entre *inventario enlazado* y *cobertura explicativa*.
- **Métrica reproducible:** script local sustituye a la medición manual.

## Huecos de alto impacto pendientes

Módulos Tier A (DOC-003) que aún no tienen cobertura explicativa:

1. `src/app/[locale]/component-builder/component-builder-client.tsx`
2. `src/app/[locale]/page-composer/page-composer-client.tsx`
3. `src/app/[locale]/privacy/page.tsx`
4. `src/app/[locale]/terms/page.tsx`
5. `src/hooks/use-keyset-pagination.ts`

## Próximos objetivos

1. **Cerrar los 5 huecos de alto impacto** con DOC-014 (documentación por
   feature) y DOC-011 (estado, en curso en el PR #91).
2. **Dar referencias a `DEPLOYMENT.md` y `TESTING.md`** (0 referencias hoy) con
   DOC-013 y DOC-016.
3. **Reducir los 443 ficheros solo en inventario**: convertirlos en cobertura
   explicativa mediante mapas de feature/servicio (DOC-012, DOC-014).
4. **Subir la métrica a Tier A (≥60 %)**: ≈ +13,4k líneas documentadas
   (≈ +90 ficheros sobre un promedio de ~150 líneas). Meta incremental: +10 pp
   por iteración.
5. **Mantener la CI informacional** (DOC-020) observando regresiones entre PRs y
   re-ejecutar Swimm sobre `develop` para confirmar la evaluación externa.

## Estado del backlog

DOC-001 a DOC-010 y DOC-019/DOC-020 cerrados y con reporte. DOC-011 en revisión
(PR #91). Pendientes de ejecución: DOC-012 a DOC-018 y DOC-021 a DOC-024.
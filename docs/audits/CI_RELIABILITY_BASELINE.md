# CI-066 — Línea base de confiabilidad de CI

**Fecha de corte:** 2026-09-16  
**Issue:** [#66](https://github.com/jggjosue/prompt-studio/issues/66)  
**Método:** inventario de los últimos 66 runs de GitHub Actions visibles en el repositorio; los runs en progreso no cuentan como éxito o fallo.

## Resultado

La señal histórica baja no representa 22 regresiones de producto distintas. De los **22 runs de Quality fallidos** inspeccionados, 19 comparten el mismo fallo determinista de instalación; dos comparten un fallo determinista de build; y uno es el mismo fallo de instalación en una versión anterior del workflow.

| Clase | Runs de Quality | Evidencia | Estado actual |
|---|---:|---|---|
| Lockfile fuera de sincronía | 19 | `npm ci` termina con `EUSAGE` y paquetes ausentes/incompatibles entre `package.json` y `package-lock.json` | Corregido en el historial de `develop`; `npm ci --dry-run --ignore-scripts` resuelve con el lockfile actual |
| Configuración de cliente en build | 2 | `next build` falla al recolectar `/api/ai/jobs` con `Neither apiKey nor config.authenticator provided` | Corregido al construir clientes externos de forma perezosa; el job de build usa valores CI no secretos para Clerk y Mongo |
| Artefacto de cobertura ausente | 8 pasos secundarios | `upload-artifact` falla después de que `npm ci` ya impidió crear `coverage/lcov.info` | No es causa raíz; el fallo de instalación debe ser el diagnóstico primario |
| Browser checks históricos | 1 run | El workflow anterior intentó instalar dependencias antes de fallar | El job actual se salta sin `PLAYWRIGHT_BASE_URL`; no se presenta como señal de calidad de PR sin deployment |
| Cancelaciones | 5 runs | `concurrency.cancel-in-progress` cancela una ejecución reemplazada por un commit nuevo | Esperado; no se contabiliza como fallo de calidad |

Ejemplos representativos: [fallo de lockfile](https://github.com/jggjosue/prompt-studio/actions/runs/34675320598), [fallo de build por configuración](https://github.com/jggjosue/prompt-studio/actions/runs/34675817029), y [PR #21 completamente verde](https://github.com/jggjosue/prompt-studio/pull/21).

## Causa raíz y guardarraíles

### 1. Instalación reproducible

El lockfile histórico no contenía el árbol que exigía `package.json`; cada job fallaba antes de lint, tipos, tests o build. La corrección no es reintentar: mantener [`package-lock.json`](../../package-lock.json) sincronizado y ejecutar `npm ci` con la versión fijada en [`.nvmrc`](../../.nvmrc) y [`.node-version`](../../.node-version).

El workflow [Quality](../../.github/workflows/quality.yml) usa `actions/setup-node` con `node-version-file`, cache de npm invalidada por el lockfile y `npm ci` en cada job. Así, un lockfile inconsistente falla de forma temprana y reproducible, en vez de ocultarse detrás de dependencias locales.

### 2. Build sin secretos reales

El build no debe requerir una clave real de pago, correo o proveedor de IA para recolectar rutas. Los clientes de integración se inicializan cuando se usan, no al importar el módulo. El job de build configura únicamente valores seguros de CI para Clerk y Mongo en [`.github/workflows/quality.yml`](../../.github/workflows/quality.yml); una nueva inicialización ansiosa debe hacer fallar el build y revelar la dependencia.

### 3. Diagnóstico de fallos

Tratar el primer paso fallido como la causa primaria. En particular, un `upload-artifact` posterior que no encuentra cobertura no es una regresión de cobertura si las pruebas ni siquiera iniciaron por `npm ci`.

| Primer paso que falla | Acción del mantenedor |
|---|---|
| `Run npm ci` | Sincronizar lockfile con `npm install` usando Node 22.11; revisar el diff del lockfile y volver a ejecutar `npm ci` limpio |
| `next build` | Revisar variables de build y módulos importados por rutas; mover la inicialización de clientes externos al punto de uso |
| `Pruebas con cobertura` | Clasificar como regresión de test, dependencia de entorno o flake; no resolver con reintento hasta tener causa |
| `Publicar informe de cobertura` | Revisar el primer fallo previo y confirmar si `coverage/lcov.info` debía existir |

## Muestra posterior de 20 runs

La línea base histórica no se sustituye por un porcentaje instantáneo. Desde el merge de esta corrección, contar los próximos 20 runs **concluidos** de Quality:

```bash
gh run list --repo jggjosue/prompt-studio --workflow Quality --limit 100 \
  --json conclusion,createdAt,url
```

Excluir `cancelled` por concurrencia y registrar por separado cualquier `failure` con su primer paso fallido. El objetivo de #66 se considera sostenido solo cuando la muestra de 20 no reproduzca las dos clases deterministas anteriores y los fallos restantes tengan issue de seguimiento o corrección.

## Límites y siguientes pasos

- Esta clasificación no promociona Documentation Reach a check requerido: ese workflow permanece informativo, como confirma el PR #21.
- [#67](https://github.com/jggjosue/prompt-studio/issues/67) consolidará el contrato canónico de checks requeridos y su orden.
- [#68](https://github.com/jggjosue/prompt-studio/issues/68) añadirá regresión determinista para flujos de producto críticos, separada de proveedores vivos.

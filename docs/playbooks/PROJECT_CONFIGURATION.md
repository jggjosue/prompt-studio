# Configuración del proyecto

**Backlog:** [DOC-013](https://github.com/jggjosue/prompt-studio/issues/45) · [backlog principal](https://github.com/jggjosue/prompt-studio/issues/32)

Esta guía referencia los archivos que controlan build, TypeScript, variables de
entorno, linting, pruebas, CI y configuración global. Úsala antes de cambiar
configuración transversal: un cambio aparentemente pequeño aquí puede afectar
desarrollo local, Vercel, CI, seguridad o el tamaño del bundle.

## Mapa de configuración

| Área | Archivo o comando | Responsabilidad | Reglas de cambio |
|---|---|---|---|
| Runtime y scripts | [`package.json`](../../package.json), [`package-lock.json`](../../package-lock.json), [`.node-version`](../../.node-version), [`.nvmrc`](../../.nvmrc), [`.npmrc`](../../.npmrc) | Versiones de Node/npm, dependencias, scripts de build, test, lint, SEO, validación y generación de artefactos. | Mantén Node en sync entre `.nvmrc`, `.node-version`, `engines.node` y GitHub Actions. Si cambias scripts, actualiza esta guía, [README](../../README.md), [TESTING](../TESTING.md) o [DEPLOYMENT](../DEPLOYMENT.md). |
| Next.js y runtime global | [`next.config.ts`](../../next.config.ts), [`src/instrumentation.ts`](../../src/instrumentation.ts), [`src/proxy.ts`](../../src/proxy.ts), [`src/middleware.ts`](../../src/middleware.ts), [`src/app/[locale]/layout.tsx`](<../../src/app/[locale]/layout.tsx>) | Configuración de Next, i18n, headers, CSP, imágenes, webpack edge aliases, server actions, tracing y entrada global de la app. | No desactives errores de build, TypeScript o ESLint sin ticket explícito. Si cambias headers/CSP/cache, ejecuta `npm run cache:audit` y revisa [SECURITY](../SECURITY.md). |
| TypeScript | [`tsconfig.json`](../../tsconfig.json), [`next-env.d.ts`](../../next-env.d.ts) | Modo strict, paths `@/*`, resolución bundler, JSX preserve e incremental build. | Ejecuta `npm run typecheck`. No agregues excepciones globales para evitar tipar un módulo puntual. |
| Linting | [`eslint.config.mjs`](../../eslint.config.mjs) | Flat config de ESLint, Next core web vitals, TypeScript, imports muertos, variables sin uso y reglas para scripts/configs. | Ejecuta `npm run lint`. Si relajas una regla, documenta por qué y evita desactivar análisis de seguridad o imports muertos. |
| Tailwind y UI config | [`tailwind.config.ts`](../../tailwind.config.ts), [`postcss.config.mjs`](../../postcss.config.mjs), [`components.json`](../../components.json), [`src/app/globals.css`](../../src/app/globals.css) | Tokens visuales, plugins CSS, convenciones shadcn/ui y estilos globales. | Cambios de tokens o estilos globales deben validarse en rutas principales y móvil. |
| Entorno local y secretos | [`.env.example`](../../.env.example), [`.env.local`](../../.env.local), [`scripts/mjs/check-env-example.mjs`](../../scripts/mjs/check-env-example.mjs), [`scripts/mjs/check-leaked-secrets.mjs`](../../scripts/mjs/check-leaked-secrets.mjs), [`scripts/mjs/verify-clerk-env.mjs`](../../scripts/mjs/verify-clerk-env.mjs) | Plantilla de variables, configuración local no versionada y verificaciones de secretos/Clerk. | Nunca copies secretos reales a archivos versionados. Ejecuta `npm run verify:env-example`, `npm run verify:rotation` y, para producción, `npm run verify:clerk:prod`. |
| Pruebas unitarias y datos | [`tests/unit`](../../tests/unit), [`tests/data`](../../tests/data), [`scripts/mjs/build-coverage-report.mjs`](../../scripts/mjs/build-coverage-report.mjs) | Node test runner, `tsx` para TypeScript, pruebas de datos y reporte lcov. | Ejecuta `npm test` o `npm run test:coverage`. El proyecto no usa Jest ni Vitest. |
| E2E y navegador | [`playwright.config.ts`](../../playwright.config.ts), [`tests/e2e`](../../tests/e2e) | Playwright desktop/móvil, server local de prueba, trazas, screenshots y presupuestos de navegador. | Usa `PLAYWRIGHT_BASE_URL` para previews o deja que Playwright levante Next en el puerto 3046. Instala Chromium si falta. |
| CI | [`.github/workflows/quality.yml`](../../.github/workflows/quality.yml), [`.github/workflows/documentation-reach.yml`](../../.github/workflows/documentation-reach.yml), [`.github/pull_request_template.md`](../../.github/pull_request_template.md) | Lint, tipos, cobertura, env example, cache audit, build, E2E contra despliegue y reporte de documentación. | Si agregas una validación local crítica, decide si debe entrar en CI. No subas artefactos amplios ni secretos en workflows. |
| Vercel y entrega | [`vercel.json`](../../vercel.json), [`docs/DEPLOYMENT.md`](../DEPLOYMENT.md), [`apphosting.yaml`](../../apphosting.yaml) | Headers de CDN, caché, despliegue Vercel, notas de plataforma y configuración heredada. | Cambios de headers deben mantener Clerk `no-store`, estáticos inmutables y cache media. Revisa `DEPLOYMENT.md`. |
| Documentación reach | [`.swmignore`](../../.swmignore), [`docs/SWIMM.md`](../SWIMM.md) | Alcance de documentación y exclusiones para métricas Swimm. | Si cambias carpetas generadas, tests o datos grandes, actualiza `.swmignore` para no distorsionar cobertura. |

## Comandos principales

| Comando | Qué valida |
|---|---|
| `npm run dev` | Next dev con Turbopack en el puerto definido por `package.json`. |
| `npm run lint` | ESLint flat config. |
| `npm run typecheck` | TypeScript `tsc --noEmit`. |
| `npm test` | Unit tests y data tests. |
| `npm run test:coverage` | Tests más reporte `coverage/lcov.info`. |
| `npm run test:e2e` | Playwright. Levanta servidor local si no hay `PLAYWRIGHT_BASE_URL`. |
| `npm run build` | `prebuild`, `next build`, minificación, optimización y precompresión de assets. |
| `npm run validate` | Lint, tipos, cobertura, env example y cache audit. |
| `npm run test:ci` | Subset principal de CI: lint, env, tipos, cobertura y cache audit. |

## Variables de entorno

Las variables versionadas viven solo en [`.env.example`](../../.env.example).
Los valores reales van en `.env.local`, Vercel u otro secret manager.

Grupos que suelen romper de forma distinta:

| Grupo | Validación | Nota |
|---|---|---|
| Clerk | `npm run verify:clerk`, `npm run verify:clerk:prod` | Producción requiere claves live y rutas internas correctas. |
| MongoDB | `npm run build`, rutas API, tests que conectan modelos | Sin `MONGODB_URI`, cualquier persistencia debe fallar fuerte. |
| Stripe | Webhooks, checkout y `npm run verify:env-example` | Los clientes deben construirse de forma lazy para que build no necesite secretos reales. |
| AI providers | Tests de generación o jobs manuales | No uses prefijo `NEXT_PUBLIC_` para claves privadas. |
| R2/Cloudflare | Rutas de assets y descargas | Mantén separado token de cuenta, claves S3 y bucket. |
| CSP/cache/rate limit | `npm run cache:audit` | `CSP_ENFORCE=true` cambia Report-Only a bloqueo. |

## Orden recomendado antes de abrir PR

```bash
npm run lint
npm run typecheck
npm test
npm run verify:env-example
npm run cache:audit
```

Si el cambio toca build, configuración global, Next, headers, env o deploy:

```bash
npm run build
```

Si toca navegación, UI responsive, rendimiento o flujos críticos:

```bash
npm run test:e2e
```

## Reglas de mantenimiento

1. Mantén un solo lugar canónico para cada contrato: `.env.example` para
   variables, `package.json` para scripts, `tsconfig.json` para TypeScript,
   `eslint.config.mjs` para lint y `quality.yml` para CI.
2. No agregues secretos, tokens ni valores reales a documentación o ejemplos.
3. Si una variable nueva se lee desde código, añádela a `.env.example` y
   verifica `npm run verify:env-example`.
4. Si un script se vuelve obligatorio para calidad, decide si pertenece a
   `validate`, `test:ci`, `quality.yml` o solo a un playbook manual.
5. Si cambias puertos, Node, cache o headers, actualiza `README.md`,
   `DEPLOYMENT.md`, `TESTING.md` y esta guía cuando aplique.

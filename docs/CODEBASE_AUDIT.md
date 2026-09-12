# Auditoría del repositorio — 11 de septiembre de 2026

Estado real de `prompt-studio` medido con los comandos del §9. Nada de lo que
sigue es una estimación: si una cifra no se pudo medir, se dice.

---

## 1. Resumen ejecutivo

| Área evaluada | Estado | Motivo en una línea |
|---|---|---|
| **Material** | Fuerte | ~97.000 líneas de código propio, 368 commits, 105 rutas de API, 45 modelos |
| **Difficulty** | Fuerte | Editor visual, cola de generación con créditos, comercio con afiliados: lógica real, no CRUD |
| **Verifiability** | **Débil** | `npm run lint` **no funciona**, la cobertura mide 62 de 680 ficheros, CI no corre en la rama de trabajo |
| **Comprehensibility** | **Débil** | **No hay README**; 87 documentos sin índice ni documentación de arquitectura |

Las dos primeras áreas ya están; las dos últimas son donde está todo el margen.

---

## 2. Arquitectura actual

**Stack**: Next.js 15.5.9 (App Router, Turbopack) · React 19 · TypeScript 6 en
modo `strict` · Tailwind · MongoDB con Mongoose · Clerk (identidad) · Stripe
(cobros) · Genkit + proveedores de IA · next-intl · Vercel.

```
Navegador
   │
   ├── src/app/[locale]/**         90 páginas (RSC + clientes)
   │      └── middleware (src/proxy.ts) — idioma, redirecciones, cabeceras
   │
   ├── src/app/api/**             105 rutas de API
   │      ├── auth: Clerk · webhooks firmados · CRON_SECRET · admin · IP rate-limit
   │      ├── comercio: stripe, créditos, afiliados, marketplace
   │      └── IA: cola de trabajos, evaluación, proveedores
   │
   ├── src/lib/**                 155 ficheros — lógica de negocio pura
   ├── src/models/**               45 modelos de Mongoose
   ├── src/components/**          156 componentes
   └── src/data/**                catálogo (15 JSON, fuera de `public/`)
```

**Reparto de código** (ficheros versionados, sin datos ni lockfiles):

| Zona | Ficheros | Líneas |
|---|---|---|
| `src/app` | 278 | 43.359 |
| `src/components` | 156 | 17.078 |
| `src/lib` | 155 | 13.799 |
| `src/hooks` | 30 | 2.032 |
| `src/models` | 45 | 1.273 |
| `src/ai` | 7 | 230 |
| `scripts` (.mjs) | 80 | 14.862 |
| `tests` | 63 | 3.617 |
| **Total TS/TSX** | **748** | **82.339** |

---

## 3. Verificabilidad — el área más débil

### 3.1 El linting no existe (P0)

`npm run lint` ejecuta `next lint`, que en Next 15.5 está retirado. La ejecución
real **abre un asistente interactivo** y se queda esperando:

```
npx @next/codemod@canary next-lint-to-eslint-cli .
? How would you like to configure ESLint? ❯ Strict (recommended)
```

No hay `eslint.config.*` ni `.eslintrc*` en el repositorio. Consecuencias:

- No hay análisis estático de ninguna clase.
- En CI, ese comando colgaría o fallaría — por eso **no está en el pipeline**.
- Los imports muertos, las variables sin usar y los hooks mal declarados pasan
  sin aviso. Ya provocó un fallo real de HMR en producción de desarrollo.

### 3.2 La cobertura mide una fracción del código (P0)

`npm run test:coverage` informa **93,87 %**, y esa cifra es engañosa:
`--experimental-test-coverage` de Node solo contabiliza **los ficheros que los
tests cargan**. Medido: **62 ficheros de 680** en `src/`.

| Lo que sí se mide | Lo que no |
|---|---|
| 62 módulos de `src/lib` y similares | 156 componentes de React |
| Lógica pura importada por los tests | 105 rutas de API |
| | 90 páginas |

Los módulos de negocio peor cubiertos, entre los que sí entran:

| Módulo | Cobertura de líneas |
|---|---|
| `src/lib/component-purchase-validation.ts` | 23,08 % |
| `src/lib/generation-pricing.ts` | 49,23 % |
| `src/lib/editor/prompt.ts` | 57,78 % |
| `src/lib/affiliate.ts` | 61,06 % |
| `src/lib/campaign-control-center.ts` | 66,13 % |

### 3.3 CI no cubre el trabajo real (P0)

`.github/workflows/quality.yml` tiene dos jobs y se dispara con
`pull_request` y `push` a `main`. Pero:

- El desarrollo ocurre en **`develop`**, así que un push normal **no dispara CI**.
- **0 pull requests** en 368 commits: la vía de `pull_request` tampoco se usa.
- El pipeline no ejecuta **build**, ni **lint**, ni `seo:validate-all`.

Es decir: hay CI configurado y prácticamente ningún commit pasa por él.

### 3.4 El build ignora sus propios errores (P1)

`next.config.ts:78-82` mantiene `typescript.ignoreBuildErrors: true` y
`eslint.ignoreDuringBuilds: true`. `npm run typecheck` **pasa** hoy (salida
vacía, código 0), así que la red existe fuera del build — pero nada impide que
un error de tipos llegue a producción.

### 3.5 Lo que sí funciona

| Comprobación | Resultado |
|---|---|
| `npm run typecheck` | **PASA** (0 errores) |
| `npm test` | **PASA** — 318 unitarios + 2 de datos |
| `npm run cache:audit` | **PASA** |
| `npm run verify:env-example` | **PASA** (en `test:ci`) |
| Tests e2e (Playwright) | 3 suites; en local falta el binario, en CI corren |

---

## 4. Comprensibilidad

### 4.1 No hay README (P0)

El repositorio **no tiene punto de entrada**. `README.md`, `README_EN.md`,
`README_ES.md` y `AGENTS.md` se borraron en el commit `6fb2744e`, el mismo que
añadió la carpeta `docs/`. Quien clone hoy el proyecto no encuentra ni cómo
instalarlo.

### 4.2 Falta la documentación de ingeniería

`docs/` tiene **87 documentos y 21.065 líneas**, bien organizados por área
(historial, capacidades, políticas, operaciones, licencia de datos, editor, SEO,
CRM). El problema no es la cantidad, es **qué** documenta: casi todo es negocio,
producto y operación. No existe:

`ARCHITECTURE.md` · `SETUP.md` · `DEVELOPMENT.md` · `API.md` · `DATABASE.md` ·
`AI_ARCHITECTURE.md` · `DEPLOYMENT.md` · `TROUBLESHOOTING.md` · `SECURITY.md`

Tampoco hay índice de `docs/`, ni `CONTRIBUTING.md`, ni `LICENSE`, ni plantillas
de issue o PR.

### 4.3 440.000 líneas de markdown que no son documentación (P1)

`.specstory/history/` son **50 transcripciones de sesiones de IA versionadas,
468.167 líneas**. Veinte veces el volumen de `docs/`. No describen el sistema:
son el registro de las conversaciones que lo construyeron.

Tienen valor como historial de decisiones —está argumentado en
`docs/data-licensing/`— pero **no deben contar como documentación**, y conviene
decidir explícitamente si se quedan.

---

## 5. Seguridad

### 5.1 Comprobado y correcto

- **Sin secretos con forma de clave en las transcripciones.** Se buscaron
  patrones de valor real (`sk_live_` + 20 caracteres, `pk_live_…`, `AIza…`,
  `mongodb+srv://…`): **0 coincidencias**. Lo que aparece son nombres de
  variable citados en conversación.
- `.gitignore` ignora `.env*` y exceptúa `.env.example`, que está protegido por
  `verify:env-example` dentro de `test:ci`.
- Las escrituras públicas (`new-users`, `affiliate/click`) están **limitadas por
  IP** con `enforceIpRateLimit`.

### 5.2 Problemas reales

| # | Problema | Gravedad |
|---|---|---|
| 1 | **105 vulnerabilidades** de dependencias: 4 críticas, 35 altas, 62 moderadas. Solo producción: 88, con **4 críticas y 23 altas** (`@grpc/grpc-js`, `express`/`body-parser`, `brace-expansion` ReDoS, cadena de `@genkit-ai/*` y OpenTelemetry) | **P0** |
| | *Estado al cierre: producción en **63, 0 críticas y 7 altas**. Ver [IMPROVEMENT_REPORT.md](IMPROVEMENT_REPORT.md) §2.4.* | |
| 2 | **Seis mecanismos de autorización** conviviendo sin mapa: `auth()` de Clerk, firma de webhook (Stripe `constructEvent`, Clerk `svix`), `requireCronOrAdmin`, `hasValidCronSecret`, `isCacheAdminAuthorized`, límite por IP. Revisar si una ruta está protegida exige leerla entera | **P1** |
| 3 | Secretos en commits antiguos del historial (documentado en `docs/historial/`): borrados de HEAD, **no del historial**. Estado de rotación: sin verificar | **P1** |
| 4 | 68 de 105 rutas sin señal evidente de validación de entrada (varias validan con helpers propios; requiere revisión caso por caso) | **P2** |

---

## 6. Calidad de código

**Lo que está bien**: 1 solo `console.log` en `src/`, 1 solo TODO, 0 bloques de
código comentado, `strict: true` en TypeScript, modelos y lógica separados de la
interfaz.

**Lo que no**:

| Problema | Evidencia |
|---|---|
| Componentes cliente enormes | `prompt-editor-client.tsx` 3.202 líneas · `generate-videos-client.tsx` 3.027 · `generate-webs-client.tsx` 2.721 · `affiliate-client.tsx` 1.334 |
| Rutas muertas | `api/like` y `api/seed` devuelven 501 «Firebase integration was removed» |
| Restos de la migración | 5 ficheros siguen importando Firebase tras el paso a MongoDB |
| Sin formateador declarado | No hay `.prettierrc`; el estilo depende del editor de cada uno |

Las páginas más largas (`privacy` 3.472, `terms` 3.082, `licenses` 2.132) son
**texto legal**, no complejidad: no son candidatas a refactor.

---

## 7. Prioridades

### P0 — crítico

1. **Configurar ESLint** y que `npm run lint` funcione sin interacción.
2. **Medir la cobertura sobre todo `src/`**, no sobre lo que los tests importen.
3. **CI que cubra el trabajo real**: disparar en `develop`, añadir lint y build.
4. **`npm run validate`**: un único comando reproducible de salud del repo.
5. **README.md**: el repositorio no tiene punto de entrada.
6. **Triaje de las 4 vulnerabilidades críticas** de producción.

### P1 — alto valor

7. `docs/ARCHITECTURE.md` con diagramas, `SETUP.md`, `DEVELOPMENT.md`,
   `TESTING.md`, `SECURITY.md`, `TROUBLESHOOTING.md`, `API.md`, `DATABASE.md`,
   `AI_ARCHITECTURE.md`.
8. **Mapa de acceso por ruta** documentado y **verificado por un test**, que es
   la única forma de que no se degrade.
9. Tests de los módulos de negocio peor cubiertos, empezando por
   `component-purchase-validation` (23 %) y `generation-pricing` (49 %).
10. Quitar `ignoreBuildErrors` / `ignoreDuringBuilds`, o dejarlos tras una
    bandera que CI ponga en estricto.

### P2 — valor medio

11. Descomponer los tres clientes de más de 2.700 líneas por responsabilidades.
12. Borrar rutas muertas y restos de Firebase.
13. `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, plantillas de issue y PR.
14. Decidir qué se hace con `.specstory/history`.

### P3 — opcional

15. Prettier con configuración compartida.
16. `seo:validate-all` en CI (hoy falla con hallazgos reales pendientes).
17. Empezar a usar pull requests: 0 en 368 commits.

---

## 8. Lo que esta auditoría **no** afirma

- **No** dice que la cobertura real sea 93,87 %: esa cifra cubre 62 de 680
  ficheros.
- **No** dice que haya secretos expuestos en las transcripciones: se comprobó la
  forma de los valores y no los hay.
- **No** dice que las rutas «sin `auth()`» estén desprotegidas: seis mecanismos
  distintos las protegen; el problema es que no están documentados.
- **No** ha ejecutado `npm run build` en esta pasada: el estado del build se
  verifica en la fase final.

---

## 9. Cómo reproducir estas cifras

```bash
# Material
git log --oneline | wc -l
for ext in ts tsx mjs; do git ls-files "*.$ext" | grep -vE '^public/|^src/data/' | xargs wc -l | tail -1; done
find src/app/api -name route.ts | wc -l && ls src/models | wc -l

# Verificabilidad
npx tsc --noEmit; echo "typecheck=$?"
npm run lint                      # abre un asistente: ahí está el problema
npm test
npm run test:coverage | grep "all files"
npm run test:coverage | grep -c "^# src/"    # ficheros realmente medidos
find src -name '*.ts' -o -name '*.tsx' | wc -l

# Seguridad
npm audit --omit=dev --json | node -e "…"    # ver §5
grep -rhoE 'sk_live_[A-Za-z0-9]{20,}' .specstory | sort -u | wc -l   # 0

# Comprensibilidad
find docs -name '*.md' | wc -l && cat $(find docs -name '*.md') | wc -l
ls README.md CONTRIBUTING.md SECURITY.md LICENSE 2>/dev/null
```

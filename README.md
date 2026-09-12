# Prompt Studio

Catálogo y estudio de creación con IA: prompts listos para usar, generación de
imágenes, vídeo y páginas web, un editor visual de componentes, y el comercio
que lo sostiene —suscripciones, compras sueltas y programa de afiliados—.

> **Estado**: en producción en `https://www.prompstudio.com`. Rama de trabajo
> `develop`; `main` es lo desplegado.

---

## El problema que resuelve

Quien usa modelos generativos pierde la mayor parte del tiempo en dos sitios:
escribir el prompt y adaptar el resultado. Prompt Studio ataca los dos:

- **Catálogo** de prompts probados para imagen, vídeo, web y componentes de
  interfaz, con su previsualización y sus etiquetas.
- **Generadores** que ejecutan esos prompts contra varios proveedores sin salir
  del sitio, con créditos, reintentos y control de coste.
- **Editor visual de componentes**, que permite componer una interfaz
  arrastrando bloques y obtener el prompt exacto que la reproduce.

---

## Funcionalidades principales

| Área | Qué hace |
|---|---|
| **Catálogo** | 450 componentes de UI, 180 animaciones, 244 páginas web de demostración, prompts de imagen y vídeo. Búsqueda, etiquetas y páginas por modelo |
| **Generación con IA** | Cinco familias de proveedores (OpenAI, Anthropic, Google Gemini/Veo, Runway, DeepSeek) tras una interfaz común, con cola de trabajos, progreso, reintentos y contabilidad de créditos |
| **Editor visual** | Árbol de componentes con arrastrar y soltar, panel de capas, inspector por breakpoint, deshacer/rehacer por comandos y autoguardado |
| **Comercio** | Suscripciones y compras con Stripe, kits de componentes, marketplace de creadores y programa de afiliados con comisiones y liquidaciones |
| **Internacionalización** | Español e inglés, detectados en el middleware y servidos sin prefijo de idioma en la URL |
| **SEO programático** | Sitemap, canónicas, datos estructurados y 12 validadores automáticos |

---

## Tecnología

| Capa | Elección |
|---|---|
| Framework | Next.js 15.5 (App Router, Turbopack) · React 19 |
| Lenguaje | TypeScript 6 en modo `strict` |
| Estilos | Tailwind CSS · Radix UI · Framer Motion |
| Datos | MongoDB con Mongoose (45 modelos) |
| Identidad | Clerk (con webhooks firmados vía `svix`) |
| Pagos | Stripe |
| IA | Genkit y adaptadores propios por proveedor |
| Almacenamiento | Cloudflare R2 · AWS S3 |
| Correo | Resend |
| Despliegue | Vercel |

---

## Arquitectura en un vistazo

```
Navegador
   │
   ├── middleware (src/proxy.ts) ── idioma, redirecciones, cabeceras de seguridad
   │
   ├── src/app/[locale]/**      91 páginas (componentes de servidor y cliente)
   ├── src/app/api/**          105 rutas de API
   │      ├── identidad: Clerk · webhooks firmados · CRON_SECRET · admin
   │      ├── comercio:  stripe, créditos, afiliados, marketplace
   │      └── IA:        cola de trabajos, evaluación, calidad de proveedores
   │
   ├── src/lib/**              lógica de negocio, sin dependencias de React
   ├── src/models/**           esquemas de Mongoose
   └── src/data/**             catálogo versionado (fuera de `public/`)
```

El detalle está en [docs/CODEBASE_AUDIT.md](docs/CODEBASE_AUDIT.md), que mide el
estado real del repositorio, y en [docs/editor/](docs/editor/) para el editor
visual.

---

## Instalación

**Requisitos**: Node.js **≥ 22.11** (ver `.nvmrc`) y una instancia de MongoDB.

```bash
nvm use            # toma la versión de .nvmrc
npm ci             # `preinstall` comprueba la versión de Node
cp .env.example .env.local
npm run dev        # http://localhost:3048
```

`npm ci` falla a propósito con versiones de Node menores: el proyecto usa APIs
que no existen antes de la 22.

---

## Configuración

Todas las variables están declaradas —con valores de ejemplo, nunca reales— en
[.env.example](.env.example). Las imprescindibles para arrancar:

| Variable | Para qué |
|---|---|
| `MONGODB_URI` | Base de datos |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Identidad |
| `STRIPE_SECRET_KEY` | Cobros |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`… | Generación con IA (cada proveedor es opcional por separado) |
| `DOMAIN` | URL canónica del sitio |
| `CRON_SECRET` | Autoriza las tareas programadas y los `sync-*` |

`npm run verify:env-example` comprueba que `.env.example` no contenga valores
reales; forma parte de `npm run validate`.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 3048 |
| `npm run build` | Build de producción + minificado, optimización de medios y precompresión |
| `npm start` | Sirve el build |
| **`npm run validate`** | **Salud completa del repositorio**: lint, tipos, cobertura, `.env.example` y políticas de caché |
| `npm run lint` · `lint:fix` | ESLint (configuración en `eslint.config.mjs`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Pruebas unitarias y de datos |
| `npm run test:coverage` | Genera `coverage/lcov.info` sobre todo `src/` |
| `npm run test:e2e` | Playwright |
| `npm run seo:validate-all` | Los 12 validadores de SEO |
| `npm run catalog:build` | Regenera los catálogos paginados desde `src/data` |

---

## Pruebas

```bash
npm test                       # unitarias + datos
npm run test:coverage          # + informe lcov en coverage/lcov.info
COVERAGE_MIN=10 npm run test:coverage   # falla por debajo del umbral
npm run test:e2e               # Playwright (necesita PLAYWRIGHT_BASE_URL)
```

La cobertura se mide **sobre todos los módulos de `src/`**, no solo sobre los que
los tests importan: los no cargados entran con 0 %. La cifra resultante es baja
y honesta; el detalle y el plan están en [docs/TESTING.md](docs/TESTING.md).

---

## Estructura del proyecto

```
src/
  app/[locale]/     páginas por idioma
  app/api/          rutas de API
  components/       interfaz reutilizable
  components/editor/ editor visual de componentes
  lib/              lógica de negocio (sin React)
  lib/editor/       documento, historial y registro del editor
  models/           esquemas de Mongoose
  hooks/            hooks de React
  data/             catálogo versionado
scripts/mjs/        build, auditorías y validadores
tests/{unit,data,e2e}/
docs/               documentación (ver docs/CODEBASE_AUDIT.md para el estado real)
public/webpages/    demos generadas del catálogo (contenido, no código)
.specstory/         transcripciones de sesiones de IA conservadas como historial
```

---

## Despliegue

Vercel construye desde `main` con `npm run vercel-build`, que ejecuta el build y
después minifica, optimiza medios y precomprime `public/`. Las variables de
entorno se configuran en el panel de Vercel; las claves de Clerk deben ser
`pk_live_*` / `sk_live_*` en producción —el build avisa si detecta claves de
prueba—.

---

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `npm ci` falla en `preinstall` | Node < 22.11. `nvm use` |
| `Failed to load SWC binary for darwin/arm64` | `node` x64 bajo Rosetta. Comprobar `node -p "process.arch"` → debe decir `arm64` |
| `npm run dev` va bien y `npm run build` falla | Dev usa Turbopack y build usa webpack: **resuelven módulos distinto**. Un cambio no está verificado hasta que `next build` pasa |
| `curl` recibe el build anterior | Un servidor viejo sigue en el puerto: `lsof -ti:3048 \| xargs kill -9` |
| Clerk responde 404 en vez de redirigir | `auth.protect()` con `Accept: */*` devuelve 404. Probar con `Accept: text/html` |

Más casos, con su causa y desenlace, en
[docs/operaciones/base-de-conocimiento.md](docs/operaciones/base-de-conocimiento.md).

---

## Documentación

| Documento | Contenido |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Capas, recorrido de una petición, dominios de datos y decisiones con su porqué |
| [docs/API_ACCESS.md](docs/API_ACCESS.md) | Matriz de acceso de las 105 rutas — **generada del código** y verificada por un test |
| [docs/SECURITY.md](docs/SECURITY.md) | Modelo de acceso, secretos, protección del producto de pago y estado de las dependencias |
| [docs/TESTING.md](docs/TESTING.md) | Arquitectura de pruebas, cobertura y qué se cubre |
| [docs/DATABASE.md](docs/DATABASE.md) | Modelos, colecciones, índices y el incidente de `user_profiles` |
| [docs/AI_ARCHITECTURE.md](docs/AI_ARCHITECTURE.md) | Ciclo de vida del trabajo de IA, créditos y contratos de salida |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Build, cron, cabeceras y variables que rompen producción |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Puesta en marcha, reglas que el pipeline hace cumplir y estilo |
| [docs/IMPROVEMENT_REPORT.md](docs/IMPROVEMENT_REPORT.md) | Antes / después medido del programa de auditoría, y lo que queda abierto |
| [docs/CODEBASE_AUDIT.md](docs/CODEBASE_AUDIT.md) | Estado real del repositorio, medido, con prioridades |
| [docs/operaciones/](docs/operaciones/) | Procedimientos: generación con IA, comercial, catálogo, despliegue y QA |
| [docs/operaciones/base-de-conocimiento.md](docs/operaciones/base-de-conocimiento.md) | Problemas ya resueltos, con su causa |
| [docs/editor/](docs/editor/) | Diagnóstico y plan del editor visual |
| [docs/historial/](docs/historial/) | Cómo se construyó el proyecto, con trazas de decisión |
| [docs/prd.md](docs/prd.md) · [docs/dm.md](docs/dm.md) | Producto y modelo de datos |
| [docs/rotacion-de-credenciales.md](docs/rotacion-de-credenciales.md) | Procedimiento de seguridad |

---

## Licencia

Software propietario. Todos los derechos reservados. El catálogo incluye
contenido de terceros y generado con IA cuya procedencia se audita con
`npm run catalog:provenance`.

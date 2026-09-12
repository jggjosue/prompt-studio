# Despliegue

Plataforma: **Vercel**. Rama de producción: `main`. Cada rama abierta genera una
*preview*. Este documento cubre solo lo que no es evidente desde el panel de
Vercel: qué hace el build por su cuenta, qué depende del cron y qué se rompe si
falta una variable.

---

## 1. El build hace más que `next build`

```
prebuild → webpages:normalize · catalog:build · reviews:aggregates
build    → next build · minify-public-assets · optimize-public-media · precompress-static
```

`vercel-build` es simplemente `npm run build`, así que **Vercel ejecuta también
el `prebuild`**. Eso importa por una razón concreta: los catálogos paginados y
los agregados de reseñas son **artefactos generados en tiempo de build**, no
datos leídos en caliente. Si `catalog:build` falla, el build falla; si se
saltara, las páginas de catálogo se renderizarían vacías sin error visible.

Los tres pasos posteriores a `next build` (minificado, optimización de medios,
precompresión) actúan sobre `public/`. Son idempotentes: volver a ejecutarlos
sobre una salida ya procesada no la degrada.

**Consecuencia práctica:** el build es sensiblemente más lento que un Next
estándar. Es el precio de servir el catálogo como estático.

---

## 2. Cron

`vercel.json` declara un único trabajo programado:

```json
{ "path": "/api/ai/jobs/process?limit=3", "schedule": "* * * * *" }
```

Cada minuto, hasta 3 trabajos de IA. Detalles que condicionan el despliegue:

- La ruta se autentica con `hasValidCronSecret`, **no** con sesión. Sin
  `CRON_SECRET` en el entorno de producción, el cron devuelve 401 en silencio y
  **la cola deja de avanzar**: los trabajos se quedan en `queued` con créditos
  reservados. No hay alarma automática para esto; el síntoma es `reserved`
  creciendo en `ai_credit_accounts`.
- `maxDuration = 300` en la ruta. El timeout del worker externo es de 270 s
  precisamente para fallar antes que la plataforma.
- Un minuto de cadencia con lease de 5 minutos significa que un trabajo colgado
  no se reintenta hasta pasados esos 5 minutos, no al minuto siguiente.

Ver [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md) §3.

---

## 3. Cabeceras

`vercel.json` define 9 reglas de cabeceras. Las dos que no son cosméticas:

| Ruta | Política | Motivo |
|---|---|---|
| `/_next/static/(.*)` | `public, max-age=31536000, immutable` | El nombre lleva hash; nunca cambia bajo la misma URL |
| `/__clerk/(.*)` | `no-store, must-revalidate` (también en CDN) | Cachear el *handshake* de Clerk deja sesiones cruzadas entre usuarios |

La segunda no es una optimización: es una regla de corrección. `CDN-Cache-Control`
se fija aparte porque la CDN de Vercel no obedece `Cache-Control` a secas para
sus propias capas.

El resto de políticas de caché de la aplicación viven en el código
(`src/lib/cache-policy.ts`) y las verifica `npm run cache:audit`, que forma parte
de `validate` y de CI.

---

## 4. Variables de entorno

`.env.example` documenta **91 variables**. No todas son obligatorias; lo que se
rompe al faltar cada grupo:

| Grupo | Si falta |
|---|---|
| `MONGODB_URI` | Todo lo que persiste. Fallo inmediato y ruidoso (`bufferCommands: false`) |
| Clerk | No hay sesión; todas las rutas autenticadas devuelven 401 |
| `CRON_SECRET` | La cola de IA se detiene **en silencio** (§2) |
| Stripe | Los pagos fallan en el checkout; los webhooks devuelven 400 |
| `AI_GENERATION_WORKER_URL` / `_TOKEN` | Solo funciona imagen+`google` en proceso; el resto de trabajos fallan y devuelven créditos |
| R2 | Las subidas fallan; lo ya subido sigue sirviéndose |
| Resend | Sin avisos de trabajo terminado; la generación funciona igual |

Dos comprobaciones antes de desplegar:

```bash
npm run verify:env-example   # el ejemplo cubre lo que el código lee
npm run verify:clerk:prod    # las claves de Clerk son de producción, no de test
```

`verify:clerk:prod` existe porque desplegar con claves `pk_test_` a producción
es un fallo silencioso: la aplicación arranca y autentica contra el entorno
equivocado.

---

## 5. Antes de subir a `main`

```bash
npm run validate   # lint · typecheck · cobertura · env-example · caché
```

CI ejecuta lo mismo más el build y las pruebas de navegador
(`.github/workflows/quality.yml`, sobre `pull_request` y sobre `push` a `main` y
`develop`).

Las validaciones de SEO (`npm run seo:validate-all`) **no** están en CI porque
varias necesitan el sitio ya desplegado. Se ejecutan contra la *preview* o
contra producción, con `SEO_REPORT=1` para obtener el informe detallado.

---

## 6. Estado conocido

`npm audit --omit=dev` reporta **63 vulnerabilidades en producción, 0 críticas y
7 altas** (se partía de 88, con 4 críticas y 23 altas). Las 63 restantes cuelgan
todas del árbol de `genkit`, que fija `@opentelemetry/* ~1.25` cuando la
corrección solo existe en OpenTelemetry 2.x — incluida su versión más reciente.
No bloquean el despliegue; el detalle y el motivo de no forzarlo están en
[SECURITY.md](SECURITY.md) §6.

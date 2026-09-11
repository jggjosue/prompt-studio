# Prompt Studio

Prompt Studio es una aplicación construida con Next.js App Router para descubrir, previsualizar, generar, comprar y descargar prompts de IA, landing pages, conceptos de imagen y video, y demos web interactivas.

[English documentation](./README_EN.md)

## Requisitos

- Node.js 20 o superior
- npm
- Una base de datos MongoDB
- Credenciales de Clerk, Stripe, Resend, Cloudflare R2 y Google AI para las funciones correspondientes

## Inicio rápido

```bash
npm install
cp .env.example .env.local
npm run dev
```

El servidor de desarrollo se ejecuta en `http://localhost:3043`.

## Configuración del entorno

Nunca confirmes credenciales reales en Git. Usa `.env.local` durante el desarrollo y configura los mismos secretos en la plataforma de despliegue.

### URLs de la aplicación

```env
DOMAIN=https://www.prompstudio.com/
DOMAIN_DEV=http://localhost:3043
```

`src/lib/site-url.ts` selecciona `DOMAIN` en producción y `DOMAIN_DEV` en desarrollo, valida el valor y devuelve un origen normalizado.

### Grupos principales de variables

| Grupo | Variables |
| --- | --- |
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` |
| Stripe | `STRIPE_SECRET_KEY`, variables de Payment Links e IDs de Buy Buttons |
| MongoDB | `MONGODB_URI` |
| Resend | `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `RESEND_EMAIL` |
| Cloudflare R2 | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` |
| Google AI | Credenciales de Google GenAI/Genkit |
| Firebase | Configuración pública de la aplicación y Analytics |
| Trabajos protegidos | `CRON_SECRET`, `CACHE_ADMIN_TOKEN`, `GUEST_DOWNLOAD_SECRET` |

Consulta `.env.example` para ver la lista completa.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run seo:validate-all
```

Los scripts adicionales de validación SEO se encuentran en `package.json`.

## Arquitectura

| Capa | Tecnología |
| --- | --- |
| Aplicación web | Next.js 15 App Router, React 19, TypeScript |
| Interfaz | Tailwind CSS, Radix UI, Framer Motion |
| Autenticación | Clerk |
| Base de datos | MongoDB Atlas con Mongoose |
| Pagos | Stripe Payment Links, Checkout, portal de facturación y webhooks |
| Correos y audiencias | Resend |
| Almacenamiento de demos | Cloudflare R2 mediante la API compatible con S3 |
| Inteligencia artificial | Google Gemini mediante Genkit |
| Analítica | Firebase Analytics, Google Analytics 4, Vercel Analytics y Speed Insights |

## Proveedores y APIs externas

| Proveedor | Uso | Integración principal |
| --- | --- | --- |
| [Clerk](https://clerk.com/docs) | Autenticación, sesiones, perfiles, metadatos y webhooks | `@clerk/nextjs` |
| [Stripe](https://docs.stripe.com/) | Compras únicas, suscripciones, facturas, portal y webhooks de pago | `stripe` |
| [MongoDB Atlas](https://www.mongodb.com/docs/atlas/) | Usuarios, perfiles, actividad, afiliados, legibilidad y compras | `mongoose` |
| [Resend](https://resend.com/docs) | Correos transaccionales, contactos y audiencias | `resend` |
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | Demos HTML y recursos estáticos | `cloudflare`, `@aws-sdk/client-s3` |
| [Google Gemini / Genkit](https://firebase.google.com/docs/genkit) | Generación de prompts y contenido | `genkit`, `@genkit-ai/google-genai` |
| [Firebase Analytics](https://firebase.google.com/docs/analytics) | Eventos de interacción del cliente | `firebase` |
| [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4) | Analítica de navegación e intención de conversión | `gtag.js` |
| [Vercel Analytics](https://vercel.com/docs/analytics) | Métricas de tráfico y rendimiento | `@vercel/analytics`, `@vercel/speed-insights` |

## Base de datos MongoDB

La aplicación usa la base de datos **`prompt-studio`** en MongoDB Atlas. Las colecciones principales del proyecto son:

| Colección | Uso principal |
| --- | --- |
| `user_profiles` | Usuarios registrados sincronizados desde Clerk. |
| `user_profiles` | Correos de nuevos usuarios para sincronización con Resend. |
| `user_profiles` | Perfil interno del usuario, datos de Stripe y metadatos de cuenta. |
| `user_interests` | Intereses, etiquetas y preferencias capturadas desde la app. |
| `useractivities` | Actividad reciente del usuario registrada por Mongoose. |
| `affiliate_applications` | Solicitudes para el programa de afiliados. |
| `affiliate_clicks` | Clicks de afiliados por producto, visitante y fuente. |
| `affiliate_sales` | Ventas atribuidas al programa de afiliados. |
| `affiliate_daily_stats` | Estadísticas diarias por afiliado. |
| `affiliate_referral_stats` | Métricas acumuladas por código de referido y producto. |
| `affiliate_user_stats` | Resumen de rendimiento por usuario afiliado. |
| `affiliate_payout_accounts` | Datos de cuenta de pago de afiliados. |

## Catálogo de APIs internas

| Área | Endpoints |
| --- | --- |
| Sincronización de usuarios | `/api/sync-clerk`, `/api/sync-registered-users-to-resend`, `/api/sync-resend`, `/api/new-users` |
| Webhooks | `/api/webhooks/clerk`, `/api/webhooks/stripe` |
| Suscripciones y checkout | `/api/subscription/status`, `/api/subscription/invoice`, `/api/subscription/portal`, `/api/web-page-checkout`, `/api/stripe/demo-buy-button` |
| Landing pages | `/api/landing-pages/catalog`, `/api/landing-pages/[pageId]/content`, `/api/landing-pages/[pageId]/download`, `/api/landing-pages/[pageId]/readability`, `/api/landing-pages/readability-index` |
| Demos y R2 | `/api/refactory-online/[slug]`, `/api/webpages/assets/[...path]`, `/api/web-pages/validate-demo-url`, `/api/r2/buckets` |
| Datos de usuario | `/api/activity/ping`, `/api/interests/track`, `/api/like`, `/api/profile/paypal` |
| Afiliados | `/api/affiliate/applications`, `/api/affiliate/click`, `/api/admin/affiliate-applications/[applicationId]`, `/api/admin/affiliate-sales` |
| Administración | `/api/cache/invalidate`, `/api/cache/stats`, `/api/seed` |

## Sincronización aditiva de usuarios

### Webhook `user.created` de Clerk

Cada evento verificado `user.created` de Clerk agrega automáticamente el correo
a la colección `prompt-studio.user_profiles` de MongoDB y a Resend. Ambas escrituras
son idempotentes y conservan los registros existentes. Un fallo temporal
devuelve HTTP `503` para que Clerk/Svix reintente el evento de forma segura.

### `GET /api/sync-clerk`

Obtiene hasta 500 usuarios de Clerk. Si el correo ya existe en MongoDB, el usuario se omite completamente. Los usuarios faltantes se agregan a:

- `user_profiles`
- `user_profiles`
- `user_profiles`
- Resend

El endpoint no actualiza ni elimina usuarios existentes de la base de datos.

Respuesta de ejemplo:

```json
{
  "success": true,
  "message": "Additive sync complete",
  "usersAdded": 3,
  "usersAlreadyRegistered": 127,
  "totalFoundInClerk": 130
}
```

### `GET /api/sync-registered-users-to-resend`

Lee los correos de `prompt-studio.user_profiles`, carga la audiencia completa de Resend mediante paginación y crea únicamente los contactos faltantes. Nunca actualiza contactos, reactiva usuarios dados de baja ni elimina contactos.

Variables requeridas:

```env
MONGODB_URI=mongodb+srv://...
RESEND_API_KEY=re_...
# Opcional: omitir para usar los contactos globales de Resend
RESEND_AUDIENCE_ID=...
CRON_SECRET=...
```

Petición recomendada:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "$DOMAIN/api/sync-registered-users-to-resend"
```

Cuando `RESEND_AUDIENCE_ID` está vacío o no existe en la cuenta actual de
Resend, el endpoint sincroniza automáticamente contra la lista global de
contactos. El administrador autenticado en Clerk cuyo correo está configurado en
`PROMPT_STUDIO_PREMIUM_JO` también puede abrir directamente el endpoint en el navegador.

Respuesta de ejemplo:

```json
{
  "message": "Additive sync complete (prompt-studio.user_profiles to Resend)",
  "database": "prompt-studio",
  "collection": "user_profiles",
  "audienceId": "audience_id",
  "totalFoundInDatabase": 130,
  "addedCount": 3,
  "alreadyRegisteredCount": 127,
  "errorCount": 0,
  "errors": []
}
```

## Catálogo y rutas públicas

Rutas públicas principales:

- `/`
- `/prompts`
- `/image-prompts`
- `/video-prompts`
- `/landing-pages`
- `/image-tags`
- `/video-tags`
- `/web-tags`
- `/prices`
- `/affiliate-program`
- `/prompt/edit`

Rutas dinámicas del catálogo:

- `/landing-pages/[slug]`
- `/webpages/[slug]/`
- `/tags/[tag]`
- `/gallery/[id]`
- `/gallery-videos/[id]`

Las demos estáticas se encuentran en `public/webpages/<demoUrl>/`. La fuente del catálogo es `public/webpages/web-pages.json`. Las demos almacenadas en Cloudflare R2 se resuelven mediante las mismas rutas públicas.

## Sitemap y SEO

- Código fuente: `src/app/sitemap.ts`
- URL pública: `${DOMAIN}/sitemap.xml`
- Configuración de robots: `src/app/robots.ts`

Ejecuta todas las validaciones SEO antes de desplegar:

```bash
npm run seo:validate-all
```

La suite valida la cobertura del catálogo, URLs canónicas, composición del sitemap, reglas de robots, metadatos, datos estructurados, enlaces internos, duplicados, rendimiento, preparación para Search Console y respuestas HTTP de producción.

## Eventos de analítica

La aplicación envía el mismo contexto de interacción a GA4 y Firebase Analytics.

| Evento | Significado |
| --- | --- |
| `web_open_demo_URL` | Un usuario abre una demo |
| `web_buy_button_premium` | Un usuario inicia el flujo de compra |
| `web_view_prompt` | Un usuario autenticado abre un prompt |
| `web_download_free` | Un usuario descarga un componente gratuito |
| `web_download_premium` | Un usuario Premium o Startup descarga un componente |

Las dimensiones habituales incluyen `page_id`, `page_title`, `item_id`, `item_name`, `item_category`, `membership`, `value`, `currency`, `action_source`, `document_title`, `page_path` y `page_location`.

Las compras y los ingresos confirmados deben provenir de la confirmación de Stripe o de un evento `purchase` de GA4. `web_buy_button_premium` solo mide intención.

## Lista de verificación para despliegue

1. Configura las variables de producción.
2. Confirma las URLs y secretos de los webhooks de Clerk y Stripe.
3. Ejecuta `npm run build`.
4. Ejecuta `npm run seo:validate-all`.
5. Verifica `/robots.txt` y `/sitemap.xml`.
6. Prueba el checkout y la recepción del webhook de Stripe.
7. Confirma la entrega de demos y recursos desde R2.
8. Verifica los eventos de analítica sin exponer datos privados.

## Perfiles oficiales

- [Instagram](https://www.instagram.com/prompstudio/)
- [TikTok](https://www.tiktok.com/@promptstudio)
- [Pinterest](https://www.pinterest.com/prompstudio/)
- [Facebook](https://www.facebook.com/prompt.stuudio/)

## Más información

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [Clerk](https://clerk.com/docs)
- [Stripe](https://docs.stripe.com/)
- [Resend](https://resend.com/docs)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Genkit](https://firebase.google.com/docs/genkit)


## Recomendación legal
Este documento ya cubre de forma amplia aspectos de privacidad para una plataforma SaaS con autenticación, pagos, IA y contenido digital. Sin embargo, para un cumplimiento más sólido, te recomendaría añadir (como documentos separados enlazados desde el pie de página):

1. Política de Cookies (detallando todas las cookies por nombre, duración y proveedor).
2. Términos y Condiciones.
3. Política de Reembolsos.
4. Política de Licencias de los Prompts y Recursos Digitales (muy importante para un marketplace de prompts).
5. Acuerdo de Suscripción Premium.
6. Aviso DMCA / Copyright para reclamaciones de propiedad intelectual.
7. Acuerdo para Afiliados, si el programa de afiliados está disponible.
8. Politica de Privacidad. <



Con esta estructura se cubren aspectos específicos de una plataforma como Prompt Studio, incluyendo:

* Venta de prompts para IA.
* Venta de imágenes, videos y plantillas web.
* Recursos gratuitos y Premium.
* Licencias de uso de activos digitales.
* Generación de contenido mediante IA.
* Suscripciones.
* Pagos.
* Afiliados.
* Propiedad intelectual.
* Derechos del usuario.
* Cumplimiento del RGPD (GDPR), CCPA/CPRA y la Ley Federal de Protección de Datos Personales de México.
* Uso de Clerk, Stripe, MongoDB Atlas, Resend, Cloudflare R2, Google Gemini/Genkit, Google Analytics 4, Firebase Analytics y Vercel Analytics.

Además, incluiré cláusulas específicas para proteger tu contenido, por ejemplo:

* prohibición de revender prompts cuando la licencia no lo permita;
* prohibición de compartir recursos Premium públicamente;
* limitación de responsabilidad sobre los resultados obtenidos con IA;
* protección frente al scraping masivo de la plataforma;
* prohibición de usar bots para descargar contenido;
* protección frente al uso automatizado de la API o de los generadores de prompts;
* licencias comerciales diferenciadas (si decides ofrecerlas en el futuro).

Recomendación jurídica

Este documento ya tiene un nivel muy sólido para una plataforma SaaS internacional. Antes de publicarlo, te recomendaría añadir dos anexos independientes:

1. Política de Licencias, donde definas claramente qué puede hacer el comprador con cada tipo de prompt (Personal, Comercial, Extended, Agency, etc.).
2. Política de Reembolsos, separada de los Términos y Condiciones, ya que Stripe, Visa, Mastercard y muchas legislaciones de protección al consumidor esperan que esta política sea fácilmente accesible y diferenciada. Esto reduce el riesgo de contracargos y mejora el cumplimiento legal.

Crea la Política de Cookies: tengo una pagina que funciona como una plataforma de venta de prompts de videos, imagenes y paginas, contienen videos, imágenes y paginas web gratis y una venta de tipo premium, | Clerk | Autenticación, sesiones, perfiles, metadatos y webhooks |
| Stripe | Compras únicas, suscripciones, facturas, portal y webhooks de pago |
| MongoDB Atlas | Usuarios, perfiles, actividad, afiliados, legibilidad y compras |
| Resend | Correos transaccionales, contactos y audiencias |
| Cloudflare R2 | Demos HTML y recursos estáticos |
| Google Gemini / Genkit | Generación de prompts y contenido |
| Firebase Analytics | Eventos de interacción del cliente |
| Google Analytics 4 | Analítica de navegación e intención de conversión |
| Vercel Analytics | Métricas de tráfico y rendimiento 
Base de datos MongoDB. La plataforma se llama: Prompt Studio. (https://www.prompstudio.com), su correo es: support@prompstudio.com. Y esta hecha por: Magzin LLC, 800 Third Avenue Associates, New York, NY, 10022, United States


✅ Política de Privacidad (40 secciones)
✅ Términos y Condiciones (40 secciones)
✅ Política de Cookies (20 secciones)
✅ Política de Reembolsos (20 secciones)
✅ Política de Licencias (30 secciones)

Comienza con Política de Cookies (20 secciones), yo te ire diciendo cuando cambies de pagina:
✅ Acuerdo de Suscripción Premium (20 secciones)
✅ Política DMCA / Copyright (20 secciones)
✅ Acuerdo del Programa de Afiliados (20 secciones)

Recomendación jurídica importante

Tu Política de Licencias, junto con los Términos y Condiciones, la Política de Privacidad y la Política DMCA/Copyright, constituye el principal mecanismo contractual para proteger el catálogo de Prompt Studio.

Como mejora adicional, sería recomendable incorporar una cláusula específica que prohíba expresamente el uso de los recursos para:

* entrenar modelos de Inteligencia Artificial;
* crear conjuntos de datos (datasets);
* realizar minería de datos (data mining);
* extracción automatizada (scraping);
* ingeniería de prompts (prompt harvesting);
* alimentar modelos fundacionales (foundation models);
* generar productos o servicios que compitan directamente con Prompt Studio utilizando los recursos originales.

Esta protección es especialmente relevante para una plataforma dedicada a la venta de prompts y recursos de IA, ya que ayuda a reforzar la defensa frente a usos no autorizados que podrían afectar el valor de tu catálogo.

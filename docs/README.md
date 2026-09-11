# Prompt Studio

Plataforma web para descubrir, personalizar y generar recursos creativos con IA: imágenes, videos, prompts, componentes y landing pages.

La aplicación está construida con Next.js App Router y usa **Clerk** para autenticación. No utiliza Kinde.

## Requisitos

- Node.js 22.11.0 o una versión compatible de Node 22
- npm
- Una aplicación de Clerk para desarrollo
- MongoDB para las funciones que persisten usuarios, compras, actividad y generaciones

El repositorio incluye `.nvmrc` y `.node-version`. Con `nvm`:

```bash
nvm use
```

La instalación se detiene automáticamente si se ejecuta con una versión de Node incompatible.

## Puesta en marcha

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea tu configuración local a partir de la plantilla versionada:

   ```bash
   cp .env.example .env.local
   ```

3. Configura como mínimo las credenciales de desarrollo de Clerk:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

4. Añade `MONGODB_URI` y las credenciales de los servicios que vayas a utilizar. La lista completa, con comentarios y valores de ejemplo seguros, está en `.env.example`.

5. Inicia el servidor:

   ```bash
   npm run dev
   ```

La aplicación queda disponible en [http://localhost:3046](http://localhost:3046).

## Autenticación con Clerk

Las rutas predeterminadas son:

- Inicio de sesión: `/sign-in`
- Registro: `/sign-up`
- Redirección después de iniciar sesión: `/dashboard`
- Redirección después de registrarse: `/prices`

Estas rutas pueden modificarse con las variables `NEXT_PUBLIC_CLERK_*` documentadas en `.env.example`.

Para sincronizar usuarios configura un webhook de Clerk dirigido a:

```text
https://tu-dominio.com/api/webhooks/clerk
```

Guarda su signing secret en `CLERK_WEBHOOK_SECRET`. Antes de desplegar puedes comprobar las claves con:

```bash
npm run verify:clerk
npm run verify:clerk:prod
```

La validación de producción exige claves `pk_live_*` y `sk_live_*`.

## Variables de entorno

No copies secretos en el README ni en `.env.example`. Utiliza `.env.local` durante el desarrollo y el gestor de secretos de la plataforma durante el despliegue.

Las variables están agrupadas en `.env.example` por integración:

- Proveedores de IA: OpenAI, Anthropic, Gemini, Veo, Runway, Fal y otros
- Autenticación: Clerk
- Pagos: Stripe
- Persistencia: MongoDB
- Archivos: Cloudflare R2
- Correo: Resend
- Analítica: Firebase y servicios de Vercel
- Infraestructura: caché, rate limiting, CSP y trabajos internos

Las claves de proveedores de IA son privadas y no deben llevar el prefijo `NEXT_PUBLIC_`.

Comprueba que la plantilla no contiene secretos reales con:

```bash
npm run verify:env-example
npm run verify:rotation
```

## Servicios principales

| Servicio | Responsabilidad |
| --- | --- |
| Clerk | Sesiones, perfiles y webhooks de usuarios |
| MongoDB + Mongoose | Datos de aplicación, compras, afiliados y trabajos de IA |
| Stripe | Suscripciones, compras, facturas y webhooks de pago |
| Cloudflare R2 | Demos, descargas y catálogos privados |
| Resend | Correo transaccional y sincronización de contactos |
| Genkit y proveedores de IA | Generación de imágenes, video, texto y código |

## Persistencia

La conexión se configura mediante `MONGODB_URI`. Los nombres reales de las colecciones los declaran los esquemas de `src/models`; no mantengas una segunda lista manual en este documento.

Áreas de datos principales:

- perfiles y preferencias de usuario;
- trabajos, créditos y feedback de generación con IA;
- compras y elementos guardados;
- actividad y observabilidad;
- solicitudes, ventas y estadísticas de afiliados.

Algunos modelos históricos comparten la colección `user_profiles`. Antes de modificarla, revisa `NewUser`, `RegisteredUser` y `UserProfile` en `src/models` y las rutas de sincronización correspondientes.

## Comandos de desarrollo

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor Next.js con Turbopack en el puerto 3046 |
| `npm run typecheck` | Comprobación de TypeScript |
| `npm test` | Pruebas unitarias y validación de datos |
| `npm run test:e2e` | Pruebas de navegador con Playwright |
| `npm run test:ci` | Validaciones principales ejecutadas en CI |
| `npm run build` | Catálogos, build de producción y optimización de recursos |
| `npm run analyze:routes` | Análisis del JavaScript asociado a las rutas |
| `npm run genkit:dev` | Entorno local de Genkit |

Antes de abrir un pull request ejecuta:

```bash
npm run test:ci
```

Cuando el cambio afecte a navegación, interfaz o rendimiento, ejecuta también:

```bash
npm run test:e2e
```

## Estructura del proyecto

```text
src/app/          Rutas, páginas, acciones del servidor y handlers de API
src/components/   Componentes de interfaz compartidos
src/hooks/        Estado y comportamiento reutilizable del cliente
src/lib/          Integraciones, catálogos y lógica de dominio
src/models/       Esquemas de MongoDB/Mongoose
src/ai/           Configuración y flujos de Genkit
public/           Recursos públicos y catálogos derivados
scripts/          Auditorías, sincronización, builds y verificaciones
tests/            Pruebas unitarias, de datos y end-to-end
docs/             Documentación operativa específica
```

## Capacidades técnicas

La documentación para la candidatura —Coding/SWE, evaluación aplicada de ML, Technical PM, Computer Use, MCP, Cyber Security, herramientas empresariales, STEM QA, contenido sintético, scraping y Quant Trading— está centralizada en [docs/capabilities](docs/capabilities/README.md).

Cada ficha separa evidencia, comandos de verificación y límites. Las áreas que todavía no forman parte del producto se identifican expresamente para evitar afirmaciones que el repositorio no pueda demostrar.

## Licenciamiento de datos operativos

La propuesta para preparar y licenciar copias autorizadas y anonimizadas de tickets, conversaciones, documentos y código está documentada en [docs/data-licensing](docs/data-licensing/README.md).

Esta es una línea de producto propuesta, no una capacidad disponible ni una promesa de ingresos. La documentación cubre el flujo del producto, consentimiento y derechos, exclusiones de datos sensibles, anonimización, control de calidad, términos de licencia, trazabilidad y compensación.

## Escalamiento de la organización

El plan para evolucionar el producto y la empresa desde un núcleo de fundador hasta escenarios de 10, 20, 30 y 50 personas está en [docs/escalamiento](docs/escalamiento/README.md). Incluye equipos, organigramas, agentes supervisados, ingeniería, infraestructura, seguridad, operaciones, métricas, costes y condiciones explícitas para contratar.

## Estrategia de CRM

La auditoría del CRM de facto, comparación de alternativas y plan propuesto de HubSpot están en [docs/crm](docs/crm/README.md). El diseño mantiene Clerk, MongoDB y Stripe como sistemas autoritativos y utiliza el CRM para ventas, onboarding, soporte y expansión.

## Integraciones sensibles

- `/api/webhooks/clerk` valida eventos de Clerk antes de sincronizar perfiles.
- `/api/webhooks/stripe` valida la firma de Stripe y actualiza compras o suscripciones.
- Las rutas `/api/sync-*` requieren `CRON_SECRET` o una sesión administrativa autorizada.
- Los precios, costes de créditos y permisos se determinan en el servidor.
- Los catálogos o productos de pago no deben publicarse directamente bajo `public/`.

## Integración continua

El workflow de GitHub Actions usa la versión declarada en `.nvmrc` y ejecuta dos trabajos:

1. Instalación, validación de entorno, TypeScript, pruebas y auditoría de caché.
2. Pruebas end-to-end con Chromium.

Para las pruebas de navegador desplegadas puede configurarse `PLAYWRIGHT_BASE_URL` como variable del repositorio.

## Despliegue

Antes de publicar:

1. Usa claves Clerk de producción y registra el dominio en su dashboard.
2. Configura los webhooks de Clerk y Stripe con las URLs de producción.
3. Añade todas las variables necesarias en el gestor de secretos del hosting.
4. Ejecuta `npm run verify:clerk:prod` y `npm run test:ci`.
5. Ejecuta `npm run build` con Node 22.

No reutilices credenciales de desarrollo en producción ni expongas secretos mediante variables `NEXT_PUBLIC_*`.

# Dependencias de Vercel Functions

Auditoría de #699 sobre dependencias de servidor grandes y su entrada en las
Functions. Ejecutar `npm run audit:vercel-functions` para reconstruir el mapa
desde el grafo de imports estáticos del código fuente.

## Mapa y decisión

| Dependencia | Functions/rutas que la necesitan | Tratamiento |
|---|---|---|
| Genkit + Google GenAI | `/api/prompt-optimizer`, `/api/component-personalization` y fallback Google local del procesador de trabajos | Las rutas dedicadas mantienen import eager. El procesador y las Server Actions cargan el flow dinámicamente sólo al ejecutarlo. Los schemas importan `zod`, no el barrel de `genkit`. |
| Mongoose/MongoDB | Rutas de proyectos, catálogo privado, compras, IA, campañas, afiliados, reseñas y observabilidad | Se mantiene limitado a rutas con persistencia y bajo el empaquetado normal de Next. Los modelos no se importan desde un barrel compartido. |
| AWS SDK S3 | Assets/demos R2, descargas y bundles Refactory | Se mantiene externo: es requerido para llamadas R2 y externalizarlo evita duplicar el SDK dentro de cada bundle. |
| Cloudflare SDK | `/api/r2/buckets` y validaciones que consultan la API de cuenta | Import dinámico: validaciones locales/HTTP no inicializan el SDK. |
| Sharp | `/api/webpages/assets/[...path]` únicamente cuando convierte JPEG/PNG | Import dinámico después de descartar SVG, GIF, WebP, AVIF y formato original. Se mantiene externo por su binario nativo. |
| Stripe | Checkout, webhook, portal, invoice y fallback de suscripción | Checkout/webhook mantienen carga directa. El helper compartido de suscripción lo carga después de auth, Clerk y atajos administrativos. |
| OpenTelemetry/Jaeger | `instrumentation.ts` y observabilidad del runtime Node | Se mantiene externo. El alias de webpack ya corta la cadena Mongoose/OTel en Edge. |
| Firebase | Analytics del navegador | No pertenece a Functions: sólo entra desde componentes cliente. No se añadió a `serverExternalPackages`. |

`serverExternalPackages` conserva únicamente Genkit, Google GenAI,
OpenTelemetry, Firebase Admin, AWS S3 y Sharp. Stripe, Mongoose cliente y
Firebase web siguen bajo el comportamiento normal de Next porque ampliar esta
lista sin una medición por Function trasladaría dependencias, no las reduciría.

## Medición reproducible

Se empaquetó `src/app/api/ai/jobs/process/route.ts` con esbuild, ESM y code
splitting, usando las mismas fuentes antes y después del cambio. Next/Clerk se
marcaron externos para aislar el efecto de dependencias de aplicación.

| Métrica | Antes | Después | Diferencia |
|---|---:|---:|---:|
| Chunk inicial del procesador | 10,025,061 B | 2,959,897 B | −7,065,164 B (−70.5 %) |
| Flow Google diferido | no separado | 6,488,774 B | sólo carga en fallback local |

Comando equivalente:

```bash
esbuild src/app/api/ai/jobs/process/route.ts --bundle --splitting \
  --platform=node --format=esm --outdir=/tmp/function-audit \
  --external:next '--external:next/*' '--external:@clerk/*' \
  --external:server-only
```

La reducción corresponde al código inicial evaluado en cold start; el chunk
diferido sigue incluido para el fallback Google y se carga sólo cuando no hay
worker externo. No se presenta como una medición de latencia de producción:
para eso hace falta comparar p50/p95 de `initDuration` en Vercel después del
despliegue.

## Verificación posterior

Tras desplegar, comparar durante al menos 24 horas:

1. `initDuration` p50/p95 de `/api/ai/jobs/process`;
2. errores `FUNCTION_INVOCATION_FAILED` o módulos ausentes;
3. primera ejecución Google sin worker, para confirmar la carga diferida;
4. conversión AVIF/WebP y passthrough SVG/GIF en assets;
5. checkout, webhook y resolución de suscripción con Stripe.

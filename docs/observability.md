# Observabilidad

Los eventos técnicos y comerciales se almacenan en `observability_events` durante 90 días. Los campos `route`, `sessionId`, `productId` y `userId` permiten estudiar, por ejemplo, si una demo con LCP alto convierte menos.

## Señales capturadas

- Navegador: errores globales, promesas rechazadas, LCP, CLS, INP, FCP y TTFB.
- Recursos: tiempo y bytes transferidos de imágenes, videos e iframes de preview.
- Servidor: errores no controlados mediante `instrumentation.ts`.
- Stripe: creación de checkout, webhooks procesados o fallidos y compras confirmadas.
- IA: finalización, fallos, intentos, créditos y coste estimado.
- MongoDB: `observeOperation` registra operaciones que superan el umbral de consulta lenta.
- Comercio: previews, copias, checkouts, descargas y conversiones procedentes de la analítica existente.

El panel privado está en `/dashboard/observability` y su API solo permite acceso al correo administrador configurado en `PROMPT_STUDIO_PREMIUM_JO`.

No se guardan prompts, código, claves, cuerpos de Stripe ni URLs completas de recursos. Los metadatos se limitan en longitud y cantidad.

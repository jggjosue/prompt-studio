# Observabilidad

Los eventos técnicos y comerciales se almacenan en `observability_events` durante 90 días. Los campos `route`, `sessionId`, `productId` y `userId` permiten estudiar, por ejemplo, si una demo con LCP alto convierte menos.

## Señales capturadas

- Navegador: errores globales, promesas rechazadas, LCP, CLS, INP, FCP y TTFB.
- Recursos: tiempo y bytes transferidos de imágenes, videos e iframes de preview.
- Servidor: errores no controlados mediante `instrumentation.ts`.
- Stripe: creación de checkout, webhooks procesados o fallidos y compras confirmadas.
- IA: generación de imágenes con inicio, éxito y fallo por proveedor y modelo, latencia, forma del resultado (mime y tamaño) y conciliación de créditos. Cada evento lleva `jobId` y `correlationId` para trazar un fallo de extremo a extremo desde el panel. La ruta `/api/admin/observability?days=N` agrega además `modelHealth`, que da la tasa de éxito/fallo y la latencia media agrupadas por `providerModelId` (`metadata.provider` + `metadata.modelId`).
- MongoDB: `observeOperation` registra operaciones que superan el umbral de consulta lenta.
- Comercio: previews, copias, checkouts, descargas y conversiones procedentes de la analítica existente.

El panel privado está en `/dashboard/observability` y su API solo permite acceso al correo administrador configurado en `PROMPT_STUDIO_PREMIUM_JO`.

No se guardan prompts, código, claves, cuerpos de Stripe, URLs completas de recursos ni contenido generado. De cada generación de imagen solo se conservan el mime, el tamaño decodificado y si el resultado quedó inline o remoto; el prompt no entra en el evento. Los metadatos se limitan en longitud y cantidad. La retención es de 90 días vía TTL de `createdAt`.

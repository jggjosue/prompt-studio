# Scrape

Prompt Studio no implementa extracción general de datos de sitios de terceros.

Las solicitudes HTTP de los scripts existentes sirven para validar el propio sitio, sitemap, cabeceras y despliegues. Eso es monitoreo y QA, no scraping.

## Requisitos antes de añadirlo

- Caso de uso y base legal definidos.
- Respeto de robots, términos, rate limits y derechos de autor.
- Procedencia por registro y fecha de captura.
- Minimización de datos personales.
- Reintentos, cache y límites por dominio.
- Pruebas contra fixtures locales, nunca contra producción durante CI.

No se recomienda seleccionar esta capacidad para la candidatura basándose en Prompt Studio. La experiencia demostrable relacionada es validación web automatizada.

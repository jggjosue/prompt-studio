# ADR-004: Inspector dinámico dirigido por ComponentRegistry

**Estado:** Accepted  
**Fecha:** 2026-09-29  
**Ruta de producto:** `/page-composer`

## Decisión

El panel de propiedades no conoce tipos concretos de componentes. Para el nodo seleccionado consulta `ComponentRegistry` y genera sus controles desde tres campos:

- `editableProperties`: propiedad, etiqueta, clase de control y opciones permitidas;
- `styleControls`: estilos que el componente permite modificar;
- `responsive`: estilos que aceptan override por viewport.

Este contrato mantiene `PageSchema` como única fuente de verdad. Cada cambio válido produce una mutación inmutable del schema local y React vuelve a renderizar el canvas inmediatamente, sin recargar la página y sin escribir cada pulsación en MongoDB.

## Controles genéricos

El inspector proporciona controles reutilizables de texto, texto largo, URL, imagen, colección de imágenes, selección y datos estructurados. Los estilos se agrupan en layout, espaciado, tipografía y apariencia. El catálogo incluye dimensiones, padding, margin, gap, alineación, display, tipografía, colores, fondo, borde, radio, sombra y opacidad.

Los objetos y listas que todavía no justifican una experiencia especializada se editan como JSON validado. Una definición futura puede incorporar un editor especializado sin duplicar un inspector completo por componente.

## Validación y resets

Las mutaciones puras `updateComponentProperty` y `updateComponentStyle` verifican que la propiedad esté declarada en el registro, que los props completos satisfagan su schema Zod, que URLs e imágenes usen protocolos seguros, que los estilos estén permitidos y que los overrides sean compatibles con el viewport. Todo resultado vuelve a pasar por `validatePageSchema`.

El usuario puede restablecer una propiedad, un estilo, todos los estilos o el componente completo. Los defaults proceden del registro; restablecer el componente conserva su identidad y sus hijos.

## Tokens de tema

Los valores `token:<grupo>.<clave>` se seleccionan desde `site.theme`. El renderer los convierte en variables CSS y la validación rechaza referencias inexistentes. Así, un componente mantiene el vínculo semántico con el tema en vez de copiar su valor actual.

## Evolución

Los nuevos componentes deben declarar metadata suficiente para aparecer automáticamente en el inspector. Las futuras operaciones de IA deberán emitir mutaciones o patches de `PageSchema` sujetos a las mismas reglas; no deberán generar HTML, JSX ni JavaScript arbitrarios.

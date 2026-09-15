# Capacidades técnicas

Este directorio documenta las áreas del selector de capacidades mostrado en la candidatura. Su objetivo es que cada afirmación tenga evidencia local, un comando de verificación y límites explícitos.

## Resumen verificable

| Área | Estado en Prompt Studio | Evidencia principal |
| --- | --- | --- |
| [Coding/SWE](coding-swe.md) | Implementada | Next.js, TypeScript, APIs, modelos y pruebas |
| [ML Research](ml-research.md) | Parcial: evaluación aplicada | datasets, rúbricas, regresión y comparación de proveedores |
| [Technical PM](technical-pm.md) | Implementada en producto propio | PRD, prioridades, métricas y decisiones |
| [Quant Trading](quant-trading.md) | No implementada | fuera del dominio del producto |
| [Computer Use](computer-use.md) | Parcial: automatización web | Playwright y pruebas de navegador; no agente de escritorio |
| [MCP Integrations](mcp-integrations.md) | No implementada | no existe servidor ni cliente MCP del producto |
| [Cyber Security](cyber-security.md) | Implementada como AppSec defensiva | autenticación, autorización, CSP, secretos y límites |
| [Enterprise Tool Use](enterprise-tool-use.md) | Implementada | Clerk, Stripe, MongoDB, R2, Vercel y correo |
| [STEM QA](stem-qa.md) | Parcial: QA de software | evaluación reproducible; no benchmark científico especializado |
| [Synthetic](synthetic.md) | Implementada | generación multimodal, datasets y resultados sintéticos |
| [Scrape](scrape.md) | No implementada como producto | validación HTTP propia; no extracción de sitios de terceros |

## Demostración recomendada

1. Abrir `/demo/reproducible`.
2. Ejecutar `npm run demo:verify`.
3. Mostrar una generación con contrato de salida y su ficha de procedencia.
4. Comparar proveedores y enseñar una regresión de modelo.
5. Recorrer `brief → generación → aprobación → guarda de publicación → analítica`.

No se deben marcar como experiencia de producción las áreas identificadas como parciales o no implementadas sin explicar su alcance.

## Documentación relacionada

- [Licenciamiento de datos operativos](../data-licensing/README.md): propuesta de producto, gobernanza, pipeline técnico, licencia y compensación.
- [Inventario de fuentes y derechos](../historial/04-inventario-de-fuentes-y-derechos.md): evaluación preliminar de procedencia y restricciones.
- [Valor y licenciamiento del historial](../historial/05-valor-y-licenciamiento-del-historial.md): análisis del historial del proyecto como activo potencial.

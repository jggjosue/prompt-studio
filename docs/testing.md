# Pruebas automatizadas y presupuestos

El proyecto requiere Node 22.11 o posterior. No mezcles instalaciones arm64 y x64 dentro del mismo `node_modules`.

## Comandos

- `npm run typecheck`: valida TypeScript.
- `npm run test:unit`: compra, Premium, descarga firmada, límites diarios y cola de IA.
- `npm run test:data`: JSON válidos, IDs autoritativos únicos y medios locales existentes.
- `npm run test:e2e`: responsive móvil, teclado, links, imágenes y demos.
- `npm run test:e2e:performance`: Core Web Vitals y presupuestos de red.
- `npm run test:ci`: comprobaciones rápidas que no necesitan navegador.

Para medir JavaScript comprimido contra un deployment real:

```bash
PLAYWRIGHT_BASE_URL=https://www.prompstudio.com npm run test:e2e:performance
```

## Presupuestos obligatorios

| Métrica | Límite |
| --- | ---: |
| LCP | < 2,500 ms |
| INP | < 200 ms |
| CLS | < 0.1 |
| JavaScript inicial comprimido | < 200 KB |
| Imagen de card transferida | < 100 KB |
| API de catálogo | < 300 ms |

La comprobación de JavaScript comprimido se omite únicamente cuando el servidor local no devuelve `Content-Encoding`; en CI debe ejecutarse contra preview o producción para aplicar ese presupuesto.

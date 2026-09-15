# Demo reproducible

La ruta pública `/demo/reproducible` demuestra el sistema de evaluación sin depender de cuentas externas.

## Reproducir

```bash
npm run demo:verify
```

El comando carga el dataset público y los snapshots históricos, recalcula todas las métricas dos veces, comprueba que los resultados sean idénticos y devuelve una huella SHA-256.

## Arquitectura

1. `src/data/reproducible-demo.ts` contiene el dataset versionado y resultados congelados.
2. `src/lib/reproducible-demo.ts` calcula éxito, calidad, consistencia, costo y percentiles de latencia.
3. `/api/demo/reproducible/report` genera informes JSON, CSV y HTML.
4. La página pública explica la metodología y reproduce el video incluido.

La demo no ejecuta modelos, no lee variables de proveedor y no contiene resultados de usuarios. Los nombres y cifras son fixtures sintéticos; no deben interpretarse como benchmarks actuales.

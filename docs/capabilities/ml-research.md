# ML Research

El proyecto demuestra **evaluación aplicada de modelos**, no investigación de nuevos algoritmos ni entrenamiento de modelos base.

## Capacidades presentes

- Datasets controlados y versionados.
- Rúbricas ponderadas y resultados reproducibles.
- Comparación A/B entre prompts y proveedores.
- Evaluación humana ciega.
- Regresión automática al cambiar de modelo.
- Métricas de calidad, consistencia, costo, latencia y error.

La demo pública vive en `/demo/reproducible` y su método se documenta en [demo reproducible](../reproducible-demo.md).

## Verificación

```bash
npm run demo:verify
node --import tsx --test tests/unit/model-regression.test.ts tests/unit/evaluation-suite.test.ts
```

## Límite honesto

No hay fine-tuning, entrenamiento distribuido, publicación académica ni experimentos sobre arquitecturas propias. La etiqueta adecuada es *LLM evaluation / applied ML engineering*.

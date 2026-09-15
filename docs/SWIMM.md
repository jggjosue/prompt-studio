# Guía de Cobertura de Documentación (Swimm & Documentation Reach)

Esta guía documenta la estrategia para mantener y mejorar el indicador de **Documentation Reach** medido por la integración de Swimm en GitHub para `jggjosue/prompt-studio`.

---

## 1. ¿Qué es el *Documentation Reach*?

*Documentation Reach* mide la proporción de líneas de código fuente que están respaldadas, enlazadas o explicadas directamente por documentos interactivos.

* **Fórmula:**  
  $$\text{Reach} = \frac{\text{Líneas de código en archivos referenciados por docs}}{\text{Total de líneas de código fuente no ignoradas}}$$

* **Tiers:**
  * **Tier A:** $\ge 60\%$ de cobertura
  * **Tier B:** $40\% - 59\%$ de cobertura
  * **Tier C:** $20\% - 39\%$ de cobertura
  * **Tier D:** $< 20\%$ de cobertura

---

## 2. Configuración de Exclusiones (Fase 1)

Para evitar que scripts auxiliares, resultados de pruebas automatizadas o catálogos estáticos inflen el denominador, se aplican dos capas de exclusión:

### A. Archivo `.swmignore` (Raíz del proyecto)
El archivo [`.swmignore`](file:///.swmignore) define los patrones que Swimm omite de sus métricas de cobertura y escaneo:
* `tests/`, `test-results/`, `coverage/`
* `scripts/`
* `public/webpages/`, `src/data/`, `data/`
* Artefactos temporales y logs (`*.log`, `*.txt`, `*.tsbuildinfo`)

### B. Reglas de Git (`.gitignore`)
Se ignoran directorios volátiles generados por suites de prueba como `test-results/` para evitar que markdown o traces generados por Playwright sean contabilizados erróneamente como documentación del repositorio.

### C. Configuración en la Plataforma Web de Swimm (Opcional)
Si la organización utiliza la interfaz web de Swimm (`app.swimm.io`):
1. Ir a **Repository Settings** > **Scope & Exclusions**.
2. Verificar que los patrones de [`.swmignore`](file:///.swmignore) estén reflejados en los patrones de exclusión de la rama principal (`develop` / `main`).

---

## 3. Próximos Pasos (Fases 2 y 3)

1. **Vincular Documentación Existente:** Enlazar formalmente los documentos en [docs/](file:///docs) ([ARCHITECTURE.md](file:///docs/ARCHITECTURE.md), [DATABASE.md](file:///docs/DATABASE.md), etc.) con rutas exactas de archivos en `src/`.
2. **Playbooks de Alto Impacto:** Crear guías acopladas de código para los módulos centrales:
   * Autenticación y Middleware (`src/middleware.ts`, `src/proxy.ts`).
   * Motor de IA Genkit (`src/ai/`).
   * Persistencia y Modelos (`src/models/`, `src/lib/`).
   * Editor Visual y Componentes (`src/components/`, `src/hooks/`).
   * Pasarela de Pagos Stripe (`src/lib/stripe.ts`, `src/app/api/webhooks/stripe/`).

# Computer Use

El repositorio demuestra automatización de navegador para QA, no un agente general que controle un escritorio.

## Evidencia

- Playwright recorre autenticación, generación, compras, idioma, favoritos y navegación móvil.
- Emulación de viewport y teclado.
- Captura de errores de consola y fallos de página.
- Presupuestos de red y Core Web Vitals.
- Validación de despliegues por HTTP.

## Verificación

```bash
npm run test:e2e
npm run test:e2e:performance
```

## Límite honesto

No existe dentro de Prompt Studio un agente visual que opere aplicaciones nativas o resuelva tareas abiertas mediante mouse y teclado. Si el selector usa ese significado estricto, esta capacidad debe describirse como parcial.

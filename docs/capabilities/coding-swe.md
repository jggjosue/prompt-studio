# Coding / Software Engineering

Prompt Studio demuestra ingeniería full-stack sobre Next.js, React y TypeScript: interfaces, rutas de API, persistencia con Mongoose, colas de generación, pagos y publicación.

## Evidencia

- `src/app`: producto y API con App Router.
- `src/lib/generation`: adaptadores y lógica compartida de proveedores.
- `src/models`: contratos persistentes e índices de integridad.
- `tests/unit`, `tests/data` y `tests/e2e`: pruebas de dominio, seguridad, datos y navegador.
- `.github/workflows`: verificación continua con Node 22.

## Verificación

```bash
npm run typecheck
npm test
npm run test:e2e
```

## Alcance

La evidencia cubre desarrollo de producto web y sistemas de IA aplicados. No pretende demostrar desarrollo de kernels, compiladores o sistemas embebidos.

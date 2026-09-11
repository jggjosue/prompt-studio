# Enterprise Tool Use

Prompt Studio coordina servicios externos dentro de flujos con autenticación, errores, reintentos y trazabilidad.

| Sistema | Uso |
| --- | --- |
| Clerk | identidad, sesiones y usuarios |
| MongoDB / Mongoose | persistencia e índices de integridad |
| Stripe | suscripciones, compras, créditos y webhooks |
| Cloudflare R2 / S3 | almacenamiento de catálogos y activos |
| Vercel | despliegue, publicación y métricas web |
| Resend | correo transaccional |
| OpenTelemetry / Jaeger | trazas y diagnóstico |
| Proveedores de IA | texto, imagen y video mediante adaptadores |

## Principios de integración

- Secretos únicamente en el servidor.
- Idempotencia en cobros y trabajos.
- Proveedor detrás de una interfaz compartida.
- Contexto estructurado en errores, sin contenido privado.
- Degradación y reintentos explícitos.

La configuración vive en `.env.example`; el código nunca requiere copiar credenciales a la documentación.

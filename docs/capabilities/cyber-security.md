# Cyber Security

La evidencia corresponde a seguridad defensiva de aplicaciones y APIs.

## Controles existentes

- Clerk para autenticación y comprobaciones de propiedad por recurso.
- Firma de webhooks de Stripe y Clerk.
- Precios, créditos, permisos y proveedores decididos por el servidor.
- Rate limiting en escrituras y operaciones costosas.
- CSP, cabeceras defensivas y receptor de reportes.
- Escaneo de secretos actuales e históricos.
- Productos de pago fuera de directorios públicos.
- Descargas firmadas, límites atómicos e idempotencia.
- Sanitización de observabilidad para omitir prompts, credenciales y PII.
- Guardas de publicación para secretos, datos personales y licencias.

## Verificación

```bash
npm run verify:env-example
npm run verify:rotation
node --import tsx --test tests/unit/security-headers.test.ts tests/unit/rate-limit-and-api-auth.test.ts
```

## Alcance

No se afirma pentesting profesional, red team, análisis de malware ni seguridad de infraestructura corporativa. Consultar también [rotación de credenciales](../rotacion-de-credenciales.md).

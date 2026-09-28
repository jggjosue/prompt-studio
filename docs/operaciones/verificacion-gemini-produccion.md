# Verificar Gemini en producción

Esta comprobación separa tres causas que suelen mezclarse en un fallo de
generación: alcance de la variable en Vercel, autenticación de Google y modelo
retirado/no disponible. Nunca imprime el valor de una credencial.

## Configuración canónica

- Proveedor: `google`
- API: Gemini REST `v1`
- Modelo de imagen: `gemini-3.1-flash-image`
- Variable preferida: `GEMINI_API_KEY` (se admite `GOOGLE_API_KEY` como fallback)

`imagen-4.0-fast-generate-001` dejó de estar disponible el 17 de agosto de
2026. Los alias visibles `nano-banana-2-lite`, `nano-banana-2` y
`nano-banana-pro` se resuelven en el servidor al modelo canónico, sin permitir
que el cliente elija un modelo de texto para una generación de imagen.

## Comprobación en Vercel

Ejecutar con una cuenta enlazada al proyecto correcto:

```bash
vercel env ls production
vercel env run --environment=production -- npm run verify:gemini:prod
```

La primera orden confirma que `GEMINI_API_KEY` existe en **Production** sin
mostrar su valor. La segunda comprueba:

1. `VERCEL_ENV=production` y la revisión desplegada cuando Vercel las expone.
2. Que no haya dos variables de Google con valores diferentes.
3. Que el modelo configurado no esté retirado.
4. Que Google acepte la credencial y exponga el modelo mediante
   `GET /v1/models/gemini-3.1-flash-image`.

La clave se envía en `x-goog-api-key`, no como parámetro de URL. El diagnóstico
sólo conserva estado HTTP y códigos estructurados permitidos; descarta mensajes
arbitrarios del proveedor.

Después de crear, corregir o rotar la variable hay que desplegar de nuevo
Production. Una ejecución local con variables descargadas no demuestra que el
último despliegue las haya recibido.

## Atribuir un 401

Buscar el evento estructurado `generation_provider_request` añadido en #780:

- `service=google-gemini`, `host=generativelanguage.googleapis.com`: la respuesta
  sí procede de Google.
- `service=ai-generation-worker`: procede del worker configurado.
- Cualquier otro `service` debe investigarse como otra integración; no debe
  atribuirse a Gemini sólo porque el trabajo sea de imagen.

No copiar cuerpos de respuesta, cabeceras de autorización, URLs con query
strings ni valores de variables a GitHub o a los logs.

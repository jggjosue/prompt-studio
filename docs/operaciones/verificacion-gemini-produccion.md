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

## Prueba de humo de imagen

Después del preflight, ejecutar la prueba aislada contra el despliegue que se
quiere comprobar. No usa créditos, cola, MongoDB, R2 ni historial del chat:

```bash
curl --fail-with-body --request POST \
  --header "Authorization: Bearer $CRON_SECRET" \
  --header "Content-Type: application/json" \
  --data '{"prompt":"A photorealistic orange cat running through a green field"}' \
  https://TU-DOMINIO/api/debug/gemini-image
```

También puede ejecutarlo un administrador autenticado en Prompt Studio. El
secreto sólo se admite en `Authorization`; `?secret=` se rechaza para evitar
que termine en URLs, logs o historial.

Un resultado válido contiene `status=passed`, `correlationId`, proveedor,
modelo, estado HTTP, duración y una imagen `data:` cuyos bytes fueron validados
como PNG, JPEG, WebP o GIF. El resultado fallido contiene sólo categoría,
estado, código seguro y si es reintentable. No devuelve el prompt, credenciales
ni el cuerpo arbitrario del proveedor. El mismo `correlationId` se escribe en
el log estructurado `gemini_image_smoke`.

## Atribuir un 401

Buscar el evento estructurado `generation_provider_request` añadido en #780:

- `service=google-gemini`, `host=generativelanguage.googleapis.com`: la respuesta
  sí procede de Google.
- `service=ai-generation-worker`: procede del worker configurado.
- Cualquier otro `service` debe investigarse como otra integración; no debe
  atribuirse a Gemini sólo porque el trabajo sea de imagen.

No copiar cuerpos de respuesta, cabeceras de autorización, URLs con query
strings ni valores de variables a GitHub o a los logs.

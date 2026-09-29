# Media estática fuera del despliegue de Vercel

## Resultado de la migración #696

El 2026-09-25 se migraron los nueve MP4 de demos desde `public/webpages` al
bucket Cloudflare R2 ya configurado para Prompt Studio. El manifiesto
versionado está en `config/vercel-external-media.json` y conserva tamaño y
SHA-256 de cada objeto.

| Medición local | Antes | Después | Reducción |
|---|---:|---:|---:|
| `public/` | 155,252,735 bytes | 123,497,993 bytes | 31,754,742 bytes (20.5 %) |
| `public/webpages/` | 108,114,102 bytes | 76,359,360 bytes | 31,754,742 bytes (29.4 %) |
| MP4 bajo `public/webpages/` | 9 archivos | 0 archivos | 100 % |

Estas son medidas del checkout, no del panel de facturación de Vercel. La
reducción en un deployment nuevo es comprobable; el consumo retenido baja
cuando Vercel retire deployments antiguos según su política de retención.

## Entrega y compatibilidad

- Las demos solicitan `/api/webpages/assets/<ruta>`.
- La Function sólo comprueba el objeto y responde `307` con una URL R2 firmada
  durante una hora. No lee, almacena ni transmite el video.
- Un redirect temporal de `/webpages/:path*.mp4` conserva las URLs antiguas,
  incluidas las que pudieron quedar en marcadores o HTML externo.
- El objeto sale con `Content-Type: video/mp4` y cache inmutable de un año.
- Imágenes y HTML permanecen en el deployment: esta migración se limita a los
  binarios grandes e inmutables con mayor beneficio y menor riesgo de SEO.

## Operación

Subir o reparar los objetos desde un checkout que todavía tenga los archivos:

```bash
node scripts/mjs/migrate-vercel-external-media.mjs --upload
```

Comprobar los objetos sin escribir:

```bash
node scripts/mjs/migrate-vercel-external-media.mjs
```

El script exige que tamaño y SHA-256 coincidan antes de aceptar cada objeto.
No borra archivos locales ni imprime credenciales. Para añadir media nueva:

1. subirla con una clave estable bajo `webpages/`;
2. registrar ruta, bytes y SHA-256 en el manifiesto;
3. actualizar la demo para usar `/api/webpages/assets/`;
4. verificar R2 y sólo después eliminar el binario de `public/`;
5. ejecutar el auditor local y las pruebas de almacenamiento.

No se deben volver a introducir MP4 dentro de `public/webpages`; el test de
regresión lo impide.

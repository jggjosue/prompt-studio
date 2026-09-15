# Rotación de credenciales

`.env.example` está versionado (`.gitignore` lo exceptúa con `!.env.example`) y
llegó a contener 54 valores idénticos a `.env`. Se limpió en el commit
`2bf9a846`, pero **borrar un secreto de HEAD no lo borra del historial**: sigue
recuperable desde los commits antiguos con `git show <commit>:.env.example`.

Este documento es la lista de lo que hay que rotar y en qué orden.

## Antes de empezar

```bash
npm run verify:rotation
```

Recorre todas las versiones de `.env.example` del historial y te dice qué
credenciales en uso siguen coincidiendo con un valor filtrado. No imprime
valores, solo nombres de clave.

**Su punto ciego**: solo ve tu entorno local. Si producción usa claves distintas
—`sk_live_` en Vercel frente a `sk_test_` en tu máquina— una clave puede salir
limpia ahí y seguir comprometida en producción. La `sk_live_` de Clerk que
aparece en el historial es exactamente ese caso. Por eso la tabla de abajo manda
sobre el script.

## Qué hay que rotar

Orden pensado para minimizar el tiempo con la puerta abierta: primero lo que da
acceso a datos o dinero.

| # | Credencial | Dónde se rota | Variables a actualizar |
|---|---|---|---|
| 1 | Clave secreta de Clerk | Dashboard → API keys | `CLERK_SECRET_KEY` |
| 2 | Secreto de webhook de Clerk | Dashboard → Webhooks → endpoint | `CLERK_WEBHOOK_SECRET` |
| 3 | Usuario de MongoDB Atlas | Atlas → Database Access → Edit → Edit Password | `MONGODB_URI` |
| 4 | Token S3 de R2 | Cloudflare → R2 → Manage R2 API Tokens | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` |
| 5 | Token de API de Cloudflare | Cloudflare → My Profile → API Tokens | `CLOUDFLARE_API_TOKEN` |
| 6 | Clave de Stripe | Dashboard → Developers → API keys → Roll key | `STRIPE_SECRET_KEY` |
| 7 | Clave de Resend | Resend → API Keys | `RESEND_API_KEY` |
| 8 | Clave de Loops | Loops → Settings → API | `LOOPS_API_KEY` |

Notas por credencial:

- **Clerk (1 y 2)**: la clave publicable `pk_*` es pública por diseño y no se
  rota. El secreto de webhook es independiente de la clave de API: hay que
  rotarlo aparte o los webhooks quedarán rechazados por firma inválida.
- **MongoDB (3)**: rotar el password del usuario invalida la URI entera.
  Actualiza `MONGODB_URI` completa, no solo el password suelto.
- **Stripe (6)**: usa *Roll key* con un periodo de gracia en lugar de revocar de
  golpe, para no cortar pagos en vuelo.
- **R2 (4)**: crea el token nuevo **antes** de borrar el viejo, o las descargas
  de demos fallarán entre medias.

### Ya rotadas

Los secretos autoemitidos (los que se generan con `openssl rand`, no los emite
un proveedor) ya están rotados en `.env` y `.env.local`:

- `CRON_SECRET`
- `CACHE_ADMIN_TOKEN`
- `GUEST_DOWNLOAD_SECRET`
- `PURCHASE_DOWNLOAD_SECRET` (estaba vacío; ahora tiene valor propio)

**Falta copiarlos a Vercel.** Hasta que lo hagas, el entorno local y producción
tienen valores distintos: los cron jobs de Vercel seguirán funcionando con su
`CRON_SECRET` antiguo, que es uno de los filtrados.

Para regenerar cualquiera de ellos:

```bash
openssl rand -base64 32
```

## Consecuencia visible para usuarios

Rotar `GUEST_DOWNLOAD_SECRET` y `PURCHASE_DOWNLOAD_SECRET` **invalida todos los
enlaces de descarga firmados que estén en circulación**. Un cliente que compró
ayer y aún no descargó verá su enlace roto y tendrá que volver a generarlo desde
su cuenta.

`PURCHASE_DOWNLOAD_SECRET` estaba vacío y caía en cascada a
`GUEST_DOWNLOAD_SECRET` (ver `src/lib/purchase-download-token.ts:6`), así que
ambos comparten el mismo efecto. Merece la pena hacerlo en horario de bajo
tráfico y avisar en soporte.

De paso: esa cascada termina en `STRIPE_WEBHOOK_SECRET` como último recurso.
Usar un secreto de verificación de webhooks para firmar tokens de descarga mezcla
dos dominios de confianza distintos. Ahora que `PURCHASE_DOWNLOAD_SECRET` tiene
valor propio, ese fallback está muerto en la práctica y conviene eliminarlo.

## Aplicar en Vercel

Por cada variable, en Settings → Environment Variables del proyecto:

```bash
vercel env rm NOMBRE production
vercel env add NOMBRE production
```

Y luego un redeploy: las variables se leen en tiempo de build.

## Después de rotar

1. **Vuelve a comprobar**:
   ```bash
   npm run verify:rotation
   ```
   Debe salir limpio para tu entorno local.

2. **Revisa los registros de acceso** por si las credenciales filtradas llegaron
   a usarse. Cubre desde `2026-07-03` (primera aparición en el historial) hasta
   hoy:
   - MongoDB Atlas → Project → Access Manager → Database Access History
   - Stripe → Developers → Logs, filtrando por peticiones de API
   - Clerk → sesiones activas; cierra las que no reconozcas
   - Cloudflare → Audit Log

3. **Decide sobre el historial de git.** Si el repositorio es privado y no ha
   habido forks ni colaboradores externos, rotar es suficiente. Si es o fue
   público, reescribe el historial:
   ```bash
   git filter-repo --path .env.example --invert-paths
   ```
   Reescribir el historial obliga a que todos los clones se rehagan y rompe los
   PR abiertos. No lo hagas sin coordinar con quien tenga el repo clonado.

## Identificadores expuestos que no se rotan

Estos no dan acceso por sí solos, pero sí facilitan un ataque dirigido:

- `PROMPT_STUDIO_PREMIUM_JO` y `PROMPT_STUDIO_STARTUP_JO` — son los correos que
  el gate de administración compara para conceder acceso
  (`src/lib/admin-auth.ts`). Saberlos le dice a un atacante exactamente qué
  cuenta atacar. Considera activar 2FA obligatorio en esas cuentas de Clerk.
- `CLOUDFLARE_ACCOUNT_ID`, `RESEND_AUDIENCE_ID` — identificadores de recurso.

## Que no vuelva a pasar

```bash
npm run verify:env-example
```

Falla si `.env.example` contiene un valor idéntico a `.env`/`.env.local` o algo
con forma de secreto real (prefijos conocidos, alta entropía). Está enganchado a
`npm run test:ci`, así que salta en CI antes de llegar a un commit.

Para que salte también antes de cada commit local:

```bash
echo 'npm run verify:env-example' >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

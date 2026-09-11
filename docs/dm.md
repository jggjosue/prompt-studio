# DM — Modelo de datos

Entidades del sistema y su forma real. Escrito para que quien programe —persona
o agente— no tenga que inventarse campos ni deducir invariantes leyendo el
código.

Documento hermano: [prd.md](prd.md) describe qué hace el producto. Este describe
sobre qué datos lo hace.

Los datos viven en tres sitios distintos con responsabilidades separadas:

| Almacén | Qué guarda | Fuente de verdad de |
|---|---|---|
| **Clerk** | Identidad, sesiones, correos | Quién es el usuario |
| **MongoDB** | Estado de la aplicación | Compras, créditos, afiliación, actividad |
| **Ficheros en `public/`** | Catálogo | Qué recursos existen |

El `userId` de Clerk es la clave de unión: aparece en Mongo como `userId`,
`clerkUserId`, `purchaserUserId`, `buyerUserId` o `referrerUserId` según la
colección. **No hay claves foráneas ni `populate`**: las relaciones se resuelven
por ese identificador en el código.

---

## 1. Catálogo (ficheros)

El catálogo no está en base de datos. Vive como JSON en `src/data/`, se
versiona con el repositorio y se consume por `import` en build y en servidor.

Distinción importante: las **fuentes** (`src/data/`) llevan el prompt completo y
no son accesibles por HTTP. El **derivado** (`public/catalog/`) sí se sirve, y
por eso `build-paged-catalogs.mjs` vacía `description` y trunca a 240 caracteres
el prompt de los registros Premium.

### 1.1 Fuentes

| Fichero | Clave raíz | Registros |
|---|---|---|
| `src/data/prompts/placeholder-images.json` | `placeholderImages` | 299 |
| `src/data/prompts/placeholder-videos.json` | `placeholderVideos` | 197 |
| `src/data/web-pages.json` | `webPages` | 236 |
| `src/data/prompts/web-{tipo}-components.json` | `components` | 450 en 8 ficheros |

**Viven en `src/data/`, no en `public/`**, precisamente porque contienen el
prompt de pago: cualquier cosa bajo `public/` es descargable por URL. Se
consumen con `import` estático, nunca por HTTP.

### 1.2 Forma de un registro

```jsonc
{
  "id": "img-2",                    // estable; se usa en la URL de la ficha
  "title": "Submerged",
  "description": "",                // frecuentemente vacío
  "imageUrl": "https://…",          // absoluta, host externo
  "imageHint": "underwater half-face",
  "tags": ["Realistic", "Modern"],
  "membership": "Free",             // "Free" | "Premium"
  "type": "image"
}
```

Las landing pages añaden `demoUrl` (carpeta bajo `public/webpages/`), `stack`
(array de tecnologías) y `price` (cadena, no número).

Los campos localizables (`title`, `imageHint`) admiten dos formas: cadena
directa, o un objeto `{ en, es }`. El helper `pick()` de
`scripts/build-paged-catalogs.mjs` resuelve una u otra.

**Los ficheros de componentes no siguen esta forma.** Envuelven el array en un
objeto con metadatos de categoría, y localizan por sufijo en vez de por objeto
anidado:

```jsonc
{
  "title_es": "Botones", "title_en": "Buttons",
  "description_es": "…",  "description_en": "…",
  "components": [ /* 50 elementos; form-components tiene 100 */ ]
}
```

Cualquier lector genérico del catálogo debe localizar el array por búsqueda
(`Object.values(...).find(Array.isArray)`), no asumir una clave fija ni que la
raíz sea el array.

### 1.3 Trampas conocidas de estos datos

Están documentadas porque ya han roto builds:

- **`tags` contiene valores no-string.** 52 en `placeholder-images.json`. Filtra
  siempre antes de usar (`cleanTags()` en `src/lib/seo/programmatic-seo.ts`). Un
  `null` que llega a `slugify()` rompe `generateStaticParams` en tiempo de build,
  no en desarrollo.
- **`price` es cadena**, incluso cuando representa un número.
- **`description` NO está vacío en las fuentes**: contiene un objeto
  `{ es: { nombre, prompt }, en: { name, prompt } }` con el prompt de pago.
  Aparece vacío solo en el catálogo derivado, porque
  `scripts/build-paged-catalogs.mjs` fija `description: ''` a propósito para no
  publicar el producto en el JSON paginado.
- **`id` no es globalmente único** entre tipos: hay `img-2` y `wp-2`.

### 1.4 Catálogo derivado

`npm run catalog:build` genera `public/catalog/{tipo}/{locale}/` con páginas de
24 elementos y un `manifest.json`:

```jsonc
{
  "version": "df077b8792ba761b",
  "total": 200, "pageSize": 24, "pages": 9,
  "files": [{ "page": 1, "file": "page-001.1a7fa02cf1ca5bb9.json", "hash": "…", "count": 24 }]
}
```

El hash en el nombre del fichero permite cachear cada página de forma inmutable.
**Es artefacto generado**: no se edita a mano, se regenera desde las fuentes.

### 1.5 Procedencia

`src/lib/catalog-provenance.ts` añade una capa de metadatos sobre cada registro,
necesaria para licenciar el catálogo como dataset.

```ts
type AssetProvenance = {
  host: string;
  license: 'owned' | 'stock-review' | 'restricted' | 'unknown';
  licensable: boolean;   // true solo si puede ir en un dataset comercial
  reason: string;
};
```

Clasificación por host, con el estado actual (`npm run catalog:provenance`):

| Host | Registros | Estado |
|---|---|---|
| `raw.githubusercontent.com/jggjosue/…` | 308 | `owned` — cuenta propia |
| sin activo externo | 742 | licenciable, solo texto propio |
| `assets.mixkit.co` | 76 | `stock-review` |
| `i.imgur.com` | 44 | `unknown` |
| `images.unsplash.com` | 12 | `restricted` — prohíbe entrenar IA |

Total 1.182 registros, 1.050 licenciables (88,8 %).

**Regla que no se puede simplificar**: para GitHub no basta el dominio, se
compara la cuenta propietaria. `raw.githubusercontent.com/otra-persona/…` no es
propio. Todo host no reconocido cae del lado seguro: no licenciable.

Dos campos del esquema quedan deliberadamente en `null` porque el código no
puede deducirlos: `aiAssisted` (si el texto se generó con IA, relevante porque
la salida puramente generada no tiene copyright en EE. UU.) y `consent`.

---

## 2. Colecciones de MongoDB

20 modelos sobre **18 colecciones físicas**: tres esquemas comparten
`user_profiles` (ver la advertencia al final de esta sección). Base de datos
`prompt-studio` en MongoDB Atlas. Conexión con pool acotado
(`maxPoolSize: 10`) por ser serverless.

### 2.1 Identidad y perfil

**`UserProfile`** — datos que Clerk no guarda.
`userId` (único), `email`, `birthDate`, `paypalEmail`, `lastUpdatedAt`.

**`RegisteredUser`** / **`NewUser`** — solo `email` y `createdAt`. Alimentan la
sincronización con Resend. `NewUser` recoge altas desde el formulario público.

> **Los tres apuntan a la colección `user_profiles`.** No son colecciones
> separadas: `UserProfile`, `RegisteredUser` y `NewUser` pasan el mismo nombre
> como tercer argumento de `mongoose.model()`. Consecuencias reales:
>
> - `UserProfile` declara `userId` **único**. Los documentos de
>   `RegisteredUser` y `NewUser` no tienen `userId`, así que se indexan como
>   `null`: **solo puede existir uno**. El segundo insert choca con clave
>   duplicada.
> - `RegisteredUser` declara `email` **único**, y ese índice se aplica también a
>   los documentos de `UserProfile`.
> - `NewUser.find({})` en `/api/sync-resend` devuelve **todos** los documentos
>   de `user_profiles`, incluidos los perfiles, y manda sus correos a Resend.
>
> Que hoy no explote depende de si los índices llegaron a construirse contra los
> datos existentes; un build fallido se registra pero no lanza. Es un defecto
> latente, no un diseño.

**`UserActivity`** — `userId`, `email`, `lastActiveAt`, `firstSeenAt`,
`inactivityNotifiedAt`. Base de las campañas de reactivación.

**`UserInterest`** — `userId`, `email`, `interests[]`, `lastUpdatedAt`.

**`SavedItem`** — recursos que el usuario guarda desde el catálogo.
`userId`, `itemKind` (`image` | `video` | `web-page` | `component` |
`animation`), `itemId`, `title`, `imageUrl`, `href`, `createdAt`.

`title`, `imageUrl` y `href` se **desnormalizan**: el catálogo no está en base
de datos y tiene formas distintas por tipo, así que sin copiarlos habría que
recorrer cinco catálogos para pintar la lista del perfil. **El prompt no se
copia nunca**: es producto de pago y su acceso se comprueba al abrir la ficha.

Índice único `{ userId, itemKind, itemId }` — un doble clic no puede duplicar.
Incluye `itemKind` porque `itemId` no es único entre tipos (`img-2` y `wp-2`).

**`CookieConsent`** — `email`, `clerkUserId`, `privacyPolicyVersion`,
`termsOfServiceVersion`, `acceptedAt`. Guarda **qué versión** de cada política se
aceptó; sin eso el consentimiento no es demostrable bajo GDPR.

### 2.2 Créditos y generación con IA

**`AICreditAccount`** — un documento por usuario. `userId` (único), `balance`,
`reserved`, `lifetimeSpent`, todos con `min: 0`.

La separación entre `balance` y `reserved` es el mecanismo que impide cobrar por
generaciones fallidas: se reserva al encolar y se captura o devuelve al terminar.

**`AICreditLedger`** — `userId`, `jobId`, `operation`, `amount`, `createdAt`.
Registro append-only de cada movimiento; la cuenta es el agregado, el ledger la
historia.

**`AIGenerationFeedback`** — juicio humano sobre el resultado. `jobId`,
`userId`, `kind`, `provider`, `useful`, `reason`, `comment`, `createdAt`,
`updatedAt`. Único por `{ jobId, userId }`.

`kind` y `provider` se copian del trabajo: redundante, pero permite agregar la
tasa de aprobación por proveedor sin `$lookup`, que es la consulta principal.

**`AIGenerationJob`** — el núcleo de la cola.

| Campo | Tipo | Notas |
|---|---|---|
| `userId` | String | indexado |
| `kind` | enum | `image` \| `video` \| `project` |
| `provider` | String | validado contra `AI_JOB_PROVIDERS[kind]` |
| `input` / `result` | Mixed | payload libre |
| `status` | enum | `queued` \| `processing` \| `retrying` \| `completed` \| `failed` |
| `progress` | Number | 0–100 |
| `idempotencyKey` | String | requerido |
| `creditCost`, `estimatedCostUsd` | Number | del servidor, nunca del cliente |
| `creditsState` | enum | `reserved` \| `captured` \| `refunded` |
| `attempts` / `maxAttempts` | Number | por defecto 3, tope 5 |
| `nextAttemptAt` | Date | indexado; controla el backoff |
| `leaseExpiresAt` | Date | arrendamiento del procesador |
| `feedbackUseful` | Boolean \| null | copia del veredicto humano; `null` = sin valorar |

Dos índices que **son el diseño, no una optimización**:

```js
{ userId: 1, idempotencyKey: 1 }              // unique — garantiza idempotencia
{ status: 1, nextAttemptAt: 1, leaseExpiresAt: 1 }  // reclamo atómico del siguiente trabajo
```

El primero hace que un reenvío no pueda duplicar el trabajo ni el cobro. El
segundo permite que `findOneAndUpdate` reclame un trabajo y fije su
arrendamiento en una sola operación, sin condición de carrera entre
procesadores concurrentes.

### 2.3 Compras

**`ComponentPurchase`** — `purchaserUserId`, `purchaserEmail`, `productId`,
`productName`, `productKind`, `amountPaidCents`, `currency`,
`status` (`paid` | `refunded`), `stripeCheckoutSessionId` (**único**),
`stripePaymentIntentId`, `receiptUrl`, `downloadCount`, `maxDownloads` (5 por
defecto), `purchasedAt`.

`stripeCheckoutSessionId` único es lo que impide que un webhook reentregado
duplique la compra. `downloadCount` frente a `maxDownloads` se compara y se
incrementa de forma atómica en la misma operación.

### 2.4 Afiliados

Seis colecciones: una de hechos y cinco de agregados.

**`AffiliateApplication`** — solicitud con `status`, aprobación manual.

**`AffiliateClick`** — hecho base. Índice único
`{ referrerUserId, visitorKey, productId, source }`: es la deduplicación. Un
mismo visitante recargando la página no infla el contador.

**`AffiliateSale`** — la conversión. `commissionRate` y `commissionCents`
congelados en el momento de la venta, no recalculados después. `status`
(`pending` | `paid` | `pending_settlement`) y `payoutStatus` (`available` |
`paid_out` | `on_hold`) son ejes independientes: una venta cobrada al cliente
puede seguir retenida para el afiliado. `stripeCheckoutSessionId` y
`stripeInvoiceId` son únicos y `sparse` — cada venta llega por una vía u otra,
nunca por las dos.

**`AffiliateUserStats`**, **`AffiliateDailyStats`**, **`AffiliateReferralStats`**
— agregados por usuario, por día y por producto. Derivados: reconstruibles desde
clics y ventas.

**`AffiliatePayoutAccount`** — `clerkUserId`, `email`, `method`.

### 2.5 Observabilidad

**`ObservabilityEvent`** — `category` (enum de 8: `browser_error`,
`server_error`, `web_vital`, `resource_timing`, `stripe`, `ai_generation`,
`slow_query`, `commerce`), `name`, `route`, `sessionId`, `userId`, `productId`,
`value`, `unit`, `status`, `durationMs`, `costUsd`, `metadata`, `fingerprint`.

`createdAt` lleva **TTL de 90 días** (`expires`), así que Mongo purga solo. Tres
índices compuestos para las consultas del panel.

Nunca se guardan prompts, código, claves ni URLs completas.

---

## 3. Invariantes

Reglas que el código asume en todas partes. Romper una es un bug aunque compile.

1. **El precio lo pone el servidor.** Ningún importe llega desde el cliente.
2. **Los créditos se reservan antes de gastar** y se capturan o devuelven según
   el resultado. Un fallo del proveedor no consume saldo.
3. **Los identificadores de Stripe son únicos** donde existen. Es la defensa
   contra webhooks reentregados.
4. **El `userId` de Clerk es la clave de unión.** No hay integridad referencial
   en la base: la consistencia la mantiene el código.
5. **Los agregados son derivados.** Si divergen, la verdad está en
   `AffiliateClick` y `AffiliateSale`.
6. **El catálogo es de solo lectura en runtime.** Se modifica editando los JSON y
   regenerando; nunca escribiendo desde la aplicación.
7. **Los importes van en céntimos enteros.** Nunca flotantes.

## 4. Datos que no están modelados

Huecos reales, no omisiones del documento:

- **Suscripciones**: el estado del plan vive en Clerk Billing y en Stripe, no en
  Mongo. No hay colección de suscripción; se consulta contra el proveedor y se
  cachea en memoria (`src/lib/subscription-status-cache.ts`).
- **Biblioteca**: `/dashboard/library` sigue sin colección detrás. Los
  guardados sí la tienen ahora (`SavedItem`), y se listan en el perfil.
- **Procedencia persistida**: `catalog-provenance.ts` clasifica al vuelo. Los
  campos no están escritos en los ficheros del catálogo, así que hoy no se puede
  filtrar por `licensable` sin recalcular.

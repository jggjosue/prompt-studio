# CRM — Modelo y procesos

> **Evaluación y plan vigente:** [Estrategia de CRM para Prompt Studio](../crm/README.md).
> Este documento describe el modelo de facto encontrado en el repositorio; no
> significa que exista un producto CRM dedicado.

Cómo se representa y se trabaja la relación con el cliente.

> **Este documento no contiene ningún dato de cliente.** Describe el modelo y
> los procesos. Los datos viven en MongoDB y en Clerk. Exportarlos a un
> documento versionado infringiría la política de privacidad de la plataforma,
> que se acoge a GDPR y CCPA.

## 1. Dónde está la relación con el cliente

Repartida en tres sistemas, y esa división explica varias limitaciones
operativas:

| Sistema | Guarda |
|---|---|
| **Clerk** | Identidad, sesiones, correos, estado de suscripción (Clerk Billing) |
| **Stripe** | Pagos, facturas, suscripciones, reembolsos |
| **MongoDB** | Todo lo demás: perfil, compras, actividad, intereses, afiliación |

El `userId` de Clerk es la clave de unión. Aparece en Mongo como `userId`,
`clerkUserId`, `purchaserUserId`, `buyerUserId` o `referrerUserId` según la
colección. **No hay integridad referencial**: la consistencia la mantiene el
código, no la base.

## 2. Entidades

### Identidad y perfil

| Colección | Campos | Uso |
|---|---|---|
| `UserProfile` | `userId` (único), `email`, `birthDate`, `paypalEmail` | Lo que Clerk no guarda |
| `RegisteredUser` | `email`, `createdAt` | Sincronización con Resend |
| `NewUser` | `email`, `createdAt` | Altas desde el formulario público |
| `UserActivity` | `lastActiveAt`, `firstSeenAt`, `inactivityNotifiedAt` | Campañas de reactivación |
| `UserInterest` | `interests[]` | Segmentación |
| `SavedItem` | `itemKind`, `itemId`, `title`, `href` | Recursos guardados del catálogo |
| `CookieConsent` | `privacyPolicyVersion`, `termsOfServiceVersion`, `acceptedAt` | Prueba de consentimiento |

`CookieConsent` guarda **qué versión** de cada política se aceptó, no solo que
se aceptó. Sin ese dato el consentimiento no es demostrable bajo GDPR cuando la
política cambia.

### Transacciones

`ComponentPurchase` — una fila por compra unitaria: producto, importe en
céntimos, `status` (`paid` | `refunded`), identificadores de Stripe,
`downloadCount` frente a `maxDownloads`.

### Afiliación

`AffiliateApplication` (solicitud y su estado), `AffiliateClick` (hechos
deduplicados), `AffiliateSale` (conversiones con comisión congelada),
`AffiliatePayoutAccount` (método de pago), más tres colecciones de agregados.

## 3. Procesos que alimentan el CRM

### Alta

1. Registro en Clerk.
2. `UserSync` (cliente) llama a la acción de servidor al detectar sesión, con
   guarda en `sessionStorage` para no repetir en la misma sesión.
3. Se crea o actualiza `RegisteredUser` y `UserProfile`.
4. Se sincroniza el contacto con Resend.

### Sincronización con correo

Tres rutas, todas exigiendo `CRON_SECRET` o sesión de administrador:

- `/api/sync-clerk` — usuarios de Clerk → Mongo → Resend (hasta 500 por pasada).
- `/api/sync-resend` — `NewUser` → contactos de Resend.
- `/api/sync-registered-users-to-resend` — perfiles → audiencia de Resend.

Son manuales o por cron. **No hay sincronización continua**: si se crea un
usuario y no se lanza ninguna, Resend no se entera hasta la siguiente.

### Registro de actividad

`/api/activity/ping` actualiza `lastActiveAt`. Es la base para detectar
inactividad y disparar reactivación.

### Consentimiento

Al aceptar el banner se registra un `CookieConsent` con la versión vigente de
privacidad y términos.

## 4. Segmentos que se pueden construir hoy

Con lo que hay en Mongo, sin desarrollo adicional:

| Segmento | Cómo |
|---|---|
| Compradores por producto | `ComponentPurchase` por `productId`, `status: paid` |
| Clientes que pagaron y no descargaron | `downloadCount: 0` con antigüedad |
| Inactivos sin avisar | `UserActivity` por `lastActiveAt` con `inactivityNotifiedAt: null` |
| Afiliados productivos | `AffiliateSale` agrupado por `referrerUserId` |
| Interesados sin comprar | `UserInterest` sin `ComponentPurchase` asociada |
| Intención de compra | `SavedItem` sin `ComponentPurchase` del mismo `itemId`; el nivel Premium se cruza contra el catálogo, no está en la colección |
| Consentimiento desactualizado | `CookieConsent` con versión anterior a la vigente |

## 5. Limitaciones conocidas

Reales, no omisiones de este documento:

- **Las suscripciones no están modeladas en Mongo.** El estado vive en Clerk
  Billing y Stripe, y se cachea en memoria
  (`src/lib/subscription-status-cache.ts`). Consecuencia: no se puede hacer
  análisis de cohortes, ni recobro de impagos, ni responder «cuántos premium
  activos hay» sin llamar al proveedor.
- **`/dashboard/library` no tiene respaldo.** La página existe; no hay
  colección detrás. Los guardados sí (`SavedItem`), listados en el perfil.
- **No hay valoraciones ni reseñas.** `VerifiedProductReview` está definido en
  `src/lib/product-social-proof.ts` pero sus datos son fijos en código, no de
  clientes reales.
- **No hay historial de conversaciones ni tickets.** No existe soporte
  integrado; la atención va por correo, fuera del sistema.
- **Los agregados de afiliado pueden divergir.** Son derivados; la verdad está
  en `AffiliateClick` y `AffiliateSale`.
- **`UserProfile`, `RegisteredUser` y `NewUser` comparten la colección
  `user_profiles`.** Tres esquemas con índices únicos incompatibles sobre los
  mismos documentos. Ver el detalle en [../dm.md](../dm.md). Afecta al alta por
  formulario y a la sincronización con Resend.

## 6. Obligaciones de protección de datos

La plataforma se acoge expresamente a GDPR y CCPA/CPRA. Implicaciones
operativas:

- **Derecho de acceso y borrado**: hay que poder localizar todo lo de un usuario
  por su `userId` de Clerk, en las 18 colecciones de Mongo, en Clerk y en
  Stripe. No existe un procedimiento automatizado para esto.
- **La política de privacidad declara que los datos de usuario no se usan para
  entrenar modelos** salvo consentimiento específico. Cualquier acuerdo de
  licencia de datos con un tercero exige antes: cláusula nueva en Términos con
  licencia sublicenciable, consentimiento opt-in con registro auditable —no vale
  retroactivo sobre datos ya recogidos—, un DPA firmado y un opt-out efectivo.
- **Retención**: `ObservabilityEvent` se purga solo a los 90 días por TTL de
  Mongo. El resto de colecciones **no tiene política de retención definida**.

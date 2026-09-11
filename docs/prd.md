# PRD — Prompt Studio

Documento de requisitos del producto **tal como existe hoy**, no como está
planeado. Todo lo que aparece aquí está implementado y verificable en el
repositorio; lo que no lo está se marca explícitamente en
[Fuera de alcance](#fuera-de-alcance).

Operador: Magzin LLC. Dominio: `www.prompstudio.com`.

Documento hermano: [dm.md](dm.md) describe las entidades y su forma. Este
describe qué hace el producto y para quién.

---

## 1. Qué es

Un catálogo comercial de recursos para trabajar con IA generativa —prompts,
imágenes, vídeos, componentes web y landing pages completas— con herramientas de
generación asistida integradas. El usuario compra acceso por suscripción o por
unidad y descarga los recursos.

No es un generador de IA con catálogo adjunto: el catálogo curado es el producto
principal y la generación es una herramienta de apoyo.

## 2. A quién sirve

| Perfil | Qué busca | Qué usa |
|---|---|---|
| Freelance de diseño/desarrollo | Recursos listos para entregar a cliente | Landing pages, componentes, descarga de ZIP |
| Creador de contenido | Prompts que producen resultados repetibles | Catálogo de imagen y vídeo, copia de prompt |
| Pequeña empresa | Presencia web sin contratar equipo | Planes unitarios de web, demos en vivo |
| Afiliado | Ingreso por recomendación | Programa de afiliados, panel de comisiones |

## 3. Superficies del producto

### 3.1 Catálogo

Cinco tipos de recurso, cada uno con su índice, su ficha y su navegación por
etiquetas:

| Tipo | Ruta índice | Ficha | Volumen |
|---|---|---|---|
| Prompts de imagen | `/image-prompts` | `/gallery/[id]` | 299 |
| Prompts de vídeo | `/video-prompts` | `/gallery-videos/[id]` | 197 |
| Landing pages | `/landing-pages` | `/landing-pages/[slug]` | 236 |
| Componentes web | `/{tipo}-components` | — | 450 en 8 categorías |
| Animaciones web | `/web-animations` | — | — |

Las 8 categorías de componente son: login, header, text, form, button, card,
navigation, sidebar.

**Navegación transversal**: `/tags/[slug]` y `/category/[slug]` generan páginas
por etiqueta y categoría a partir del catálogo (SEO programático). Solo se
publican las que superan un mínimo de elementos, para no generar páginas
vacías.

**Búsqueda**: `/smart-search` con `/api/search/intent`, que puntúa por intención
extraída de la consulta (incluido presupuesto) además de por coincidencia de
palabras.

### 3.2 Acceso y monetización

Dos ejes independientes que conviven:

**Suscripción** (`PlanId`: `free` | `premium` | `startup`)

| Plan | Mensual | Anual |
|---|---|---|
| free | $0 | $0 |
| premium | $9 | $54 |
| startup | $1.000 | $10.000 |

**Compra unitaria** — planes de web con precio fijo, cada uno con su página de
checkout: mini ($5), entrepreneur ($10), professional ($15), business ($20),
premium ($35), elite ($50), corporate ($100), advanced ($200), master ($500).

Cada recurso del catálogo lleva un nivel `membership` (`Free` o `Premium`); hoy
la distribución es 223 libres y 312 premium. El acceso se resuelve en servidor:
el precio nunca viaja desde el cliente.

**Descargas**: los recursos comprados se entregan como ZIP mediante un token
firmado ligado a la compra y al usuario, con contador de descargas y tope.

### 3.3 Generación con IA

Cola asíncrona de trabajos con contabilidad de créditos. Tres tipos:

| Tipo | Créditos | Coste estimado | Proveedores |
|---|---|---|---|
| `image` | 1 | $0,04 | google, openai, fal, replicate |
| `video` | 3 | $0,35 | runway, veo, kling, luma, pika, hailuo, sora |
| `project` | 2 | $0,08 | google, openai, anthropic, deepseek |

Requisitos que el sistema garantiza:

- **Idempotencia**: cada envío exige una `Idempotency-Key` de al menos 8
  caracteres. Un reenvío devuelve el trabajo existente, no crea uno nuevo.
- **Créditos reservados antes de ejecutar** y capturados o devueltos según el
  resultado. Un fallo del proveedor no consume saldo.
- **Ejecución fuera de la petición**: la creación encola; un cron procesa. Las
  rutas de usuario nunca esperan al proveedor.
- **Reintentos con arrendamiento**: un trabajo tomado por un procesador queda
  bloqueado 5 minutos; si el procesador muere, otro lo recoge.
- **Límite por usuario**: 10 creaciones por minuto, contadas por `userId` y no
  por IP, porque el coste se imputa a la cuenta.

Interfaces: `/generate-images`, `/generate-videos`, `/generate-webs`.

### 3.4 Herramientas de componentes

`/component-builder`, `/page-composer`, `/component-compare`,
`/component-kits`, `/code-auditor`, `/my-components`. Permiten componer,
comparar, personalizar y exportar componentes; la exportación produce un
paquete descargable o un sandbox.

### 3.5 Programa de afiliados

`/affiliate-program` con solicitud y aprobación manual. Cada afiliado tiene
código de referido; se registran clics (deduplicados por `visitorKey`) y ventas
con su comisión. Panel en `/dashboard/affiliate-applications` y agregados
diarios y por producto. Pago vía PayPal, con solicitud manual por encima de un
umbral.

### 3.6 Cuenta y panel

`/dashboard/profile`, `/billing`, `/library`, `/generations`, `/campaigns`,
`/landing-editor`, `/observability`. Autenticación con Clerk. Todas estas rutas
son dinámicas por definición: nunca se prerenderizan.

## 4. Requisitos transversales

### 4.1 Internacionalización

Español e inglés. **El idioma no aparece en la URL**: el middleware lo resuelve y
reescribe internamente a `/{locale}{ruta}`, de modo que el visitante siempre ve
`/prices`, nunca `/es/prices`.

Precedencia de detección, de mayor a menor:

1. Cookie `locale` — una elección explícita del usuario no se contradice nunca.
2. Cabecera `accept-language`.
3. País detectado en el edge (Latinoamérica y España → español).
4. `en` por defecto.

Las URLs con prefijo son internas: si llega una desde fuera, se consolida con un
308 hacia la canónica sin prefijo, para no servir el mismo contenido en dos URLs.

### 4.2 Rendimiento

- 202 páginas prerenderizadas (99 en inglés, 99 en español, más metadatos).
- El HTML público se sirve desde caché de prerender, sin render por petición.
- Las rutas por usuario están marcadas dinámicas explícitamente.
- Imágenes en AVIF con WebP de respaldo; assets estáticos inmutables a un año.
- Los catálogos se sirven paginados y con hash en el nombre, no como un JSON
  monolítico importado desde el cliente.

### 4.3 Seguridad

- Cabeceras base en modo bloqueo: HSTS, `nosniff`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, COOP.
- CSP con allowlist por origen, en `Report-Only` hasta que `CSP_ENFORCE=true`.
  Política separada para las demos estáticas de `/webpages/*`, que cargan de
  CDNs públicos.
- Rate limiting en las rutas públicas de escritura y en la creación de trabajos
  de IA.
- Las rutas de mantenimiento (`/api/sync-*`, crons) exigen `CRON_SECRET` o
  sesión de administrador, con comparación en tiempo constante.
- Webhooks de Stripe y Clerk verificados por firma.

### 4.4 Cumplimiento

Políticas publicadas en ambos idiomas: privacidad, cookies, licencias, no
reembolsos, términos. Se acogen expresamente a GDPR y CCPA/CPRA. Consentimiento
de cookies registrado por usuario con versión de política aceptada.

**Restricción vigente**: la política de privacidad declara que los datos de
usuario no se usan para entrenar modelos propios salvo consentimiento
específico. Cualquier iniciativa de licenciar datos debe partir de ahí.

### 4.5 SEO

Es un requisito de producto, no una optimización: el catálogo se descubre por
búsqueda. Canonicals, sitemap, datos estructurados, enlazado interno y páginas
programáticas por etiqueta. El repositorio incluye 12 validadores ejecutables
(`npm run seo:validate-all`).

Consecuencia de diseño: **las URLs no se cambian sin una razón que supere el
coste en posiciones.** Es lo que descartó poner el idioma en la ruta.

### 4.6 Observabilidad

Eventos técnicos y comerciales en `observability_events` con retención de 90
días. No se guardan prompts, código, claves ni URLs completas.

## 5. Criterios de aceptación

Un cambio es aceptable si, además de cumplir su propósito:

1. `npm run test:ci` pasa — incluye el guardarraíl de secretos, typecheck, tests
   unitarios y de datos, y la auditoría de caché.
2. `next build` completa sin errores.
3. No aumenta el número de rutas dinámicas sin justificación.
4. No introduce valores reales en `.env.example` (`npm run verify:env-example`).
5. Las URLs públicas existentes siguen respondiendo, o llevan redirección 308.

## 6. Fuera de alcance

No implementado hoy, pese a aparecer en conversaciones o en configuración:

- **Licenciar el catálogo como dataset a plataformas de IA.** Existe la capa de
  procedencia (`src/lib/catalog-provenance.ts`) y su auditoría, pero no hay
  exportador, ni data card, ni los campos `aiAssisted` y `consent` declarados.
- **`hreflang`**: el sitio es bilingüe pero no declara alternantes de idioma.
- **Subresource Integrity** en las demos: cargan de CDNs públicos sin `integrity`.
- **Nonce en la CSP**: `script-src` mantiene `'unsafe-inline'` porque el nonce
  obligaría a render dinámico y anularía el prerender.

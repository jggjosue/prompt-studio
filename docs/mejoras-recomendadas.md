# Mejoras recomendadas

Lista priorizada para Prompt Studio como plataforma de venta de prompts. Cada
punto lleva la evidencia que lo sostiene: lo que está verificado contra el
código o los datos se marca como tal, y lo que es criterio se dice.

El orden es por impacto sobre el negocio, no por dificultad.

---

## 1. ~~Estás regalando el producto de pago~~ · CERRADO

**Verificado contra el servidor de producción.** Los ficheros fuente del
catálogo se sirven estáticos desde `public/` y contienen los prompts que
vendes:

```
GET /webpages/web-pages.json            200   1,7 MB
GET /prompts/placeholder-images.json    200
GET /prompts/placeholder-videos.json    200
GET /prompts/web-button-components.json 404   ← este sí está bloqueado
```

Qué hay dentro:

| Fichero | Registros Premium | Con el prompt incluido |
|---|---|---|
| `placeholder-images.json` | 100 | **100** |
| `placeholder-videos.json` | 100 | **100** (texto largo, sin clave `prompt`) |
| `web-pages.json` | 212 | **55** |

Ejemplo real: «Landing Page 3D de Airbnb», marcada Premium a **$15**, con su
prompt completo legible sin autenticación.

Lo llamativo es que **ya sabíais que esto era un problema**: el middleware
(`src/proxy.ts`) devuelve 404 para
`/prompts/web-(login|header|text|form|button|card|navigation|sidebar)-components.json`.
La protección existe pero cubre solo 8 ficheros de 11. Los tres que faltan son
justo los que contienen imágenes, vídeos y landing pages.

También conviene notar que el catálogo derivado
(`public/catalog/**`) **sí hace lo correcto**: `build-paged-catalogs.mjs` fija
`description: ''` deliberadamente para no publicar el prompt en el JSON
paginado. El agujero no está en el diseño, está en que las fuentes quedaron
accesibles.

### Estado: bloqueado

`src/proxy.ts` devuelve ahora 404 para cualquier `.json` en la raíz de
`/prompts/` y `/webpages/`, incluidas las variantes `.br` y `.gz` que genera
`precompress-static.mjs` —sin ellas el bloqueo se saltaba pidiendo
`placeholder-images.json.br`.

El alcance real resultó mayor de lo estimado. El test escrito para verificarlo
(`tests/unit/catalog-source-exposure.test.ts`) recorre `public/` y encontró
**cuatro copias de trabajo huérfanas** que nadie referencia en el código:

| Fichero | Tamaño | Registros de pago |
|---|---|---|
| `web-pages-updated.json` | 5,7 MB | 381 |
| `web-pages-fail.json` | 584 KB | 218 |
| `web-pages-next-js.json` | 23 KB | 10 |
| `web-pages-temporal-save.json` | 20 B | — |

Y los cinco JSON de `public/prompts/` que la lista original no cubría:
`amp.json`, `anthropic.json`, `claude-chrome.json`, `component-kits.json` y
`web-animations.json`, todos con producto dentro.

Por eso la regla cubre el directorio entero en vez de una lista de nombres: una
lista blanca no habría atrapado ninguno de estos nueve.

Verificado contra el servidor de producción: 13 rutas sensibles devuelven 404,
y las 12 legítimas (`/`, `/prices`, `/prompts/nano-banana-pro`,
`/webpages/{slug}/index.html`, `/api/catalog/images`…) siguen en 200. El
catálogo derivado sigue sirviendo `description: ""`.

### Arreglo estructural aplicado

Las fuentes ya no viven en `public/`. Se movieron a `src/data/` (15 catálogos de
prompts más `web-pages.json`), se borraron las cinco copias huérfanas y se
eliminaron las variantes `.br`/`.gz`, que son artefactos regenerables.

Se actualizaron 9 ficheros de `src/` y 17 scripts. Las dos lecturas de disco en
runtime (`path.join(process.cwd(), 'public/prompts/…')`) pasaron a imports
estáticos en `src/data/model-prompts.ts`: una ruta construida en runtime hacia
un fichero bajo `src/` no la incluye el trazado de dependencias de Next, así que
habría funcionado en local y fallado en producción.

El bloqueo del middleware se conserva como red de seguridad para ficheros
futuros, y el test comprueba ahora la garantía fuerte —que no haya producto de
pago en ningún JSON bajo `public/`, a cualquier profundidad— en vez de la débil.

**Queda pendiente, y es tuyo:** asumir que los prompts ya circulan. Llevan meses
accesibles y probablemente indexados por rastreadores de IA. Considera regenerar
los de mayor valor.

---

## 2. No hay señal de calidad de los prompts

**Criterio, no defecto.** Es la diferencia entre un catálogo y un mercado.

Un prompt no es un activo estable: se degrada cuando el modelo cambia. Hoy no
hay forma de saber si un prompt de `placeholder-images.json` sigue funcionando
con la versión actual de Gemini o si dejó de hacerlo hace cuatro meses.

Falta, en orden de valor por esfuerzo:

- **Fecha de verificación y modelo con el que se probó.** Un campo
  `verifiedOn: { model, date }` por registro. Es el dato que un comprador
  quiere y ningún competidor suele dar. `src/lib/models-data.ts` ya declara los
  modelos (`veo-3-1`, `nano-banana-pro`, `sora-2-pro`, `flux-2-pro`,
  `z-image`), así que la taxonomía existe.
- ~~**Señal de calidad de las generaciones**~~ — **implementado**: colección
  `AIGenerationFeedback`, pulgar arriba/abajo en `/dashboard/generations`, y
  agregación por proveedor y tipo. Falta acumular volumen.
- **Valoración post-compra.** No hay colección de reseñas
  (`src/models/` no tiene ninguna). `src/lib/product-social-proof.ts` define el
  tipo `VerifiedProductReview` pero los datos son fijos en código, no reales.
- **Señal de uso.** Ya registras `commerce` en `ObservabilityEvent`: copias,
  previews, descargas. Exponer «238 personas usaron este prompt» convierte
  telemetría que ya tienes en prueba social.

---

## 3. Rendimiento: lo que queda

Tras el refactor de i18n el sitio pasó de 121 rutas dinámicas a 60. Lo que
sigue pendiente, por impacto:

**Imágenes desde `raw.githubusercontent.com`** — 308 activos. Es lento, no
tiene SLA, y GitHub lo prohíbe como CDN a escala. Ya tienes R2 configurado
(`src/lib/r2-storage.ts`). Es la mayor ganancia de LCP disponible y además
elimina una dependencia que puede cortarte el catálogo sin aviso.

**123 componentes cliente frente a 8 `next/dynamic`.**
`reports/route-bundle-analysis.json` estima 843 KB de fuente cliente en
`/gallery/[id]` con 38 módulos. Una auditoría ruta por ruta convirtiendo a
componente servidor lo que no necesita interactividad tiene retorno directo en
TBT.

**Verificar el cacheo en el edge.** El middleware fija
`Vercel-CDN-Cache-Control: private, no-store` en el HTML localizado, porque la
URL pública no lleva idioma y una caché compartida podría servir inglés a un
visitante español. No pude confirmar su efecto en local. En un preview de
Vercel: pide `/` con `Accept-Language: es` y luego con `en`; si la segunda
devuelve español, hay que replantearlo. Si Vercel indexa por la ruta reescrita
—lo esperable— puedes quitar esa línea y ganar caché de HTML en el edge.

---

## 4. Seguridad: lo que queda

| Punto | Estado | Acción |
|---|---|---|
| Credenciales filtradas en el historial | **Sin rotar** | Las 8 de `rotacion-de-credenciales.md` |
| CSP | Report-Only | Revisar informes una semana y poner `CSP_ENFORCE=true` |
| `sanitize.ts` | Denylist por regex | Cambiar a `isomorphic-dompurify` (allowlist) |
| Rate limiting | En memoria por instancia | Definir `UPSTASH_REDIS_REST_*` y pasa a exacto |
| `ignoreBuildErrors` / `ignoreDuringBuilds` | Activos | Desactivar; `test:ci` ya cubre ambos |
| Admin por comparación de correo | `src/lib/admin-auth.ts` | Rol en `publicMetadata` de Clerk |
| SRI en las demos | Ausente | ~350 etiquetas de CDN sin `integrity`, scriptable |
| Cascada a `STRIPE_WEBHOOK_SECRET` | Muerta | Eliminar el fallback en `purchase-download-token.ts:6` |

El más urgente sigue siendo la rotación: las cabeceras y los guards no sirven de
nada si alguien tiene tu `CLERK_SECRET_KEY`.

---

## 5. SEO y crecimiento

**`hreflang` ausente.** El sitio es bilingüe y no declara alternantes. Es un
caso raro: como el idioma no va en la URL, no puedes usar `hreflang` de la
forma habitual. La salida es `x-default` más contenido negociado, o aceptar que
Google indexe una sola variante. Merece una decisión explícita, no un olvido.

**Política de rastreadores de IA.** `src/app/robots.ts` hace `allow: '/'` para
todos los agentes, incluidos GPTBot, ClaudeBot, Google-Extended y CCBot. Con el
agujero del punto 1, eso significa que los rastreadores de IA han podido
ingerir tus prompts de pago. Si además quieres licenciar el catálogo como
dataset, estás regalando lo que pretendes vender. Bloquéalos y publica tus
términos en `/llms.txt`, que hoy no existe.

**14 grupos de texto duplicado** en el catálogo (detectado por
`npm run catalog:provenance`). Afecta al SEO y también al valor del dataset,
donde se cuentan registros únicos.

---

## 6. Huecos de producto

Encontrados al documentar el modelo de datos:

- ~~`/dashboard/favorites` sin respaldo~~ — **resuelto**: colección `SavedItem`,
  icono de marcador en las tarjetas del catálogo y apartado en el perfil.
  `/dashboard/library` sigue sin colección detrás.
- **Las suscripciones no están modeladas.** El estado vive en Clerk Billing y
  Stripe, y se cachea en memoria. Sin una tabla propia no puedes hacer cohortes,
  ni recobro de impagos, ni responder «cuántos premium activos hay» sin llamar
  al proveedor.
- **`/dashboard/settings` tiene un bug real**: pasa un manejador de eventos a
  un componente cliente. Salió al prerenderizar; ahora está `force-dynamic` y no
  rompe el build, pero no verifiqué si también falla al renderizar bajo demanda.

---

## 7. La oportunidad: licenciar el catálogo

**1.050 de 1.182 registros (88,8 %) son licenciables hoy**
(`npm run catalog:provenance`). Los 742 sin activo externo —componentes y
landing pages, texto y código propios— son el activo más vendible: pares
prompt → resultado con etiquetas curadas, bilingües. Eso es escaso.

Bloqueos concretos: 76 de Mixkit (gestión, no problema técnico), 44 de imgur
(procedencia sin documentar), 12 de Unsplash (prohíbe entrenar IA; sustituir).

Falta antes de poder vender:

1. Declarar `aiAssisted` y `consent` por registro. El código no puede
   deducirlos.
2. Exportador a JSONL filtrando por `licensable`, con deduplicación por hash.
3. Data card de dos páginas: origen, licencia, tamaño, esquema, limitaciones.
4. Revisar los términos: la política de privacidad declara hoy que no se usan
   datos de usuario para entrenar modelos.

Y resolver el punto 1 primero. Un dataset que lleva meses descargable
gratis vale bastante menos.

---

## Orden sugerido

1. ~~Cerrar el acceso a los JSON fuente~~ — **hecho**, incluido sacarlas de
   `public/` y borrar las copias huérfanas.
2. **Rotar las credenciales** (punto 4) — tuyo, media tarde.
3. **Bloquear rastreadores de IA** (punto 5) — minutos, y protege 1 y 7.
4. **Migrar imágenes a R2** (punto 3) — el mayor salto de rendimiento.
5. **Fecha de verificación y modelo en los prompts** (punto 2) — lo que
   diferencia el catálogo de la competencia.
6. **Exportador de dataset** (punto 7) — cuando 1 y 3 estén cerrados.

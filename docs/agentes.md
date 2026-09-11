# Agentes de trabajo

Cuántos agentes pueden trabajar en Prompt Studio a la vez, qué zona del código
posee cada uno y cómo se reparten para no pisarse.

## La respuesta corta

**No hay un número fijo de agentes que la plataforma permita.** El límite real
no es una cuota del producto, es la **colisión de ficheros**: dos agentes que
editan el mismo módulo se sobrescriben. La pregunta útil no es «cuántos caben»
sino «cuántas zonas independientes tiene este repositorio», y aquí son **diez**.

Los datos concretos que sí existen:

| Dato | Valor |
| --- | ---: |
| Zonas de trabajo sin solape | 10 |
| Agentes en paralelo recomendados sobre el mismo repo | 3 a 4 |
| Tope por orquestación (`Workflow`, perfil «medium») | menos de 15 |
| Agentes con aislamiento en *worktree* propio | sin tope práctico |

Las cifras de la segunda y tercera fila tienen orígenes distintos y conviene no
confundirlos. El tope de 15 es una guía de configuración del entorno de trabajo,
ajustable desde `/config` → «Dynamic workflow size». El 3 a 4 es una
recomendación derivada de este repositorio: por encima de eso, el tiempo que se
gasta resolviendo conflictos supera lo que se gana en paralelo, salvo que cada
agente trabaje en un *worktree* aislado.

## Tamaño del terreno

Lo que hay que repartir, medido el 2026-09-08:

| Zona | Cantidad |
| --- | ---: |
| Rutas de API | 90 |
| Páginas | 83 |
| Modelos de datos | 32 |
| Módulos de lógica (`src/lib`) | 122 |
| Componentes | 142 |
| Pruebas unitarias | 31 ficheros, 135 casos |
| Pruebas de extremo a extremo | 3 |
| Scripts de mantenimiento | 79 |
| Órdenes de `npm` | 38, de ellas 11 validadores de SEO |

## Las diez zonas

Cada zona es un puesto de trabajo: tiene ficheros propios, órdenes con las que
se verifica a sí misma y un criterio de «terminado». Un agente por zona puede
trabajar sin coordinarse con los demás.

### 1. Catálogo y datos

Mantiene el inventario del catálogo: integridad, procedencia y licencias.
Medido el 2026-09-08: 450 componentes, 275 imágenes, 200 páginas web y 197
vídeos, más 245 páginas en `src/data/web-pages.json`.

- **Posee**: `src/data/`, `public/catalog/`, `scripts/build-paged-catalogs.mjs`, `scripts/audit-catalog-provenance.mjs`, `scripts/validate-catalog-coverage.mjs`
- **Verifica con**: `npm run test:data`, `npm run catalog:provenance`
- **Terminado**: JSON válidos, identificadores únicos y medios locales existentes
- **Pendiente conocido**: nada bloqueante

### 2. SEO técnico

Once validadores automáticos y el grafo de enlaces internos.

- **Posee**: `scripts/validate-*-seo.mjs`, `scripts/audit-webpages-seo.mjs`, `src/lib/internal-link-graph.ts`, `sitemap.xml`, `robots.txt`, metadatos de página
- **Verifica con**: `npm run seo:validate-all`
- **Terminado**: los once validadores en verde (`seo:validate-all` los agrupa)
- **Pendiente conocido**: falta `hreflang`; `alternates` en `src/app/[locale]/layout.tsx` solo declara `canonical`, sin `languages`. Falta `aggregateRating` en el JSON-LD de producto, que exige ISR o un paso de build que lea la base de datos

### 3. Comercio y cobros

Stripe, checkout, compras, créditos, suscripciones y afiliados.

- **Posee**: `src/lib/stripe*`, `src/lib/credit-*`, `src/app/api/webhooks/stripe/`, `src/app/api/*checkout*`, `src/models/*Purchase*`, `src/models/Affiliate*`
- **Verifica con**: `npm run test:unit`
- **Terminado**: todo abono es idempotente frente a reintentos de Stripe y ningún importe procede del cliente
- **Pendiente conocido**: recuperación de carrito abandonado (los eventos `checkout.session.expired` se registran y no se usan); asientos de equipo; claves de API para clientes

### 4. Generación con IA

La cola de trabajos, los proveedores, la contabilidad de créditos y los lotes.

- **Posee**: `src/lib/ai-job-*`, `src/lib/campaign-orchestrator.ts`, `src/lib/batch-generation.ts`, `src/lib/prompt-*`, `src/app/api/ai/`
- **Verifica con**: `npm run test:unit`
- **Terminado**: ninguna reserva de crédito queda huérfana; los reintentos no cobran dos veces
- **Documentación**: `docs/ai-generation-queue.md`

### 5. Interfaz y accesibilidad

142 componentes y 83 páginas.

- **Posee**: `src/components/`, `src/app/[locale]/**/*.tsx`
- **Verifica con**: `npm run test:e2e`
- **Terminado**: navegable con teclado, sin salto de contenido, imágenes con texto alternativo
- **Cuidado**: es la zona que más colisiona con las demás, porque casi toda feature toca un componente

### 6. Rendimiento

Presupuestos de red y Core Web Vitals.

- **Posee**: `scripts/optimize-public-media.mjs`, `scripts/precompress-static.mjs`, `scripts/minify-public-assets.mjs`, `next.config.*`
- **Verifica con**: `npm run test:e2e:performance`
- **Terminado**: LCP < 2 500 ms, INP < 200 ms, CLS < 0,1, JavaScript inicial < 200 KB
- **Documentación**: `docs/testing.md`

### 7. Seguridad

Cabeceras, límites de peticiones, contratos de autorización y rotación de secretos.

- **Posee**: `src/middleware.ts`, `src/lib/rate-limit*`, `src/lib/cache-policy.ts`, `tests/unit/api-security-contracts.test.ts`, `tests/unit/security-*`
- **Verifica con**: `npm run test:unit`, `npm run verify:env-example`, `npm run verify:rotation`
- **Terminado**: ninguna ruta autenticada sin límite de peticiones; ninguna respuesta personalizada con caché pública
- **Pendiente conocido**: los hosts de imagen de la CSP hay que declararlos antes de activarla
- **Documentación**: `docs/rotacion-de-credenciales.md`

### 8. Observabilidad

Eventos, errores operativos y saneado de datos personales.

- **Posee**: `src/lib/observability-*`, `src/models/ObservabilityEvent.ts`, `src/app/api/observability/`, `src/app/[locale]/dashboard/observability/`
- **Verifica con**: `npm run test:unit`
- **Terminado**: ningún evento guarda datos personales sin sanear
- **Documentación**: `docs/observability.md`

### 9. Calidad y pruebas

Cobertura de lo que ya existe, no features nuevas.

- **Posee**: `tests/`
- **Verifica con**: `npm test`, `npm run typecheck`
- **Terminado**: cada corrección de fallo deja una prueba que impide la reincidencia
- **Convención de la casa**: la prueba explica en un comentario **qué se rompería** si la comprobación desapareciera, no qué comprueba

### 10. Contenido editorial y traducción

Textos de producto, prompts publicados y los dos idiomas.

- **Posee**: `messages/es.json`, `messages/en.json`, textos de landing, guías de publicación
- **Verifica con**: `npm run test:data`
- **Terminado**: ninguna clave de traducción huérfana en ninguno de los dos idiomas
- **Pendiente conocido**: aviso post-compra por correo para pedir reseña (Resend ya está integrado)

## Reglas para que no se pisen

Sin estas reglas, cuatro agentes en paralelo producen menos que uno solo.

1. **Un agente, una zona.** El dueño de la zona es el único que edita sus ficheros.
2. **Las fronteras compartidas se negocian antes.** `src/lib/mongoose.ts`,
   `src/middleware.ts`, `messages/*.json`, `package.json` y `next.config.*` los
   toca cualquiera y los rompe cualquiera. Quien necesite cambiarlos lo dice
   antes de empezar, no después.
3. **Los modelos de datos son de un solo dueño por fichero.** Añadir un campo es
   seguro; cambiar un índice único **no lo es** y exige migración: MongoDB
   rechaza dos índices con la misma clave y opciones distintas.
4. **Nadie da por terminado sin `npm run typecheck` y `npm test`.** Son rápidos y
   detectan la colisión antes de que llegue al repositorio.
5. **Más de cuatro agentes, cada uno en su propio *worktree*.** Trabajar sobre
   copias aisladas del repositorio elimina la colisión a cambio de integrar al
   final.
6. **La interfaz se reparte por página, no por componente.** Es la zona con más
   solape: dos agentes en la misma página se pisan aunque toquen componentes
   distintos.

## Reparto sugerido para tres agentes

Si solo se van a lanzar tres, este es el reparto con menos solape y más valor:

| Agente | Zonas | Primera tarea |
| --- | --- | --- |
| A | Comercio (3) + Seguridad (7) | Carrito abandonado con los eventos de Stripe ya registrados |
| B | SEO (2) + Contenido (10) | `hreflang` entre los dos idiomas |
| C | Interfaz (5) + Rendimiento (6) | Presupuestos de red sobre las páginas de catálogo |

Calidad (9) no se asigna: es responsabilidad de cada agente sobre su propia zona.

## Antes de lanzar cualquier agente

El proyecto exige **Node 22.11 o posterior** y no admite mezclar instalaciones
`arm64` y `x64` en el mismo `node_modules`. En un Mac con Apple Silicon, un Node
`x86_64` compila `node_modules` con el binario equivocado y el build falla al
cargar SWC. Comprobación:

```bash
node -p "process.version + ' ' + process.arch"
```

Debe decir `arm64` en Apple Silicon. Si dice `x64`, reinstala Node antes de
repartir trabajo, o todos los agentes heredarán un build roto.

## Qué no cubre este documento

Los agentes de IA **del producto** —la cola de generación, el optimizador de
prompts, el asistente de campañas— no son puestos de trabajo sobre el código:
son funcionalidades que se venden. Están descritos en `docs/ai-generation-queue.md`
y en `docs/prd.md`.

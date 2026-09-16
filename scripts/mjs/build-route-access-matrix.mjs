#!/usr/bin/env node
/**
 * Genera la matriz de acceso de las rutas de API.
 *
 * El proyecto autoriza con **siete mecanismos distintos** —sesión de Clerk,
 * firma de webhook, secreto de cron, administrador, plan de suscripción,
 * administrador del marketplace y límite por IP—. Repartidos por 105 ficheros,
 * la única forma de saber si una ruta está protegida era abrirla y leerla.
 *
 * Este script recorre las rutas, detecta qué mecanismo usa cada una y escribe
 * `docs/API_ACCESS.md`. La prueba `tests/unit/route-access-matrix.test.ts`
 * comprueba que ninguna ruta se quede sin mecanismo reconocido, de modo que una
 * ruta nueva sin protección rompe el pipeline en lugar de pasar desapercibida.
 *
 *   node scripts/mjs/build-route-access-matrix.mjs          # escribe el documento
 *   node scripts/mjs/build-route-access-matrix.mjs --json   # emite los datos
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = process.cwd();
const BASE = join(RAIZ, 'src', 'app', 'api');

/**
 * Cada mecanismo se reconoce por las llamadas que lo implementan. Añadir un
 * helper de autorización nuevo exige añadirlo aquí: es deliberado, porque así
 * la matriz no se queda obsoleta en silencio.
 */
export const MECANISMOS = [
  { id: 'webhook', etiqueta: 'Webhook signature', patron: /constructEvent|new Webhook\(|svix/ },
  { id: 'cron', etiqueta: 'Cron or admin secret', patron: /requireCronOrAdmin|hasValidCronSecret/ },
  { id: 'admin', etiqueta: 'Administrator', patron: /isPremiumJoAdmin|isCacheAdminAuthorized|marketplaceAdmin/ },
  { id: 'plan', etiqueta: 'Subscription plan', patron: /hasComponentBuilderPlan|hasDownloadPlan|hasPublishingPlan|hasMembershipAccess|planAtLeast|getServerSubscriptionStatus/ },
  { id: 'sesion', etiqueta: 'User session', patron: /\bauth\(\)/ },
  { id: 'worker-token', etiqueta: 'AI worker token', patron: /AI_GENERATION_WORKER_TOKEN/ },
  { id: 'rate-limit', etiqueta: 'IP rate limit', patron: /enforceIpRateLimit|rateLimit\(/ },
  { id: 'deshabilitada', etiqueta: 'Disabled (501)', patron: /status:\s*501/ },
];

/**
 * Public routes by design, with rationale. Being in this list is an explicit
 * architectural decision; anything not here without an auth mechanism fails tests.
 */
export const PUBLICAS_JUSTIFICADAS = {
  'catalog/[kind]': 'Public paginated catalog; does not expose paid prompts',
  'catalog/web-pages/[id]': 'Public detail view of a catalog demo',
  'landing-pages/catalog': 'Public list of landing pages',
  'landing-pages/[pageId]/content': 'Public content of a published landing page',
  'landing-pages/readability-index': 'Readability index, aggregated public data',
  'community-reviews': 'Reviews visible without account; submitting requires session',
  'marketplace': 'Public storefront of the marketplace',
  'provider-quality': 'Aggregated provider quality metrics',
  'demo/reproducible/report': 'Reproducible demo report for external audit',
  'refactory-online/[slug]': 'Static demo loader for interactive showcase previews',
  'webpages/assets/[...path]': 'Static assets for demos',
  'web-pages/validate-demo-url': 'URL format validation, side-effect free',
  'web-page-checkout': 'Guest checkout initiation; Stripe validates payment session',
  'stripe/demo-buy-button': 'Public configuration for purchase button',
  'r2/buckets': 'List of configured buckets, no credentials exposed',
  'affiliate/applications': 'Affiliate application submission from public form',
};

function listarRutas(dir, acumulado = []) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) listarRutas(ruta, acumulado);
    else if (entrada.name === 'route.ts') acumulado.push(ruta);
  }
  return acumulado;
}

export function analizarRutas() {
  return listarRutas(BASE)
    .map(fichero => {
      const fuente = readFileSync(fichero, 'utf8');
      const ruta = relative(BASE, fichero).replace(/\/route\.ts$/, '');
      const verbos = [...fuente.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)/g)].map(m => m[1]);
      const mecanismos = MECANISMOS.filter(m => m.patron.test(fuente)).map(m => m.id);
      return {
        ruta: `/api/${ruta}`,
        clave: ruta,
        verbos: verbos.length ? verbos : ['—'],
        mecanismos,
        justificada: Object.hasOwn(PUBLICAS_JUSTIFICADAS, ruta),
      };
    })
    .sort((a, b) => a.ruta.localeCompare(b.ruta));
}

const rutas = analizarRutas();
const sinProteger = rutas.filter(r => r.mecanismos.length === 0 && !r.justificada);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ rutas, sinProteger }, null, 2));
} else {
  const etiquetas = Object.fromEntries(MECANISMOS.map(m => [m.id, m.etiqueta]));
  const filas = rutas
    .map(r => {
      const protec = r.mecanismos.length
        ? r.mecanismos.map(m => etiquetas[m]).join(' + ')
        : `Public — ${PUBLICAS_JUSTIFICADAS[r.clave] ?? 'unjustified'}`;
      return `| [\`${r.ruta}\`](../src/app/api/${r.clave}/route.ts) | ${r.verbos.join(', ')} | ${protec} |`;
    })
    .join('\n');

  const resumen = MECANISMOS.map(m => {
    const n = rutas.filter(r => r.mecanismos.includes(m.id)).length;
    return `| ${m.etiqueta} | ${n} |`;
  }).join('\n');

  writeFileSync(
    join(RAIZ, 'docs', 'API_ACCESS.md'),
    `# API Access Matrix

> **Generated Document (Documento generado).** Produced automatically by \`node scripts/mjs/build-route-access-matrix.mjs\`
> by inspecting route source files. Do not edit manually: to update a row,
> update the corresponding route handler.

The system authorizes requests using eight distinct mechanisms. This matrix details
the exact authorization strategy for all ${rutas.length} API routes, which previously required
manual file-by-file inspection.

The test suite \`tests/unit/route-access-matrix.test.ts\` verifies that no route lacks
a recognized security mechanism or explicit documented justification. Adding an unprotected
endpoint breaks the build pipeline instead of slipping into production.

## Summary

| Mechanism | Routes |
|---|---|
${resumen}
| **Total Routes** | **${rutas.length}** |

## Public Routes by Design

These endpoints are publicly accessible by design, each with an explicit rationale.
None of them expose paid prompt data or private account records.

${Object.entries(PUBLICAS_JUSTIFICADAS).map(([r, motivo]) => `- [\`/api/${r}\`](../src/app/api/${r}/route.ts) — ${motivo}`).join('\n')}

## Complete Access Matrix

| Route | Methods | Protection |
|---|---|---|
${filas}
`
  );
  console.log(`docs/API_ACCESS.md generated: ${rutas.length} routes`);
  if (sinProteger.length) {
    console.error(`\n${sinProteger.length} route(s) without recognized mechanism or justification:`);
    for (const r of sinProteger) console.error(`  - ${r.ruta}`);
    process.exitCode = 1;
  }
}

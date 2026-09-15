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
  { id: 'webhook', etiqueta: 'Firma de webhook', patron: /constructEvent|new Webhook\(|svix/ },
  { id: 'cron', etiqueta: 'Secreto de cron o admin', patron: /requireCronOrAdmin|hasValidCronSecret/ },
  { id: 'admin', etiqueta: 'Administrador', patron: /isPremiumJoAdmin|isCacheAdminAuthorized|marketplaceAdmin/ },
  { id: 'plan', etiqueta: 'Plan de suscripción', patron: /hasComponentBuilderPlan|hasDownloadPlan|hasPublishingPlan|hasMembershipAccess|planAtLeast|getServerSubscriptionStatus/ },
  { id: 'sesion', etiqueta: 'Sesión de usuario', patron: /\bauth\(\)/ },
  { id: 'worker-token', etiqueta: 'Token del worker de IA', patron: /AI_GENERATION_WORKER_TOKEN/ },
  { id: 'rate-limit', etiqueta: 'Límite por IP', patron: /enforceIpRateLimit|rateLimit\(/ },
  { id: 'deshabilitada', etiqueta: 'Deshabilitada (501)', patron: /status:\s*501/ },
];

/**
 * Rutas públicas por diseño, con el motivo. Estar en esta lista es una decisión
 * explícita: lo que no esté aquí ni tenga mecanismo, falla la prueba.
 */
export const PUBLICAS_JUSTIFICADAS = {
  'catalog/[kind]': 'Catálogo público paginado; no expone prompts de pago',
  'catalog/web-pages/[id]': 'Ficha pública de una demo del catálogo',
  'landing-pages/catalog': 'Listado público de landings',
  'landing-pages/[pageId]/content': 'Contenido público de una landing publicada',
  'landing-pages/readability-index': 'Índice de legibilidad, dato agregado y público',
  'community-reviews': 'Reseñas visibles sin cuenta; la escritura sí exige sesión',
  'marketplace': 'Escaparate público del marketplace',
  'provider-quality': 'Métricas agregadas de calidad de proveedores',
  'demo/reproducible/report': 'Informe de la demo reproducible, pensado para auditoría externa',
  'refactory-online/[slug]': 'Cargador de demos estáticas',
  'webpages/assets/[...path]': 'Activos estáticos de las demos',
  'web-pages/validate-demo-url': 'Validación de formato de URL, sin efectos',
  'web-page-checkout': 'Inicio de checkout de invitado; Stripe valida la sesión de pago',
  'stripe/demo-buy-button': 'Configuración pública del botón de compra',
  'r2/buckets': 'Listado de buckets configurados, sin credenciales',
  'affiliate/applications': 'Alta de solicitud de afiliado desde el formulario público',
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
        : `Pública — ${PUBLICAS_JUSTIFICADAS[r.clave] ?? 'sin justificar'}`;
      return `| \`${r.ruta}\` | ${r.verbos.join(', ')} | ${protec} |`;
    })
    .join('\n');

  const resumen = MECANISMOS.map(m => {
    const n = rutas.filter(r => r.mecanismos.includes(m.id)).length;
    return `| ${m.etiqueta} | ${n} |`;
  }).join('\n');

  writeFileSync(
    join(RAIZ, 'docs', 'API_ACCESS.md'),
    `# Matriz de acceso de la API

> **Documento generado.** Lo produce \`node scripts/mjs/build-route-access-matrix.mjs\`
> a partir del código de cada ruta. No se edita a mano: para cambiar una fila,
> cambia la ruta.

El proyecto autoriza con siete mecanismos distintos. Esta tabla dice cuál usa
cada una de las ${rutas.length} rutas, que antes solo se podía averiguar leyendo
los ficheros uno a uno.

La prueba \`tests/unit/route-access-matrix.test.ts\` falla si aparece una ruta sin
mecanismo reconocido y sin justificación explícita, así que una ruta nueva
desprotegida rompe el pipeline.

## Resumen

| Mecanismo | Rutas |
|---|---|
${resumen}
| **Total de rutas** | **${rutas.length}** |

## Rutas públicas por diseño

Son públicas a propósito, cada una con su motivo. Ninguna expone producto de
pago ni datos de otra cuenta.

${Object.entries(PUBLICAS_JUSTIFICADAS).map(([r, motivo]) => `- \`/api/${r}\` — ${motivo}`).join('\n')}

## Matriz completa

| Ruta | Verbos | Protección |
|---|---|---|
${filas}
`
  );
  console.log(`docs/API_ACCESS.md generado: ${rutas.length} rutas`);
  if (sinProteger.length) {
    console.error(`\n${sinProteger.length} ruta(s) sin mecanismo reconocido ni justificación:`);
    for (const r of sinProteger) console.error(`  - ${r.ruta}`);
    process.exitCode = 1;
  }
}

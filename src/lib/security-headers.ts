/**
 * Cabeceras de seguridad HTTP.
 *
 * Se consume desde `next.config.ts` (función `headers()`), así que este módulo
 * no puede importar nada de `next/server` ni de React: se evalúa en tiempo de
 * configuración, antes de que exista un request.
 *
 * ## Dos políticas de CSP
 *
 * 1. **App** — rutas servidas por Next. Allowlist ajustada a los terceros que
 *    realmente se usan: Clerk, Stripe, Google Analytics/AdSense, Vercel.
 * 2. **Demos** (`/webpages/*`) — HTML estático de los ~200 proyectos de
 *    ejemplo. Cargan de cdnjs, jsdelivr, unpkg y Google Fonts, con estilos y
 *    scripts inline por todas partes. Aplicarles la política de la app las
 *    rompería, así que llevan una permisiva que conserva lo que sí importa:
 *    `frame-ancestors`, `object-src 'none'` y `base-uri`.
 *
 * ## Report-Only
 *
 * La CSP sale en modo `Report-Only`: el navegador informa de las violaciones a
 * `/api/csp-report` pero no bloquea nada. Es deliberado — una CSP mal calibrada
 * rompe pagos y login en silencio. Cuando el endpoint deje de recibir informes
 * legítimos durante una semana, pon `CSP_ENFORCE=true` para pasar a bloquear.
 *
 * ## Limitación conocida de esta fase
 *
 * `script-src` incluye `'unsafe-inline'`. El App Router de Next inyecta scripts
 * inline de hidratación con contenido variable, así que sin nonce no hay forma
 * de evitarlo, y el nonce obliga a render dinámico en cada página — lo que
 * anularía el cacheo en edge. La allowlist de hosts sigue aportando: bloquea la
 * inyección de `<script src="https://atacante/">`, que es el vector habitual.
 * El salto a nonce queda como fase 2, a decidir junto con la estrategia de
 * cacheo.
 */

const isProd = process.env.NODE_ENV === 'production';

/** Pasar a `true` cuando los informes de `/api/csp-report` estén limpios. */
export function isCspEnforced(): boolean {
  return process.env.CSP_ENFORCE?.trim().toLowerCase() === 'true';
}

const CLERK = [
  'https://*.clerk.accounts.dev',
  'https://clerk.prompstudio.com',
  'https://*.clerk.com',
];
const CLERK_IMG = ['https://img.clerk.com'];
/** Clerk delega la protección anti-bot en Cloudflare Turnstile. */
const TURNSTILE = ['https://challenges.cloudflare.com'];
const STRIPE = ['https://js.stripe.com', 'https://*.stripe.com'];
const GOOGLE_ANALYTICS = [
  'https://www.googletagmanager.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
];
const GOOGLE_ADS = [
  'https://pagead2.googlesyndication.com',
  'https://*.googlesyndication.com',
  'https://*.doubleclick.net',
  'https://*.adtrafficquality.google',
  'https://fundingchoicesmessages.google.com',
];
const FIREBASE = [
  'https://*.googleapis.com',
  'https://*.firebaseio.com',
  'https://*.firebaseapp.com',
];
const VERCEL = ['https://va.vercel-scripts.com', 'https://vitals.vercel-insights.com'];
/** Hosts remotos declarados en `images.remotePatterns` de `next.config.ts`. */
const REMOTE_IMAGES = [
  'https://placehold.co',
  'https://images.unsplash.com',
  'https://picsum.photos',
  'https://i.imgur.com',
  'https://raw.githubusercontent.com',
  'https://meta.ai',
  'https://*.fbcdn.net',
];
const MEDIA = ['https://assets.mixkit.co', 'https://*.r2.dev', 'https://*.r2.cloudflarestorage.com'];

function directives(map: Record<string, string[] | null>): string {
  return Object.entries(map)
    .filter(([, value]) => value !== null)
    .map(([name, value]) => (value!.length ? `${name} ${value!.join(' ')}` : name))
    .join('; ');
}

/** CSP para las rutas de la aplicación. */
export function appContentSecurityPolicy(): string {
  return directives({
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      // Ver "Limitación conocida" arriba.
      "'unsafe-inline'",
      // React Refresh y el runtime de desarrollo de Next necesitan eval.
      ...(isProd ? [] : ["'unsafe-eval'"]),
      ...CLERK,
      ...TURNSTILE,
      ...STRIPE,
      ...GOOGLE_ANALYTICS,
      ...GOOGLE_ADS,
      ...VERCEL,
    ],
    // Tailwind y next/font inyectan estilos inline; no hay alternativa sin nonce.
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      ...CLERK_IMG,
      ...REMOTE_IMAGES,
      ...GOOGLE_ANALYTICS,
      ...GOOGLE_ADS,
      ...STRIPE,
    ],
    'font-src': ["'self'", 'data:'],
    'media-src': ["'self'", 'data:', 'blob:', ...MEDIA],
    'connect-src': [
      "'self'",
      ...CLERK,
      ...STRIPE,
      ...GOOGLE_ANALYTICS,
      ...GOOGLE_ADS,
      ...FIREBASE,
      ...VERCEL,
      // HMR en desarrollo.
      ...(isProd ? [] : ['ws:', 'wss:']),
    ],
    // Stripe Checkout, Turnstile y los iframes de anuncios.
    'frame-src': ["'self'", ...STRIPE, ...TURNSTILE, ...GOOGLE_ADS, ...CLERK],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    // Impide que un tercero embeba el sitio (clickjacking).
    'frame-ancestors': ["'self'"],
    // Neutraliza <object>/<embed>, vector clásico de XSS.
    'object-src': ["'none'"],
    // Impide que una inyección reescriba la base de todas las URLs relativas.
    'base-uri': ["'self'"],
    // Los envíos de formulario solo pueden ir al propio sitio o a Stripe.
    'form-action': ["'self'", 'https://buy.stripe.com', 'https://checkout.stripe.com'],
    'upgrade-insecure-requests': [],
    'report-uri': ['/api/csp-report'],
  });
}

/**
 * CSP para las demos estáticas de `/webpages/*`.
 * Permisiva a propósito: son proyectos de ejemplo que cargan librerías de CDNs
 * públicos. Se conservan las defensas que no dependen del origen del recurso.
 */
export function demoContentSecurityPolicy(): string {
  return directives({
    'default-src': ["'self'", 'https:', 'data:', 'blob:'],
    'script-src': ["'self'", 'https:', "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", 'https:', "'unsafe-inline'"],
    'img-src': ["'self'", 'https:', 'data:', 'blob:'],
    'font-src': ["'self'", 'https:', 'data:'],
    'media-src': ["'self'", 'https:', 'data:', 'blob:'],
    'connect-src': ["'self'", 'https:'],
    'frame-ancestors': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'report-uri': ['/api/csp-report'],
  });
}

/**
 * Cabeceras que se aplican en modo bloqueo desde el primer día.
 * Ninguna depende de qué terceros cargue la página, así que no hay riesgo de
 * romper nada calibrando.
 */
export const BASELINE_SECURITY_HEADERS = [
  // Dos años de HTTPS obligatorio. `preload` requiere darse de alta en
  // https://hstspreload.org una vez confirmado que todos los subdominios sirven HTTPS.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Impide que el navegador reinterprete el Content-Type (p. ej. servir un
  // .json subido por un usuario como si fuera JavaScript).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Respaldo legado de `frame-ancestors` para navegadores antiguos.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // No filtra la ruta completa a terceros, solo el origen.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Renuncia a APIs del navegador que este sitio no usa.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com"), usb=(), magnetometer=(), gyroscope=()',
  },
  // Aísla el contexto de navegación. `allow-popups` es necesario: Clerk y
  // Stripe abren ventanas emergentes para login y pago.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
] as const;

/** Nombre de la cabecera CSP según el modo activo. */
export function cspHeaderKey(): string {
  return isCspEnforced()
    ? 'Content-Security-Policy'
    : 'Content-Security-Policy-Report-Only';
}

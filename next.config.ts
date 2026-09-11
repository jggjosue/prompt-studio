import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { assertClerkProductionKeys } from './src/lib/clerk-config';
import {
  appContentSecurityPolicy,
  BASELINE_SECURITY_HEADERS,
  cspHeaderKey,
  demoContentSecurityPolicy,
} from './src/lib/security-headers';

assertClerkProductionKeys();

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_STRIPE_CHECKOUT_MINI_WEB_PLAN:
      process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MINI_WEB_PLAN,
    NEXT_PUBLIC_STRIPE_CHECKOUT_ENTREPRENEUR_PLAN:
      process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENTREPRENEUR_PLAN,
    NEXT_PUBLIC_STRIPE_CHECKOUT_PROFESSIONAL_PLAN:
      process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_PROFESSIONAL_PLAN,
    NEXT_PUBLIC_STRIPE_CHECKOUT_BUSINESS_PLAN:
      process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_BUSINESS_PLAN,
    NEXT_PUBLIC_STRIPE_CHECKOUT_PREMIUM_PLAN:
      process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_PREMIUM_PLAN,
    NEXT_PUBLIC_STRIPE_CHECKOUT_ELITE_PLAN:
      process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ELITE_PLAN,
  },
  transpilePackages: ['framer-motion'],
  /** Gzip en `next start` (Brotli lo aplica Vercel en el edge + rutas API con http-compression). */
  compress: true,
  poweredByHeader: false,
  /** SWC minifica JS en build (mangle, dead code, sin espacios). */
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
    /** Tree-shake de imports barrel (menos JS en el cliente). */
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
  },
  /** La API de descargas genera el ZIP desde public/webpages en tiempo de ejecución. */
  outputFileTracingIncludes: {
    '/api/landing-pages/*/download': [
      './public/webpages/**/*',
    ],
    '/api/catalog/*': ['./public/catalog/**/*'],
  },
  // Genkit / OpenTelemetry use optional exporters; keep them external on the server bundle.
  serverExternalPackages: [
    'genkit',
    '@genkit-ai/google-genai',
    '@genkit-ai/next',
    '@opentelemetry/sdk-node',
    '@opentelemetry/exporter-jaeger',
    'firebase-admin',
    '@aws-sdk/client-s3',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    /** AVIF primero (mejor compresión), WebP como respaldo — vía next/image. */
    formats: ['image/avif', 'image/webp'],
    /**
     * `OptimizedImage` pide calidad 72 por defecto. Sin declararla aquí, Next
     * 15 avisa en cada petición y a partir de Next 16 será obligatorio: el
     * optimizador rechazará cualquier calidad no listada.
     */
    qualities: [72, 75],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'meta.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.fna.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /**
   * `instrumentation.ts` se compila para los dos runtimes. Su `onRequestError`
   * importa `observability-server` → mongoose → drivers opcionales de mongodb →
   * `agent-base`, que hace `require('http')`: imposible de resolver en edge.
   *
   * El guard `NEXT_RUNTIME === 'edge'` no basta porque webpack resuelve los
   * `import()` al parsear, antes de eliminar código muerto. Aquí se sustituye
   * el módulo por uno vacío solo en el bundle edge; en ese runtime la función
   * retorna antes de usarlo, así que no cambia el comportamiento.
   *
   * Turbopack (que es lo que usa `next dev`) ya lo resuelve por su cuenta;
   * esto solo hace falta para `next build`, que sigue usando webpack.
   */
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === 'edge') {
      const observabilityServer = path.resolve(
        process.cwd(),
        'src/lib/observability-server.ts'
      );
      config.resolve.alias = {
        ...config.resolve.alias,
        // Por petición (como lo escribe `instrumentation.ts`)...
        '@/lib/observability-server': false,
        // ...y por ruta absoluta, que es la clave que webpack acaba comparando
        // una vez el plugin de paths de TypeScript resuelve el alias `@/`.
        [observabilityServer]: false,
        // Red de seguridad: corta la cadena en su raíz por si algún otro
        // módulo del bundle edge acabara alcanzando mongoose.
        mongoose: false,
      };
    }
    return config;
  },
  async headers() {
    return [
      /**
       * Seguridad. Las cabeceras base van en modo bloqueo; la CSP sale en
       * Report-Only hasta que `CSP_ENFORCE=true`.
       * Detalle y motivos en `src/lib/security-headers.ts`.
       *
       * Las dos entradas se excluyen mutuamente mediante el lookahead negativo:
       * si ambas coincidieran, el navegador aplicaría la intersección de las
       * dos políticas y las demos dejarían de cargar sus CDNs.
       */
      {
        source: '/:path((?!webpages/).*)',
        headers: [
          ...BASELINE_SECURITY_HEADERS,
          { key: cspHeaderKey(), value: appContentSecurityPolicy() },
        ],
      },
      /**
       * Demos estáticas: cargan librerías de cdnjs/jsdelivr/unpkg y Google
       * Fonts, así que necesitan una política propia o no renderizan.
       */
      {
        source: '/webpages/:path*',
        headers: [
          ...BASELINE_SECURITY_HEADERS,
          { key: cspHeaderKey(), value: demoContentSecurityPolicy() },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/prompts/:slug.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=120, stale-while-revalidate=3600',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/catalog/:kind',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/webpages/:slug.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=120, stale-while-revalidate=3600',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

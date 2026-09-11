# Auditoría de dependencias

## Cambios

- `date-fns` fue retirado: no tenía imports en `src` ni en `scripts`.
- Los catálogos JSON dejaron de importarse desde componentes cliente y ahora se consumen paginados.
- Los editores avanzados de imagen, video y web se cargan mediante `next/dynamic`.

## Dependencias parecidas que no son duplicadas

- `firebase` se usa en el navegador; `firebase-admin` se usa en el servidor.
- `genkit`, `@genkit-ai/next` y `@genkit-ai/google-genai` son núcleo, adaptador y proveedor.
- `framer-motion` ejecuta animaciones; `tailwindcss-animate` aporta utilidades CSS durante el build.
- `clsx` y `tailwind-merge` cumplen funciones distintas dentro de `cn()`.

## Límites verificados

- No hay una segunda librería de iconos: el proyecto utiliza `lucide-react`.
- `optimizePackageImports` está habilitado para `lucide-react`, Radix, Recharts y otros paquetes con exports amplios.
- No existen imports de `three`, `@react-three/fiber`, `@react-three/drei` o Spline en `src`.
- Cloudflare, Sharp, Stripe, Firebase Admin y Genkit permanecen en el bundle de servidor.

El reporte reproducible de rutas se genera con `npm run analyze:routes`.

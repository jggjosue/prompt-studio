#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'src/data/prompts/web-login-components.json');

const concepts = [
  ['Aurora Glass', 'Cristal Aurora', 'glass', '#8b5cf6', '#ec4899', '#09090b'],
  ['Ocean Split', 'Océano dividido', 'split', '#0ea5e9', '#14b8a6', '#f0f9ff'],
  ['Midnight SaaS', 'SaaS medianoche', 'dark', '#6366f1', '#22d3ee', '#09090b'],
  ['Warm Editorial', 'Editorial cálido', 'editorial', '#b45309', '#f59e0b', '#fffbeb'],
  ['Emerald Finance', 'Finanzas esmeralda', 'split', '#059669', '#34d399', '#ecfdf5'],
  ['Coral Creator', 'Creador coral', 'gradient', '#f43f5e', '#fb923c', '#fff7ed'],
  ['Mono Brutalist', 'Brutalista monocromo', 'brutal', '#111827', '#facc15', '#f9fafb'],
  ['Lavender Wellness', 'Bienestar lavanda', 'soft', '#8b5cf6', '#c4b5fd', '#faf5ff'],
  ['Cyber Terminal', 'Terminal cibernética', 'terminal', '#22c55e', '#06b6d4', '#020617'],
  ['Blue Enterprise', 'Empresa azul', 'corporate', '#2563eb', '#60a5fa', '#eff6ff'],
  ['Rose Boutique', 'Boutique rosa', 'editorial', '#be185d', '#f9a8d4', '#fff1f2'],
  ['Solar Commerce', 'Comercio solar', 'gradient', '#ea580c', '#facc15', '#fff7ed'],
  ['Slate Minimal', 'Minimalista pizarra', 'minimal', '#334155', '#94a3b8', '#f8fafc'],
  ['Violet AI', 'IA violeta', 'dark', '#7c3aed', '#a78bfa', '#0f0a1f'],
  ['Mint Health', 'Salud menta', 'soft', '#0d9488', '#5eead4', '#f0fdfa'],
  ['Ruby Luxury', 'Lujo rubí', 'glass', '#be123c', '#fb7185', '#18080d'],
  ['Indigo Workspace', 'Espacio índigo', 'corporate', '#4338ca', '#818cf8', '#eef2ff'],
  ['Sand Travel', 'Viajes arena', 'split', '#c2410c', '#fdba74', '#fff7ed'],
  ['Lime Fitness', 'Fitness lima', 'brutal', '#65a30d', '#bef264', '#18181b'],
  ['Sky Education', 'Educación cielo', 'soft', '#0284c7', '#7dd3fc', '#f0f9ff'],
  ['Obsidian Pro', 'Obsidiana Pro', 'dark', '#a3e635', '#22c55e', '#09090b'],
  ['Peach Community', 'Comunidad durazno', 'soft', '#ea580c', '#fdba74', '#fff7ed'],
  ['Neon Gaming', 'Gaming neón', 'terminal', '#d946ef', '#22d3ee', '#05030d'],
  ['Paper Studio', 'Estudio papel', 'minimal', '#171717', '#ef4444', '#fafaf9'],
  ['Cobalt Security', 'Seguridad cobalto', 'corporate', '#1d4ed8', '#38bdf8', '#020617'],
  ['Amber Analytics', 'Analítica ámbar', 'dark', '#f59e0b', '#fcd34d', '#111827'],
  ['Forest Nonprofit', 'ONG bosque', 'split', '#166534', '#4ade80', '#f0fdf4'],
  ['Candy Social', 'Social caramelo', 'gradient', '#db2777', '#8b5cf6', '#fdf2f8'],
  ['Graphite Developer', 'Desarrollador grafito', 'terminal', '#38bdf8', '#a3e635', '#0a0a0a'],
  ['Ivory Legal', 'Legal marfil', 'editorial', '#713f12', '#d6b981', '#fffbeb'],
  ['Teal Logistics', 'Logística teal', 'corporate', '#0f766e', '#2dd4bf', '#f0fdfa'],
  ['Purple Events', 'Eventos púrpura', 'gradient', '#7e22ce', '#e879f9', '#faf5ff'],
  ['Red Sports', 'Deportes rojo', 'brutal', '#dc2626', '#fca5a5', '#111827'],
  ['Nordic Home', 'Hogar nórdico', 'minimal', '#57534e', '#d6d3d1', '#fafaf9'],
  ['Aqua Crypto', 'Cripto aqua', 'glass', '#06b6d4', '#3b82f6', '#071525'],
  ['Plum HR', 'RRHH ciruela', 'soft', '#9333ea', '#d8b4fe', '#fdf4ff'],
  ['Gold Members', 'Miembros oro', 'dark', '#d97706', '#fde68a', '#0c0a09'],
  ['Cloud Productivity', 'Productividad nube', 'minimal', '#2563eb', '#cbd5e1', '#f8fafc'],
  ['Mango Delivery', 'Delivery mango', 'gradient', '#f97316', '#facc15', '#fff7ed'],
  ['Berry Music', 'Música berry', 'glass', '#e11d48', '#8b5cf6', '#10050c'],
  ['Steel Industrial', 'Industrial acero', 'brutal', '#475569', '#f97316', '#e2e8f0'],
  ['Blush Beauty', 'Belleza blush', 'editorial', '#db2777', '#fbcfe8', '#fff1f2'],
  ['Navy Insurance', 'Seguros navy', 'corporate', '#1e3a8a', '#38bdf8', '#eff6ff'],
  ['Eco Marketplace', 'Marketplace eco', 'split', '#15803d', '#84cc16', '#f7fee7'],
  ['Pixel Portfolio', 'Portafolio pixel', 'terminal', '#a855f7', '#f472b6', '#09090b'],
  ['Terracotta Food', 'Comida terracota', 'editorial', '#c2410c', '#fb923c', '#fff7ed'],
  ['Arctic Cloud', 'Nube ártica', 'glass', '#0284c7', '#a5f3fc', '#082f49'],
  ['Black Fashion', 'Moda negra', 'dark', '#fafafa', '#a3a3a3', '#050505'],
  ['Pastel Kids', 'Infantil pastel', 'soft', '#7c3aed', '#f9a8d4', '#fefce8'],
  ['Signal Admin', 'Administración Signal', 'minimal', '#dc2626', '#fb7185', '#f8fafc'],
];

const providers = [
  ['email', 'Correo y contraseña'], ['social', 'Google y GitHub'], ['magic', 'Enlace mágico'],
  ['passkey', 'Passkey/WebAuthn'], ['sso', 'SSO empresarial'],
];

const components = concepts.map((concept, index) => {
  const [en, es, layout, primary, secondary, background] = concept;
  const [auth, authEs] = providers[index % providers.length];
  const rounded = index % 4 === 0 ? '2xl' : index % 4 === 1 ? 'xl' : index % 4 === 2 ? 'lg' : 'none';
  const promptBase = `Build a production-ready login component named “${en}” using React, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form and Zod. Use the ${layout} layout with primary ${primary}, secondary ${secondary}, and background ${background}. Include email and password fields, show/hide password, remember-me, forgot-password and create-account actions, ${auth} authentication, loading, disabled, validation, server-error and success states. Use semantic labels, keyboard navigation, visible focus, autocomplete, aria-live errors, WCAG AA contrast and responsive behavior. Keep authentication on the server, use secure HttpOnly cookies, CSRF protection, rate limiting and generic invalid-credential messages. Return reusable component code, schema, integration example and required dependencies; never include secret keys.`;
  const promptEs = `Crea un componente de inicio de sesión listo para producción llamado «${es}» con React, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form y Zod. Usa un layout ${layout}, color principal ${primary}, secundario ${secondary} y fondo ${background}. Incluye correo, contraseña, mostrar/ocultar contraseña, recordarme, recuperar contraseña, crear cuenta, autenticación mediante ${authEs}, estados de carga, deshabilitado, validación, error del servidor y éxito. Usa labels semánticos, navegación por teclado, foco visible, autocomplete, errores con aria-live, contraste WCAG AA y diseño responsive. Mantén la autenticación en el servidor, cookies HttpOnly seguras, protección CSRF, rate limiting y mensajes genéricos para credenciales incorrectas. Devuelve componente reutilizable, esquema, ejemplo de integración y dependencias; nunca incluyas claves secretas.`;
  return {
    id: `login-${String(index + 1).padStart(3, '0')}`,
    name: { en: `${en} Login`, es: `Login ${es}` },
    description: { en: `${layout} authentication interface with ${auth} access and complete form states.`, es: `Interfaz de autenticación ${layout} con acceso mediante ${authEs} y estados completos.` },
    prompt: { en: promptBase, es: promptEs },
    preview: { layout, primary, secondary, background, rounded, dark: ['dark','terminal','glass'].includes(layout) },
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'React Hook Form', 'Zod'],
    tags: ['Login', layout, auth, index % 2 ? 'Minimal' : 'Responsive', index % 3 ? 'SaaS' : 'E-commerce'],
    membership: index < 10 ? 'Free' : 'Premium',
  };
});

const catalog = {
  title_es: 'Componentes de login', title_en: 'Login components',
  description_es: 'Interfaces de autenticación listas para adaptar, visualizar y generar mediante prompts profesionales.',
  description_en: 'Authentication interfaces ready to customize, preview, and generate with professional prompts.',
  components,
};

fs.writeFileSync(output, JSON.stringify(catalog, null, 2) + '\n');
console.log(`Created ${components.length} login components in ${output}`);

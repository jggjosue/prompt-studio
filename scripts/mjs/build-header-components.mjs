#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'src/data/prompts/web-header-components.json');

const concepts = [
  ['Aurora SaaS','SaaS Aurora','glass','#7c3aed','#ec4899','#09090b'],['Ocean Commerce','Comercio Océano','mega','#0284c7','#14b8a6','#f0f9ff'],['Midnight AI','IA Medianoche','centered','#6366f1','#22d3ee','#050816'],['Warm Editorial','Editorial Cálido','editorial','#b45309','#f59e0b','#fffbeb'],['Emerald Finance','Finanzas Esmeralda','corporate','#047857','#34d399','#ecfdf5'],
  ['Coral Creator','Creador Coral','floating','#f43f5e','#fb923c','#fff7ed'],['Mono Brutalist','Brutalista Mono','brutal','#111827','#facc15','#f9fafb'],['Lavender Wellness','Bienestar Lavanda','pill','#8b5cf6','#c4b5fd','#faf5ff'],['Cyber Terminal','Terminal Cyber','terminal','#22c55e','#06b6d4','#020617'],['Blue Enterprise','Empresa Azul','corporate','#2563eb','#60a5fa','#eff6ff'],
  ['Rose Boutique','Boutique Rosa','editorial','#be185d','#f9a8d4','#fff1f2'],['Solar Marketplace','Marketplace Solar','mega','#ea580c','#facc15','#fff7ed'],['Slate Minimal','Minimalista Slate','minimal','#334155','#94a3b8','#f8fafc'],['Violet Product','Producto Violeta','centered','#7c3aed','#a78bfa','#0f0a1f'],['Mint Health','Salud Menta','pill','#0d9488','#5eead4','#f0fdfa'],
  ['Ruby Luxury','Lujo Rubí','glass','#be123c','#fb7185','#18080d'],['Indigo Workspace','Workspace Índigo','floating','#4338ca','#818cf8','#eef2ff'],['Sand Travel','Viajes Arena','mega','#c2410c','#fdba74','#fff7ed'],['Lime Fitness','Fitness Lima','brutal','#65a30d','#bef264','#18181b'],['Sky Education','Educación Cielo','centered','#0284c7','#7dd3fc','#f0f9ff'],
  ['Obsidian Pro','Obsidiana Pro','minimal','#a3e635','#22c55e','#09090b'],['Peach Community','Comunidad Durazno','pill','#ea580c','#fdba74','#fff7ed'],['Neon Gaming','Gaming Neón','terminal','#d946ef','#22d3ee','#05030d'],['Paper Studio','Estudio Papel','editorial','#171717','#ef4444','#fafaf9'],['Cobalt Security','Seguridad Cobalto','corporate','#1d4ed8','#38bdf8','#020617'],
  ['Amber Analytics','Analítica Ámbar','floating','#f59e0b','#fcd34d','#111827'],['Forest Nonprofit','ONG Bosque','mega','#166534','#4ade80','#f0fdf4'],['Candy Social','Social Caramelo','glass','#db2777','#8b5cf6','#fdf2f8'],['Graphite Developer','Developer Grafito','terminal','#38bdf8','#a3e635','#0a0a0a'],['Ivory Legal','Legal Marfil','minimal','#713f12','#d6b981','#fffbeb'],
  ['Teal Logistics','Logística Teal','corporate','#0f766e','#2dd4bf','#f0fdfa'],['Purple Events','Eventos Púrpura','centered','#7e22ce','#e879f9','#faf5ff'],['Red Sports','Deportes Rojo','brutal','#dc2626','#fca5a5','#111827'],['Nordic Home','Hogar Nórdico','editorial','#57534e','#d6d3d1','#fafaf9'],['Aqua Crypto','Cripto Aqua','glass','#06b6d4','#3b82f6','#071525'],
  ['Plum People','Personas Ciruela','pill','#9333ea','#d8b4fe','#fdf4ff'],['Gold Members','Miembros Oro','floating','#d97706','#fde68a','#0c0a09'],['Cloud Productivity','Productividad Cloud','minimal','#2563eb','#cbd5e1','#f8fafc'],['Mango Delivery','Delivery Mango','mega','#f97316','#facc15','#fff7ed'],['Berry Music','Música Berry','glass','#e11d48','#8b5cf6','#10050c'],
  ['Steel Industrial','Industrial Acero','brutal','#475569','#f97316','#e2e8f0'],['Blush Beauty','Belleza Blush','editorial','#db2777','#fbcfe8','#fff1f2'],['Navy Insurance','Seguros Navy','corporate','#1e3a8a','#38bdf8','#eff6ff'],['Eco Market','Mercado Eco','mega','#15803d','#84cc16','#f7fee7'],['Pixel Portfolio','Portfolio Pixel','terminal','#a855f7','#f472b6','#09090b'],
  ['Terracotta Food','Comida Terracota','floating','#c2410c','#fb923c','#fff7ed'],['Arctic Cloud','Nube Ártica','glass','#0284c7','#a5f3fc','#082f49'],['Black Fashion','Moda Negra','centered','#fafafa','#a3a3a3','#050505'],['Pastel Kids','Infantil Pastel','pill','#7c3aed','#f9a8d4','#fefce8'],['Signal Admin','Administración Signal','minimal','#dc2626','#fb7185','#f8fafc'],
];

const behaviors = ['sticky with scroll shadow','transparent to solid on scroll','responsive drawer','accessible mega menu','announcement bar'];
const behaviorsEs = ['sticky con sombra al hacer scroll','transparente que se vuelve sólido','drawer responsive','mega menú accesible','barra de anuncios'];

const components = concepts.map(([en,es,layout,primary,secondary,background], index) => ({
  id: `header-${String(index + 1).padStart(3,'0')}`,
  name: { en: `${en} Header`, es: `Header ${es}` },
  description: { en: `${layout} navigation with ${behaviors[index % behaviors.length]}.`, es: `Navegación ${layout} con ${behaviorsEs[index % behaviorsEs.length]}.` },
  prompt: {
    en: `Build a production-ready “${en}” website header using React, TypeScript, Tailwind CSS, shadcn/ui and Lucide icons. Use a ${layout} composition with primary ${primary}, secondary ${secondary}, and background ${background}. Implement ${behaviors[index % behaviors.length]}, logo, primary navigation, active state, CTA, search trigger, theme-ready styles, user menu and mobile navigation. Dropdowns must support keyboard navigation, Escape, focus management, click outside, aria-expanded, aria-controls and semantic nav landmarks. Avoid hover-only access. Include desktop, tablet and mobile states, reduced-motion support, WCAG AA contrast, route integration and reusable typed navigation data. Return the complete component, dependencies and usage example; do not include proprietary logos or secret keys.`,
    es: `Crea un header listo para producción llamado «${es}» usando React, TypeScript, Tailwind CSS, shadcn/ui e iconos Lucide. Usa una composición ${layout}, color principal ${primary}, secundario ${secondary} y fondo ${background}. Implementa ${behaviorsEs[index % behaviorsEs.length]}, logotipo, navegación principal, estado activo, CTA, buscador, estilos compatibles con temas, menú de usuario y navegación móvil. Los desplegables deben funcionar con teclado, Escape, gestión del foco, clic exterior, aria-expanded, aria-controls y landmarks nav semánticos. Evita interacciones disponibles solo mediante hover. Incluye estados para escritorio, tablet y móvil, reducción de movimiento, contraste WCAG AA, integración con rutas y datos de navegación tipados reutilizables. Devuelve el componente completo, dependencias y ejemplo de uso; no incluyas logotipos protegidos ni claves secretas.`
  },
  preview: { layout, primary, secondary, background, dark: ['glass','terminal','centered'].includes(layout) && ['#09090b','#050816','#0f0a1f','#18080d','#05030d','#020617','#071525','#10050c','#050505'].includes(background) },
  stack: ['React','TypeScript','Tailwind CSS','shadcn/ui','Lucide React'],
  tags: ['Header',layout,index % 2 ? 'Responsive' : 'Sticky',index % 5 === 3 ? 'Mega menu' : 'Navigation',index % 3 ? 'SaaS' : 'E-commerce'],
  membership: index < 10 ? 'Free' : 'Premium'
}));

fs.writeFileSync(output, JSON.stringify({
  title_es:'Componentes de header', title_en:'Header components',
  description_es:'Headers responsive y accesibles para visualizar, personalizar y generar mediante prompts profesionales.',
  description_en:'Responsive, accessible headers ready to preview, customize, and generate with professional prompts.',
  components
}, null, 2) + '\n');
console.log(`Created ${components.length} header components in ${output}`);

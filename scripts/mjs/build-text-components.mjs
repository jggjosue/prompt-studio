#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'src/data/prompts/web-text-components.json');

const concepts = [
  ['Aurora Gradient Hero','Hero degradado aurora','gradient','Build beyond limits.'],['Editorial Serif Statement','Declaración serif editorial','editorial','Stories worth remembering.'],['Kinetic Word Stack','Pila de palabras cinéticas','stack','CREATE. MOVE. REPEAT.'],['Outlined Impact Title','Título impactante delineado','outline','MAKE IT ICONIC.'],['Glass Caption Card','Tarjeta de texto glass','glass','Clarity in every detail.'],
  ['Split Color Headline','Titular de color dividido','split','One idea. Two perspectives.'],['Neon Glow Display','Display con brillo neón','neon','ENTER THE FUTURE.'],['Minimal SaaS Hero','Hero SaaS minimalista','minimal','Work smarter, together.'],['Brutalist Poster Type','Tipografía póster brutalista','brutal','BREAK THE GRID.'],['Luxury Fashion Serif','Serif de moda lujosa','luxury','Quiet confidence.'],
  ['Variable Font Wave','Onda de fuente variable','wave','Shape every possibility.'],['Marquee Announcement','Anuncio marquee','marquee','NEW COLLECTION · FREE SHIPPING'],['Highlighted Marker Text','Texto resaltado con marcador','highlight','Ideas that move business.'],['Vertical Japanese Inspired','Vertical inspirado en Japón','vertical','FORM / SPACE / RHYTHM'],['Chromatic Shadow Title','Título con sombra cromática','shadow','STAND OUT LOUD.'],
  ['Soft Wellness Quote','Cita suave de bienestar','quote','Breathe into a better day.'],['Monospace Developer Intro','Introducción developer monoespaciada','mono','> ship_quality_code();'],['Circular Badge Copy','Texto de insignia circular','circle','DESIGNED WITH PURPOSE'],['Gradient Underline CTA','CTA con subrayado degradado','underline','Start your next chapter'],['Oversized Number Metric','Métrica numérica gigante','metric','98% faster workflow'],
  ['Retro Arcade Heading','Encabezado arcade retro','retro','PLAYER ONE READY'],['Organic Food Headline','Titular orgánico de comida','organic','Grown close. Made fresh.'],['Corporate Trust Statement','Declaración corporativa de confianza','corporate','Confidence at every scale.'],['Playful Kids Lettering','Lettering infantil divertido','playful','BIG IDEAS START SMALL'],['Condensed Sports Title','Título deportivo condensado','condensed','BUILT TO PERFORM.'],
  ['Cinematic Film Credit','Crédito cinematográfico','cinematic','A STORY BY NORTH STUDIO'],['Pastel Social Caption','Caption social pastel','caption','Create your own sunshine.'],['Data Dashboard Label','Etiqueta de dashboard','data','Revenue intelligence'],['Handwritten Creator Note','Nota manuscrita de creador','handwritten','Made with curiosity.'],['Blackletter Culture Title','Título cultural blackletter','blackletter','New traditions.'],
  ['Masked Image Typography','Tipografía con máscara de imagen','masked','EXPLORE MORE'],['Liquid Distortion Word','Palabra con distorsión líquida','liquid','FLOW'],['Typewriter Product Message','Mensaje de producto typewriter','typewriter','Your workspace is ready.'],['Scramble Tech Heading','Encabezado tecnológico scramble','scramble','SYSTEM ONLINE'],['Staggered Reveal Paragraph','Párrafo con revelado escalonado','reveal','Thoughtful tools for ambitious teams.'],
  ['3D Extruded Display','Display extruido 3D','extruded','DEPTH MATTERS'],['Duotone Campaign Title','Título de campaña duotono','duotone','MOVE DIFFERENTLY.'],['Elegant Restaurant Menu','Menú elegante de restaurante','menu','Seasonal tasting menu'],['Real Estate Property Hero','Hero inmobiliario','property','A new perspective on home.'],['Automotive Speed Wordmark','Wordmark automotriz veloz','speed','ENGINEERED FOR MOTION'],
  ['Beauty Product Label','Etiqueta de producto beauty','label','Radiance, refined.'],['Jewelry Editorial Quote','Cita editorial de joyería','jewelry','Crafted to become yours.'],['Marketplace Price Lockup','Composición de precio marketplace','price','Premium quality · $49'],['App Onboarding Message','Mensaje de onboarding','onboarding','Everything starts here.'],['Error State Typography','Tipografía de estado de error','error','Something took a detour.'],
  ['Success Celebration Copy','Texto de celebración exitosa','success','You did it!'],['Accessible Reading Block','Bloque de lectura accesible','reading','Designed for comfortable reading.'],['Multilingual Welcome','Bienvenida multilingüe','multilingual','Welcome · Bienvenido · Bienvenue'],['Responsive Fluid Heading','Encabezado fluido responsive','fluid','Perfect at every size.'],['Holographic Final CTA','CTA final holográfico','holographic','READY WHEN YOU ARE.'],
];

const palettes = [
  ['#8b5cf6','#ec4899','#09090b'],['#0ea5e9','#14b8a6','#effcff'],['#f97316','#facc15','#fff7ed'],['#22c55e','#06b6d4','#03150d'],['#ef4444','#f472b6','#fff1f2'],
  ['#6366f1','#22d3ee','#080b1c'],['#a3e635','#14b8a6','#f7fee7'],['#d946ef','#8b5cf6','#16051c'],['#f59e0b','#fb7185','#fffbeb'],['#38bdf8','#818cf8','#071325'],
];
const alignments = ['left','center','right'];
const families = ['sans','serif','mono','display'];

const components = concepts.map(([en,es,style,sample], index) => {
  const [primary,secondary,background] = palettes[index % palettes.length];
  const alignment = alignments[index % alignments.length];
  const family = families[index % families.length];
  return {
    id:`text-${String(index+1).padStart(3,'0')}`,
    name:{en,es},
    description:{en:`${style} typography composition with responsive hierarchy and ${alignment} alignment.`,es:`Composición tipográfica ${style} con jerarquía responsive y alineación ${alignment}.`},
    sample,
    prompt:{
      en:`Create a production-ready typography component named “${en}” using React, TypeScript, Tailwind CSS and Framer Motion. Render the exact sample “${sample}” in a ${style} direction, ${alignment} aligned, using a ${family} font treatment and colors ${primary}, ${secondary}, and ${background}. Include responsive fluid type with clamp(), balanced line wrapping, semantic heading levels, selectable real text, dark/light compatibility, loading-safe font fallbacks and no layout shift. If animated, use transform/opacity, respect prefers-reduced-motion, preserve screen-reader reading order and pause continuous motion offscreen. Verify WCAG AA contrast. Return reusable typed props, component code, demo, dependencies and integration instructions.`,
      es:`Crea un componente tipográfico listo para producción llamado «${es}» usando React, TypeScript, Tailwind CSS y Framer Motion. Muestra el texto exacto «${sample}» con dirección ${style}, alineación ${alignment}, tratamiento tipográfico ${family} y colores ${primary}, ${secondary} y ${background}. Incluye tipografía fluida responsive con clamp(), saltos de línea equilibrados, niveles de encabezado semánticos, texto real seleccionable, compatibilidad dark/light, fallbacks seguros y sin layout shift. Si tiene animación, usa transform/opacity, respeta prefers-reduced-motion, conserva el orden de lectura para lectores de pantalla y pausa movimientos continuos fuera del viewport. Verifica contraste WCAG AA. Devuelve props tipadas reutilizables, código del componente, demo, dependencias e instrucciones de integración.`
    },
    preview:{style,primary,secondary,background,alignment,family,dark:['#09090b','#03150d','#080b1c','#16051c','#071325'].includes(background)},
    stack:['React','TypeScript','Tailwind CSS','Framer Motion'],
    tags:['Typography',style,family,index%2?'Responsive':'Animated',index%3?'Hero':'Editorial'],
    membership:index<10?'Free':'Premium'
  };
});

fs.writeFileSync(output,JSON.stringify({title_es:'Componentes de texto',title_en:'Text components',description_es:'Composiciones tipográficas listas para visualizar, personalizar y generar con prompts profesionales.',description_en:'Typography compositions ready to preview, customize, and generate with professional prompts.',components},null,2)+'\n');
console.log(`Created ${components.length} text components in ${output}`);

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'src/data/prompts/web-animations.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const collection = 'Color Motion Collection';

const effects = [
  ['Aurora mesh reveal','Revelado de malla aurora','waves','A fluid aurora mesh expands behind a product card as it enters the viewport','Una malla aurora fluida se expande detrás de una tarjeta de producto al entrar al viewport'],
  ['Elastic orbit badges','Insignias orbitales elásticas','orbit','Feature badges orbit a central logo and settle with elastic easing','Insignias de funcionalidades orbitan un logotipo central y se acomodan con easing elástico'],
  ['Staggered glass cards','Tarjetas de cristal escalonadas','hover','Glass cards rise in a staggered sequence and tilt toward the pointer','Tarjetas de cristal suben de forma escalonada y se inclinan hacia el puntero'],
  ['Chromatic loading dots','Puntos de carga cromáticos','loader','Gradient dots bounce, stretch and blend while asynchronous content loads','Puntos degradados rebotan, se estiran y mezclan mientras carga contenido asíncrono'],
  ['Kinetic headline wipe','Barrido de titular cinético','text','A headline reveals word by word through an animated color mask','Un titular se revela palabra por palabra mediante una máscara de color animada'],
  ['Constellation particles','Partículas de constelación','particles','Responsive particles drift and connect when the pointer approaches','Partículas responsive flotan y se conectan cuando se acerca el puntero'],
  ['Liquid button hover','Hover líquido de botón','waves','A liquid highlight follows the pointer inside a conversion button','Un brillo líquido sigue el puntero dentro de un botón de conversión'],
  ['Prismatic flip tiles','Mosaicos prismáticos flip','flip-card','Tiles flip in 3D to reveal a second color layer and contextual action','Mosaicos giran en 3D para revelar una segunda capa de color y una acción contextual'],
  ['Magnetic navigation','Navegación magnética','hover','Navigation items gently follow the pointer and spring back on leave','Elementos de navegación siguen suavemente el puntero y regresan con resorte'],
  ['Gradient number counter','Contador numérico degradado','text','Metrics count upward while a gradient travels across each number','Métricas cuentan hacia arriba mientras un degradado recorre cada número'],
  ['Soft blob morph','Transformación blob suave','waves','Organic background blobs continuously morph without causing layout shifts','Blobs orgánicos de fondo cambian de forma sin provocar saltos de layout'],
  ['Radar pulse locator','Localizador con pulso radar','orbit','Concentric radar rings pulse around an active map marker','Anillos concéntricos de radar pulsan alrededor de un marcador activo'],
  ['Depth stack hover','Hover de capas con profundidad','hover','A stack of panels separates in perspective when hovered or focused','Una pila de paneles se separa en perspectiva al hacer hover o focus'],
  ['Circular progress bloom','Progreso circular expansivo','loader','A circular progress indicator fills and blooms into a success state','Un indicador circular se llena y florece hacia un estado de éxito'],
  ['Split text cascade','Cascada de texto dividido','text','Characters cascade upward with accessible unsplit text preserved','Caracteres suben en cascada conservando texto accesible sin dividir'],
  ['Firefly product field','Campo de luciérnagas de producto','particles','Small lights float around a product silhouette with restrained parallax','Pequeñas luces flotan alrededor de una silueta de producto con parallax moderado'],
  ['Waveform CTA','CTA con forma de onda','waves','An audio waveform reacts behind a play button without blocking input','Una onda de audio reacciona detrás de un botón play sin bloquear la interacción'],
  ['Diagonal portfolio flip','Flip diagonal de portafolio','flip-card','Portfolio covers rotate diagonally to reveal project metadata','Portadas de portafolio rotan en diagonal para revelar metadatos del proyecto'],
  ['Spotlight pricing cards','Tarjetas de precios spotlight','hover','A soft radial spotlight tracks across pricing cards and their borders','Un spotlight radial suave recorre tarjetas de precios y sus bordes'],
  ['Ticker text loop','Loop de texto ticker','text','A seamless horizontal ticker loops announcements with pause controls','Un ticker horizontal continuo repite anuncios con controles de pausa'],
  ['Gradient curtain entrance','Entrada de cortina degradada','waves','Layered gradient curtains open to reveal the page hero','Cortinas degradadas en capas se abren para revelar el hero'],
  ['Planetary avatar ring','Anillo planetario de avatares','orbit','Customer avatars rotate around a testimonial with controlled speed','Avatares de clientes giran alrededor de un testimonio a velocidad controlada'],
  ['Neon dashboard tilt','Tilt neón de dashboard','hover','Dashboard panels tilt in 3D with colored edge lighting','Paneles de dashboard se inclinan en 3D con iluminación de bordes'],
  ['Spectrum skeleton loader','Skeleton loader espectral','loader','A multicolor shimmer travels through content skeletons during loading','Un brillo multicolor recorre skeletons de contenido durante la carga'],
  ['Editorial line reveal','Revelado de líneas editorial','text','Text lines uncover vertically as the section becomes visible','Líneas de texto se descubren verticalmente cuando la sección es visible'],
  ['Data stream particles','Partículas de flujo de datos','particles','Data points travel along curved paths between interface nodes','Puntos de datos viajan por rutas curvas entre nodos de interfaz'],
  ['Iridescent border flow','Flujo de borde iridiscente','waves','An iridescent highlight travels around a card border on focus','Un brillo iridiscente recorre el borde de una tarjeta al recibir focus'],
  ['Accordion cube flip','Flip cúbico de acordeón','flip-card','Accordion panels rotate like cube faces while preserving reading order','Paneles de acordeón rotan como caras de cubo preservando el orden de lectura'],
  ['Cursor glow gallery','Galería con brillo de cursor','hover','Gallery thumbnails receive a colored glow based on pointer position','Miniaturas de galería reciben brillo de color según la posición del puntero'],
  ['Rolling statistic digits','Dígitos estadísticos rodantes','text','Statistic digits roll independently into their final values','Dígitos estadísticos ruedan independientemente hasta su valor final'],
  ['Northern lights background','Fondo de auroras boreales','waves','Slow layered light bands cross a dark hero background','Bandas lentas de luz atraviesan un hero oscuro'],
  ['Satellite action menu','Menú de acciones satélite','orbit','Action buttons expand radially around a primary floating control','Botones de acción se expanden radialmente alrededor de un control flotante'],
  ['Perspective testimonial deck','Deck de testimonios en perspectiva','hover','Testimonials move through a perspective deck with keyboard controls','Testimonios avanzan por un deck con perspectiva y controles de teclado'],
  ['Dual ring loader','Loader de anillo doble','loader','Two counter-rotating gradient rings indicate indeterminate progress','Dos anillos degradados en rotación opuesta indican progreso indeterminado'],
  ['Typewriter gradient cursor','Cursor degradado typewriter','text','Text types in with a gradient cursor and stable reserved width','Texto aparece con typewriter, cursor degradado y ancho reservado estable'],
  ['Meteor notification field','Campo de notificaciones meteoro','particles','Notification particles streak briefly into a status panel','Partículas de notificación cruzan brevemente hacia un panel de estado'],
  ['Silk hover surface','Superficie de seda al hover','waves','A silk-like gradient surface deforms subtly beneath the pointer','Una superficie degradada tipo seda se deforma suavemente bajo el puntero'],
  ['Product feature flip','Flip de funcionalidad de producto','flip-card','Feature cards flip to show technical details and a secondary CTA','Tarjetas de funcionalidades giran para mostrar detalles técnicos y CTA secundario'],
  ['Luminous dock icons','Iconos luminosos de dock','hover','Dock icons magnify and illuminate as keyboard or pointer focus moves','Iconos de dock se amplían e iluminan al mover el foco o puntero'],
  ['Color trail marquee','Marquee con rastro de color','text','Marquee words leave a short fading color trail while looping','Palabras en marquee dejan un rastro corto de color al repetirse'],
  ['Sunset gradient morph','Transformación degradada sunset','waves','A sunset gradient morphs between campaign color states','Un degradado sunset cambia entre estados de color de campaña'],
  ['Atomic service diagram','Diagrama atómico de servicios','orbit','Service nodes orbit a core and pause to expose labels on focus','Nodos de servicios orbitan un núcleo y pausan para mostrar labels al recibir focus'],
  ['Holographic card fan','Abanico de tarjetas holográficas','hover','Cards fan out with holographic highlights on interaction','Tarjetas se abren en abanico con brillos holográficos al interactuar'],
  ['Segmented upload loader','Loader segmentado de subida','loader','Colored segments fill sequentially with upload progress and status text','Segmentos de color se llenan según el progreso de subida y texto de estado'],
  ['Masked quote reveal','Revelado enmascarado de cita','text','A testimonial quote reveals through staggered horizontal masks','Una cita testimonial aparece mediante máscaras horizontales escalonadas'],
  ['Comet cursor particles','Partículas de cursor cometa','particles','A short-lived particle trail follows pointer movement within a canvas','Un rastro breve de partículas sigue el puntero dentro de un canvas'],
  ['Plasma card border','Borde plasma de tarjeta','waves','A restrained plasma gradient circulates around a focused card','Un degradado plasma moderado circula alrededor de una tarjeta enfocada'],
  ['Rotating benefit prism','Prisma rotatorio de beneficios','flip-card','A three-dimensional prism rotates between product benefits','Un prisma tridimensional rota entre beneficios del producto'],
  ['Magnetic image grid','Grid magnético de imágenes','hover','Grid images shift toward focus while neighboring tiles make room','Imágenes del grid se acercan al foco mientras las vecinas liberan espacio'],
  ['Chromatic word carousel','Carrusel cromático de palabras','text','Benefit words cycle vertically with distinct accessible announcements','Palabras de beneficios rotan verticalmente con anuncios accesibles distintos'],
];

const palettes = [
  ['#8b5cf6','#ec4899','#09090b'],['#0ea5e9','#14b8a6','#061b2b'],['#f97316','#facc15','#211006'],['#22c55e','#06b6d4','#03150d'],['#ef4444','#f472b6','#200609'],
  ['#6366f1','#22d3ee','#080b1c'],['#a3e635','#14b8a6','#091108'],['#d946ef','#8b5cf6','#16051c'],['#f59e0b','#fb7185','#1f0c08'],['#38bdf8','#818cf8','#071325'],
];

const additions = effects.map(([en,es,kind,action,actionEs], index) => {
  const [primary,secondary,background] = palettes[index % palettes.length];
  return {
    id: 131 + index,
    name: { en, es },
    prompt: {
      en: `Create a production-ready React and TypeScript component for “${en}”. ${action}. Use Framer Motion for lifecycle and gesture animation, Tailwind CSS for layout, and colors ${primary}, ${secondary}, and ${background}. Define entrance, active, hover/focus, exit, loading and reduced-motion states. Animate transform and opacity where possible, avoid layout shifts, clean up observers/listeners, pause offscreen continuous motion, and keep 60fps on mobile. Preserve semantic content, keyboard access, visible focus and WCAG AA contrast. Return the reusable component, typed props, demo, dependencies and integration instructions.`,
      es: `Crea un componente listo para producción en React y TypeScript para «${es}». ${actionEs}. Usa Framer Motion para ciclo de vida y gestos, Tailwind CSS para layout y los colores ${primary}, ${secondary} y ${background}. Define estados de entrada, activo, hover/focus, salida, carga y movimiento reducido. Anima transform y opacity cuando sea posible, evita layout shifts, limpia observers/listeners, pausa movimientos continuos fuera del viewport y conserva 60fps en móvil. Mantén contenido semántico, acceso por teclado, foco visible y contraste WCAG AA. Devuelve componente reutilizable, props tipadas, demo, dependencias e instrucciones de integración.`
    },
    preview: { kind, primary, secondary, background, design: index % 2 ? 'soft' : 'neon' },
    tags: ['animation',kind,'Framer Motion',index % 2 ? 'interactive' : 'scroll'],
    membership: index < 10 ? 'Free' : 'Premium',
    collection,
  };
});

data.animations = data.animations.filter(item => item.collection !== collection);
data.animations.push(...additions);
fs.writeFileSync(file, JSON.stringify(data,null,2) + '\n');
console.log(`Added ${additions.length}; catalog now contains ${data.animations.length} animations.`);

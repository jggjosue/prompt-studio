/**
 * Genera 10 proyectos 3D multipágina y los da de alta en el catálogo.
 *
 *   node scripts/add-3d-multipage-web-pages.mjs
 *
 * Cada proyecto produce una carpeta en `public/webpages/{slug}/` con:
 *   - 5 páginas HTML enlazadas entre sí por una navegación común
 *   - `styles.css` generado desde la paleta del proyecto
 *   - `scene.js` con una escena Three.js propia de su sector
 *
 * Y una entrada en `src/data/web-pages.json` con la forma que espera el
 * catálogo (`title`, `description`, `imageHint` localizados; `demoUrl`,
 * `stack`, `tags`, `membership`, `price`).
 *
 * Idempotente: si un slug ya existe en el JSON, no lo duplica.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const CATALOG = path.join(root, 'src/data/web-pages.json');
const WEBPAGES = path.join(root, 'public/webpages');
const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

/* ------------------------------------------------------------------ *
 *  Definición de los proyectos
 * ------------------------------------------------------------------ */

/**
 * Cada proyecto declara su marca, paleta, variante de escena 3D y las cinco
 * páginas con su contenido. Las secciones se describen por tipo y el renderer
 * de abajo las convierte en HTML.
 */
const PROJECTS = [
  {
    slug: '3d-joyeria-lumen-atelier',
    brand: 'Lumen Atelier',
    initials: 'LA',
    sector: 'Joyería de autor',
    scene: 'gem',
    palette: { bg: '#0b0a12', surface: '#151327', accent: '#d8b26a', accent2: '#8f7ae6', text: '#f4f1ea', muted: '#a49db5' },
    hero: {
      eyebrow: 'Alta joyería contemporánea',
      title: 'Piezas que giran, atrapan la luz y cuentan una historia.',
      text: 'Diseñamos y fabricamos joyas de autor en oro reciclado y piedras de origen trazado. Cada pieza se modela en 3D antes de existir en metal.',
    },
    stats: [['18 años', 'de taller propio'], ['100 %', 'oro reciclado'], ['4 sem.', 'plazo medio']],
    tags: ['joyeria', 'ecommerce 3d', 'lujo', 'three.js', 'catalogo', 'multipagina', 'landing 3d'],
    price: '20.00',
  },
  {
    slug: '3d-bodega-terrada-vinos',
    brand: 'Bodega Terrada',
    initials: 'BT',
    sector: 'Bodega y enoturismo',
    scene: 'terrain',
    palette: { bg: '#100c0a', surface: '#1d1613', accent: '#c2543d', accent2: '#7d9a5c', text: '#f3ece4', muted: '#a9998c' },
    hero: {
      eyebrow: 'Viñedo de altura desde 1946',
      title: 'El relieve del valle, convertido en vino y en experiencia.',
      text: 'Tres generaciones cultivando ladera. Visitas guiadas, catas verticales y un club de suscripción con envío trimestral.',
    },
    stats: [['1946', 'primera vendimia'], ['780 m', 'sobre el nivel del mar'], ['12', 'referencias activas']],
    tags: ['bodega', 'vino', 'enoturismo', 'three.js', 'reservas', 'multipagina', 'landing 3d'],
    price: '15.00',
  },
  {
    slug: '3d-clinica-dental-nova-sonrisa',
    brand: 'Nova Sonrisa',
    initials: 'NS',
    sector: 'Clínica dental',
    scene: 'orbit',
    palette: { bg: '#07131a', surface: '#0f2130', accent: '#3fd0c9', accent2: '#5c8cf5', text: '#eef7fa', muted: '#8fa9b8' },
    hero: {
      eyebrow: 'Odontología digital',
      title: 'Escaneamos, simulamos y te enseñamos el resultado antes de empezar.',
      text: 'Ortodoncia invisible, implantología guiada y estética dental con planificación 3D. Sin sorpresas y con presupuesto cerrado.',
    },
    stats: [['12 000', 'tratamientos'], ['0 €', 'primera visita'], ['24 m', 'financiación sin interés']],
    tags: ['clinica dental', 'salud', 'reservas', 'three.js', 'odontologia', 'multipagina', 'landing 3d'],
    price: '15.00',
  },
  {
    slug: '3d-gimnasio-forja-atletica',
    brand: 'Forja Atlética',
    initials: 'FA',
    sector: 'Centro de entrenamiento',
    scene: 'kinetic',
    palette: { bg: '#0d0d0f', surface: '#18181d', accent: '#e8ff5a', accent2: '#ff5c4d', text: '#f6f6f4', muted: '#9c9ca6' },
    hero: {
      eyebrow: 'Fuerza, no estética',
      title: 'Programas de fuerza medibles, no clases sueltas.',
      text: 'Evaluación inicial, plan de 12 semanas y seguimiento de cargas. Grupos de seis personas máximo con entrenador presente.',
    },
    stats: [['6', 'personas por grupo'], ['12 sem.', 'por bloque'], ['3', 'sedes en la ciudad']],
    tags: ['gimnasio', 'fitness', 'entrenamiento', 'three.js', 'membresias', 'multipagina', 'landing 3d'],
    price: '15.00',
  },
  {
    slug: '3d-paisajismo-verdal-estudio',
    brand: 'Verdal Estudio',
    initials: 'VE',
    sector: 'Arquitectura del paisaje',
    scene: 'terrain',
    palette: { bg: '#0a1210', surface: '#12201c', accent: '#7fc98a', accent2: '#d9b45c', text: '#eef5f0', muted: '#93a89b' },
    hero: {
      eyebrow: 'Paisaje, agua y clima',
      title: 'Jardines que sobreviven al verano y bajan la temperatura del edificio.',
      text: 'Diseñamos paisaje con especies adaptadas, riego eficiente y modelado del terreno. Proyectos residenciales, hoteleros y públicos.',
    },
    stats: [['-6 °C', 'en patios intervenidos'], ['64 %', 'menos consumo de riego'], ['90+', 'proyectos entregados']],
    tags: ['paisajismo', 'arquitectura', 'sostenibilidad', 'three.js', 'portfolio', 'multipagina', 'landing 3d'],
    price: '20.00',
  },
  {
    slug: '3d-agencia-viajes-orbita-lenta',
    brand: 'Órbita Lenta',
    initials: 'OL',
    sector: 'Viajes de larga duración',
    scene: 'globe',
    palette: { bg: '#080b18', surface: '#111629', accent: '#f2a65a', accent2: '#4ea3d9', text: '#f0f2f8', muted: '#95a0bd' },
    hero: {
      eyebrow: 'Viaje lento, sin prisa',
      title: 'Rutas de tres semanas por tierra, diseñadas una a una.',
      text: 'Sin circuitos cerrados ni autobuses de cuarenta personas. Tren, barco y trayectos cortos, con alojamientos elegidos a mano.',
    },
    stats: [['21 días', 'duración media'], ['8', 'viajeros por grupo'], ['0', 'vuelos internos']],
    tags: ['viajes', 'turismo', 'itinerarios', 'three.js', 'reservas', 'multipagina', 'landing 3d'],
    price: '15.00',
  },
  {
    slug: '3d-tostadero-cafe-raiz',
    brand: 'Raíz Tostadero',
    initials: 'RT',
    sector: 'Café de especialidad',
    scene: 'helix',
    palette: { bg: '#100b08', surface: '#1c1410', accent: '#d98b4a', accent2: '#8fb08a', text: '#f5eee6', muted: '#ab9789' },
    hero: {
      eyebrow: 'Tueste propio, lote pequeño',
      title: 'Del origen a tu taza en menos de quince días.',
      text: 'Compramos directo a doce fincas, tostamos por lotes de 12 kg y enviamos el mismo día. Suscripción quincenal o compra suelta.',
    },
    stats: [['12', 'fincas de origen'], ['15 días', 'del tueste al envío'], ['12 kg', 'por lote']],
    tags: ['cafe', 'ecommerce', 'suscripcion', 'three.js', 'tostadero', 'multipagina', 'landing 3d'],
    price: '15.00',
  },
  {
    slug: '3d-inmobiliaria-altura-living',
    brand: 'Altura Living',
    initials: 'AL',
    sector: 'Promoción residencial',
    scene: 'towers',
    palette: { bg: '#0a0d12', surface: '#141922', accent: '#6ea8fe', accent2: '#e0c37a', text: '#eff3f8', muted: '#93a0b3' },
    hero: {
      eyebrow: 'Obra nueva en altura',
      title: 'Recorre el piso antes de que existan los cimientos.',
      text: 'Promoción de 84 viviendas con zonas comunes en cubierta. Plano interactivo, orientación real y calculadora de financiación.',
    },
    stats: [['84', 'viviendas'], ['2027', 'entrega prevista'], ['A', 'calificación energética']],
    tags: ['inmobiliaria', 'obra nueva', 'tour virtual', 'three.js', 'viviendas', 'multipagina', 'landing 3d'],
    price: '20.00',
  },
  {
    slug: '3d-escuela-musica-cadencia',
    brand: 'Cadencia',
    initials: 'CA',
    sector: 'Escuela de música',
    scene: 'waveform',
    palette: { bg: '#0c0910', surface: '#171122', accent: '#c86bd6', accent2: '#5ad1c4', text: '#f3eefa', muted: '#a396b3' },
    hero: {
      eyebrow: 'Aprender tocando',
      title: 'Tu primer concierto a los seis meses, no a los seis años.',
      text: 'Clases individuales y de conjunto, sala de ensayo incluida y dos muestras al año en sala real. Sin exámenes ni solfeo obligatorio.',
    },
    stats: [['6 meses', 'al primer concierto'], ['2', 'muestras anuales'], ['9', 'especialidades']],
    tags: ['escuela de musica', 'educacion', 'clases', 'three.js', 'matriculas', 'multipagina', 'landing 3d'],
    price: '15.00',
  },
  {
    slug: '3d-biotech-celmira-labs',
    brand: 'Celmira Labs',
    initials: 'CL',
    sector: 'Biotecnología aplicada',
    scene: 'dna',
    palette: { bg: '#060f14', surface: '#0d1c24', accent: '#48e0a0', accent2: '#4d9df0', text: '#eaf6f4', muted: '#87a5a8' },
    hero: {
      eyebrow: 'Diagnóstico molecular',
      title: 'Paneles genéticos con resultado en 72 horas.',
      text: 'Laboratorio propio acreditado, secuenciación de nueva generación e informe interpretado por genetistas clínicos.',
    },
    stats: [['72 h', 'tiempo de respuesta'], ['ISO 15189', 'acreditación'], ['340+', 'genes en panel completo']],
    tags: ['biotecnologia', 'laboratorio', 'salud', 'three.js', 'diagnostico', 'multipagina', 'landing 3d'],
    price: '35.00',
  },
];

/** Las cinco páginas son iguales en estructura para todos los proyectos. */
const PAGE_PLAN = [
  { file: 'index.html', nav: 'Inicio', kind: 'home' },
  { file: 'servicios.html', nav: 'Servicios', kind: 'services' },
  { file: 'proyectos.html', nav: 'Proyectos', kind: 'work' },
  { file: 'precios.html', nav: 'Precios', kind: 'pricing' },
  { file: 'contacto.html', nav: 'Contacto', kind: 'contact' },
];

export { PROJECTS, PAGE_PLAN };

/* ------------------------------------------------------------------ *
 *  Contenido específico por proyecto
 * ------------------------------------------------------------------ */

/** Servicios, trabajos, planes y preguntas de cada marca. */
const DETAIL = {
  '3d-joyeria-lumen-atelier': {
    services: [
      ['Pieza única por encargo', 'Bocetamos, modelamos en 3D y te enseñamos renders antes de fundir. Tres revisiones incluidas.'],
      ['Alianzas de boda', 'Pareja de anillos con grabado interior, prueba de tallas a domicilio y garantía de por vida.'],
      ['Restauración y reengaste', 'Recuperamos piezas heredadas: limpieza, pulido, sustitución de garras y reengaste de piedra.'],
    ],
    works: [
      ['Colección Vértice', 'Nueve anillos de geometría facetada en oro blanco y zafiros de Sri Lanka.'],
      ['Serie Marea', 'Colgantes de ondas en plata de ley oxidada, inspirados en el cantábrico.'],
      ['Encargo Solano', 'Alianza con meteorito Muonionalusta engastado en oro rosa reciclado.'],
    ],
    plans: [['Consulta', '0 €', 'Cita de 45 min, toma de medidas y presupuesto cerrado sin compromiso.'],
      ['Pieza a medida', 'desde 890 €', 'Diseño 3D, tres revisiones, fundición y acabado a mano.'],
      ['Colección cápsula', 'desde 4 200 €', 'Serie de 5 a 12 piezas para marcas y tiendas, con packaging propio.']],
    faq: [
      ['¿De dónde viene el oro?', 'Trabajamos exclusivamente con oro reciclado certificado por refinería europea.'],
      ['¿Puedo ver la pieza antes de fundir?', 'Sí. Entregamos renders desde tres ángulos y, si lo pides, una resina de prueba.'],
      ['¿Cuánto tarda un encargo?', 'Cuatro semanas de media desde la aprobación del diseño.'],
    ],
  },
  '3d-bodega-terrada-vinos': {
    services: [
      ['Visita al viñedo', 'Recorrido de dos horas por la ladera, la sala de barricas y cata de cuatro vinos.'],
      ['Cata vertical', 'Seis añadas de la misma parcela con el enólogo, para grupos de hasta doce personas.'],
      ['Club Terrada', 'Tres botellas cada trimestre, elegidas por el equipo, con ficha de cata y envío incluido.'],
    ],
    works: [
      ['Parcela Alta', 'Tempranillo de viña vieja a 780 m, fermentado en tino de roble.'],
      ['Blanco de Ladera', 'Albillo criado seis meses sobre lías finas en depósito de hormigón.'],
      ['Vendimia Tardía', 'Dulce natural de uva sobremadurada, producción de 900 botellas.'],
    ],
    plans: [['Visita básica', '18 €', 'Recorrido guiado y cata de cuatro vinos por persona.'],
      ['Experiencia comida', '54 €', 'Visita, cata vertical y comida de temporada en la sala de barricas.'],
      ['Club trimestral', '39 €/trim.', 'Tres botellas con ficha de cata y envío peninsular incluido.']],
    faq: [
      ['¿Hay que reservar?', 'Sí, las visitas son en grupo reducido y se llenan con semanas de antelación.'],
      ['¿Es accesible?', 'La sala de barricas y la de catas sí. El recorrido por la ladera tiene desnivel.'],
      ['¿Se puede comprar sin visitar?', 'Sí, enviamos a península en 48 h y al resto de la UE en cinco días.'],
    ],
  },
  '3d-clinica-dental-nova-sonrisa': {
    services: [
      ['Ortodoncia invisible', 'Escaneo intraoral, simulación del resultado y férulas fabricadas en la clínica.'],
      ['Implantología guiada', 'Planificación sobre TAC y férula quirúrgica: colocación precisa y menos postoperatorio.'],
      ['Estética dental', 'Carillas de porcelana y blanqueamiento con diseño previo de sonrisa.'],
    ],
    works: [
      ['Caso apiñamiento severo', 'Catorce meses de alineadores sin extracciones ni brackets.'],
      ['Rehabilitación completa', 'Seis implantes y prótesis fija en arcada superior, entregada en 72 horas.'],
      ['Rediseño de sonrisa', 'Ocho carillas con encerado diagnóstico y prueba en boca antes de tallar.'],
    ],
    plans: [['Primera visita', '0 €', 'Revisión, radiografía panorámica y plan de tratamiento por escrito.'],
      ['Ortodoncia invisible', 'desde 2 400 €', 'Escaneo, todas las férulas, revisiones y retenedores finales.'],
      ['Implante unitario', 'desde 950 €', 'Implante, pilar y corona de circonio con garantía de diez años.']],
    faq: [
      ['¿Duele el escaneo?', 'No. Es una cámara intraoral, sin pastas ni moldes.'],
      ['¿Puedo financiar?', 'Sí, hasta 24 meses sin intereses con estudio previo.'],
      ['¿Cada cuánto son las revisiones?', 'Cada seis a ocho semanas durante el tratamiento activo.'],
    ],
  },
  '3d-gimnasio-forja-atletica': {
    services: [
      ['Evaluación inicial', 'Movilidad, fuerza máxima estimada y composición corporal. Dos horas con informe.'],
      ['Bloque de fuerza', 'Doce semanas de programación individual dentro de grupos de seis personas.'],
      ['Preparación específica', 'Oposiciones físicas, montaña o vuelta a entrenar tras lesión, con fisioterapeuta.'],
    ],
    works: [
      ['Bloque Otoño', 'Programa de sentadilla y peso muerto con progresión por RPE.'],
      ['Vuelta tras lesión', 'Protocolo de readaptación de hombro coordinado con fisioterapia.'],
      ['Oposición física', 'Doce semanas hacia las pruebas de acceso, con simulacros mensuales.'],
    ],
    plans: [['Prueba', '0 €', 'Una sesión completa con evaluación y sin compromiso.'],
      ['Bloque 12 semanas', '129 €/mes', 'Grupos de seis, programación individual y seguimiento de cargas.'],
      ['Individual', '55 €/sesión', 'Entrenador en exclusiva, horario flexible y plan revisado cada semana.']],
    faq: [
      ['¿Necesito experiencia previa?', 'No. La evaluación inicial fija el punto de partida de cada persona.'],
      ['¿Cuántos días por semana?', 'Tres sesiones es lo habitual. Dos también funciona si son consistentes.'],
      ['¿Hay permanencia?', 'No. El bloque son doce semanas y se renueva solo si quieres.'],
    ],
  },
  '3d-paisajismo-verdal-estudio': {
    services: [
      ['Proyecto de jardín', 'Levantamiento, estudio de suelo y clima, planos de plantación y riego.'],
      ['Cubiertas y patios', 'Naturación de cubiertas y patios interiores para bajar la temperatura del edificio.'],
      ['Dirección de obra', 'Seguimiento del vivero a la plantación, con control de calidad de cada ejemplar.'],
    ],
    works: [
      ['Patio Almendro', 'Patio de manzana en clima seco: 240 m² con riego por goteo enterrado.'],
      ['Cubierta Marés', 'Naturación de 900 m² sobre hotel urbano, con especies mediterráneas.'],
      ['Parque de Ribera', 'Restauración de vegetación de ribera en tramo urbano de 1,2 km.'],
    ],
    plans: [['Visita técnica', '180 €', 'Diagnóstico en campo, informe de suelo y orientación de coste.'],
      ['Proyecto completo', 'desde 4 500 €', 'Planos, memoria, listado de especies y presupuesto de ejecución.'],
      ['Proyecto + dirección', 'desde 9 800 €', 'Todo lo anterior más seguimiento de obra hasta la recepción.']],
    faq: [
      ['¿Trabajáis fuera de la provincia?', 'Sí, con desplazamiento presupuestado aparte a partir de 150 km.'],
      ['¿Qué especies usáis?', 'Adaptadas al clima local y de vivero cercano, para reducir estrés de trasplante.'],
      ['¿Cuánto tarda un proyecto?', 'De seis a diez semanas según superficie y complejidad del terreno.'],
    ],
  },
  '3d-agencia-viajes-orbita-lenta': {
    services: [
      ['Rutas de autor', 'Tres semanas por tierra, con guía local y grupos de ocho personas.'],
      ['Viaje a medida', 'Diseñamos tu itinerario, reservamos y te acompañamos por teléfono durante el viaje.'],
      ['Logística y visados', 'Trenes, ferris y trámites resueltos antes de salir, con plan B por escrito.'],
    ],
    works: [
      ['Transiberiano parcial', 'Veintiún días de Moscú a Ulán Bator con cuatro paradas largas.'],
      ['Costa Adriática', 'De Trieste a Corfú en tren y ferry, sin repetir alojamiento dos veces.'],
      ['Andes por tierra', 'Quito a La Paz en autobús de línea y tren, con aclimatación progresiva.'],
    ],
    plans: [['Ruta en grupo', 'desde 2 380 €', 'Veintiún días, alojamiento, guía local y transporte terrestre.'],
      ['Viaje a medida', 'desde 690 €', 'Honorarios de diseño e itinerario; los servicios se facturan aparte.'],
      ['Solo logística', '240 €', 'Reservas, visados y plan de contingencia para tu propio itinerario.']],
    faq: [
      ['¿Incluye vuelos?', 'No. Diseñamos la ruta por tierra; el vuelo de entrada lo eliges tú.'],
      ['¿Qué ritmo tienen?', 'Dos o tres noches por parada. Nunca hacemos una ciudad por día.'],
      ['¿Y si viajo solo?', 'La mitad de nuestros viajeros lo hace. No cobramos suplemento por habitación individual en grupo.'],
    ],
  },
  '3d-tostadero-cafe-raiz': {
    services: [
      ['Café de origen', 'Lotes de finca única, tostados según perfil y con fecha de tueste en la bolsa.'],
      ['Suscripción quincenal', 'Dos bolsas cada quince días, ajustadas a tu método de preparación.'],
      ['Servicio a hostelería', 'Suministro, calibración de molino y formación de barista incluida.'],
    ],
    works: [
      ['Finca La Esperanza', 'Colombia, Huila. Lavado, notas de panela y mandarina.'],
      ['Kirinyaga AA', 'Kenia. Lavado, acidez alta, grosella negra y tomate seco.'],
      ['Blend Raíz', 'Mezcla de Brasil y Etiopía pensada para espresso con leche.'],
    ],
    plans: [['Bolsa suelta', '11,50 €', '250 g de origen único, molido a tu método o en grano.'],
      ['Suscripción', '21 €/quincena', 'Dos bolsas de 250 g con envío incluido y cambio de perfil cuando quieras.'],
      ['Hostelería', 'a convenir', 'Precio por kilo según volumen, con préstamo de molino y formación.']],
    faq: [
      ['¿Cuándo tostáis?', 'Los martes y jueves. Enviamos el mismo día del tueste.'],
      ['¿Molido o en grano?', 'Como prefieras. Si eliges molido, indícanos el método y calibramos.'],
      ['¿Puedo pausar la suscripción?', 'Sí, desde tu cuenta y sin dar explicaciones.'],
    ],
  },
  '3d-inmobiliaria-altura-living': {
    services: [
      ['Recorrido virtual', 'Camina por el piso a escala real, cambia acabados y comprueba la luz por horas.'],
      ['Asesoría de compra', 'Estudio de financiación, comparativa de hipotecas y acompañamiento a notaría.'],
      ['Personalización', 'Elige distribución de cocina, pavimento y carpintería antes del cierre de obra.'],
    ],
    works: [
      ['Torre Norte', 'Cuarenta y dos viviendas de dos y tres dormitorios con terraza corrida.'],
      ['Torre Sur', 'Cuarenta y dos viviendas con orientación sureste y trasteros incluidos.'],
      ['Cubierta común', 'Piscina, huerto urbano y sala polivalente en la planta doce.'],
    ],
    plans: [['2 dormitorios', 'desde 218 000 €', '74 m² útiles, terraza de 9 m², plaza de garaje opcional.'],
      ['3 dormitorios', 'desde 289 000 €', '96 m² útiles, dos baños y terraza de 14 m².'],
      ['Ático', 'desde 412 000 €', '118 m² útiles con terraza privada de 45 m² y acceso a cubierta.']],
    faq: [
      ['¿Cuándo se entrega?', 'Primer trimestre de 2027, con hitos publicados en la web cada mes.'],
      ['¿Qué reserva hace falta?', 'Seis mil euros para bloquear la vivienda, descontables del precio final.'],
      ['¿Se puede modificar la distribución?', 'Sí, hasta el cierre de tabiquería. El plazo se publica en tu área privada.'],
    ],
  },
  '3d-escuela-musica-cadencia': {
    services: [
      ['Clases individuales', 'Cuarenta y cinco minutos semanales con profesor especialista en tu instrumento.'],
      ['Grupos y combos', 'Toca con otros desde el primer trimestre. Ensayo dirigido de noventa minutos.'],
      ['Sala de ensayo', 'Cinco salas insonorizadas con backline, incluidas para el alumnado.'],
    ],
    works: [
      ['Muestra de invierno', 'Veintidós combos en sala real, con técnico de sonido y entrada libre.'],
      ['Taller de improvisación', 'Cuatro sábados sobre estándares de jazz, abierto a todos los niveles.'],
      ['Grabación de aula', 'Cada combo graba dos temas al año en estudio con mezcla incluida.'],
    ],
    plans: [['Clase suelta', '32 €', 'Sesión individual de 45 min para probar sin matricularte.'],
      ['Mensual individual', '96 €/mes', 'Cuatro clases, acceso a sala de ensayo y muestras incluidas.'],
      ['Mensual completo', '138 €/mes', 'Clase individual más combo semanal y grabación anual.']],
    faq: [
      ['¿Hay edad mínima?', 'Desde los siete años. Los adultos son la mitad del alumnado.'],
      ['¿Necesito instrumento propio?', 'Para practicar en casa sí. En la escuela hay backline disponible.'],
      ['¿Se paga matrícula?', 'Una vez al año, treinta euros, que cubren seguro y material.'],
    ],
  },
  '3d-biotech-celmira-labs': {
    services: [
      ['Paneles genéticos', 'Secuenciación de nueva generación con informe interpretado por genetistas.'],
      ['Farmacogenética', 'Perfil de metabolización para ajustar dosis y evitar reacciones adversas.'],
      ['Servicio a hospitales', 'Integración con historia clínica y validación por facultativo en 72 horas.'],
    ],
    works: [
      ['Panel cardiovascular', 'Ciento doce genes asociados a miocardiopatías y arritmias hereditarias.'],
      ['Panel oncológico', 'Trescientos cuarenta genes de predisposición y somáticos en tejido.'],
      ['Cribado neonatal ampliado', 'Detección precoz de cuarenta enfermedades metabólicas tratables.'],
    ],
    plans: [['Consulta genética', '90 €', 'Cuarenta y cinco minutos con genetista clínico, presencial u online.'],
      ['Panel dirigido', 'desde 420 €', 'Secuenciación, análisis bioinformático e informe interpretado.'],
      ['Convenio hospitalario', 'a convenir', 'Volumen anual, integración técnica y acuerdo de nivel de servicio.']],
    faq: [
      ['¿Qué muestra hace falta?', 'Sangre periférica o saliva, según el panel. Enviamos el kit a domicilio.'],
      ['¿Quién interpreta el resultado?', 'Un genetista clínico colegiado, y siempre hay consulta de resultados.'],
      ['¿Qué pasa con mis datos?', 'Se tratan bajo RGPD, con consentimiento explícito y derecho de supresión.'],
    ],
  },
};

/* ------------------------------------------------------------------ *
 *  Renderizado
 * ------------------------------------------------------------------ */

const esc = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Navegación común: es lo que enlaza las cinco páginas entre sí. */
function nav(project, current) {
  const links = PAGE_PLAN.map((page) => {
    const active = page.file === current;
    return `        <a href="${page.file}"${active ? ' aria-current="page"' : ''}>${page.nav}</a>`;
  }).join('\n');

  return `  <header class="site-header" data-header>
    <a class="brand" href="index.html" aria-label="${esc(project.brand)} — inicio">
      <span class="brand-mark" aria-hidden="true">${esc(project.initials)}</span>
      <span class="brand-name">${esc(project.brand)}</span>
    </a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="nav-primary">
      <span class="sr-only">Abrir menú</span><span class="nav-bars" aria-hidden="true"></span>
    </button>
    <nav id="nav-primary" class="nav-links" aria-label="Navegación principal">
${links}
    </nav>
    <a class="btn btn-primary nav-cta" href="contacto.html">Pedir cita</a>
  </header>`;
}

function footer(project) {
  const links = PAGE_PLAN.map((page) => `        <li><a href="${page.file}">${page.nav}</a></li>`).join('\n');
  return `  <footer class="site-footer">
    <div class="footer-grid">
      <div>
        <p class="brand-mark" aria-hidden="true">${esc(project.initials)}</p>
        <p class="footer-brand">${esc(project.brand)}</p>
        <p class="muted">${esc(project.sector)}</p>
      </div>
      <nav aria-label="Navegación del pie">
        <h2 class="footer-title">Secciones</h2>
        <ul class="footer-list">
${links}
        </ul>
      </nav>
      <div>
        <h2 class="footer-title">Contacto</h2>
        <ul class="footer-list">
          <li><a href="mailto:hola@ejemplo.com">hola@ejemplo.com</a></li>
          <li><a href="tel:+34900000000">+34 900 000 000</a></li>
          <li class="muted">Lunes a viernes, 9:00–18:00</li>
        </ul>
      </div>
    </div>
    <p class="footer-legal muted">
      Demostración de plantilla. Los datos de contacto y las cifras son de ejemplo.
    </p>
  </footer>`;
}

/** Bloques de contenido reutilizables. */
const block = {
  cards: (title, intro, items) => `    <section class="section">
      <div class="section-head reveal">
        <h2>${esc(title)}</h2>
        <p class="muted">${esc(intro)}</p>
      </div>
      <div class="card-grid">
${items.map(([name, text]) => `        <article class="card reveal">
          <h3>${esc(name)}</h3>
          <p>${esc(text)}</p>
        </article>`).join('\n')}
      </div>
    </section>`,

  stats: (items) => `    <section class="section stats-strip" aria-label="Cifras destacadas">
${items.map(([value, label]) => `      <div class="stat reveal">
        <p class="stat-value">${esc(value)}</p>
        <p class="muted">${esc(label)}</p>
      </div>`).join('\n')}
    </section>`,

  pricing: (title, intro, plans) => `    <section class="section">
      <div class="section-head reveal">
        <h2>${esc(title)}</h2>
        <p class="muted">${esc(intro)}</p>
      </div>
      <div class="card-grid">
${plans.map(([name, price, text], index) => `        <article class="card plan reveal${index === 1 ? ' plan-featured' : ''}">
          ${index === 1 ? '<p class="plan-badge">Más elegido</p>' : ''}
          <h3>${esc(name)}</h3>
          <p class="plan-price">${esc(price)}</p>
          <p>${esc(text)}</p>
          <a class="btn btn-ghost" href="contacto.html">Solicitar</a>
        </article>`).join('\n')}
      </div>
    </section>`,

  faq: (items) => `    <section class="section">
      <div class="section-head reveal">
        <h2>Preguntas frecuentes</h2>
      </div>
      <div class="faq">
${items.map(([q, a]) => `        <details class="reveal">
          <summary>${esc(q)}</summary>
          <p>${esc(a)}</p>
        </details>`).join('\n')}
      </div>
    </section>`,

  cta: (text) => `    <section class="section cta-band reveal">
      <h2>${esc(text)}</h2>
      <a class="btn btn-primary" href="contacto.html">Hablemos</a>
    </section>`,

  form: () => `    <section class="section">
      <div class="form-wrap">
        <form class="contact-form reveal" novalidate>
          <h2>Escríbenos</h2>
          <div class="field">
            <label for="nombre">Nombre</label>
            <input id="nombre" name="nombre" type="text" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="email">Correo electrónico</label>
            <input id="email" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="mensaje">¿En qué podemos ayudarte?</label>
            <textarea id="mensaje" name="mensaje" rows="5" required></textarea>
          </div>
          <button class="btn btn-primary" type="submit">Enviar mensaje</button>
          <p class="form-note muted" data-form-note role="status"></p>
        </form>
        <aside class="contact-aside reveal">
          <h2>Dónde estamos</h2>
          <p class="muted">Calle de ejemplo 24<br>28001 Madrid</p>
          <h3>Horario</h3>
          <p class="muted">Lunes a viernes, 9:00–18:00<br>Sábados con cita previa</p>
          <h3>Respuesta</h3>
          <p class="muted">Contestamos en menos de 24 horas laborables.</p>
        </aside>
      </div>
    </section>`,
};

/** Compone una página completa. */
function renderPage(project, page) {
  const detail = DETAIL[project.slug];
  const isHome = page.kind === 'home';
  const titles = {
    home: `${project.brand} | ${project.sector}`,
    services: `Servicios | ${project.brand}`,
    work: `Proyectos | ${project.brand}`,
    pricing: `Precios | ${project.brand}`,
    contact: `Contacto | ${project.brand}`,
  };
  const heads = {
    services: ['Lo que hacemos', 'Tres líneas de trabajo, con alcance y plazo definidos antes de empezar.'],
    work: ['Trabajos recientes', 'Una selección de proyectos entregados, con su contexto y resultado.'],
    pricing: ['Precios', 'Tarifas orientativas. El presupuesto final siempre se cierra por escrito.'],
    contact: ['Contacto', 'Cuéntanos qué necesitas y te respondemos con una propuesta concreta.'],
  };

  let main = '';
  if (isHome) {
    main = `    <section class="hero">
      <canvas id="scene-canvas" aria-label="Escena tridimensional decorativa de ${esc(project.sector.toLowerCase())}"></canvas>
      <div class="hero-inner">
        <p class="eyebrow reveal">${esc(project.hero.eyebrow)}</p>
        <h1 class="reveal">${esc(project.hero.title)}</h1>
        <p class="hero-text reveal">${esc(project.hero.text)}</p>
        <div class="hero-actions reveal">
          <a class="btn btn-primary" href="servicios.html">Ver servicios</a>
          <a class="btn btn-ghost" href="proyectos.html">Ver proyectos</a>
        </div>
      </div>
      <button class="scene-toggle" type="button" data-scene-toggle aria-pressed="true">Pausar animación</button>
    </section>
${block.stats(project.stats)}
${block.cards('Cómo trabajamos', 'Un proceso corto, con puntos de control claros.', detail.services)}
${block.cta('¿Empezamos por una primera conversación?')}`;
  } else {
    const [h1, intro] = heads[page.kind];
    main = `    <section class="page-hero">
      <div class="hero-inner">
        <p class="eyebrow reveal">${esc(project.brand)}</p>
        <h1 class="reveal">${esc(h1)}</h1>
        <p class="hero-text reveal">${esc(intro)}</p>
      </div>
    </section>`;

    if (page.kind === 'services') {
      main += `\n${block.cards('Servicios', 'Cada uno con entregables definidos.', detail.services)}\n${block.faq(detail.faq)}\n${block.cta('Cuéntanos tu caso y te decimos si encajamos.')}`;
    } else if (page.kind === 'work') {
      main += `\n${block.cards('Proyectos', 'Casos reales del último año.', detail.works)}\n${block.stats(project.stats)}\n${block.cta('¿Quieres un proyecto parecido?')}`;
    } else if (page.kind === 'pricing') {
      main += `\n${block.pricing('Planes', 'Sin permanencia y sin costes ocultos.', detail.plans)}\n${block.faq(detail.faq)}`;
    } else {
      main += `\n${block.form()}`;
    }
  }

  const description = isHome
    ? project.hero.text
    : `${heads[page.kind][1]} ${project.brand}, ${project.sector.toLowerCase()}.`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titles[page.kind])}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="keywords" content="${esc(project.tags.join(', '))}">
  <meta property="og:title" content="${esc(titles[page.kind])}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
${nav(project, page.file)}
  <main id="contenido">
${main}
  </main>
${footer(project)}
${isHome ? `  <script src="${THREE_CDN}" defer></script>\n  <script src="scene.js" defer></script>\n` : ''}  <script src="ui.js" defer></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ *
 *  Hoja de estilos
 * ------------------------------------------------------------------ */

function renderCss(project) {
  const p = project.palette;
  return `/* ${project.brand} — ${project.sector}
   Generado por scripts/add-3d-multipage-web-pages.mjs */

:root {
  --bg: ${p.bg};
  --surface: ${p.surface};
  --accent: ${p.accent};
  --accent-2: ${p.accent2};
  --text: ${p.text};
  --muted: ${p.muted};
  --radius: 14px;
  --maxw: 1120px;
  --shadow: 0 18px 48px rgba(0, 0, 0, .38);
}

*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: "Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img { max-width: 100%; display: block; }
a { color: inherit; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

.skip-link {
  position: absolute; left: -999px; top: 0; z-index: 100;
  background: var(--accent); color: #111; padding: .7rem 1.1rem; border-radius: 0 0 var(--radius) 0;
}
.skip-link:focus { left: 0; }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

/* ---------- Cabecera ---------- */

.site-header {
  position: sticky; top: 0; z-index: 40;
  display: flex; align-items: center; gap: 1rem;
  padding: .9rem clamp(1rem, 4vw, 2.5rem);
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
}

.brand { display: flex; align-items: center; gap: .6rem; text-decoration: none; font-weight: 700; }
.brand-mark {
  display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #10100f; font-weight: 800; font-size: .85rem; letter-spacing: .02em;
}
.brand-name { letter-spacing: -.01em; }

.nav-links { display: flex; gap: 1.15rem; margin-left: auto; }
.nav-links a {
  text-decoration: none; color: var(--muted); font-size: .95rem;
  padding: .35rem 0; border-bottom: 2px solid transparent; transition: color .18s, border-color .18s;
}
.nav-links a:hover { color: var(--text); }
.nav-links a[aria-current="page"] { color: var(--text); border-bottom-color: var(--accent); }

.nav-cta { margin-left: .4rem; }

.nav-toggle {
  display: none; margin-left: auto; background: transparent; border: 1px solid color-mix(in srgb, var(--text) 22%, transparent);
  border-radius: 10px; width: 42px; height: 38px; cursor: pointer;
}
.nav-bars, .nav-bars::before, .nav-bars::after {
  display: block; width: 18px; height: 2px; background: var(--text); margin: 0 auto; position: relative;
}
.nav-bars::before, .nav-bars::after { content: ""; position: absolute; left: 0; }
.nav-bars::before { top: -6px; } .nav-bars::after { top: 6px; }

/* ---------- Botones ---------- */

.btn {
  display: inline-block; text-decoration: none; cursor: pointer;
  padding: .7rem 1.25rem; border-radius: 999px; font-weight: 600; font-size: .95rem;
  border: 1px solid transparent; transition: transform .16s, opacity .16s, background .16s;
}
.btn:hover { transform: translateY(-1px); }
.btn-primary { background: var(--accent); color: #12110f; }
.btn-ghost { border-color: color-mix(in srgb, var(--text) 28%, transparent); color: var(--text); }
.btn-ghost:hover { background: color-mix(in srgb, var(--text) 8%, transparent); }

/* ---------- Hero ---------- */

.hero { position: relative; min-height: min(88vh, 760px); display: grid; align-items: center; overflow: hidden; }
#scene-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.hero::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(120% 80% at 20% 20%, transparent 30%, var(--bg) 92%);
}
.hero-inner { position: relative; z-index: 2; width: min(var(--maxw), 92vw); margin-inline: auto; padding: 4rem 0; }
.page-hero { padding: clamp(3rem, 8vw, 6rem) 0 1rem; }
.page-hero .hero-inner { padding-block: 0; }

.eyebrow {
  text-transform: uppercase; letter-spacing: .16em; font-size: .74rem;
  color: var(--accent); margin: 0 0 .9rem;
}
h1 { font-size: clamp(2.1rem, 5.2vw, 3.6rem); line-height: 1.08; margin: 0 0 1.1rem; max-width: 18ch; letter-spacing: -.02em; }
.hero-text { max-width: 56ch; color: var(--muted); font-size: 1.06rem; }
.hero-actions { display: flex; flex-wrap: wrap; gap: .8rem; margin-top: 1.8rem; }

.scene-toggle {
  position: absolute; right: clamp(1rem, 4vw, 2.5rem); bottom: 1.4rem; z-index: 3;
  background: color-mix(in srgb, var(--surface) 88%, transparent); color: var(--text);
  border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
  border-radius: 999px; padding: .5rem 1rem; font-size: .82rem; cursor: pointer;
}

/* ---------- Secciones ---------- */

.section { width: min(var(--maxw), 92vw); margin: clamp(3rem, 7vw, 5.5rem) auto; }
.section-head { max-width: 60ch; margin-bottom: 2rem; }
.section-head h2 { font-size: clamp(1.5rem, 3.2vw, 2.1rem); margin: 0 0 .6rem; letter-spacing: -.01em; }
.muted { color: var(--muted); }

.card-grid { display: grid; gap: 1.1rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.card {
  background: var(--surface); border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow);
  transition: transform .2s, border-color .2s;
}
.card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--accent) 45%, transparent); }
.card h3 { margin: 0 0 .5rem; font-size: 1.12rem; }
.card p { margin: 0; color: var(--muted); }

.stats-strip { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
.stat {
  background: color-mix(in srgb, var(--surface) 70%, transparent);
  border-left: 3px solid var(--accent); border-radius: 0 var(--radius) var(--radius) 0; padding: 1.1rem 1.3rem;
}
.stat-value { font-size: 1.7rem; font-weight: 700; margin: 0; letter-spacing: -.02em; }
.stat p { margin: 0; }

.plan { display: flex; flex-direction: column; gap: .7rem; }
.plan-featured { border-color: var(--accent); }
.plan-badge {
  align-self: flex-start; margin: 0; font-size: .72rem; text-transform: uppercase; letter-spacing: .12em;
  background: var(--accent); color: #12110f; padding: .2rem .6rem; border-radius: 999px;
}
.plan-price { font-size: 1.55rem; font-weight: 700; margin: 0; color: var(--accent); }
.plan .btn { margin-top: auto; align-self: flex-start; }

.faq { display: grid; gap: .7rem; }
.faq details {
  background: var(--surface); border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  border-radius: var(--radius); padding: 1rem 1.2rem;
}
.faq summary { cursor: pointer; font-weight: 600; }
.faq p { margin: .7rem 0 0; color: var(--muted); }

.cta-band {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.2rem;
  background: linear-gradient(120deg, color-mix(in srgb, var(--accent) 22%, var(--surface)), var(--surface));
  border-radius: var(--radius); padding: 2rem clamp(1.2rem, 4vw, 2.4rem);
}
.cta-band h2 { margin: 0; font-size: clamp(1.25rem, 2.6vw, 1.75rem); }

/* ---------- Formulario ---------- */

.form-wrap { display: grid; gap: 1.4rem; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); }
.contact-form, .contact-aside {
  background: var(--surface); border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  border-radius: var(--radius); padding: 1.7rem;
}
.contact-form h2, .contact-aside h2 { margin-top: 0; }
.contact-aside h3 { margin-bottom: .2rem; font-size: 1rem; }
.field { display: grid; gap: .35rem; margin-bottom: 1rem; }
.field label { font-size: .9rem; }
.field input, .field textarea {
  background: color-mix(in srgb, var(--bg) 70%, transparent); color: var(--text);
  border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
  border-radius: 10px; padding: .7rem .85rem; font: inherit; width: 100%;
}
.field input:focus, .field textarea:focus { border-color: var(--accent); outline: none; }
.form-note { min-height: 1.4em; margin: .8rem 0 0; }

/* ---------- Pie ---------- */

.site-footer {
  border-top: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
  padding: 2.6rem clamp(1rem, 4vw, 2.5rem) 1.6rem; margin-top: 3rem;
}
.footer-grid {
  width: min(var(--maxw), 92vw); margin-inline: auto;
  display: grid; gap: 1.8rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.footer-brand { font-weight: 700; margin: .6rem 0 .2rem; }
.footer-title { font-size: .8rem; text-transform: uppercase; letter-spacing: .14em; color: var(--muted); margin: 0 0 .7rem; }
.footer-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .45rem; }
.footer-list a { text-decoration: none; color: var(--muted); }
.footer-list a:hover { color: var(--text); }
.footer-legal { width: min(var(--maxw), 92vw); margin: 2rem auto 0; font-size: .82rem; }

/* ---------- Animación de entrada ---------- */

.reveal { opacity: 0; transform: translateY(14px); transition: opacity .5s ease, transform .5s ease; }
.reveal.visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; } }

/* ---------- Responsive ---------- */

@media (max-width: 860px) {
  .form-wrap { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .nav-toggle { display: block; }
  .nav-cta { display: none; }
  .nav-links {
    position: absolute; top: 100%; left: 0; right: 0;
    flex-direction: column; gap: 0; padding: .5rem clamp(1rem, 4vw, 2.5rem) 1.2rem;
    background: var(--bg); border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
    display: none;
  }
  .nav-links.is-open { display: flex; }
  .nav-links a { padding: .7rem 0; }
  h1 { max-width: none; }
  .cta-band { flex-direction: column; align-items: flex-start; }
}
`;
}

/* ------------------------------------------------------------------ *
 *  Escena Three.js
 * ------------------------------------------------------------------ */

/** Geometría propia de cada sector. Devuelve el cuerpo de `buildSubject()`. */
const SCENE_BODY = {
  gem: `  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.5, 0),
    new THREE.MeshStandardMaterial({ color: ACCENT, metalness: .85, roughness: .12, flatShading: true })
  );
  group.add(gem);
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.3 + i * .45, .015, 12, 90),
      new THREE.MeshStandardMaterial({ color: ACCENT2, metalness: .6, roughness: .3 })
    );
    ring.rotation.set(Math.PI / 2 + i * .35, i * .5, 0);
    group.add(ring);
  }`,

  terrain: `  const geo = new THREE.PlaneGeometry(11, 11, 60, 60);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, Math.sin(x * .55) * .55 + Math.cos(y * .42) * .48 + Math.sin((x + y) * .22) * .3);
  }
  geo.computeVertexNormals();
  const land = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: ACCENT2, roughness: .92, metalness: .04, wireframe: false, flatShading: true,
  }));
  land.rotation.x = -Math.PI / 2.1;
  land.position.y = -1.1;
  group.add(land);
  const mesh = new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({
    color: ACCENT, wireframe: true, transparent: true, opacity: .18,
  }));
  mesh.rotation.copy(land.rotation);
  mesh.position.y = -1.06;
  group.add(mesh);`,

  orbit: `  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.25, 1),
    new THREE.MeshStandardMaterial({ color: ACCENT, roughness: .28, metalness: .45, flatShading: true })
  );
  group.add(core);
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2;
    const r = 2.6 + (i % 3) * .5;
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(.11, 14, 14),
      new THREE.MeshStandardMaterial({ color: ACCENT2, emissive: ACCENT2, emissiveIntensity: .35 })
    );
    dot.position.set(Math.cos(a) * r, Math.sin(a * 1.7) * .9, Math.sin(a) * r);
    group.add(dot);
  }`,

  kinetic: `  for (let i = 0; i < 14; i += 1) {
    const h = .6 + (i % 5) * .65;
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(.36, h, .36),
      new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? ACCENT : ACCENT2, roughness: .38, metalness: .5 })
    );
    const a = (i / 14) * Math.PI * 2;
    bar.position.set(Math.cos(a) * 2.7, h / 2 - 1.2, Math.sin(a) * 2.7);
    bar.userData.base = h / 2 - 1.2;
    bar.userData.phase = i * .45;
    group.add(bar);
  }`,

  globe: `  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 42, 42),
    new THREE.MeshStandardMaterial({ color: ACCENT2, roughness: .68, metalness: .15, wireframe: true, transparent: true, opacity: .5 })
  );
  group.add(globe);
  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(1.83, 36, 36),
    new THREE.MeshStandardMaterial({ color: BG, roughness: .95, metalness: 0 })
  );
  group.add(inner);
  for (let i = 0; i < 9; i += 1) {
    const a = (i / 9) * Math.PI * 2;
    const pin = new THREE.Mesh(
      new THREE.ConeGeometry(.08, .34, 10),
      new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: .4 })
    );
    const lat = (i % 4) * .5 - .7;
    pin.position.set(Math.cos(a) * 1.95 * Math.cos(lat), Math.sin(lat) * 1.95, Math.sin(a) * 1.95 * Math.cos(lat));
    pin.lookAt(0, 0, 0);
    pin.rotateX(Math.PI / 2);
    group.add(pin);
  }`,

  helix: `  for (let i = 0; i < 46; i += 1) {
    const t = i / 46;
    const bean = new THREE.Mesh(
      new THREE.SphereGeometry(.17, 16, 12),
      new THREE.MeshStandardMaterial({ color: i % 2 ? ACCENT : ACCENT2, roughness: .55, metalness: .2 })
    );
    bean.scale.set(1, .72, 1.25);
    const a = t * Math.PI * 6;
    bean.position.set(Math.cos(a) * 1.7, t * 4.4 - 2.2, Math.sin(a) * 1.7);
    group.add(bean);
  }`,

  towers: `  const layout = [[-2.4, -1, 3.4], [-.9, 1.1, 2.2], [.8, -1.6, 4.3], [2.5, .7, 2.8], [-3.4, 1.9, 1.7], [3.6, -2.1, 2.1]];
  layout.forEach(([x, z, h], i) => {
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(.95, h, .95),
      new THREE.MeshStandardMaterial({ color: i % 2 ? ACCENT2 : ACCENT, roughness: .42, metalness: .35 })
    );
    tower.position.set(x, h / 2 - 1.6, z);
    group.add(tower);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(tower.geometry),
      new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: .35 })
    );
    edges.position.copy(tower.position);
    group.add(edges);
  });
  const grid = new THREE.GridHelper(14, 14, ACCENT, ACCENT2);
  grid.material.transparent = true;
  grid.material.opacity = .16;
  grid.position.y = -1.62;
  group.add(grid);`,

  waveform: `  for (let i = 0; i < 40; i += 1) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(.16, 1, .16),
      new THREE.MeshStandardMaterial({ color: i % 4 === 0 ? ACCENT : ACCENT2, roughness: .35, metalness: .45 })
    );
    bar.position.set(i * .3 - 5.85, 0, Math.sin(i * .4) * .8);
    bar.userData.phase = i * .32;
    group.add(bar);
  }`,

  dna: `  const strandMat = new THREE.MeshStandardMaterial({ color: ACCENT, roughness: .34, metalness: .4 });
  const strandMat2 = new THREE.MeshStandardMaterial({ color: ACCENT2, roughness: .34, metalness: .4 });
  for (let i = 0; i < 34; i += 1) {
    const t = i / 34;
    const a = t * Math.PI * 4;
    const y = t * 5 - 2.5;
    const p1 = new THREE.Vector3(Math.cos(a) * 1.25, y, Math.sin(a) * 1.25);
    const p2 = new THREE.Vector3(Math.cos(a + Math.PI) * 1.25, y, Math.sin(a + Math.PI) * 1.25);
    [[p1, strandMat], [p2, strandMat2]].forEach(([p, mat]) => {
      const node = new THREE.Mesh(new THREE.SphereGeometry(.15, 14, 14), mat);
      node.position.copy(p);
      group.add(node);
    });
    if (i % 2 === 0) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, p1.distanceTo(p2), 8), strandMat2);
      rung.position.copy(p1.clone().add(p2).multiplyScalar(.5));
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -a;
      group.add(rung);
    }
  }`,
};

function renderScene(project) {
  const hex = (value) => `0x${value.replace('#', '')}`;
  return `/* Escena 3D de ${project.brand}. Generada por scripts/add-3d-multipage-web-pages.mjs */
(function () {
  'use strict';

  var canvas = document.getElementById('scene-canvas');
  // Sin canvas o sin Three.js la página sigue siendo perfectamente usable:
  // el hero es HTML y el canvas solo decora.
  if (!canvas || typeof window.THREE === 'undefined') return;

  var ACCENT = ${hex(project.palette.accent)};
  var ACCENT2 = ${hex(project.palette.accent2)};
  var BG = ${hex(project.palette.bg)};

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = !reduced;
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, 0.055);

  var camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.set(0, 1.1, 8.4);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  scene.add(new THREE.HemisphereLight(0xffffff, BG, 0.85));
  var key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(4, 7, 6);
  scene.add(key);
  var rim = new THREE.PointLight(ACCENT, 3.2, 26);
  rim.position.set(-5, 2.4, 3.5);
  scene.add(rim);

  var group = new THREE.Group();
  scene.add(group);

  function buildSubject() {
${SCENE_BODY[project.scene]}
  }
  buildSubject();

  // Polvo de fondo: da profundidad sin coste apreciable.
  var dustGeo = new THREE.BufferGeometry();
  var dust = [];
  for (var i = 0; i < 220; i += 1) {
    dust.push((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 18);
  }
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dust, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: ACCENT2, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false,
  })));

  function resize() {
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('pointermove', function (event) {
    pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  var toggle = document.querySelector('[data-scene-toggle]');
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(running));
    toggle.textContent = running ? 'Pausar animación' : 'Reanudar animación';
    toggle.addEventListener('click', function () {
      running = !running;
      toggle.setAttribute('aria-pressed', String(running));
      toggle.textContent = running ? 'Pausar animación' : 'Reanudar animación';
    });
  }

  // Con la pestaña oculta no se dibuja: no tiene sentido gastar batería.
  var visible = true;
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; });

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;

    if (running) {
      var t = performance.now() * 0.001;
      group.rotation.y += 0.0032;
      group.position.y = Math.sin(t * 0.7) * 0.12;
      group.children.forEach(function (child) {
        if (child.userData && typeof child.userData.phase === 'number') {
          var s = 0.6 + Math.abs(Math.sin(t * 1.6 + child.userData.phase)) * 1.5;
          child.scale.y = s;
          child.position.y = typeof child.userData.base === 'number'
            ? child.userData.base + (s - 1) * 0.5
            : child.position.y;
        }
      });
    }

    group.rotation.x += (pointer.y * 0.16 - group.rotation.x) * 0.05;
    camera.position.x += (pointer.x * 1.1 - camera.position.x) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  frame();
})();
`;
}

/** JS común a las cinco páginas: menú, revelado y formulario. */
const UI_JS = `/* Interacciones comunes. Generado por scripts/add-3d-multipage-web-pages.mjs */
(function () {
  'use strict';

  var toggle = document.querySelector('[data-nav-toggle]');
  var links = document.getElementById('nav-primary');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var header = document.querySelector('[data-header]');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    // Sin soporte, el contenido se muestra directamente: nunca invisible.
    reveals.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var note = form.querySelector('[data-form-note]');
      var invalid = form.querySelector(':invalid');
      if (invalid) {
        invalid.focus();
        if (note) note.textContent = 'Revisa los campos obligatorios.';
        return;
      }
      if (note) note.textContent = 'Mensaje enviado. Te respondemos en menos de 24 horas.';
      form.reset();
    });
  }
})();
`;

/* ------------------------------------------------------------------ *
 *  Escritura
 * ------------------------------------------------------------------ */

/** Entrada del catálogo, con la forma exacta que consume `src/lib/web-pages.ts`. */
function catalogEntry(project, id) {
  const enBrand = project.brand;
  return {
    id: String(id),
    title: {
      es: `${enBrand} — ${project.sector} 3D`,
      en: `${enBrand} — 3D ${project.sector}`,
    },
    description: {
      es: {
        nombre: `${enBrand}, sitio 3D multipágina`,
        prompt: `Crea un sitio web de cinco páginas enlazadas para ${project.sector.toLowerCase()} con una escena Three.js en la portada, navegación persistente, secciones de servicios, proyectos, precios y contacto, formulario validado, animaciones al hacer scroll y diseño responsive con menú móvil.`,
        estilo: `Paleta ${project.palette.accent} y ${project.palette.accent2} sobre fondo oscuro, tipografía de sistema, tarjetas con sombra suave y microinteracciones discretas.`,
      },
      en: {
        name: `${enBrand}, multipage 3D site`,
        prompt: `Build a five-page linked website for a ${project.sector.toLowerCase()} business featuring a Three.js hero scene, persistent navigation, services, work, pricing and contact sections, a validated form, scroll reveal animations and a responsive layout with a mobile menu.`,
      },
    },
    imageUrl: '',
    imageHint: {
      es: `Sitio 3D de ${project.sector.toLowerCase()} con escena Three.js en la portada, navegación de cinco páginas y tarjetas sobre fondo oscuro`,
      en: `3D ${project.sector.toLowerCase()} website with a Three.js hero scene, five-page navigation and cards on a dark background`,
    },
    demoUrl: project.slug,
    stack: ['HTML', 'CSS', 'JavaScript', 'Three.js'],
    tags: project.tags,
    membership: 'Premium',
    price: project.price,
  };
}

async function main() {
  const catalog = JSON.parse(await readFile(CATALOG, 'utf8'));
  const existing = new Set(catalog.webPages.map((page) => page.demoUrl));
  const numericIds = catalog.webPages
    .map((page) => Number(page.id))
    .filter((value) => Number.isFinite(value));
  let nextId = Math.max(0, ...numericIds) + 1;

  let created = 0;
  let skipped = 0;
  let files = 0;

  for (const project of PROJECTS) {
    if (!DETAIL[project.slug]) {
      throw new Error(`Falta el contenido de ${project.slug} en DETAIL`);
    }
    if (!SCENE_BODY[project.scene]) {
      throw new Error(`Escena desconocida "${project.scene}" en ${project.slug}`);
    }

    const dir = path.join(WEBPAGES, project.slug);
    await mkdir(dir, { recursive: true });

    for (const page of PAGE_PLAN) {
      await writeFile(path.join(dir, page.file), renderPage(project, page));
      files += 1;
    }
    await writeFile(path.join(dir, 'styles.css'), renderCss(project));
    await writeFile(path.join(dir, 'scene.js'), renderScene(project));
    await writeFile(path.join(dir, 'ui.js'), UI_JS);
    files += 3;

    if (existing.has(project.slug)) {
      skipped += 1;
      continue;
    }
    catalog.webPages.push(catalogEntry(project, nextId));
    nextId += 1;
    created += 1;
  }

  await writeFile(CATALOG, `${JSON.stringify(catalog, null, 2)}\n`);

  console.log(`\n  ${files} ficheros escritos en public/webpages/`);
  console.log(`  ${created} entradas nuevas en el catálogo${skipped ? `, ${skipped} ya existían` : ''}`);
  console.log(`  total de páginas web en el catálogo: ${catalog.webPages.length}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

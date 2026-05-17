export const plans = [
  {
    id: "individual",
    name: "Individual",
    price: "10,99 €",
    featured: true,
    features: [
      "1 cuenta Premium",
      "Cancela cuando quieras",
      "Música sin conexión",
      "Reproduce canciones en cualquier orden",
      "Audio de alta calidad",
    ],
    legal:
      "Solo 10,99 € al mes después. Oferta disponible para quienes no hayan probado Premium. Se aplican condiciones.",
  },
  {
    id: "duo",
    name: "Duo",
    price: "14,99 €",
    featured: false,
    features: [
      "2 cuentas Premium",
      "Para parejas que viven en el mismo hogar",
      "Mix en pareja: una playlist para dos",
      "Cancela cuando quieras",
    ],
    legal: "Para parejas que viven en el mismo hogar. Se aplican condiciones.",
  },
  {
    id: "familiar",
    name: "Familiar",
    price: "17,99 €",
    featured: false,
    features: [
      "Hasta 6 cuentas Premium",
      "Control parental",
      "Spotify Kids",
      "Cancela cuando quieras",
    ],
    legal:
      "Hasta 6 cuentas Premium para miembros de un mismo hogar. Se aplican condiciones.",
  },
] as const;

export const features = [
  {
    icon: "🎵",
    title: "Reproduce lo que quieras",
    description:
      "Escucha canciones y podcasts sin límites. Sin anuncios que interrumpan.",
  },
  {
    icon: "🔇",
    title: "Sin anuncios",
    description: "Disfruta de tu música sin interrupciones publicitarias.",
  },
  {
    icon: "📥",
    title: "Reproduce sin conexión",
    description: "Descarga y escucha donde quieras, incluso sin internet.",
  },
  {
    icon: "🎧",
    title: "Audio en alta calidad",
    description: "Siente cada nota con audio de mayor fidelidad.",
  },
] as const;

export const footerColumns = [
  {
    title: "Compañía",
    links: ["Acerca de", "Empleo", "For the Record"],
  },
  {
    title: "Comunidades",
    links: ["Para artistas", "Desarrolladores", "Inversores"],
  },
  {
    title: "Enlaces útiles",
    links: ["Asistencia", "Reproductor web", "App móvil gratis"],
  },
  {
    title: "Planes",
    links: ["Premium Individual", "Premium Duo", "Premium Familiar"],
  },
] as const;

export const legalLinks = [
  "Legal",
  "Centro de privacidad",
  "Política de privacidad",
  "Cookies",
  "Información sobre los anuncios",
] as const;

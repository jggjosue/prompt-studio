'use client';

import { ReadabilityAnalyzer } from '@/components/readability-analyzer';

const SAMPLE_TEXT = `Prompt Studio es tu biblioteca de prompts de IA para video e imagen. Descubre ejemplos de calidad, inspírate y genera contenido profesional con modelos actuales. Navega por hubs de prompts, etiquetas y galerías con estructura clara. Cada página usa títulos descriptivos y párrafos breves para que humanos y buscadores entiendan el valor del catálogo.`;

const SAMPLE_HTML = `<h1>Calidad de contenido y UX</h1>
<h2>Contenido original y valioso</h2>
<h2>Evitar contenido duplicado</h2>
<h3>Revisión editorial</h3>
<h2>Experiencia de usuario</h2>`;

export function GuidelinesReadability() {
  return (
    <ReadabilityAnalyzer
      className="md:col-span-2"
      defaultText={SAMPLE_TEXT}
      defaultHtml={SAMPLE_HTML}
    />
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle2, Copy, ScanSearch, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

type AuditCategory = 'Errores' | 'Responsive' | 'Accesibilidad' | 'SEO' | 'Rendimiento' | 'Funcionalidad';
type AuditIssue = { category: AuditCategory; severity: 'Alta' | 'Media' | 'Baja'; title: string; detail: string; fix: string };

const CATEGORY_STYLES: Record<AuditCategory, string> = {
  Errores: 'text-red-600 bg-red-500/10', Responsive: 'text-blue-600 bg-blue-500/10', Accesibilidad: 'text-violet-600 bg-violet-500/10', SEO: 'text-emerald-600 bg-emerald-500/10', Rendimiento: 'text-amber-600 bg-amber-500/10', Funcionalidad: 'text-cyan-600 bg-cyan-500/10',
};

function auditCode(code: string): AuditIssue[] {
  if (!code.trim()) return [];
  const issues: AuditIssue[] = [];
  const add = (category: AuditCategory, severity: AuditIssue['severity'], title: string, detail: string, fix: string) => issues.push({ category, severity, title, detail, fix });
  const lower = code.toLowerCase();
  const document = typeof window !== 'undefined' ? new DOMParser().parseFromString(code, 'text/html') : null;

  const openingBraces = (code.match(/{/g) || []).length;
  const closingBraces = (code.match(/}/g) || []).length;
  if (openingBraces !== closingBraces) add('Errores', 'Alta', 'Llaves desbalanceadas', `Se encontraron ${openingBraces} llaves de apertura y ${closingBraces} de cierre.`, 'Corrige el bloque CSS o JavaScript incompleto antes de compilar.');
  if (/<script[^>]*src=["'][^"']+["'][^>]*>\s*[^<]+/i.test(code)) add('Errores', 'Media', 'Contenido dentro de script con src', 'Un script externo contiene además código inline que el navegador ignorará.', 'Separa el código inline en otro elemento script.');

  if (!lower.includes('name="viewport"') && !lower.includes("name='viewport'")) add('Responsive', 'Alta', 'Falta viewport móvil', 'La página puede renderizarse a escala de escritorio en teléfonos.', 'Añade meta viewport con width=device-width e initial-scale=1.');
  if (/width\s*:\s*(?:[8-9]\d{2}|\d{4,})px/i.test(code)) add('Responsive', 'Media', 'Anchos fijos grandes', 'Hay elementos con anchos rígidos que pueden provocar scroll horizontal.', 'Usa max-width, unidades fluidas y breakpoints.');
  if (!/@media/i.test(code) && !/\b(sm|md|lg|xl):[a-z]/.test(code)) add('Responsive', 'Media', 'Sin adaptación por breakpoint', 'No se detectaron media queries ni variantes responsive.', 'Define cambios de layout para móvil, tablet y escritorio.');

  if (document) {
    const imagesWithoutAlt = [...document.querySelectorAll('img')].filter(image => !image.hasAttribute('alt')).length;
    if (imagesWithoutAlt) add('Accesibilidad', 'Alta', 'Imágenes sin texto alternativo', `${imagesWithoutAlt} imagen(es) no tienen atributo alt.`, 'Añade alt descriptivo o alt vacío si son decorativas.');
    const unnamedButtons = [...document.querySelectorAll('button')].filter(button => !button.textContent?.trim() && !button.getAttribute('aria-label') && !button.getAttribute('title')).length;
    if (unnamedButtons) add('Accesibilidad', 'Alta', 'Botones sin nombre accesible', `${unnamedButtons} botón(es) no tienen texto ni aria-label.`, 'Añade un nombre accesible que describa la acción.');
    const inputsWithoutIdentity = [...document.querySelectorAll('input, select, textarea')].filter(field => !field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby') && !(field.id && document.querySelector(`label[for="${CSS.escape(field.id)}"]`))).length;
    if (inputsWithoutIdentity) add('Accesibilidad', 'Alta', 'Campos sin etiqueta', `${inputsWithoutIdentity} control(es) de formulario no tienen label asociado.`, 'Asocia un label mediante for/id o usa aria-label.');
    if (!document.documentElement.getAttribute('lang')) add('Accesibilidad', 'Media', 'Idioma sin declarar', 'El elemento html no declara el idioma del contenido.', 'Añade lang con el código de idioma correcto.');

    const title = document.querySelector('title')?.textContent?.trim();
    if (!title) add('SEO', 'Alta', 'Falta título SEO', 'No se encontró un title descriptivo.', 'Añade un title único y alineado con la intención de búsqueda.');
    if (!document.querySelector('meta[name="description"]')) add('SEO', 'Alta', 'Falta meta description', 'La página no define una descripción para resultados de búsqueda.', 'Añade una descripción única, clara y orientada al beneficio.');
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count !== 1) add('SEO', 'Media', 'Jerarquía H1 incorrecta', `Se encontraron ${h1Count} elementos h1.`, 'Mantén un H1 principal y organiza el resto con H2 y H3.');
    if (!document.querySelector('link[rel="canonical"]')) add('SEO', 'Baja', 'Falta URL canónica', 'No se encontró link canonical.', 'Define la URL canónica final para evitar duplicados.');

    const eagerImages = [...document.querySelectorAll('img')].filter((image, index) => index > 0 && image.getAttribute('loading') !== 'lazy').length;
    if (eagerImages) add('Rendimiento', 'Media', 'Imágenes sin lazy loading', `${eagerImages} imagen(es) fuera del contenido inicial se cargan inmediatamente.`, 'Añade loading="lazy" y dimensiones explícitas donde corresponda.');
    if (/data:image\/[a-z+]+;base64,/i.test(code)) add('Rendimiento', 'Media', 'Imagen embebida en Base64', 'Los recursos Base64 pueden aumentar el HTML y bloquear el renderizado.', 'Optimiza el recurso y sírvelo como archivo con caché.');
    const externalScripts = document.querySelectorAll('script[src]').length;
    if (externalScripts > 5) add('Rendimiento', 'Media', 'Demasiados scripts externos', `Se detectaron ${externalScripts} scripts externos.`, 'Elimina dependencias innecesarias y carga scripts no críticos con defer.');

    const codeIds = new Set([...code.matchAll(/(?:getElementById\s*\(\s*["']|#[a-zA-Z][\w-]*|addEventListener)/g)].map(match => match[0]));
    const inertButtons = [...document.querySelectorAll('button')].filter(button => {
      if (button.type === 'submit' || button.hasAttribute('onclick')) return false;
      const idReferenced = button.id && (lower.includes(`getelementbyid('${button.id}')`) || lower.includes(`getelementbyid("${button.id}")`) || lower.includes(`#${button.id}`));
      return !idReferenced && !button.closest('form') && codeIds.size === 0;
    }).length;
    if (inertButtons) add('Funcionalidad', 'Alta', 'Botones sin acción detectable', `${inertButtons} botón(es) no están vinculados a formulario, onclick o listener detectable.`, 'Conecta cada botón a una acción real y añade estados de carga, éxito y error.');
    const fakeLinks = [...document.querySelectorAll('a')].filter(link => !link.getAttribute('href') || ['#', 'javascript:void(0)'].includes(link.getAttribute('href') || '')).length;
    if (fakeLinks) add('Funcionalidad', 'Media', 'Enlaces sin destino', `${fakeLinks} enlace(s) utilizan un destino vacío o simulado.`, 'Usa una ruta válida o reemplaza el enlace por un botón con acción.');
  }
  return issues;
}

export function WebCodeAuditor({ onUseFixPrompt }: { onUseFixPrompt: (prompt: string) => void }) {
  const [code, setCode] = useState('');
  const [auditedCode, setAuditedCode] = useState('');
  const issues = useMemo(() => auditCode(auditedCode), [auditedCode]);
  const fixPrompt = useMemo(() => auditedCode ? `Audit and repair the following website source without removing working features.\n\nVerified findings:\n${issues.length ? issues.map((issue, index) => `${index + 1}. [${issue.severity}] ${issue.category} — ${issue.title}: ${issue.fix}`).join('\n') : 'No issues were detected by the static audit. Perform a careful manual review for runtime, cross-browser, accessibility, SEO, and performance problems.'}\n\nRequirements: fix root causes, preserve the visual intent, connect interactive controls to real behavior, maintain responsive design, explain material changes, and provide complete runnable code plus a verification checklist.\n\nSOURCE CODE:\n\`\`\`html\n${auditedCode}\n\`\`\`` : '', [auditedCode, issues]);

  return <section className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/5 p-4"><div className="mb-3 flex items-start gap-2"><ScanSearch className="mt-0.5 size-5 text-fuchsia-600" /><div><h3 className="text-sm font-bold">Auditor automático del resultado</h3><p className="text-xs text-muted-foreground">Pega HTML, CSS y JavaScript. El análisis es estático y no ejecuta código del usuario.</p></div></div><Textarea value={code} onChange={event => setCode(event.target.value)} placeholder="Pega aquí el código generado…" className="min-h-44 bg-background font-mono text-xs" /><Button type="button" disabled={!code.trim()} onClick={() => setAuditedCode(code)} className="mt-3 bg-fuchsia-600 text-white hover:bg-fuchsia-700"><ScanSearch className="mr-2 size-4" />Auditar código</Button>{auditedCode ? <div className="mt-4 space-y-3">{issues.length ? <><div className="flex flex-wrap gap-1.5">{Object.entries(issues.reduce<Record<string, number>>((counts, issue) => ({ ...counts, [issue.category]: (counts[issue.category] || 0) + 1 }), {})).map(([category, count]) => <span key={category} className={`rounded-full px-2 py-1 text-[10px] font-bold ${CATEGORY_STYLES[category as AuditCategory]}`}>{category}: {count}</span>)}</div><div className="grid gap-2 sm:grid-cols-2">{issues.map((issue, index) => <article key={`${issue.category}-${index}`} className="rounded-lg border bg-background p-3"><div className="flex items-center justify-between gap-2"><strong className="text-xs">{issue.title}</strong><span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${issue.severity === 'Alta' ? 'bg-red-500/10 text-red-600' : issue.severity === 'Media' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`}>{issue.severity}</span></div><p className="mt-1 text-[10px] text-muted-foreground">{issue.detail}</p><p className="mt-2 text-[10px]"><strong>Corrección:</strong> {issue.fix}</p></article>)}</div></> : <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 text-xs text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4" />No se detectaron problemas mediante las reglas estáticas disponibles. Aún se recomienda probar el código en un navegador.</div>}<div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3"><p className="flex items-center gap-1 text-xs font-bold"><AlertTriangle className="size-3.5 text-amber-600" />Prompt automático de corrección</p><p className="mt-2 line-clamp-4 whitespace-pre-line text-[10px] leading-4 text-muted-foreground">{fixPrompt}</p><div className="mt-2 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(fixPrompt)}><Copy className="mr-1 size-3" />Copiar prompt</Button><Button type="button" variant="outline" size="sm" onClick={() => onUseFixPrompt(fixPrompt)}><Sparkles className="mr-1 size-3" />Usar en el editor</Button></div></div></div> : null}</section>;
}

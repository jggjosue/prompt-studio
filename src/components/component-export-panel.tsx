'use client';

import { Button } from '@/components/ui/button';
import { useDailyCopyLimit } from '@/hooks/use-daily-copy-limit';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { Braces, Check, Code2, Download, ExternalLink, FileJson, FolderDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export type ComponentExportConfig = {
  id: string;
  type: string;
  title: string;
  primary: string;
  secondary: string;
  background: string;
  font: string;
  radius: number;
  spacing: number;
  shadow: string;
  heading: string;
  body: string;
  cta: string;
  motion: boolean;
  dark: boolean;
  fields?: string[];
  icon?: string;
};

const safe = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('{', '&#123;').replaceAll('}', '&#125;');
const componentName = (id: string) => id.split(/[^a-z0-9]+/i).filter(Boolean).map(part => part[0].toUpperCase() + part.slice(1)).join('') || 'CustomComponent';

function buildFiles(config: ComponentExportConfig) {
  const name = componentName(config.id);
  const shell = config.type === 'button'
    ? `<button className="component-action">${safe(config.cta)}</button>`
    : config.type === 'form' || config.type === 'login'
      ? `<form className="component-card" onSubmit={(event) => event.preventDefault()}><p className="eyebrow">${safe(config.title)}</p><h2>${safe(config.heading)}</h2><p>${safe(config.body)}</p>${(config.fields?.length?config.fields:['Email','Mensaje']).map((field,index,array)=>`<label>${safe(field)}${index===array.length-1?'<textarea required />':'<input required />'}</label>`).join('')}<button className="component-action">${safe(config.cta)}</button></form>`
      : config.type === 'header'
        ? `<header className="component-card component-header"><strong>${safe(config.heading)}</strong><nav><a href="#features">Producto</a><a href="#contact">Contacto</a></nav><button className="component-action">${safe(config.cta)}</button></header>`
        : config.type === 'sidebar' || config.type === 'navigation'
          ? `<aside className="component-card component-sidebar"><strong>${safe(config.heading)}</strong><nav>{['Overview','Projects','Settings'].map(item => <a href="#" key={item}>{item}</a>)}</nav></aside>`
          : `<article className="component-card"><p className="eyebrow">${safe(config.title)}</p><h2>${safe(config.heading)}</h2><p>${safe(config.body)}</p><button className="component-action">${safe(config.cta)}</button></article>`;
  const tsx = `'use client';\n\nimport './${config.id}.css';\n\nexport function ${name}() {\n  return (\n    <section className="component-shell">\n      ${shell}\n    </section>\n  );\n}\n`;
  const css = `:root {\n  --component-primary: ${config.primary};\n  --component-secondary: ${config.secondary};\n  --component-background: ${config.dark ? config.background : '#f8fafc'};\n  --component-foreground: ${config.dark ? '#f8fafc' : '#111827'};\n  --component-radius: ${config.radius}px;\n  --component-spacing: ${config.spacing}px;\n}\n.component-shell { padding: var(--component-spacing); background: var(--component-background); color: var(--component-foreground); font-family: ${config.font}, Arial, sans-serif; }\n.component-card { padding: var(--component-spacing); border: 1px solid color-mix(in srgb, var(--component-primary) 35%, transparent); border-radius: var(--component-radius); background: color-mix(in srgb, var(--component-background) 88%, white 12%); box-shadow: ${config.shadow === 'none' ? 'none' : config.shadow === 'glow' ? `0 0 45px ${config.primary}` : '0 22px 60px rgba(15,23,42,.22)'}; }\n.component-action { min-height: 44px; margin-top: 1rem; padding: .75rem 1.25rem; border: 0; border-radius: calc(var(--component-radius) * .55); color: white; font-weight: 800; background: linear-gradient(100deg, var(--component-primary), var(--component-secondary)); ${config.motion ? 'transition: transform .25s, filter .25s;' : ''} }\n${config.motion ? '.component-action:hover { transform: translateY(-3px); filter: brightness(1.08); }' : ''}\n.component-header { display: flex; align-items: center; gap: 1rem; }\n.component-header nav { display: flex; gap: 1rem; margin-left: auto; }\n.component-sidebar { width: min(260px, 100%); }\n.component-sidebar nav { display: grid; gap: .5rem; margin-top: 1.5rem; }\n.component-sidebar a { padding: .7rem; border-radius: calc(var(--component-radius) * .5); }\n.component-card label, .component-card input { display: block; width: 100%; margin-top: 1rem; }\n.component-card input { min-height: 44px; padding: .7rem; border: 1px solid #ffffff33; border-radius: calc(var(--component-radius) * .5); background: transparent; color: inherit; }\n.eyebrow { color: var(--component-primary); font-size: .75rem; font-weight: 900; text-transform: uppercase; letter-spacing: .2em; }\n@media (prefers-reduced-motion: reduce) { * { transition-duration: .001ms !important; } }\n`;
  const tailwind = `export const componentTheme = {\n  colors: { primary: '${config.primary}', secondary: '${config.secondary}', background: '${config.background}' },\n  borderRadius: { component: '${config.radius}px' },\n  spacing: { component: '${config.spacing}px' },\n};\n`;
  const registry = JSON.stringify({
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: config.id,
    type: 'registry:component',
    title: config.title,
    description: config.body,
    files: [{ path: `components/${config.id}.tsx`, content: tsx, type: 'registry:component' }, { path: `components/${config.id}.css`, content: css, type: 'registry:component' }],
  }, null, 2);
  return { name, tsx, css, tailwind, registry };
}

function downloadText(name: string, content: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ComponentExportPanel({ config }: { config: ComponentExportConfig }) {
  const { copyWithDailyLimit } = useDailyCopyLimit();
  const { runWithAccess } = useMembershipAccess();
  const [copied, setCopied] = useState<'tsx' | 'css' | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const files = buildFiles(config);
  const copy = async (kind: 'tsx' | 'css') => {
    const result = await copyWithDailyLimit(() => copyToClipboard(kind === 'tsx' ? files.tsx : `${files.css}\n\n${files.tailwind}`));
    if (result === 'copied') { setCopied(kind); window.setTimeout(() => setCopied(null), 1600); }
  };
  const downloadComponent = () => runWithAccess('Premium', () => void (async () => {
    const response = await fetch('/api/component-export/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: config.id, tsx: files.tsx, css: files.css, registry: files.registry }) });
    if (!response.ok) throw new Error('Component export failed');
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${config.id}.zip`; anchor.click(); URL.revokeObjectURL(url);
  })());
  const downloadRegistry = () => runWithAccess('Premium', () => downloadText(`${config.id}.registry.json`, files.registry, 'application/json'));
  const openStackBlitz = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://stackblitz.com/run';
    form.target = '_blank';
    const projectFiles: Record<string, string> = {
      'package.json': JSON.stringify({ scripts: { dev: 'vite --host 0.0.0.0' }, dependencies: { '@vitejs/plugin-react': 'latest', vite: 'latest', typescript: 'latest', react: 'latest', 'react-dom': 'latest' } }, null, 2),
      'index.html': '<div id="root"></div><script type="module" src="/src/main.tsx"></script>',
      'src/main.tsx': `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { ${files.name} } from './component';\ncreateRoot(document.getElementById('root')!).render(<${files.name} />);`,
      'src/component.tsx': files.tsx.replace(`'./${config.id}.css'`, `'./component.css'`),
      'src/component.css': files.css,
    };
    const fields: Record<string, string> = { 'project[title]': config.title, 'project[description]': 'Generated with Prompt Studio', 'project[template]': 'node', ...Object.fromEntries(Object.entries(projectFiles).map(([path, content]) => [`project[files][${path}]`, content])) };
    Object.entries(fields).forEach(([key, value]) => { const input = document.createElement('input'); input.type = 'hidden'; input.name = key; input.value = value; form.appendChild(input); });
    document.body.appendChild(form); form.submit(); form.remove();
  };
  const openSandbox = (provider: 'stackblitz' | 'codesandbox') => runWithAccess('Premium', () => void (async () => {
    if (provider === 'stackblitz') { openStackBlitz(); return; }
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    setOpening(provider);
    try {
      const response = await fetch('/api/component-export/sandbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, id: config.id, title: config.title, tsx: files.tsx, css: files.css }) });
      const result = await response.json() as { url?: string };
      if (!response.ok || !result.url) throw new Error('Sandbox export failed');
      if (popup) popup.location.href = result.url;
      else window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) { popup?.close(); throw error; } finally { setOpening(null); }
  })());
  return <div className="rounded-xl border bg-muted/30 p-3">
    <p className="text-xs font-black">Exportar código</p>
    <p className="mt-1 text-[10px] text-muted-foreground">Código sincronizado con la vista previa actual.</p>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <Button size="sm" variant="outline" onClick={() => void copy('tsx')}>{copied === 'tsx' ? <Check className="mr-1 size-3.5" /> : <Code2 className="mr-1 size-3.5" />}Copiar TSX</Button>
      <Button size="sm" variant="outline" onClick={() => void copy('css')}>{copied === 'css' ? <Check className="mr-1 size-3.5" /> : <Braces className="mr-1 size-3.5" />}CSS/Tailwind</Button>
      <Button size="sm" variant="outline" onClick={downloadComponent}><Download className="mr-1 size-3.5" />Componente</Button>
      <Button size="sm" variant="outline" onClick={downloadRegistry}><FileJson className="mr-1 size-3.5" />shadcn</Button>
      <Button size="sm" variant="outline" onClick={() => openSandbox('stackblitz')} disabled={opening !== null}><ExternalLink className="mr-1 size-3.5" />StackBlitz</Button>
      <Button size="sm" variant="outline" onClick={() => openSandbox('codesandbox')} disabled={opening !== null}><ExternalLink className="mr-1 size-3.5" />CodeSandbox</Button>
    </div>
    <Button asChild className="mt-2 w-full bg-violet-600 hover:bg-violet-700"><Link href="/page-composer"><FolderDown className="mr-2 size-4" />Descargar proyecto Next.js</Link></Button>
    <p className="mt-2 text-[9px] text-muted-foreground">Componente, Registry, sandboxes y proyecto requieren Premium.</p>
  </div>;
}

import { getServerSubscriptionStatus, hasDownloadPlan } from '@/lib/server-subscription-status';
import { NextResponse } from 'next/server';

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.slice(0, max) : '';
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'prompt-studio-component';

export async function POST(request: Request) {
  const status = await getServerSubscriptionStatus();
  if (!hasDownloadPlan(status)) return NextResponse.json({ error: 'Se requiere Premium.' }, { status: 403 });
  let raw: Record<string, unknown>;
  try { raw = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  const provider = raw.provider === 'codesandbox' ? raw.provider : null;
  const id = slug(clean(raw.id, 80));
  const title = clean(raw.title, 120) || 'Prompt Studio Component';
  const tsx = clean(raw.tsx, 30_000);
  const css = clean(raw.css, 30_000);
  if (!provider || !tsx || !css) return NextResponse.json({ error: 'Configuración incompleta.' }, { status: 400 });
  const files = {
    'package.json': { content: JSON.stringify({ scripts: { dev: 'vite --host 0.0.0.0' }, dependencies: { '@vitejs/plugin-react': 'latest', vite: 'latest', typescript: 'latest', react: 'latest', 'react-dom': 'latest' }, devDependencies: {} }, null, 2) },
    'index.html': { content: '<div id="root"></div><script type="module" src="/src/main.tsx"></script>' },
    'src/main.tsx': { content: `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { ${id.split('-').map(part => part[0]?.toUpperCase() + part.slice(1)).join('')} } from './component';\ncreateRoot(document.getElementById('root')!).render(<${id.split('-').map(part => part[0]?.toUpperCase() + part.slice(1)).join('')} />);\n` },
    'src/component.tsx': { content: tsx.replace(`'./${id}.css'`, `'./component.css'`) },
    'src/component.css': { content: css },
  };
  const endpoint = 'https://codesandbox.io/api/v1/sandboxes/define?json=1';
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files }) });
    if (!response.ok) return NextResponse.json({ error: 'El proveedor no pudo crear el sandbox.' }, { status: 502 });
    const result = await response.json() as Record<string, unknown>;
    const projectId = clean(result.id ?? result.sandbox_id, 160);
    if (!projectId) return NextResponse.json({ error: 'Respuesta inválida del proveedor.' }, { status: 502 });
    return NextResponse.json({ url: `https://codesandbox.io/s/${projectId}` });
  } catch { return NextResponse.json({ error: 'No se pudo conectar con el proveedor.' }, { status: 502 }); }
}

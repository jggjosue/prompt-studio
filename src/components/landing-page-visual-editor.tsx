'use client';

import EditorWorkspace from '@/components/editor/editor-workspace';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { createDocument, createNode, incrementalIds, insertNode, type EditorDocument } from '@/lib/editor/document';
import { ArrowLeft, PencilRuler } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

function makeLandingDocument(title: string, description: string): EditorDocument {
  const ids = incrementalIds();
  let document = createDocument(ids);
  const add = (type: string, parentId: string) => {
    const node = createNode(type, ids);
    const result = insertNode(document, node, parentId, document.nodes[parentId].children.length);
    if ('document' in result) document = result.document;
    return node.id;
  };
  const set = (id: string, props: Record<string, unknown>, styles: Record<string, string | number> = {}) => {
    const node = document.nodes[id];
    document = { ...document, nodes: { ...document.nodes, [id]: { ...node, props: { ...node.props, ...props }, styles: { ...node.styles, desktop: { ...(node.styles.desktop ?? {}), ...styles } } } } };
  };
  const hero = add('section', document.rootId); set(hero, {}, { background: 'linear-gradient(135deg, #16112b, #09090b)', paddingBlock: '88px' });
  const container = add('container', hero); set(container, {}, { maxWidth: '960px', textAlign: 'center' });
  const heading = add('heading', container); set(heading, { text: title }, { fontSize: '56px', color: '#ffffff', marginBottom: '18px' });
  const copy = add('text', container); set(copy, { text: description }, { fontSize: '19px', color: '#c4c4ce', marginBottom: '28px' });
  const cta = add('button', container); set(cta, { label: 'Comenzar ahora' }, { background: '#7c3aed', color: '#ffffff' });
  const features = add('section', document.rootId); set(features, {}, { background: '#0d0d12', paddingBlock: '72px' });
  const featuresContainer = add('container', features);
  const grid = add('grid', featuresContainer); set(grid, {}, { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px' });
  ['Personalizable', 'Responsive', 'Listo para publicar'].forEach(label => { const card = add('card', grid); set(card, {}, { background: '#17171f', padding: '24px' }); const cardHeading = add('heading', card); set(cardHeading, { text: label, level: 3 }, { color: '#ffffff', fontSize: '20px' }); const cardCopy = add('text', card); set(cardCopy, { text: 'Edita contenido, estilos y disposición visualmente.' }, { color: '#b4b4c0' }); });
  return document;
}

export function LandingPageVisualEditor({ slug, pageId, title, description }: { slug: string; pageId: string; title: string; description: string }) {
  const document = useMemo(() => makeLandingDocument(title, description), [title, description]);
  return <div className="flex min-h-screen flex-col bg-[#090a0f]"><Header /><main className="flex-1 px-3 py-3 sm:px-5 sm:py-5"><div className="mx-auto max-w-[1800px]"><div className="mb-3 flex items-center justify-between gap-3 px-1 text-white"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" asChild><Link href={`/landing-pages/${slug}`} aria-label="Volver a la landing"><ArrowLeft className="size-4" /></Link></Button><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-300">Landing editable</p><h1 className="text-sm font-bold">{title}</h1></div></div><span className="hidden text-xs text-zinc-400 sm:flex sm:items-center sm:gap-1"><PencilRuler className="size-3.5" /> Copia editable · Guardado automático</span></div><EditorWorkspace key={slug} name={`${title} · Canvas`} sourcePageId={pageId} initialDocument={document} /></div></main><Footer /></div>;
}

import { readFile, writeFile } from 'node:fs/promises';

const clients = [
  ['login-components/login-components-client.tsx', 'LoginPreview', 'login', 'item.title'],
  ['header-components/header-components-client.tsx', 'HeaderPreview', 'header', 'item.title'],
  ['text-components/text-components-client.tsx', 'TextPreview', 'text', 'item.title'],
  ['form-components/form-components-client.tsx', 'FormPreview', 'form', 'item.title'],
  ['button-components/button-components-client.tsx', 'DemoButton', 'button', 'item.title'],
  ['card-components/card-components-client.tsx', 'CardPreview', 'card', 'item.titleText'],
  ['navigation-components/navigation-components-client.tsx', 'NavigationPreview', 'navigation', 'item.title'],
  ['sidebar-components/sidebar-components-client.tsx', 'SidebarPreview', 'sidebar', 'item.title'],
];

for (const [relative, component, type, title] of clients) {
  const path = new URL(`../src/app/${relative}`, import.meta.url);
  let source = await readFile(path, 'utf8');
  if (!source.includes("@/components/static-component-preview")) {
    source = source.replace("'use client';", "'use client';\nimport { StaticComponentPreview } from '@/components/static-component-preview';");
  }
  const expression = new RegExp(`<${component}\\s+item=\\{item\\}\\s*/>`);
  if (expression.test(source)) source = source.replace(expression, `<StaticComponentPreview title={${title}} type="${type}" preview={item.preview} />`);
  await writeFile(path, source);
}

{
  const path = new URL('../src/components/global-responsive-preview.tsx', import.meta.url);
  let source = await readFile(path, 'utf8');
  source = source.replace(
    "[reduceMotion,setReduceMotion]=useState(false),[fullscreen,setFullscreen]",
    "[reduceMotion,setReduceMotion]=useState(false),[systemReduced,setSystemReduced]=useState(false),[pageVisible,setPageVisible]=useState(true),[fullscreen,setFullscreen]",
  );
  if (!source.includes("visibilitychange',syncVisibility")) {
    const marker = "},[]);const toggleFullscreen";
    const visibility = "},[]);useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),syncMotion=()=>setSystemReduced(media.matches),syncVisibility=()=>setPageVisible(document.visibilityState==='visible');syncMotion();syncVisibility();media.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',syncVisibility);return()=>{media.removeEventListener('change',syncMotion);document.removeEventListener('visibilitychange',syncVisibility)}},[]);const toggleFullscreen";
    if (!source.includes(marker)) throw new Error('Global preview effect marker not found');
    source = source.replace(marker, visibility);
  }
  source = source.replace(
    'data-reduce-motion={reduceMotion}>',
    'data-reduce-motion={reduceMotion||systemReduced} data-preview-paused={!pageVisible}>',
  );
  if (!source.includes('[data-preview-paused="true"]')) {
    source = source.replace(
      'scroll-behavior:auto!important}',
      'scroll-behavior:auto!important}[data-preview-paused="true"] .global-preview-content *{animation-play-state:paused!important;transition:none!important}',
    );
  }
  await writeFile(path, source);
}

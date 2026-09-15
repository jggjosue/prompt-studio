'use client';

import type { CodeLanguage, CodePreview } from '@/lib/web-page-code-preview';
import { LockKeyhole } from 'lucide-react';
import { useState } from 'react';

const LABELS: Record<CodeLanguage, string> = { html: 'HTML', css: 'CSS', javascript: 'JavaScript' };

function highlightedLine(line: string, language: CodeLanguage) {
  const pattern = language === 'html'
    ? /(<!--[\s\S]*?-->|<\/?[\w-]+|\s[\w-]+(?==)|"[^"]*"|'[^']*'|>|\/?>)/g
    : /(\/\*.*?\*\/|\/\/.*$|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|\b(?:const|let|var|function|return|if|else|for|new|class|display|color|background|position|transform|transition)\b|#[\da-fA-F]{3,8}|\b\d+(?:\.\d+)?(?:px|rem|em|%|s)?\b)/g;
  return line.split(pattern).filter(Boolean).map((token, index) => {
    let color = 'text-zinc-300';
    if (/^<!--|^\/\*|^\/\//.test(token)) color = 'text-zinc-500';
    else if (/^["'`]/.test(token)) color = 'text-emerald-300';
    else if (/^<\/?/.test(token) || /^(const|let|var|function|return|if|else|for|new|class)$/.test(token)) color = 'text-fuchsia-300';
    else if (/^\s[\w-]+$/.test(token) || /^(display|color|background|position|transform|transition)$/.test(token)) color = 'text-sky-300';
    else if (/^#|^\d/.test(token)) color = 'text-amber-300';
    return <span key={index} className={color}>{token}</span>;
  });
}

export function CodePreviewTabs({ previews, lockedLabel }: { previews: CodePreview[]; lockedLabel: string }) {
  const [active, setActive] = useState<CodeLanguage>(previews[0].language);
  const selected = previews.find(item => item.language === active) ?? previews[0];
  const hiddenLines = Math.max(0, selected.totalLines - selected.snippet.split('\n').length);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
      <div className="flex items-center gap-1 border-b border-zinc-800 px-3 pt-3">
        {previews.map(item => <button key={item.language} type="button" onClick={() => setActive(item.language)} className={`rounded-t-lg px-4 py-2 text-xs font-bold transition ${active === item.language ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}>{LABELS[item.language]}</button>)}
      </div>
      <pre className="max-h-80 overflow-auto p-5 text-xs leading-6 sm:text-sm"><code>{selected.snippet.split('\n').map((line, index) => <span key={index} className="block"><span className="mr-5 inline-block w-6 select-none text-right text-zinc-600">{index + 1}</span>{highlightedLine(line, selected.language)}</span>)}</code></pre>
      <div className="relative border-t border-zinc-800 bg-zinc-900/90 px-5 py-4 text-center text-sm text-zinc-300 before:pointer-events-none before:absolute before:bottom-full before:left-0 before:h-12 before:w-full before:bg-gradient-to-t before:from-zinc-950 before:to-transparent">
        <LockKeyhole className="mr-2 inline size-4 text-blue-400" aria-hidden="true" />
        {lockedLabel.replace('{count}', String(hiddenLines))}
      </div>
    </div>
  );
}

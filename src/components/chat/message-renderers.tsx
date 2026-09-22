'use client';

import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/optimized-image';
import { LazyVideo } from '@/components/lazy-video';
import { CodePreviewTabs } from '@/components/code-preview-tabs';
import type { CodePreview } from '@/lib/web-page-code-preview';
import type { ChatMessageResult } from '@/lib/chat-types';
import { Download, Repeat2, Bookmark } from 'lucide-react';

function downloadAsset(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function ImageResult({ result }: { result: ChatMessageResult }) {
  const urls = result.imageUrls ?? (result.imageUrl ? [result.imageUrl] : []);
  if (urls.length === 0) return null;

  return (
    <div className="space-y-3">
      {urls.map((url, i) => (
        <div key={url} className="group relative overflow-hidden rounded-xl border border-border/60">
          <OptimizedImage
            src={url}
            alt={`Imagen generada${urls.length > 1 ? ` - variación ${i + 1}` : ''}`}
            className="w-full object-contain"
          />
          {/* Hover actions */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5 opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => downloadAsset(url, `imagen-${i + 1}.png`)}
              className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Descargar imagen"
            >
              <Download className="h-3 w-3" />
              Descargar
            </button>
          </div>
        </div>
      ))}
      {result.creditsUsed !== undefined && (
        <p className="text-[11px] text-muted-foreground">
          {result.provider ? `${result.provider} · ` : ''}{result.creditsUsed} créditos usados
        </p>
      )}
    </div>
  );
}

export function VideoResult({ result }: { result: ChatMessageResult }) {
  if (!result.videoUrl) return null;

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-black">
        <LazyVideo
          src={result.videoUrl}
          className="w-full max-h-[480px]"
          autoPlay={false}
          controls
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => downloadAsset(result.videoUrl!, 'video-generado.mp4')}
          className="flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1 text-[11px] font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Descargar video"
        >
          <Download className="h-3 w-3" />
          Descargar
        </button>
      </div>
      {result.creditsUsed !== undefined && (
        <p className="text-[11px] text-muted-foreground">
          {result.provider ? `${result.provider} · ` : ''}{result.creditsUsed} créditos usados
        </p>
      )}
    </div>
  );
}

export function WebResult({ result }: { result: ChatMessageResult }) {
  if (!result.html) return null;

  const preview: CodePreview = {
    language: 'html',
    snippet: result.html,
    totalLines: result.html.split('\n').length,
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-border/60">
        <CodePreviewTabs previews={[preview]} lockedLabel="HTML generado" />
      </div>
      {result.creditsUsed !== undefined && (
        <p className="text-[11px] text-muted-foreground">
          {result.provider ? `${result.provider} · ` : ''}{result.creditsUsed} créditos usados
        </p>
      )}
    </div>
  );
}

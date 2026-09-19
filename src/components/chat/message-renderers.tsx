'use client';

import { OptimizedImage } from '@/components/optimized-image';
import { LazyVideo } from '@/components/lazy-video';
import { CodePreviewTabs } from '@/components/code-preview-tabs';
import type { CodePreview } from '@/lib/web-page-code-preview';
import type { ChatMessageResult } from '@/lib/chat-types';

export function ImageResult({ result }: { result: ChatMessageResult }) {
  return (
    <div className="space-y-2">
      {result.imageUrl && (
        <div className="rounded-lg overflow-hidden border"><OptimizedImage src={result.imageUrl} alt="Generada" className="w-full max-h-96 object-contain" /></div>
      )}
      {result.imageUrls && result.imageUrls.map((url, i) => (
        <div key={i} className="rounded-lg overflow-hidden border"><OptimizedImage src={url} alt={`Variación ${i + 1}`} className="w-full max-h-64 object-contain" /></div>
      ))}
    </div>
  );
}

export function VideoResult({ result }: { result: ChatMessageResult }) {
  return (
    <div className="space-y-2">
      {result.videoUrl && (
        <div className="rounded-lg overflow-hidden bg-black">
          <LazyVideo src={result.videoUrl} className="w-full max-h-[480px]" autoPlay={false} controls />
        </div>
      )}
    </div>
  );
}

export function WebResult({ result }: { result: ChatMessageResult }) {
  const preview: CodePreview | undefined = result.html
    ? { language: 'html', snippet: result.html, totalLines: result.html.split('\n').length }
    : undefined;
  return (
    <div className="space-y-2">
      {preview && (
        <div className="rounded-lg border overflow-hidden">
          <CodePreviewTabs previews={[preview]} lockedLabel="HTML generado" />
        </div>
      )}
      {result.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {result.error}
        </div>
      )}
    </div>
  );
}

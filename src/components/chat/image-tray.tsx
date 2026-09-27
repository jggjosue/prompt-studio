'use client';

import { useChatGenerator } from '@/hooks/use-chat-generator';
import { OptimizedImage } from '@/components/optimized-image';
import { Download } from 'lucide-react';

function downloadAsset(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.target = '_blank'; a.rel = 'noreferrer';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

export function ImageTray() {
  const { outputImageUrl, outputImageVariations } = useChatGenerator();
  const urls = outputImageVariations.map(v => v.url);
  if (outputImageUrl) urls.push(outputImageUrl);
  if (urls.length === 0) return null;

  return (
    <div className="mx-auto mb-2 max-w-3xl space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
        Imagenes generadas
      </p>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <div key={i} className="group relative overflow-hidden rounded-lg border border-border/40 bg-card/50">
            <OptimizedImage src={url} alt={`Generada ${i + 1}`} className="h-20 w-20 object-contain" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
              <button
                type="button"
                onClick={() => downloadAsset(url, `imagen-${i + 1}.png`)}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-black transition-opacity"
                aria-label="Descargar imagen"
              >
                <Download className="h-3 w-3" /> Descargar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

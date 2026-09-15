'use client';

import { Button } from '@/components/ui/button';
import { Crop, ImagePlus, PackageSearch, Palette, ScanFace, Shirt, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { OptimizedImage } from '@/components/optimized-image';

type Mode = 'identity' | 'outfit' | 'product' | 'style' | 'framing';
const MODES = [
  ['identity', 'Conservar rostro e identidad', ScanFace, 'Preserve the same person, facial geometry, recognizable identity, skin tone, and distinctive features from the reference image'],
  ['outfit', 'Cambiar ropa o escenario', Shirt, 'Change only the requested clothing and environment while keeping the subject consistent'],
  ['product', 'Reemplazar producto', PackageSearch, 'Replace the referenced product with the described product while preserving composition, scale, lighting, and perspective'],
  ['style', 'Transferir estilo', Palette, 'Transfer the visual style, palette, texture, and lighting language of the reference without copying protected logos or text'],
  ['framing', 'Variar encuadre', Crop, 'Create alternate close-up, medium, wide, and detail framings while maintaining subject and scene continuity'],
] as const;

export function VisualReferencePrompt({ provider, onChange }: { provider: string; onChange: (image: string, instructions: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState('');
  const [selected, setSelected] = useState<Mode[]>(['identity']);
  const [error, setError] = useState('');
  const update = (nextImage: string, nextModes: Mode[]) => onChange(nextImage, MODES.filter(mode => nextModes.includes(mode[0])).map(mode => mode[3]).join('. '));
  const load = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) {
      setError('Usa PNG, JPG o WebP de hasta 4 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? '');
      setImage(value);
      setError('');
      update(value, selected);
    };
    reader.readAsDataURL(file);
  };
  const toggle = (mode: Mode) => {
    const next = selected.includes(mode) ? selected.filter(item => item !== mode) : [...selected, mode];
    setSelected(next);
    update(image, next);
  };

  return (
    <section className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div><h3 className="text-sm font-bold">Referencia visual</h3><p className="text-xs text-muted-foreground">Sube una imagen y define qué debe conservar o transformar la IA.</p></div>
        {image ? <button type="button" onClick={() => { setImage(''); update('', selected); }} className="rounded-md p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button> : null}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={event => load(event.target.files?.[0])} />
      {image ? (
        <div className="mb-3 flex items-center gap-3">
          { }
          <span className="relative block size-20 overflow-hidden rounded-lg border"><OptimizedImage src={image} alt="Referencia cargada" fill forceUnoptimized sizes="80px" className="object-cover" /></span>
          <div><p className="text-xs font-semibold text-emerald-600">Imagen lista</p><p className="mt-1 text-[11px] text-muted-foreground">{provider === 'openai' ? 'Se enviará al modelo como imagen de edición.' : 'Este proveedor usará las instrucciones textuales; cambia a OpenAI para edición directa.'}</p></div>
        </div>
      ) : (
        <Button type="button" variant="outline" className="mb-3 w-full border-dashed" onClick={() => inputRef.current?.click()}><ImagePlus className="mr-2 size-4" />Subir fotografía</Button>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {MODES.map(([id, label, Icon]) => {
          const active = selected.includes(id);
          return <button key={id} type="button" aria-pressed={active} onClick={() => toggle(id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${active ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300' : 'hover:bg-muted'}`}><Icon className="size-4 shrink-0" />{label}</button>;
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      <p className="mt-3 text-[11px] text-muted-foreground">Sube únicamente imágenes propias o autorizadas. La conservación exacta de identidad depende del modelo.</p>
    </section>
  );
}

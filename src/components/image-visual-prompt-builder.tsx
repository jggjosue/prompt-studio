'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Aperture, Palette, SlidersHorizontal } from 'lucide-react';

export type ImagePromptSettings = {
  style: string; lighting: string; lens: string; angle: string; composition: string;
  ratio: string; realism: number; colors: string; negative: string;
  variationPack: boolean;
};

type Props = { value: ImagePromptSettings; onChange: (patch: Partial<ImagePromptSettings>) => void };
const Field = ({ label, value, items, onChange }: { label: string; value: string; items: Array<[string, string]>; onChange: (value: string) => void }) => <div className="space-y-1.5"><Label className="text-xs font-semibold">{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger className="h-9 bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{items.map(([id, text]) => <SelectItem key={id} value={id} className="text-xs">{text}</SelectItem>)}</SelectContent></Select></div>;

export function ImageVisualPromptBuilder({ value, onChange }: Props) {
  return <section className="rounded-xl border bg-muted/20 p-4"><div className="mb-4 flex items-center gap-2"><SlidersHorizontal className="size-4 text-blue-600" /><div><h3 className="text-sm font-bold">Constructor visual de prompts</h3><p className="text-xs text-muted-foreground">Modifica el resultado sin editar manualmente el prompt.</p></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Field label="Estilo" value={value.style} onChange={style => onChange({ style })} items={[["cinematic","Cinematográfico"],["photography","Fotografía"],["editorial","Editorial"],["anime","Anime"],["watercolor","Acuarela"],["3d-render","Render 3D"]]} />
    <Field label="Iluminación" value={value.lighting} onChange={lighting => onChange({ lighting })} items={[["volumetric","Volumétrica"],["studio","Estudio suave"],["natural","Luz natural"],["golden-hour","Hora dorada"],["neon","Neón"],["low-key","Low key"]]} />
    <Field label="Cámara y lente" value={value.lens} onChange={lens => onChange({ lens })} items={[["35mm","35 mm documental"],["50mm","50 mm natural"],["85mm","85 mm retrato"],["24mm-wide","24 mm gran angular"],["macro","Macro"],["telephoto","Teleobjetivo"]]} />
    <Field label="Ángulo" value={value.angle} onChange={angle => onChange({ angle })} items={[["eye-level","A la altura de los ojos"],["low-angle","Contrapicado"],["high-angle","Picado"],["aerial","Aéreo"],["top-down","Cenital"],["dutch-angle","Ángulo holandés"]]} />
    <Field label="Composición" value={value.composition} onChange={composition => onChange({ composition })} items={[["rule-of-thirds","Regla de tercios"],["centered","Centrada"],["symmetrical","Simétrica"],["leading-lines","Líneas guía"],["negative-space","Espacio negativo"],["close-crop","Recorte cerrado"]]} />
    <Field label="Relación de aspecto" value={value.ratio} onChange={ratio => onChange({ ratio })} items={[["1-1","1:1 Cuadrada"],["16-9","16:9 Horizontal"],["9-16","9:16 Vertical"],["4-3","4:3 Clásica"],["3-2","3:2 Fotográfica"]]} />
  </div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="space-y-2"><div className="flex justify-between"><Label className="text-xs font-semibold">Nivel de realismo</Label><span className="text-xs font-bold text-blue-600">{value.realism}%</span></div><Slider value={[value.realism]} min={0} max={100} step={10} onValueChange={next => onChange({ realism: next[0] })} /></div><div className="space-y-2"><Label className="flex items-center gap-1 text-xs font-semibold"><Palette className="size-3" />Colores</Label><div className="flex flex-wrap gap-2">{['natural','warm','cool','pastel','monochrome','vibrant'].map(color => <button key={color} type="button" onClick={() => onChange({ colors: color })} aria-pressed={value.colors === color} className={`rounded-full border px-2.5 py-1 text-[11px] capitalize ${value.colors === color ? 'border-blue-600 bg-blue-600 text-white' : 'bg-background hover:border-blue-400'}`}>{color}</button>)}</div></div></div><div className="mt-4 space-y-1.5"><Label className="flex items-center gap-1 text-xs font-semibold"><Aperture className="size-3" />Negative prompt</Label><Textarea value={value.negative} onChange={event => onChange({ negative: event.target.value })} rows={2} className="bg-background text-xs" placeholder="Elementos que no deben aparecer…" /></div><div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-violet-500/25 bg-violet-500/5 p-3"><div><Label className="text-xs font-bold">Paquete de 8 variaciones</Label><p className="mt-1 text-[11px] text-muted-foreground">Principal, 9:16, 1:1, 16:9, close-up, plano completo, comercial y editorial. Consume hasta 8 créditos.</p></div><Switch checked={value.variationPack} onCheckedChange={variationPack => onChange({ variationPack })} /></div></section>;
}

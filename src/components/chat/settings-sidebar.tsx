'use client';

import type { ChatGeneratorReturn } from '@/lib/chat-types';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function SettingsSidebar({ chat }: { chat: ChatGeneratorReturn }) {
  const [open, setOpen] = useState(true);
  const { imageGen, selectedMode, params, setParams } = chat;
  const updateParam = (key: keyof typeof params, value: string | number) => setParams(previous => ({ ...previous, [key]: value }));

  return (
    <aside className={`${open ? 'w-72' : 'w-10'} border-l border-border bg-muted/20 transition-all duration-200 flex flex-col overflow-hidden`}>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between p-2 border-b border-border text-xs font-semibold">
        <span>Parámetros</span>
        <span className="transition-transform duration-200" style={{ rotate: open ? '90deg' : '0deg' }}><ChevronRight className="h-3 w-3" /></span>
      </button>
      {open && (
        <div className="flex-1 overflow-y-auto space-y-3 p-3 text-xs">
          <p className="font-bold text-muted-foreground uppercase">{selectedMode === 'image' ? 'Imagen' : selectedMode === 'video' ? 'Video' : 'Web'}</p>
          {selectedMode === 'image' && (
            <div className="space-y-2">
              <label className="block font-semibold">Proveedor</label>
              <select value={params.provider || 'google'} onChange={e => updateParam('provider', e.target.value)} className="w-full border rounded p-1 text-xs bg-background">
                <option value="google">Google</option>
                <option value="openai">OpenAI</option>
                <option value="fal">Fal.ai</option>
              </select>
              <label className="block font-semibold">Modelo</label>
              <select value={params.model || (params.provider === 'openai' ? 'dall-e-3' : params.provider === 'fal' ? 'fal-ai/flux/schnell' : 'imagen-4.0-fast-generate-001')} onChange={e => updateParam('model', e.target.value)} className="w-full border rounded p-1 text-xs bg-background">
                {(params.provider === 'openai') && (
                  <>
                    <option value="dall-e-3">DALL-E 3</option>
                    <option value="gpt-image-1-mini">GPT Image 1 Mini</option>
                  </>
                )}
                {(params.provider === 'fal') && (
                  <option value="fal-ai/flux/schnell">Flux Schnell</option>
                )}
                {(!params.provider || params.provider === 'google') && (
                  <option value="imagen-4.0-fast-generate-001">Imagen 4.0 Fast</option>
                )}
              </select>
              <label className="block font-semibold">Aspecto</label>
              <select value={params.imageRatio || '1-1'} onChange={e => updateParam('imageRatio', e.target.value)} className="w-full border rounded p-1 text-xs bg-background">
                <option value="1-1">1:1</option><option value="16-9">16:9</option><option value="9-16">9:16</option><option value="4-3">4:3</option>
              </select>
            </div>
          )}
          {selectedMode === 'video' && (
            <div className="space-y-2">
              <label className="block font-semibold">Proveedor</label>
              <select value={params.provider || 'google'} onChange={e => updateParam('provider', e.target.value)} className="w-full border rounded p-1 text-xs bg-background">
                <option value="google">Google (Veo)</option>
                <option value="runway">Runway</option>
              </select>
              <label className="block font-semibold">Modelo</label>
              <select value={params.model || (params.provider === 'runway' ? 'gen-3' : 'veo-2.0-generate-001')} onChange={e => updateParam('model', e.target.value)} className="w-full border rounded p-1 text-xs bg-background">
                {params.provider === 'runway' ? (
                  <option value="gen-3">Gen-3 Alpha</option>
                ) : (
                  <option value="veo-2.0-generate-001">Veo 2.0</option>
                )}
              </select>
              <label className="block font-semibold">Duración (s)</label>
              <input type="number" className="w-full border rounded p-1 text-xs bg-background" value={params.videoDuration || 8} onChange={e => updateParam('videoDuration', Number(e.target.value))} />
              <label className="block font-semibold">Estilo</label>
              <select value={params.videoStyle || 'photorealistic'} onChange={e => updateParam('videoStyle', e.target.value)} className="w-full border rounded p-1 text-xs bg-background">
                <option value="photorealistic">Fotorrealista</option>
                <option value="cinematic">Cinematográfico</option>
                <option value="anime">Anime</option>
              </select>
            </div>
          )}
          {selectedMode === 'project' && (
            <div className="space-y-2">
              <label className="block font-semibold">Proveedor</label>
              <select value={params.provider || 'google'} onChange={e => updateParam('provider', e.target.value)} className="w-full border rounded p-1 text-xs bg-background">
                <option value="google">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
              <label className="block font-semibold">Modelo</label>
              <select value={params.model || (params.provider === 'openai' ? 'gpt-4o' : params.provider === 'anthropic' ? 'claude-3-5-sonnet-20240620' : 'gemini-2.5-flash')} onChange={e => updateParam('model', e.target.value)} className="w-full border rounded p-1 text-xs bg-background">
                {params.provider === 'openai' && (
                  <option value="gpt-4o">GPT-4o</option>
                )}
                {params.provider === 'anthropic' && (
                  <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                )}
                {(!params.provider || params.provider === 'google') && (
                  <>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  </>
                )}
              </select>
              <label className="block font-semibold">Framework</label>
              <select value={params.webFramework || 'nextjs'} onChange={e => updateParam('webFramework', e.target.value)} className="w-full border rounded p-1 text-xs bg-background">
                <option value="nextjs">Next.js</option>
                <option value="react">React</option>
                <option value="html">HTML</option>
              </select>
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-border space-y-1">
            <p className="text-muted-foreground">Créditos disponibles</p>
            <p className="font-bold">{imageGen.credits.toFixed(1)}</p>
          </div>
        </div>
      )}
    </aside>
  );
}

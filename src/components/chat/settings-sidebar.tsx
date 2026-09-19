'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ChatGeneratorReturn } from '@/lib/chat-types';

export function SettingsSidebar({ chat }: { chat: ChatGeneratorReturn }) {
  const [open, setOpen] = useState(true);
  const { imageGen, videoGen, selectedMode } = chat;

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
              <label className="block">Aspecto</label>
              <select className="w-full border rounded p-1 text-xs bg-background">
                <option value="1-1">1:1</option>
                <option value="16-9">16:9</option>
                <option value="9-16">9:16</option>
                <option value="4-3">4:3</option>
              </select>
            </div>
          )}
          {selectedMode === 'video' && (
            <div className="space-y-2">
              <label className="block">Duración (s)</label>
              <input type="number" className="w-full border rounded p-1 text-xs bg-background" value={videoGen.videoDuration} onChange={e => videoGen.setVideoDuration(e.target.value)} />
              <label className="block">Estilo</label>
              <select className="w-full border rounded p-1 text-xs bg-background">
                <option value="photorealistic">Fotorrealista</option>
                <option value="cinematic">Cinematográfico</option>
                <option value="anime">Anime</option>
              </select>
            </div>
          )}
          {selectedMode === 'project' && (
            <div className="space-y-2">
              <label className="block">Framework</label>
              <select className="w-full border rounded p-1 text-xs bg-background">
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

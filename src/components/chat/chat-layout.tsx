'use client';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ChatArea } from './chat-area';
import { ChatInputBar } from './chat-input-bar';
import { ChatHistorySidebar } from './chat-history-sidebar';
import { SettingsSidebar } from './settings-sidebar';
import { useChatGenerator } from '@/hooks/use-chat-generator';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { ImageTray } from './image-tray';
import type { ChatMode } from '@/lib/chat-types';

export function ChatLayout() {
  const chat = useChatGenerator();
  const { setSelectedMode, setDraftPrompt } = chat;
  const searchParams = useSearchParams();
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  // Analiza la URL (?mode=image|video|project&prompt=...) para cambiar la
  // pestaña (imagen/video/web) y sus atributos según el origen del visitante:
  // menú "Media", catálogos de prompts, etc.
  const modeParam = searchParams.get('mode');
  const promptParam = searchParams.get('prompt');

  useEffect(() => {
    if (modeParam && ['image', 'video', 'project'].includes(modeParam)) {
      setSelectedMode(modeParam as ChatMode);
    }
  }, [modeParam, setSelectedMode]);

  useEffect(() => {
    if (promptParam) {
      setDraftPrompt(promptParam);
    }
  }, [promptParam, setDraftPrompt]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <ChatHistorySidebar chat={chat} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Toolbar móvil: acceso a configuración */}
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2 md:hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
              {chat.selectedMode === 'image' ? '✦ Imagen' : chat.selectedMode === 'video' ? '▶ Video' : '◈ Web'}
            </span>
            <button
              type="button"
              onClick={() => setMobileSettingsOpen(v => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={mobileSettingsOpen}
              aria-label="Abrir configuración"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Configuración
            </button>
          </div>
          <ChatArea chat={chat} />
          <ImageTray />
          <ChatInputBar chat={chat} />
        </div>
        <SettingsSidebar
          chat={chat}
          mobileOpen={mobileSettingsOpen}
          onMobileClose={() => setMobileSettingsOpen(false)}
        />
      </div>
      <Footer />
    </div>
  );
}

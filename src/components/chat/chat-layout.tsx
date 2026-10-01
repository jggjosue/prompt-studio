'use client';

import Header from '@/components/layout/header';
import { ChatArea } from './chat-area';
import { ChatInputBar } from './chat-input-bar';
import { ChatHistorySidebar } from './chat-history-sidebar';
import { SettingsSidebar } from './settings-sidebar';
import { useChatGenerator } from '@/hooks/use-chat-generator';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ChatMode } from '@/lib/chat-types';

export function ChatLayout() {
  const chat = useChatGenerator();
  const { setSelectedMode, setDraftPrompt } = chat;
  const searchParams = useSearchParams();
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [desktopSettingsOpen, setDesktopSettingsOpen] = useState(false);

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

  const openSettings = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setDesktopSettingsOpen(true);
      return;
    }
    setMobileSettingsOpen(true);
  };

  const conversationStarted = chat.messages.length > 0;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <ChatHistorySidebar chat={chat} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ChatArea
            chat={chat}
            emptyComposer={<ChatInputBar chat={chat} variant="hero" onOpenSettings={openSettings} />}
          />
          {conversationStarted && (
            <ChatInputBar chat={chat} variant="docked" onOpenSettings={openSettings} />
          )}
        </div>
        <SettingsSidebar
          chat={chat}
          desktopOpen={desktopSettingsOpen}
          onDesktopOpenChange={setDesktopSettingsOpen}
          mobileOpen={mobileSettingsOpen}
          onMobileClose={() => setMobileSettingsOpen(false)}
        />
      </div>
    </div>
  );
}

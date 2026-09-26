'use client';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ChatArea } from './chat-area';
import { ChatInputBar } from './chat-input-bar';
import { ChatHistorySidebar } from './chat-history-sidebar';
import { SettingsSidebar } from './settings-sidebar';
import { useChatGenerator } from '@/hooks/use-chat-generator';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import type { ChatMode } from '@/lib/chat-types';

export function ChatLayout() {
  const chat = useChatGenerator();
  const { setSelectedMode, setDraftPrompt } = chat;
  const searchParams = useSearchParams();

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
      <div className="flex flex-1 overflow-hidden">
        <ChatHistorySidebar chat={chat} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatArea chat={chat} />
          <ChatInputBar chat={chat} />
        </div>
        <SettingsSidebar chat={chat} />
      </div>
      <Footer />
    </div>
  );
}

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
  const searchParams = useSearchParams();

  // Leer parámetros de URL: ?prompt=hello&mode=video
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    const mode = searchParams.get('mode');
    if (prompt) {
      // El prompt se establecerá en el input bar
    }
    if (mode && ['image', 'video', 'project'].includes(mode)) {
      chat.setSelectedMode(mode as ChatMode);
    }
  }, [searchParams]);

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

'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { useChatGenerator } from '@/hooks/use-chat-generator';
import { useSearchParams } from 'next/navigation';
import { ChatArea } from './chat-area';
import { ChatHistorySidebar } from './chat-history-sidebar';
import { ChatInputBar } from './chat-input-bar';
import { SettingsSidebar } from './settings-sidebar';

export function ChatLayout() {
  const searchParams = useSearchParams();
  const chat = useChatGenerator(searchParams.get('prompt') || '');

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 overflow-hidden">
      <ChatHistorySidebar chat={chat} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatArea chat={chat} />
        <ChatInputBar chat={chat} />
      </div>
      <SettingsSidebar chat={chat} />
      </main>
      <Footer />
    </div>
  );
}

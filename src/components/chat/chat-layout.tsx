'use client';

import { ChatArea } from './chat-area';
import { ChatInputBar } from './chat-input-bar';
import { ChatHistorySidebar } from './chat-history-sidebar';
import { SettingsSidebar } from './settings-sidebar';
import { useChatGenerator } from '@/hooks/use-chat-generator';

export function ChatLayout() {
  const chat = useChatGenerator();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatHistorySidebar chat={chat} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatArea chat={chat} />
        <ChatInputBar chat={chat} />
      </div>
      <SettingsSidebar chat={chat} />
    </div>
  );
}

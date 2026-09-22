'use client';

import { useSearchParams } from 'next/navigation';
import { useChatGenerator } from '@/hooks/use-chat-generator';
import { ChatArea } from './chat-area';
import { ChatHistorySidebar } from './chat-history-sidebar';
import { ChatInputBar } from './chat-input-bar';
import { SettingsSidebar } from './settings-sidebar';
import { WorkspaceHeader } from './workspace-header';

export function ChatLayout() {
  const searchParams = useSearchParams();
  const chat = useChatGenerator(searchParams.get('prompt') || '');

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Workspace-mode header (replaces the global marketing header) */}
      <WorkspaceHeader chat={chat} />

      {/* Three-column workspace */}
      <main className="flex flex-1 overflow-hidden" aria-label="Espacio de trabajo creativo">
        {/* Left: history sidebar */}
        <ChatHistorySidebar chat={chat} />

        {/* Center: conversation + composer */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ChatArea chat={chat} />
          <ChatInputBar chat={chat} />
        </div>

        {/* Right: contextual settings */}
        <SettingsSidebar chat={chat} />
      </main>
    </div>
  );
}

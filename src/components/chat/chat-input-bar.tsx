'use client';

import { useState } from 'react';
import { Send, Image, Video, Globe } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import { ChatMode } from '@/lib/chat-types';

export function ChatInputBar({ chat }: { chat: ChatGeneratorReturn }) {
  const [prompt, setPrompt] = useState('');
  const { selectedMode, setSelectedMode, generate, localGenerating } = chat;

  const handleSend = () => {
    if (!prompt.trim() || localGenerating) return;
    generate(prompt.trim(), { model: selectedMode }, selectedMode);
    setPrompt('');
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="flex items-end gap-2">
        <Tabs value={selectedMode} onValueChange={(v) => setSelectedMode(v as ChatMode)} className="w-fit">
          <TabsList>
            <TabsTrigger value="image"><Image className="h-3 w-3 mr-1" />Imagen</TabsTrigger>
            <TabsTrigger value="video"><Video className="h-3 w-3 mr-1" />Video</TabsTrigger>
            <TabsTrigger value="project"><Globe className="h-3 w-3 mr-1" />Web</TabsTrigger>
          </TabsList>
        </Tabs>
        <Textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Escribe tu prompt..."
          className="flex-1 min-h-[40px] max-h-32 resize-none"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <Button onClick={handleSend} disabled={localGenerating || !prompt.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

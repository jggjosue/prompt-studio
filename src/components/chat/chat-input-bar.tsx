'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import { ChatMode } from '@/lib/chat-types';
import { Globe, Image, Send, Video } from 'lucide-react';

export function ChatInputBar({ chat }: { chat: ChatGeneratorReturn }) {
  const { selectedMode, setSelectedMode, generate, localGenerating, draftPrompt: prompt, setDraftPrompt } = chat;

  const handleSend = () => {
    if (!prompt.trim() || localGenerating) return;
    const provider = chat.params.provider || (selectedMode === 'video' ? 'google' : selectedMode === 'project' ? 'google' : 'google');
    const defaultModel = selectedMode === 'image'
      ? (provider === 'openai' ? 'dall-e-3' : provider === 'fal' ? 'fal-ai/flux/schnell' : 'imagen-4.0-fast-generate-001')
      : selectedMode === 'video'
        ? (provider === 'runway' ? 'gen-3' : 'veo-2.0-generate-001')
        : (provider === 'openai' ? 'gpt-4o' : provider === 'anthropic' ? 'claude-3-5-sonnet-20240620' : 'gemini-2.5-flash');
    const model = chat.params.model || defaultModel;
    generate(prompt.trim(), { ...chat.params, provider, model }, selectedMode);
    setDraftPrompt('');
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
          onChange={e => setDraftPrompt(e.target.value)}
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

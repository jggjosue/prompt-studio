'use client';

import { useEffect, useRef } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { Globe, Image as ImageIcon, Send, Video } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { ChatGeneratorReturn, ChatMode, ChatParams } from '@/lib/chat-types';

const MODEL_BY_MODE: Record<ChatMode, { provider: string; model: string; generationTier: ChatParams['generationTier'] }> = {
  image: { provider: 'google', model: 'imagen-4.0-fast-generate-001', generationTier: 'fast' },
  video: { provider: 'google', model: 'veo-2.0-generate-001', generationTier: 'fast' },
  project: { provider: 'google', model: 'gemini-2.5-flash', generationTier: 'fast' },
};

export function ChatInputBar({ chat }: { chat: ChatGeneratorReturn; isDeveloperAdmin?: boolean }) {
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedMode, setSelectedMode, generate, localGenerating, draftPrompt, setDraftPrompt, messages, params, setParams } = chat;

  useEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt && messages.length === 0) setDraftPrompt(prompt);
  }, [messages.length, searchParams, setDraftPrompt]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [draftPrompt]);

  const handleModeChange = (mode: ChatMode) => {
    setSelectedMode(mode);
    setParams(previous => ({ ...previous, ...MODEL_BY_MODE[mode] }));
  };

  const handleSend = () => {
    const prompt = draftPrompt.trim();
    if (!isSignedIn) {
      clerk.openSignUp({ fallbackRedirectUrl: '/generate' });
      return;
    }
    if (!prompt || localGenerating) return;
    generate(prompt, { ...params, ...MODEL_BY_MODE[selectedMode] }, selectedMode);
    setDraftPrompt('');
  };

  return (
    <div className="shrink-0 border-t border-border bg-background p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Tabs value={selectedMode} onValueChange={value => handleModeChange(value as ChatMode)} className="w-full sm:w-fit">
          <TabsList className="grid w-full grid-cols-3 sm:flex sm:w-fit">
            <TabsTrigger value="image"><ImageIcon className="mr-1 h-3 w-3" />Imagen</TabsTrigger>
            <TabsTrigger value="video"><Video className="mr-1 h-3 w-3" />Video</TabsTrigger>
            <TabsTrigger value="project"><Globe className="mr-1 h-3 w-3" />Web</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex min-w-0 flex-1 items-end gap-2">
          <Textarea ref={textareaRef} value={draftPrompt} onChange={event => setDraftPrompt(event.target.value)} placeholder="Escribe tu prompt..." className="min-h-10 max-h-40 min-w-0 flex-1 resize-none" disabled={localGenerating} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }} aria-label="Escribe tu prompt" />
          <Button onClick={handleSend} disabled={localGenerating || !draftPrompt.trim()} size="icon" aria-label="Generar"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

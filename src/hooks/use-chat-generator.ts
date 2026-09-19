'use client';

import { useCallback, useState } from 'react';
import { useGenerationEditor } from '@/hooks/use-generation-editor';
import { useImageGeneration } from './use-image-generation';
import { useVideoGeneration } from './use-video-generation';
import { useWebGeneration } from './use-web-generation';
import type { ChatMode, ChatGeneratorMessage, ChatMessageResult, ChatParams, ChatGeneratorReturn } from '@/lib/chat-types';

export function useChatGenerator(): ChatGeneratorReturn {
  const [messages, setMessages] = useState<ChatGeneratorMessage[]>([]);
  const [selectedMode, setSelectedMode] = useState<ChatMode>('image');
  const {
    localGenerating, setLocalGenerating, genProgress, setGenProgress,
    genStatus, setGenStatus, generationError, setGenerationError,
    failGeneration, beginGeneration, finishGeneration,
    outputImageUrl, setOutputImageUrl, outputImageVariations, setOutputImageVariations,
    outputVideoUrl, setOutputVideoUrl, outputWebHTML, setOutputWebHTML,
    copiedCode, setCopiedCode,
  } = useGenerationEditor();

  const imageGen = useImageGeneration();
  const videoGen = useVideoGeneration();
  const webGen = useWebGeneration();

  const addMessage = useCallback((entry: Omit<ChatGeneratorMessage, 'id'>) => {
    const msg: ChatGeneratorMessage = { ...entry, id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const updateMessage = useCallback((id: string, update: Partial<ChatGeneratorMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...update } : m));
  }, []);

  const generate = useCallback(async (prompt: string, params: ChatParams, mode: ChatMode) => {
    const entry = addMessage({ role: 'user', mode, prompt, params, status: 'pending', progress: 0 });
    beginGeneration(`Generating ${mode}...`);
    setGenProgress(10);

    try {
      let result: ChatMessageResult | undefined;
      let error: string | undefined;

      if (mode === 'image') {
        const res = await imageGen.generate(prompt, params);
        result = res.result;
        error = res.error;
        if (result?.imageUrl) setOutputImageUrl(result.imageUrl);
        if (result?.imageUrls) setOutputImageVariations(result.imageUrls.map((url, i) => ({ label: `Variation ${i + 1}`, url })));
      } else if (mode === 'video') {
        const res = await videoGen.generate(prompt, params);
        result = res.result;
        error = res.error;
        if (result?.videoUrl) setOutputVideoUrl(result.videoUrl);
      } else if (mode === 'project') {
        const res = await webGen.generate(prompt, params);
        result = res.result;
        error = res.error;
        if (result?.html) setOutputWebHTML(result.html);
      }

      if (error) {
        failGeneration(`${mode} generation failed`, error);
        updateMessage(entry.id!, { status: 'failed', progress: 0, result: { error } });
      } else if (result) {
        finishGeneration();
        setGenProgress(100);
        updateMessage(entry.id!, { status: 'completed', progress: 100, result });
      }
    } catch (err: any) {
      failGeneration(`${mode} generation failed`, err.message || 'Unknown error');
      updateMessage(entry.id!, { status: 'failed', progress: 0, result: { error: err.message } });
    }

    setLocalGenerating(false);
    return entry.id;
  }, [addMessage, beginGeneration, finishGeneration, failGeneration, updateMessage, imageGen, videoGen, webGen]);

  const reset = useCallback(() => {
    setMessages([]);
    setLocalGenerating(false);
    setGenerationError(null);
    setOutputImageUrl('');
    setOutputVideoUrl('');
    setOutputWebHTML('');
    setGenProgress(0);
    setGenStatus('');
  }, [setLocalGenerating, setGenerationError, setOutputImageUrl, setOutputVideoUrl, setOutputWebHTML, setGenProgress, setGenStatus]);

  return {
    messages, selectedMode, setSelectedMode,
    localGenerating, genProgress, genStatus, generationError,
    outputImageUrl, outputImageVariations, outputVideoUrl, outputWebHTML, copiedCode,
    generate, reset, imageGen, videoGen, webGen,
    setOutputImageUrl, setOutputImageVariations, setOutputVideoUrl, setOutputWebHTML, setCopiedCode,
    setCredits: imageGen.setCredits,
  };
}

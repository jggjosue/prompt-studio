'use client';

import { useGenerationEditor } from '@/hooks/use-generation-editor';
import { parseGenerateQuery } from '@/lib/chat-query';
import type { ChatGeneratorMessage, ChatGeneratorReturn, ChatMessageResult, ChatMode, ChatParams, ChatQueueItem } from '@/lib/chat-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useImageGeneration } from './use-image-generation';
import { useVideoGeneration } from './use-video-generation';
import { useWebGeneration } from './use-web-generation';

const defaultParams: ChatParams = {
  imageRatio: '1-1', imageStyle: 'cinematic', imageRes: '1k', imageFormat: 'png',
  videoDuration: 8, videoStyle: 'photorealistic', videoAspect: '16-9',
  webFramework: 'nextjs', webTheme: 'glassmorphism', webComponent: 'hero', webColor: 'blue',
};

export function useChatGenerator(initialQuery = ''): ChatGeneratorReturn {
  const initial = parseGenerateQuery(initialQuery);
  const [messages, setMessages] = useState<ChatGeneratorMessage[]>([]);
  const [selectedMode, setSelectedMode] = useState<ChatMode>(initial.mode);
  const [params, setParams] = useState<ChatParams>({ ...defaultParams, ...initial.params });
  const [draftPrompt, setDraftPrompt] = useState(initial.prompt);
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; mode: ChatMode }>>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [queue, setQueue] = useState<ChatQueueItem[]>([]);
  const [queueActive, setQueueActive] = useState(false);
  const [queueRunning, setQueueRunning] = useState(false);
  const queueWorkerRef = useRef(false);
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

  useEffect(() => {
    fetch('/api/ai/chats')
      .then(response => response.ok ? response.json() : { chats: [] })
      .then(data => setSessions((data.chats || []).map((chat: { id?: string; _id?: string; title: string; mode: ChatMode }) => ({
        id: chat.id || chat._id || '', title: chat.title, mode: chat.mode,
      })).filter((chat: { id: string }) => chat.id)))
      .catch(() => {});
  }, []);

  const createSession = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/chats', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Nueva conversación', mode: selectedMode }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.chat) {
        const session = { id: String(data.chat.id || data.chat._id), title: data.chat.title, mode: data.chat.mode };
        setSessions(previous => [session, ...previous]);
        setActiveSessionId(session.id);
        setMessages([]);
      }
    } catch {}
  }, [selectedMode]);

  const loadSession = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/ai/chats/${id}/messages`);
      if (!response.ok) return;
      const data = await response.json();
      setMessages((data.messages || []).map((message: ChatGeneratorMessage & { _id?: string }) => ({ ...message, id: message.id || String(message._id) })));
      setActiveSessionId(id);
    } catch {}
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/ai/chats/${id}`, { method: 'DELETE' });
      if (!response.ok) return;
      setSessions(previous => previous.filter(session => session.id !== id));
      if (activeSessionId === id) { setActiveSessionId(null); setMessages([]); }
    } catch {}
  }, [activeSessionId]);

  const addMessage = useCallback((entry: Omit<ChatGeneratorMessage, 'id'>) => {
    const msg: ChatGeneratorMessage = { ...entry, id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const updateMessage = useCallback((id: string, update: Partial<ChatGeneratorMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...update } : m));
  }, []);

  const enqueue = useCallback((prompt: string): boolean => {
    const trimmed = prompt.trim();
    if (!trimmed) return false;
    setQueue(prev => {
      if (prev.length >= 50 || prev.some(item => item.status === 'queued' && item.prompt === trimmed)) return prev;
      return [...prev, { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, prompt: trimmed, mode: selectedMode, status: 'queued', progress: 0 }];
    });
    return true;
  }, [selectedMode]);

  const startQueue = useCallback(() => setQueueActive(true), []);

  const removeQueueItem = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const retryQueueItem = useCallback((id: string) => {
    setQueue(prev => prev.map(item => item.id === id && item.status === 'failed'
      ? { ...item, status: 'queued', progress: 0, result: undefined, error: undefined }
      : item));
    setQueueActive(true);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue(prev => prev.filter(item => item.status === 'processing'));
  }, []);

  useEffect(() => {
    if (!queueActive || queueWorkerRef.current) return;
    const next = queue.find(item => item.status === 'queued');
    if (!next) {
      if (queue.some(item => item.status === 'processing')) return;
      setQueueActive(false);
      return;
    }
    queueWorkerRef.current = true;
    setQueueRunning(true);
    setQueue(prev => prev.map(item => item.id === next.id ? { ...item, status: 'processing', progress: 5 } : item));
    void (async () => {
      let res: { result?: ChatMessageResult; error?: string } | undefined;
      if (next.mode === 'image') {
        res = await imageGen.generate(next.prompt, params);
      } else if (next.mode === 'video') {
        res = await videoGen.generate(next.prompt, params);
      } else {
        res = await webGen.generate(next.prompt, params);
      }

      setQueue(prev => prev.map(item => item.id === next.id ? {
        ...item,
        status: res?.error ? 'failed' : 'completed',
        error: res?.error,
        result: res?.result,
        progress: res?.error ? 0 : 100,
      } : item));

      const entry = addMessage({ role: 'user', mode: next.mode, prompt: next.prompt, params, status: 'pending', progress: 0 });
      updateMessage(entry.id, res?.error
        ? { status: 'failed', progress: 0, result: { error: res.error } }
        : { status: 'completed', progress: 100, result: res?.result });
    })().finally(() => {
      queueWorkerRef.current = false;
      setQueueRunning(false);
    });
  }, [queue, queueActive, params, imageGen, videoGen, webGen, addMessage, updateMessage]);

  const generate = useCallback(async (prompt: string, params: ChatParams, mode: ChatMode) => {
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const response = await fetch('/api/ai/chats', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: prompt.slice(0, 80), mode }),
        });
        if (response.ok) {
          const data = await response.json();
          sessionId = String(data.chat?.id || data.chat?._id || '');
          if (sessionId) {
            setActiveSessionId(sessionId);
            setSessions(previous => [{ id: sessionId!, title: data.chat.title, mode }, ...previous]);
          }
        }
      } catch {}
    }
    const entry = addMessage({ role: 'user', mode, prompt, params, status: 'pending', progress: 0 });
    if (sessionId) {
      void fetch(`/api/ai/chats/${sessionId}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', mode, prompt, params }),
      }).catch(() => {});
    }
    beginGeneration(`Generating ${mode}...`);
    setGenProgress(10);
    let result: ChatMessageResult | undefined;
    let error: string | undefined;

    try {
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
      error = err.message || 'Unknown error';
      failGeneration(`${mode} generation failed`, err.message || 'Unknown error');
      updateMessage(entry.id!, { status: 'failed', progress: 0, result: { error } });
    }

    if (sessionId) {
      void fetch(`/api/ai/chats/${sessionId}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'assistant', mode, prompt, params,
          result: error ? { error } : result || null,
          status: error ? 'failed' : result ? 'completed' : 'pending',
          progress: error || !result ? 0 : 100,
        }),
      }).catch(() => {});
    }

    setLocalGenerating(false);
    return entry.id;
  }, [activeSessionId, addMessage, beginGeneration, finishGeneration, failGeneration, updateMessage, imageGen, videoGen, webGen]);

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
    messages, params, setParams, draftPrompt, setDraftPrompt, sessions, activeSessionId,
    createSession, loadSession, deleteSession, selectedMode, setSelectedMode,
    localGenerating, genProgress, genStatus, generationError,
    outputImageUrl, outputImageVariations, outputVideoUrl, outputWebHTML, copiedCode,
    generate, reset, imageGen, videoGen, webGen,
    queue, queueRunning, enqueue, startQueue, removeQueueItem, retryQueueItem, clearQueue,
    setOutputImageUrl, setOutputImageVariations, setOutputVideoUrl, setOutputWebHTML, setCopiedCode,
    setCredits: imageGen.setCredits,
  };
}

'use client';

import { useCallback, useState } from 'react';

export type GenerationStatus = 'queued' | 'generating' | 'uploading' | 'completed' | 'failed';

export interface GenerationEntry {
  jobId: string;
  status: GenerationStatus;
  imageUrl?: string;
  error?: string;
  progressMessage?: string;
  creditsUsed?: number;
  provider: string;
}

export type GenerationError = {
  title: string;
  message: string;
} | null;

export function useGenerationEditor() {
  const [localGenerating, setLocalGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState('');
  const [generationError, setGenerationError] = useState<GenerationError>(null);
  const [generations, setGenerations] = useState<Map<string, GenerationEntry>>(new Map());
  const [outputImageVariations, setOutputImageVariations] = useState<Array<{ label: string; url: string }>>([]);
  const [outputVideoUrl, setOutputVideoUrl] = useState('');
  const [outputWebHTML, setOutputWebHTML] = useState('');
  const [outputWebTab, setOutputWebTab] = useState<'preview' | 'code'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);

  const updateGeneration = useCallback((jobId: string, patch: Partial<GenerationEntry>) => {
    setGenerations(prev => {
      const next = new Map(prev);
      const entry = next.get(jobId);
      if (!entry) return next;
      next.set(jobId, { ...entry, ...patch });
      return next;
    });
  }, []);

  const removeGeneration = useCallback((jobId: string) => {
    setGenerations(prev => {
      const next = new Map(prev);
      next.delete(jobId);
      return next;
    });
  }, []);

  const beginGeneration = useCallback((status = '') => {
    setGenerationError(null);
    setGenStatus(status);
    setGenProgress(10);
    setLocalGenerating(true);
  }, []);

  const finishGeneration = useCallback(() => {
    setGenProgress(100);
    setLocalGenerating(false);
  }, []);

  const failGeneration = useCallback((title: string, message: string) => {
    setGenerationError({ title, message });
    setLocalGenerating(false);
  }, []);

  const outputImageUrl = Array.from(generations.values()).reverse().find(g => g.imageUrl)?.imageUrl ?? '';
  const setOutputImageUrl = useCallback((url: string) => {
    const jobId = 'current';
    setGenerations(prev => {
      const next = new Map(prev);
      next.set(jobId, { jobId, status: url ? 'completed' : 'failed', imageUrl: url, provider: 'google' });
      return next;
    });
  }, []);
  const retryGeneration = useCallback((jobId: string) => {
    updateGeneration(jobId, { status: 'queued', error: undefined, imageUrl: undefined });
  }, [updateGeneration]);

  return {
    localGenerating, setLocalGenerating,
    genProgress, setGenProgress,
    genStatus, setGenStatus,
    generationError, setGenerationError,
    outputImageUrl, setOutputImageUrl,
    outputImageVariations, setOutputImageVariations,
    outputVideoUrl, setOutputVideoUrl,
    outputWebHTML, setOutputWebHTML,
    outputWebTab, setOutputWebTab,
    copiedCode, setCopiedCode,
    generations,
    retryGeneration,
    removeGeneration,
    beginGeneration,
    finishGeneration,
    failGeneration,
  };
}

'use client';

import { useCallback, useState } from 'react';

export type GenerationError = {
  title: string;
  message: string;
} | null;

export function useGenerationEditor() {
  const [localGenerating, setLocalGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState('');
  const [generationError, setGenerationError] = useState<GenerationError>(null);

  const [outputImageUrl, setOutputImageUrl] = useState('');
  const [outputImageVariations, setOutputImageVariations] = useState<Array<{ label: string; url: string }>>([]);
  const [outputVideoUrl, setOutputVideoUrl] = useState('');
  const [outputWebHTML, setOutputWebHTML] = useState('');
  const [outputWebTab, setOutputWebTab] = useState<'preview' | 'code'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);

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
    beginGeneration,
    finishGeneration,
    failGeneration,
  };
}

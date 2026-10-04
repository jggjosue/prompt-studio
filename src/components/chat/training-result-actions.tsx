'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { Bookmark, Pencil, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useSavedItems } from '@/components/saved-items-provider';
import type { ChatGeneratorMessage } from '@/lib/chat-types';
import { trackTrainingEvent, trainingModalityForChatMode } from '@/lib/training/client-events';
import { cn } from '@/lib/utils';
import type { SavedItemKind } from '@/models/SavedItem';

const SAVED_KIND: Partial<Record<string, SavedItemKind>> = { image: 'image', video: 'video', project: 'web-page' };
const VIEWED_KEY = 'ps-training-viewed:';

/**
 * Emits output_viewed once per generation when at least half of the result has
 * been visible for one second. Deduplicated per browser session.
 */
export function useOutputViewed(ref: RefObject<HTMLElement | null>, message: ChatGeneratorMessage) {
  const generationId = message.result?.generationId;
  useEffect(() => {
    const element = ref.current;
    if (!element || !generationId || message.status !== 'completed' || typeof IntersectionObserver === 'undefined') return;
    try {
      if (sessionStorage.getItem(VIEWED_KEY + generationId)) return;
    } catch {
      // Storage unavailable: fall through and rely on server idempotency.
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    let visibleSince = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        visibleSince = Date.now();
        timer = setTimeout(() => {
          trackTrainingEvent({
            eventName: 'output_viewed',
            generationId,
            modality: trainingModalityForChatMode(message.mode),
            payload: { surface: 'generate', visibleMs: Date.now() - visibleSince },
          });
          try { sessionStorage.setItem(VIEWED_KEY + generationId, '1'); } catch { /* ignore */ }
          observer.disconnect();
        }, 1000);
      } else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }, { threshold: 0.5 });
    observer.observe(element);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref, generationId, message.status, message.mode]);
}

const buttonClass = 'inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2 py-1 text-[11px] font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

/**
 * Actions under a completed generation. Feedback goes through the existing
 * feedback API (which records training evidence server-side); save reuses the
 * saved-items library.
 */
export function TrainingResultActions({ message, onRegenerate, onEditPrompt }: {
  message: ChatGeneratorMessage;
  onRegenerate?: () => void;
  onEditPrompt?: () => void;
}) {
  const generationId = message.result?.generationId;
  const saved = useSavedItems();
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const verdictRef = useRef<boolean | null>(null);
  if (message.role !== 'assistant' || message.status !== 'completed' || !message.result || message.result.error) return null;

  const savedKind = SAVED_KIND[message.mode];
  const savedId = generationId ? `gen-${generationId}` : null;
  const isSaved = Boolean(savedKind && savedId && saved?.isSignedIn && saved.isSaved(savedKind, savedId));

  async function sendFeedback(useful: boolean) {
    if (!generationId || busy) return;
    const previous = verdictRef.current;
    verdictRef.current = useful;
    setVerdict(useful);
    setBusy(true);
    try {
      const response = await fetch(`/api/ai/jobs/${generationId}/feedback`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useful }),
      });
      if (!response.ok) throw new Error(String(response.status));
    } catch {
      verdictRef.current = previous;
      setVerdict(previous);
    } finally {
      setBusy(false);
    }
  }

  async function toggleSave() {
    if (!saved?.isSignedIn || !savedKind || !savedId) return;
    const wasSaved = isSaved;
    await saved.toggle({
      itemKind: savedKind,
      itemId: savedId,
      title: message.prompt.slice(0, 80) || 'Generación',
      href: '/generate',
      imageUrl: message.result?.imageUrl ?? null,
    });
    if (!wasSaved && generationId) {
      trackTrainingEvent({ eventName: 'output_saved', generationId, modality: trainingModalityForChatMode(message.mode), payload: { surface: 'generate' } });
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5" aria-label="Acciones del resultado">
      {generationId && (
        <>
          <button type="button" className={cn(buttonClass, verdict === true && 'border-emerald-500/60 text-emerald-500')} aria-pressed={verdict === true} aria-label="Me gusta este resultado" disabled={busy} onClick={() => void sendFeedback(true)}>
            <ThumbsUp className="h-3 w-3" aria-hidden="true" />
          </button>
          <button type="button" className={cn(buttonClass, verdict === false && 'border-rose-500/60 text-rose-500')} aria-pressed={verdict === false} aria-label="No me gusta este resultado" disabled={busy} onClick={() => void sendFeedback(false)}>
            <ThumbsDown className="h-3 w-3" aria-hidden="true" />
          </button>
        </>
      )}
      {savedKind && savedId && saved?.isSignedIn && (
        <button type="button" className={cn(buttonClass, isSaved && 'border-blue-500/60 text-blue-500')} aria-pressed={isSaved} onClick={() => void toggleSave()}>
          <Bookmark className="h-3 w-3" aria-hidden="true" /> {isSaved ? 'Guardado' : 'Guardar'}
        </button>
      )}
      {onRegenerate && (
        <button type="button" className={buttonClass} onClick={onRegenerate}>
          <RotateCcw className="h-3 w-3" aria-hidden="true" /> Regenerar
        </button>
      )}
      {onEditPrompt && (
        <button type="button" className={buttonClass} onClick={onEditPrompt}>
          <Pencil className="h-3 w-3" aria-hidden="true" /> Editar prompt
        </button>
      )}
    </div>
  );
}

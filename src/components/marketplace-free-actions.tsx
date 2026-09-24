'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FreeEmailGate } from './free-email-gate';

type MarketplaceFreeActionsProps = {
  id: string;
  title: string;
};

/**
 * Acciones para un listado gratuito del marketplace: «Ver prompt» y
 * «Descargar» pasan por el registro de correo (verificado en el servidor).
 */
export function MarketplaceFreeActions({ id, title }: MarketplaceFreeActionsProps) {
  const t = useTranslations('landingPages');
  const { toast } = useToast();
  const [promptOpen, setPromptOpen] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const endpoint = `/api/marketplace/${encodeURIComponent(id)}`;

  const handleOpenPrompt = React.useCallback(async () => {
    setPromptOpen(true);
    if (content) return;
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}/prompt`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Prompt request failed: ${response.status}`);
      const data = (await response.json()) as { content: string };
      setContent(data.content);
    } catch {
      toast({ title: t('downloadFailed'), description: t('downloadFailedDescription'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [endpoint, content, t, toast]);


  const promptButton = (
    <Button size="sm" variant="outline" className="border-blue-500/35 text-blue-400 hover:border-blue-500/55 hover:bg-blue-500/10 hover:text-blue-300">
      <FileText className="w-4 h-4 mr-2" />
      {t('viewPrompt')}
    </Button>
  );

  return (
    <>
      <div className="mt-2 flex gap-2">
        <FreeEmailGate
          title={t('viewPrompt')}
          description={t('unlockPromptDescription')}
          submitText={t('viewPromptNow')}
          onSuccess={handleOpenPrompt}
        >
          {promptButton}
        </FreeEmailGate>
      </div>
      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left leading-snug">{title}</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans select-all">
            {loading ? 'Cargando prompt…' : content}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
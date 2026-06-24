'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import type { WebPageEntry } from '@/lib/web-pages';
import { Check, Copy, FileText, Wand2 } from 'lucide-react';
import * as React from 'react';
import { FreeEmailGate } from './free-email-gate';
import { normalizeMembership } from '@/lib/membership-access';
import Link from 'next/link';

export function WebPagePromptDialog({ page }: { page: WebPageEntry }) {
  const { toast } = useToast();
  const { runWithAccess, isSignedIn } = useMembershipAccess();
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(page.description);
    if (!ok) {
      toast({
        title: 'No se pudo copiar',
        description: 'Intenta seleccionar el texto manualmente.',
        variant: 'destructive',
      });
      return;
    }

    setCopied(true);
    toast({
      title: 'Copiado',
      description: 'Prompt copiado al portapapeles.',
    });
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPrompt = () => {
    runWithAccess(page.membership, () => {
      if (isSignedIn) {
        (window as any).gtag?.('event', 'view_prompt', { page_title: page.title });
      }
      setOpen(true);
    });
  };

  const isFree = normalizeMembership(page.membership) === 'free';

  const triggerButton = (
    <Button
      size="sm"
      variant="outline"
      className="border-blue-500/35 text-blue-400 hover:border-blue-500/55 hover:bg-blue-500/10 hover:text-blue-300"
      type="button"
      onClick={isFree ? undefined : handleOpenPrompt}
    >
      <FileText className="w-4 h-4 mr-2" />
      View prompt
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isFree ? (
        <FreeEmailGate
          title="Ver Prompt"
          description="Ingresa tu correo electrónico para desbloquear este prompt gratuito."
          submitText="Ver prompt ahora"
          onSuccess={handleOpenPrompt}
        >
          {triggerButton}
        </FreeEmailGate>
      ) : (
        triggerButton
      )}
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex-row items-start justify-between gap-2 space-y-0 pr-8">
          <DialogTitle className="text-left leading-snug">{page.title}</DialogTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handleCopy}
              aria-label="Copy prompt"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              className="!bg-blue-600 !text-white hover:!bg-blue-700"
              asChild
            >
              <Link href={`/prompt/edit?prompt=${encodeURIComponent(JSON.stringify({
                type: 'web',
                title: page.title,
                description: page.description,
                imageUrl: page.imageUrl,
                stack: page.stack,
                tags: page.tags
              }))}`}>
                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                Use prompt
              </Link>
            </Button>
          </div>
        </DialogHeader>
        <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans select-all">
          {page.description}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

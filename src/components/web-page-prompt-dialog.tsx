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
import { Check, Copy, FileText } from 'lucide-react';
import { useState } from 'react';

export function WebPagePromptDialog({ page }: { page: WebPageEntry }) {
  const { toast } = useToast();
  const { runWithAccess } = useMembershipAccess();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        variant="outline"
        type="button"
        onClick={() => runWithAccess(page.membership, () => setOpen(true))}
      >
        <FileText className="w-4 h-4 mr-2" />
        View prompt
      </Button>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex-row items-start justify-between gap-2 space-y-0 pr-8">
          <DialogTitle className="text-left leading-snug">{page.title}</DialogTitle>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={handleCopy}
            aria-label="Copy prompt"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </DialogHeader>
        <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans select-all">
          {page.description}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

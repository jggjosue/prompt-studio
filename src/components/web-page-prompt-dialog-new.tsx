'use client';

import { Button } from '@/components/ui/button';
import { FreeEmailGate } from '@/components/free-email-gate';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { useDailyCopyLimit } from '@/hooks/use-daily-copy-limit';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { trackAnalyticsEvent } from '@/lib/analytics';

import type { WebPageEntry } from '@/lib/web-pages';
import { Check, Copy, FileText, Loader2, Wand2 } from 'lucide-react';
import * as React from 'react';
import { normalizeMembership } from '@/lib/membership-access';
import { pickLocalized, type LocalizedField } from '@/lib/localized-string';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useUser } from '@clerk/nextjs';

const EMAIL_SAVED_KEY = 'prompt_studio_free_email_saved';

export function WebPagePromptDialog({
  page,
  hasPurchased = false,
}: {
  page: WebPageEntry;
  hasPurchased?: boolean;
}) {
  const t = useTranslations('landingPages');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { toast } = useToast();
  const { runWithAccess, isSignedIn, hasPaidPlan } = useMembershipAccess();
  const { copyWithDailyLimit } = useDailyCopyLimit();
  const { user } = useUser();

  const [copied, setCopied] = React.useState(false);
  // 'closed' | 'email-gate' | 'prompt'
  const [view, setView] = React.useState<'closed' | 'prompt'>('closed');
  const [prompt, setPrompt] = React.useState(page.description);
  const [loadingPrompt, setLoadingPrompt] = React.useState(false);

  const pageTitle = pickLocalized(
    page.title as unknown as LocalizedField,
    locale
  );
  const pageDescription = pickLocalized(
    prompt as unknown as LocalizedField,
    locale
  );

  React.useEffect(() => {
    setPrompt(page.description);
  }, [page.description, page.id]);

  const openAndLoadPrompt = React.useCallback(() => {
    setView('prompt');
    if (prompt || loadingPrompt) return;
    setLoadingPrompt(true);
    void fetch(`/api/catalog/web-pages/${encodeURIComponent(page.id)}?locale=${locale}`)
      .then(response => {
        if (!response.ok) throw new Error(`Prompt request failed: ${response.status}`);
        return response.json() as Promise<{ item: WebPageEntry }>;
      })
      .then(({ item }) => setPrompt(item.description))
      .catch(() => toast({ title: t('copyFailed'), description: t('copyFailedDescription'), variant: 'destructive' }))
      .finally(() => setLoadingPrompt(false));
  }, [page.id, locale, prompt, loadingPrompt, t, toast]);

  const handleCopy = async () => {
    const result = await copyWithDailyLimit(() =>
      copyToClipboard(pageDescription)
    );
    if (result === 'limit-reached') return;
    if (result === 'failed') {
      toast({
        title: t('copyFailed'),
        description: t('copyFailedDescription'),
        variant: 'destructive',
      });
      return;
    }

    setCopied(true);
    toast({
      title: t('copied'),
      description: t('copiedDescription'),
    });
    window.setTimeout(() => setCopied(false), 2000);
  };

  const isFree = normalizeMembership(page.membership) === 'free';
  // Paid plan users skip the email gate (they're already tracked)
  const needsEmailGate = isFree && !hasPaidPlan;

  const handleViewPromptClick = (e: React.MouseEvent) => {
    let accessGranted = false;
    
    if (hasPurchased) {
      accessGranted = true;
      trackAnalyticsEvent('web_view_prompt', {
        page_id: page.id,
        page_title: pageTitle,
        item_id: page.id,
        item_name: pageTitle,
        item_category: 'landing-page-prompt',
        membership: page.membership,
        action_source: 'prompt-dialog',
      });
    } else {
      runWithAccess(page.membership, () => {
        accessGranted = true;
        if (isSignedIn) {
          trackAnalyticsEvent('web_view_prompt', {
            page_id: page.id,
            page_title: pageTitle,
            item_id: page.id,
            item_name: pageTitle,
            item_category: 'landing-page-prompt',
            membership: page.membership,
            action_source: 'prompt-dialog',
          });
        }
      });
    }

    if (!accessGranted) {
      e.preventDefault();
      return;
    }

    if (!needsEmailGate) {
      e.preventDefault();
      openAndLoadPrompt();
    }
  };

  const triggerButton = (
    <Button
      size="sm"
      variant="outline"
      className="border-blue-500/35 text-blue-400 hover:border-blue-500/55 hover:bg-blue-500/10 hover:text-blue-300"
      type="button"
      onClick={handleViewPromptClick}
    >
      <FileText className="w-4 h-4 mr-2" />
      {t('viewPrompt')}
    </Button>
  );

  const wrappedTrigger = needsEmailGate ? (
    <FreeEmailGate
      title={t('viewPrompt')}
      description={t('unlockPromptDescription')}
      submitText={t('viewPromptNow')}
      onSuccess={openAndLoadPrompt}
    >
      {triggerButton}
    </FreeEmailGate>
  ) : (
    triggerButton
  );

  return (
    <>
      {wrappedTrigger}
      <Dialog open={view !== 'closed'} onOpenChange={open => { if (!open) setView('closed'); }}>
        {view === 'prompt' && (
          <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="flex-row items-start justify-between gap-2 space-y-0 pr-8">
              <DialogTitle className="text-left leading-snug">{pageTitle}</DialogTitle>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleCopy}
                  aria-label={t('copyPrompt')}
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
                  disabled
                >
                    <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                    {t('usePrompt')}
                </Button>
              </div>
            </DialogHeader>
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans select-all">
              {loadingPrompt ? 'Cargando prompt…' : pageDescription}
            </pre>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

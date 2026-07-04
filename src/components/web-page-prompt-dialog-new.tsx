'use client';

import { Button } from '@/components/ui/button';
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
import { trackLoopsEvent } from '@/lib/loops-events';
import type { WebPageEntry } from '@/lib/web-pages';
import { Check, Copy, FileText, Wand2 } from 'lucide-react';
import * as React from 'react';
import { FreeEmailGate } from './free-email-gate';
import { normalizeMembership } from '@/lib/membership-access';
import { pickLocalized, type LocalizedField } from '@/lib/localized-string';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function WebPagePromptDialog({
  page,
  hasPurchased = false,
}: {
  page: WebPageEntry;
  hasPurchased?: boolean;
}) {
  const t = useTranslations('landingPages');
  const locale = useLocale();
  const { toast } = useToast();
  const { runWithAccess, isSignedIn, hasPaidPlan } = useMembershipAccess();
  const { copyWithDailyLimit } = useDailyCopyLimit();
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const pageTitle = pickLocalized(
    page.title as unknown as LocalizedField,
    locale
  );
  const pageDescription = pickLocalized(
    page.description as unknown as LocalizedField,
    locale
  );

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
    void trackLoopsEvent('prompts', {
      pageId: page.id,
      pageTitle: page.title,
      action: 'copy',
    });
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPrompt = () => {
    if (hasPurchased) {
      trackAnalyticsEvent('web_view_prompt', {
        page_id: page.id,
        page_title: pageTitle,
        item_id: page.id,
        item_name: pageTitle,
        item_category: 'landing-page-prompt',
        membership: page.membership,
        action_source: 'prompt-dialog',
      });
      setOpen(true);
      return;
    }

    runWithAccess(page.membership, () => {
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
      void trackLoopsEvent('resources', {
        pageId: page.id,
        pageTitle,
        action: 'open-prompt',
      });
      setOpen(true);
    });
  };

  const isFree = normalizeMembership(page.membership) === 'free';
  const showEmailGate = isFree && !hasPaidPlan;

  const triggerButton = (
    <Button
      size="sm"
      variant="outline"
      className="border-blue-500/35 text-blue-400 hover:border-blue-500/55 hover:bg-blue-500/10 hover:text-blue-300"
      type="button"
      onClick={showEmailGate ? undefined : handleOpenPrompt}
    >
      <FileText className="w-4 h-4 mr-2" />
      {t('viewPrompt')}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showEmailGate ? (
        <FreeEmailGate
          title={t('viewPrompt')}
          description={t('unlockPromptDescription')}
          submitText={t('viewPromptNow')}
          onSuccess={handleOpenPrompt}
        >
          {triggerButton}
        </FreeEmailGate>
      ) : (
        triggerButton
      )}
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
              asChild
            >
              <Link href={`/prompt/edit?prompt=${encodeURIComponent(JSON.stringify({
                type: 'web',
                title: pageTitle,
                description: pageDescription,
                imageUrl: page.imageUrl,
                stack: page.stack,
                tags: page.tags
              }))}`}>
                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                {t('usePrompt')}
              </Link>
            </Button>
          </div>
        </DialogHeader>
        <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans select-all">
          {pageDescription}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

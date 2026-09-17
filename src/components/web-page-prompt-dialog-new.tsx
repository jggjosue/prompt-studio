'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  const [view, setView] = React.useState<'closed' | 'email-gate' | 'prompt'>('closed');
  const [prompt, setPrompt] = React.useState(page.description);
  const [loadingPrompt, setLoadingPrompt] = React.useState(false);

  // Email gate state
  const [email, setEmail] = React.useState('');
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [savingEmail, setSavingEmail] = React.useState(false);
  const [emailSaved, setEmailSaved] = React.useState(false);

  const pageTitle = pickLocalized(
    page.title as unknown as LocalizedField,
    locale
  );
  const pageDescription = pickLocalized(
    prompt as unknown as LocalizedField,
    locale
  );

  // Pre-fill email from signed-in user
  React.useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !email) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user, email]);

  // Check if email was already saved
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmailSaved(!!localStorage.getItem(EMAIL_SAVED_KEY));
    }
  }, []);

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
  const needsEmailGate = isFree && !hasPaidPlan && !emailSaved;

  const handleViewPromptClick = () => {
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
      if (needsEmailGate) {
        setView('email-gate');
      } else {
        openAndLoadPrompt();
      }
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
      if (needsEmailGate) {
        setView('email-gate');
      } else {
        openAndLoadPrompt();
      }
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: tCommon('invalidEmail'),
        description: tCommon('invalidEmailDescription'),
        variant: 'destructive',
      });
      return;
    }
    setSavingEmail(true);
    try {
      const res = await fetch('/api/new-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        localStorage.setItem(EMAIL_SAVED_KEY, 'true');
        setEmailSaved(true);
        // Transition directly to the prompt view
        openAndLoadPrompt();
      } else {
        toast({
          title: tCommon('error'),
          description: tCommon('connectionError'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: tCommon('error'),
        description: tCommon('connectionError'),
        variant: 'destructive',
      });
    } finally {
      setSavingEmail(false);
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

  return (
    <>
      {triggerButton}
      <Dialog open={view !== 'closed'} onOpenChange={open => { if (!open) setView('closed'); }}>
        {view === 'email-gate' && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('viewPrompt')}</DialogTitle>
              <DialogDescription>{t('unlockPromptDescription')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex flex-col gap-3">
                <Input
                  type="email"
                  placeholder={tCommon('emailPlaceholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full"
                  autoFocus
                />
                <div className="flex items-center gap-2 px-1 text-sm">
                  <input
                    type="checkbox"
                    id="accept-terms-prompt"
                    checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-slate-900 border-white/10 cursor-pointer"
                  />
                  <label htmlFor="accept-terms-prompt" className="text-muted-foreground select-none cursor-pointer">
                    {tCommon('acceptTerms')}{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      {tCommon('termsAndServices')}
                    </a>
                  </label>
                </div>
              </div>
              <DialogFooter className="sm:justify-start">
                <Button
                  type="submit"
                  disabled={savingEmail || !acceptedTerms}
                  className="w-full !bg-blue-600 !text-white hover:!bg-blue-700"
                >
                  {savingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {savingEmail ? tCommon('processing') : t('viewPromptNow')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
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
                  asChild
                >
                  <Link href={`/generate-webs?prompt=${encodeURIComponent(JSON.stringify({
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
              {loadingPrompt ? 'Cargando prompt…' : pageDescription}
            </pre>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

'use client';

import { PremiumMembershipButton } from '@/components/web-page-premium-button';
import { WebPagePromptDialog } from '@/components/web-page-prompt-dialog-new';
import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import type { WebPageEntry } from '@/lib/web-pages';

type WebPageCardActionsProps = {
  page: WebPageEntry;
  hasPremium: boolean;
  plan?: string | null;
};

export default function WebPageCardActions({
  page,
  hasPremium,
  plan,
}: WebPageCardActionsProps) {
  const { purchasedPages, ready } = useStripeSubscription();
  const hasPurchased = ready && purchasedPages.includes(page.id);

  return (
    <>
      <WebPagePromptDialog page={page} hasPurchased={hasPurchased} />
      <PremiumMembershipButton
        hasPremium={hasPremium}
        pageId={page.id}
        membership={page.membership}
        price={page.price}
        plan={plan}
        pageTitle={page.title}
      />
    </>
  );
}

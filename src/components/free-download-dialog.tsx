'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { FreeEmailGate } from './free-email-gate';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { trackLoopsEvent } from '@/lib/loops-events';
import { useTranslations } from 'next-intl';
import { useMembershipAccess } from '@/hooks/use-membership-access';

export function FreeDownloadDialog({ pageId, pageTitle }: { pageId: string; pageTitle?: string }) {
  const { toast } = useToast();
  const t = useTranslations('landingPages');
  const { hasPaidPlan } = useMembershipAccess();

  const handleSuccess = async () => {
    trackAnalyticsEvent('web_download_free', {
      page_id: pageId,
      page_title: pageTitle ?? pageId,
      item_id: pageId,
      item_name: pageTitle ?? pageId,
      item_category: 'landing-page',
      membership: 'free',
      action_source: 'free-download-dialog',
    });
    void trackLoopsEvent('download', {
      pageId,
      pageTitle,
      source: 'free-download-dialog',
    });

    try {
      const downloadUrl = `/api/landing-pages/${encodeURIComponent(pageId)}/download`;
      const response = await fetch(downloadUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blobUrl = URL.createObjectURL(await response.blob());
      const disposition = response.headers.get('content-disposition');
      const fileName =
        disposition?.match(/filename="([^"]+)"/i)?.[1] ??
        `${pageId}.zip`;
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);

      toast({
        title: t('downloadStarted'),
        description: t('downloadStartedDescription'),
      });
    } catch (error) {
      console.error('Unable to download landing page ZIP', error);
      toast({
        title: t('downloadFailed'),
        description: t('downloadFailedDescription'),
        variant: 'destructive',
      });
    }
  };

  const triggerButton = (
    <Button
      size="sm"
      variant="secondary"
      className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
      onClick={hasPaidPlan ? handleSuccess : undefined}
    >
      <Download className="mr-2 h-4 w-4" />
      {t('download')}
    </Button>
  );

  return hasPaidPlan ? (
    triggerButton
  ) : (
    <FreeEmailGate
      title={t('downloadComponent')}
      description={t('downloadDescription')}
      submitText={t('downloadNow')}
      onSuccess={handleSuccess}
    >
      {triggerButton}
    </FreeEmailGate>
  );
}

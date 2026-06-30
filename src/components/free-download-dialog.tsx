'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { FreeEmailGate } from './free-email-gate';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { trackLoopsEvent } from '@/lib/loops-events';
import { useTranslations } from 'next-intl';

export function FreeDownloadDialog({ pageId, pageTitle }: { pageId: string; pageTitle?: string }) {
  const { toast } = useToast();
  const t = useTranslations('landingPages');

  const handleSuccess = () => {
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
    
    // Trigger the actual download programmatically
    const downloadUrl = `/api/landing-pages/${encodeURIComponent(pageId)}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t('downloadStarted'),
      description: t('downloadStartedDescription'),
    });
  };

  return (
    <FreeEmailGate
      title={t('downloadComponent')}
      description={t('downloadDescription')}
      submitText={t('downloadNow')}
      onSuccess={handleSuccess}
    >
      <Button
        size="sm"
        variant="secondary"
        className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
      >
        <Download className="mr-2 h-4 w-4" />
        {t('download')}
      </Button>
    </FreeEmailGate>
  );
}

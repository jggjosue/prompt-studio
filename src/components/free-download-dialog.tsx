'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { FreeEmailGate } from './free-email-gate';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { trackLoopsEvent } from '@/lib/loops-events';

export function FreeDownloadDialog({ pageId, pageTitle }: { pageId: string; pageTitle?: string }) {
  const { toast } = useToast();

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
      title: '¡Descarga iniciada!',
      description: 'Tu archivo se está descargando.',
    });
  };

  return (
    <FreeEmailGate
      title="Descargar Componente"
      description="Ingresa tu correo electrónico para comenzar la descarga gratuita."
      submitText="Descargar ahora"
      onSuccess={handleSuccess}
    >
      <Button
        size="sm"
        variant="secondary"
        className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
    </FreeEmailGate>
  );
}

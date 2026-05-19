import { InternalLinkHub } from '@/components/internal-link-hub';
import {
  getChildLinks,
  getTier1Hubs,
} from '@/lib/internal-link-graph';
import { getTranslations } from 'next-intl/server';

/** Hub de enlaces internos en la home (distribución de autoridad tier 1 → tier 2). */
export async function HomeLinkHub() {
  const t = await getTranslations('internalLinks');
  const primaryLinks = getTier1Hubs();

  const secondaryRaw = [
    ...getChildLinks('/image-prompts'),
    ...getChildLinks('/video-prompts'),
    ...getChildLinks('/landing-pages'),
  ];
  const seen = new Set<string>();
  const secondaryLinks = secondaryRaw.filter(link => {
    if (seen.has(link.path)) return false;
    seen.add(link.path);
    return true;
  });

  return (
    <div className="container">
      <InternalLinkHub
        title={t('hubTitle')}
        subtitle={t('hubSubtitle')}
        primaryLinks={primaryLinks}
        secondaryLinks={secondaryLinks}
      />
    </div>
  );
}

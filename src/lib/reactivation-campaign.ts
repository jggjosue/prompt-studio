import { buildEmailUrl } from '@/lib/email-attribution';

export type ReactivationWindow = '7d' | '30d';
export type PriorCategory = 'image' | 'video' | 'web' | 'prompt' | 'unknown';

export type ReactivationCandidate = {
  userId: string;
  lastActiveAt: Date;
  priorCategory?: PriorCategory;
  purchased: boolean;
  marketingEligible: boolean;
  previousReactivationCount: number;
};

export function reactivationWindow(candidate: ReactivationCandidate, now = new Date()): ReactivationWindow | null {
  if (candidate.purchased || !candidate.marketingEligible || candidate.previousReactivationCount >= 2) return null;
  const inactiveDays = (now.getTime() - candidate.lastActiveAt.getTime()) / 86_400_000;
  if (inactiveDays >= 30 && candidate.previousReactivationCount < 2) return '30d';
  if (inactiveDays >= 7 && candidate.previousReactivationCount === 0) return '7d';
  return null;
}

export function reactivationReason(category: PriorCategory = 'unknown') {
  const reasons: Record<PriorCategory, string> = {
    image: 'Vuelve a crear una imagen a partir de tu último flujo.',
    video: 'Retoma tus ideas y genera tu próximo video.',
    web: 'Continúa construyendo y mejorando tu proyecto web.',
    prompt: 'Reutiliza tus prompts guardados para crear algo nuevo.',
    unknown: 'Vuelve a Prompt Studio y continúa desde donde lo dejaste.',
  };
  return reasons[category];
}

export function reactivationUrl(origin: string, window: ReactivationWindow, category: PriorCategory = 'unknown') {
  const path = category === 'image' ? '/image' : category === 'video' ? '/video' : category === 'web' ? '/web' : '/';
  const campaignId = `reactivation_${window}_${category}`;
  return buildEmailUrl(new URL(path, origin).toString(), {
    campaignId,
    sequenceId: 'inactive_user_reactivation',
    lifecycleTrigger: `inactive_${window}`,
    utmCampaign: campaignId,
  });
}

import { buildEmailUrl } from '@/lib/email-attribution';

export const ONBOARDING_SEQUENCE_ID = 'onboarding_v1';

export type OnboardingBehavior = 'image' | 'video' | 'web' | 'unknown';

export type OnboardingStep = {
  step: 1 | 2 | 3 | 4 | 5;
  delayHours: number;
  topic: 'tutorials' | 'offers';
  campaignId: string;
  subject: string;
  headline: string;
  body: string;
  ctaLabel: string;
  destinationPath: string;
  stopAfterPurchase: boolean;
};

export const ONBOARDING_SEQUENCE: readonly OnboardingStep[] = [
  { step: 1, delayHours: 0, topic: 'tutorials', campaignId: 'onboarding_welcome', subject: 'Crea tu primer resultado en Prompt Studio', headline: 'La ruta más rápida al valor', body: 'Empieza con un flujo corto y termina una creación útil en pocos minutos.', ctaLabel: 'Crear ahora', destinationPath: '/dashboard', stopAfterPurchase: false },
  { step: 2, delayHours: 24, topic: 'tutorials', campaignId: 'onboarding_free_workflows', subject: 'Un flujo gratuito para tu próxima creación', headline: 'Continúa desde lo que ya haces', body: 'Te mostramos un flujo gratuito relevante para tu primera señal de uso.', ctaLabel: 'Ver flujo recomendado', destinationPath: '/dashboard', stopAfterPurchase: false },
  { step: 3, delayHours: 72, topic: 'tutorials', campaignId: 'onboarding_tutorial', subject: 'Tutorial: termina un resultado concreto', headline: 'De idea a resultado', body: 'Sigue un tutorial práctico, con un objetivo claro y sin pasos innecesarios.', ctaLabel: 'Abrir tutorial', destinationPath: '/dashboard', stopAfterPurchase: false },
  { step: 4, delayHours: 120, topic: 'offers', campaignId: 'onboarding_premium_outcome', subject: 'Qué cambia cuando necesitas más capacidad', headline: 'Resultados Premium, sin promesas vagas', body: 'Compara el flujo gratuito con las capacidades Premium y decide si encaja con tu trabajo.', ctaLabel: 'Explorar Premium', destinationPath: '/pricing', stopAfterPurchase: true },
  { step: 5, delayHours: 168, topic: 'offers', campaignId: 'onboarding_paid_cta', subject: '¿Quieres seguir creando con Premium?', headline: 'Tu siguiente paso', body: 'Si Prompt Studio ya te aporta valor, puedes ampliar capacidad con un plan de pago.', ctaLabel: 'Ver planes', destinationPath: '/pricing', stopAfterPurchase: true },
];

export function onboardingDestination(step: OnboardingStep, origin: string, behavior: OnboardingBehavior) {
  const destination = new URL(step.destinationPath, origin);
  if (step.step === 2 && behavior !== 'unknown') destination.searchParams.set('workflow', behavior);
  return buildEmailUrl(destination.toString(), {
    campaignId: step.campaignId,
    sequenceId: ONBOARDING_SEQUENCE_ID,
    lifecycleTrigger: 'new_registered',
    utmCampaign: step.campaignId,
  });
}

export function shouldSendOnboardingStep(params: {
  step: OnboardingStep;
  marketingEligible: boolean;
  topicEnabled: boolean;
  purchased: boolean;
}) {
  if (!params.marketingEligible || !params.topicEnabled) return false;
  if (params.purchased && params.step.stopAfterPurchase) return false;
  return true;
}

export function renderOnboardingText(step: OnboardingStep, ctaUrl: string, preferencesUrl: string, unsubscribeUrl: string) {
  return [
    step.headline,
    '',
    step.body,
    '',
    `${step.ctaLabel}: ${ctaUrl}`,
    '',
    `Preferencias: ${preferencesUrl}`,
    `Cancelar suscripción: ${unsubscribeUrl}`,
  ].join('\n');
}

import 'server-only';
import TrainingConsentRecord, { TRAINING_CONSENT_POLICY_VERSION } from '@/models/TrainingConsentRecord';

export type AuthoritativeTrainingConsent = {
  training: boolean;
  version: string;
  capturedAt: Date;
  source: 'account';
};

export async function resolveAuthoritativeTrainingConsent(userId: string): Promise<AuthoritativeTrainingConsent> {
  const latest = await TrainingConsentRecord.findOne({ userId }).sort({ changedAt: -1, _id: -1 }).lean();
  const valid = Boolean(
    latest &&
    latest.training === true &&
    latest.policyVersion === TRAINING_CONSENT_POLICY_VERSION &&
    !latest.revokedAt,
  );
  return {
    training: valid,
    version: latest?.policyVersion ?? 'not-captured',
    capturedAt: latest?.changedAt ?? new Date(0),
    source: 'account',
  };
}

export function trainingEligibilityFromConsent(consent: AuthoritativeTrainingConsent, evaluatedAt = new Date()) {
  if (!consent.training) {
    return {
      status: 'ineligible' as const,
      reasonCodes: ['training_consent_missing_or_stale'],
      evaluatedAt,
      evaluatorVersion: 'consent-gate-v1',
    };
  }
  return {
    status: 'pending' as const,
    reasonCodes: [],
    evaluatedAt: null,
    evaluatorVersion: 'consent-gate-v1',
  };
}

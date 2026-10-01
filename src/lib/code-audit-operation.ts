import 'server-only';

import { getAIOperation, type AIOperationCode } from '@/lib/ai-operation-catalog';

export type CodeAuditTier = 'small' | 'standard' | 'advanced' | 'project';

const CODE_AUDIT_OPERATION_BY_TIER: Readonly<Record<CodeAuditTier, AIOperationCode>> = Object.freeze({
  small: 'CODE_AUDIT_SMALL',
  standard: 'CODE_AUDIT_STANDARD',
  advanced: 'CODE_AUDIT_ADVANCED',
  project: 'CODE_AUDIT_PROJECT',
});

export function isCodeAuditTier(value: unknown): value is CodeAuditTier {
  return value === 'small' || value === 'standard' || value === 'advanced' || value === 'project';
}

function projectAuditCredits(input: Record<string, unknown>, minimum: number): number {
  const fileCount = typeof input.fileCount === 'number' && Number.isFinite(input.fileCount)
    ? Math.max(1, Math.floor(input.fileCount))
    : 1;
  const lineCount = typeof input.lineCount === 'number' && Number.isFinite(input.lineCount)
    ? Math.max(0, Math.floor(input.lineCount))
    : 0;

  const fileSurcharge = Math.ceil(Math.max(0, fileCount - 10) / 10) * 10;
  const lineSurcharge = Math.ceil(Math.max(0, lineCount - 5000) / 5000) * 10;
  return Math.max(minimum, minimum + fileSurcharge + lineSurcharge);
}

export function resolveCodeAuditOperation(input: Record<string, unknown>): {
  operation: ReturnType<typeof getAIOperation>;
  creditCost: number;
} {
  const requestedTier = input.codeAuditTier;
  if (!isCodeAuditTier(requestedTier)) throw new Error('CODE_AUDIT_TIER_REQUIRED');
  const operation = getAIOperation(CODE_AUDIT_OPERATION_BY_TIER[requestedTier]);
  return {
    operation,
    creditCost: requestedTier === 'project'
      ? projectAuditCredits(input, operation.creditCost)
      : operation.creditCost,
  };
}

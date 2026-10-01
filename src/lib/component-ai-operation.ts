import 'server-only';

import { getAIOperation, type AIOperationCode } from '@/lib/ai-operation-catalog';

export type ComponentOperation = 'preview' | 'analysis' | 'modification' | 'generation';

const COMPONENT_OPERATION_CODE: Readonly<Record<ComponentOperation, AIOperationCode>> = Object.freeze({
  preview: 'COMPONENT_PREVIEW',
  analysis: 'COMPONENT_AI_ANALYSIS',
  modification: 'COMPONENT_AI_MODIFICATION',
  generation: 'COMPONENT_AI_GENERATION',
});

export function isComponentOperation(value: unknown): value is ComponentOperation {
  return value === 'preview' || value === 'analysis' || value === 'modification' || value === 'generation';
}

export function resolveComponentOperation(input: Record<string, unknown>): ReturnType<typeof getAIOperation> {
  const requestedOperation = input.componentOperation;
  if (!isComponentOperation(requestedOperation)) throw new Error('COMPONENT_OPERATION_REQUIRED');
  return getAIOperation(COMPONENT_OPERATION_CODE[requestedOperation]);
}

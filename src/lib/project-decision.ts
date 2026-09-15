export const decisionTypes = ['prompt', 'model', 'result', 'publication'] as const;
export const decisionStatuses = ['approved', 'rejected', 'published'] as const;
export type DecisionType = typeof decisionTypes[number];
export type DecisionStatus = typeof decisionStatuses[number];

export function isDecisionType(value: unknown): value is DecisionType {
  return decisionTypes.includes(value as DecisionType);
}

export function isDecisionStatus(value: unknown): value is DecisionStatus {
  return decisionStatuses.includes(value as DecisionStatus);
}

export function decisionReferenceRequirements(type: DecisionType, status: DecisionStatus) {
  return {
    jobRequired: type === 'model' || type === 'result' || status === 'published',
    publicationRequired: type === 'publication' || status === 'published',
    promptVersionAllowed: type === 'prompt',
  };
}

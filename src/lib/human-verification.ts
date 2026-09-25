export type HumanVerificationStatus = 'draft' | 'review' | 'approved' | 'published';

export type HumanVerificationInput = {
  costly: boolean;
  sensitive: boolean;
  reviewStatus: HumanVerificationStatus | null | undefined;
  hasOpenChanges: boolean;
};

export type HumanVerificationDecision = {
  required: boolean;
  approved: boolean;
  reasons: Array<'expensive_operation' | 'sensitive_result' | 'open_change_requests'>;
};

/**
 * A client acknowledgement is not evidence of human review. Approval must
 * already exist on the server-owned project workflow and remain invalid while
 * a reviewer has unresolved change requests.
 */
export function humanVerificationDecision(input: HumanVerificationInput): HumanVerificationDecision {
  const reasons: HumanVerificationDecision['reasons'] = [];
  if (input.costly) reasons.push('expensive_operation');
  if (input.sensitive) reasons.push('sensitive_result');
  if (input.hasOpenChanges) reasons.push('open_change_requests');
  const required = input.costly || input.sensitive;
  const reviewed = input.reviewStatus === 'approved' || input.reviewStatus === 'published';
  return { required, approved: !required || (reviewed && !input.hasOpenChanges), reasons };
}

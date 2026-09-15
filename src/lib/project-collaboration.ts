import crypto from 'node:crypto';

export type ProjectRole = 'owner' | 'editor' | 'reviewer';
export type ReviewStatus = 'draft' | 'review' | 'approved' | 'published';
export const reviewStatuses: ReviewStatus[] = ['draft', 'review', 'approved', 'published'];

export function canEditProject(role: ProjectRole) { return role === 'owner' || role === 'editor'; }
export function canManageTeam(role: ProjectRole) { return role === 'owner'; }
export function canReview(role: ProjectRole) { return role === 'owner' || role === 'reviewer'; }
export function canTransitionReview(role: ProjectRole, from: ReviewStatus, to: ReviewStatus) {
  if (!reviewStatuses.includes(to)) return false;
  if (to === 'published') return role === 'owner' && from === 'approved';
  if (to === 'approved') return canReview(role) && from === 'review';
  if (to === 'review') return canEditProject(role) && (from === 'draft' || from === 'approved');
  return canEditProject(role);
}
export function normalizeCollaboratorEmail(value: unknown) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320 ? email : null;
}
export function createClientToken() { return crypto.randomBytes(32).toString('base64url'); }
export function hashClientToken(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }

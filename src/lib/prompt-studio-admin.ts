export function isPromptStudioAdminEmail(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;

  return [
    process.env.PROMPT_STUDIO_CREATOR_JO,
    process.env.PROMPT_STUDIO_PRO_JO,
    process.env.PROMPT_STUDIO_STUDIO_JO,
    process.env.PROMPT_STUDIO_PREMIUM_JO,
  ].some(candidate => candidate?.trim().toLowerCase() === normalized);
}

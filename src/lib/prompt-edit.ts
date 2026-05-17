export const PROMPT_EDIT_PATH = '/prompt/edit';

/** Set to true when the prompt editor route should be available. */
export const PROMPT_EDIT_ENABLED = false;

export function isPromptEditHref(href: string): boolean {
  if (!href) return false;
  const path = href.startsWith('http')
    ? new URL(href).pathname
    : href.split('?')[0];
  return path === PROMPT_EDIT_PATH;
}

export function isPromptEditEnabled(): boolean {
  return PROMPT_EDIT_ENABLED;
}

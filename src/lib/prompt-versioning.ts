export const PROMPT_VERSION_ACTIONS = ['saved', 'duplicated', 'restored'] as const;
export type PromptVersionAction = typeof PROMPT_VERSION_ACTIONS[number];

export function isPromptVersionAction(value: unknown): value is PromptVersionAction {
  return typeof value === 'string' && (PROMPT_VERSION_ACTIONS as readonly string[]).includes(value);
}

export function sanitizeModelSnapshot(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(item => typeof item === 'string').map(item => item.trim().slice(0, 80)).filter(Boolean))].slice(0, 12);
}

export function changedLines(before: string, after: string) {
  const left = before.split('\n');
  const right = after.split('\n');
  const length = Math.max(left.length, right.length);
  const changes: Array<{ line: number; before: string; after: string }> = [];
  for (let index = 0; index < length; index += 1) {
    if ((left[index] || '') !== (right[index] || '')) changes.push({ line: index + 1, before: left[index] || '', after: right[index] || '' });
  }
  return changes;
}


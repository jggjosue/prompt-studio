export type EmailTemplateInput = {
  title: string;
  previewText: string;
  body: string[];
  cta?: { label: string; url: string };
  footerLinks?: Array<{ label: string; url: string }>;
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

export function isPromptStudioLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'promptstudio.com' || url.hostname.endsWith('.promptstudio.com') || url.hostname.endsWith('.vercel.app'));
  } catch { return false; }
}

export function validateEmailTemplate(input: EmailTemplateInput) {
  const links = [...(input.cta ? [input.cta] : []), ...(input.footerLinks ?? [])];
  const errors: string[] = [];
  if (!input.title.trim()) errors.push('missing_heading');
  if (!input.previewText.trim()) errors.push('missing_preview_text');
  if (links.some((link) => !link.label.trim())) errors.push('missing_link_label');
  if (links.some((link) => !isPromptStudioLink(link.url))) errors.push('unexpected_link_domain');
  if (links.some((link) => /placeholder|example\.com|todo/i.test(link.url))) errors.push('placeholder_link');
  return errors;
}

export function renderBrandedEmail(input: EmailTemplateInput) {
  const preview = escapeHtml(input.previewText);
  const paragraphs = input.body.map((line) => `<p style="margin:0 0 16px;line-height:1.6">${escapeHtml(line)}</p>`).join('');
  const cta = input.cta ? `<p><a href="${escapeHtml(input.cta.url)}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#111;color:#fff;text-decoration:none" aria-label="${escapeHtml(input.cta.label)}">${escapeHtml(input.cta.label)}</a></p>` : '';
  const footer = (input.footerLinks ?? []).map((link) => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join(' · ');
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div style="display:none;max-height:0;overflow:hidden">${preview}</div><main style="max-width:600px;margin:auto;padding:24px;font-family:Arial,sans-serif"><header><strong>Prompt Studio</strong></header><h1 style="font-size:28px;line-height:1.2">${escapeHtml(input.title)}</h1>${paragraphs}${cta}<footer style="margin-top:32px;font-size:13px">${footer}</footer></main></body></html>`;
  const text = [input.title, '', ...input.body, ...(input.cta ? ['', `${input.cta.label}: ${input.cta.url}`] : []), ...(input.footerLinks?.map((link) => `${link.label}: ${link.url}`) ?? [])].join('\n');
  return { html, text };
}

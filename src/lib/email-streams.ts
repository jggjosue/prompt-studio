import 'server-only';

export type EmailStream = 'transactional' | 'lifecycle' | 'outreach';

type EmailStreamConfig = {
  stream: EmailStream;
  from: string;
  replyTo?: string;
};

const ENV_BY_STREAM: Record<EmailStream, { from: string; replyTo: string }> = {
  transactional: { from: 'RESEND_TRANSACTIONAL_EMAIL', replyTo: 'RESEND_TRANSACTIONAL_REPLY_TO' },
  lifecycle: { from: 'RESEND_LIFECYCLE_EMAIL', replyTo: 'RESEND_LIFECYCLE_REPLY_TO' },
  outreach: { from: 'RESEND_OUTREACH_EMAIL', replyTo: 'RESEND_OUTREACH_REPLY_TO' },
};

export function getEmailStreamConfig(stream: EmailStream): EmailStreamConfig | null {
  const names = ENV_BY_STREAM[stream];
  // RESEND_EMAIL remains a compatibility fallback for transactional mail only.
  // Marketing/outreach must opt into their dedicated identities.
  const from =
    process.env[names.from]?.trim() ||
    (stream === 'transactional' ? process.env.RESEND_EMAIL?.trim() : undefined);

  if (!from) return null;

  const replyTo = process.env[names.replyTo]?.trim() || undefined;
  return { stream, from, replyTo };
}

import fs from 'node:fs';

const requiredEnv = ['RESEND_API_KEY', 'RESEND_EMAIL'];
const envExample = fs.readFileSync('.env.example', 'utf8');
const transactional = fs.readFileSync('src/lib/transactional-email.ts', 'utf8');
const runbookPath = 'docs/operations/resend-deliverability.md';

const failures = [];

for (const name of requiredEnv) {
  if (!new RegExp('^' + name + '=', 'm').test(envExample)) {
    failures.push(`.env.example is missing ${name}`);
  }
}

if (/NEXT_PUBLIC_RESEND_(API_KEY|EMAIL)/.test(envExample)) {
  failures.push('Resend server configuration must not use NEXT_PUBLIC_* variables');
}

if (!transactional.includes('process.env.RESEND_EMAIL')) {
  failures.push('transactional email must use the configured RESEND_EMAIL sender');
}

if (!fs.existsSync(runbookPath)) {
  failures.push(`missing deliverability runbook: ${runbookPath}`);
}

if (failures.length) {
  console.error('Resend deliverability repository audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Resend deliverability repository audit passed.');
console.log('Live SPF/DKIM/DMARC and Resend Deliverability Insights still require the operational checklist.');

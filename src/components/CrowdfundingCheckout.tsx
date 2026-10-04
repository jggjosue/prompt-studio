'use client';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { LockKeyhole, Sparkles } from 'lucide-react';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { trackInterest } from '@/lib/interest-analytics';
import { buildCrowdfundingCheckoutUrl } from '@/lib/crowdfunding-checkout';

const PRESETS = [10, 25, 50, 100, 250, 500, 1000] as const;

/** 1 Prompt Credit = $0.01 USD — same rule as plans and top-ups. */
const FOUNDER_BASE_CREDITS_PER_USD = 100;

const BONUS_TIERS = [
  { pledgeAmountCents: 100000, bonusPercent: 20 },
  { pledgeAmountCents:  50000, bonusPercent: 17 },
  { pledgeAmountCents:  25000, bonusPercent: 15 },
  { pledgeAmountCents:  10000, bonusPercent: 12 },
  { pledgeAmountCents:   5000, bonusPercent: 10 },
  { pledgeAmountCents:   2500, bonusPercent:  7 },
  { pledgeAmountCents:   1000, bonusPercent:  5 },
] as const;

function calcCredits(amountUsd: number) {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return null;
  const cents = Math.round(amountUsd * 100);
  const tier = BONUS_TIERS.find((t) => cents >= t.pledgeAmountCents);
  const base = Math.floor((cents / 100) * FOUNDER_BASE_CREDITS_PER_USD);
  const bonusPct = tier?.bonusPercent ?? 0;
  const bonus = Math.floor(base * bonusPct / 100);
  return { base, bonusPct, bonus, total: base + bonus };
}

type CrowdfundingCheckoutProps = {
  amount: number;
  customAmount: string;
  onAmountChange: (amount: number) => void;
  onCustomAmountChange: (amount: string) => void;
};

export function CrowdfundingCheckout({ amount, customAmount, onAmountChange, onCustomAmountChange }: CrowdfundingCheckoutProps) {
  const locale = useLocale();
  const es = locale.startsWith('es');
  const [error, setError] = useState('');

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const preview = calcCredits(effectiveAmount);

  const checkout = () => {
    const selected = effectiveAmount;
    if (!Number.isFinite(selected) || selected < 10 || selected > 10000) {
      setError(es ? 'El aporte debe estar entre $10 y $10,000 USD.' : 'Contribution must be between $10 and $10,000 USD.');
      return;
    }
    const paymentLink = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_CROWFUNDING;
    if (!paymentLink) {
      setError(es ? 'El checkout no está disponible temporalmente. Inténtalo de nuevo.' : 'Checkout is temporarily unavailable. Please try again.');
      return;
    }
    trackInterest('crowdfunding_checkout_click', { amount_usd: selected, amount_type: customAmount ? 'custom' : 'preset' });
    const url = buildCrowdfundingCheckoutUrl(paymentLink, selected);
    trackAnalyticsEvent('begin_checkout', { value: selected, currency: 'USD', item_category: 'crowdfunding', action_source: 'stripe_payment_link' });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-950/70 p-6 shadow-[0_30px_100px_rgba(37,99,235,.18)] backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.18em] text-cyan-300">
        <LockKeyhole className="h-4 w-4" />
        Stripe Checkout
      </div>
      <h2 className="mt-3 text-3xl font-black text-white">{es ? 'Apoya el crowdfunding' : 'Support the crowdfunding'}</h2>
      <p className="mt-3 text-slate-300">{es ? 'Elige un monto o escribe otro. Stripe procesa el pago de forma segura.' : 'Choose an amount or enter another one. Stripe securely processes the payment.'}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {PRESETS.map(value => (
          <button
            key={value}
            type="button"
            onClick={() => {
              trackInterest('crowdfunding_amount_click', { amount_usd: value });
              onAmountChange(value);
            }}
            aria-pressed={!customAmount && amount === value}
            className={
              'rounded-2xl border px-4 py-4 text-lg font-black transition ' +
              (!customAmount && amount === value
                ? 'border-cyan-300 bg-cyan-300/15 text-cyan-200'
                : 'border-white/10 bg-white/[.04] text-white hover:border-cyan-300/50')
            }
          >
            ${value}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-sm font-semibold text-slate-200">
        {es ? 'Otro monto (USD)' : 'Other amount (USD)'}
        <input
          value={customAmount}
          onChange={e => onCustomAmountChange(e.target.value)}
          type="number"
          min="10"
          max="10000"
          step="1"
          placeholder="250"
          className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-4 text-white outline-none focus:border-cyan-300"
        />
      </label>

      {/* Credit preview — shown for any valid amount */}
      {preview && (
        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-500/[.06] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/70">
            {es ? 'Recibirás' : "You'll receive"}
          </p>
          <p className="mt-1 text-3xl font-black text-white tabular-nums">
            {preview.total.toLocaleString()}{' '}
            <span className="text-base font-medium text-slate-300">Founder Credits</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
            <span>{preview.base.toLocaleString()} {es ? 'base' : 'base'}</span>
            {preview.bonusPct > 0 && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Sparkles className="h-3 w-3" />
                +{preview.bonus.toLocaleString()} bonus ({preview.bonusPct}%)
              </span>
            )}
            <span className="text-slate-500">· 1 cr = $0.01 USD</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={checkout}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-6 font-black text-white shadow-[0_0_32px_rgba(37,99,235,.32)] transition hover:scale-[1.01]"
      >
        {es ? 'Continuar con Stripe' : 'Continue with Stripe'} · ${Number.isFinite(Number(customAmount || amount)) ? Number(customAmount || amount) : amount}
      </button>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <p className="mt-4 text-xs leading-5 text-slate-400">
        {es
          ? 'Los Founder Credits no se acreditan inmediatamente al pagar. Se habilitan después de que termine la campaña, Magzin LLC haya recibido el pago y el backer sea verificado. No es necesario alcanzar el 100% de la meta.'
          : 'Founder Credits are not granted immediately at payment. They become available after the campaign ends, Magzin LLC has received the payment, and the backer is verified. Reaching 100% of the funding goal is not required.'}
      </p>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { CrowdfundingCheckout } from '@/components/CrowdfundingCheckout';
import { CrowdfundingCreditCalculator } from '@/components/CrowdfundingCreditCalculator';

const PRESETS = [10, 25, 50, 100, 250, 500, 1000];

export function CrowdfundingCalculatorCheckout() {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');

  /** Selects a preset — clears any custom input. */
  const selectAmount = (value: number) => {
    setAmount(value);
    setCustomAmount(PRESETS.includes(value) ? '' : String(value));
  };

  /** Called when the user types a custom value in either widget. */
  const updateCustomAmount = (value: string) => {
    setCustomAmount(value);
    const parsed = Number(value);
    if (value.trim() && Number.isFinite(parsed)) setAmount(parsed);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CrowdfundingCreditCalculator amount={amount} onAmountChange={selectAmount} />
      <CrowdfundingCheckout
        amount={amount}
        customAmount={customAmount}
        onAmountChange={selectAmount}
        onCustomAmountChange={updateCustomAmount}
      />
    </div>
  );
}

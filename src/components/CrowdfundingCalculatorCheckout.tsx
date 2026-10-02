'use client';

import { useState } from 'react';
import { CrowdfundingCheckout } from '@/components/CrowdfundingCheckout';
import { CrowdfundingCreditCalculator } from '@/components/CrowdfundingCreditCalculator';

export function CrowdfundingCalculatorCheckout() {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');

  const selectAmount = (value: number) => {
    setAmount(value);
    setCustomAmount([50, 100, 500, 1000].includes(value) ? '' : String(value));
  };

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

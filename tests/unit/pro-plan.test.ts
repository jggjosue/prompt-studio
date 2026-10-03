import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { getPlanPrice, planAtLeast, getPlanCredits, type PlanId } from '../../src/lib/subscription-plans.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('five-tier hierarchy is ordered correctly', () => {
  const order: PlanId[] = ['free', 'premium', 'creator', 'pro', 'studio'];
  for (let i = 0; i < order.length; i += 1) {
    for (let j = 0; j < order.length; j += 1) {
      assert.equal(planAtLeast(order[i], order[j]), i >= j);
    }
  }
});

test('plan prices match the published five-tier ladder', () => {
  assert.equal(getPlanPrice('premium', 'monthly'), 9);
  assert.equal(getPlanPrice('premium', 'annual'), 90);
  assert.equal(getPlanPrice('creator', 'monthly'), 19);
  assert.equal(getPlanPrice('creator', 'annual'), 190);
  assert.equal(getPlanPrice('pro', 'monthly'), 29);
  assert.equal(getPlanPrice('pro', 'annual'), 290);
  assert.equal(getPlanPrice('studio', 'monthly'), 39);
  assert.equal(getPlanPrice('studio', 'annual'), 390);
});

test('monthly and annual credits preserve commercial value', () => {
  assert.equal(getPlanCredits('free', 'monthly'), 0);
  const expected = {
    premium: [500, 6000],
    creator: [1000, 12000],
    pro: [1500, 18000],
    studio: [3000, 36000],
  } as const;
  for (const [plan, [monthly, annual]] of Object.entries(expected) as Array<[keyof typeof expected, readonly [number, number]]>) {
    assert.equal(getPlanCredits(plan, 'monthly'), monthly);
    assert.equal(getPlanCredits(plan, 'annual'), annual);
    assert.ok(getPlanPrice(plan, 'monthly') / monthly >= 0.01);
    assert.ok(getPlanPrice(plan, 'annual') / annual >= 0.01);
  }
});

test('feature gates use hierarchy', async () => {
  const status = await source('src/lib/server-subscription-status.ts');
  assert.ok(status.includes("planAtLeast(status.plan, 'premium')"));
  assert.ok(status.includes("planAtLeast(status.plan, 'creator')"));
  assert.ok(status.includes("planAtLeast(status.plan, 'pro')"));
});

test('pricing page renders all five plans and pending credits', async () => {
  const prices = await source('src/app/[locale]/prices/prices-client.tsx');
  for (const id of ["'free'", "'premium'", "'creator'", "'pro'", "'studio'"]) assert.ok(prices.includes(id));
  assert.ok(prices.includes('pendingCreditsLabel'));
  assert.ok(prices.includes('creditUseTitle'));
});

test('checkout never falls back Creator to legacy $35 Premium web-plan link', async () => {
  const checkout = await source('src/lib/stripe-checkout.ts');
  assert.ok(checkout.includes('NEXT_PUBLIC_STRIPE_CREATOR_PLUS_MONTHLY'));
  assert.ok(!/getCreatorStripeCheckoutUrl[\s\S]*NEXT_PUBLIC_STRIPE_CHECKOUT_PREMIUM_PLAN/.test(checkout));
});

test('translations include all five plan names in both languages', async () => {
  for (const locale of ['es', 'en']) {
    const messages = JSON.parse(await source(`messages/${locale}.json`)) as { prices?: Record<string, unknown> };
    for (const key of ['freeName','premiumName','creatorName','proName','studioName']) {
      assert.ok(messages.prices?.[key], `missing prices.${key} in ${locale}`);
    }
  }
});

test('pending plan credits explain crowdfunding lock and link to the campaign', async () => {
  const prices = await source('src/app/[locale]/prices/prices-client.tsx');
  const wallet = await source('src/app/[locale]/dashboard/credits/credits-client.tsx');
  const es = JSON.parse(await source('messages/es.json')) as { prices?: Record<string, string> };
  const en = JSON.parse(await source('messages/en.json')) as { prices?: Record<string, string> };

  assert.ok(prices.includes('href="/crowdfunding"'));
  assert.ok(prices.includes("pendingCreditsLink"));
  assert.ok(wallet.includes('href="/crowdfunding"'));
  assert.match(es.prices?.pendingCreditsNote ?? '', /no se pueden gastar hasta que termine la campaña de crowdfunding/);
  assert.match(en.prices?.pendingCreditsNote ?? '', /cannot be spent until the crowdfunding campaign ends/);
});

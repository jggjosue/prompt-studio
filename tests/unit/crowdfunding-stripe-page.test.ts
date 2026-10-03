import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCrowdfundingCheckoutUrl } from '../../src/lib/crowdfunding-checkout';

test('crowdfunding public page uses official chrome and Stripe CTA', () => {
 const page=fs.readFileSync('src/app/[locale]/crowdfunding/page.tsx','utf8');
 assert.match(page,/Header/); assert.match(page,/Footer/); assert.match(page,/CrowdfundingCalculatorCheckout/);
 assert.match(page,/from-white via-blue-400 to-cyan-300/);
});
test('crowdfunding uses the blue brand palette without pink or violet decoration',()=>{
 const sources=[
  fs.readFileSync('src/app/[locale]/crowdfunding/page.tsx','utf8'),
  fs.readFileSync('src/components/CrowdfundingCheckout.tsx','utf8'),
  fs.readFileSync('src/components/CrowdfundingCreditCalculator.tsx','utf8'),
 ].join('\n');
 assert.match(sources,/bg-blue-600/);
 assert.match(sources,/text-blue-400/);
 assert.doesNotMatch(sources,/(?:violet|pink|fuchsia|purple|rose)-/);
});
test('crowdfunding checkout is server-authoritative and bounded',()=>{
 const route=fs.readFileSync('src/app/api/crowdfunding/checkout/route.ts','utf8');
 assert.match(route,/stripe\.checkout\.sessions\.create/);
 assert.match(route,/amountCents < 1000/); assert.match(route,/amountCents > 100000/);
 assert.match(route,/unit_amount: amountCents/);
 assert.match(route,/purchaseType: 'founder_crowdfunding'/);
 assert.match(route,/fulfillmentStatus: 'pending_campaign_success'/);
 assert.match(route,/customer_creation: 'always'/);
 assert.match(route,/export const runtime = 'nodejs'/);
 assert.doesNotMatch(route,/clerkClient/);
});
test('Stripe server client rejects publishable keys used as secrets',()=>{
 const stripe=fs.readFileSync('src/lib/stripe.ts','utf8');
 assert.match(stripe,/!apiKey\.startsWith\('sk_'\)/);
 assert.match(stripe,/!apiKey\.startsWith\('rk_'\)/);
 assert.match(stripe,/no una clave publicable \(pk_\*\)/);
});
test('crowdfunding checkout UI supports presets and custom amount',()=>{
 const ui=fs.readFileSync('src/components/CrowdfundingCheckout.tsx','utf8');
 for(const amount of ['50','100','500','1000']) assert.match(ui,new RegExp(amount));
assert.match(ui,/Other amount/); assert.match(ui,/Continue with Stripe/);
  assert.match(ui,/NEXT_PUBLIC_STRIPE_CHECKOUT_CROWFUNDING/);
  assert.match(ui,/buildCrowdfundingCheckoutUrl\(paymentLink, selected\)/);
  assert.match(ui,/window\.open\(/);
});
test('payment link uses the selected amount as prefilled_amount',()=>{
  const url=buildCrowdfundingCheckoutUrl('https://buy.stripe.com/7sY3cu89G54C4EcgJn9MY0w?prefilled_amount=5000',100);
  assert.equal(url,'https://buy.stripe.com/7sY3cu89G54C4EcgJn9MY0w?prefilled_amount=10000');
  assert.equal(buildCrowdfundingCheckoutUrl('https://buy.stripe.com/7sY3cu89G54C4EcgJn9MY0w?prefilled_amount=5000',10),'https://buy.stripe.com/7sY3cu89G54C4EcgJn9MY0w?prefilled_amount=1000');
  assert.equal(buildCrowdfundingCheckoutUrl('https://buy.stripe.com/7sY3cu89G54C4EcgJn9MY0w?prefilled_amount=5000',1000),'https://buy.stripe.com/7sY3cu89G54C4EcgJn9MY0w?prefilled_amount=100000');
});
test('calculator and checkout share one selected amount',()=>{
 const wrapper=fs.readFileSync('src/components/CrowdfundingCalculatorCheckout.tsx','utf8');
 assert.match(wrapper,/CrowdfundingCreditCalculator amount=\{amount\}/);
 assert.match(wrapper,/CrowdfundingCheckout/);
 assert.match(wrapper,/amount=\{amount\}/);
 assert.match(wrapper,/onAmountChange=\{selectAmount\}/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('crowdfunding public page uses official chrome and Stripe CTA', () => {
 const page=fs.readFileSync('src/app/[locale]/founder/page.tsx','utf8');
 assert.match(page,/Header/); assert.match(page,/Footer/); assert.match(page,/CrowdfundingCheckout/);
 assert.match(page,/from-white via-cyan-100 to-violet-200/);
});
test('crowdfunding checkout is server-authoritative and bounded',()=>{
 const route=fs.readFileSync('src/app/api/crowdfunding/checkout/route.ts','utf8');
 assert.match(route,/stripe\.checkout\.sessions\.create/);
 assert.match(route,/amountCents < 1000/); assert.match(route,/amountCents > 100000/);
 assert.match(route,/purchaseType: 'founder_crowdfunding'/);
 assert.match(route,/fulfillmentStatus: 'pending_campaign_success'/);
});
test('crowdfunding checkout UI supports presets and custom amount',()=>{
 const ui=fs.readFileSync('src/components/CrowdfundingCheckout.tsx','utf8');
 for(const amount of ['50','100','500','1000']) assert.match(ui,new RegExp(amount));
 assert.match(ui,/Other amount/); assert.match(ui,/Continue with Stripe/);
});

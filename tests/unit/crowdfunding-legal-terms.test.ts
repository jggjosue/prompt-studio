import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('crowdfunding legal terms cover core campaign disclosures',()=>{
 const s=fs.readFileSync('src/app/[locale]/crowdfunding-terms/page.tsx','utf8');
 for(const term of ['non-equity','Founder Credits','Stripe','14 days','refund','Stretch goals','Magzin LLC','Privacy Policy','100%','campaign ends']) assert.match(s,new RegExp(term,'i'));
 assert.match(s,/locale==='es'/);
});
test('crowdfunding legal terms are discoverable from campaign and footer',()=>{
 const page=fs.readFileSync('src/app/[locale]/crowdfunding/page.tsx','utf8');
 const footer=fs.readFileSync('src/components/layout/footer.tsx','utf8');
 assert.match(page,/\/crowdfunding-terms/); assert.match(footer,/\/crowdfunding-terms/);
 assert.match(footer,/Crowdfunding Terms/); assert.match(footer,/Términos de Crowdfunding/);
});

test('crowdfunding landing clearly states credits remain available below the funding goal',()=>{
 const page=fs.readFileSync('src/app/[locale]/crowdfunding/page.tsx','utf8');
 assert.match(page,/even if the campaign does not reach 100%/i);
 assert.match(page,/aunque la campaña no alcance el 100%/i);
});

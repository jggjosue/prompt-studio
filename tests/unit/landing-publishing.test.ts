import test from'node:test';import assert from'node:assert/strict';import{exportLanding,normalizeDomain,publicationSlug}from'../../src/lib/landing-publishing.ts';
test('publicationSlug normalizes unsafe names',()=>{assert.equal(publicationSlug(' Campaña Otoño / 2026! '),'campana-otono-2026')});
test('normalizeDomain accepts hosts and rejects paths',()=>{assert.equal(normalizeDomain('https://www.Example.com/hello'),'www.example.com');assert.equal(normalizeDomain('localhost'),null)});
test('exports HTML and Next.js archives',()=>{const files=[{name:'index.html',data:Buffer.from('<h1>Hola</h1>')},{name:'assets/app.js',data:Buffer.from('ok')}];assert.ok(exportLanding(files,'html','demo').length>0);assert.ok(exportLanding(files,'nextjs','demo').length>0)});

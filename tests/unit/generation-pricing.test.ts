import test from'node:test';import assert from'node:assert/strict';import{actualProviderCost,generationQuote}from'../../src/lib/generation-pricing.ts';
/** Los tres legacy tienen métricas medidas; los nuevos todavía no. */
const MEASURED=['image','video','project']as const;
const UNMEASURED=['text','vision','videoUnderstanding']as const;
const ALL_KINDS=[...MEASURED,...UNMEASURED]as const;
test('quotes use the same server-owned credit prices',()=>{assert.equal(generationQuote('image','openai').credits,18);assert.equal(generationQuote('video','runway').credits,180);assert.equal(generationQuote('project','anthropic').credits,36)});
test('every quote explains cost and automatic refund',()=>{for(const kind of ALL_KINDS){const q=generationQuote(kind,'provider');assert.equal(typeof q.credits,'number',`${kind}: sin créditos`);assert.equal(typeof q.estimatedCostUsd,'number',`${kind}: sin coste`);assert.match(q.refundPolicy,/devuelve automáticamente/)}});
/** Una expectation ausente soltaba `undefined.seconds` y reventaba antes de reservar créditos. */
test('quoting never throws for any kind the queue can run',()=>{for(const kind of ALL_KINDS){assert.doesNotThrow(()=>generationQuote(kind,'provider'),kind)}});
test('measured kinds keep their range, resolution and quality',()=>{for(const kind of MEASURED){const q=generationQuote(kind,'provider');assert.ok(q.estimatedSeconds,`${kind}: perdió el rango`);assert.ok(q.estimatedSeconds!.max>=q.estimatedSeconds!.min,`${kind}: rango inválido`);assert.ok(q.resolution,`${kind}: resolution vacía`);assert.ok(q.quality,`${kind}: quality vacía`)}});
/** Sin telemetría no se inventa un rango: se devuelve null y la interfaz lo dice. */
test('unmeasured kinds report no estimate instead of a fabricated one',()=>{for(const kind of UNMEASURED){const q=generationQuote(kind,'provider');assert.equal(q.estimatedSeconds,null,`${kind}: rango inventado`);assert.equal(q.resolution,null,`${kind}: resolución inventada`);assert.equal(q.quality,null,`${kind}: calidad inventada`)}});
test('actual provider cost remains unknown unless usage reports it',()=>{assert.equal(actualProviderCost({url:'https://example.com/result'}),null);assert.equal(actualProviderCost({usage:{costUsd:0.127}}),0.127);assert.equal(actualProviderCost({usage:{costUsd:-2}}),null)});

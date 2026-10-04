import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Vercel process route delegates to shared generation runtime',()=>{
 const s=fs.readFileSync('src/app/api/ai/jobs/process/route.ts','utf8');
 assert.match(s,/processGenerationJob/); assert.doesNotMatch(s,/runAIJob/); assert.doesNotMatch(s,/captureGenerationCredits/);
});
test('shared runtime owns provider execution and credit reconciliation',()=>{
 // Wiring (production deps) + backend-agnostic core (#836).
 const runtime=fs.readFileSync('src/lib/generation-worker-runtime.ts','utf8');
 const core=fs.readFileSync('src/lib/generation-worker-core.ts','utf8');
 for(const v of ['runProvider: runAIJob','capture: captureGenerationCredits','release: releaseGenerationCredits','claim: claimGenerationJob']) assert.ok(runtime.includes(v),v);
 assert.match(core,/generationRetryDecision\(/);
 assert.match(runtime,/cloud-run:/);
});
test('Cloud Run entrypoint validates minimal task payload and exposes health',()=>{
 const s=fs.readFileSync('workers/generation/server.ts','utf8');
 assert.match(s,/\/healthz/); assert.match(s,/\/readyz/); assert.match(s,/\/tasks\/generation/);
 assert.match(s,/version!==1/); assert.match(s,/mongoose\.isValidObjectId/);
 // 'prompt-studio-ai-worker' is the service name; only a prompt field/read is forbidden.
 assert.doesNotMatch(s,/\bprompt\b(?!-studio)/); assert.doesNotMatch(s,/userEmail/);
});

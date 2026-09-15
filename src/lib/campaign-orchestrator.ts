import type{AIJobKind}from'@/models/AIGenerationJob';
export type CampaignStageKey='landing'|'images'|'video'|'ads'|'social';
export type CampaignTask={stage:CampaignStageKey;label:string;kind:AIJobKind;provider:string;prompt:string};
const rules='Use only facts present in the brief. Do not invent prices, testimonials, certifications, performance claims or customer data. Keep the same positioning, audience and call to action across every deliverable.';
export function buildCampaignTasks(input:{brief:string;audience:string;language:string;imageProvider:string;videoProvider:string;textProvider:string}):CampaignTask[]{const context=`CAMPAIGN BRIEF\n${input.brief}\nTARGET AUDIENCE\n${input.audience||'Audience defined in the brief'}\nLANGUAGE\n${input.language}\nCOORDINATION RULES\n${rules}`;return[
{stage:'landing',label:'Landing page',kind:'project',provider:input.textProvider,prompt:`${context}\n\nCreate a complete conversion-focused landing page specification and production-ready implementation. Return the file tree and code, with responsive layout, accessible semantics, metadata and a clear primary CTA.`},
{stage:'images',label:'Hero image',kind:'image',provider:input.imageProvider,prompt:`${context}\n\nCreate the main campaign hero image. Leave useful negative space for headline and CTA. Do not render illegible text inside the image.`},
{stage:'images',label:'Social image',kind:'image',provider:input.imageProvider,prompt:`${context}\n\nCreate a visually consistent social campaign image in a square composition. Do not render illegible text inside the image.`},
{stage:'video',label:'Campaign video',kind:'video',provider:input.videoProvider,prompt:`${context}\n\nCreate a concise campaign video concept with a strong opening, product value demonstration and final CTA. Maintain visual continuity with the campaign images.`},
{stage:'ads',label:'Advertising copy',kind:'project',provider:input.textProvider,prompt:`${context}\n\nWrite an advertising copy pack: 5 headlines, 5 primary texts, 3 descriptions and 3 CTAs. Label every variation and respect common platform length constraints.`},
{stage:'social',label:'Social posts',kind:'project',provider:input.textProvider,prompt:`${context}\n\nWrite a coordinated social pack for Instagram, LinkedIn, X and TikTok: platform-native copy, hook, CTA and suggested visual for each. Avoid fake hashtags or unsupported claims.`},
]}
export function campaignCredits(tasks:CampaignTask[]){return tasks.reduce((sum,t)=>sum+(t.kind==='video'?3:t.kind==='project'?2:1),0)}

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InputSchema=z.object({brief:z.string().min(5).max(800),componentType:z.string().max(40),componentName:z.string().max(160),basePrompt:z.string().max(12000),current:z.object({primary:z.string(),secondary:z.string(),background:z.string(),heading:z.string(),body:z.string(),cta:z.string(),icon:z.string(),fields:z.array(z.string()).max(8)})});
const OutputSchema=z.object({primary:z.string().regex(/^#[0-9a-f]{6}$/i),secondary:z.string().regex(/^#[0-9a-f]{6}$/i),background:z.string().regex(/^#[0-9a-f]{6}$/i),heading:z.string().min(2).max(90),body:z.string().min(5).max(240),cta:z.string().min(2).max(45),icon:z.enum(['sparkles','heart','mail','settings','dashboard']),fields:z.array(z.string().min(1).max(50)).min(2).max(6),dark:z.boolean(),promptAddendum:z.string().min(20).max(3000),rationale:z.string().min(10).max(500)});
export type PersonalizeComponentInput=z.infer<typeof InputSchema>;export type PersonalizeComponentOutput=z.infer<typeof OutputSchema>;
const prompt=ai.definePrompt({name:'personalizeWebComponent',input:{schema:InputSchema},output:{schema:OutputSchema},prompt:`You are a senior product designer and conversion UX writer. Adapt the supplied web component to the user's business brief. Return a practical configuration, not generic advice.

USER BRIEF: {{{brief}}}
COMPONENT: {{{componentName}}} ({{{componentType}}})
BASE PROMPT: {{{basePrompt}}}
CURRENT CONFIGURATION: primary {{{current.primary}}}, secondary {{{current.secondary}}}, background {{{current.background}}}, heading {{{current.heading}}}, body {{{current.body}}}, CTA {{{current.cta}}}, icon {{{current.icon}}}, fields {{{current.fields}}}.

Choose accessible brand colors with six-digit hex values. Rewrite content in the same language as the user's brief. Select only one supported icon. For forms, return business-relevant fields; for non-form components, return useful content or navigation field labels. The promptAddendum must describe the industry, audience, content, imagery, iconography, fields, localization, trust signals and conversion goal without fabricating claims. Preserve the component's core interaction and require WCAG AA, keyboard support, responsive behavior and reduced motion. Explain the most important adaptations in rationale.`});
const flow=ai.defineFlow({name:'personalizeComponentFlow',inputSchema:InputSchema,outputSchema:OutputSchema},async input=>{const{output}=await prompt(input);if(!output)throw new Error('No structured personalization returned.');return output});
export async function personalizeComponent(input:PersonalizeComponentInput){return flow(input)}

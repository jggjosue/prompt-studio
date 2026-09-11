import type { Metadata } from 'next';
import { FreeToolCta } from '@/components/free-tool-cta';
import PromptOptimizerClient from './prompt-optimizer-client';
export const metadata: Metadata = { title: 'Optimizador de prompts por objetivos | Prompt Studio', description: 'Reduce costo, mejora consistencia y adapta prompts entre proveedores conservando su intención.', alternates: { canonical: '/prompt-optimizer' } };
export default function PromptOptimizerPage(){ return <><PromptOptimizerClient /><FreeToolCta /></>; }


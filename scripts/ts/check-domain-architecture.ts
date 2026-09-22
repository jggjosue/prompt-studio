import {readFileSync} from 'node:fs';import {PROMPT_STUDIO_SUBSYSTEMS} from '../../src/domain/architecture';
const source=readFileSync(new URL('../../src/domain/architecture.ts',import.meta.url),'utf8');
if(Object.keys(PROMPT_STUDIO_SUBSYSTEMS).length<7)throw new Error('Prompt Studio domain subsystem registry is incomplete');
for(const [name,value] of Object.entries(PROMPT_STUDIO_SUBSYSTEMS)){if(!value.owner||value.roots.length===0)throw new Error(`${name} has no owner/root contract`);}
if(!source.includes('mayDependOn'))throw new Error('Dependency rules missing');
console.log('Prompt Studio domain boundaries verified.');

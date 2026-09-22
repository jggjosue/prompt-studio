import {execFileSync} from 'node:child_process';
const LIMIT=5*1024*1024;
const allow=new Set([
 'public/webpages/mega-estadio/videos/Futuristic_stadium_light_explosion_202606091422.mp4',
 'public/webpages/mega-estadio/videos/Futuristic_stadium_light_explosion_202606091422 (1).mp4'
]);
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const violations=[],large=[];
for(const path of files){
 let size=0;try{size=Number(execFileSync('git',['cat-file','-s',`HEAD:${path}`],{encoding:'utf8'}).trim())}catch{continue}
 if(size>=1024*1024)large.push({path,size});
 // Existing generated dependency output is reported by the audit but is not made a retroactive CI failure.
 // .gitignore blocks new temp-screenshots/node_modules files from ordinary additions.
 if(size>LIMIT&&!allow.has(path))violations.push(`file exceeds 5 MiB: ${path} (${size} bytes)`);
}
large.sort((a,b)=>b.size-a.size);
console.log('Largest tracked files >= 1 MiB:');
for(const f of large.slice(0,30))console.log(`${f.size}\t${f.path}`);
if(violations.length){console.error('\nLarge-file hygiene violations:');for(const v of violations)console.error('- '+v);process.exitCode=1;}

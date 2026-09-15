import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const projectRoot = process.cwd();
const imagesPath = path.join(projectRoot, 'src/data/prompts/placeholder-images.json');
const videosPath = path.join(projectRoot, 'src/data/prompts/placeholder-videos.json');
const outputRoot = path.join(projectRoot, 'public/videos/product-reels');
const tempRoot = path.join(projectRoot, '.tmp-product-reels');
const fontPath = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
const imageData = JSON.parse(fs.readFileSync(imagesPath, 'utf8'));
const videoData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
const sourceItems = imageData.placeholderImages.filter(item => Number(item.id) >= 282 && Number(item.id) <= 381);

if (sourceItems.length !== 100) throw new Error(`Expected 100 product images, received ${sourceItems.length}`);
fs.mkdirSync(outputRoot, { recursive: true });
fs.mkdirSync(tempRoot, { recursive: true });

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(stderr.slice(-2000))));
  });
}

function wrapTitle(value, maxLength = 28) {
  const words = value.toUpperCase().split(/\s+/);
  const lines = [''];
  for (const word of words) {
    const current = lines.at(-1);
    if (current && `${current} ${word}`.length > maxLength && lines.length < 2) lines.push(word);
    else lines[lines.length - 1] = current ? `${current} ${word}` : word;
  }
  return lines.join('\n');
}

async function render(item, index) {
  const reelNumber = String(index + 1).padStart(3, '0');
  const categoryEn = item.tags[2];
  const categoryEs = item.description.es.match(/CATEGORÍA: ([^.]+)\./)?.[1] || categoryEn;
  const filename = `product-reel-${reelNumber}.mp4`;
  const outputPath = path.join(outputRoot, filename);
  const titleFile = path.join(tempRoot, `title-${reelNumber}.txt`);
  const categoryFile = path.join(tempRoot, `category-${reelNumber}.txt`);
  fs.writeFileSync(titleFile, wrapTitle(item.title.es));
  fs.writeFileSync(categoryFile, `${categoryEs.toUpperCase()} · ${categoryEn.toUpperCase()}`);
  const direction = index % 2 === 0 ? 'iw/2-(iw/zoom/2)' : 'iw/zoom/5';
  const filter = [
    'scale=760:1352:force_original_aspect_ratio=increase',
    'crop=760:1352',
    `zoompan=z='min(zoom+0.0012,1.12)':x='${direction}':y='ih/2-(ih/zoom/2)':d=150:s=720x1280:fps=25`,
    'eq=contrast=1.03:saturation=1.04',
    'drawbox=x=36:y=82:w=648:h=178:color=black@0.58:t=fill',
    `drawtext=fontfile='${fontPath}':textfile='${categoryFile}':fontcolor=white@0.82:fontsize=20:x=(w-text_w)/2:y=112`,
    `drawtext=fontfile='${fontPath}':textfile='${titleFile}':fontcolor=white:fontsize=30:line_spacing=5:x=(w-text_w)/2:y=158`,
    'drawbox=x=220:y=1172:w=280:h=48:color=black@0.52:t=fill',
    `drawtext=fontfile='${fontPath}':text='PROMPT PREMIUM':fontcolor=white:fontsize=18:x=(w-text_w)/2:y=1186`,
    'fade=t=in:st=0:d=0.4',
    'fade=t=out:st=5.3:d=0.7',
  ].join(',');
  await runFfmpeg(['-y', '-loop', '1', '-i', path.join(projectRoot, 'public', item.imageUrl), '-vf', filter, '-t', '6', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-threads', '1', outputPath]);
  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) throw new Error(`Missing output ${filename}`);
  return {
    id: `product-reel-${reelNumber}`,
    title: { en: `${item.title.en} Product Reel`, es: `Reel de ${item.title.es}` },
    description: {
      en: `Create a premium 9:16 product reel for “${item.title.en}”. Begin with a clean hero frame, use a slow cinematic push-in with subtle parallax, preserve exact product geometry and materials, reveal texture through controlled commercial lighting, keep the ${categoryEn.toLowerCase()} subject centered inside mobile safe zones, add concise benefit-led on-screen copy, and finish on a stable product frame with a direct call to action. Duration: 6 seconds. Avoid logo mutation, unreadable text, flicker, warping, sudden cuts, camera jitter, and inconsistent shadows.`,
      es: `Crea un reel Premium 9:16 para «${item.title.es}». Inicia con un hero frame limpio, aplica un acercamiento cinematográfico lento con paralaje sutil, conserva exactamente la geometría y los materiales del producto, revela la textura con iluminación comercial controlada, mantén el producto de ${categoryEs.toLowerCase()} centrado dentro de las zonas seguras móviles, añade un texto breve orientado al beneficio y termina con un plano estable y una llamada a la acción directa. Duración: 6 segundos. Evita mutaciones del logotipo, texto ilegible, parpadeos, deformaciones, cortes repentinos, vibración de cámara y sombras inconsistentes.`,
    },
    imageUrl: `/videos/product-reels/${filename}`,
    imageHint: { en: `${categoryEn.toLowerCase()} ${item.title.en.toLowerCase()} vertical commercial product reel`, es: `${categoryEs.toLowerCase()} ${item.title.es.toLowerCase()} reel vertical comercial de producto` },
    type: 'video',
    tags: ['Product Reel', 'Reel de producto', 'Product Photography', 'Fotografía de producto', categoryEn, categoryEs, 'Vertical', 'Commercial'],
    randomId: `reel${reelNumber}ps`,
    membership: 'Premium',
  };
}

const results = new Array(sourceItems.length);
let cursor = 0;
async function worker() {
  while (cursor < sourceItems.length) {
    const index = cursor++;
    results[index] = await render(sourceItems[index], index);
    if ((index + 1) % 10 === 0) console.log(`Rendered ${index + 1}/100`);
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()));
videoData.placeholderVideos = videoData.placeholderVideos.filter(item => !String(item.id || '').startsWith('product-reel-'));
videoData.placeholderVideos.push(...results);
fs.writeFileSync(videosPath, `${JSON.stringify(videoData, null, 2)}\n`);
fs.rmSync(tempRoot, { recursive: true, force: true });
console.log(JSON.stringify({ rendered: results.length, total: videoData.placeholderVideos.length }));

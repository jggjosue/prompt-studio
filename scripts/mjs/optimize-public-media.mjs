/**
 * Reduce imágenes y videos de public/ conservando nombres y rutas.
 * Solo reemplaza un archivo cuando la versión optimizada pesa menos.
 * ffmpeg es opcional: si no está instalado, las imágenes aún se optimizan.
 */
import { execFile } from 'child_process';
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm']);
const MIN_IMAGE_BYTES = 16 * 1024;
const MIN_VIDEO_BYTES = 256 * 1024;

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await walk(fullPath)));
    else if (entry.isFile()) output.push(fullPath);
  }
  return output;
}

async function replaceWhenSmaller(filePath, optimized) {
  const original = await stat(filePath);
  if (optimized.length >= original.size) return 0;
  await writeFile(filePath, optimized);
  return original.size - optimized.length;
}

async function optimizeImage(filePath) {
  const original = await stat(filePath);
  if (original.size < MIN_IMAGE_BYTES) return 0;

  const extension = path.extname(filePath).toLowerCase();
  let pipeline = sharp(await readFile(filePath), {
    animated: false,
    failOn: 'none',
  }).rotate();

  if (extension === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, palette: false });
  } else if (extension === '.webp') {
    pipeline = pipeline.webp({ quality: 78, effort: 5, smartSubsample: true });
  } else {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true });
  }

  return replaceWhenSmaller(filePath, await pipeline.toBuffer());
}

async function hasFfmpeg() {
  try {
    await execFileAsync('ffmpeg', ['-version']);
    return true;
  } catch {
    return false;
  }
}

async function optimizeVideo(filePath, temporaryDirectory) {
  const original = await stat(filePath);
  if (original.size < MIN_VIDEO_BYTES) return 0;

  const extension = path.extname(filePath).toLowerCase();
  const temporary = path.join(
    temporaryDirectory,
    `${Buffer.from(filePath).toString('hex')}${extension}`
  );
  const args =
    extension === '.webm'
      ? ['-y', '-i', filePath, '-map_metadata', '-1', '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-c:a', 'libopus', '-b:a', '96k', temporary]
      : ['-y', '-i', filePath, '-map_metadata', '-1', '-c:v', 'libx264', '-preset', 'medium', '-crf', '28', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', temporary];

  try {
    await execFileAsync('ffmpeg', args, { maxBuffer: 1024 * 1024 });
    const optimized = await stat(temporary);
    if (optimized.size >= original.size) return 0;
    await writeFile(filePath, await readFile(temporary));
    return original.size - optimized.size;
  } finally {
    await rm(temporary, { force: true });
  }
}

async function main() {
  const files = await walk(PUBLIC_DIR);
  const images = files.filter(file => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const videos = files.filter(file => VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase()));
  let imageSavings = 0;
  let videoSavings = 0;
  let imageCount = 0;
  let videoCount = 0;

  for (const file of images) {
    try {
      const saved = await optimizeImage(file);
      if (saved > 0) {
        imageSavings += saved;
        imageCount += 1;
      }
    } catch (error) {
      console.warn(`[optimize-media] Imagen omitida: ${path.relative(ROOT, file)} (${error.message})`);
    }
  }

  if (await hasFfmpeg()) {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'prompt-studio-media-'));
    try {
      for (const file of videos) {
        try {
          const saved = await optimizeVideo(file, temporaryDirectory);
          if (saved > 0) {
            videoSavings += saved;
            videoCount += 1;
          }
        } catch (error) {
          console.warn(`[optimize-media] Video omitido: ${path.relative(ROOT, file)} (${error.message})`);
        }
      }
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  } else if (videos.length > 0) {
    console.warn('[optimize-media] ffmpeg no disponible; se omitió la compresión de video.');
  }

  const megabytes = bytes => (bytes / 1024 / 1024).toFixed(2);
  console.log(
    `[optimize-media] ${imageCount} imágenes (-${megabytes(imageSavings)} MB), ` +
      `${videoCount} videos (-${megabytes(videoSavings)} MB).`
  );
}

main().catch(error => {
  console.error('[optimize-media] Error:', error);
  process.exit(1);
});

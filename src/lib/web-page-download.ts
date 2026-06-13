import fs from 'fs';
import path from 'path';
import {
  getR2ObjectBytes,
  listR2ProjectObjects,
  validateR2ProjectFolder,
} from '@/lib/r2-storage';
import { createZipArchive } from '@/lib/zip-archive';

const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024;
const MAX_DOWNLOAD_FILES = 500;

type DownloadEntry = {
  name: string;
  data: Buffer;
  modifiedAt?: Date;
};

function collectLocalEntries(root: string, current = root): DownloadEntry[] {
  const entries: DownloadEntry[] = [];

  for (const item of fs.readdirSync(current, { withFileTypes: true })) {
    const absolutePath = path.join(current, item.name);
    if (item.isDirectory()) {
      entries.push(...collectLocalEntries(root, absolutePath));
      continue;
    }
    if (!item.isFile()) continue;

    const stats = fs.statSync(absolutePath);
    entries.push({
      name: path.relative(root, absolutePath),
      data: fs.readFileSync(absolutePath),
      modifiedAt: stats.mtime,
    });
  }

  return entries;
}

function assertDownloadLimits(entries: DownloadEntry[]): void {
  if (entries.length === 0) {
    throw new Error('La carpeta de esta página está vacía.');
  }
  if (entries.length > MAX_DOWNLOAD_FILES) {
    throw new Error('La carpeta contiene demasiados archivos para descargar.');
  }

  const totalBytes = entries.reduce((total, entry) => total + entry.data.length, 0);
  if (totalBytes > MAX_DOWNLOAD_BYTES) {
    throw new Error('La carpeta supera el límite de descarga de 50 MB.');
  }
}

export async function createWebPageZip(
  folder: string,
  stack: string[]
): Promise<Buffer | null> {
  const localRoot = path.join(process.cwd(), 'public', 'webpages', folder);
  let entries: DownloadEntry[] = [];

  if (fs.existsSync(localRoot) && fs.statSync(localRoot).isDirectory()) {
    entries = collectLocalEntries(localRoot);
  } else {
    const validation = await validateR2ProjectFolder(folder, stack);
    if (!validation.valid || !validation.prefix) return null;

    const keys = (await listR2ProjectObjects(validation.prefix)).filter(
      key => !key.endsWith('/')
    );
    if (keys.length > MAX_DOWNLOAD_FILES) {
      throw new Error('La carpeta contiene demasiados archivos para descargar.');
    }

    for (const key of keys) {
      const data = await getR2ObjectBytes(key);
      if (!data) continue;
      entries.push({
        name: key.slice(validation.prefix.length),
        data,
      });
      assertDownloadLimits(entries);
    }
  }

  assertDownloadLimits(entries);
  return createZipArchive(
    entries.map(entry => ({
      ...entry,
      name: `${folder}/${entry.name}`,
    }))
  );
}

import fs from 'fs';
import { cacheGetOrSet } from '@/lib/server-cache';

/** Lectura UTF-8 con caché LRU (evita reparsear JSON en cada request). */
export async function readCachedUtf8File(
  absolutePath: string,
  ttlMs = 60 * 60 * 1000
): Promise<string | null> {
  return cacheGetOrSet(
    'prompt-json',
    absolutePath,
    async () => {
      if (!fs.existsSync(absolutePath)) return null;
      return fs.readFileSync(absolutePath, 'utf8');
    },
    { ttlMs }
  );
}

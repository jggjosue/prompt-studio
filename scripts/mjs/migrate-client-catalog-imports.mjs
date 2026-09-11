import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const files = execFileSync('rg', ['-l', 'useLocalizedPlaceholderImages|useLocalizedPlaceholderVideos|useLocalizedWebPages', 'src', '--glob', '*.tsx'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
for (const relative of files) {
  let source = await readFile(relative, 'utf8');
  source = source
    .replaceAll("@/hooks/use-localized-catalog", "@/hooks/use-paged-catalog")
    .replaceAll('useLocalizedPlaceholderImages', 'usePagedPlaceholderImages')
    .replaceAll('useLocalizedPlaceholderVideos', 'usePagedPlaceholderVideos')
    .replaceAll('useLocalizedWebPages', 'usePagedWebPages');
  await writeFile(relative, source);
}


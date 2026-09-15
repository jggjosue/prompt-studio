import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const size = 24;
const pick = (value, locale) => typeof value === 'string' ? value : value?.[locale] ?? value?.en ?? value?.es ?? '';
const definitions = [
  ['images', 'src/data/prompts/placeholder-images.json', 'placeholderImages'],
  ['videos', 'src/data/prompts/placeholder-videos.json', 'placeholderVideos'],
  ['web-pages', 'src/data/web-pages.json', 'webPages'],
];
const componentDefinitions = [
  ['login', 'src/data/prompts/web-login-components.json'],
  ['header', 'src/data/prompts/web-header-components.json'],
  ['text', 'src/data/prompts/web-text-components.json'],
  ['form', 'src/data/prompts/web-form-components.json'],
  ['button', 'src/data/prompts/web-button-components.json'],
  ['card', 'src/data/prompts/web-card-components.json'],
  ['navigation', 'src/data/prompts/web-navigation-components.json'],
  ['sidebar', 'src/data/prompts/web-sidebar-components.json'],
];

const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 16);

for (const [kind, input, key] of definitions) {
  const raw = JSON.parse(await readFile(path.join(root, input), 'utf8'))[key];
  for (const locale of ['es', 'en']) {
    const items = raw.map((item, index) => kind === 'web-pages' ? {
      id: `wp-${index + 1}`,
      title: pick(item.title, locale),
      description: '',
      imageUrl: item.imageUrl,
      imageHint: pick(item.imageHint, locale),
      demoUrl: item.demoUrl,
      stack: item.stack ?? [],
      tags: item.tags ?? [],
      membership: item.membership ?? 'Free',
      price: item.price?.trim?.() ?? '',
    } : {
      id: `${kind === 'images' ? 'img' : 'v'}-${index + 1}`,
      title: pick(item.title, locale),
      description: '',
      imageUrl: item.imageUrl,
      imageHint: pick(item.imageHint, locale),
      type: kind === 'videos' ? 'video' : item.type,
      tags: item.tags ?? [],
      membership: item.membership,
    }).filter(item => item.imageUrl && (kind !== 'images' || item.type === 'image'));

    const output = path.join(root, 'public/catalog', kind, locale);
    await mkdir(output, { recursive: true });
    const oldPages = (await readdir(output)).filter(file => /^page-\d{3}(?:\.[a-f0-9]{16})?\.json$/.test(file));
    await Promise.all(oldPages.map(file => unlink(path.join(output, file))));
    const pages = Math.ceil(items.length / size);
    const files = [];
    for (let page = 0; page < pages; page += 1) {
      const contents = JSON.stringify(items.slice(page * size, (page + 1) * size));
      const hash = digest(contents);
      const file = `page-${String(page + 1).padStart(3, '0')}.${hash}.json`;
      await writeFile(path.join(output, file), contents);
      files.push({ page: page + 1, file, hash, count: JSON.parse(contents).length });
    }
    const version = digest(JSON.stringify(files.map(file => file.hash)));
    await writeFile(
      path.join(output, 'manifest.json'),
      JSON.stringify({ version, total: items.length, pageSize: size, pages, files })
    );
  }
}

const componentOutput = path.join(root, 'public/catalog/components');
await mkdir(componentOutput, { recursive: true });
const componentVersions = [];
for (const [kind, input] of componentDefinitions) {
  const source = JSON.parse(await readFile(path.join(root, input), 'utf8'));
  const components = source.components.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    prompt: item.membership === 'Free'
      ? item.prompt
      : { en: `${item.prompt.en.slice(0, 240)}…`, es: `${item.prompt.es.slice(0, 240)}…` },
    preview: item.preview,
    ...(item.label ? { label: item.label } : {}),
    ...(item.title ? { title: item.title } : {}),
    ...(item.headline ? { headline: item.headline } : {}),
    ...(Array.isArray(item.fields) ? { fields: item.fields } : {}),
    ...(item.sample ? { sample: item.sample } : {}),
    stack: item.stack ?? [],
    tags: item.tags ?? [],
    membership: item.membership,
    price: '5.00',
    detailEndpoint: `/api/catalog/components/${encodeURIComponent(item.id)}`,
  }));
  const payload = JSON.stringify({
    title_es: source.title_es,
    title_en: source.title_en,
    description_es: source.description_es,
    description_en: source.description_en,
    components,
  });
  const hash = digest(payload);
  await writeFile(path.join(componentOutput, `web-${kind}-components.json`), payload);
  componentVersions.push({ kind, file: `web-${kind}-components.json`, hash, count: components.length });
}
await writeFile(
  path.join(componentOutput, 'manifest.json'),
  JSON.stringify({ version: digest(JSON.stringify(componentVersions)), products: componentVersions.reduce((sum, item) => sum + item.count, 0), files: componentVersions })
);

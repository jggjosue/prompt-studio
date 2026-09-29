import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];

const readJson = async file =>
  JSON.parse(await readFile(path.join(root, file), 'utf8'));

function leafKeys(value, prefix = '', output = []) {
  if (Array.isArray(value)) {
    output.push(prefix);
    return output;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      leafKeys(value[key], prefix ? `${prefix}.${key}` : key, output);
    }
    return output;
  }
  output.push(prefix);
  return output;
}

function requireLocalized(value, location) {
  if (value && typeof value === 'object' && Array.isArray(value.projects)) {
    value.projects.forEach((project, index) =>
      requireLocalized(project, `${location}.projects[${index}]`)
    );
    return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${location} must be an { en, es } object`);
    return;
  }
  for (const locale of ['en', 'es']) {
    if (!(locale in value)) {
      errors.push(`${location}.${locale} is missing`);
      continue;
    }
    const localized = value[locale];
    const hasContent = typeof localized === 'string'
      ? localized.trim().length > 0
      : localized && typeof localized === 'object' && JSON.stringify(localized).length > 2;
    if (!hasContent) errors.push(`${location}.${locale} is empty`);
  }
}

const messages = {
  en: await readJson('messages/en.json'),
  es: await readJson('messages/es.json'),
};
const enKeys = new Set(leafKeys(messages.en));
const esKeys = new Set(leafKeys(messages.es));
for (const key of enKeys) if (!esKeys.has(key)) errors.push(`messages/es.json is missing ${key}`);
for (const key of esKeys) if (!enKeys.has(key)) errors.push(`messages/en.json is missing ${key}`);

const catalogSpecs = [
  ['src/data/prompts/placeholder-images.json', 'placeholderImages', ['title', 'description', 'imageHint']],
  ['src/data/prompts/placeholder-videos.json', 'placeholderVideos', ['title', 'description', 'imageHint']],
  ['src/data/web-pages.json', 'webPages', ['title', 'description', 'imageHint']],
];

for (const [file, collection, fields] of catalogSpecs) {
  const items = (await readJson(file))[collection];
  if (!Array.isArray(items)) {
    errors.push(`${file}.${collection} must be an array`);
    continue;
  }
  items.forEach((item, index) => {
    for (const field of fields) {
      requireLocalized(item[field], `${file}.${collection}[${index}].${field}`);
    }
  });
}

const promptDirectory = path.join(root, 'src/data/prompts');
const promptFiles = (await readdir(promptDirectory))
  .filter(file => file.endsWith('.json') && !file.startsWith('placeholder-'));

for (const filename of promptFiles) {
  const file = `src/data/prompts/${filename}`;
  const data = await readJson(file);
  const collection = Array.isArray(data)
    ? data
    : Object.values(data).find(Array.isArray);
  if (!collection) continue;
  collection.forEach((item, index) => {
    for (const field of ['name', 'title', 'description', 'prompt', 'how_to_use_prompt']) {
      if (item[field] !== undefined && typeof item[field] === 'object') {
        requireLocalized(item[field], `${file}[${index}].${field}`);
      }
    }
  });
}

for (const kind of ['images', 'videos', 'web-pages']) {
  const manifests = await Promise.all(
    ['en', 'es'].map(locale => readJson(`public/catalog/${kind}/${locale}/manifest.json`))
  );
  if (manifests[0].total !== manifests[1].total) {
    errors.push(`public/catalog/${kind} has different en/es totals`);
  }
}

if (errors.length) {
  console.error(`Localized content validation failed with ${errors.length} issue(s):`);
  errors.slice(0, 100).forEach(error => console.error(`- ${error}`));
  if (errors.length > 100) console.error(`- ...and ${errors.length - 100} more`);
  process.exit(1);
}

console.log('Localized content validation passed: message keys, prompt titles, prompt content, and catalog totals match for en/es.');

import assert from 'node:assert/strict';
import test from 'node:test';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
async function walk(directory) { const output=[]; for(const entry of await readdir(directory,{withFileTypes:true})){const target=path.join(directory,entry.name);if(entry.isDirectory())output.push(...await walk(target));else output.push(target)} return output }

test('JSON is valid, IDs are unique per catalog and referenced local media exists', async () => {
  const files = (await walk(path.join(root, 'public'))).filter(file => file.endsWith('.json'));
  for (const file of files) {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    const relative = path.relative(root, file);
    const activeCatalog = relative.startsWith('public/catalog/') || /public\/(?:prompts\/placeholder-(?:images|videos)|webpages\/web-pages)\.json$/.test(relative) || /public\/prompts\/web-.*-components\.json$/.test(relative);
    const authoritativeIds = relative.startsWith('public/catalog/') || /public\/prompts\/(?:placeholder-(?:images|videos)|web-.*-components)\.json$/.test(relative);
    const arrays = Array.isArray(parsed) ? [parsed] : Object.values(parsed).filter(Array.isArray);
    for (const items of arrays) {
      const ids = items.filter(item => item && typeof item === 'object' && typeof item.id === 'string').map(item => item.id);
      if (authoritativeIds) assert.equal(new Set(ids).size, ids.length, `IDs duplicados en ${relative}`);
      for (const item of items) {
        if (!activeCatalog) continue;
        if (!item || typeof item !== 'object' || typeof item.imageUrl !== 'string' || !item.imageUrl.startsWith('/')) continue;
        const local = path.join(root, 'public', item.imageUrl.replace(/^\/+/, ''));
        await assert.doesNotReject(access(local), `Imagen inexistente: ${item.imageUrl} (${path.relative(root, file)})`);
      }
    }
  }
});

test('component IDs are unique across every component family', async () => {
  const files = (await readdir(path.join(root, 'public/catalog/components'))).filter(file => /^web-.*-components\.json$/.test(file));
  const ids=[];
  for(const file of files){const value=JSON.parse(await readFile(path.join(root,'public/catalog/components',file),'utf8'));ids.push(...value.components.map(item=>item.id))}
  assert.equal(new Set(ids).size, ids.length, 'Hay IDs duplicados entre familias de componentes');
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('Brand Kits and publications persist the project association', async () => {
  const [brandModel, publicationModel, brandRoute, publicationRoute] = await Promise.all([
    source('src/models/BrandKit.ts'),
    source('src/models/LandingPublication.ts'),
    source('src/app/api/brand-kits/route.ts'),
    source('src/app/api/publications/route.ts'),
  ]);
  assert.match(brandModel, /projectId:\{type:String,default:null,index:true\}/);
  assert.match(publicationModel, /projectId:\{type:String,default:null,index:true\}/);
  assert.match(brandRoute, /CreativeProject\.exists\(\{_id:projectId,userId,status:'active'\}\)/);
  assert.match(publicationRoute, /LandingPublication\.create\(\{ userId, projectId,/);
});

test('generations validate and persist their project association', async () => {
  const route = await source('src/app/api/ai/jobs/route.ts');
  assert.match(route, /CreativeProject\.findOne\(\{ _id: projectId, userId, status: 'active' \}\)/);
  assert.match(route, /projectId: projectId \|\| null/);
});

test('the aggregate endpoint authorizes project access and returns all four associations', async () => {
  const route = await source('src/app/api/projects/[id]/associations/route.ts');
  assert.match(route, /'collaborators\.userId': userId/);
  assert.match(route, /'collaborators\.email': email/);
  for (const relationship of ['brief:', 'brandKits:', 'generations:', 'publications:']) {
    assert.ok(route.includes(relationship), `missing ${relationship}`);
  }
  assert.match(route, /BrandKit\.find\(\{ projectId: id \}\)/);
  assert.match(route, /AIGenerationJob\.find\(\{ projectId: id \}\)/);
  assert.match(route, /LandingPublication\.find\(\{ projectId: id \}\)/);
});

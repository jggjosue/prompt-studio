import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source=(file:string)=>readFile(new URL(`../../${file}`,import.meta.url),'utf8');

test('admin dashboard exposes the four decision domains',async()=>{
 const api=await source('src/app/api/admin/observability/route.ts');
 const ui=await source('src/app/[locale]/dashboard/observability/observability-client.tsx');
 for(const domain of ['product','revenue','modelHealth','failures']) assert.ok(api.includes(domain));
 for(const heading of ['Producto · eventos del funnel','Ingresos confirmados','Salud de IA por proveedor/modelo','Errores frecuentes']) assert.ok(ui.includes(heading));
});

test('revenue dashboard uses confirmed purchase events only',async()=>{
 const api=await source('src/app/api/admin/observability/route.ts');
 assert.ok(api.includes("name: 'purchase'"));
 assert.ok(api.includes("status: 'completed'"));
 assert.ok(api.includes("category: 'analytics'"));
});

test('dashboard endpoint remains authenticated and admin-only',async()=>{
 const api=await source('src/app/api/admin/observability/route.ts');
 assert.ok(api.includes('await auth()'));
 assert.ok(api.includes('isPremiumJoAdmin()'));
 assert.ok(api.includes("status: 401"));
 assert.ok(api.includes("status: 403"));
});

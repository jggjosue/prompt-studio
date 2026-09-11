import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { getComponentProductContent } from '@/lib/component-content-store';
import connectToDatabase from '@/lib/mongoose';
import { verifyPurchaseDownloadToken } from '@/lib/purchase-download-token';
import { createZipArchive } from '@/lib/zip-archive';
import ComponentPurchase from '@/models/ComponentPurchase';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  const payload = verifyPurchaseDownloadToken(new URL(request.url).searchParams.get('token') ?? '');
  if (!userId || !payload || payload.userId !== userId || !/^[a-f0-9]{24}$/i.test(payload.purchaseId)) return NextResponse.json({ error: 'Enlace inválido o vencido.' }, { status: 401, headers });
  await connectToDatabase();
  const purchase = await ComponentPurchase.findOneAndUpdate(
    { _id: payload.purchaseId, purchaserUserId: userId, status: 'paid', $expr: { $lt: ['$downloadCount', '$maxDownloads'] } },
    { $inc: { downloadCount: 1 }, $set: { updatedAt: new Date() } },
    { new: true }
  );
  if (!purchase) return NextResponse.json({ error: 'Compra no disponible o límite alcanzado.' }, { status: 429, headers });
  const product = await getComponentProductContent(purchase.productId);
  if (!product) return NextResponse.json({ error: 'El producto ya no está disponible.' }, { status: 404, headers });
  const folder = product.id;
  const manifest = { id: product.id, name: product.name, kind: product.kind, stack: product.stack, tags: product.tags, license: 'commercial', purchasedAt: purchase.purchasedAt };
  const archive = createZipArchive([
    { name: `${folder}/PROMPT.es.md`, data: Buffer.from(`# ${product.name.es}\n\n${product.prompt.es}\n`, 'utf8') },
    { name: `${folder}/PROMPT.en.md`, data: Buffer.from(`# ${product.name.en}\n\n${product.prompt.en}\n`, 'utf8') },
    { name: `${folder}/manifest.json`, data: Buffer.from(JSON.stringify(manifest, null, 2), 'utf8') },
    { name: `${folder}/LICENSE.txt`, data: Buffer.from('Commercial license for one purchaser and their client projects. Redistribution or resale of the source package is prohibited.\n', 'utf8') },
    { name: `${folder}/README.md`, data: Buffer.from(`# ${product.name.es}\n\nIncluye prompt bilingüe, especificaciones, stack y licencia comercial.\n`, 'utf8') },
  ]);
  headers.set('Content-Type', 'application/zip');
  headers.set('Content-Disposition', `attachment; filename="${folder}.zip"`);
  headers.set('Content-Length', String(archive.length));
  return new NextResponse(new Uint8Array(archive), { headers });
}

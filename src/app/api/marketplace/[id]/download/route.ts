import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import { freeAccessGranted } from '@/lib/free-access';
import { createZipArchive } from '@/lib/zip-archive';
import ComponentPurchase from '@/models/ComponentPurchase';
import MarketplaceListing from '@/models/MarketplaceListing';
import MarketplaceRelease from '@/models/MarketplaceRelease';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Producto inválido.' }, { status: 400 });

  await connectToDatabase();
  const listing = await MarketplaceListing.findOne({ _id: id, status: 'approved' }).select('+content');
  if (!listing) return NextResponse.json({ error: 'Producto no disponible.' }, { status: 404 });
  let releaseId = listing.currentReleaseId;

  // Producto gratuito: no hay compra que verificar. Accede quien registró su
  // correo (el servidor lo comprueba contra la BD, no contra localStorage).
  if (listing.priceCents === 0) {
    const { granted } = await freeAccessGranted(request);
    if (!granted) return NextResponse.json({ error: 'Registra tu correo para descargar.' }, { status: 403 });
  } else {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const purchase = await ComponentPurchase.findOne({
      purchaserUserId:userId,
      productId: `marketplace:${id}`,
      status:'paid',
    });
    if (!purchase) return NextResponse.json({ error: 'Compra verificada requerida.' }, { status: 403 });
    releaseId = purchase.marketplaceReleaseId ?? releaseId;
    if (purchase.downloadCount >= purchase.maxDownloads) return NextResponse.json({ error: 'Alcanzaste el límite de descargas.' }, { status: 429 });
    const claimed = await ComponentPurchase.findOneAndUpdate(
      { _id: purchase._id, downloadCount: { $lt: purchase.maxDownloads } },
      { $inc: { downloadCount: 1 }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!claimed) return NextResponse.json({ error: 'Alcanzaste el límite de descargas.' }, { status: 429 });
  }

  const release = releaseId ? await MarketplaceRelease.findOne({ _id: releaseId, listingId: listing._id }).select('+content') : null;
  if (!release) return NextResponse.json({ error: 'El release adquirido ya no está disponible.' }, { status: 409 });

  const extension = listing.kind === 'prompt' ? 'md' : 'txt';
  const zip = createZipArchive([
    { name: `${listing.slug}/contenido.${extension}`, data: Buffer.from(release.content) },
    { name: `${listing.slug}/LICENSE.txt`, data: Buffer.from(`Licencia: ${listing.license}\nProducto: ${listing.title}\nRelease: ${release.releaseNumber}\nComprador: licencia individual no transferible.\n`) },
    { name: `${listing.slug}/manifest.json`, data: Buffer.from(JSON.stringify({ id: String(listing._id), releaseId: String(release._id), title: listing.title, kind: listing.kind, version: release.releaseNumber, license: listing.license, provenance: release.provenance, preview: release.preview }, null, 2)) },
  ]);
  return new NextResponse(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${listing.slug}-v${release.releaseNumber}.zip"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

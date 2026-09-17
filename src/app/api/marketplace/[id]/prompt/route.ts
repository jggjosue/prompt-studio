import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import { cacheHeaders } from '@/lib/cache-policy';
import { freeAccessGranted } from '@/lib/free-access';
import ComponentPurchase from '@/models/ComponentPurchase';
import MarketplaceListing from '@/models/MarketplaceListing';

export const runtime = 'nodejs';

/**
 * Contenido del prompt para «Ver prompt» en el marketplace.
 *
 * El `content` del listing es `select:false` y no viaja en el catálogo público:
 * este endpoint lo entrega solo cuando hay derecho a verlo — producto gratuito
 * con el correo registrado, o compra verificada para los de pago.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Producto inválido.' }, { status: 400 });

  await connectToDatabase();
  const listing = await MarketplaceListing.findOne({ _id: id, status: 'approved' }).select('+content');
  if (!listing) return NextResponse.json({ error: 'Producto no disponible.' }, { status: 404 });

  if (listing.priceCents === 0) {
    const { granted } = await freeAccessGranted(request);
    if (!granted) return NextResponse.json({ error: 'Registra tu correo para ver el prompt.' }, { status: 403 });
  } else {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const purchase = await ComponentPurchase.findOne({
      purchaserUserId: userId,
      productId: `marketplace:${id}`,
      status: 'paid',
    });
    if (!purchase) return NextResponse.json({ error: 'Compra verificada requerida.' }, { status: 403 });
  }

  return NextResponse.json(
    { id: String(listing._id), title: listing.title, kind: listing.kind, content: listing.content },
    { headers: cacheHeaders('private-no-store') }
  );
}
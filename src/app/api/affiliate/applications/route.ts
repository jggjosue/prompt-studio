import { NextResponse } from 'next/server';
import { enforceIpRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import connectToDatabase from '@/lib/mongoose';
import AffiliateApplication from '@/models/AffiliateApplication';

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  /**
   * Alta pública: cualquiera puede solicitar ser afiliado sin cuenta previa, que
   * es lo que pide el formulario. Sin límite por IP, eso es una vía directa para
   * llenar la colección de solicitudes basura.
   */
  const limited = await enforceIpRateLimit(request, 'affiliate-applications', RATE_LIMITS.publicWrite);
  if (limited) return limited;

  const body = await request.json().catch(() => null);

  const fullName = safeString(body?.fullName);
  const email = safeString(body?.email).toLowerCase();
  const profile = safeString(body?.profile);
  const audience = safeString(body?.audience);
  const channel = safeString(body?.channel);
  const experience = safeString(body?.experience);
  const tier = safeString(body?.tier) || 'standard';
  const plan = safeString(body?.plan);
  const message = safeString(body?.message);

  if (!fullName) {
    return NextResponse.json({ error: 'El nombre completo es obligatorio.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Introduce un correo electrónico válido.' }, { status: 400 });
  }

  if (!profile) {
    return NextResponse.json({ error: 'Agrega un sitio web o perfil social.' }, { status: 400 });
  }

  if (!audience) {
    return NextResponse.json({ error: 'Indica el tamaño de tu audiencia.' }, { status: 400 });
  }

  if (!channel) {
    return NextResponse.json({ error: 'Elige tu canal principal de promoción.' }, { status: 400 });
  }

  if (!experience) {
    return NextResponse.json({ error: 'Describe tu experiencia con marketing de afiliados.' }, { status: 400 });
  }

  if (!plan) {
    return NextResponse.json({ error: 'Cuéntanos cómo promocionarás el producto.' }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: 'Escribe un mensaje para completar la solicitud.' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const application = await AffiliateApplication.create({
      fullName,
      email,
      profile,
      audience,
      channel,
      experience,
      tier,
      plan,
      message,
      sourcePath: '/affiliate-program',
      status: 'pending',
    });

    return NextResponse.json({
      ok: true,
      id: application._id.toString(),
    });
  } catch (error) {
    console.error('Failed to save affiliate application:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar la solicitud de afiliado. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}

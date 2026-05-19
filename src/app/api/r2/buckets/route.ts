import { NextResponse } from 'next/server';
import { isCloudflareR2Configured, listR2Buckets } from '@/lib/cloudflare-r2';
import { getR2BucketName, isR2S3Configured } from '@/lib/r2-storage';

export const runtime = 'nodejs';

/** GET /api/r2/buckets — Cloudflare R2 List Buckets */
export async function GET() {
  if (!isCloudflareR2Configured() && !isR2S3Configured()) {
    return NextResponse.json(
      {
        error:
          'Configura credenciales R2: R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY (S3) o CLOUDFLARE_API_TOKEN con permisos R2',
      },
      { status: 503 }
    );
  }

  if (!isCloudflareR2Configured()) {
    return NextResponse.json({
      bucket: getR2BucketName(),
      s3Configured: true,
      message:
        'Listado de buckets requiere CLOUDFLARE_API_TOKEN; lectura de demos usa API S3.',
    });
  }

  try {
    const buckets = await listR2Buckets();
    return NextResponse.json(
      {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
        configuredBucket: process.env.CLOUDFLARE_R2_BUCKET ?? null,
        count: buckets.length,
        buckets,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error al listar buckets R2';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

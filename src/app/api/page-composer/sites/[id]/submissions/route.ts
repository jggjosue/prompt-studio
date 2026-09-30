import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { listSubmissions, submissionsToCsv } from '@/lib/page-forms';
import PageComposerProject from '@/models/PageComposerProject';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** Solo el dueño del sitio puede ver sus envíos (aislamiento de tenants). */
async function assertOwner(siteId: string, userId: string): Promise<boolean> {
  return Boolean(await PageComposerProject.exists({ _id: siteId, userId }));
}

/**
 * GET /api/page-composer/sites/[id]/submissions
 *   ?export=csv devuelve un CSV; si no, la lista JSON (solo el dueño).
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const { id } = await params;
  if (!(await assertOwner(id, userId))) {
    return NextResponse.json({ error: 'No tienes acceso a este sitio.' }, { status: 403, headers: headers() });
  }

  const limit = Math.min(Number(new URL(request.url).searchParams.get('limit') ?? 100) || 100, 500);
  const submissions = await listSubmissions(id, limit);

  if (new URL(request.url).searchParams.get('export') === 'csv') {
    const csv = submissionsToCsv(submissions);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...headers(),
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="submissions-${id}.csv"`,
      },
    });
  }

  return NextResponse.json(
    {
      submissions: submissions.map(submission => ({
        id: String(submission._id),
        formId: submission.formId,
        formVariant: submission.formVariant,
        hostname: submission.hostname,
        fields: submission.fields,
        consent: submission.consent,
        createdAt: submission.createdAt,
      })),
    },
    { headers: headers() }
  );
}
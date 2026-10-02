import connectToDatabase from '@/lib/mongoose';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import TrainingConsentRecord, { TRAINING_CONSENT_POLICY_VERSION } from '@/models/TrainingConsentRecord';
import TrainingDataRecord from '@/models/TrainingDataRecord';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectToDatabase();
  const latest = await TrainingConsentRecord.findOne({ userId }).sort({ changedAt: -1, _id: -1 }).lean();
  return NextResponse.json({
    training: Boolean(latest?.training && latest.policyVersion === TRAINING_CONSENT_POLICY_VERSION && !latest.revokedAt),
    policyVersion: TRAINING_CONSENT_POLICY_VERSION,
    changedAt: latest?.changedAt ?? null,
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!raw || typeof raw.training !== 'boolean') {
    return NextResponse.json({ error: 'training debe ser boolean.' }, { status: 400 });
  }
  const source = raw.source === 'generate' || raw.source === 'feedback' ? raw.source : 'settings';
  const now = new Date();
  await connectToDatabase();
  await TrainingConsentRecord.create({
    userId,
    training: raw.training,
    policyVersion: TRAINING_CONSENT_POLICY_VERSION,
    source,
    changedAt: now,
    revokedAt: raw.training ? null : now,
    updatedAt: now,
  });

  if (!raw.training) {
    // Revocation is immediate for future builds. Historical immutable releases are
    // handled by the rebuild/revocation workflow in #1090.
    await TrainingDataRecord.updateMany(
      { userId, 'eligibility.status': { $in: ['pending', 'eligible'] } },
      {
        $set: {
          'eligibility.status': 'revoked',
          'eligibility.reasonCodes': ['training_consent_revoked'],
          'eligibility.evaluatedAt': now,
          'eligibility.evaluatorVersion': 'consent-gate-v1',
          updatedAt: now,
        },
      },
    );
  }

  return NextResponse.json({ training: raw.training, policyVersion: TRAINING_CONSENT_POLICY_VERSION, changedAt: now });
}

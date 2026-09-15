import { isPremiumJoAdmin } from '@/lib/admin-auth';
import connectToDatabase from '@/lib/mongoose';
import AffiliateApplication from '@/models/AffiliateApplication';
import { redirect } from 'next/navigation';
import AffiliateApplicationsClient from './affiliate-applications-client';

export default async function DashboardAffiliateApplicationsPage() {
  if (!(await isPremiumJoAdmin())) {
    redirect('/dashboard/profile');
  }

  await connectToDatabase();
  const applications = await AffiliateApplication.find({}).sort({ createdAt: -1 }).limit(200).lean();
  const serializedApplications = applications.map(application => ({
    _id: application._id.toString(),
    fullName: application.fullName,
    email: application.email,
    profile: application.profile,
    audience: application.audience,
    channel: application.channel,
    experience: application.experience,
    tier: application.tier,
    plan: application.plan,
    message: application.message,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Solicitudes de afiliados</h1>
        <p className="text-sm text-muted-foreground">
          Visible solo para <code>PROMPT_STUDIO_PREMIUM_JO</code>.
        </p>
      </div>

      <AffiliateApplicationsClient initialApplications={serializedApplications} />
    </div>
  );
}

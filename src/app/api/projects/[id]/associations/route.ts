import { auth, clerkClient } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import AIGenerationJob from '@/models/AIGenerationJob';
import BrandKit from '@/models/BrandKit';
import CreativeProject from '@/models/CreativeProject';
import LandingPublication from '@/models/LandingPublication';

const headers = () => cacheHeaders('private-no-store');

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: headers() });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Proyecto no encontrado.' }, { status: 404, headers: headers() });

  const user = await (await clerkClient()).users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
  await connectToDatabase();
  const project = await CreativeProject.findOne({
    _id: id,
    $or: [{ userId }, { 'collaborators.userId': userId }, { 'collaborators.email': email }],
  }).select('userId name brief audience status').lean();
  if (!project) return NextResponse.json({ error: 'Proyecto no encontrado.' }, { status: 404, headers: headers() });

  const [brandKits, generations, publications] = await Promise.all([
    BrandKit.find({ projectId: id }).sort({ updatedAt: -1 }).select('name logoUrl colors tone updatedAt').lean(),
    AIGenerationJob.find({ projectId: id }).sort({ createdAt: -1 }).limit(200).select('kind provider status progress result createdAt completedAt').lean(),
    LandingPublication.find({ projectId: id }).sort({ updatedAt: -1 }).select('name slug status version updatedAt publishedAt').lean(),
  ]);

  return NextResponse.json({
    project: { id, name: project.name, status: project.status },
    brief: { text: project.brief, audience: project.audience },
    brandKits: brandKits.map(kit => ({ ...kit, id: String(kit._id), _id: undefined })),
    generations: generations.map(job => ({ ...job, id: String(job._id), _id: undefined })),
    publications: publications.map(publication => ({ ...publication, id: String(publication._id), _id: undefined })),
  }, { headers: headers() });
}

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { rateLimit, RATE_LIMITS, tooManyRequests } from '@/lib/rate-limit';
import ChatSession from '@/models/AIGenerationChat';

const headers = () => cacheHeaders('private-no-store');

export async function GET(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });
  const { chatId } = await params;
  const quota = await rateLimit({ key: `chat-get:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  await connectToDatabase();
  const session = await ChatSession.findOne({ _id: chatId, userId }).lean().exec();
  if (!session) return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404, headers: headers() });
  return NextResponse.json({ chat: session }, { headers: headers() });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });
  const { chatId } = await params;
  const quota = await rateLimit({ key: `chat-delete:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  await connectToDatabase();
  const session = await ChatSession.findOneAndDelete({ _id: chatId, userId });
  if (!session) return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404, headers: headers() });
  return NextResponse.json({ deleted: true }, { headers: headers() });
}

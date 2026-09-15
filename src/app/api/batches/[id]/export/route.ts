import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { createZipArchive } from '@/lib/zip-archive';
import { outputUrl } from '@/lib/prompt-experiment';
import { safeSegment } from '@/lib/batch-generation';
import AIGenerationJob from '@/models/AIGenerationJob';
import BatchGeneration from '@/models/BatchGeneration';

export const runtime = 'nodejs';
type StoredRow = { index:number; product:string; format:string; language:string; audience:string; jobId:unknown };

export async function GET(_: Request, { params }: { params: Promise<{ id:string }> }) {
  const { userId } = await auth(); const { id } = await params;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Lote no encontrado.' }, { status: 404 });
  await connectToDatabase();
  const batch = await BatchGeneration.findOne({ _id: id, userId }).lean();
  if (!batch) return NextResponse.json({ error: 'Lote no encontrado.' }, { status: 404 });
  const rows = batch.rows as StoredRow[];
  const jobs = await AIGenerationJob.find({ _id: { $in: rows.map(row => row.jobId) }, userId }).lean();
  const byId = new Map(jobs.map(job => [String(job._id), job])); const root = safeSegment(batch.name);
  const manifest = { name: batch.name, kind: batch.kind, provider: batch.provider, exportedAt: new Date().toISOString(), rows: rows.map(row => { const job = byId.get(String(row.jobId)); return { index: row.index, product: row.product, format: row.format, language: row.language, audience: row.audience, status: job?.status || 'missing', resultUrl: outputUrl(job?.result) }; }) };
  const entries = [{ name: `${root}/manifest.json`, data: Buffer.from(JSON.stringify(manifest, null, 2)) }, { name: `${root}/README.md`, data: Buffer.from(`# ${batch.name}\n\nResultados organizados por formato, idioma y audiencia. Los archivos .url.txt apuntan al activo generado almacenado por el proveedor.\n`) }];
  for (const row of manifest.rows) { const folder = `${root}/${String(row.index).padStart(3, '0')}-${safeSegment(row.product)}/${safeSegment(row.language)}/${safeSegment(row.audience)}/${safeSegment(row.format)}`; entries.push({ name: `${folder}/result.url.txt`, data: Buffer.from(row.resultUrl || `Status: ${row.status}`) }); }
  const zip = createZipArchive(entries);
  return new NextResponse(new Uint8Array(zip), { headers: { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${root}.zip"`, 'Cache-Control': 'private, no-store' } });
}

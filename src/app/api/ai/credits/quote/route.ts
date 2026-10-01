import { getEnabledAIOperation } from '@/lib/ai-operation-catalog';
import { resolveCodeAuditOperation } from '@/lib/code-audit-operation';
import { getCreditBalance } from '@/lib/ai-job-service';
import { cacheHeaders } from '@/lib/cache-policy';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const headers = () => cacheHeaders('private-no-store');

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para cotizar una generación.' }, { status: 401, headers: headers() });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const operationCode = typeof body?.operationCode === 'string' ? body.operationCode : '';
  const operation = getEnabledAIOperation(operationCode);
  if (!operation) return NextResponse.json({ error: { code: 'OPERATION_NOT_AVAILABLE' } }, { status: 400, headers: headers() });

  let creditCost = operation.creditCost;
  if (operation.code === 'CODE_AUDIT_PROJECT') {
    const fileCount = Number(body?.fileCount);
    const lineCount = Number(body?.lineCount);
    if (!Number.isInteger(fileCount) || fileCount < 1 || fileCount > 100000 || !Number.isInteger(lineCount) || lineCount < 0 || lineCount > 100000000) {
      return NextResponse.json({ error: { code: 'WORKLOAD_INVALID' } }, { status: 400, headers: headers() });
    }
    creditCost = resolveCodeAuditOperation({
      codeAuditTier: 'project',
      fileCount,
      lineCount,
    }).creditCost;
  }

  const credits = await getCreditBalance(userId);
  const availableBalance = Math.max(0, credits.balance - credits.reserved);
  return NextResponse.json({
    quote: {
      operationCode: operation.code,
      displayName: operation.displayName,
      creditCost,
      currentBalance: availableBalance,
      estimatedBalanceAfter: Math.max(0, availableBalance - creditCost),
      sufficientCredits: availableBalance >= creditCost,
      isFree: operation.isFree,
    },
  }, { status: 200, headers: headers() });
}

export function isValidComponentPurchase(input: {
  expectedProductId: string;
  expectedUserId: string;
  expectedAmountCents: number;
  expectedCurrency: string;
  metadataProductId?: string | null;
  metadataUserId?: string | null;
  buyerKey?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
}) {
  return input.metadataProductId === input.expectedProductId && input.metadataUserId === input.expectedUserId && input.buyerKey === input.expectedUserId && input.amountTotal === input.expectedAmountCents && input.currency?.toLowerCase() === input.expectedCurrency.toLowerCase();
}

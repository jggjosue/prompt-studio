import 'server-only';

import { getComponentProduct, type ComponentProduct } from '@/lib/component-products';
import { getR2ObjectText, isR2S3Configured } from '@/lib/r2-storage';

const prefix = (process.env.COMPONENT_CATALOG_R2_PREFIX ?? 'catalog/components/private').replace(/^\/+|\/+$/g, '');

function validRemoteProduct(value: unknown, expectedId: string): value is ComponentProduct {
  if (!value || typeof value !== 'object') return false;
  const product = value as Partial<ComponentProduct>;
  return product.id === expectedId && typeof product.kind === 'string' && typeof product.priceCents === 'number' && product.priceCents > 0 && product.currency === 'usd' && typeof product.prompt?.en === 'string' && typeof product.prompt?.es === 'string' && typeof product.name?.en === 'string' && typeof product.name?.es === 'string' && Array.isArray(product.stack) && Array.isArray(product.tags);
}

/** R2 privado permite sustituir un producto sin recompilar; el JSON local es fallback. */
export async function getComponentProductContent(id: string): Promise<ComponentProduct | null> {
  const normalizedId = id.trim();
  if (!/^[a-z]+-\d{3}$/.test(normalizedId)) return null;
  if (isR2S3Configured()) {
    const remote = await getR2ObjectText(`${prefix}/${normalizedId}.json`);
    if (remote) {
      try {
        const parsed = JSON.parse(remote) as unknown;
        if (validRemoteProduct(parsed, normalizedId)) return parsed;
      } catch {
        // An invalid remote revision never replaces the verified local product.
      }
    }
  }
  return getComponentProduct(normalizedId);
}

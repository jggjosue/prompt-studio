import 'server-only';

import buttonCatalog from '../data/prompts/web-button-components.json';
import cardCatalog from '../data/prompts/web-card-components.json';
import formCatalog from '../data/prompts/web-form-components.json';
import headerCatalog from '../data/prompts/web-header-components.json';
import loginCatalog from '../data/prompts/web-login-components.json';
import navigationCatalog from '../data/prompts/web-navigation-components.json';
import sidebarCatalog from '../data/prompts/web-sidebar-components.json';
import textCatalog from '../data/prompts/web-text-components.json';

type RawComponent = {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  prompt: { en: string; es: string };
  stack: string[];
  tags: string[];
  membership: string;
};

export type ComponentProduct = RawComponent & {
  kind: string;
  priceCents: number;
  currency: 'usd';
};

const sources: Array<[string, RawComponent[]]> = [
  ['login', loginCatalog.components],
  ['header', headerCatalog.components],
  ['text', textCatalog.components],
  ['form', formCatalog.components],
  ['button', buttonCatalog.components],
  ['card', cardCatalog.components],
  ['navigation', navigationCatalog.components],
  ['sidebar', sidebarCatalog.components],
] as Array<[string, RawComponent[]]>;

const products = new Map(
  sources.flatMap(([kind, items]) => items.map(item => [item.id, {
    ...item,
    kind,
    priceCents: 500,
    currency: 'usd' as const,
  }] as const))
);

export function getComponentProduct(id: string): ComponentProduct | null {
  return products.get(id.trim()) ?? null;
}

export function getComponentProducts(): ComponentProduct[] {
  return [...products.values()];
}

export function formatComponentPrice(product: ComponentProduct): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency.toUpperCase() }).format(product.priceCents / 100);
}

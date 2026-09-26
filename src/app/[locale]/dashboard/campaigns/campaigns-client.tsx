'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OptimizedImage } from '@/components/optimized-image';
import { Copy, ExternalLink, Sparkles } from 'lucide-react';
import type { WebPageEntry } from '@/lib/web-pages';
import type { AffiliateDashboardStats } from '@/lib/affiliate-mongo';
import { AFFILIATE_COMMISSION_PERCENT } from '@/lib/affiliate';
import { getSiteUrl } from '@/lib/site-url';
import { getWebPageCheckoutUrl } from '@/lib/web-page-checkout';

type CampaignsClientProps = {
  products: WebPageEntry[];
  affiliate: AffiliateDashboardStats;
};

function cents(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function formatProductPrice(price: string): string {
  const normalized = price.trim();
  if (!normalized) return 'Price unavailable';
  const numeric = Number(normalized.replace(/[$,\s]/g, ''));
  if (Number.isFinite(numeric)) {
    return `$${numeric.toFixed(2)}`;
  }
  return normalized.startsWith('$') ? normalized : `$${normalized}`;
}

const commissionLabel = `${AFFILIATE_COMMISSION_PERCENT}%`;

export function CampaignsClient({ products, affiliate }: CampaignsClientProps) {
  const t = useTranslations('dashboard');
  const { userId } = useAuth();
  const [copied, setCopied] = useState('');
  const [selectedProductId] = useState(products[0]?.id ?? '');
  const siteUrl = getSiteUrl();
  const clicksByProduct = useMemo(
    () => new Map(affiliate.productClicks.map(item => [item.productId, item.clicks])),
    [affiliate.productClicks]
  );

  const campaignUrl = (product: WebPageEntry) => {
    const ref = userId ?? 'guest';
    return `${siteUrl}/landing-pages/${encodeURIComponent(product.demoUrl)}?ref=${encodeURIComponent(ref)}&product=${encodeURIComponent(product.id)}&source=${encodeURIComponent(product.demoUrl)}`;
  };

  const checkoutUrlFor = (product: WebPageEntry) => {
    const stripeUrl = getWebPageCheckoutUrl(product.price);
    if (!stripeUrl) return null;
    if (!userId) return stripeUrl;

    const url = new URL(stripeUrl);
    url.searchParams.set('client_reference_id', `${userId}___${product.id}`);
    url.searchParams.set('affiliate_product_id', product.id);
    return url.toString();
  };

  const selectedProduct = useMemo(
    () => products.find(product => product.id === selectedProductId) ?? products[0] ?? null,
    [products, selectedProductId]
  );

  const selectedCampaignLink = selectedProduct ? campaignUrl(selectedProduct) : '#';
  const selectedProductPrice = selectedProduct ? formatProductPrice(selectedProduct.price) : 'Price unavailable';
  const checkoutUrl = useMemo(
    () => (selectedProduct ? checkoutUrlFor(selectedProduct) : null),
    [selectedProduct, userId]
  );

  async function copy(value: string, id: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(''), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Campaigns
            </div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Campañas Premium</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">{t('campaignsDesc')}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Productos</p>
              <p className="mt-1 text-2xl font-bold">{products.length}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Comisión</p>
              <p className="mt-1 text-2xl font-bold">{commissionLabel}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Sesión</p>
              <p className="mt-1 text-2xl font-bold">{userId ? 'Activa' : 'Invitado'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-background/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ventas totales</p>
            <p className="mt-1 text-2xl font-bold">{affiliate.salesRegistered}</p>
          </div>
          <div className="rounded-xl border bg-background/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ingresos totales</p>
            <p className="mt-1 text-2xl font-bold">{cents(affiliate.totalRevenueCents)}</p>
          </div>
          <div className="rounded-xl border bg-background/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Payout total</p>
            <p className="mt-1 text-2xl font-bold">{cents(affiliate.paidRevenueCents)}</p>
          </div>
          <div className="rounded-xl border bg-background/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Conversión</p>
            <p className="mt-1 text-2xl font-bold">{affiliate.conversionRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {products.map(product => {
          const link = campaignUrl(product);
          const productClicks = clicksByProduct.get(product.id) ?? 0;

          return (
            <Card
              key={product.id}
              className={`overflow-hidden border-border/60 bg-card shadow-sm transition-all ${selectedProductId === product.id
                ? 'ring-2 ring-blue-500/40 shadow-[0_0_0_1px_rgba(37,99,235,0.16)]'
                : ''
                }`}
            >
              <CardContent className="p-6">
                <div className="overflow-hidden rounded-2xl border bg-background/70">
                  <div className="relative aspect-[16/9] w-full bg-muted/40">
                    <OptimizedImage
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                      data-ai-hint={product.imageHint}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Enlace de afiliado</p>
                    <div className="mt-3 space-y-3">
                      <Input value={link} readOnly className="font-mono text-xs" />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => void copy(link, `detail-${product.id}`)}
                        >
                          <Copy className="h-4 w-4" />
                          {copied === `detail-${product.id}` ? 'Copiado' : 'Copiar enlace'}
                        </Button>
                        <Button asChild className="gap-2">
                          <Link href={link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Abrir
                          </Link>
                        </Button>
                        <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/30 px-3 py-2 text-sm font-medium text-muted-foreground">
                          {productClicks} {productClicks === 1 ? 'clic' : 'clics'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Este enlace identifica la sesión del usuario y el producto para atribuir la comisión correcta al 30%.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card className="overflow-hidden border-border/60 bg-card shadow-sm xl:sticky xl:top-6 xl:h-fit">
          <CardHeader className="space-y-2 border-b bg-muted/20">
            <CardTitle className="text-xl">Detalle de campaña</CardTitle>
            <p className="text-sm text-muted-foreground">
              Al seleccionar una página, aquí ves el link de compra/precio y el link de afiliado.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <AnimatePresence mode="wait">
              {selectedProduct ? (
                <motion.div
                  key={selectedProduct.id}
                  initial={{ opacity: 0, y: 12, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.985 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Campaña seleccionada</p>
                    <p className="text-lg font-semibold">{selectedProduct.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedProduct.demoUrl}</p>
                    <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm font-semibold">
                      <span className="text-muted-foreground">Precio real</span>
                      <span>{selectedProductPrice}</span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border bg-background/70">
                    <div className="relative aspect-[16/10] w-full bg-muted/40">
                      <OptimizedImage
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 36vw"
                        className="object-cover"
                        data-ai-hint={selectedProduct.imageHint}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Link del precio / compra</p>
                    {checkoutUrl ? (
                      <>
                        <Input value={checkoutUrl} readOnly className="font-mono text-xs" />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => void copy(checkoutUrl, `checkout-${selectedProduct.id}`)}
                          >
                            <Copy className="h-4 w-4" />
                            {copied === `checkout-${selectedProduct.id}` ? 'Copiado' : 'Copiar compra'}
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() =>
                              void copy(
                                `${selectedProductPrice} · ${checkoutUrl}`,
                                `price-checkout-${selectedProduct.id}`
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                            {copied === `price-checkout-${selectedProduct.id}`
                              ? 'Copiado'
                              : 'Copiar precio + compra'}
                          </Button>
                          <Button asChild className="gap-2">
                            <Link href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              Comprar ahora
                            </Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay checkout configurado para este producto.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 rounded-2xl border bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Link de afiliado</p>
                    <Input value={selectedCampaignLink} readOnly className="font-mono text-xs" />
                    <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/30 px-3 py-2 text-sm font-medium text-muted-foreground">
                      {clicksByProduct.get(selectedProduct.id) ?? 0}{' '}
                      {(clicksByProduct.get(selectedProduct.id) ?? 0) === 1 ? 'clic' : 'clics'}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      El link de compra mantiene la sesión del afiliado y el producto seleccionado para atribuir la comisión correcta.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-dashed bg-background/50 p-6 text-sm text-muted-foreground"
                >
                  No hay campañas disponibles.
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

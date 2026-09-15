'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OptimizedImage } from '@/components/optimized-image';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { PENDING_CHECKOUT_KEY } from '@/hooks/use-recently-viewed-landings';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Crown,
  Download,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react';

type PreviewPurchaseProps = {
  checkoutUrl: string;
  imageUrl?: string;
  locale: string;
  price: string;
  previewUrl: string;
  productName: string;
  slug: string;
};

export function PreviewPurchase({
  checkoutUrl,
  imageUrl,
  locale,
  price,
  previewUrl,
  productName,
  slug,
}: PreviewPurchaseProps) {
  const english = locale === 'en';
  const copy = english
    ? {
        trigger: `Buy${price ? ` for ${price}` : ''}`,
        title: 'Complete your purchase',
        description: 'Review exactly what you will receive before continuing to secure payment.',
        finalPrice: 'Final price',
        guarantee: 'Delivery guaranteed after payment confirmation',
        guaranteeDetail: 'Immediate access to the organized source files and commercial license.',
        methods: 'Payment methods',
        methodsDetail: 'Cards, wallets, and local methods available through Stripe.',
        included: 'One-time payment · No recurring charges',
        options: 'Choose the best option for you',
        individual: 'Single purchase',
        individualDetail: `This template${price ? ` for ${price}` : ''}`,
        selected: 'Selected',
        bundle: 'Bundle',
        bundleDetail: '5 templates at a discount',
        bundleAction: 'Choose 5',
        bestValue: 'Best value',
        premium: 'Premium',
        premiumDetail: 'Access to the entire catalog',
        premiumAction: 'View Premium',
        checkout: 'Buy and download',
        trust: 'Secure Stripe payment · Instant download · Commercial license · Issue support',
      }
    : {
        trigger: `Comprar${price ? ` por ${price}` : ''}`,
        title: 'Completa tu compra',
        description: 'Revisa exactamente lo que recibirás antes de continuar al pago seguro.',
        finalPrice: 'Precio final',
        guarantee: 'Entrega garantizada al confirmar el pago',
        guaranteeDetail: 'Acceso inmediato al código organizado y a la licencia comercial.',
        methods: 'Métodos de pago',
        methodsDetail: 'Tarjetas, wallets y métodos locales disponibles mediante Stripe.',
        included: 'Pago único · Sin cargos recurrentes',
        options: 'Elige la opción que más te conviene',
        individual: 'Compra individual',
        individualDetail: `Esta plantilla${price ? ` por ${price}` : ''}`,
        selected: 'Seleccionada',
        bundle: 'Bundle',
        bundleDetail: '5 plantillas con descuento',
        bundleAction: 'Elegir 5',
        bestValue: 'Mejor valor',
        premium: 'Premium',
        premiumDetail: 'Acceso a todo el catálogo',
        premiumAction: 'Ver Premium',
        checkout: 'Comprar y descargar',
        trust: 'Pago seguro con Stripe · Descarga inmediata · Licencia comercial · Soporte para incidencias',
      };

  return (
    <Dialog>
      <div className="flex flex-1 flex-col gap-1.5 sm:flex-none sm:items-end">
        <DialogTrigger asChild>
          <button
            type="button"
            onClick={() => trackAnalyticsEvent('web_buy_button_premium', { page_id: slug, page_title: productName, item_id: slug, item_name: productName, item_category: 'landing-page', value: Number(price.replace(/[^\d.]/g, '')) || undefined, currency: 'USD', action_source: 'preview-sticky-cta' })}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0057ff] px-5 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-[#1467ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            {copy.trigger}
          </button>
        </DialogTrigger>
        <p className="max-w-sm text-[10px] leading-4 text-zinc-400 sm:text-right">{copy.trust}</p>
      </div>

      <DialogContent className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto rounded-2xl border-zinc-200 p-0 text-zinc-950">
        <div className="relative aspect-[16/7] overflow-hidden rounded-t-2xl bg-zinc-100">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={`Vista previa de ${productName}`}
              fill
              sizes="(max-width: 640px) 100vw, 576px"
              className="object-cover object-top"
              lazyAdaptive={false}
            />
          ) : (
            <iframe
              src={previewUrl}
              title={`Captura de ${productName}`}
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none h-[250%] w-[250%] origin-top-left scale-[0.4] border-0"
              sandbox=""
            />
          )}
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <DialogHeader className="pr-7 text-left">
            <DialogTitle className="text-xl sm:text-2xl">{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-zinc-950">{productName}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  {copy.included}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-zinc-500">{copy.finalPrice}</p>
                <p className="text-2xl font-black text-zinc-950">{price || '—'}</p>
                {price ? <p className="text-xs text-zinc-500">USD</p> : null}
              </div>
            </div>
          </div>

          <section aria-labelledby="purchase-options-title">
            <h3 id="purchase-options-title" className="mb-3 text-sm font-semibold text-zinc-950">
              {copy.options}
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative rounded-xl border-2 border-blue-600 bg-blue-50 p-3.5">
                <ShoppingCart className="mb-2 size-5 text-blue-600" aria-hidden="true" />
                <p className="text-sm font-bold text-zinc-950">{copy.individual}</p>
                <p className="mt-1 min-h-10 text-xs leading-5 text-zinc-600">
                  {copy.individualDetail}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-blue-600 px-2 py-1 text-[11px] font-bold text-white">
                  {copy.selected}
                </span>
              </div>

              <div className="relative rounded-xl border border-zinc-200 bg-white p-3.5 transition hover:border-blue-300 hover:shadow-sm">
                <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {copy.bestValue}
                </span>
                <ShoppingBag className="mb-2 size-5 text-amber-600" aria-hidden="true" />
                <p className="text-sm font-bold text-zinc-950">{copy.bundle}</p>
                <p className="mt-1 min-h-10 text-xs leading-5 text-zinc-600">{copy.bundleDetail}</p>
                <a
                  href="/landing-pages?bundle=5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                >
                  {copy.bundleAction} <ArrowRight className="size-3" aria-hidden="true" />
                </a>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-3.5 transition hover:border-violet-300 hover:shadow-sm">
                <Crown className="mb-2 size-5 text-violet-600" aria-hidden="true" />
                <p className="text-sm font-bold text-zinc-950">{copy.premium}</p>
                <p className="mt-1 min-h-10 text-xs leading-5 text-zinc-600">{copy.premiumDetail}</p>
                <a
                  href="/prices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900"
                >
                  {copy.premiumAction} <ArrowRight className="size-3" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 p-4">
              <ShieldCheck className="mb-2 size-5 text-emerald-600" aria-hidden="true" />
              <p className="text-sm font-semibold">{copy.guarantee}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{copy.guaranteeDetail}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 p-4">
              <CreditCard className="mb-2 size-5 text-blue-600" aria-hidden="true" />
              <p className="text-sm font-semibold">{copy.methods}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{copy.methodsDetail}</p>
            </div>
          </div>

          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              const customized = Boolean(localStorage.getItem(`landing-preview-customization:${slug}`));
              localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({ slug, productName, price, customized, startedAt: new Date().toISOString() }));
              trackAnalyticsEvent('web_checkout_start', { page_id: slug, page_title: productName, item_id: slug, item_name: productName, item_category: 'landing-page', value: Number(price.replace(/[^\d.]/g, '')) || undefined, currency: 'USD', customized, action_source: 'preview-purchase-modal' });
            }}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0057ff] px-5 text-sm font-bold text-white transition hover:bg-[#1467ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          >
            <Download className="size-4" aria-hidden="true" />
            {copy.checkout}{price ? ` · ${price}` : ''}
          </a>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-zinc-500">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {copy.trust}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

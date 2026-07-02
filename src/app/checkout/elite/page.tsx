import Script from 'next/script';
import { createElement } from 'react';

const STRIPE_ELITE_BUY_BUTTON_ID = process.env.ELITE_PLAN_BUY_BUTTON_ID;
const STRIPE_PUBLISHABLE_KEY =
  process.env.PLAN_PUBLISHABLE_KEY;

type CheckoutPageProps = {
  searchParams: Promise<{
    client_reference_id?: string;
  }>;
};

export default async function EliteCheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { client_reference_id: clientReferenceId } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
          Elite Web
        </p>
        <h1 className="mt-3 text-3xl font-bold">Checkout seguro de Stripe</h1>
        <p className="mb-8 mt-3 text-slate-300">
          Compra única · 50 USD
        </p>

        <Script async src="https://js.stripe.com/v3/buy-button.js" />
        {/* Stripe registra este Web Component cuando termina de cargar el script. */}
        {createElement('stripe-buy-button', {
          'buy-button-id': STRIPE_ELITE_BUY_BUTTON_ID,
          'publishable-key': STRIPE_PUBLISHABLE_KEY,
          ...(clientReferenceId
            ? { 'client-reference-id': clientReferenceId }
            : {}),
        })}
      </section>
    </main>
  );
}

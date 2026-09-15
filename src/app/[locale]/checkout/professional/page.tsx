import { redirect } from 'next/navigation';

/**
 * Contenido por usuario: nunca debe prerenderizarse ni cachearse en el edge.
 * Marcarlo explícitamente evita que el prerender lo intente y falle en build.
 */
export const dynamic = 'force-dynamic';

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfessionalCheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const paymentLink =
    process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_PROFESSIONAL_PLAN;
  if (!paymentLink) redirect('/prices');

  const url = new URL(paymentLink);
  const params = await searchParams;
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') url.searchParams.set(key, value);
  });

  redirect(url.toString());
}

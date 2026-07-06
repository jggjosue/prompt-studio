import { redirect } from 'next/navigation';

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MiniCheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MINI_WEB_PLAN;
  if (!paymentLink) redirect('/prices');

  const url = new URL(paymentLink);
  const params = await searchParams;
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') url.searchParams.set(key, value);
  });

  redirect(url.toString());
}

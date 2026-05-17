import type { Metadata } from 'next';
import PricesClient from './prices-client';

export const metadata: Metadata = {
  title: 'Prices | Prompt Studio',
  description:
    'Compare Free, Premium, and Developer plans. Download free prompts, unlock Premium content, or get full project source code and install guides.',
};

export default function PricesPage() {
  return <PricesClient />;
}

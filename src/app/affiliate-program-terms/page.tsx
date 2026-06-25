import type { Metadata } from 'next';
import AffiliateTermsClient from './affiliate-terms-client';

export const metadata: Metadata = {
  title: 'Affiliate Program Terms | Prompt Studio',
  description:
    'Read the Prompt Studio Affiliate Program Terms to learn how affiliates can promote eligible AI video prompt products and memberships, earn commissions, and follow program rules.',
  alternates: {
    canonical: '/affiliate-program-terms',
  },
};

export default function AffiliateProgramTermsPage() {
  return <AffiliateTermsClient />;
}

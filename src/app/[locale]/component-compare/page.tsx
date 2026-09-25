import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import DeferredComponentCompare from './deferred-component-compare';

export const metadata: Metadata = {
  title: 'Comparador de Componentes UI | Prompt Studio',
  description: 'Audita y compara hasta tres componentes UI lado a lado: responsive, accesibilidad WCAG AA, dependencias, complejidad técnica, estados y personalización.',
  alternates: { canonical: '/component-compare' },
};

export default async function ComponentComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DeferredComponentCompare />;
}


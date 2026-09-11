import type { Metadata } from 'next';
import DeferredComponentCompare from './deferred-component-compare';

export const metadata: Metadata = {
  title: 'Comparador de componentes | Prompt Studio',
  description: 'Compara hasta tres componentes por responsive, accesibilidad, dependencias, complejidad, personalización, estados y membresía.',
  alternates: { canonical: '/component-compare' },
};

export default function ComponentComparePage() { return <DeferredComponentCompare />; }

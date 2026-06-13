'use client';

import dynamic from 'next/dynamic';

const CustomCursor = dynamic(
  () =>
    import('@/components/ui/custom-cursor').then(module => module.CustomCursor),
  { ssr: false }
);

export function CustomCursorLoader() {
  return <CustomCursor />;
}

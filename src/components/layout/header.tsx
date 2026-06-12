'use client';

import dynamic from 'next/dynamic';

const HeaderClient = dynamic(() => import('./header-client'), {
  ssr: false,
  loading: () => <div className="h-16 w-full border-b bg-background" />,
});

export default function Header() {
  return <HeaderClient />;
}

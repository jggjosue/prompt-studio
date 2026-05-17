'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Globe, Menu } from 'lucide-react';
import SearchBar from './SearchBar';

function AirbnbLogo() {
  return (
    <svg
      className="h-8 w-8 text-rausch"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16 1c2 0 3.46.88 4.6 2.1C21.9 4.5 23 6.2 23.5 8c.5 1.8.5 3.8 0 5.8-.3 1.2-.9 2.4-1.7 3.5-.8 1.1-1.9 2.1-3.2 2.9-2.6 1.6-5.6 2.4-8.6 2.4s-6-.8-8.6-2.4c-1.3-.8-2.4-1.8-3.2-2.9-.8-1.1-1.4-2.3-1.7-3.5-.5-2-.5-4 0-5.8.5-1.8 1.6-3.5 3-4.9C12.54 1.88 14 1 16 1zm0 3.2c-1.2 0-2.1.4-2.9 1.1-.8.7-1.4 1.6-1.7 2.6-.3 1-.3 2.1 0 3.1.3 1 .9 1.9 1.7 2.6.8.7 1.7 1.1 2.9 1.1s2.1-.4 2.9-1.1c.8-.7 1.4-1.6 1.7-2.6.3-1 .3-2.1 0-3.1-.3-1-.9-1.9-1.7-2.6-.8-.7-1.7-1.1-2.9-1.1z" />
      <path d="M16 12c3.5 0 6.5 1.2 8.5 3.2 1 1 1.7 2.2 2.2 3.5.5 1.3.7 2.7.5 4.1-.4 2.8-2 5.2-4.5 6.8-2.5 1.6-5.5 2.4-8.7 2.4s-6.2-.8-8.7-2.4c-2.5-1.6-4.1-4-4.5-6.8-.2-1.4 0-2.8.5-4.1.5-1.3 1.2-2.5 2.2-3.5 2-2 5-3.2 8.5-3.2zm0 2.4c-2.6 0-4.8.9-6.3 2.4-.7.7-1.2 1.6-1.5 2.5-.3.9-.4 1.9-.2 2.9.3 2.1 1.5 3.9 3.4 5.1 1.9 1.2 4.2 1.8 6.6 1.8s4.7-.6 6.6-1.8c1.9-1.2 3.1-3 3.4-5.1.2-1-.1-2-.2-2.9-.3-.9-.8-1.8-1.5-2.5-1.5-1.5-3.7-2.4-6.3-2.4z" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 h-[73px] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <AirbnbLogo />
          <span className="hidden sm:block text-rausch font-semibold text-lg">airbnb</span>
        </Link>
        <Suspense fallback={<div className="hidden md:block flex-1 max-w-[850px] mx-4 h-12 rounded-full bg-gray-100 animate-pulse" />}>
          <SearchBar />
        </Suspense>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="#"
            className="hidden md:block text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-100"
          >
            Pon tu espacio
          </Link>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Idioma"
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-300 rounded-full p-2 pl-3 hover:shadow-md transition-shadow"
            aria-label="Menú"
          >
            <Menu className="w-4 h-4" />
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-foggy to-hof" />
          </button>
        </div>
      </div>
    </header>
  );
}

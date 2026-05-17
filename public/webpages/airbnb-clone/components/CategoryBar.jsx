'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Map } from 'lucide-react';
import { CATEGORIES } from '@/lib/listings';

export default function CategoryBar({ showMap, onToggleMap }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('cat') || '';

  function selectCategory(id) {
    const params = new URLSearchParams(searchParams.toString());
    if (id && params.get('cat') === id) params.delete('cat');
    else if (id) params.set('cat', id);
    else params.delete('cat');
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="sticky top-[73px] z-40 bg-white border-b border-gray-200">
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 flex items-center gap-4 py-3">
        <div className="flex-1 flex gap-8 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.id)}
              className={`flex flex-col items-center gap-1 min-w-[56px] pb-2 border-b-2 shrink-0 transition-colors ${
                activeCat === cat.id
                  ? 'border-hof text-hof'
                  : 'border-transparent text-foggy hover:text-hof hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggleMap}
          className="hidden md:flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium hover:shadow-md transition-shadow shrink-0"
        >
          <Map className="w-4 h-4" />
          {showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
        </button>
      </div>
    </div>
  );
}

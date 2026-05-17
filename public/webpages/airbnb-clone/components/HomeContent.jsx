'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { LISTINGS } from '@/lib/listings';
import CategoryBar from './CategoryBar';
import ListingCard from './ListingCard';

const MapView = dynamic(() => import('./Map'), { ssr: false });

export default function HomeContent() {
  const searchParams = useSearchParams();
  const [showMap, setShowMap] = useState(false);

  const cat = searchParams.get('cat') || '';
  const q = (searchParams.get('q') || '').toLowerCase();

  const filtered = useMemo(() => {
    return LISTINGS.filter(listing => {
      const matchCat = !cat || listing.category === cat;
      const matchQ =
        !q ||
        listing.title.toLowerCase().includes(q) ||
        listing.location.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [cat, q]);

  return (
    <>
      <CategoryBar showMap={showMap} onToggleMap={() => setShowMap(m => !m)} />
      <div
        className={`max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 py-6 ${
          showMap ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''
        }`}
      >
        <div
          className={
            showMap
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10'
              : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10'
          }
        >
          {filtered.length === 0 ? (
            <p className="col-span-full text-foggy py-12 text-center">
              No hay alojamientos que coincidan con tu búsqueda.
            </p>
          ) : (
            filtered.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          )}
        </div>
        {showMap && (
          <div className="sticky top-[140px] h-[calc(100vh-160px)] hidden lg:block">
            <MapView listings={filtered} />
          </div>
        )}
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useState } from 'react';

export default function ListingCard({ listing }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [fav, setFav] = useState(false);
  const images = listing.images || [];

  function prev(e) {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex(i => (i === 0 ? images.length - 1 : i - 1));
  }

  function next(e) {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex(i => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <Link href={`/rooms/${listing.id}`} className="group block">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={images[imgIndex]}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 20vw"
        />
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            setFav(!fav);
          }}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform"
          aria-label="Favorito"
        >
          <Heart
            className={`w-6 h-6 drop-shadow ${fav ? 'fill-rausch text-rausch' : 'fill-black/50 text-white'}`}
          />
        </button>
        <button
          type="button"
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity shadow"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity shadow"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between gap-2">
          <h3 className="font-semibold text-hof truncate">{listing.location}</h3>
          <span className="flex items-center gap-1 text-sm shrink-0">
            ★ {listing.rating}
          </span>
        </div>
        <p className="text-foggy text-sm truncate">{listing.title}</p>
        <p className="text-foggy text-sm">{listing.distance}</p>
        <p className="text-foggy text-sm">15–20 ene</p>
        <p className="mt-1">
          <span className="font-semibold">${listing.price}</span>
          <span className="text-foggy"> noche</span>
        </p>
      </div>
    </Link>
  );
}

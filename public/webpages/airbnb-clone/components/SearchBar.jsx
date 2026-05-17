'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    router.push(`/?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden md:flex items-center border border-gray-300 rounded-full shadow-search hover:shadow-airbnb transition-shadow divide-x divide-gray-300 flex-1 max-w-[850px] mx-4"
    >
      <div className="flex-1 px-6 py-3">
        <label className="block text-xs font-semibold">¿A dónde vas?</label>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar destinos"
          className="w-full text-sm text-hof placeholder:text-foggy outline-none bg-transparent"
        />
      </div>
      <button type="button" className="px-6 py-3 text-left hidden lg:block">
        <span className="block text-xs font-semibold">Llegada</span>
        <span className="text-sm text-foggy">Agregar fechas</span>
      </button>
      <button type="button" className="px-6 py-3 text-left hidden lg:block">
        <span className="block text-xs font-semibold">Salida</span>
        <span className="text-sm text-foggy">Agregar fechas</span>
      </button>
      <div className="flex items-center gap-2 px-4 py-2">
        <button type="button" className="text-left hidden xl:block">
          <span className="block text-xs font-semibold">Huéspedes</span>
          <span className="text-sm text-foggy">¿Cuántos?</span>
        </button>
        <button
          type="submit"
          className="bg-rausch text-white p-3 rounded-full hover:bg-[#e31c5f] transition-colors"
          aria-label="Buscar"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

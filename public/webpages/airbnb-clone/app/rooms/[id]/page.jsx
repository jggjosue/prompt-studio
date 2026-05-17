import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { LISTINGS, getListingById } from '@/lib/listings';
import { Star, Shield, Key, MapPin } from 'lucide-react';

const MapView = dynamic(() => import('@/components/Map'), { ssr: false });

export function generateStaticParams() {
  return LISTINGS.map(l => ({ id: l.id }));
}

export default function RoomPage({ params }) {
  const listing = getListingById(params.id);
  if (!listing) notFound();

  const nights = 5;
  const subtotal = listing.price * nights;
  const cleaning = 45;
  const service = Math.round(subtotal * 0.14);
  const total = subtotal + cleaning + service;

  const gallery = [
    listing.images[0],
    listing.images[1] || listing.images[0],
    listing.images[2] || listing.images[0],
    listing.images[0],
    listing.images[1] || listing.images[0],
  ];

  return (
    <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">{listing.title}</h1>
      <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
        <span className="flex items-center gap-1 font-medium">
          <Star className="w-4 h-4 fill-hof" /> {listing.rating} · {listing.reviews} reseñas
        </span>
        <span className="underline font-medium">{listing.location}</span>
      </div>

      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden h-[300px] md:h-[480px] mb-10">
        <div className="col-span-2 row-span-2 relative">
          <Image src={gallery[0]} alt="" fill className="object-cover" priority />
        </div>
        <div className="relative">
          <Image src={gallery[1]} alt="" fill className="object-cover" />
        </div>
        <div className="relative">
          <Image src={gallery[2]} alt="" fill className="object-cover" />
        </div>
        <div className="relative">
          <Image src={gallery[3]} alt="" fill className="object-cover" />
        </div>
        <div className="relative">
          <Image src={gallery[4]} alt="" fill className="object-cover" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between pb-8 border-b">
            <div>
              <h2 className="text-xl font-semibold">
                Anfitrión: {listing.host} · {listing.guests} huéspedes · {listing.bedrooms}{' '}
                habitaciones · {listing.beds} camas · {listing.baths} baños
              </h2>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rausch to-babu shrink-0" />
          </div>

          <div className="space-y-6 pb-8 border-b">
            <div className="flex gap-4">
              <Shield className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold">Anfitrión destacado</p>
                <p className="text-foggy text-sm">Experiencia verificada y excelentes reseñas.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Key className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold">Llegada autónoma</p>
                <p className="text-foggy text-sm">Check-in con cerradura inteligente.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold">Ubicación excelente</p>
                <p className="text-foggy text-sm">{listing.distance}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-hof leading-relaxed">
              Disfruta de este alojamiento único en {listing.location}. Perfecto para quienes
              buscan comodidad, estilo y una experiencia memorable. Incluye WiFi de alta velocidad,
              cocina equipada y espacios pensados para el descanso.
            </p>
          </div>

          <div className="h-[360px] rounded-xl overflow-hidden">
            <MapView listings={[listing]} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-28 border border-gray-300 rounded-xl p-6 shadow-airbnb">
            <p className="text-lg mb-4">
              <span className="font-semibold text-xl">${listing.price}</span>
              <span className="text-foggy"> noche</span>
            </p>
            <div className="border border-gray-400 rounded-lg overflow-hidden mb-4">
              <div className="grid grid-cols-2 border-b border-gray-400">
                <button type="button" className="p-3 text-left border-r border-gray-400 text-xs">
                  <span className="font-semibold block">LLEGADA</span>
                  <span className="text-foggy">15/1/2026</span>
                </button>
                <button type="button" className="p-3 text-left text-xs">
                  <span className="font-semibold block">SALIDA</span>
                  <span className="text-foggy">20/1/2026</span>
                </button>
              </div>
              <button type="button" className="w-full p-3 text-left text-xs">
                <span className="font-semibold block">HUÉSPEDES</span>
                <span className="text-foggy">1 huésped</span>
              </button>
            </div>
            <button
              type="button"
              className="w-full bg-rausch text-white font-semibold py-3 rounded-lg hover:bg-[#e31c5f] transition-colors mb-4"
            >
              Reservar
            </button>
            <p className="text-center text-foggy text-xs mb-4">No se hará ningún cargo por ahora</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="underline">
                  ${listing.price} x {nights} noches
                </span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="underline">Tarifa de limpieza</span>
                <span>${cleaning}</span>
              </div>
              <div className="flex justify-between">
                <span className="underline">Tarifa de servicio</span>
                <span>${service}</span>
              </div>
              <div className="flex justify-between font-semibold pt-3 border-t">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link href="/" className="inline-block mt-8 text-sm font-medium underline">
        ← Volver al inicio
      </Link>
    </div>
  );
}

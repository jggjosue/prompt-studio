'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Image from 'next/image';
import Link from 'next/link';

function createPriceIcon(price) {
  return L.divIcon({
    className: 'custom-price-marker',
    html: `<span style="background:white;border:1px solid #222;border-radius:20px;padding:4px 10px;font-size:12px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,.15);white-space:nowrap;">$${price}</span>`,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
  });
}

export default function MapView({ listings }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-xl animate-pulse" />;
  }

  const center =
    listings.length > 0
      ? [listings[0].lat, listings[0].lng]
      : [23.6345, -102.5528];

  return (
    <MapContainer
      center={center}
      zoom={5}
      className="w-full h-full min-h-[calc(100vh-160px)] rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map(listing => (
        <Marker
          key={listing.id}
          position={[listing.lat, listing.lng]}
          icon={createPriceIcon(listing.price)}
        >
          <Popup>
            <Link href={`/rooms/${listing.id}`} className="block w-48">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-2 h-24">
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  width={192}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="font-semibold text-sm">{listing.title}</p>
              <p className="text-xs text-gray-600">${listing.price} noche</p>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

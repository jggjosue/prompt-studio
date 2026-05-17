# Airbnb Clone

Clon funcional de [airbnb.com](https://www.airbnb.com) con Next.js 14 (App Router), Tailwind CSS y Leaflet. Datos mock en México, sin backend.

## Stack

- next@14.2.5, react@18.3.1
- leaflet@1.9.4, react-leaflet@4.2.1
- lucide-react@0.441.0
- tailwindcss@3.4.10

## Instalación

```bash
cd public/webpages/airbnb-clone
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Funcionalidades

- Grid responsivo de alojamientos (1→5 columnas)
- 14 categorías con filtro `?cat=`
- Búsqueda por texto `?q=`
- Toggle mapa Leaflet con marcadores estilo pill
- Carrusel en tarjetas, favoritos, página de detalle `/rooms/[id]`
- Sidebar de reserva con desglose de precio

## Estructura

Ver `app/`, `components/`, `lib/listings.js`.

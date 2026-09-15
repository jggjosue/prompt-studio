import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-327-restaurants.webp","/images/product-photography/product-photo-328-restaurants.webp","/images/product-photography/product-photo-329-restaurants.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Restaurantes · Restaurants</p><h1>Brasa Norte</h1><Image src={images[0]} alt="Mariscos mediterráneos" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

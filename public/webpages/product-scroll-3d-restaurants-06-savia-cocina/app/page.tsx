import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-319-restaurants.webp","/images/product-photography/product-photo-321-restaurants.webp","/images/product-photography/product-photo-322-restaurants.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Restaurantes · Restaurants</p><h1>Savia Cocina</h1><Image src={images[0]} alt="Salmón de alta cocina" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

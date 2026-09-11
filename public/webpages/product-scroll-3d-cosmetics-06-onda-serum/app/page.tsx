import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-287-cosmetics.webp","/images/product-photography/product-photo-288-cosmetics.webp","/images/product-photography/product-photo-289-cosmetics.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Cosméticos · Cosmetics</p><h1>Onda Serum</h1><Image src={images[0]} alt="Limpiador facial entre reflejos de agua" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

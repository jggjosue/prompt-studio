import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-346-automotive.webp","/images/product-photography/product-photo-347-automotive.webp","/images/product-photography/product-photo-348-automotive.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Automóviles · Automotive</p><h1>Aero GT</h1><Image src={images[0]} alt="Auto eléctrico compacto urbano" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

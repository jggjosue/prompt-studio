import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-303-jewelry.webp","/images/product-photography/product-photo-304-jewelry.webp","/images/product-photography/product-photo-305-jewelry.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Joyería · Jewelry</p><h1>Nocturne Gems</h1><Image src={images[0]} alt="Brazalete geométrico de plata" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

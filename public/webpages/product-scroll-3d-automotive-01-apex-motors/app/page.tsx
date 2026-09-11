import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-343-automotive.webp","/images/product-photography/product-photo-344-automotive.webp","/images/product-photography/product-photo-345-automotive.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Automóviles · Automotive</p><h1>Apex Motors</h1><Image src={images[0]} alt="Coupé eléctrico futurista" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

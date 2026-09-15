import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-349-automotive.webp","/images/product-photography/product-photo-350-automotive.webp","/images/product-photography/product-photo-351-automotive.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Automóviles · Automotive</p><h1>Volta Drive</h1><Image src={images[0]} alt="Camioneta pickup de montaña" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-315-fashion.webp","/images/product-photography/product-photo-316-fashion.webp","/images/product-photography/product-photo-317-fashion.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Moda · Fashion</p><h1>Atempo</h1><Image src={images[0]} alt="Chaqueta de mezclilla índigo" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

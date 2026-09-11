import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-282-cosmetics.webp","/images/product-photography/product-photo-283-cosmetics.webp","/images/product-photography/product-photo-287-cosmetics.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Cosméticos · Cosmetics</p><h1>Aura Skin</h1><Image src={images[0]} alt="Suero facial sobre travertino" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

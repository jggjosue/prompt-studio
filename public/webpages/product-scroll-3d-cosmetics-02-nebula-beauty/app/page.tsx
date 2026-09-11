import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-288-cosmetics.webp","/images/product-photography/product-photo-289-cosmetics.webp","/images/product-photography/product-photo-290-cosmetics.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Cosméticos · Cosmetics</p><h1>Nébula Beauty</h1><Image src={images[0]} alt="Crema hidratante entre nubes" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-364-advertising-mockups.webp","/images/product-photography/product-photo-365-advertising-mockups.webp","/images/product-photography/product-photo-366-advertising-mockups.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Mockups publicitarios · Advertising Mockups</p><h1>Mockup Orbit</h1><Image src={images[0]} alt="Mockup de vaso y bolsa de café" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

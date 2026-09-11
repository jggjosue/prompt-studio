import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-369-amazon-and-marketplaces.webp","/images/product-photography/product-photo-370-amazon-and-marketplaces.webp","/images/product-photography/product-photo-371-amazon-and-marketplaces.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Amazon y marketplaces · Amazon & Marketplaces</p><h1>Buybox</h1><Image src={images[0]} alt="Ficha de botella térmica" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

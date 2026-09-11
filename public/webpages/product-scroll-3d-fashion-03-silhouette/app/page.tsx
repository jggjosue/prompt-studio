import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-312-fashion.webp","/images/product-photography/product-photo-313-fashion.webp","/images/product-photography/product-photo-314-fashion.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Moda · Fashion</p><h1>Silhouette</h1><Image src={images[0]} alt="Gafas de sol mediterráneas" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

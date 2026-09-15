import Image from 'next/image';
import './product-scroll.css';

export default function Page() {
  const images = ["/images/product-photography/product-photo-330-real-estate.webp","/images/product-photography/product-photo-332-real-estate.webp","/images/product-photography/product-photo-333-real-estate.webp"];
  return (
    <main data-template="product-scroll-3d">
      <section className="hero"><p>Bienes raíces · Real Estate</p><h1>Nómada Homes</h1><Image src={images[0]} alt="Villa de lujo al atardecer" fill priority /></section>
      <section className="product-story">{images.slice(1).map((src, index) => <Image key={src} src={src} alt={`Producto ${index + 1}`} width={900} height={1100} />)}</section>
    </main>
  );
}

import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Airbnb — Alojamientos para vacaciones, cabañas y más',
  description: 'Clon funcional de Airbnb con datos mock en México',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="text-hof antialiased bg-white">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

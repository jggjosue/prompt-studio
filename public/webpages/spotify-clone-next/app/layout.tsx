import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Spotify — Música y podcasts para todos",
  description:
    "Millones de canciones y episodios. Sin tarjeta de crédito. Obtén Spotify Free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} font-montserrat`}>
        {children}
      </body>
    </html>
  );
}

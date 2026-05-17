import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Plans from "@/components/Plans";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Plans />
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

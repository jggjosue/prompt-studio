import Button from "./ui/Button";

export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">
          ¿Listo para escuchar música sin límites?
        </h2>
        <p className="mt-4 text-lg opacity-95">
          Únete a millones de oyentes en Spotify.
        </p>
        <Button href="#" className="mt-8">
          Regístrate gratis
        </Button>
      </div>
    </section>
  );
}

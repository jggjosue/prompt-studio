import Button from "./ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-spotify-green via-green-700 to-green-900 px-6 py-20 md:px-16 md:py-28">
      <div
        className="pointer-events-none absolute -right-1/4 top-0 h-[80%] w-[60%] rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">
          Música y podcasts para todos
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg md:text-xl">
          Millones de canciones y episodios. Sin tarjeta de crédito.
        </p>
        <Button href="#" className="mt-8">
          Obtén Spotify Free
        </Button>
      </div>
    </section>
  );
}

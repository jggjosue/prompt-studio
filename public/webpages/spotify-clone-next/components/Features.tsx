import { features } from "@/lib/content";

export default function Features() {
  return (
    <section className="bg-spotify-black px-6 py-16 md:px-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
          ¿Por qué pasarte a Premium?
        </h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="text-center">
              <span
                className="mb-4 block text-5xl"
                role="img"
                aria-hidden="true"
              >
                {feature.icon}
              </span>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-spotify-gray">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import Button from "./Button";

type Props = {
  name: string;
  price: string;
  features: readonly string[];
  legal: string;
  featured?: boolean;
};

export default function PlanCard({
  name,
  price,
  features,
  legal,
  featured = false,
}: Props) {
  return (
    <article
      className={`relative rounded-xl border border-spotify-border bg-spotify-dark p-8 transition-all duration-200 hover:-translate-y-1 hover:border-spotify-green ${
        featured ? "md:mt-0" : ""
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 rounded-full bg-spotify-green px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
          Mejor valorado
        </span>
      )}
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="mt-3 text-3xl font-black tracking-tight">
        {price}
        <span className="text-base font-normal text-spotify-gray">/mes</span>
      </p>
      <ul className="mt-6 space-y-2 text-sm text-spotify-gray">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="font-bold text-spotify-green" aria-hidden="true">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Button href="#" className="mt-6 w-full !px-6 !py-3 text-center">
        Empezar
      </Button>
      <p className="mt-4 text-xs leading-relaxed text-spotify-gray">{legal}</p>
    </article>
  );
}

import { plans } from "@/lib/content";
import PlanCard from "./ui/PlanCard";

export default function Plans() {
  return (
    <section
      id="premium"
      className="bg-gradient-to-b from-spotify-dark to-spotify-black px-6 py-16 md:px-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
          Elige tu plan Premium
        </h2>
        <p className="mt-2 text-center text-spotify-gray">
          Escucha sin límites. Cancela cuando quieras.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              features={plan.features}
              legal={plan.legal}
              featured={plan.featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

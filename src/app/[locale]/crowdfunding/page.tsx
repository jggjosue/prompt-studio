import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { CrowdfundingCheckout } from '@/components/CrowdfundingCheckout';
import type { ReactNode } from 'react';
import { CrowdfundingCreditCalculator } from '@/components/CrowdfundingCreditCalculator';
import { FOUNDER_REWARD_TIERS, getFounderRewardTier } from '@/lib/founder-credit-tiers';
import { InterestPageView } from '@/components/analytics/interest-page-view';

export const metadata: Metadata = {
  title: 'Founder Credits | Prompt Studio',
  description: 'Apoya el crecimiento de Prompt Studio y recibe Founder Credits para crear texto, imágenes, video, sitios web y más con IA.',
};

const tools = [
  ['Text generation', 'Crea y transforma contenido con IA.'],
  ['Image generation', 'Genera imágenes desde 1K hasta 4K.'],
  ['Video generation', 'Crea clips de IA con opciones de calidad y velocidad.'],
  ['Website generation', 'Genera sitios desde una idea o prompt.'],
  ['AI website editing', 'Edita secciones o rediseña páginas con IA.'],
  ['Prompt optimizer', 'Mejora prompts antes de gastar en una generación.'],
  ['Code auditor', 'Analiza código, proyectos y riesgos técnicos.'],
];

const goals = [
  ['$25K', 'Fund', 'Créditos de APIs de IA, infraestructura y lanzamiento.'],
  ['$35K', 'Accelerate', 'Más capacidad de desarrollo y mejoras de producto.'],
  ['$50K', 'Scale', 'Escalado de generación, rendimiento y experiencia.'],
  ['$75K', 'Expand', 'Más herramientas, modelos y flujos para creadores.'],
  ['$100K', 'Build bigger', 'Acelerar la visión completa de Prompt Studio.'],
];

export default async function FounderCreditsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const es = locale === 'es';
  const tr = (en: string, spanish: string) => es ? spanish : en;
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100"><Header /><InterestPageView page="/crowdfunding" program="founder_credits" /><main className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20"><div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[34rem] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.16),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,.18),transparent_35%),radial-gradient(circle_at_50%_40%,rgba(37,99,235,.12),transparent_42%)]" />
      <section className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <span className="inline-flex rounded-full border px-3 py-1 text-sm font-medium">Prompt Studio · Founder Credits</span>
          <h1 className="mt-5 max-w-4xl bg-gradient-to-r from-white via-cyan-100 to-violet-200 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl">{tr('Help build the AI creative studio and turn your support into creative capacity.', 'Ayuda a construir el estudio creativo de IA y convierte tu apoyo en capacidad para crear.')}</h1>
          <p className="mt-5 max-w-2xl text-lg opacity-75">{tr('Prompt Studio brings together text, image, video and website generation, AI website editing, prompt optimization and code auditing. Founder Credits are internal Prompt Studio credits you can use across compatible tools without being tied to a specific AI provider.', 'Prompt Studio reúne generación de texto, imágenes, video, sitios web, edición con IA, optimización de prompts y auditoría de código. Los Founder Credits son créditos internos de Prompt Studio: puedes usarlos en las herramientas compatibles sin quedar atado a un proveedor de IA específico.')}</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="#calculator" className="rounded-xl bg-foreground px-5 py-3 font-semibold text-background">{tr('Calculate Founder Credits', 'Calcular Founder Credits')}</a><a href="#how-it-works" className="rounded-xl border px-5 py-3 font-semibold">{tr('How it works', 'Cómo funciona')}</a></div>
          <p className="mt-4 text-sm opacity-60">{tr('Initial crowdfunding goal: $25,000 USD · Non-equity campaign.', 'Meta inicial de crowdfunding: $25,000 USD · Campaña no-equity.')}</p>
        </div>
        <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[.055] p-6 shadow-[0_30px_100px_rgba(37,99,235,.18)] backdrop-blur-xl sm:p-8"><p className="text-sm font-medium opacity-60">{tr('Founder example', 'Ejemplo Founder')}</p><div className="mt-2 text-5xl font-bold">5,500</div><p className="mt-1">{tr('Founder Credits with a $50 contribution', 'Founder Credits con un aporte de $50')}</p><div className="my-6 h-px bg-border" /><div className="grid grid-cols-2 gap-4 text-sm"><div><div className="opacity-60">Base</div><strong>5,000</strong></div><div><div className="opacity-60">Bonus</div><strong>+10%</strong></div><div><div className="opacity-60">Quality 1K images</div><strong>{tr('up to 183', 'hasta 183')}</strong></div><div><div className="opacity-60">Advanced websites</div><strong>{tr('up to 110', 'hasta 110')}</strong></div></div><p className="mt-6 text-xs opacity-60">{tr('Examples are category maximums using current prices; they do not represent a fixed generation package.', 'Los ejemplos son máximos por categoría usando precios actuales; no representan un paquete fijo de generaciones.')}</p></div>
      </section>

      <section className="mt-20"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider opacity-60">{tr('One balance, multiple tools', 'Un saldo, múltiples herramientas')}</p><h2 className="mt-2 text-3xl font-bold">{tr('Create more than prompts', 'Crea más que prompts')}</h2><p className="mt-3 opacity-70">Prompt Credits abstrae el costo de los proveedores. Prompt Studio puede evolucionar entre modelos y proveedores mientras tu saldo sigue expresado en la misma moneda interna.</p></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tools.map(([name, description]) => <article key={name} className="rounded-2xl border p-5"><h3 className="font-semibold">{name}</h3><p className="mt-2 text-sm opacity-65">{description}</p></article>)}</div></section>

      <section id="calculator" className="relative z-10 mt-20 grid scroll-mt-8 gap-6 lg:grid-cols-2"><CrowdfundingCreditCalculator /><CrowdfundingCheckout /></section>

      <section id="how-it-works" className="mt-20 scroll-mt-8"><h2 className="text-3xl font-bold">{tr('Founder tiers', 'Tiers Founder')}</h2><p className="mt-3 max-w-3xl opacity-70">{tr('Every $1 contributes 100 base credits. Founder tiers add an increasing bonus of up to 20%.', 'Cada $1 aporta 100 créditos base. Los tiers Founder añaden un bonus creciente de hasta 20%.')}</p><div className="mt-7 overflow-x-auto rounded-2xl border"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="p-4 text-left">{tr('Contribution', 'Aporte')}</th><th className="p-4 text-right">Base</th><th className="p-4 text-right">Bonus</th><th className="p-4 text-right">Total Founder Credits</th></tr></thead><tbody>{FOUNDER_REWARD_TIERS.map((tier) => { const reward = getFounderRewardTier(tier.pledgeAmountCents)!; return <tr key={tier.pledgeAmountCents} className="border-b last:border-0"><td className="p-4 font-semibold">{'$' + tier.pledgeAmountCents / 100}</td><td className="p-4 text-right">{tier.baseCredits.toLocaleString()}</td><td className="p-4 text-right">{'+' + tier.bonusPercent + '%'}</td><td className="p-4 text-right font-semibold">{reward.totalCredits.toLocaleString()}</td></tr>; })}</tbody></table></div></section>

      <section className="mt-20 grid gap-8 lg:grid-cols-2"><div><p className="text-sm font-semibold uppercase tracking-wider opacity-60">Premium</p><h2 className="mt-2 text-3xl font-bold">$9/month · 1,000 Prompt Credits</h2><p className="mt-4 opacity-70">Premium es la referencia mensual de la economía: 1,000 créditos por cada ciclo de facturación exitoso. Founder Credits son una recompensa separada vinculada al crowdfunding y permanecen diferenciados en el wallet.</p></div><div className="rounded-2xl border p-6"><h3 className="text-xl font-semibold">{tr('When do I receive Founder Credits?', '¿Cuándo recibo Founder Credits?')}</h3><p className="mt-3 opacity-70">{tr('They are not delivered when you pledge. They become available after the campaign is successfully funded, Magzin receives the funds, and the backer is verified. The operational target is to enable them within 14 days after successful receipt of funds.', 'No se entregan al hacer el pledge. Se habilitan después de que la campaña sea financiada con éxito, Magzin reciba los fondos y el backer sea verificado. El objetivo operativo es habilitarlos dentro de los 14 días posteriores a la recepción exitosa de los fondos.')}</p></div></section>

      <section className="mt-20"><p className="text-sm font-semibold uppercase tracking-wider opacity-60">{tr('Campaign roadmap', 'Roadmap de campaña')}</p><h2 className="mt-2 text-3xl font-bold">{tr('From $25K to $100K', 'De $25K a $100K')}</h2><div className="mt-8 grid gap-3 md:grid-cols-5">{goals.map(([amount, title, description]) => <article key={amount} className="rounded-2xl border p-5"><div className="text-2xl font-bold">{amount}</div><h3 className="mt-2 font-semibold">{title}</h3><p className="mt-2 text-sm opacity-65">{description}</p></article>)}</div><p className="mt-4 text-sm opacity-60">{tr('Stretch goals expand the product and execution capacity; they do not automatically add credits to Founder rewards.', 'Los stretch goals amplían el producto y la capacidad de ejecución; no añaden automáticamente créditos a las recompensas Founder.')}</p></section>

      <section className="mt-20 grid gap-8 rounded-3xl border p-6 sm:p-10 lg:grid-cols-2"><div><h2 className="text-3xl font-bold">{tr('How will the support be used?', '¿En qué se utilizará el apoyo?')}</h2><p className="mt-4 opacity-70">Principalmente en costos de APIs y créditos de IA, aceleración de desarrollo, infraestructura, estabilidad y escalado. El objetivo es convertir capital de campaña en más capacidad para construir y operar Prompt Studio.</p></div><div className="space-y-4"><Info title="Proveedor agnóstico">Tu saldo no representa dólares de Gemini, OpenAI u otro proveedor.</Info><Info title="Precio visible">Antes de una generación pagada, Prompt Studio puede mostrar el costo estimado en créditos; el servidor confirma el precio y reserva el saldo.</Info><Info title="Sin promesas de generaciones fijas">Los costos pueden evolucionar con modelos, calidad y economía de proveedores; por eso la recompensa se expresa en créditos.</Info></div></section>

      <section className="mt-20"><h2 className="text-3xl font-bold">{tr('Frequently asked questions', 'Preguntas frecuentes')}</h2><div className="mt-6 grid gap-3 lg:grid-cols-2"><Info title="¿Founder Credits son dinero o inversión?">No. Son créditos internos de Prompt Studio para uso del producto. La campaña planteada es no-equity.</Info><Info title="¿Los créditos están ligados a una API?">No. Prompt Studio puede enrutar generaciones entre proveedores/modelos y mantener Prompt Credits como moneda interna estable para el usuario.</Info><Info title="¿Puedo comprar créditos aparte?">La economía contempla paquetes de una sola compra además de créditos mensuales Premium y Founder Credits.</Info><Info title="¿Todos los usos cuestan lo mismo?">No. Texto, imágenes, video, websites, edición y auditoría tienen costos distintos según el trabajo solicitado. Algunas acciones como el preview simple de componentes pueden ser gratuitas.</Info></div></section>

      <section className="mt-20 rounded-3xl border p-8 text-center sm:p-12"><h2 className="text-3xl font-bold">{tr('Build with Prompt Studio', 'Construye con Prompt Studio')}</h2><p className="mx-auto mt-3 max-w-2xl opacity-70">Explora la plataforma ahora y vuelve a esta página para calcular qué capacidad de creación recibirías como Founder.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/" className="rounded-xl bg-foreground px-5 py-3 font-semibold text-background">{tr('Explore Prompt Studio', 'Explorar Prompt Studio')}</Link><a href="#calculator" className="rounded-xl border px-5 py-3 font-semibold">{tr('Calculate credits', 'Calcular créditos')}</a></div></section>
    </main><Footer /></div>
  );
}

function Info({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-2xl border p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm opacity-65">{children}</p></div>; }

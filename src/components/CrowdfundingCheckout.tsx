'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, LockKeyhole } from 'lucide-react';
const PRESETS = [50, 100, 500, 1000] as const;
export function CrowdfundingCheckout() {
 const locale=useLocale(); const es=locale.startsWith('es'); const [amount,setAmount]=useState(50); const [custom,setCustom]=useState(''); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
 const pending = useRef(false);
 useEffect(() => {
   // Back/forward cache can restore the page with the pre-redirect spinner.
   const reset = () => { pending.current = false; setLoading(false); };
   window.addEventListener('pageshow', reset);
   return () => window.removeEventListener('pageshow', reset);
 }, []);
 const checkout = async () => {
   if (pending.current) return;
   const selected = custom ? Number(custom) : amount;
   if (!Number.isFinite(selected) || selected < 10 || selected > 1000) {
     setError(es ? 'El aporte debe estar entre $10 y $1,000 USD.' : 'Contribution must be between $10 and $1,000 USD.');
     return;
   }
   pending.current = true;
   setLoading(true);
   setError('');
   try {
     const response = await fetch('/api/crowdfunding/checkout', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ amountCents: Math.round(selected * 100), locale: es ? 'es' : 'en' }),
       signal: AbortSignal.timeout(30_000),
     });
     if (response.status === 401) {
       const returnPath = `/${es ? 'es' : 'en'}/founder#calculator`;
       window.location.assign(`/${es ? 'es' : 'en'}/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);
       return;
     }
     const data: unknown = await response.json().catch(() => null);
     const result = data && typeof data === 'object' ? data as { url?: unknown; error?: unknown } : null;
     if (!response.ok || typeof result?.url !== 'string' || !result.url) {
       throw new Error(typeof result?.error === 'string' ? result.error : (es ? 'No se pudo abrir Stripe. Inténtalo de nuevo en unos momentos.' : 'Could not open Stripe. Please try again shortly.'));
     }
     window.location.assign(result.url);
   } catch (err) {
     setError(err instanceof DOMException && err.name === 'TimeoutError'
       ? (es ? 'La conexión tardó demasiado. Inténtalo de nuevo.' : 'The connection timed out. Please try again.')
       : err instanceof Error ? err.message : (es ? 'No se pudo abrir Stripe.' : 'Could not open Stripe.'));
   } finally {
     pending.current = false;
     setLoading(false);
   }
 };
 return <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-950/70 p-6 shadow-[0_30px_100px_rgba(37,99,235,.18)] backdrop-blur-xl sm:p-8">
  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.18em] text-cyan-300"><LockKeyhole className="h-4 w-4"/>Stripe Checkout</div>
  <h2 className="mt-3 text-3xl font-black text-white">{es?'Apoya el crowdfunding':'Support the crowdfunding'}</h2>
  <p className="mt-3 text-slate-300">{es?'Elige un monto o escribe otro. Stripe procesa el pago de forma segura.':'Choose an amount or enter another one. Stripe securely processes the payment.'}</p>
  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{PRESETS.map(value=><button key={value} type="button" onClick={()=>{setAmount(value);setCustom('');}} className={'rounded-2xl border px-4 py-4 text-lg font-black transition '+(!custom&&amount===value?'border-cyan-300 bg-cyan-300/15 text-cyan-200':'border-white/10 bg-white/[.04] text-white hover:border-cyan-300/50')}>${value}</button>)}</div>
  <label className="mt-5 block text-sm font-semibold text-slate-200">{es?'Otro monto (USD)':'Other amount (USD)'}<input value={custom} onChange={e=>setCustom(e.target.value)} type="number" min="10" max="1000" step="1" placeholder="250" className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-4 text-white outline-none focus:border-cyan-300"/></label>
  <button type="button" onClick={checkout} disabled={loading} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 px-6 font-black text-white shadow-[0_0_32px_rgba(34,211,238,.25)] transition hover:scale-[1.01] disabled:opacity-60">{loading&&<Loader2 className="h-4 w-4 animate-spin"/>}{es?'Continuar con Stripe':'Continue with Stripe'}</button>
  {error&&<p className="mt-3 text-sm text-rose-300">{error}</p>}
  <p className="mt-4 text-xs leading-5 text-slate-400">{es?'Los Founder Credits no se acreditan al pagar. Permanecen pendientes hasta que la campaña sea financiada con éxito, Magzin reciba los fondos y el backer sea verificado.':'Founder Credits are not granted at payment. They remain pending until the campaign is successfully funded, Magzin receives the funds, and the backer is verified.'}</p>
 </div>;
}

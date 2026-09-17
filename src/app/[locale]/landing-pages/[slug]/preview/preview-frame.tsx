'use client';

import { trackAnalyticsEvent } from '@/lib/analytics';
import { CheckCircle2, Maximize2, Monitor, Palette, RotateCcw, Smartphone, Tablet, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const LOCKED_CONTROLS = '[data-prompt-trigger], [data-free-download-trigger]';

type PreviewFrameProps = {
  src: string;
  title: string;
  slug: string;
  productName: string;
};

type Customization = {
  enabled: boolean;
  brand: string;
  primary: string;
  secondary: string;
  headline: string;
  supportingText: string;
  industry: string;
  cta: string;
  offer: string;
  trust: string;
  contact: string;
  style: 'minimal' | 'editorial' | 'bold';
};

const DEFAULT_CUSTOMIZATION: Customization = {
  enabled: false,
  brand: '',
  primary: '#0057ff',
  secondary: '#7c3aed',
  headline: '',
  supportingText: '',
  industry: '',
  cta: '',
  offer: '',
  trust: '',
  contact: '',
  style: 'minimal',
};

function normalizeCustomization(value: Partial<Customization>): Customization {
  const text = (input: unknown, max: number) => typeof input === 'string' ? input.slice(0, max) : '';
  const color = (input: unknown, fallback: string) => typeof input === 'string' && /^#[0-9a-f]{6}$/i.test(input) ? input : fallback;
  return {
    enabled: value.enabled === true,
    brand: text(value.brand, 60),
    primary: color(value.primary, DEFAULT_CUSTOMIZATION.primary),
    secondary: color(value.secondary, DEFAULT_CUSTOMIZATION.secondary),
    headline: text(value.headline, 100),
    supportingText: text(value.supportingText, 180),
    industry: text(value.industry, 80),
    cta: text(value.cta, 40),
    offer: text(value.offer, 80),
    trust: text(value.trust, 100),
    contact: text(value.contact, 80),
    style: value.style === 'editorial' || value.style === 'bold' ? value.style : 'minimal',
  };
}

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICES: Array<{
  id: Device;
  label: string;
  width: string;
  icon: typeof Monitor;
}> = [
  { id: 'desktop', label: 'Escritorio', width: 'max-w-[1440px]', icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: 'max-w-[768px]', icon: Tablet },
  { id: 'mobile', label: 'Móvil', width: 'max-w-[390px]', icon: Smartphone },
];

export function PreviewFrame({ src, title, slug, productName }: PreviewFrameProps) {
  const observerRef = useRef<MutationObserver | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const trackedCustomization = useRef(false);
  const [device, setDevice] = useState<Device>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [customization, setCustomization] = useState<Customization>(DEFAULT_CUSTOMIZATION);

  const storageKey = `landing-preview-customization:${slug}`;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setCustomization(normalizeCustomization(JSON.parse(saved) as Partial<Customization>));
    } catch {
      // A malformed or unavailable local value must not prevent the preview.
    }
  }, [storageKey]);

  const applyCustomization = useCallback((frame: HTMLIFrameElement | null, value: Customization) => {
    if (!frame || !value.enabled) return;
    try {
      const document = frame.contentDocument;
      if (!document?.documentElement) return;
      let styles = document.querySelector<HTMLStyleElement>('[data-preview-customization-styles]');
      if (!styles) {
        styles = document.createElement('style');
        styles.dataset.previewCustomizationStyles = 'true';
        document.head.appendChild(styles);
      }
      styles.textContent = `:root{--primary:${value.primary};--primary-color:${value.primary};--accent:${value.secondary};--secondary:${value.secondary}}[data-preview-customized-cta]{background:${value.primary}!important;border-color:${value.primary}!important;color:#fff!important}[data-preview-custom-industry],[data-preview-custom-offer],[data-preview-custom-trust]{display:inline-flex;margin:0 6px 12px 0;padding:6px 10px;border-radius:999px;background:${value.secondary}20;color:${value.secondary};font:700 12px/1.2 system-ui,sans-serif;letter-spacing:.04em}[data-preview-custom-offer]{background:${value.primary}18;color:${value.primary}}[data-preview-custom-trust]{background:#16a34a18;color:#15803d}${value.style === 'editorial' ? 'h1{letter-spacing:-.055em!important;font-family:Georgia,serif!important}' : ''}${value.style === 'bold' ? 'h1{font-weight:900!important;letter-spacing:-.04em!important}' : ''}`;

      const setText = (element: Element | null, text: string) => {
        if (!element || !text.trim()) return;
        if (!element.hasAttribute('data-preview-original-text')) element.setAttribute('data-preview-original-text', element.textContent ?? '');
        element.textContent = text.trim();
      };
      setText(document.querySelector('[data-brand], .logo, header strong, header a, nav strong'), value.brand);
      const headline = document.querySelector('h1');
      setText(headline, value.headline);
      setText(headline?.parentElement?.querySelector('p') ?? document.querySelector('main p'), value.supportingText);
      const hero = headline?.closest('section, header, main') ?? document.querySelector('main');
      const cta = hero?.querySelector('a, button') ?? document.querySelector('main a, main button');
      if (cta) cta.setAttribute('data-preview-customized-cta', 'true');
      setText(cta, value.cta);

      let industry = document.querySelector<HTMLElement>('[data-preview-custom-industry]');
      if (value.industry.trim()) {
        if (!industry && headline?.parentElement) {
          industry = document.createElement('span');
          industry.dataset.previewCustomIndustry = 'true';
          headline.parentElement.insertBefore(industry, headline);
        }
        if (industry) industry.textContent = value.industry.trim();
      } else {
        industry?.remove();
      }
      const setBadge = (key: 'offer' | 'trust', text: string) => {
        let badge = document.querySelector<HTMLElement>(`[data-preview-custom-${key}]`);
        if (text.trim() && headline?.parentElement) {
          if (!badge) { badge = document.createElement('span'); badge.dataset[`previewCustom${key[0].toUpperCase()}${key.slice(1)}`] = 'true'; headline.parentElement.insertBefore(badge, headline); }
          badge.textContent = text.trim();
        } else badge?.remove();
      };
      setBadge('offer', value.offer);
      setBadge('trust', value.trust);
      const contact = document.querySelector('footer a, footer p, [data-contact]');
      setText(contact, value.contact);
    } catch {
      // Cross-origin demos remain viewable; customization is available for local demos.
    }
  }, []);

  useEffect(() => {
    if (!customization.enabled) return;
    window.localStorage.setItem(storageKey, JSON.stringify(customization));
    applyCustomization(frameRef.current, customization);
    if (!trackedCustomization.current) {
      trackedCustomization.current = true;
      trackAnalyticsEvent('web_preview_customize', { page_id: slug, page_title: productName, item_id: slug, item_name: productName, item_category: 'landing-page', action_source: 'pre-purchase-editor' });
    }
  }, [applyCustomization, customization, productName, slug, storageKey]);

  const updateCustomization = <K extends keyof Customization,>(key: K, value: Customization[K]) => {
    setCustomization(current => ({ ...current, enabled: true, [key]: value }));
  };

  const resetCustomization = () => {
    window.localStorage.removeItem(storageKey);
    setCustomization(DEFAULT_CUSTOMIZATION);
    const frame = frameRef.current;
    if (frame) frame.src = frame.src;
  };

  useEffect(() => {
    const updateFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === previewRef.current);
    };
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => {
      observerRef.current?.disconnect();
      document.removeEventListener('fullscreenchange', updateFullscreen);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await previewRef.current?.requestFullscreen();
    } catch {
      // Some embedded browsers disable the Fullscreen API.
    }
  }, []);

  const lockSourceControls = useCallback(
    (frame: HTMLIFrameElement) => {
      observerRef.current?.disconnect();

      try {
        const document = frame.contentDocument;
        if (!document) return;

        const removeLockedControls = () => {
          document.querySelectorAll(LOCKED_CONTROLS).forEach(control => {
            const container = control.closest('div');
            (container ?? control).remove();
          });
        };

        removeLockedControls();
        observerRef.current = new MutationObserver(removeLockedControls);
        observerRef.current.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      } catch {
        // The download endpoint remains protected even if a third-party demo
        // prevents access to its document.
      }
    },
    []
  );

  const selectedDevice = DEVICES.find(option => option.id === device) ?? DEVICES[0];

  return (
    <div ref={previewRef} className="flex h-full min-h-0 flex-col bg-zinc-200">
      <nav
        aria-label="Tamaño de la vista previa"
        className="flex min-h-12 shrink-0 items-center justify-center gap-1 border-b border-zinc-300 bg-white px-3 text-zinc-700 shadow-sm"
      >
        {DEVICES.map(option => {
          const Icon = option.icon;
          const active = option.id === device;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              title={option.label}
              onClick={() => setDevice(option.id)}
              className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition sm:text-sm ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
        <span className="mx-1 h-6 w-px bg-zinc-200" aria-hidden="true" />
        <button
          type="button"
          aria-expanded={editorOpen}
          onClick={() => setEditorOpen(value => !value)}
          className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition sm:text-sm ${editorOpen ? 'bg-violet-600 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'}`}
        >
          <Palette className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Personalizar gratis</span>
        </button>
        <button
          type="button"
          aria-pressed={isFullscreen}
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          onClick={() => void toggleFullscreen()}
          className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition sm:text-sm ${
            isFullscreen
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
          }`}
        >
          <Maximize2 className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">
            {isFullscreen ? 'Salir' : 'Pantalla completa'}
          </span>
        </button>
      </nav>

      <div className="relative flex min-h-0 flex-1 justify-center overflow-hidden p-0 sm:p-3">
        {editorOpen ? (
          <aside aria-label="Personalización gratuita" className="absolute right-3 top-3 z-20 max-h-[calc(100%-1.5rem)] w-[min(360px,calc(100%-1.5rem))] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-2xl">
            <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">Personaliza antes de comprar</p><p className="mt-1 text-xs text-zinc-500">Los cambios se muestran en la demo. El código y la exportación siguen bloqueados.</p></div><button type="button" aria-label="Cerrar editor" onClick={() => setEditorOpen(false)} className="rounded-lg p-1.5 hover:bg-zinc-100"><X className="size-4" /></button></div>
            <div className="mt-4 grid gap-3">
              <label className="text-xs font-bold">Marca<input value={customization.brand} onChange={event => updateCustomization('brand', event.target.value)} placeholder="Ej. Altura Living" maxLength={60} className="mt-1.5 h-10 w-full rounded-lg border border-zinc-300 px-3 font-normal" /></label>
              <label className="text-xs font-bold">Industria<input value={customization.industry} onChange={event => updateCustomization('industry', event.target.value)} placeholder="Ej. Bienes raíces de lujo" maxLength={80} className="mt-1.5 h-10 w-full rounded-lg border border-zinc-300 px-3 font-normal" /></label>
              <label className="text-xs font-bold">Título principal<input value={customization.headline} onChange={event => updateCustomization('headline', event.target.value)} placeholder="Encuentra un hogar extraordinario" maxLength={100} className="mt-1.5 h-10 w-full rounded-lg border border-zinc-300 px-3 font-normal" /></label>
              <label className="text-xs font-bold">Texto principal<textarea value={customization.supportingText} onChange={event => updateCustomization('supportingText', event.target.value)} placeholder="Describe tu oferta en una frase." maxLength={180} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-zinc-300 p-3 font-normal" /></label>
              <label className="text-xs font-bold">CTA<input value={customization.cta} onChange={event => updateCustomization('cta', event.target.value)} placeholder="Agendar una visita" maxLength={40} className="mt-1.5 h-10 w-full rounded-lg border border-zinc-300 px-3 font-normal" /></label>
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-3"><p className="text-xs font-black text-violet-900">Elementos que aumentan conversión</p><p className="mt-1 text-[11px] text-violet-700">Se muestran como badges en la demo; tendrás el código al comprar.</p><div className="mt-3 grid gap-3"><label className="text-xs font-bold">Oferta o beneficio<input value={customization.offer} onChange={event => updateCustomization('offer', event.target.value)} placeholder="Evaluación sin costo · Esta semana" maxLength={80} className="mt-1.5 h-10 w-full rounded-lg border border-violet-200 bg-white px-3 font-normal" /></label><label className="text-xs font-bold">Prueba de confianza<input value={customization.trust} onChange={event => updateCustomization('trust', event.target.value)} placeholder="Más de 2,000 clientes satisfechos" maxLength={100} className="mt-1.5 h-10 w-full rounded-lg border border-violet-200 bg-white px-3 font-normal" /></label><label className="text-xs font-bold">Contacto visible<input value={customization.contact} onChange={event => updateCustomization('contact', event.target.value)} placeholder="user@example.com · 555-0198" maxLength={80} className="mt-1.5 h-10 w-full rounded-lg border border-violet-200 bg-white px-3 font-normal" /></label></div></div>
              <div><p className="text-xs font-bold">Estilo visual</p><div className="mt-1.5 grid grid-cols-3 gap-2">{([['minimal','Minimal'],['editorial','Editorial'],['bold','Impactante']] as const).map(([style,label])=><button key={style} type="button" onClick={() => updateCustomization('style', style)} className={`rounded-lg border px-2 py-2 text-[11px] font-bold ${customization.style===style?'border-violet-600 bg-violet-600 text-white':'border-zinc-300 bg-white text-zinc-700 hover:border-violet-300'}`}>{label}</button>)}</div></div>
              <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Color principal<input type="color" value={customization.primary} onChange={event => updateCustomization('primary', event.target.value)} className="mt-1.5 h-10 w-full cursor-pointer rounded-lg border border-zinc-300 bg-white p-1" /></label><label className="text-xs font-bold">Color secundario<input type="color" value={customization.secondary} onChange={event => updateCustomization('secondary', event.target.value)} className="mt-1.5 h-10 w-full cursor-pointer rounded-lg border border-zinc-300 bg-white p-1" /></label></div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-800"><CheckCircle2 className="size-4 shrink-0" />Vista personalizada guardada localmente antes de pagar.</div>
            <button type="button" onClick={resetCustomization} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-950"><RotateCcw className="size-3.5" />Restablecer diseño</button>
          </aside>
        ) : null}
        <div
          className={`h-full w-full overflow-hidden bg-white shadow-xl transition-[max-width] duration-300 ease-out ${selectedDevice.width}`}
        >
          <iframe
            ref={frameRef}
            src={src}
            title={title}
            className="h-full w-full border-0"
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={event => { lockSourceControls(event.currentTarget); applyCustomization(event.currentTarget, customization); }}
          />
        </div>
      </div>
    </div>
  );
}

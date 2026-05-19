(function () {
  const API_BASE = '/api/refactory-online';
  const ASSETS_BASE = '/api/webpages/assets';
  const LOADER_PATH = '/webpages/refactory-online/loader.html';
  const root = document.getElementById('refactory-root');

  const copy = {
    es: {
      loading: 'Cargando componentes…',
      missingParam: 'Falta el parámetro ?demo=slug en la URL.',
      badge: 'En integración',
      title: 'Esta demo llegará pronto',
      lead: 'Estamos incorporando esta landing al catálogo en vivo.',
      sub: 'Mientras tanto, explora otras páginas ya disponibles — el HTML interactivo aparecerá aquí en cuanto esté listo.',
      browseAll: 'Ver todas las landings',
      browseTags: 'Explorar por tags',
      suggestions: 'Demos listas para abrir',
      openDemo: 'Abrir demo',
      unknownError: 'No se pudo cargar la demo.',
    },
    en: {
      loading: 'Loading components…',
      missingParam: 'Missing ?demo=slug in the URL.',
      badge: 'Coming soon',
      title: 'This demo is on the way',
      lead: 'We are integrating this landing into the live catalog.',
      sub: 'In the meantime, browse other pages that are ready — interactive HTML will appear here when it is done.',
      browseAll: 'Browse all landings',
      browseTags: 'Explore by tags',
      suggestions: 'Ready-to-open demos',
      openDemo: 'Open demo',
      unknownError: 'Could not load the demo.',
    },
  };

  function locale() {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en' || q === 'es') return q;
    return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  function t(key) {
    const lang = locale();
    return copy[lang][key] ?? copy.en[key];
  }

  function slugLabel(slug) {
    return slug.replace(/-/g, ' ');
  }

  function loaderUrl(demoSlug) {
    return `${LOADER_PATH}?demo=${encodeURIComponent(demoSlug)}`;
  }

  function showLoading() {
    if (!root) return;
    root.innerHTML = `<div class="refactory-loading">${t('loading')}</div>`;
  }

  function showError(message) {
    if (!root) return;
    root.innerHTML = '';
    const el = document.createElement('p');
    el.className = 'refactory-error-fallback';
    el.textContent = message;
    root.appendChild(el);
  }

  function showIntegrating(slug) {
    if (!root) return;

    const shell = document.createElement('div');
    shell.className = 'refactory-integrating';
    shell.innerHTML = `
      <p class="refactory-integrating-badge">${t('badge')}</p>
      <h1>${t('title')}</h1>
      <p class="refactory-integrating-lead">
        ${t('lead')}
        <span class="refactory-integrating-slug">${slugLabel(slug)}</span>
      </p>
      <p class="refactory-integrating-sub">${t('sub')}</p>
      <div class="refactory-integrating-actions">
        <a class="refactory-btn refactory-btn-primary" href="/landing-pages">${t('browseAll')}</a>
        <a class="refactory-btn refactory-btn-secondary" href="/web-tags">${t('browseTags')}</a>
      </div>
      <p class="refactory-suggestions-title">${t('suggestions')}</p>
      <div class="refactory-suggestions" data-suggestions></div>
    `;

    root.innerHTML = '';
    root.appendChild(shell);

    loadSuggestions(slug, shell.querySelector('[data-suggestions]'));
  }

  async function loadSuggestions(currentSlug, container) {
    if (!container) return;

    try {
      const lang = locale();
      const res = await fetch(
        `/api/landing-pages/catalog?locale=${lang}`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) return;

      const data = await res.json();
      const items = (data.items ?? []).filter(
        item =>
          item.demoUrl &&
          item.demoUrl !== currentSlug &&
          /^[a-z0-9][a-z0-9-]*$/i.test(item.demoUrl)
      );

      const picks = shuffle(items).slice(0, 4);
      if (picks.length === 0) return;

      container.innerHTML = picks
        .map(
          item => `
        <a class="refactory-suggestion-link" href="${loaderUrl(item.demoUrl)}">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${t('openDemo')} · ${escapeHtml(slugLabel(item.demoUrl))}</span>
        </a>
      `
        )
        .join('');
    } catch {
      /* optional block */
    }
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function stripDuplicateAssets(html, bundle) {
    let out = html;
    if (bundle.css) {
      out = out.replace(
        /<link[^>]*rel=["']stylesheet["'][^>]*href=["']\.?\/?styles\.css["'][^>]*\/?>/gi,
        ''
      );
      out = out.replace(
        /<link[^>]*href=["']\.?\/?styles\.css["'][^>]*rel=["']stylesheet["'][^>]*\/?>/gi,
        ''
      );
    }
    if (bundle.js) {
      out = out.replace(
        /<script[^>]*src=["']\.?\/?script\.js["'][^>]*><\/script>/gi,
        ''
      );
    }
    return out;
  }

  function injectBaseHref(html, bundle) {
    if (bundle.source !== 'r2') return html;
    const base = `<base href="${ASSETS_BASE}/${encodeURIComponent(bundle.slug)}/">`;
    if (/<base\s/i.test(html)) return html;
    if (html.includes('<head>')) return html.replace('<head>', '<head>' + base);
    return base + html;
  }

  function buildSrcdoc(bundle) {
    let html = bundle.html;
    html = stripDuplicateAssets(html, bundle);
    html = injectBaseHref(html, bundle);

    if (bundle.css) {
      const style = `<style data-refactory="${bundle.slug}">${bundle.css}</style>`;
      html = html.includes('</head>')
        ? html.replace('</head>', style + '</head>')
        : style + html;
    }
    if (bundle.js) {
      const script = `<script data-refactory="${bundle.slug}">${bundle.js}<\/script>`;
      html = html.includes('</body>')
        ? html.replace('</body>', script + '</body>')
        : html + script;
    }
    return html;
  }

  function resizeIframe(iframe) {
    function measure() {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        const h = Math.max(
          doc.documentElement.scrollHeight,
          doc.body?.scrollHeight || 0
        );
        if (h > 100) iframe.style.height = h + 'px';
      } catch {
        /* cross-origin */
      }
    }
    iframe.addEventListener('load', () => {
      measure();
      setTimeout(measure, 300);
      setTimeout(measure, 1000);
    });
  }

  function renderBundle(bundle) {
    if (!root) return;
    const srcdoc = buildSrcdoc(bundle);
    root.innerHTML = '';
    root.style.cssText = 'padding:0;margin:0;';

    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      'width:100%;min-height:100vh;border:none;display:block;';
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-modals'
    );
    iframe.setAttribute('srcdoc', srcdoc);
    iframe.setAttribute('title', `Demo: ${bundle.slug}`);
    root.appendChild(iframe);
    resizeIframe(iframe);

    try {
      const parsed = new DOMParser().parseFromString(bundle.html, 'text/html');
      document.title = parsed.title?.trim() || `Demo: ${bundle.slug}`;
    } catch {
      document.title = `Demo: ${bundle.slug}`;
    }
  }

  async function boot() {
    const slug = new URLSearchParams(window.location.search).get('demo')?.trim();
    if (!slug) {
      showError(t('missingParam'));
      return;
    }

    showLoading();

    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        renderBundle(data);
        return;
      }

      if (
        res.status === 404 ||
        data.code === 'DEMO_INTEGRATING' ||
        (data.error && /no encontrada|not found/i.test(data.error))
      ) {
        showIntegrating(slug);
        return;
      }

      throw new Error(data.error || `${t('unknownError')} (HTTP ${res.status})`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('unknownError');
      if (/no encontrada|not found|404/i.test(message)) {
        showIntegrating(slug);
        return;
      }
      showError(message);
    }
  }

  boot();
})();

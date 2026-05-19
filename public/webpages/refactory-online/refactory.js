(function () {
  const API_BASE = '/api/refactory-online';
  const ASSETS_BASE = '/api/webpages/assets';
  const mount = document.getElementById('refactory-root');

  function showError(message) {
    if (!mount) return;
    mount.innerHTML = '';
    const el = document.createElement('p');
    el.className = 'refactory-error';
    el.textContent = message;
    mount.appendChild(el);
  }

  function showLoadingState() {
    if (!mount) return;
    mount.innerHTML =
      '<div class="refactory-loading">Cargando componentes…</div>';
  }

  /**
   * Elimina tags redundantes cuyo contenido ya está inlineado en el bundle
   * (link[href="styles.css"] y script[src="script.js"]) para evitar
   * doble carga o errores 404 al resolver rutas relativas.
   */
  function stripRedundantRefs(html, bundle) {
    let result = html;

    if (bundle.css) {
      // <link rel="stylesheet" href="styles.css"> (con o sin ./ o rutas relativas simples)
      result = result.replace(
        /<link[^>]*rel=["']stylesheet["'][^>]*href=["']\.?\/?styles\.css["'][^>]*\/?>/gi,
        ''
      );
      result = result.replace(
        /<link[^>]*href=["']\.?\/?styles\.css["'][^>]*rel=["']stylesheet["'][^>]*\/?>/gi,
        ''
      );
    }

    if (bundle.js) {
      // <script src="script.js"> </script>
      result = result.replace(
        /<script[^>]*src=["']\.?\/?script\.js["'][^>]*><\/script>/gi,
        ''
      );
    }

    return result;
  }

  /**
   * Inserta <base href> apuntando al route de assets cuando el bundle
   * viene de R2, para que imágenes y otros recursos relativos resuelvan bien.
   */
  function injectBaseTag(html, bundle) {
    if (bundle.source !== 'r2') return html;

    const baseHref = `${ASSETS_BASE}/${encodeURIComponent(bundle.slug)}/`;
    const baseTag = `<base href="${baseHref}">`;

    // No insertar si ya tiene un <base>
    if (/<base\s/i.test(html)) return html;

    return html.includes('<head>')
      ? html.replace('<head>', '<head>' + baseTag)
      : baseTag + html;
  }

  function buildFullHtml(bundle) {
    let html = bundle.html;

    // 1. Limpiar refs relativas redundantes antes de inyectar inline
    html = stripRedundantRefs(html, bundle);

    // 2. Base href para assets de R2
    html = injectBaseTag(html, bundle);

    // 3. Inline CSS
    if (bundle.css) {
      const tag = `<style data-refactory="${bundle.slug}">${bundle.css}</style>`;
      html = html.includes('</head>')
        ? html.replace('</head>', tag + '</head>')
        : tag + html;
    }

    // 4. Inline JS
    if (bundle.js) {
      const tag = `<script data-refactory="${bundle.slug}">${bundle.js}<\/script>`;
      html = html.includes('</body>')
        ? html.replace('</body>', tag + '</body>')
        : html + tag;
    }

    return html;
  }

  function autoResizeIframe(iframe) {
    function resize() {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        const h = Math.max(
          doc.documentElement.scrollHeight,
          doc.body?.scrollHeight || 0
        );
        if (h > 100) iframe.style.height = h + 'px';
      } catch {}
    }

    iframe.addEventListener('load', () => {
      resize();
      setTimeout(resize, 300);
      setTimeout(resize, 1000);
    });
  }

  function renderBundle(bundle) {
    if (!mount) return;

    const fullHtml = buildFullHtml(bundle);

    mount.innerHTML = '';
    mount.style.cssText = 'padding:0;margin:0;';

    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      'width:100%;min-height:100vh;border:none;display:block;';
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-modals'
    );
    iframe.setAttribute('srcdoc', fullHtml);
    iframe.setAttribute('title', `Demo: ${bundle.slug}`);

    mount.appendChild(iframe);
    autoResizeIframe(iframe);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(bundle.html, 'text/html');
      document.title = doc.title?.trim() || `Demo: ${bundle.slug}`;
    } catch {}
  }

  async function loadDemo() {
    const slug = new URLSearchParams(window.location.search).get('demo')?.trim();
    if (!slug) {
      showError('Falta el parámetro ?demo=slug en la URL.');
      return;
    }

    showLoadingState();

    try {
      // cache: 'no-store' garantiza que cada recarga obtiene datos frescos de R2
      const response = await fetch(
        `${API_BASE}/${encodeURIComponent(slug)}`,
        {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          payload.error || `No se pudo cargar la demo (HTTP ${response.status})`
        );
      }
      renderBundle(payload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al cargar la demo';
      showError(message);
    }
  }

  loadDemo();
})();

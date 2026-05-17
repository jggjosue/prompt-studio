/**
 * Refactory Online — descarga e inyecta componentes de landing bajo demanda.
 */
(function (global) {
  const DEFAULT_API = '/api/refactory-online';

  function getApiBase() {
    if (global.REFACTORY_ONLINE_API) return global.REFACTORY_ONLINE_API;
    return DEFAULT_API;
  }

  function inlineBundle(html, css, js) {
    var doc = html;
    if (css) {
      doc = doc.replace(
        '</head>',
        '<style data-refactory="styles">' + css + '</style></head>'
      );
      doc = doc.replace(/<link[^>]+href=["']styles\.css["'][^>]*>/i, '');
    }
    if (js) {
      doc = doc.replace(
        '</body>',
        '<script data-refactory="script">' + js + '</script></body>'
      );
      doc = doc.replace(/<script[^>]+src=["']script\.js["'][^>]*><\/script>/i, '');
    }
    return doc;
  }

  async function fetchManifest() {
    var res = await fetch('/webpages/refactory-online/manifest.json', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('No se pudo cargar manifest.json');
    return res.json();
  }

  async function fetchComponents(slug) {
    var res = await fetch(getApiBase() + '/' + encodeURIComponent(slug), {
      cache: 'no-store',
    });
    if (!res.ok) {
      var err = await res.json().catch(function () {
        return { error: res.statusText };
      });
      throw new Error(err.error || 'Error al descargar componentes');
    }
    return res.json();
  }

  function isLoaderDocument(html) {
    return /id=["']refactory-bar["']|refactoryLoaderInit|refactory-online\/loader\.html/i.test(
      html || ''
    );
  }

  async function load(slug) {
    var bundle = await fetchComponents(slug);
    var html = inlineBundle(bundle.html || '', bundle.css || '', bundle.js || '');
    if (isLoaderDocument(html)) {
      throw new Error('El demo no puede ser el loader de Refactory');
    }
    return html;
  }

  function unmount(target) {
    var el =
      typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    el.innerHTML = '';
  }

  async function mount(target, slug, options) {
    var el =
      typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) throw new Error('Target no encontrado');

    options = options || {};
    unmount(el);
    el.innerHTML =
      '<div class="refactory-loading" style="display:flex;align-items:center;justify-content:center;min-height:200px;font-family:system-ui;color:#666;">Cargando componentes…</div>';

    try {
      var html = await load(slug);
      if (options.mode === 'iframe' || el.tagName !== 'IFRAME') {
        var iframe = document.createElement('iframe');
        iframe.setAttribute('title', options.title || slug);
        iframe.setAttribute(
          'sandbox',
          'allow-scripts allow-same-origin allow-forms allow-popups'
        );
        iframe.style.cssText =
          'width:100%;height:100%;border:0;display:block;min-height:' +
          (options.minHeight || '100vh') +
          ';';
        el.innerHTML = '';
        el.appendChild(iframe);
        iframe.removeAttribute('src');
        iframe.srcdoc = html;
        return iframe;
      }
      el.innerHTML = html;
      return el;
    } catch (e) {
      el.innerHTML =
        '<p style="color:#c00;font-family:system-ui;padding:1rem;">' +
        (e.message || 'Error') +
        '</p>';
      throw e;
    }
  }

  function loaderUrl(slug) {
    return (
      '/webpages/refactory-online/loader.html?demo=' +
      encodeURIComponent(slug)
    );
  }

  function slugFromDemoUrl(demoUrl) {
    if (!demoUrl) return '';
    var m = demoUrl.match(/\/webpages\/([^/]+)\//);
    return m ? m[1] : '';
  }

  global.RefactoryOnline = {
    load: load,
    mount: mount,
    unmount: unmount,
    fetchManifest: fetchManifest,
    fetchComponents: fetchComponents,
    loaderUrl: loaderUrl,
    slugFromDemoUrl: slugFromDemoUrl,
  };
})(typeof window !== 'undefined' ? window : globalThis);

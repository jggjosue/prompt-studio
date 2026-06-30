import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const catalogPath = resolve(root, 'public/webpages/web-pages.json');
const webpagesRoot = resolve(root, 'public/webpages');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8')).webPages;

const stripeBlockPattern =
  /\n<div style="position: fixed; bottom: 20px; right: 20px; z-index: 99999;">[\s\S]*?<script>[\s\S]*?var overlay = document\.getElementById\('stripe-auth-overlay'\);[\s\S]*?<\/script>\s*<\/div>\s*/;
const generatedDownloadPattern =
  /\n<a\s+href="\/api\/landing-pages\/wp-\d+\/download"\s+data-free-download-trigger[\s\S]*?<\/script>\s*/;

function downloadBlock(pageId, title) {
  const safeTitle = String(title)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `
<a
  href="/api/landing-pages/${pageId}/download"
  data-free-download-trigger
  aria-label="Download ${safeTitle}"
  style="position:fixed;right:20px;bottom:20px;z-index:99999;display:inline-flex;align-items:center;gap:10px;padding:14px 20px;border:1px solid rgba(96,165,250,.55);border-radius:14px;background:#2563eb;color:#fff;font:700 15px/1 system-ui,sans-serif;text-decoration:none;box-shadow:0 16px 40px rgba(37,99,235,.35)"
>
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/>
  </svg>
  Download
</a>
<div data-free-download-modal hidden style="position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.78);backdrop-filter:blur(8px)">
  <div role="dialog" aria-modal="true" aria-labelledby="free-download-title" style="position:relative;width:min(620px,100%);border:1px solid #303030;border-radius:24px;background:#050505;padding:clamp(28px,5vw,48px);color:#fff;box-shadow:0 30px 100px rgba(0,0,0,.7);font-family:system-ui,sans-serif">
    <button type="button" data-free-download-close aria-label="Cerrar" style="position:absolute;right:22px;top:18px;border:0;background:transparent;color:#aaa;font-size:34px;cursor:pointer">&times;</button>
    <h2 id="free-download-title" style="margin:0 0 10px;font-size:clamp(28px,5vw,38px);line-height:1.1">Descargar componente</h2>
    <p style="margin:0 0 28px;color:#aaa;font-size:clamp(17px,3vw,22px);line-height:1.5">Ingresa tu correo electrónico para comenzar la descarga gratuita.</p>
    <form data-free-download-form>
      <input data-free-download-email type="email" required autocomplete="email" placeholder="tu-correo@ejemplo.com" style="width:100%;height:58px;border:2px solid #2563eb;border-radius:16px;background:#050505;padding:0 18px;color:#fff;font-size:18px;outline:none;box-shadow:0 0 0 5px rgba(37,99,235,.28)">
      <label style="display:flex;align-items:flex-start;gap:12px;margin:26px 6px;color:#aaa;font-size:17px;line-height:1.4">
        <input data-free-download-terms type="checkbox" required style="width:23px;height:23px;margin:0;accent-color:#2563eb">
        <span>Acepto los <a href="/terms" target="_blank" rel="noopener noreferrer" style="color:#60a5fa">términos y servicios</a></span>
      </label>
      <button data-free-download-submit type="submit" disabled style="width:100%;height:58px;border:0;border-radius:16px;background:#1e3a8a;color:#9ca3af;font-size:18px;font-weight:700;cursor:not-allowed">Descargar ahora</button>
      <p data-free-download-error role="alert" style="min-height:20px;margin:14px 0 0;color:#f87171"></p>
    </form>
  </div>
</div>
<script>
(() => {
  const storageKey = 'prompt_studio_free_email_saved';
  const trigger = document.querySelector('[data-free-download-trigger]');
  const modal = document.querySelector('[data-free-download-modal]');
  const close = modal?.querySelector('[data-free-download-close]');
  const form = modal?.querySelector('[data-free-download-form]');
  const email = modal?.querySelector('[data-free-download-email]');
  const terms = modal?.querySelector('[data-free-download-terms]');
  const submit = modal?.querySelector('[data-free-download-submit]');
  const error = modal?.querySelector('[data-free-download-error]');
  const downloadUrl = '/api/landing-pages/${pageId}/download';

  const startDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  const setOpen = (open) => {
    if (!modal) return;
    modal.hidden = !open;
    modal.style.display = open ? 'flex' : 'none';
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) setTimeout(() => email?.focus(), 0);
  };
  const syncSubmit = () => {
    const enabled = Boolean(email?.validity.valid && terms?.checked);
    if (!submit) return;
    submit.disabled = !enabled;
    submit.style.background = enabled ? '#2563eb' : '#1e3a8a';
    submit.style.color = enabled ? '#fff' : '#9ca3af';
    submit.style.cursor = enabled ? 'pointer' : 'not-allowed';
  };

  trigger?.addEventListener('click', (event) => {
    event.preventDefault();
    if (localStorage.getItem(storageKey)) startDownload();
    else setOpen(true);
  });
  close?.addEventListener('click', () => setOpen(false));
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) setOpen(false);
  });
  email?.addEventListener('input', syncSubmit);
  terms?.addEventListener('change', syncSubmit);
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    syncSubmit();
    if (!email?.validity.valid || !terms?.checked || !submit) return;
    submit.disabled = true;
    submit.textContent = 'Procesando...';
    if (error) error.textContent = '';
    try {
      const response = await fetch('/api/new-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value.trim() })
      });
      if (!response.ok) throw new Error('No fue posible registrar el correo.');
      localStorage.setItem(storageKey, 'true');
      localStorage.setItem('prompt_studio_free_email', email.value.trim());
      setOpen(false);
      startDownload();
    } catch (requestError) {
      if (error) error.textContent = requestError instanceof Error ? requestError.message : 'Error de conexión.';
    } finally {
      submit.textContent = 'Descargar ahora';
      syncSubmit();
    }
  });
})();
</script>
`.trim();
}

function compress(path, content) {
  const input = Buffer.from(content);
  writeFileSync(`${path}.gz`, gzipSync(input, { level: 9 }));
  writeFileSync(
    `${path}.br`,
    brotliCompressSync(input, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    })
  );
}

let freeCount = 0;
let updatedCount = 0;
let missingCount = 0;

catalog.forEach((page, index) => {
  if (String(page.membership).trim().toLowerCase() !== 'free') return;
  freeCount += 1;

  const slug = String(page.demoUrl ?? '').trim().toLowerCase();
  const htmlPath = resolve(webpagesRoot, slug, 'index.html');
  if (!slug || !existsSync(htmlPath)) {
    missingCount += 1;
    return;
  }

  const original = readFileSync(htmlPath, 'utf8');
  const pageId = `wp-${index + 1}`;
  const title =
    typeof page.title === 'string'
      ? page.title
      : page.title?.en ?? page.title?.es ?? slug;
  const replacement = downloadBlock(pageId, title);
  let next = original;

  if (stripeBlockPattern.test(next)) {
    next = next.replace(stripeBlockPattern, `\n${replacement}\n`);
  } else if (generatedDownloadPattern.test(next)) {
    next = next.replace(generatedDownloadPattern, `\n${replacement}\n`);
  } else if (!next.includes(`/api/landing-pages/${pageId}/download`)) {
    next = next.replace('</body>', `${replacement}\n</body>`);
  }

  if (next === original) return;
  writeFileSync(htmlPath, next);
  compress(htmlPath, next);
  updatedCount += 1;
});

process.stdout.write(
  `Free demos: ${freeCount}; updated: ${updatedCount}; missing: ${missingCount}.\n`
);

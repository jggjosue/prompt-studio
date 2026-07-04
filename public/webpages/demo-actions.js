(function () {
  const STORAGE_KEY = 'prompt_studio_free_email_saved';
  const params = new URLSearchParams(window.location.search);
  const pageId = params.get('pageId');
  let pendingAction = null;

  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const styles = document.createElement('style');
  styles.textContent = `
    .ps-overlay{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.82);backdrop-filter:blur(8px);font-family:system-ui,-apple-system,sans-serif}
    .ps-overlay[data-open="true"]{display:flex}
    .ps-dialog{position:relative;width:min(720px,100%);max-height:85vh;overflow:auto;border:1px solid #2b2b2f;border-radius:20px;background:#050505;padding:28px;color:#fff;box-shadow:0 30px 100px rgba(0,0,0,.75)}
    .ps-dialog h2{margin:0 48px 12px 0;font-size:clamp(22px,4vw,30px);line-height:1.2}
    .ps-dialog p{color:#a1a1aa;line-height:1.55}
    .ps-close{position:absolute;right:18px;top:14px;border:0;background:transparent;color:#a1a1aa;font-size:32px;cursor:pointer}
    .ps-prompt{margin:24px 0 0;white-space:pre-wrap;color:#b4b4b8;font:16px/1.65 system-ui,-apple-system,sans-serif;user-select:all}
    .ps-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}
    .ps-button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:1px solid #3f3f46;border-radius:10px;background:#111;color:#fff;padding:0 18px;font-weight:650;cursor:pointer;text-decoration:none}
    .ps-button-primary{border-color:#2563eb;background:#2563eb}
    .ps-form{display:grid;gap:16px;margin-top:22px}
    .ps-input{box-sizing:border-box;width:100%;height:52px;border:1px solid #3f3f46;border-radius:10px;background:#09090b;padding:0 15px;color:#fff;font-size:16px}
    .ps-terms{display:flex;align-items:flex-start;gap:10px;color:#a1a1aa}
    .ps-error{min-height:20px;margin:0;color:#f87171!important}
  `;
  document.head.appendChild(styles);

  const root = document.createElement('div');
  root.innerHTML = `
    <div class="ps-overlay" data-ps-email>
      <div class="ps-dialog" role="dialog" aria-modal="true" aria-labelledby="ps-email-title">
        <button class="ps-close" type="button" data-ps-close aria-label="Cerrar">&times;</button>
        <h2 id="ps-email-title">Desbloquea el acceso</h2>
        <p>Ingresa tu correo para ver el prompt o descargar esta plantilla. Sólo te lo pediremos una vez.</p>
        <form class="ps-form" data-ps-email-form>
          <input class="ps-input" data-ps-email-input type="email" autocomplete="email" placeholder="tu@correo.com" required>
          <label class="ps-terms"><input type="checkbox" data-ps-terms required> <span>Acepto los <a href="/terms" target="_blank" rel="noopener noreferrer" style="color:#60a5fa">términos y servicios</a></span></label>
          <button class="ps-button ps-button-primary" type="submit" data-ps-submit>Continuar</button>
          <p class="ps-error" data-ps-error role="alert"></p>
        </form>
      </div>
    </div>
    <div class="ps-overlay" data-ps-prompt>
      <div class="ps-dialog" role="dialog" aria-modal="true" aria-labelledby="ps-prompt-title">
        <button class="ps-close" type="button" data-ps-close aria-label="Cerrar">&times;</button>
        <h2 id="ps-prompt-title">${escapeHtml(document.title || 'Prompt')}</h2>
        <pre class="ps-prompt" data-ps-prompt-text></pre>
        <div class="ps-actions">
          <button class="ps-button" type="button" data-ps-copy>Copiar</button>
          <a class="ps-button ps-button-primary" data-ps-use href="/prompt/edit">Usar prompt</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const emailModal = root.querySelector('[data-ps-email]');
  const promptModal = root.querySelector('[data-ps-prompt]');
  const promptText = root.querySelector('[data-ps-prompt-text]');
  const usePrompt = root.querySelector('[data-ps-use]');
  const setOpen = (modal, open) => {
    modal.dataset.open = String(open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };

  function resolvePromptUrl(trigger) {
    const inline = trigger.getAttribute('onclick') || '';
    const match = inline.match(/'prompt',\s*'([^']+)'/);
    return match?.[1] || '/prompt/edit';
  }

  function showPrompt(trigger) {
    const value = window.__PS_PROMPT_TEXT || '';
    promptText.textContent = value;
    usePrompt.href = resolvePromptUrl(trigger);
    setOpen(promptModal, true);
  }

  async function downloadProject(trigger) {
    const triggerUrl = trigger.getAttribute('href');
    const downloadUrl =
      triggerUrl && triggerUrl !== '#'
        ? triggerUrl
        : pageId
          ? `/api/landing-pages/${encodeURIComponent(pageId)}/download`
          : null;
    if (!downloadUrl) {
      window.alert('No se encontró el identificador de esta descarga.');
      return;
    }

    const response = await fetch(downloadUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const blobUrl = URL.createObjectURL(await response.blob());
    const disposition = response.headers.get('content-disposition');
    const filename =
      disposition?.match(/filename="([^"]+)"/i)?.[1] || `${pageId || 'proyecto'}.zip`;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }

  function runAction(action) {
    if (action.type === 'prompt') {
      showPrompt(action.trigger);
      return;
    }
    downloadProject(action.trigger).catch(() => {
      window.alert('No se pudo descargar el proyecto. Inténtalo de nuevo.');
    });
  }

  function requestAction(action) {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      runAction(action);
      return;
    }
    pendingAction = action;
    setOpen(emailModal, true);
    root.querySelector('[data-ps-email-input]')?.focus();
  }

  // Capture clicks before obsolete inline handlers in older generated demos.
  document.addEventListener(
    'click',
    (event) => {
      const trigger = event.target.closest(
        '[data-prompt-trigger], [data-free-download-trigger], [onclick*="handlePromptStudioAction"]'
      );
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const inlineAction = trigger.getAttribute('onclick') || '';
      requestAction({
        type:
          trigger.matches('[data-prompt-trigger]') || inlineAction.includes("'prompt'")
            ? 'prompt'
            : 'download',
        trigger,
      });
    },
    true
  );

  root.addEventListener('click', (event) => {
    if (event.target.matches('[data-ps-close]') || event.target.matches('.ps-overlay')) {
      setOpen(event.target.closest('.ps-overlay') || event.target, false);
    }
  });

  root.querySelector('[data-ps-copy]').addEventListener('click', async () => {
    await navigator.clipboard.writeText(promptText.textContent || '');
    root.querySelector('[data-ps-copy]').textContent = 'Copiado';
  });

  root.querySelector('[data-ps-email-form]').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = root.querySelector('[data-ps-email-input]').value.trim();
    const terms = root.querySelector('[data-ps-terms]').checked;
    const submit = root.querySelector('[data-ps-submit]');
    const error = root.querySelector('[data-ps-error]');
    if (!email || !terms) return;
    submit.disabled = true;
    submit.textContent = 'Procesando…';
    error.textContent = '';
    try {
      const response = await fetch('/api/new-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('No fue posible registrar el correo.');
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem('prompt_studio_free_email', email);
      setOpen(emailModal, false);
      if (pendingAction) runAction(pendingAction);
      pendingAction = null;
    } catch (requestError) {
      error.textContent = requestError.message || 'Error de conexión.';
    } finally {
      submit.disabled = false;
      submit.textContent = 'Continuar';
    }
  });
})();

const fs = require('fs');
const path = require('path');

const webPagesData = JSON.parse(fs.readFileSync('./public/webpages/web-pages.json', 'utf8'));
const freePages = webPagesData.webPages.filter(p => p.membership && p.membership.toLowerCase() === 'free');

console.log(`Found ${freePages.length} free pages`);

for (const page of freePages) {
  const indexHtmlPath = path.join('./public/webpages', page.demoUrl, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.log(`File not found: ${indexHtmlPath}`);
    continue;
  }

  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Look for the old download button, which usually starts with <a and has data-free-download-trigger
  const btnRegex = /<a[^>]*data-free-download-trigger[^>]*>[\s\S]*?<\/a>/i;
  const match = html.match(btnRegex);

  if (match) {
    const oldBtn = match[0];
    const hrefMatch = oldBtn.match(/href="([^"]+)"/);
    const href = hrefMatch ? hrefMatch[1] : `/api/landing-pages/${page.id}/download`;

    // Generate the "Ver prompt" URL
    const title = typeof page.title === 'string' ? page.title : (page.title.es || page.title.en);
    let rawDesc = typeof page.description === 'string' ? page.description : (page.description.es || page.description.en);
    
    let descriptionText = '';
    if (typeof rawDesc === 'object' && rawDesc !== null) {
      const parts = [];
      for (const [key, value] of Object.entries(rawDesc)) {
        // Skip some internal keys if necessary, or just capitalize the key
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        if (Array.isArray(value)) {
          parts.push(`${formattedKey}:\n- ${value.join('\n- ')}`);
        } else {
          parts.push(`${formattedKey}: ${value}`);
        }
      }
      descriptionText = parts.join('\n\n');
    } else {
      descriptionText = String(rawDesc || '');
    }
    
    // Escape HTML to prevent breaking the template
    const description = descriptionText.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const promptData = {
      type: 'web',
      title,
      description,
      imageUrl: page.imageUrl,
      stack: page.stack || [],
      tags: page.tags || []
    };
    const promptUrl = `/prompt/edit?prompt=${encodeURIComponent(JSON.stringify(promptData))}`;

    const newButtonsHTML = `
<div style="position:fixed;right:20px;bottom:20px;z-index:99999;display:flex;align-items:center;gap:12px;background:#0d0d0d;padding:8px;border-radius:24px;border:1px solid #262626;box-shadow:0 16px 40px rgba(0,0,0,0.5)">
  <a
    href="#"
    onclick="handlePromptStudioAction(event, 'prompt', '${promptUrl}')"
    aria-label="Ver prompt"
    style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1px solid #3b82f6;border-radius:16px;background:rgba(59,130,246,0.1);color:#60a5fa;font:500 14px/1 system-ui,sans-serif;text-decoration:none;transition:all 0.2s;cursor:pointer;"
    onmouseover="this.style.background='rgba(59,130,246,0.2)'"
    onmouseout="this.style.background='rgba(59,130,246,0.1)'"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    Ver prompt
  </a>
  <a
    href="#"
    onclick="handlePromptStudioAction(event, 'download', '${href}')"
    data-free-download-trigger
    aria-label="Descargar ${title}"
    style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1px solid transparent;border-radius:16px;background:#1a1a1a;color:#d4d4d8;font:500 14px/1 system-ui,sans-serif;text-decoration:none;transition:all 0.2s;cursor:pointer;"
    onmouseover="this.style.background='#27272a';this.style.color='#fff'"
    onmouseout="this.style.background='#1a1a1a';this.style.color='#d4d4d8'"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    Descargar
  </a>
</div>

<div id="ps-email-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:100000;align-items:center;justify-content:center;backdrop-filter:blur(4px);font-family:system-ui,sans-serif;">
  <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;width:100%;max-width:400px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
      <h2 style="margin:0;color:#f8fafc;font-size:18px;font-weight:600;">Desbloquea el acceso</h2>
      <button onclick="document.getElementById('ps-email-modal').style.display='none'" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;padding:4px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <p style="margin:0 0 20px 0;color:#94a3b8;font-size:14px;line-height:1.5;">Ingresa tu correo para ver el prompt o descargar esta plantilla. Solo te lo pediremos una vez.</p>
    <form id="ps-email-form" onsubmit="handlePromptStudioSubmit(event)">
      <input type="email" id="ps-email-input" placeholder="tu@correo.com" required style="width:100%;background:#020617;border:1px solid #1e293b;border-radius:6px;padding:10px 12px;color:#f8fafc;font-size:14px;margin-bottom:16px;box-sizing:border-box;outline:none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#1e293b'">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
        <input type="checkbox" id="ps-terms-check" required style="cursor:pointer;accent-color:#2563eb;">
        <label for="ps-terms-check" style="color:#94a3b8;font-size:13px;cursor:pointer;">Acepto los <a href="/terms" target="_blank" style="color:#60a5fa;text-decoration:none;">Términos y Servicios</a></label>
      </div>
      <button type="submit" id="ps-submit-btn" style="width:100%;background:#2563eb;color:white;border:none;border-radius:6px;padding:10px;font-size:14px;font-weight:500;cursor:pointer;transition:background 0.2s;">
        Continuar
      </button>
    </form>
  </div>
</div>

<div id="ps-prompt-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:100000;align-items:center;justify-content:center;backdrop-filter:blur(4px);font-family:system-ui,sans-serif;padding:24px;">
  <div style="background:#0a0a0a;border:1px solid #262626;border-radius:12px;padding:24px;width:100%;max-width:800px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;">
      <h2 style="margin:0;color:#f8fafc;font-size:20px;font-weight:600;line-height:1.2;">${title}</h2>
      <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
        <button onclick="handlePromptStudioCopy(event)" id="ps-copy-btn" aria-label="Copiar prompt" style="background:transparent;border:1px solid #262626;border-radius:8px;color:#d4d4d8;cursor:pointer;padding:8px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='transparent'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
        <a href="${promptUrl}" target="_parent" style="display:inline-flex;align-items:center;gap:6px;background:#2563eb;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:14px;font-weight:500;text-decoration:none;transition:background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          Usar prompt
        </a>
        <button onclick="document.getElementById('ps-prompt-modal').style.display='none'" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;padding:4px;margin-left:4px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
    <div style="overflow-y:auto;padding-right:8px;">
      <pre id="ps-prompt-text" style="margin:0;color:#94a3b8;font-size:14px;line-height:1.6;white-space:pre-wrap;font-family:system-ui,sans-serif;user-select:all;">${description}</pre>
    </div>
  </div>
</div>

<script>
  window.psTargetActionType = '';
  window.psTargetActionUrl = '';
  
  function handlePromptStudioAction(e, type, url) {
    e.preventDefault();
    if (localStorage.getItem('prompt_studio_free_email_saved') === 'true') {
      executeAction(type, url);
    } else {
      window.psTargetActionType = type;
      window.psTargetActionUrl = url;
      document.getElementById('ps-email-modal').style.display = 'flex';
      const emailInput = document.getElementById('ps-email-input');
      const savedEmail = localStorage.getItem('prompt_studio_user_email');
      if (savedEmail) {
        emailInput.value = savedEmail;
      }
      emailInput.focus();
    }
  }
  
  function executeAction(type, url) {
    if (type === 'prompt') {
      document.getElementById('ps-prompt-modal').style.display = 'flex';
    } else if (type === 'download') {
      const link = document.createElement('a');
      link.href = url;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async function handlePromptStudioSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('ps-email-input').value;
    const btn = document.getElementById('ps-submit-btn');
    if (!email || !email.includes('@')) return;
    
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    btn.style.opacity = '0.7';
    
    try {
      await fetch('/api/new-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      localStorage.setItem('prompt_studio_free_email_saved', 'true');
      document.getElementById('ps-email-modal').style.display = 'none';
      executeAction(window.psTargetActionType, window.psTargetActionUrl);
    } catch (err) {
      console.error(err);
      alert('Hubo un error de conexión. Intenta nuevamente.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Continuar';
      btn.style.opacity = '1';
    }
  }

  function handlePromptStudioCopy(e) {
    const text = document.getElementById('ps-prompt-text').textContent;
    const btn = e.currentTarget;
    navigator.clipboard.writeText(text).then(() => {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      btn.style.borderColor = '#22c55e';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.borderColor = '#262626';
      }, 2000);
    });
  }
</script>

`.trim();

    html = html.replace(match[0], newButtonsHTML);
    fs.writeFileSync(indexHtmlPath, html, 'utf8');
    console.log(`Updated ${indexHtmlPath}`);
  } else {
    console.log(`Could not find button in ${indexHtmlPath}`);
  }
}

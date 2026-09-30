(function(){const c="prompt_studio_free_email_saved",l=new URLSearchParams(window.location.search).get("pageId");let i=null;const f=e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),u=document.createElement("style");u.textContent=`
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
  `,document.head.appendChild(u);const a=document.createElement("div");a.innerHTML=`
    <div class="ps-overlay" data-ps-email>
      <div class="ps-dialog" role="dialog" aria-modal="true" aria-labelledby="ps-email-title">
        <button class="ps-close" type="button" data-ps-close aria-label="Cerrar">&times;</button>
        <h2 id="ps-email-title">Desbloquea el acceso</h2>
        <p>Ingresa tu correo para ver el prompt o descargar esta plantilla. S\xF3lo te lo pediremos una vez.</p>
        <form class="ps-form" data-ps-email-form>
          <input class="ps-input" data-ps-email-input type="email" autocomplete="email" placeholder="help@prompstudio.com" required>
          <label class="ps-terms"><input type="checkbox" data-ps-terms required> <span>Acepto los <a href="/terms" target="_blank" rel="noopener noreferrer" style="color:#60a5fa">t\xE9rminos y servicios</a></span></label>
          <button class="ps-button ps-button-primary" type="submit" data-ps-submit>Continuar</button>
          <p class="ps-error" data-ps-error role="alert"></p>
        </form>
      </div>
    </div>
    <div class="ps-overlay" data-ps-prompt>
      <div class="ps-dialog" role="dialog" aria-modal="true" aria-labelledby="ps-prompt-title">
        <button class="ps-close" type="button" data-ps-close aria-label="Cerrar">&times;</button>
        <h2 id="ps-prompt-title">${f(document.title||"Prompt")}</h2>
        <pre class="ps-prompt" data-ps-prompt-text></pre>
        <div class="ps-actions">
          <button class="ps-button" type="button" data-ps-copy>Copiar</button>
          <a class="ps-button ps-button-primary" data-ps-use href="/generate-webs">Usar prompt</a>
        </div>
      </div>
    </div>
  `,document.body.appendChild(a);const m=a.querySelector("[data-ps-email]"),y=a.querySelector("[data-ps-prompt]"),g=a.querySelector("[data-ps-prompt-text]"),x=a.querySelector("[data-ps-use]"),p=(e,t)=>{e.dataset.open=String(t),document.documentElement.style.overflow=t?"hidden":""};function h(e){const t=(e.getAttribute("onclick")||"").match(/'prompt',\s*'([^']+)'/)?.[1];if(!t)return"/generate-webs";try{return`/generate-webs${new URL(t,window.location.origin).search}`}catch{return"/generate-webs"}}function w(e){const t=window.__PS_PROMPT_TEXT||"";g.textContent=t,x.href=h(e),p(y,!0)}async function v(e){const t=e.getAttribute("href"),r=t&&t!=="#"?t:l?`/api/landing-pages/${encodeURIComponent(l)}/download`:null;if(!r){window.alert("No se encontr\xF3 el identificador de esta descarga.");return}const o=await fetch(r,{cache:"no-store"});if(!o.ok)throw new Error(`Download failed: ${o.status}`);const s=URL.createObjectURL(await o.blob()),d=o.headers.get("content-disposition")?.match(/filename="([^"]+)"/i)?.[1]||`${l||"proyecto"}.zip`,n=document.createElement("a");n.href=s,n.download=d,document.body.appendChild(n),n.click(),n.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),1e3)}function b(e){if(e.type==="prompt"){w(e.trigger);return}v(e.trigger).catch(()=>{window.alert("No se pudo descargar el proyecto. Int\xE9ntalo de nuevo.")})}function S(e){if(localStorage.getItem(c)==="true"){b(e);return}i=e,p(m,!0),a.querySelector("[data-ps-email-input]")?.focus()}document.addEventListener("click",e=>{const t=e.target.closest('[data-prompt-trigger], [data-free-download-trigger], [onclick*="handlePromptStudioAction"]');if(!t)return;e.preventDefault(),e.stopImmediatePropagation();const r=t.getAttribute("onclick")||"";S({type:t.matches("[data-prompt-trigger]")||r.includes("'prompt'")?"prompt":"download",trigger:t})},!0),a.addEventListener("click",e=>{(e.target.matches("[data-ps-close]")||e.target.matches(".ps-overlay"))&&p(e.target.closest(".ps-overlay")||e.target,!1)}),a.querySelector("[data-ps-copy]").addEventListener("click",async()=>{await navigator.clipboard.writeText(g.textContent||""),a.querySelector("[data-ps-copy]").textContent="Copiado"}),a.querySelector("[data-ps-email-form]").addEventListener("submit",async e=>{e.preventDefault();const t=a.querySelector("[data-ps-email-input]").value.trim(),r=a.querySelector("[data-ps-terms]").checked,o=a.querySelector("[data-ps-submit]"),s=a.querySelector("[data-ps-error]");if(!(!t||!r)){o.disabled=!0,o.textContent="Procesando\u2026",s.textContent="";try{if(!(await fetch("/api/new-users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:t})})).ok)throw new Error("No fue posible registrar el correo.");localStorage.setItem(c,"true"),localStorage.setItem("prompt_studio_free_email",t),p(m,!1),i&&b(i),i=null}catch(d){s.textContent=d.message||"Error de conexi\xF3n."}finally{o.disabled=!1,o.textContent="Continuar"}}})})();

import *as o from "three"; import { OrbitControls as G } from "three/addons/controls/OrbitControls.js"; const d = [{
  title: "Integraci\xF3n API REST", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", desc: "Demo de integraci\xF3n con la API REST del producto. Endpoints, autenticaci\xF3n y respuestas.", snippet: `const api = new ProductAPI({ token: 'sk-xxx' });

// Listar recursos
const resources = await api.list({
  limit: 50,
  filter: { status: 'active' }
});

// Crear recurso
const created = await api.create({
  name: 'Mi proyecto',
  type: 'production'
});

console.log(created.id);`, sandbox: "https://codesandbox.io/s/example", cam: [-2.2, 1.6, 2.2], look: [0, .6, 0], pos: [-1.2, .6, .8]
}, {
  title: "Dashboard en tiempo real", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", desc: "Visualiza m\xE9tricas en vivo con el dashboard integrado. WebSockets y gr\xE1ficos interactivos.", snippet: `import { Dashboard } from '@tech/dashboard';

const dash = new Dashboard('#mount', {
  theme: 'dark',
  refresh: 5000
});

dash.addChart('requests', {
  type: 'line',
  data: stream,
  options: { smoothing: true }
});

dash.on('point:click', (p) => {
  console.log('Selected:', p);
});`, sandbox: "https://codesandbox.io/s/example", cam: [2.2, 1.6, 2.2], look: [0, .6, 0], pos: [1.2, .5, .9]
}, {
  title: "Autenticaci\xF3n y permisos", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", desc: "Flujo completo de autenticaci\xF3n: login, MFA, roles y permisos por recurso.", snippet: `const { Auth } = require('@tech/auth');

const session = await Auth.login({
  email: 'help@prompstudio.com',
  provider: 'oauth2'
});

// Verificar permiso
if (session.can('resources:write')) {
  await api.update(id, changes);
}

// MFA challenge
await Auth.verifyMFA(session, {
  code: userInput
});`, sandbox: "https://codesandbox.io/s/example", cam: [0, 2.4, 3], look: [0, .6, 0], pos: [0, .65, 1]
}], H = document.getElementById("hs-copy"), j = document.querySelectorAll(".hs-btn"), E = document.getElementById("fallback-toggle"), p = document.getElementById("fallback"), m = document.getElementById("dialog"), z = document.getElementById("close-dialog"), y = document.getElementById("dialog-title"), l = document.getElementById("dialog-video"), S = document.getElementById("snippet-code"), C = document.getElementById("snippet-pre"), b = document.getElementById("copy-snippet"), $ = document.getElementById("sandbox-link"), B = document.getElementById("scene-root"), s = new o.Scene; s.background = new o.Color(658448), s.fog = new o.Fog(658448, 4, 14); const r = new o.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 100); r.position.set(0, 1.8, 4.5); const a = new o.WebGLRenderer({ antialias: !0 }); a.setSize(window.innerWidth, window.innerHeight), a.setPixelRatio(Math.min(window.devicePixelRatio, 2)), a.toneMapping = o.ACESFilmicToneMapping, a.shadowMap.enabled = !0, a.shadowMap.type = o.PCFSoftShadowMap, B.appendChild(a.domElement); const c = new G(r, a.domElement); c.enableDamping = !0, c.maxDistance = 8, c.minDistance = 2, c.target.set(0, .6, 0), c.enabled = !1, s.add(new o.AmbientLight(16777215, .3)); const h = new o.DirectionalLight(15788256, 1.2); h.position.set(3, 6, 4), h.castShadow = !0, h.shadow.mapSize.set(1024, 1024), s.add(h); const I = new o.DirectionalLight(4890367, .3); I.position.set(-3, 2, -3), s.add(I); const L = new o.DirectionalLight(16777215, .2); L.position.set(0, -1, -3), s.add(L); const O = new o.MeshStandardMaterial({ color: 1712688, roughness: .5, metalness: .3 }), u = new o.Mesh(new o.CylinderGeometry(.7, .8, .15, 32), O); u.position.set(0, .05, 0), u.receiveShadow = !0, u.castShadow = !0, s.add(u); const q = new o.MeshStandardMaterial({ color: 4890367, roughness: .2, metalness: .7, emissive: 1723018, emissiveIntensity: .1 }), g = new o.Mesh(new o.BoxGeometry(.5, .35, .35), q); g.position.set(0, .3, 0), g.castShadow = !0, s.add(g); const W = new o.MeshStandardMaterial({ color: 2767450, roughness: .4, metalness: .5 }); for (let e = 0; e < 4; e += 1) { const t = new o.Mesh(new o.SphereGeometry(.03, 8, 8), W); t.position.set(-.2 + e * .13, .3, .18), s.add(t) } const w = new o.Mesh(new o.RingGeometry(.45, .55, 48), new o.MeshBasicMaterial({ color: 4890367, transparent: !0, opacity: .08, side: o.DoubleSide })); w.position.set(0, .01, 0), w.rotation.x = -Math.PI / 2, s.add(w); const x = []; d.forEach((e, t) => { const n = new o.Mesh(new o.SphereGeometry(.12, 16, 16), new o.MeshStandardMaterial({ color: 4890367, emissive: 4890367, emissiveIntensity: .3, transparent: !0, opacity: .8 })); n.position.set(e.pos[0], e.pos[1], e.pos[2]), n.userData = { hsIndex: t }, s.add(n), x.push(n); const i = new o.Mesh(new o.RingGeometry(.15, .2, 24), new o.MeshBasicMaterial({ color: 4890367, transparent: !0, opacity: .15, side: o.DoubleSide })); i.position.copy(n.position), i.lookAt(0, .6, 0), s.add(i) }); const A = new o.BufferGeometry, P = 120, f = new Float32Array(P * 3); for (let e = 0; e < P; e += 1)f[e * 3] = (Math.random() - .5) * 8, f[e * 3 + 1] = (Math.random() - .5) * 3 + .6, f[e * 3 + 2] = (Math.random() - .5) * 6; A.setAttribute("position", new o.BufferAttribute(f, 3)); const M = new o.Points(A, new o.PointsMaterial({ color: 6992127, size: .02, transparent: !0, opacity: .3 })); s.add(M); const D = new o.Raycaster, v = new o.Vector2; function k(e) { const t = d[e]; y.textContent = t.title, l.src = t.video, l.load(), S.textContent = t.snippet, C.querySelector("code").textContent = t.snippet, window.Prism && (C.innerHTML = `<code class="language-javascript">${Prism.highlight(t.snippet, Prism.languages.javascript, "javascript")}</code>`), $.href = t.sandbox, H.textContent = `\u{1F3AF} ${t.title} \u2014 ${t.desc}`, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? (r.position.set(...t.cam), c.target.set(...t.look)) : (gsap.to(r.position, { x: t.cam[0], y: t.cam[1], z: t.cam[2], duration: 1.3, ease: "power2.inOut" }), gsap.to(c.target, { x: t.look[0], y: t.look[1], z: t.look[2], duration: 1.3, ease: "power2.inOut" })), m.classList.remove("hidden") } a.domElement.addEventListener("click", e => { const t = a.domElement.getBoundingClientRect(); v.x = (e.clientX - t.left) / t.width * 2 - 1, v.y = -((e.clientY - t.top) / t.height) * 2 + 1, D.setFromCamera(v, r); const n = D.intersectObjects(x); n.length && k(n[0].object.userData.hsIndex) }), j.forEach(e => { e.addEventListener("click", () => k(Number(e.dataset.hs))) }), z.addEventListener("click", () => { m.classList.add("hidden"), l.pause(), l.src = "" }), m.addEventListener("click", e => { e.target === m && (m.classList.add("hidden"), l.pause(), l.src = "") }), b.addEventListener("click", async () => { const e = d.find((t, n) => document.querySelector(`[data-hs="${n}"]`) && y.textContent === d[n].title) ? d.find(t => t.title === y.textContent)?.snippet : S.textContent; if (e) try { await navigator.clipboard.writeText(e), b.textContent = "\u2705 Copiado", setTimeout(() => { b.textContent = "\u{1F4CB} Copiar snippet" }, 2e3) } catch { } }), window.addEventListener("keydown", e => { e.key >= "1" && e.key <= "3" && k(Number(e.key) - 1) }); function V() {
  p.innerHTML = "<h2>Tech demos \u2014 Versi\xF3n 2D</h2>"; const e = document.createElement("div"); e.className = "fallback-grid", d.forEach(t => {
    const n = document.createElement("article"); n.className = "fallback-card", n.innerHTML = `
      <h3>${t.title}</h3>
      <video controls preload="metadata" src="${t.video}" crossorigin="anonymous">
        <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
      </video>
      <p>${t.desc}</p>
      <pre><code class="language-javascript">${t.snippet}</code></pre>
    `, e.appendChild(n)
  }), p.appendChild(e), window.Prism && requestAnimationFrame(() => Prism.highlightAllUnder(p))
} E.addEventListener("click", () => { const e = p.classList.contains("hidden"); p.classList.toggle("hidden"), E.textContent = e ? "Ocultar fallback" : "Fallback 2D" }), V(); const N = new IntersectionObserver(e => { e.forEach(t => { a.setAnimationLoop(t.isIntersecting ? F : null) }) }, { threshold: .05 }); N.observe(B); function F() { const e = performance.now() * .001; x.forEach((n, i) => { const R = d[i]; n.position.y = R.pos[1] + Math.sin(e * 1.5 + i) * .04; const T = 1 + Math.sin(e * 2 + i) * .1; n.scale.setScalar(T), n.material.emissiveIntensity = .2 + Math.sin(e * 2.5 + i) * .15 }), g.rotation.y = Math.sin(e * .3) * .15, w.scale.setScalar(1 + Math.sin(e * .8) * .05); const t = M.geometry.attributes.position.array; for (let n = 0; n < t.length; n += 3)t[n + 1] += Math.sin(e + n * .01) * 4e-4; M.geometry.attributes.position.needsUpdate = !0, c.update(), a.render(s, r) } window.addEventListener("resize", () => { r.aspect = window.innerWidth / window.innerHeight, r.updateProjectionMatrix(), a.setSize(window.innerWidth, window.innerHeight) }), F();

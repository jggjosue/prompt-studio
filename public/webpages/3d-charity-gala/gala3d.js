/*
 * gala3d.js — Gala benéfica 3D
 *
 * Privacidad y manejo de datos:
 * - Los datos de donación (nombre, monto) no deben almacenarse localmente
 *   sin consentimiento explícito. Esta demo simula pujas en memoria volátil.
 * - Para producción, usar pasarela de pago PCI-DSS compliant.
 * - No compartir datos de donantes sin autorización.
 *
 * Recomendaciones legales para subastas:
 * - Las subastas en línea deben cumplir con la legislación local (ej. Ley 34/2002 en España).
 * - Publicar términos y condiciones, política de privacidad y aviso legal.
 * - Los lotes deben tener descripción clara, estado y precio de salida.
 * - Implementar confirmación de puja y notificación al ganador.
 */

(function () {
  'use strict';

  const TESTIMONIALS = [
    { id: 'test-1', name: 'Ana María', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', transcript: 'Gracias a su donación pudimos becar a 50 niños.' },
    { id: 'test-2', name: 'Carlos Ruiz', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', transcript: 'El centro comunitario cambió mi vida.' }
  ];

  const LOTS = [
    { id: 'lot-1', name: 'Cena con el chef José Andrés', startBid: 500, image: '🍽️', desc: 'Cena privada para 4 personas con menú degustación.' },
    { id: 'lot-2', name: 'Obra de arte original', startBid: 2000, image: '🎨', desc: 'Pintura al óleo de artista reconocido.' },
    { id: 'lot-3', name: 'Fin de semana en la playa', startBid: 1500, image: '🏖️', desc: 'Cabaña con vista al mar, 3 noches.' }
  ];

  let scene, camera, renderer;
  let mainScreen, sideLeft, sideRight;
  let mainVideo, leftVideo, rightVideo;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let currentAngle = 0;
  let clips = [];
  let bids = {};
  let lotIdx = 0;

  LOTS.forEach(l => { bids[l.id] = [{ bidder: 'Invitado', amount: l.startBid }]; });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metrics = { donations: 0, bids: 0, testimonialPlays: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    auctionBtn: document.getElementById('auction-btn'),
    auctionPanel: document.getElementById('auction-panel'),
    auctionClose: document.getElementById('auction-close'),
    auctionBody: document.getElementById('auction-body'),
    donorBtn: document.getElementById('donor-btn'),
    donorPanel: document.getElementById('donor-panel'),
    donorClose: document.getElementById('donor-close'),
    donorBody: document.getElementById('donor-body'),
    clipsBtn: document.getElementById('clips-btn'),
    clipsPanel: document.getElementById('clips-panel'),
    clipsClose: document.getElementById('clips-close'),
    clipsBody: document.getElementById('clips-body'),
    metricsBtn: document.getElementById('metrics-btn'),
    metricsPanel: document.getElementById('metrics-panel'),
    metricsClose: document.getElementById('metrics-close'),
    metricsBody: document.getElementById('metrics-body'),
    bidToast: document.getElementById('bid-toast'),
    donorToast: document.getElementById('donor-toast')
  };

  /* ---------- IndexedDB ---------- */
  function saveMetrics() {
    try {
      const req = indexedDB.open('Gala3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'metrics', v: metrics }); };
    } catch (e) { /* silent */ }
  }
  function loadMetrics() {
    try {
      const req = indexedDB.open('Gala3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('metrics'); get.onsuccess = () => { if (get.result) metrics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0e14);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 20);
    camera.position.set(0, 0.4, 2.0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x442244, 0.2);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffeedd, 0.3);
    key.position.set(0, 2, 2);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xcc88aa, 0.1);
    fill.position.set(-1, 1, 1);
    scene.add(fill);
    const spot = new THREE.SpotLight(0xcc4477, 0.2, 4, Math.PI / 6, 0.5);
    spot.position.set(0, 1.5, 0.3);
    spot.target.position.set(0, 0, 0);
    scene.add(spot);
    scene.add(spot.target);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a1820, roughness: 0.5 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.5), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    buildStage();
  }

  function buildStage() {
    /* Stage */
    const sMat = new THREE.MeshStandardMaterial({ color: 0x3a2430, roughness: 0.3, metalness: 0.1 });
    const stage = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.25), sMat);
    stage.rotation.x = -Math.PI / 2;
    stage.position.y = -0.005;
    stage.position.z = -0.2;
    scene.add(stage);

    /* Main screen */
    mainVideo = document.createElement('video');
    mainVideo.crossOrigin = 'anonymous';
    mainVideo.src = TESTIMONIALS[0].videoUrl;
    mainVideo.loop = true;
    mainVideo.muted = true;
    mainVideo.preload = 'auto';
    mainVideo.load();
    mainVideo.play().catch(() => {});
    const mainTex = new THREE.VideoTexture(mainVideo);
    mainTex.minFilter = THREE.LinearFilter;
    const mainMat = new THREE.MeshBasicMaterial({ map: mainTex });
    mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.22), mainMat);
    mainScreen.position.set(0, 0.11, 0);
    scene.add(mainScreen);

    /* Frame glow */
    const frameMat = new THREE.MeshBasicMaterial({ color: 0xcc3a6a, transparent: true, opacity: 0.15 });
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.25), frameMat);
    frame.position.set(0, 0.11, -0.005);
    scene.add(frame);

    /* Side screens for testimonials */
    [TESTIMONIALS[0], TESTIMONIALS[1]].forEach((t, i) => {
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = t.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const vTex = new THREE.VideoTexture(vid);
      vTex.minFilter = THREE.LinearFilter;
      const vMat = new THREE.MeshBasicMaterial({ map: vTex, transparent: true, opacity: 0.5 });
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.07), vMat);
      scr.position.set(i === 0 ? -0.35 : 0.35, 0.08, 0.02);
      scene.add(scr);
    });

    /* Side labels */
    TESTIMONIALS.forEach((t, i) => {
      const c = document.createElement('canvas'); c.width = 96; c.height = 14;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, 96, 14);
      ctx.fillStyle = '#e8d8e0'; ctx.font = '5px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(t.name, 48, 10);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lM = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.014), lMat);
      lM.position.set(i === 0 ? -0.35 : 0.35, 0.005, 0.03);
      scene.add(lM);
    });
  }

  /* ---------- Camera alternation ---------- */
  function cycleCamera() {
    const angles = [
      { pos: [0, 0.35, 1.8], target: [0, 0, 0] },
      { pos: [-0.2, 0.3, 2.2], target: [0, 0, 0] },
      { pos: [0, 0.15, 2.5], target: [0, 0, 0] }
    ];
    currentAngle = (currentAngle + 1) % angles.length;
    const a = angles[currentAngle];
    if (prefersReducedMotion) { camera.position.set(a.pos[0], a.pos[1], a.pos[2]); camera.lookAt(a.target[0], a.target[1], a.target[2]); }
    else {
      gsap.to(camera.position, { x: a.pos[0], y: a.pos[1], z: a.pos[2], duration: 1.0, ease: 'power2.out',
        onUpdate: () => camera.lookAt(a.target[0], a.target[1], a.target[2]) });
    }
  }

  /* Alternar cámara cada cierto tiempo */
  setInterval(cycleCamera, 8000);

  /* ---------- Auction ---------- */
  function renderAuction() {
    const lot = LOTS[lotIdx];
    const lotBids = bids[lot.id] || [{ bidder: 'Invitado', amount: lot.startBid }];
    const currentBid = lotBids[lotBids.length - 1];

    dom.auctionBody.innerHTML =
      `<div class="lot-card active">
        <div class="name">${lot.image} ${lot.name}</div>
        <div style="font-size:.4rem;color:var(--muted)">${lot.desc}</div>
        <div class="bid-info">💰 $${currentBid.amount} · ${lotBids.length} puja(s)</div>
      </div>
      <div class="bid-form">
        <input type="number" id="bid-input" placeholder="$${currentBid.amount + 100}+" min="${currentBid.amount + 1}">
        <button id="bid-submit" class="btn btn-primary" style="padding:.2rem .4rem;font-size:.45rem">Pujar</button>
      </div>
      <div class="bid-timeline" id="bid-timeline">
        ${lotBids.slice(-5).reverse().map(b => `<div class="bid-entry"><span>${b.bidder}</span><span>$${b.amount}</span></div>`).join('')}
      </div>
      <div style="margin-top:.1rem;display:flex;gap:.1rem">
        <button id="lot-prev" class="btn btn-sm btn-outline">◀ Anterior</button>
        <button id="lot-next" class="btn btn-sm btn-outline">Siguiente ▶</button>
      </div>`;

    dom.auctionBody.querySelector('#bid-submit').addEventListener('click', () => {
      const input = dom.auctionBody.querySelector('#bid-input');
      const val = parseFloat(input.value);
      if (!val || val <= currentBid.amount) return;
      bids[lot.id].push({ bidder: 'Tú', amount: val });
      metrics.bids++;
      saveMetrics();
      dom.bidToast.classList.remove('hidden');
      setTimeout(() => dom.bidToast.classList.add('hidden'), 2500);
      renderAuction();
    });

    dom.auctionBody.querySelector('#lot-prev')?.addEventListener('click', () => {
      lotIdx = (lotIdx - 1 + LOTS.length) % LOTS.length;
      renderAuction();
    });
    dom.auctionBody.querySelector('#lot-next')?.addEventListener('click', () => {
      lotIdx = (lotIdx + 1) % LOTS.length;
      renderAuction();
    });
  }

  dom.auctionBtn.addEventListener('click', () => {
    dom.auctionPanel.classList.toggle('hidden');
    if (!dom.auctionPanel.classList.contains('hidden')) renderAuction();
  });
  dom.auctionClose.addEventListener('click', () => dom.auctionPanel.classList.add('hidden'));

  /* ---------- Donor mode ---------- */
  function renderDonor() {
    dom.donorBody.innerHTML =
      `<strong style="font-size:.5rem;color:var(--accent2)">🎁 Beneficios</strong>` +
      `<div class="benefit"><span class="icon">📬</span> Newsletter exclusivo</div>` +
      `<div class="benefit"><span class="icon">🎟️</span> Acceso anticipado a eventos</div>` +
      `<div class="benefit"><span class="icon">📋</span> Informe anual de impacto</div>` +
      `<div class="benefit"><span class="icon">🏆</span> Reconocimiento en web</div>` +
      `<button id="receipt-download">📥 Descargar recibo</button>`;
    dom.donorBody.querySelector('#receipt-download').addEventListener('click', () => {
      metrics.donations++;
      saveMetrics();
      const blob = new Blob(['Recibo de donación - Gala Benéfica\n\nGracias por tu generosidad.'], { type: 'text/plain' });
      const a = document.createElement('a');
      a.download = 'recibo-donacion.txt';
      a.href = URL.createObjectURL(blob);
      a.click();
      dom.donorToast.classList.remove('hidden');
      setTimeout(() => dom.donorToast.classList.add('hidden'), 2500);
    });
  }

  dom.donorBtn.addEventListener('click', () => {
    dom.donorPanel.classList.toggle('hidden');
    if (!dom.donorPanel.classList.contains('hidden')) renderDonor();
  });
  dom.donorClose.addEventListener('click', () => dom.donorPanel.classList.add('hidden'));

  /* ---------- Clips ---------- */
  function addClip(label) {
    clips.push({ label, time: new Date().toLocaleTimeString() });
    renderClips();
  }

  function renderClips() {
    dom.clipsBody.innerHTML = clips.map((c, i) =>
      `<div class="clip-card">📌 ${c.label} <span style="color:var(--muted)">${c.time}</span></div>`
    ).join('');
  }

  dom.clipsBtn.addEventListener('click', () => {
    dom.clipsPanel.classList.toggle('hidden');
    renderClips();
  });
  dom.clipsClose.addEventListener('click', () => dom.clipsPanel.classList.add('hidden'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' && !e.ctrlKey && !e.metaKey) {
      addClip(`Momento ${clips.length + 1}`);
    }
  });

  /* ---------- Metrics ---------- */
  dom.metricsBtn.addEventListener('click', () => {
    dom.metricsPanel.classList.toggle('hidden');
    dom.metricsBody.innerHTML =
      `<div class="row"><span>🎁 Donaciones</span><span>${metrics.donations}</span></div>` +
      `<div class="row"><span>🔨 Pujas</span><span>${metrics.bids}</span></div>` +
      `<div class="row"><span>▶ Testimonios</span><span>${metrics.testimonialPlays}</span></div>`;
  });
  dom.metricsClose.addEventListener('click', () => dom.metricsPanel.classList.add('hidden'));

  /* ---------- Lifecycle ---------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    else if (!document.hidden && !animFrameId) animFrameId = requestAnimationFrame(animate);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId) animFrameId = requestAnimationFrame(animate);
      else if (!entry.isIntersecting && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    });
  }, { threshold: 0.05 });

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = dom.sceneRoot.clientWidth / dom.sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.sceneRoot.clientWidth, dom.sceneRoot.clientHeight);
  });

  function animate() {
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadMetrics();
    renderClips();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

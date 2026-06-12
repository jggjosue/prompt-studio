/*
 * foodfair3d.js — Feria gastronómica 3D
 *
 * Compresión de video:
 * - H.265 a 2 Mbps para 720p, proxy 480p a 0.8 Mbps para scrubbing.
 * - Thumbnails WebP 512px calidad 80.
 * - FFmpeg: ffmpeg -i input.mp4 -vf scale=1280:-2 -c:v libx265 -crf 28 -tag:v hvc1 output.mp4
 *
 * Formatos de menú:
 * - JSON estructurado (como este demo) o PDF servido desde CDN.
 * - Recomendado: HTML semántico con schema.org/Restaurant para SEO.
 */

(function () {
  'use strict';

  const STANDS = [
    { id: 'stand-1', name: 'Taquería El Árbol', cuisine: 'mexican', pos: [-0.5, 0, -0.3], menu: ['Tacos al pastor', 'Guacamole', 'Churros'], videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', recipe: 'Tacos al pastor: marinado de cerdo, piña, cilantro y cebolla.', steps: ['Marinar carne', 'Asar en trompo', 'Servir con piña y cilantro'], desc: 'Auténtica cocina mexicana de la calle.' },
    { id: 'stand-2', name: 'Pasta Divina', cuisine: 'italian', pos: [0.5, 0, -0.3], menu: ['Spaghetti carbonara', 'Lasagna', 'Tiramisú'], videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', recipe: 'Carbonara: huevo, parmesano, panceta y pimienta.', steps: ['Cocer pasta al dente', 'Batir huevo con queso', 'Mezclar con panceta caliente'], desc: 'Recetas tradicionales italianas.' },
    { id: 'stand-3', name: 'Sakura Ramen', cuisine: 'japanese', pos: [-0.5, 0, 0.3], menu: ['Ramen tonkotsu', 'Gyoza', 'Matcha ice cream'], videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', recipe: 'Caldo tonkotsu: hueso de cerdo, ajo, jengibre.', steps: ['Hervir huesos 8h', 'Preparar toppings', 'Montar el bowl'], desc: 'Ramen artesanal con caldo 8h.' },
    { id: 'stand-4', name: 'Ceviche Central', cuisine: 'peruvian', pos: [0.5, 0, 0.3], menu: ['Ceviche clásico', 'Lomo saltado', 'Pisco sour'], videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', recipe: 'Ceviche: pescado fresco, limón, cebolla, ají.', steps: ['Cortar pescado en cubos', 'Marinar en limón', 'Añadir cebolla y ají'], desc: 'Sabores peruanos frente al mar.' },
    { id: 'stand-5', name: 'Sushi Bar Zen', cuisine: 'japanese', pos: [0, 0, -0.6], menu: ['Sushi variado', 'Tempura', 'Miso soup'], videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', recipe: 'Sushi nigiri: arroz vinagrado, pescado fresco.', steps: ['Preparar arroz sushi', 'Cortar pescado', 'Montar nigiri'], desc: 'Sushi tradicional con ingredientes premium.' }
  ];

  let scene, camera, renderer;
  let standMeshes = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let currentCuisine = 'all';
  let activeStandIdx = -1;
  let reviews = [{ author: 'Ana G.', text: '¡Los tacos más auténticos!', time: '2min' }];
  let routeActive = false;
  let routeStop = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metrics = { reservations: 0, plays: {}, filters: {} };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    filterBtns: document.querySelectorAll('#filter-cuisine .btn-filter'),
    mapBtn: document.getElementById('map-btn'),
    mapPanel: document.getElementById('map-panel'),
    mapClose: document.getElementById('map-close'),
    mapBody: document.getElementById('map-body'),
    standOverlay: document.getElementById('stand-overlay'),
    standVideo: document.getElementById('stand-video'),
    standInfo: document.getElementById('stand-info'),
    standSteps: document.getElementById('stand-steps'),
    downloadSteps: document.getElementById('download-steps'),
    standReserve: document.getElementById('stand-reserve'),
    standCloseOverlay: document.getElementById('stand-close-overlay'),
    routeBtn: document.getElementById('route-btn'),
    routePanel: document.getElementById('route-panel'),
    routeClose: document.getElementById('route-close'),
    routeBody: document.getElementById('route-body'),
    socialBtn: document.getElementById('social-btn'),
    socialPanel: document.getElementById('social-panel'),
    socialClose: document.getElementById('social-close'),
    reviewsList: document.getElementById('reviews-list'),
    recordReviewBtn: document.getElementById('record-review-btn'),
    metricsBtn: document.getElementById('metrics-btn'),
    metricsPanel: document.getElementById('metrics-panel'),
    metricsClose: document.getElementById('metrics-close'),
    metricsBody: document.getElementById('metrics-body'),
    reserveToast: document.getElementById('reserve-toast')
  };

  /* ---------- IndexedDB ---------- */
  function saveMetrics() {
    try {
      const req = indexedDB.open('FoodFair3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'metrics', v: metrics }); };
    } catch (e) { /* silent */ }
  }
  function loadMetrics() {
    try {
      const req = indexedDB.open('FoodFair3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('metrics'); get.onsuccess = () => { if (get.result) metrics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f0e8);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 15);
    camera.position.set(0, 0.6, 2.2);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(3, 4, 2);
    dir.castShadow = true;
    scene.add(dir);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.7 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.5), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    buildStandMeshes();
    buildMapUI();
  }

  function buildStandMeshes() {
    standMeshes.forEach(m => scene.remove(m));
    standMeshes = [];

    const cuisineColors = { mexican: 0xcc5a3a, italian: 0x3a8a5a, japanese: 0xcc3a5a, peruvian: 0x3a7acc };

    STANDS.forEach((s, idx) => {
      const g = new THREE.Group();
      g.position.set(s.pos[0], 0, s.pos[2]);
      const color = cuisineColors[s.cuisine] || 0x7a7a7a;

      /* Base */
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.5 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.18), baseMat);
      base.position.y = 0.01;
      base.castShadow = true;
      g.add(base);

      /* Branding bar */
      const barMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.02), barMat);
      bar.position.set(0, 0.04, 0.09);
      g.add(bar);

      /* Screen (recipe video) */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = s.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const vidTex = new THREE.VideoTexture(vid);
      vidTex.minFilter = THREE.LinearFilter;
      const sMat = new THREE.MeshBasicMaterial({ map: vidTex, transparent: true, opacity: 0.8 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.06), sMat);
      screen.position.set(0, 0.08, 0.055);
      g.add(screen);

      /* Label */
      const c = document.createElement('canvas');
      c.width = 128; c.height = 16;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, 128, 16);
      ctx.fillStyle = '#fff';
      ctx.font = '6px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = s.name.length > 14 ? s.name.slice(0, 13) + '…' : s.name;
      ctx.fillText(label, 64, 11);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.018), lMat);
      lMesh.position.set(0, -0.02, 0.095);
      g.add(lMesh);

      g.userData = { idx, origY: 0 };
      scene.add(g);
      standMeshes.push(g);
    });
  }

  /* ---------- Map ---------- */
  function buildMapUI() {
    dom.mapBody.innerHTML = '';
    STANDS.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'map-hotspot';
      btn.textContent = `${s.name} (${s.cuisine})`;
      btn.addEventListener('click', () => flyToStand(i));
      dom.mapBody.appendChild(btn);
    });
  }

  dom.mapBtn.addEventListener('click', () => dom.mapPanel.classList.toggle('hidden'));
  dom.mapClose.addEventListener('click', () => dom.mapPanel.classList.add('hidden'));

  /* ---------- Filters ---------- */
  dom.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCuisine = btn.dataset.cuisine;
      applyFilter();
    });
  });

  function applyFilter() {
    standMeshes.forEach((g, i) => {
      const s = STANDS[i];
      if (!s) return;
      const visible = currentCuisine === 'all' || s.cuisine === currentCuisine;
      g.visible = visible;
    });
    const visibleOnes = standMeshes.filter(g => g.visible);
    if (!prefersReducedMotion) {
      gsap.to(standMeshes.map(g => g.position), {
        y: (i) => standMeshes[i].visible ? 0 : -0.12,
        duration: 0.35,
        stagger: { each: 0.02, from: 'start' },
        ease: 'power2.out'
      });
    } else {
      standMeshes.forEach((g, i) => { g.position.y = g.visible ? 0 : -0.12; });
    }
    metrics.filters[currentCuisine] = (metrics.filters[currentCuisine] || 0) + 1;
    saveMetrics();
  }

  /* ---------- Click ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const all = [];
    standMeshes.forEach(g => { g.children.forEach(c => { if (c.isMesh) all.push(c); }); });
    const hits = raycaster.intersectObjects(all);
    if (hits.length) {
      for (let i = 0; i < standMeshes.length; i++) {
        for (let c = 0; c < standMeshes[i].children.length; c++) {
          if (hits[0].object === standMeshes[i].children[c]) {
            openStand(standMeshes[i].userData.idx);
            return;
          }
        }
      }
    }
  });

  /* ---------- Stand overlay ---------- */
  function openStand(idx) {
    activeStandIdx = idx;
    const s = STANDS[idx];
    dom.standVideo.src = s.videoUrl;
    dom.standVideo.load();
    dom.standVideo.play().catch(() => {});
    dom.standInfo.innerHTML =
      `<div class="name">${s.name}</div><div class="cuisine">${s.cuisine}</div>` +
      `<div class="desc">${s.desc}</div><div class="menu" style="margin-top:.05rem">📋 ${s.menu.join(' · ')}</div>`;
    dom.standSteps.textContent = s.steps.map((st, i) => `${i + 1}. ${st}`).join(' | ');
    dom.standOverlay.classList.remove('hidden');

    metrics.plays[idx] = (metrics.plays[idx] || 0) + 1;
    saveMetrics();

    flyToStand(idx);
  }

  dom.standCloseOverlay.addEventListener('click', () => closeStand());
  dom.standReserve.addEventListener('click', () => {
    metrics.reservations++;
    saveMetrics();
    dom.reserveToast.classList.remove('hidden');
    setTimeout(() => dom.reserveToast.classList.add('hidden'), 2500);
  });
  dom.downloadSteps.addEventListener('click', () => {
    if (activeStandIdx < 0) return;
    const s = STANDS[activeStandIdx];
    const blob = new Blob([s.steps.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = `${s.id}-pasos.txt`;
    a.href = URL.createObjectURL(blob);
    a.click();
  });

  function closeStand() {
    dom.standOverlay.classList.add('hidden');
    dom.standVideo.pause();
    dom.standVideo.src = '';
  }

  function flyToStand(idx) {
    if (idx < 0) return;
    const s = STANDS[idx];
    const target = new THREE.Vector3(s.pos[0], 0.3, s.pos[2] + 0.2);
    const lookAt = new THREE.Vector3(s.pos[0], 0, s.pos[2]);
    if (prefersReducedMotion) {
      camera.position.copy(target); camera.lookAt(lookAt);
    } else {
      gsap.to(camera.position, { x: target.x, y: target.y, z: target.z, duration: 0.7, ease: 'power2.out',
        onUpdate: () => camera.lookAt(lookAt), onComplete: () => camera.lookAt(lookAt) });
    }
  }

  /* ---------- Tasting route ---------- */
  dom.routeBtn.addEventListener('click', () => {
    routeActive = !routeActive;
    dom.routeBtn.textContent = routeActive ? '⏹ Detener ruta' : '🍽 Ruta';
    if (routeActive) {
      routeStop = 0;
      routeStep();
    }
    dom.routePanel.classList.toggle('hidden');
    buildRouteUI();
  });
  dom.routeClose.addEventListener('click', () => { dom.routePanel.classList.add('hidden'); routeActive = false; dom.routeBtn.textContent = '🍽 Ruta'; });

  function buildRouteUI() {
    dom.routeBody.innerHTML = STANDS.map((s, i) =>
      `<div class="route-stop${i === routeStop && routeActive ? ' active' : ''}" data-idx="${i}">${i + 1}. ${s.name}</div>`
    ).join('');
    dom.routeBody.querySelectorAll('.route-stop').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        flyToStand(idx);
        openStand(idx);
        routeStop = idx;
        buildRouteUI();
      });
    });
  }

  function routeStep() {
    if (!routeActive || routeStop >= STANDS.length) {
      routeActive = false; dom.routeBtn.textContent = '🍽 Ruta'; return;
    }
    flyToStand(routeStop);
    openStand(routeStop);
    routeStop++;
    buildRouteUI();
    if (routeActive && routeStop < STANDS.length) setTimeout(routeStep, 5000);
    else { routeActive = false; dom.routeBtn.textContent = '🍽 Ruta'; }
  }

  /* ---------- Social / reviews ---------- */
  function renderReviews() {
    dom.reviewsList.innerHTML = reviews.map(r =>
      `<div class="review-item"><span class="author">${r.author}</span> (${r.time}): ${r.text}</div>`
    ).join('');
  }

  dom.socialBtn.addEventListener('click', () => {
    dom.socialPanel.classList.toggle('hidden');
    renderReviews();
  });
  dom.socialClose.addEventListener('click', () => dom.socialPanel.classList.add('hidden'));

  dom.recordReviewBtn.addEventListener('click', () => {
    /* Simular grabación local */
    const authors = ['Carlos M.', 'Lucía R.', 'Pedro S.', 'María L.'];
    const texts = ['¡Excelente!', 'Muy recomendable', 'Buena atención', 'Comida deliciosa'];
    reviews.push({
      author: authors[Math.floor(Math.random() * authors.length)],
      text: texts[Math.floor(Math.random() * texts.length)],
      time: 'ahora'
    });
    renderReviews();
  });

  /* ---------- Metrics ---------- */
  dom.metricsBtn.addEventListener('click', () => {
    dom.metricsPanel.classList.toggle('hidden');
    const totalPlays = Object.values(metrics.plays).reduce((a, b) => a + b, 0);
    dom.metricsBody.innerHTML =
      `<div class="row"><span>📅 Reservas</span><span>${metrics.reservations}</span></div>` +
      `<div class="row"><span>▶ Plays</span><span>${totalPlays}</span></div>` +
      `<div class="row"><span>🔍 Filtros</span><span>${Object.values(metrics.filters).reduce((a, b) => a + b, 0)}</span></div>`;
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
    renderReviews();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

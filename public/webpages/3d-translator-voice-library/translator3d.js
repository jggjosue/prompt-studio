(function () {
  'use strict';

  const EXAMPLES = [
    {
      title: 'Inglés → Español',
      original: { lang: 'Inglés', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', text: 'The future belongs to those who believe in the beauty of their dreams.' },
      translated: { lang: 'Español', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', text: 'El futuro pertenece a quienes creen en la belleza de sus sueños.' },
      subs: 'Discurso motivacional · 45 palabras · Registro formal'
    },
    {
      title: 'Francés → Español',
      original: { lang: 'Francés', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', text: 'L\'imagination est plus importante que le savoir.' },
      translated: { lang: 'Español', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', text: 'La imaginación es más importante que el conocimiento.' },
      subs: 'Cita filosófica · 8 palabras · Registro literario'
    },
    {
      title: 'Alemán → Español',
      original: { lang: 'Alemán', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', text: 'Der Mensch ist nur da ganz Mensch, wo er spielt.' },
      translated: { lang: 'Español', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', text: 'El hombre es completamente humano solo cuando juega.' },
      subs: 'Fragmento literario · 12 palabras · Registro filosófico'
    }
  ];

  const SHELF_W = 0.6, SHELF_H = 0.22;
  const SPACING = 0.7;
  const START_X = -((EXAMPLES.length - 1) * SPACING) / 2;

  let scene, camera, renderer;
  let shelfGroups = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let howlerSounds = [];

  let analytics = { plays: {}, requests: {} };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    clipPanel: document.getElementById('clip-panel'),
    clipClose: document.getElementById('clip-close'),
    clipOriginalAudio: document.getElementById('clip-original-audio'),
    clipOriginalText: document.getElementById('clip-original-text'),
    clipOriginalLang: document.getElementById('clip-original-lang'),
    clipTranslatedAudio: document.getElementById('clip-translated-audio'),
    clipTranslatedText: document.getElementById('clip-translated-text'),
    clipTranslatedLang: document.getElementById('clip-translated-lang'),
    clipSubs: document.getElementById('clip-subs'),
    compareBtn: document.getElementById('compare-btn'),
    comparePanel: document.getElementById('compare-panel'),
    compareClose: document.getElementById('compare-close'),
    compareBody: document.getElementById('compare-body'),
    requestBtn: document.getElementById('request-btn'),
    requestPanel: document.getElementById('request-panel'),
    requestClose: document.getElementById('request-close'),
    requestForm: document.getElementById('request-form'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbClips: document.getElementById('fb-clips')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('Translator3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('Translator3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef0ea);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 20);
    camera.position.set(0, 0.5, 2.6);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.4);
    key.position.set(2, 4, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xddffdd, 0.2);
    fill.position.set(-2, 1, 2);
    scene.add(fill);

    buildShelves();
  }

  function buildShelves() {
    shelfGroups.forEach(g => scene.remove(g));
    shelfGroups = [];

    EXAMPLES.forEach((ex, idx) => {
      const x = START_X + idx * SPACING;
      const g = new THREE.Group();
      g.position.set(x, 0.05, 0);

      /* Shelf plank */
      const plankMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.6, metalness: 0.05 });
      const plank = new THREE.Mesh(new THREE.BoxGeometry(SHELF_W, 0.015, 0.08), plankMat);
      g.add(plank);

      /* Books on shelf */
      const bookColors = [0x3a6a5a, 0x2a5a6a, 0x5a4a6a, 0x6a5a3a];
      for (let b = 0; b < 3; b++) {
        const bookMat = new THREE.MeshStandardMaterial({ color: bookColors[(idx + b) % bookColors.length], roughness: 0.5 });
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06 + b * 0.02, 0.07), bookMat);
        book.position.set(-0.15 + b * 0.12, 0.04 + b * 0.01, 0);
        g.add(book);
      }

      /* Flag / label */
      const c = document.createElement('canvas');
      c.width = 256; c.height = 24;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, 256, 24);
      ctx.fillStyle = '#fff';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ex.title, 128, 16);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.025), lMat);
      lMesh.position.set(0, -0.03, 0.005);
      g.add(lMesh);

      g.userData = { idx: idx, origY: 0.05 };
      scene.add(g);
      shelfGroups.push(g);
    });
  }

  /* ---------- Click to play clip ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    shelfGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < shelfGroups.length; i++) {
        for (let j = 0; j < shelfGroups[i].children.length; j++) {
          if (hits[0].object === shelfGroups[i].children[j]) { openClip(shelfGroups[i].userData.idx); return; }
        }
      }
    }
  });

  function openClip(idx) {
    const ex = EXAMPLES[idx];
    /* Original */
    dom.clipOriginalLang.textContent = `🔊 ${ex.original.lang}`;
    dom.clipOriginalAudio.src = ex.original.audioUrl;
    dom.clipOriginalAudio.load();
    dom.clipOriginalAudio.play().catch(() => {});
    dom.clipOriginalText.textContent = `"${ex.original.text}"`;
    /* Translated */
    dom.clipTranslatedLang.textContent = `🌐 ${ex.translated.lang}`;
    dom.clipTranslatedAudio.src = ex.translated.audioUrl;
    dom.clipTranslatedAudio.load();
    dom.clipTranslatedAudio.play().catch(() => {});
    dom.clipTranslatedText.textContent = `"${ex.translated.text}"`;
    /* Subs */
    dom.clipSubs.textContent = ex.subs;

    dom.clipPanel.classList.remove('hidden');

    analytics.plays[idx] = (analytics.plays[idx] || 0) + 1;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 1.8, duration: 0.5 });
    } else {
      camera.position.z = 1.8;
    }
  }

  dom.clipClose.addEventListener('click', () => {
    dom.clipPanel.classList.add('hidden');
    dom.clipOriginalAudio.pause();
    dom.clipTranslatedAudio.pause();
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 2.6, duration: 0.4 });
    } else {
      camera.position.z = 2.6;
    }
  });

  /* ---------- Compare ---------- */
  dom.compareBtn.addEventListener('click', () => {
    dom.comparePanel.classList.toggle('hidden');
    if (!dom.comparePanel.classList.contains('hidden') && EXAMPLES.length) {
      const ex = EXAMPLES[0];
      dom.compareBody.innerHTML = `
        <div class="compare-side"><div class="cl">🔊 ${ex.original.lang}</div><audio controls preload="metadata" crossorigin="anonymous" src="${ex.original.audioUrl}"></audio><div class="ct">"${ex.original.text}"</div></div>
        <div class="compare-side"><div class="cl">🌐 ${ex.translated.lang}</div><audio controls preload="metadata" crossorigin="anonymous" src="${ex.translated.audioUrl}"></audio><div class="ct">"${ex.translated.text}"</div></div>`;
    }
  });
  dom.compareClose.addEventListener('click', () => dom.comparePanel.classList.add('hidden'));

  /* ---------- Request form ---------- */
  dom.requestBtn.addEventListener('click', () => dom.requestPanel.classList.toggle('hidden'));
  dom.requestClose.addEventListener('click', () => dom.requestPanel.classList.add('hidden'));
  dom.requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const src = dom.requestForm.querySelector('select:first-child').value;
    analytics.requests[src] = (analytics.requests[src] || 0) + 1;
    saveAnalytics();
    alert('Solicitud enviada (simulada)');
    dom.requestForm.reset();
    dom.requestPanel.classList.add('hidden');
  });

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const total = Object.values(analytics.plays).reduce((a, b) => a + b, 0);
    const totalReq = Object.values(analytics.requests).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Clips</span><span>${total}</span></div>
      <div class="analytics-row"><span>✉ Solicitudes</span><span>${totalReq}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      dom.fbClips.innerHTML = '';
      EXAMPLES.forEach((ex) => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `<div><h3>${ex.title}</h3><p><strong>${ex.original.lang}:</strong> "${ex.original.text}"</p><audio controls preload="metadata" src="${ex.original.audioUrl}"></audio><p><strong>${ex.translated.lang}:</strong> "${ex.translated.text}"</p><audio controls preload="metadata" src="${ex.translated.audioUrl}"></audio></div>`;
        dom.fbClips.appendChild(card);
      });
    }
  });

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
    const t = clock.elapsedTime;
    shelfGroups.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.position.y = g.userData.origY + Math.sin(t * 0.25 + i * 1.3) * 0.003;
      }
    });
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadAnalytics();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

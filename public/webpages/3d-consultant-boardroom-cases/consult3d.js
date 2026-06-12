(function () {
  'use strict';

  const CASES = [
    {
      title: 'Transformación Digital — Fintech',
      client: 'FinTech Corp',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      testimonialUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      metrics: { roi: '340%', tiempo: '6 meses' },
      caption: 'Reestructuración integral de plataforma digital. Migración a cloud y automatización de procesos.',
      pdf: 'caso-fintech.pdf'
    },
    {
      title: 'Optimización Logística — Retail',
      client: 'RetailPlus',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      testimonialUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      metrics: { roi: '280%', tiempo: '4 meses' },
      caption: 'Reducción de costos logísticos en un 40% mediante análisis de datos y reingeniería de procesos.',
      pdf: 'caso-retail.pdf'
    },
    {
      title: 'Estrategia de Crecimiento — SaaS',
      client: 'CloudScale',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      testimonialUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      metrics: { roi: '420%', tiempo: '8 meses' },
      caption: 'Escalamiento de plataforma SaaS de 10k a 100k usuarios con arquitectura serverless.',
      pdf: 'caso-saas.pdf'
    }
  ];

  const TABLE_COLS = 2;
  const TABLE_W = 0.5, TABLE_H = 0.3;
  const SPACING_X = 0.7, SPACING_Y = 0.45;
  const START_X = -((TABLE_COLS - 1) * SPACING_X) / 2;

  let scene, camera, renderer;
  let tableGroups = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let compareMode = false;
  let compareSelection = [];

  let analytics = { views: {}, comparisons: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    casePanel: document.getElementById('case-panel'),
    caseClose: document.getElementById('case-close'),
    caseVideo: document.getElementById('case-video'),
    caseMeta: document.getElementById('case-meta'),
    caseMetrics: document.getElementById('case-metrics'),
    caseCaption: document.getElementById('case-caption'),
    compareBtn: document.getElementById('compare-btn'),
    comparePanel: document.getElementById('compare-panel'),
    compareClose: document.getElementById('compare-close'),
    compareGrid: document.getElementById('compare-grid'),
    contactBtn: document.getElementById('contact-btn'),
    contactPanel: document.getElementById('contact-panel'),
    contactClose: document.getElementById('contact-close'),
    contactForm: document.getElementById('contact-form'),
    resourcesBtn: document.getElementById('resources-btn'),
    resourcesPanel: document.getElementById('resources-panel'),
    resourcesClose: document.getElementById('resources-close'),
    resourcesBody: document.getElementById('resources-body'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbCases: document.getElementById('fb-cases')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('Consultant3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('Consultant3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0eee8);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 20);
    camera.position.set(0, 0.5, 2.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffeedd, 0.4);
    key.position.set(2, 4, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xccddff, 0.2);
    fill.position.set(-2, 1, 2);
    scene.add(fill);

    buildTables();
  }

  function buildTables() {
    tableGroups.forEach(g => scene.remove(g));
    tableGroups = [];

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe0dcd4, roughness: 0.7, metalness: 0.05 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.28;
    scene.add(floor);

    CASES.forEach((c, idx) => {
      const col = idx % TABLE_COLS;
      const row = Math.floor(idx / TABLE_COLS);
      const x = START_X + col * SPACING_X;
      const y = 0.12 - row * SPACING_Y;

      const g = new THREE.Group();
      g.position.set(x, y, 0);

      /* Table top */
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.5, metalness: 0.1 });
      const table = new THREE.Mesh(new THREE.BoxGeometry(TABLE_W, 0.02, TABLE_H), tableMat);
      table.position.y = -0.1;
      g.add(table);

      /* Card on table */
      const cardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.05, emissive: 0xf8f6f2 });
      const card = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.14), cardMat);
      card.position.y = 0.01;
      g.add(card);

      /* Thumbnail video */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = c.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      const sMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.11), sMat);
      screen.position.y = 0.01;
      screen.position.z = 0.006;
      g.add(screen);

      /* Label */
      const c = document.createElement('canvas');
      c.width = 256; c.height = 24;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 256, 24);
      ctx.fillStyle = '#fff';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.title, 128, 16);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.025), lMat);
      lMesh.position.set(0, -0.06, 0.006);
      g.add(lMesh);

      g.userData = { idx: idx, origX: x, origY: y };
      scene.add(g);
      tableGroups.push(g);
    });
  }

  /* ---------- Click to open case ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    if (compareMode) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    tableGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < tableGroups.length; i++) {
        for (let j = 0; j < tableGroups[i].children.length; j++) {
          if (hits[0].object === tableGroups[i].children[j]) { openCase(tableGroups[i].userData.idx); return; }
        }
      }
    }
  });

  function openCase(idx) {
    const c = CASES[idx];
    dom.caseVideo.src = c.testimonialUrl;
    dom.caseVideo.load();
    dom.caseVideo.play().catch(() => {});
    dom.caseMeta.textContent = `${c.title} — ${c.client}`;
    dom.caseMetrics.innerHTML = `
      <div class="metric"><div class="val">${c.metrics.roi}</div><div class="lab">ROI</div></div>
      <div class="metric"><div class="val">${c.metrics.tiempo}</div><div class="lab">Implementación</div></div>`;
    dom.caseCaption.textContent = c.caption;
    dom.casePanel.classList.remove('hidden');

    analytics.views[idx] = (analytics.views[idx] || 0) + 1;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to('.metric .val', { opacity: 0, duration: 0, onStart: function () {
        gsap.to('.metric .val', { opacity: 1, duration: 0.5, delay: 0.2 });
      }});
    }
  }

  dom.caseClose.addEventListener('click', () => {
    dom.casePanel.classList.add('hidden');
    dom.caseVideo.pause();
  });

  /* ---------- Compare ---------- */
  dom.compareBtn.addEventListener('click', () => {
    compareMode = !compareMode;
    dom.compareBtn.classList.toggle('active', compareMode);
    if (!compareMode) { dom.comparePanel.classList.add('hidden'); compareSelection = []; return; }
    dom.comparePanel.classList.remove('hidden');
    compareSelection = [];
    dom.compareGrid.innerHTML = CASES.map((c, i) => `
      <div class="compare-card" data-idx="${i}" style="cursor:pointer">
        <video src="${c.testimonialUrl}" muted loop playsinline></video>
        <h4>${c.title}</h4>
        <p style="font-size:.42rem;color:var(--muted)">Click para seleccionar</p>
      </div>
    `).join('');
    dom.compareGrid.querySelectorAll('.compare-card').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        if (compareSelection.includes(idx)) {
          compareSelection = compareSelection.filter(v => v !== idx);
          el.style.borderColor = '';
        } else if (compareSelection.length < 2) {
          compareSelection.push(idx);
          el.style.borderColor = 'var(--accent)';
          el.style.border = '2px solid var(--accent)';
        }
        if (compareSelection.length === 2) {
          analytics.comparisons++;
          saveAnalytics();
          const c1 = CASES[compareSelection[0]], c2 = CASES[compareSelection[1]];
          dom.compareGrid.innerHTML = `
            <div class="compare-card"><video src="${c1.testimonialUrl}" controls autoplay muted playsinline></video><h4>${c1.title}</h4><div style="font-size:.42rem">ROI: ${c1.metrics.roi}</div></div>
            <div class="compare-card"><video src="${c2.testimonialUrl}" controls autoplay muted playsinline></video><h4>${c2.title}</h4><div style="font-size:.42rem">ROI: ${c2.metrics.roi}</div></div>`;
        }
      });
    });
  });
  dom.compareClose.addEventListener('click', () => { compareMode = false; dom.compareBtn.classList.remove('active'); dom.comparePanel.classList.add('hidden'); });

  /* ---------- Contact ---------- */
  dom.contactBtn.addEventListener('click', () => dom.contactPanel.classList.toggle('hidden'));
  dom.contactClose.addEventListener('click', () => dom.contactPanel.classList.add('hidden'));
  dom.contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Mensaje enviado (simulado)');
    dom.contactForm.reset();
    dom.contactPanel.classList.add('hidden');
  });

  /* ---------- Resources ---------- */
  dom.resourcesBtn.addEventListener('click', () => {
    dom.resourcesPanel.classList.toggle('hidden');
    if (!dom.resourcesPanel.classList.contains('hidden')) {
      dom.resourcesBody.innerHTML = CASES.map((c) =>
        `<div class="resource-item"><span>${c.pdf}</span><span class="dl" data-pdf="${c.pdf}">📥</span></div>`
      ).join('');
      dom.resourcesBody.querySelectorAll('.dl').forEach(el => {
        el.addEventListener('click', () => {
          const blob = new Blob(['PDF simulado: ' + el.dataset.pdf], { type: 'text/plain' });
          const a = document.createElement('a');
          a.download = el.dataset.pdf;
          a.href = URL.createObjectURL(blob);
          a.click();
        });
      });
    }
  });
  dom.resourcesClose.addEventListener('click', () => dom.resourcesPanel.classList.add('hidden'));

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const total = Object.values(analytics.views).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Testimonios</span><span>${total}</span></div>
      <div class="analytics-row"><span>⇄ Comparaciones</span><span>${analytics.comparisons}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      dom.fbCases.innerHTML = '';
      CASES.forEach((c) => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `<video controls preload="metadata" src="${c.testimonialUrl}"></video><div><h3>${c.title}</h3><p>${c.client} · ROI ${c.metrics.roi} · ${c.metrics.tiempo}</p><p style="font-size:.48rem;color:var(--muted)">${c.caption}</p></div>`;
        dom.fbCases.appendChild(card);
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
    tableGroups.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.position.y = g.userData.origY + Math.sin(t * 0.25 + i * 0.8) * 0.004;
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

(function () {
  'use strict';

  const PROJECTS = [
    {
      title: 'Fintech App',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      walkthroughUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      caption: 'App bancaria con dashboard, transferencias y notificaciones en tiempo real.',
      snippets: [
        { label: 'Botón CTA', code: '.btn-primary {\n  background: #3a5a6a;\n  border-radius: 8px;\n  transition: .2s;\n}\n.btn-primary:hover {\n  transform: scale(1.02);\n}' },
        { label: 'Tarjeta saldo', code: '.card {\n  box-shadow: 0 1px 10px rgba(0,0,0,.04);\n  backdrop-filter: blur(4px);\n}' }
      ],
      tooltips: [
        { t: 1, x: -0.05, y: 0.12, text: 'Dashboard con saldo y movimientos recientes' },
        { t: 3, x: 0.12, y: -0.05, text: 'Botón de transferencia rápida' },
        { t: 6, x: -0.15, y: -0.1, text: 'Notificaciones en tiempo real' }
      ]
    },
    {
      title: 'E-commerce Dashboard',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      walkthroughUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      caption: 'Panel de administración con gráficos, pedidos y catálogo de productos.',
      snippets: [
        { label: 'Tabla pedidos', code: '.table-row {\n  display: grid;\n  grid-template-columns: 2fr 1fr 1fr;\n  gap: .5rem;\n}\n.table-row:hover {\n  background: #f5f2ed;\n}' },
        { label: 'Gráfico', code: '.chart-bar {\n  height: var(--val);\n  background: linear-gradient(180deg, #3a5a6a, #5a8a9a);\n  border-radius: 4px 4px 0 0;\n}' }
      ],
      tooltips: [
        { t: 2, x: 0.1, y: 0.15, text: 'Gráfico de ventas semanal' },
        { t: 5, x: -0.12, y: -0.08, text: 'Tabla de pedidos con filtros' }
      ]
    }
  ];

  const MOCKUP_W = 0.55, MOCKUP_H = 0.4;

  let scene, camera, renderer;
  let mockupGroup, mockupScreen, mockupElements = [];
  let currentProjIdx = 0;
  let isWalking = false, isInspecting = false;
  let walkthroughVideo, walkthroughCues = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let tooltipTimeout = null;

  let analytics = { walkthroughs: 0, interactions: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    heroOverlay: document.querySelector('.hero-overlay'),
    walkthroughBtn: document.getElementById('walkthrough-btn'),
    resumeBtn: document.getElementById('resume-walkthrough-btn'),
    inspectBtn: document.getElementById('inspect-btn'),
    inspectPanel: document.getElementById('inspect-panel'),
    inspectClose: document.getElementById('inspect-close'),
    inspectBody: document.getElementById('inspect-body'),
    inspectCode: document.getElementById('inspect-code'),
    inspectCopy: document.getElementById('inspect-copy'),
    tooltip3d: document.getElementById('tooltip-3d'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbWalkthroughs: document.getElementById('fb-walkthroughs')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('UX3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('UX3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f2ed);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 20);
    camera.position.set(0, 0.3, 2.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.4);
    key.position.set(2, 4, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xccddff, 0.2);
    fill.position.set(-2, 1, 2);
    scene.add(fill);

    buildMockup();
  }

  function buildMockup() {
    if (mockupGroup) scene.remove(mockupGroup);
    mockupGroup = new THREE.Group();
    mockupElements = [];

    /* Device frame */
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3e, metalness: 0.3, roughness: 0.4 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(MOCKUP_W, MOCKUP_H, 0.03), frameMat);
    frame.userData.component = 'frame';
    mockupGroup.add(frame);

    /* Screen */
    const screenMat = new THREE.MeshStandardMaterial({ color: 0xf8f6f2, emissive: 0xf8f6f2 });
    mockupScreen = new THREE.Mesh(new THREE.PlaneGeometry(MOCKUP_W * 0.9, MOCKUP_H * 0.88), screenMat);
    mockupScreen.position.z = 0.02;
    mockupScreen.userData.component = 'screen';
    mockupGroup.add(mockupScreen);

    /* UI elements */
    const colors = [0x3a5a6a, 0x5a8a9a, 0xda6a4a, 0x8a9aaa];
    const positions = [
      { x: -0.18, y: 0.14, w: 0.08, h: 0.012 },  /* header */
      { x: 0.12, y: 0.14, w: 0.03, h: 0.012 },    /* icon */
      { x: 0, y: 0.06, w: 0.3, h: 0.04 },          /* hero card */
      { x: -0.18, y: -0.06, w: 0.13, h: 0.03 },    /* card 1 */
      { x: -0.02, y: -0.06, w: 0.13, h: 0.03 },    /* card 2 */
      { x: 0.14, y: -0.06, w: 0.13, h: 0.03 },     /* card 3 */
      { x: -0.15, y: -0.16, w: 0.08, h: 0.015 },   /* nav */
      { x: 0, y: -0.16, w: 0.08, h: 0.015 },
      { x: 0.15, y: -0.16, w: 0.08, h: 0.015 }
    ];

    positions.forEach((p, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.3, metalness: 0.05 });
      const el = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, 0.005), mat);
      el.position.set(p.x, p.y, 0.025);
      el.userData.component = 'ui-element';
      el.userData.idx = i;
      mockupGroup.add(el);
      mockupElements.push(el);
    });

    mockupGroup.position.set(0, 0.1, 0);
    scene.add(mockupGroup);
  }

  /* ---------- Walkthrough ---------- */
  dom.walkthroughBtn.addEventListener('click', startWalkthrough);

  function startWalkthrough() {
    isWalking = true;
    dom.heroOverlay.classList.add('hidden');
    dom.resumeBtn.classList.remove('hidden');

    const proj = PROJECTS[currentProjIdx];
    if (!walkthroughVideo) {
      walkthroughVideo = document.createElement('video');
      walkthroughVideo.crossOrigin = 'anonymous';
      walkthroughVideo.preload = 'auto';
      document.body.appendChild(walkthroughVideo);
    }
    walkthroughVideo.src = proj.walkthroughUrl;
    walkthroughVideo.load();
    walkthroughVideo.play().catch(() => {});
    walkthroughVideo.addEventListener('timeupdate', onWalkthroughTime);

    analytics.walkthroughs++;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 2.0, duration: 0.6 });
    }
  }

  function onWalkthroughTime() {
    if (!isWalking || !walkthroughVideo) return;
    const t = walkthroughVideo.currentTime;
    const proj = PROJECTS[currentProjIdx];

    /* Tooltip cues */
    const active = proj.tooltips.filter(tip => Math.abs(tip.t - t) < 0.5);
    if (active.length) {
      const tip = active[0];
      const v3 = new THREE.Vector3(tip.x, tip.y, 0.03);
      v3.applyMatrix4(mockupGroup.matrixWorld);
      v3.project(camera);
      const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
      const x = (v3.x * 0.5 + 0.5) * w;
      const y = (-v3.y * 0.5 + 0.5) * h;
      dom.tooltip3d.style.left = x + 'px';
      dom.tooltip3d.style.top = y + 'px';
      dom.tooltip3d.textContent = tip.text;
      dom.tooltip3d.classList.remove('hidden');
      clearTimeout(tooltipTimeout);
      tooltipTimeout = setTimeout(() => dom.tooltip3d.classList.add('hidden'), 2500);
    }

    /* Highlight elements with a glow */
    if (t > 1 && t < 2) highlightElements([0]);
    else if (t >= 2 && t < 4) highlightElements([1, 2]);
    else if (t >= 4 && t < 6) highlightElements([3, 4, 5]);
    else if (t >= 6) highlightElements([6, 7, 8]);
    else resetHighlight();
  }

  function highlightElements(indices) {
    mockupElements.forEach((el, i) => {
      const isHighlight = indices.includes(i);
      if (!prefersReducedMotion) {
        gsap.to(el.material, { emissive: isHighlight ? new THREE.Color(0xda6a4a) : new THREE.Color(0x000000), emissiveIntensity: isHighlight ? 0.3 : 0, duration: 0.2 });
        gsap.to(el.scale, { x: isHighlight ? 1.05 : 1, y: isHighlight ? 1.05 : 1, duration: 0.2 });
      } else {
        el.material.emissive = isHighlight ? new THREE.Color(0xda6a4a) : new THREE.Color(0x000000);
        el.material.emissiveIntensity = isHighlight ? 0.3 : 0;
        el.scale.set(isHighlight ? 1.05 : 1, isHighlight ? 1.05 : 1, 1);
      }
    });
  }

  function resetHighlight() {
    mockupElements.forEach((el) => {
      if (!prefersReducedMotion) {
        gsap.to(el.material, { emissive: new THREE.Color(0x000000), emissiveIntensity: 0, duration: 0.2 });
        gsap.to(el.scale, { x: 1, y: 1, duration: 0.2 });
      } else {
        el.material.emissive = new THREE.Color(0x000000);
        el.material.emissiveIntensity = 0;
        el.scale.set(1, 1, 1);
      }
    });
  }

  dom.resumeBtn.addEventListener('click', () => {
    if (walkthroughVideo && isInspecting) {
      isInspecting = false;
      dom.inspectPanel.classList.add('hidden');
      walkthroughVideo.play().catch(() => {});
      dom.resumeBtn.textContent = '⏸ Pausar';
    }
  });

  /* ---------- Inspect mode ---------- */
  dom.inspectBtn.addEventListener('click', () => {
    if (!isWalking) return;
    isInspecting = !isInspecting;
    dom.inspectPanel.classList.toggle('hidden', !isInspecting);
    if (isInspecting && walkthroughVideo) {
      walkthroughVideo.pause();
      dom.resumeBtn.textContent = '▶ Reanudar';
    }
  });
  dom.inspectClose.addEventListener('click', () => {
    isInspecting = false;
    dom.inspectPanel.classList.add('hidden');
  });

  /* Hover over mockup elements in inspect mode */
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!isInspecting) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(mockupElements);
    if (hits.length) {
      const el = hits[0].object;
      const idx = el.userData.idx;
      const labels = ['Header', 'Icono menú', 'Hero card', 'Card 1', 'Card 2', 'Card 3', 'Nav 1', 'Nav 2', 'Nav 3'];
      dom.inspectBody.textContent = `🔹 ${labels[idx] || 'Componente'} — w: ${el.geometry.parameters.width}, h: ${el.geometry.parameters.height}`;

      const proj = PROJECTS[currentProjIdx];
      const snippetIdx = Math.min(idx, proj.snippets.length - 1);
      dom.inspectCode.textContent = proj.snippets[snippetIdx].code;
      if (window.Prism) Prism.highlightElement(dom.inspectCode);
      analytics.interactions++;
    }
  });

  dom.inspectCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(dom.inspectCode.textContent).catch(() => {});
    dom.inspectCopy.textContent = '✅ Copiado';
    setTimeout(() => { dom.inspectCopy.textContent = '📋 Copiar'; }, 1200);
  });

  /* ---------- Cycle project ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    if (isWalking) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([mockupGroup]);
    if (hits.length) {
      currentProjIdx = (currentProjIdx + 1) % PROJECTS.length;
      dom.heroTitle.textContent = PROJECTS[currentProjIdx].title;
    }
  });

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Walkthroughs</span><span>${analytics.walkthroughs}</span></div>
      <div class="analytics-row"><span>🖱 Interacciones</span><span>${analytics.interactions}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      dom.fbWalkthroughs.innerHTML = '';
      PROJECTS.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `<video controls preload="metadata" src="${p.walkthroughUrl}"></video><div><h3>${p.title}</h3><p>${p.caption}</p></div>`;
        dom.fbWalkthroughs.appendChild(card);
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
    if (mockupGroup && !isWalking && !prefersReducedMotion) {
      mockupGroup.position.y = 0.1 + Math.sin(t * 0.4) * 0.005;
    }
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

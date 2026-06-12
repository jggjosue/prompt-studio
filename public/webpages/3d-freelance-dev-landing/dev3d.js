(function () {
  'use strict';

  const CUES = [
    { t: 0,    snippet: '// Inicializando app...\nconst app = new App();',                                action: 'idle',     info: 'App en reposo. Lista para iniciar.' },
    { t: 2,    snippet: '// Cargando módulo de autenticación\nawait auth.init();',                         action: 'spin',    info: 'Autenticación: verificando sesión…' },
    { t: 5,    snippet: '// Configurando rutas\nrouter.addRoutes([\n  { path: "/", component: Home },\n  { path: "/api", component: ApiDocs }\n]);', action: 'menu', info: 'Enrutador configurado con 2 rutas principales.' },
    { t: 9,    snippet: '// Consultando API\nconst data = await api.fetch("/users");',                    action: 'api',     info: 'Llamada a API REST: obteniendo usuarios…' },
    { t: 13,   snippet: '// Renderizando dashboard\ndashboard.render(data);',                               action: 'render',  info: 'Dashboard renderizado con datos en tiempo real.' },
    { t: 17,   snippet: '// Aplicando tema oscuro\ndocument.body.classList.toggle("dark");',              action: 'theme',   info: 'Cambio a modo oscuro completado.' },
    { t: 20,   snippet: '// Demo completa ✓\nconsole.log("App lista");',                                    action: 'idle',    info: 'Demo finalizada. Explora la maqueta libremente.' }
  ];

  const TUTORIAL_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const CAPTIONS = {
    en: 'Tutorial: configuración de app full‑stack con autenticación, rutas, API y dashboard.'
  };

  let scene, camera, renderer, mockup;
  let isDemoPlaying = false, isExploring = false, mockupAnimating = false;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let raycaster = new THREE.Raycaster();
  let pointer = new THREE.Vector2();
  let activeCueIdx = -1;

  let analytics = { plays: 0, copies: 0, interactions: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    navBtns: document.querySelectorAll('.nav-btn'),
    playDemoBtn: document.getElementById('play-demo-btn'),
    exploreBtn: document.getElementById('explore-btn'),
    demoPanel: document.getElementById('demo-panel'),
    demoVideo: document.getElementById('demo-video'),
    demoBar: document.getElementById('demo-bar'),
    demoCaption: document.getElementById('demo-caption'),
    demoClose: document.getElementById('demo-close'),
    snippetCode: document.getElementById('snippet-code'),
    snippetCopy: document.getElementById('snippet-copy'),
    exploreOverlay: document.getElementById('explore-overlay'),
    exploreInfo: document.getElementById('explore-info'),
    exploreResumeBtn: document.getElementById('explore-resume-btn'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    heroOverlay: document.querySelector('.hero-overlay')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('DevLanding', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('DevLanding', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f6f2);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 20);
    camera.position.set(0, 0.8, 3.2);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, 0.5);
    key.position.set(2, 4, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xaaccff, 0.2);
    fill.position.set(-2, 1, 1.5);
    scene.add(fill);

    createMockup();
  }

  function createMockup() {
    mockup = new THREE.Group();

    /* Base device frame */
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3e, metalness: 0.3, roughness: 0.4 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.03), frameMat);
    mockup.add(frame);

    /* Screen */
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x111122, emissive: 0x111122 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), screenMat);
    screen.position.z = 0.02;
    mockup.add(screen);

    /* UI elements */
    const uiMat = new THREE.MeshStandardMaterial({ color: 0x3a7a8a, emissive: 0x1a3a4a });
    const uiGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.005), uiMat);
      bar.position.set(-0.2 + i * 0.1, 0.15, 0.025);
      uiGroup.add(bar);
    }
    const bigRect = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.18), new THREE.MeshStandardMaterial({ color: 0x2a4a5a, emissive: 0x0a2a3a }));
    bigRect.position.set(0.1, -0.05, 0.025);
    uiGroup.add(bigRect);
    mockup.add(uiGroup);
    /* Side menu icon */
    const menuMat = new THREE.MeshStandardMaterial({ color: 0x5a8a9a });
    const menuIcon = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.005), menuMat);
    menuIcon.position.set(-0.32, 0, 0.025);
    mockup.add(menuIcon);
    /* Spinner circle */
    const spinnerMat = new THREE.MeshStandardMaterial({ color: 0x6aaa6a, emissive: 0x2a5a2a });
    const spinner = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), spinnerMat);
    spinner.position.set(0.25, 0.12, 0.025);
    mockup.add(spinner);
    mockup.userData.spinner = spinner;

    /* Glow floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e4de, roughness: 0.6, metalness: 0.05, transparent: true, opacity: 0.4 });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.26;
    mockup.add(floor);

    mockup.position.set(0, 0.15, 0);
    scene.add(mockup);
  }

  /* ---------- Live cues ---------- */
  function applyCue(idx) {
    if (idx < 0 || idx >= CUES.length) return;
    activeCueIdx = idx;
    const cue = CUES[idx];
    /* Update snippet */
    dom.snippetCode.textContent = cue.snippet;
    if (window.Prism) Prism.highlightElement(dom.snippetCode);
    /* Update info */
    dom.demoCaption.textContent = cue.info;
    dom.exploreInfo.textContent = cue.info;
    /* Animate mockup */
    if (!prefersReducedMotion) {
      switch (cue.action) {
        case 'spin':
          gsap.to(mockup.rotation, { y: Math.PI * 2, duration: 0.8, ease: 'power2.out' });
          break;
        case 'menu':
          gsap.to(mockup.children.find(c => c.position.x < -0.3), { position: { x: -0.28 }, duration: 0.3 });
          break;
        case 'api':
          gsap.to(mockup.children.find(c => c.geometry && c.geometry.type === 'BoxGeometry' && c.position.y === 0.15), { scale: { x: 1.2, z: 1.2 }, duration: 0.3, yoyo: true, repeat: 1 });
          break;
        case 'render':
          gsap.to(mockup.children.find(c => c.geometry && c.geometry.type === 'PlaneGeometry' && c.position.z > 0.02), { material: { emissiveIntensity: 0.8 }, duration: 0.5 });
          break;
        case 'theme':
          gsap.to(mockup.children[0].material, { color: 0x4a4a5e, duration: 0.5 });
          break;
      }
    }
  }

  /* ---------- Demo playback ---------- */
  dom.playDemoBtn.addEventListener('click', startDemo);
  dom.exploreBtn.addEventListener('click', startExplore);

  function startDemo() {
    dom.heroOverlay.classList.add('hidden');
    dom.demoPanel.classList.remove('hidden');
    dom.demoVideo.src = TUTORIAL_VIDEO;
    dom.demoVideo.load();
    dom.demoVideo.play().catch(() => {});
    isDemoPlaying = true;
    analytics.plays++;
    saveAnalytics();

    dom.demoVideo.addEventListener('timeupdate', onDemoTimeUpdate);
    dom.demoVideo.addEventListener('ended', () => { isDemoPlaying = false; });
  }

  function onDemoTimeUpdate() {
    const t = dom.demoVideo.currentTime;
    const dur = dom.demoVideo.duration || 1;
    dom.demoBar.style.width = (t / dur * 100) + '%';

    let idx = -1;
    for (let i = CUES.length - 1; i >= 0; i--) {
      if (t >= CUES[i].t) { idx = i; break; }
    }
    if (idx !== activeCueIdx) applyCue(idx);
  }

  dom.demoClose.addEventListener('click', () => {
    dom.demoPanel.classList.add('hidden');
    dom.demoVideo.pause();
    dom.demoVideo.removeEventListener('timeupdate', onDemoTimeUpdate);
    isDemoPlaying = false;
    dom.heroOverlay.classList.remove('hidden');
  });

  /* ---------- Explore mode ---------- */
  function startExplore() {
    isExploring = true;
    dom.exploreOverlay.classList.remove('hidden');
    dom.heroOverlay.classList.add('hidden');
    if (isDemoPlaying) dom.demoVideo.pause();
    dom.demoPanel.classList.add('hidden');
    analytics.interactions++;
    saveAnalytics();
  }

  dom.exploreResumeBtn.addEventListener('click', () => {
    isExploring = false;
    dom.exploreOverlay.classList.add('hidden');
    dom.heroOverlay.classList.remove('hidden');
    if (isDemoPlaying) dom.demoVideo.play().catch(() => {});
  });

  /* ---------- Mockup interaction (Explore) ---------- */
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!isExploring) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(mockup.children, true);
    if (hits.length && mockupAnimating === false) {
      const obj = hits[0].object;
      let label = 'Frame';
      if (obj.position.z > 0.02) label = 'Pantalla';
      if (obj.material && obj.material.color) {
        if (obj.material.color.getHex() === 0x5a8a9a) label = 'Menú lateral';
        if (obj.material.color.getHex() === 0x6aaa6a) label = 'Indicador de estado';
      }
      dom.exploreInfo.textContent = `🔹 ${label} — componentes renderizados en tiempo real.`;
    }
  });

  renderer.domElement.addEventListener('click', (e) => {
    if (!isExploring) return;
    analytics.interactions++;
    saveAnalytics();
  });

  /* ---------- Copy snippet ---------- */
  dom.snippetCopy.addEventListener('click', () => {
    const text = dom.snippetCode.textContent;
    navigator.clipboard.writeText(text).catch(() => {});
    analytics.copies++;
    saveAnalytics();
    dom.snippetCopy.textContent = '✅ Copiado';
    setTimeout(() => { dom.snippetCopy.textContent = '📋 Copiar'; }, 1200);
  });

  /* ---------- Nav ---------- */
  dom.navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      dom.heroOverlay.classList.toggle('hidden', mode !== 'landing');
      dom.demoPanel.classList.toggle('hidden', mode !== 'demo');
      dom.exploreOverlay.classList.toggle('hidden', mode !== 'explore');
      if (mode === 'demostart') startDemo();
    });
  });

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Demos</span><span>${analytics.plays}</span></div>
      <div class="analytics-row"><span>📋 Snippets copiados</span><span>${analytics.copies}</span></div>
      <div class="analytics-row"><span>🖱 Interacciones</span><span>${analytics.interactions}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
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
    if (mockup && mockup.userData.spinner && !prefersReducedMotion) {
      mockup.userData.spinner.rotation.z = t * 1.5;
    }
    /* Subtle idle float */
    if (mockup && !isDemoPlaying && !prefersReducedMotion) {
      mockup.position.y = 0.15 + Math.sin(t * 0.5) * 0.008;
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

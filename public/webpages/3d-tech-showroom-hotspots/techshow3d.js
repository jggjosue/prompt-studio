(function () {
  'use strict';

  const HOTSPOTS = [
    {
      title: 'API de Autenticación',
      desc: 'Implementa OAuth 2.0 con JWT. Flujo completo: login, refresh, logout.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      snippet: `// Ejemplo: login con AuthAPI\nconst api = new AuthAPI({ tenant: 'demo' });\nconst token = await api.login({\n  email: 'user@example.com',\n  password: '***'\n});\nconsole.log('Access token:', token);\n// → eyJhbGciOiJSUzI1NiIs...`,
      deepDive: 'El flujo OAuth 2.0 Authorization Code + PKCE garantiza que el token nunca sea visible en el frontend. El refresh token rotativo previene reuso malicioso.'
    },
    {
      title: 'WebSocket en Tiempo Real',
      desc: 'Conexión bidireccional con auto-reconnect y backoff exponencial.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      snippet: `// WebSocket con reconexión\nconst ws = new WSClient('wss://api.dome.ws/v1');\nws.onMessage((msg) => {\n  updateDashboard(msg.data);\n});\nws.onDisconnect(() => {\n  setTimeout(() => ws.reconnect(), 1000);\n});`,
      deepDive: 'WebSocket con compresión permessage-deflate reduce el payload un 60%. El heartbeat cada 30s detecta conexiones muertas.'
    },
    {
      title: 'Edge Computing',
      desc: 'Funciones serverless en 35+ regiones con latencia <10ms.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      snippet: `// Edge function example\nexport default async (req) => {\n  const geo = req.headers.get('x-geo');\n  const data = await cache.get('latest');\n  return new Response(JSON.stringify(data), {\n    headers: { 'x-edge': geo }\n  });\n};`,
      deepDive: 'Edge Functions se ejecutan en V8 isolates con arranque en frío <5ms. Ideal para personalización geolocalizada.'
    }
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    demoPanel: document.getElementById('demo-panel'),
    demoClose: document.getElementById('demo-close'),
    demoTitle: document.getElementById('demo-title'),
    demoVideo: document.getElementById('demo-video'),
    demoDesc: document.getElementById('demo-desc'),
    snippetCode: document.getElementById('snippet-code'),
    copyBtn: document.getElementById('copy-btn'),
    sandboxBtn: document.getElementById('sandbox-btn'),
    hsLabels: document.querySelectorAll('.hs-label'),
    deepDiveBtn: document.getElementById('deep-dive-btn'),
    deepDiveOverlay: document.getElementById('deep-dive-overlay'),
    deepDiveContent: document.getElementById('deep-dive-content'),
    deepDiveClose: document.getElementById('deep-dive-close'),
    shareBtn: document.getElementById('share-btn'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let product;
  let hotspotMeshes = [];
  let currentHotspot = 0;
  let isDeepDive = false;
  let animFrameId = null;
  let clock = new THREE.Clock();

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f6);

    const w = dom.sceneRoot.clientWidth;
    const h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 20);
    camera.position.set(0, 1.5, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.9);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.8 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    const pedMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.4, metalness: 0.05 });
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.15, 16), pedMat);
    ped.position.set(0, -0.22, 0);
    ped.castShadow = true;
    ped.receiveShadow = true;
    scene.add(ped);

    const devMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.2, metalness: 0.6 });
    const dev = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 0.25), devMat);
    dev.position.set(0, -0.08, 0);
    scene.add(dev);

    const screenMat = new THREE.MeshStandardMaterial({ color: 0x4a7a9a, emissive: 0x2a5a7a, emissiveIntensity: 0.3 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.04), screenMat);
    screen.position.set(0, -0.05, 0.13);
    screen.name = 'deviceScreen';
    scene.add(screen);
    product = dev;

    const positions = [
      { x: -0.5, y: 0.1, z: 0.3 },
      { x: 0.5, y: 0.1, z: 0.3 },
      { x: 0, y: 0.3, z: -0.2 }
    ];
    const colors = [0x4a7a9a, 0x5a8a6a, 0x9a6a5a];

    positions.forEach((p, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.3, metalness: 0.2, emissive: colors[i], emissiveIntensity: 0.1 });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.04), mat);
      orb.position.set(p.x, p.y, p.z);
      orb.userData.hotspotIdx = i;
      scene.add(orb);
      hotspotMeshes.push(orb);

      const ringMat = new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.15, wireframe: true });
      const ring = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8), ringMat);
      ring.position.copy(orb.position);
      ring.userData.hotspotIdx = i;
      scene.add(ring);
      hotspotMeshes.push(ring);
    });
  }

  function selectHotspot(idx) {
    currentHotspot = idx;
    const hs = HOTSPOTS[idx];
    dom.demoTitle.textContent = hs.title;
    dom.demoVideo.src = hs.videoUrl;
    dom.demoVideo.load();
    dom.demoVideo.play().catch(() => { });
    dom.demoDesc.textContent = hs.desc;
    dom.snippetCode.textContent = hs.snippet;
    if (window.Prism) Prism.highlightElement(dom.snippetCode);
    dom.demoPanel.classList.remove('hidden');

    const screen = scene.getObjectByName('deviceScreen');
    if (screen) gsap.to(screen.material, { emissiveIntensity: 0.6, duration: 0.3, yoyo: true, repeat: 1 });

    hotspotMeshes.forEach((h) => {
      if (h.material) gsap.to(h.material, { emissiveIntensity: h.userData.hotspotIdx === idx ? 0.4 : 0.1, duration: 0.3 });
    });
  }

  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hotspotMeshes);
    if (hits.length) {
      const idx = hits[0].object.userData.hotspotIdx;
      if (idx != null) selectHotspot(idx);
    }
  });

  dom.hsLabels.forEach((btn) => {
    btn.addEventListener('click', () => selectHotspot(parseInt(btn.dataset.hotspot)));
  });

  dom.demoClose.addEventListener('click', () => { dom.demoPanel.classList.add('hidden'); dom.demoVideo.pause(); });
  dom.copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(HOTSPOTS[currentHotspot]?.snippet || '');
    dom.copyBtn.textContent = '✅ Copiado';
    setTimeout(() => { dom.copyBtn.textContent = '📋 Copiar'; }, 1500);
  });
  dom.sandboxBtn.addEventListener('click', () => window.open('https://codesandbox.io/s/new', '_blank'));

  dom.deepDiveBtn.addEventListener('click', () => {
    isDeepDive = !isDeepDive;
    dom.deepDiveOverlay.classList.toggle('hidden');
    if (isDeepDive && HOTSPOTS[currentHotspot]) dom.deepDiveContent.textContent = HOTSPOTS[currentHotspot].deepDive;
  });
  dom.deepDiveClose.addEventListener('click', () => { isDeepDive = false; dom.deepDiveOverlay.classList.add('hidden'); });

  dom.shareBtn.addEventListener('click', () => {
    const url = `${window.location.origin}${window.location.pathname}?hotspot=${currentHotspot}&t=${Math.floor(Date.now() / 1000)}`;
    navigator.clipboard.writeText(url);
    dom.modalBody.innerHTML = `<p>🔗 Enlace copiado:</p><code style="font-size:.6rem;word-break:break-all">${url}</code>`;
    dom.modal.classList.remove('hidden');
  });

  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
  dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    HOTSPOTS.forEach((hs) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${hs.videoUrl}" crossorigin="anonymous"></video><div><h3>${hs.title}</h3><p>${hs.desc}</p></div>`;
      dom.fbGrid.appendChild(card);
    });
  });

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
    if (product) {
      product.position.y = -0.08 + Math.sin(t * 0.6) * 0.008;
      product.rotation.y = Math.sin(t * 0.2) * 0.05;
    }
    hotspotMeshes.forEach((h, i) => {
      if (h.geometry && h.geometry.type === 'SphereGeometry') {
        h.material.emissiveIntensity = 0.1 + Math.sin(t * 1.5 + i) * 0.05;
      }
    });
    camera.lookAt(0, 0.05, 0);
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    selectHotspot(0);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

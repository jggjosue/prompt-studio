(function () {
  'use strict';

  const HOTSPOTS = [
    { id: 'auth', title: 'Autenticación API', lang: 'javascript', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', desc: 'Flujo OAuth 2.0 con refresh token automático. El producto responde animando un login 3D.', code: `const auth = new AuthClient({ tenant: 'prod' });\nawait auth.login({\n  strategy: 'oauth2',\n  scopes: ['read', 'write']\n});\n// Token expires in 3600s\nconst token = auth.getToken();`, sandbox: 'https://codesandbox.io/s/example' },
    { id: 'api', title: 'REST Endpoints', lang: 'javascript', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', desc: 'CRUD completo con paginación y filtros. El producto muestra un flujo de datos animado.', code: `const api = new APIClient({ base: 'https://api.example.com/v2' });\nconst { data, meta } = await api.query('/users', {\n  page: 1, limit: 50,\n  filter: { role: 'admin' }\n});`, sandbox: 'https://codesandbox.io/s/example' },
    { id: 'websocket', title: 'WebSocket Tiempo Real', lang: 'javascript', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', desc: 'Conexión persistente con reconexión automática y fallback polling.', code: `const ws = new RealtimeClient({\n  url: 'wss://api.example.com/events',\n  reconnect: true\n});\nws.on('message', (msg) => {\n  updateDashboard(msg);\n});`, sandbox: 'https://codesandbox.io/s/example' },
    { id: 'deploy', title: 'Deploy CLI', lang: 'bash', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', desc: 'Despliegue one‑command con rollback automático. El producto muestra un pipeline CI/CD.', code: `$ tech deploy --env staging --tag v2.1.0\n✓ Building image...\n✓ Pushing to registry...\n✓ Deploying 4 replicas...\n✓ Health check passed (200ms)\n→ https://staging.app.example.com`, sandbox: 'https://codesandbox.io/s/example' },
    { id: 'analytics', title: 'Analytics Dashboard', lang: 'python', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', desc: 'Métricas en tiempo real con agregaciones. El producto anima gráficos 3D.', code: `from analytics import MetricsClient\n\nclient = MetricsClient(api_key='sk-...')\nmetrics = client.query(\n  metric='api_latency_p99',\n  range='-1h',\n  granularity='1m'\n)\nprint(metrics.avg()) # 42ms`, sandbox: 'https://codesandbox.io/s/example' }
  ];

  const HOTSPOT_POSITIONS = [
    { angle: 0, y: 0.15 }, { angle: Math.PI * 0.4, y: 0.25 },
    { angle: Math.PI * 0.8, y: 0.15 }, { angle: Math.PI * 1.2, y: 0.25 },
    { angle: Math.PI * 1.6, y: 0.15 }
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    hotspotPanel: document.getElementById('hotspot-panel'),
    panelClose: document.getElementById('panel-close'),
    panelTitle: document.getElementById('panel-title'),
    panelVideo: document.getElementById('panel-video'),
    panelDesc: document.getElementById('panel-desc'),
    snippetCode: document.querySelector('#snippet-code code'),
    snippetLang: document.getElementById('snippet-lang'),
    snippetCopy: document.getElementById('snippet-copy'),
    snippetSandbox: document.getElementById('snippet-sandbox'),
    deepDiveBtn: document.getElementById('deep-dive-btn'),
    deepDiveOverlay: document.getElementById('deep-dive-overlay'),
    ddClose: document.getElementById('dd-close'),
    ddBody: document.getElementById('dd-body'),
    shareBtn: document.getElementById('share-btn'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let productGroup, pedestal;
  let hotspotMeshes = [];
  let currentHotspot = null;
  let isDeepDive = false;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let productAnimState = { phase: 0 };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ece4);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 20);
    camera.position.set(0, 1.2, 2.8);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.9);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.3);
    fill.position.set(-2, 1, -3);
    scene.add(fill);

    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    /* Pedestal */
    const pedGroup = new THREE.Group();
    const pedMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.3, metalness: 0.1 });
    const pedBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.06, 24), pedMat);
    pedBase.position.y = -0.27;
    pedBase.receiveShadow = true;
    pedGroup.add(pedBase);
    const pedStem = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.08, 24), pedMat);
    pedStem.position.y = -0.2;
    pedStem.castShadow = true;
    pedGroup.add(pedStem);
    const pedTop = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.04, 24), pedMat);
    pedTop.position.y = -0.14;
    pedTop.receiveShadow = true;
    pedGroup.add(pedTop);
    scene.add(pedGroup);
    pedestal = pedGroup;

    /* Product (abstract tech device) */
    productGroup = new THREE.Group();
    productGroup.position.y = -0.1;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.2, metalness: 0.6, emissive: 0x111122, emissiveIntensity: 0.1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.08), bodyMat);
    body.position.y = 0.03;
    body.castShadow = true;
    productGroup.add(body);

    /* Screen on product */
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x4a6a8a, emissive: 0x4a6a8a, emissiveIntensity: 0.2 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.04), screenMat);
    screen.position.set(0, 0.04, 0.041);
    productGroup.add(screen);
    productGroup.userData.screen = screen;

    /* Glow ring */
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4a6a8a, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.07, 24), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.06;
    productGroup.add(ring);
    productGroup.userData.ring = ring;

    scene.add(productGroup);

    /* Hotspot markers */
    HOTSPOTS.forEach((hs, idx) => {
      const pos = HOTSPOT_POSITIONS[idx % HOTSPOT_POSITIONS.length];
      const g = new THREE.Group();
      const radius = 0.55;
      g.position.set(Math.cos(pos.angle) * radius, pos.y, Math.sin(pos.angle) * radius);

      const dotMat = new THREE.MeshBasicMaterial({ color: 0xc8a040 });
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), dotMat);
      g.add(dot);

      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xc8a040, transparent: true, opacity: 0.3 });
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pulseMat);
      g.add(pulse);
      g.userData = { pulse, dot };

      g.userData.hotspotIdx = idx;
      scene.add(g);
      hotspotMeshes.push(g);
    });
  }

  /* ---------- Click hotspot ---------- */
  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const allMeshes = [];
    hotspotMeshes.forEach((g) => g.children.forEach((c) => { if (c.isMesh) allMeshes.push(c); }));
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length) {
      let found = -1;
      for (let i = 0; i < hotspotMeshes.length; i++) {
        for (let j = 0; j < hotspotMeshes[i].children.length; j++) {
          if (hits[0].object === hotspotMeshes[i].children[j]) { found = i; break; }
        }
        if (found >= 0) break;
      }
      if (found >= 0) activateHotspot(found);
    }
  });

  function activateHotspot(idx) {
    currentHotspot = idx;
    const hs = HOTSPOTS[idx];
    dom.panelTitle.textContent = hs.title;
    dom.panelVideo.src = hs.videoUrl;
    dom.panelVideo.load();
    dom.panelVideo.play().catch(() => {});
    dom.panelDesc.textContent = hs.desc;

    dom.snippetCode.textContent = hs.code;
    dom.snippetLang.textContent = hs.lang.toUpperCase();
    dom.snippetCode.parentElement.className = `language-${hs.lang}`;
    if (typeof Prism !== 'undefined') Prism.highlightElement(dom.snippetCode);

    dom.hotspotPanel.classList.remove('hidden');

    /* Sync product animation */
    productAnimState.phase = idx;
    const colors = [0x4a6a8a, 0x5a8a5a, 0x8a5a6a, 0x8a7a4a, 0x4a8a7a];
    const targetColor = colors[idx % colors.length];
    if (productGroup.userData.screen) {
      const m = productGroup.userData.screen.material;
      if (!prefersReducedMotion) {
        gsap.to(m, { emissiveIntensity: 0.6, duration: 0.3, yoyo: true, repeat: 1 });
        gsap.to(m.color, { r: ((targetColor >> 16) & 0xff) / 255, g: ((targetColor >> 8) & 0xff) / 255, b: (targetColor & 0xff) / 255, duration: 0.5 });
      } else {
        m.color.setHex(targetColor);
      }
    }

    /* Fly camera to hotspot */
    const g = hotspotMeshes[idx];
    const worldPos = new THREE.Vector3();
    g.getWorldPosition(worldPos);
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { x: worldPos.x * 0.6, y: worldPos.y + 0.8, z: worldPos.z * 0.6 + 1.2, duration: 0.6 });
    } else {
      camera.position.set(worldPos.x * 0.6, worldPos.y + 0.8, worldPos.z * 0.6 + 1.2);
    }
  }

  dom.panelClose.addEventListener('click', () => {
    dom.hotspotPanel.classList.add('hidden');
    dom.panelVideo.pause();
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { x: 0, y: 1.2, z: 2.8, duration: 0.5 });
    } else {
      camera.position.set(0, 1.2, 2.8);
    }
  });

  /* ---------- Snippet actions ---------- */
  dom.snippetCopy.addEventListener('click', () => {
    const text = dom.snippetCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
      dom.snippetCopy.textContent = '✓ Copiado';
      setTimeout(() => { dom.snippetCopy.textContent = '📋 Copiar'; }, 1500);
    });
  });

  dom.snippetSandbox.addEventListener('click', () => {
    if (currentHotspot != null) {
      window.open(HOTSPOTS[currentHotspot].sandbox, '_blank');
    }
  });

  /* ---------- Deep Dive ---------- */
  dom.deepDiveBtn.addEventListener('click', () => {
    isDeepDive = !isDeepDive;
    dom.deepDiveOverlay.classList.toggle('hidden');
    dom.deepDiveBtn.textContent = isDeepDive ? '🔬 Salir' : '🔬 Deep Dive';
    if (isDeepDive) renderDeepDive();
  });
  dom.ddClose.addEventListener('click', () => {
    isDeepDive = false;
    dom.deepDiveOverlay.classList.add('hidden');
    dom.deepDiveBtn.textContent = '🔬 Deep Dive';
  });

  function renderDeepDive() {
    dom.ddBody.innerHTML = HOTSPOTS.map((hs, i) => `
      <div class="dd-item">
        <h4>${hs.title}</h4>
        <p>${hs.desc}</p>
        <video controls preload="metadata" src="${hs.videoUrl}"></video>
      </div>
    `).join('');
  }

  /* ---------- Share ---------- */
  dom.shareBtn.addEventListener('click', () => {
    const ts = dom.panelVideo.currentTime ? `&t=${Math.floor(dom.panelVideo.currentTime)}` : '';
    const hs = currentHotspot != null ? `&hs=${currentHotspot}` : '';
    const url = `${window.location.origin}${window.location.pathname}?demo=tech${hs}${ts}`;
    if (navigator.share) {
      navigator.share({ title: 'Tech Showroom 3D', url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        dom.modalBody.innerHTML = `<p>🔗 Enlace copiado.</p>`;
        dom.modal.classList.remove('hidden');
      });
    }
  });

  function checkParams() {
    const params = new URLSearchParams(window.location.search);
    const hs = params.get('hs');
    const t = params.get('t');
    if (hs !== null && parseInt(hs) >= 0 && parseInt(hs) < HOTSPOTS.length) {
      setTimeout(() => activateHotspot(parseInt(hs)), 500);
    }
  }

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    HOTSPOTS.forEach((hs, i) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${hs.videoUrl}"></video><div><h3>${hs.title}</h3><p>${hs.desc}</p><pre style="font-size:.5rem;margin-top:.15rem;background:#272822;color:#ccc;padding:.2rem;border-radius:4px;overflow:hidden">${hs.code.slice(0, 80)}...</pre></div>`;
      card.addEventListener('click', () => activateHotspot(i));
      dom.fbGrid.appendChild(card);
    });
  });

  /* ---------- Modal ---------- */
  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
  dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

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
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    if (!prefersReducedMotion && productGroup) {
      productGroup.rotation.y = t * 0.4;
      productGroup.position.y = -0.1 + Math.sin(t * 0.6) * 0.008;
      if (productGroup.userData.ring) {
        productGroup.userData.ring.material.opacity = 0.1 + Math.sin(t * 1.2) * 0.05;
        productGroup.userData.ring.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
      }
    }

    hotspotMeshes.forEach((g, i) => {
      if (!prefersReducedMotion && g.userData.pulse) {
        g.userData.pulse.material.opacity = 0.2 + Math.sin(t * 1.5 + i * 0.8) * 0.15;
        g.userData.pulse.scale.setScalar(1 + Math.sin(t * 1.2 + i * 0.5) * 0.1);
      }
    });

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    checkParams();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

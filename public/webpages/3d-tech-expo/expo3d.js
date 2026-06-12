/*
 * expo3d.js — Expo tecnológica 3D
 *
 * Integración sandbox externo:
 * - El botón "Probar en sandbox" debe apuntar a una URL tipo
 *   https://codesandbox.io/s/{id} o https://stackblitz.com/edit/{id}
 * - Configurar CORS en el sandbox para permitir iframe desde el dominio
 *   que aloja la expo.
 *
 * Seguridad para snippets:
 * - Todos los snippets se renderizan con Prism.js (client-side, sin eval).
 * - No ejecutar código de snippets automáticamente; el usuario debe ir
 *   al sandbox para probar.
 * - Los snippets se sirven desde el código fuente, no desde input de usuario.
 */

(function () {
  'use strict';

  const ISLANDS = [
    {
      name: 'Inteligencia Artificial',
      color: 0x5a3acc,
      stations: [
        { id: 'ai-1', name: 'NLP Studio', desc: 'Procesamiento de lenguaje natural con transformers.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', snippet: 'const model = await tf.loadLayersModel("model.json");\nconst prediction = model.predict(inputTensor);\nconsole.log(prediction.dataSync());', sandbox: 'https://codesandbox.io/s/example', position: [-0.7, 0, -0.2] },
        { id: 'ai-2', name: 'Vision API', desc: 'Reconocimiento de imágenes en tiempo real.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', snippet: 'const detector = await cocoSsd.load();\nconst predictions = await detector.detect(img);\npredictions.forEach(p => console.log(p.class, p.score));', sandbox: 'https://codesandbox.io/s/example', position: [-0.7, 0, 0.3] }
      ]
    },
    {
      name: 'Ciberseguridad',
      color: 0xcc3a3a,
      stations: [
        { id: 'sec-1', name: 'Auth Flow', desc: 'Autenticación OAuth2 con PKCE.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', snippet: 'const authUrl = new URL("https://auth.example.com/authorize");\nauthUrl.searchParams.set("response_type", "code");\nauthUrl.searchParams.set("code_challenge", challenge);', sandbox: 'https://codesandbox.io/s/example', position: [0.7, 0, -0.2] },
        { id: 'sec-2', name: 'WAF Rules', desc: 'Reglas de firewall para aplicaciones web.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', snippet: 'const rule = {\n  "Action": "Block",\n  "Condition": {\n    "IPAddress": { "aws:SourceIp": "1.2.3.0/24" }\n  }\n};', sandbox: 'https://codesandbox.io/s/example', position: [0.7, 0, 0.3] }
      ]
    },
    {
      name: 'Infraestructura',
      color: 0x3a7acc,
      stations: [
        { id: 'inf-1', name: 'K8s Dashboard', desc: 'Orquestación de contenedores con Kubernetes.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', snippet: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web', sandbox: 'https://codesandbox.io/s/example', position: [0, 0, -0.5] },
        { id: 'inf-2', name: 'CI/CD Pipeline', desc: 'Integración y despliegue continuo con GitHub Actions.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', snippet: 'name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3', sandbox: 'https://codesandbox.io/s/example', position: [0, 0, 0.5] }
      ]
    }
  ];

  let allStations = [];
  ISLANDS.forEach(island => { island.stations.forEach(s => { allStations.push(s); s.island = island.name; s.islandColor = island.color; }); });

  let scene, camera, renderer;
  let stationMeshes = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let activeStationIdx = -1;
  let deepDiveActive = false;
  let deepDiveStartTime = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metrics = { demosStarted: 0, snippetsCopied: 0, deepDiveTime: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    mapBtn: document.getElementById('map-btn'),
    mapPanel: document.getElementById('map-panel'),
    mapClose: document.getElementById('map-close'),
    mapBody: document.getElementById('map-body'),
    stationOverlay: document.getElementById('station-overlay'),
    stationVideo: document.getElementById('station-video'),
    stationVis: document.getElementById('station-vis'),
    stationInfo: document.getElementById('station-info'),
    stationCodeContent: document.getElementById('station-code-content'),
    stationClose: document.getElementById('station-close'),
    sandboxBtn: document.getElementById('sandbox-btn'),
    deepdiveOpen: document.getElementById('deepdive-open'),
    deepdiveBtn: document.getElementById('deepdive-btn'),
    deepdivePanel: document.getElementById('deepdive-panel'),
    deepdiveLogs: document.getElementById('deepdive-logs'),
    deepdiveMetrics: document.getElementById('deepdive-metrics'),
    deepdiveClose: document.getElementById('deepdive-close'),
    metricsBtn: document.getElementById('metrics-btn'),
    metricsPanel: document.getElementById('metrics-panel'),
    metricsClose: document.getElementById('metrics-close'),
    metricsBody: document.getElementById('metrics-body'),
    stationCode: document.getElementById('station-code')
  };

  /* ---------- IndexedDB ---------- */
  function saveMetrics() {
    try {
      const req = indexedDB.open('TechExpo3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'metrics', v: metrics }); };
    } catch (e) { /* silent */ }
  }
  function loadMetrics() {
    try {
      const req = indexedDB.open('TechExpo3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('metrics'); get.onsuccess = () => { if (get.result) metrics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1016);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 15);
    camera.position.set(0, 0.5, 2.5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x334466, 0.3);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.4);
    dir.position.set(2, 3, 2);
    dir.castShadow = true;
    scene.add(dir);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1c24, roughness: 0.7 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.5), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    buildStations();
    buildMapUI();

    /* Live data vis (simple bar) in the scene */
    const barGeo = new THREE.BoxGeometry(0.005, 0.001, 0.005);
    const barMat = new THREE.MeshBasicMaterial({ color: 0x3a7acc });
    for (let i = 0; i < 20; i++) {
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(-0.3 + i * 0.025, 0.001, -0.8);
      bar.scale.y = 0.5 + Math.random() * 2;
      scene.add(bar);
    }
  }

  function buildStations() {
    allStations.forEach((s, idx) => {
      const g = new THREE.Group();
      g.position.set(s.position[0], 0, s.position[2]);

      const color = s.islandColor || 0x3a7acc;
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x22242c, roughness: 0.5 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.14), baseMat);
      base.position.y = 0.01;
      base.castShadow = true;
      g.add(base);

      /* Accent bar */
      const barMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.015), barMat);
      bar.position.set(0, 0.035, -0.07);
      g.add(bar);

      /* Screen */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = s.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const vTex = new THREE.VideoTexture(vid);
      vTex.minFilter = THREE.LinearFilter;
      const vMat = new THREE.MeshBasicMaterial({ map: vTex, transparent: true, opacity: 0.75 });
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.05), vMat);
      scr.position.set(0, 0.06, 0.045);
      g.add(scr);

      /* Label */
      const c = document.createElement('canvas');
      c.width = 96; c.height = 14;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, 96, 14);
      ctx.fillStyle = '#e8e6e0'; ctx.font = '5px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.name, 48, 10);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lM = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.016), lMat);
      lM.position.set(0, -0.015, 0.072);
      g.add(lM);

      g.userData = { idx };
      scene.add(g);
      stationMeshes.push(g);
    });
  }

  /* ---------- Map ---------- */
  function buildMapUI() {
    dom.mapBody.innerHTML = '';
    ISLANDS.forEach(island => {
      const title = document.createElement('div');
      title.className = 'map-island';
      title.textContent = island.name;
      dom.mapBody.appendChild(title);
      island.stations.forEach(s => {
        const idx = allStations.findIndex(st => st.id === s.id);
        const btn = document.createElement('button');
        btn.className = 'map-station';
        btn.textContent = s.name;
        btn.addEventListener('click', () => { dom.mapPanel.classList.add('hidden'); openStation(idx); });
        dom.mapBody.appendChild(btn);
      });
    });
  }

  dom.mapBtn.addEventListener('click', () => dom.mapPanel.classList.toggle('hidden'));
  dom.mapClose.addEventListener('click', () => dom.mapPanel.classList.add('hidden'));

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
    stationMeshes.forEach(g => { g.children.forEach(c => { if (c.isMesh) all.push(c); }); });
    const hits = raycaster.intersectObjects(all);
    if (hits.length) {
      for (let i = 0; i < stationMeshes.length; i++) {
        for (let c = 0; c < stationMeshes[i].children.length; c++) {
          if (hits[0].object === stationMeshes[i].children[c]) {
            openStation(stationMeshes[i].userData.idx);
            return;
          }
        }
      }
    }
  });

  /* ---------- Station overlay ---------- */
  function openStation(idx) {
    activeStationIdx = idx;
    const s = allStations[idx];
    dom.stationVideo.src = s.videoUrl;
    dom.stationVideo.load();
    dom.stationVideo.play().catch(() => {});
    dom.stationInfo.innerHTML =
      `<div class="name">${s.name}</div><div class="cat">${s.island}</div><div class="desc">${s.desc}</div>`;
    dom.stationCodeContent.textContent = s.snippet;
    if (window.Prism) Prism.highlightElement(dom.stationCode);
    dom.stationOverlay.classList.remove('hidden');

    metrics.demosStarted++;
    saveMetrics();

    /* Fly-to */
    const target = new THREE.Vector3(s.position[0], 0.25, s.position[2] + 0.15);
    const lookAt = new THREE.Vector3(s.position[0], 0, s.position[2]);
    if (prefersReducedMotion) { camera.position.copy(target); camera.lookAt(lookAt); }
    else {
      gsap.to(camera.position, { x: target.x, y: target.y, z: target.z, duration: 0.7, ease: 'power2.out',
        onUpdate: () => camera.lookAt(lookAt), onComplete: () => camera.lookAt(lookAt) });
    }

    /* Live vis */
    renderStationVis(s);
  }

  function renderStationVis() {
    dom.stationVis.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 60;
    canvas.style.width = '100%'; canvas.style.height = '100%';
    dom.stationVis.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let frame = 0;
    const anim = () => {
      ctx.fillStyle = '#181a22'; ctx.fillRect(0, 0, 200, 60);
      ctx.fillStyle = '#3a7acc';
      for (let i = 0; i < 20; i++) {
        const h = 10 + Math.sin(frame * 0.05 + i * 0.5) * 15 + 15;
        ctx.fillRect(i * 10, 60 - h, 7, h);
      }
      frame++;
      if (!dom.stationOverlay.classList.contains('hidden')) requestAnimationFrame(anim);
    };
    anim();
  }

  dom.stationClose.addEventListener('click', () => closeStation());
  dom.sandboxBtn.addEventListener('click', () => {
    if (activeStationIdx >= 0) {
      window.open(allStations[activeStationIdx].sandbox, '_blank');
    }
  });

  function closeStation() {
    dom.stationOverlay.classList.add('hidden');
    dom.stationVideo.pause();
    dom.stationVideo.src = '';
    dom.stationVis.innerHTML = '';
  }

  /* ---------- Deep dive ---------- */
  dom.deepdiveOpen.addEventListener('click', () => {
    dom.stationVideo.pause();
    deepDiveActive = true;
    deepDiveStartTime = Date.now();
    dom.deepdivePanel.classList.remove('hidden');

    const logs = [
      '[INFO] Model loaded successfully',
      '[INFO] Inference pipeline initialized',
      '[DEBUG] Batch size: 32',
      '[INFO] Processing frame...',
      '[WARN] Latency spike: 245ms',
      '[INFO] Cache hit ratio: 0.87'
    ];
    dom.deepdiveLogs.innerHTML = logs.map(l => `<div>${l}</div>`).join('');

    const ddm = [
      `RPS: ${Math.floor(Math.random() * 1000 + 500)}`,
      `Latency: ${Math.floor(Math.random() * 80 + 20)}ms`,
      `Memory: ${(Math.random() * 200 + 100).toFixed(0)}MB`,
      `CPU: ${(Math.random() * 40 + 20).toFixed(0)}%`
    ];
    dom.deepdiveMetrics.innerHTML = ddm.map(m => `<div class="ddm">${m}</div>`).join('');
  });

  dom.deepdiveBtn.addEventListener('click', () => {
    dom.deepdivePanel.classList.remove('hidden');
    dom.deepdiveOpen.click();
  });

  dom.deepdiveClose.addEventListener('click', () => {
    dom.deepdivePanel.classList.add('hidden');
    if (deepDiveActive) {
      metrics.deepDiveTime += (Date.now() - deepDiveStartTime) / 1000;
      deepDiveActive = false;
      saveMetrics();
    }
  });

  /* ---------- Metrics ---------- */
  dom.metricsBtn.addEventListener('click', () => {
    dom.metricsPanel.classList.toggle('hidden');
    dom.metricsBody.innerHTML =
      `<div class="row"><span>▶ Demos</span><span>${metrics.demosStarted}</span></div>` +
      `<div class="row"><span>📋 Snippets</span><span>${metrics.snippetsCopied}</span></div>` +
      `<div class="row"><span>🔍 Deep dive</span><span>${Math.round(metrics.deepDiveTime)}s</span></div>`;
  });
  dom.metricsClose.addEventListener('click', () => dom.metricsPanel.classList.add('hidden'));

  /* Copiar snippet */
  document.addEventListener('click', (e) => {
    if (e.target.closest('.station-snippets') && activeStationIdx >= 0) {
      metrics.snippetsCopied++;
      saveMetrics();
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
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadMetrics();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

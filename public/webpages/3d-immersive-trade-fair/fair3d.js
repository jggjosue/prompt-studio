/*
 * fair3d.js — Feria comercial 3D inmersiva
 *
 * Licencias de assets:
 * - Los modelos GLB de stands deben contar con licencia royalty-free (ej. Sketchfab CC-BY, Poly Haven).
 * - Los videos promocionales deben tener autorización expresa del expositor.
 * - Los iconos y thumbnails WebP pueden generarse con herramientas como Squoosh (Apache-2.0).
 *
 * Recomendaciones para compresión de video:
 * - Codec H.265 (HEVC) con perfil Main, bitrate 2-4 Mbps para 1080p.
 * - Segmentos HLS (.m3u8 + .ts) con fragmentos de 6s para streaming adaptativo.
 * - Pre-generar thumbnails WebP a 512px y 1024px para LOD de preview.
 * - Usar FFmpeg: ffmpeg -i input.mp4 -c:v libx265 -preset medium -crf 23 -tag:v hvc1 output.mp4
 *
 * Draco compresión: los GLB deben exportarse con Draco (encoder draco_decoder.js) para reducir
 * el peso del mesh ~60-80%. Tres.js lo carga vía THREE.DRACOLoader si se configura.
 */

(function () {
  'use strict';

  const METADATA_URL = 'assets/metadata.json';

  let scene, camera, renderer, controls;
  let stands = [];
  let standMeshes = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let activeStandIdx = -1;
  let tourActive = false;
  let tourIndex = 0;
  let fallbackActive = false;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let analytics = { plays: {}, timeInStand: {}, demoRequests: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    mapToggle: document.getElementById('map-toggle'),
    mapPanel: document.getElementById('map-panel'),
    mapClose: document.getElementById('map-close'),
    mapBody: document.getElementById('map-body'),
    tourToggle: document.getElementById('tour-toggle'),
    resetCam: document.getElementById('reset-cam'),
    standPanel: document.getElementById('stand-panel'),
    standPanelClose: document.getElementById('stand-panel-close'),
    standVideo: document.getElementById('stand-video'),
    standInfo: document.getElementById('stand-info'),
    standSrt: document.getElementById('stand-srt'),
    demoBtn: document.getElementById('demo-btn'),
    meetingBtn: document.getElementById('meeting-btn'),
    meetingToast: document.getElementById('meeting-toast'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    accessBtn: document.getElementById('access-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbStands: document.getElementById('fb-stands'),
    standVideoWrap: document.querySelector('.stand-video-wrap')
  };

  /* ---------- IndexedDB analytics ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('TradeFair3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* silent */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('TradeFair3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f3f0);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 30);
    camera.position.set(0, 1.8, 4.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    /* Lights */
    const amb = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(amb);
    const hemi = new THREE.HemisphereLight(0xffeedd, 0x889988, 0.5);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(3, 6, 4);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xccddff, 0.15);
    fill.position.set(-3, 2, 2);
    scene.add(fill);

    /* Floor */
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.7, metalness: 0 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Atrium center marker */
    const ringGeo = new THREE.RingGeometry(0.3, 0.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd07a3a, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.001;
    scene.add(ring);

    loadMetadata();
  }

  function loadMetadata() {
    fetch(METADATA_URL)
      .then(r => r.json())
      .then(data => {
        stands = data;
        buildStandMeshes();
        buildMapUI();
      })
      .catch(() => {
        stands = [];
        buildStandMeshes();
      });
  }

  /* ---------- Stand meshes ---------- */
  function buildStandMeshes() {
    standMeshes.forEach(m => scene.remove(m));
    standMeshes = [];

    /* Colors per category */
    const catColors = {
      'Energía': 0x4a8c5a,
      'Realidad Aumentada': 0x5a7aac,
      'Analítica': 0xac7a4a,
      'Infraestructura': 0x5a6a7a,
      'Sostenibilidad': 0x6a9a6a
    };

    stands.forEach((s, idx) => {
      const px = s.position.x;
      const pz = s.position.z;
      const color = catColors[s.category] || 0x7a7a7a;

      const g = new THREE.Group();
      g.position.set(px, 0, pz);

      /* Base */
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xf5f3f0, roughness: 0.6 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.5), baseMat);
      base.position.y = 0.15;
      base.castShadow = true;
      g.add(base);

      /* Branding bar */
      const barMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4 });
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.06), barMat);
      bar.position.y = 0.38;
      bar.position.z = 0;
      g.add(bar);

      /* Label canvas texture */
      const c = document.createElement('canvas');
      c.width = 256; c.height = 28;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, 256, 28);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      const maxChars = 18;
      const label = s.title.length > maxChars ? s.title.slice(0, maxChars - 1) + '…' : s.title;
      ctx.fillText(label, 128, 18);
      const labelTex = new THREE.CanvasTexture(c);
      labelTex.minFilter = THREE.LinearFilter;
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false });
      const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.028), labelMat);
      labelMesh.position.set(0, 0.08, 0.28);
      g.add(labelMesh);

      /* Screen (video texture placeholder) */
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
      const screenMat = new THREE.MeshBasicMaterial({ map: vidTex, transparent: true, opacity: 0.8 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), screenMat);
      screen.position.y = 0.3;
      screen.position.z = 0.05;
      g.add(screen);

      /* Proximity range sphere (invisible) */
      const prox = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      prox.position.y = 0.2;
      g.add(prox);

      g.userData = { idx: idx, marker: null };
      scene.add(g);
      standMeshes.push(g);
    });
  }

  /* ---------- Map UI ---------- */
  function buildMapUI() {
    const cats = {};
    stands.forEach(s => {
      if (!cats[s.category]) cats[s.category] = [];
      cats[s.category].push(s);
    });
    dom.mapBody.innerHTML = '';
    Object.keys(cats).forEach(cat => {
      const div = document.createElement('div');
      div.className = 'map-cat';
      div.innerHTML = `<div class="map-cat-title">${cat}</div>`;
      const inner = document.createElement('div');
      cats[cat].forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'map-hotspot';
        btn.textContent = s.title;
        btn.addEventListener('click', () => flyTo(s));
        inner.appendChild(btn);
      });
      div.appendChild(inner);
      dom.mapBody.appendChild(div);
    });
  }

  dom.mapToggle.addEventListener('click', () => dom.mapPanel.classList.toggle('hidden'));
  dom.mapClose.addEventListener('click', () => dom.mapPanel.classList.add('hidden'));

  /* ---------- Fly-to ---------- */
  function flyTo(stand) {
    dom.mapPanel.classList.add('hidden');
    const target = new THREE.Vector3(stand.position.x, 0.4, stand.position.z + 0.6);
    const lookAt = new THREE.Vector3(stand.position.x, 0, stand.position.z);
    if (prefersReducedMotion) {
      camera.position.copy(target);
      camera.lookAt(lookAt);
      controls && controls.target && controls.target.copy(lookAt);
    } else {
      gsap.to(camera.position, {
        x: target.x, y: target.y, z: target.z,
        duration: 0.9, ease: 'power2.out',
        onUpdate: () => camera.lookAt(lookAt),
        onComplete: () => { if (controls) { controls.target.copy(lookAt); } }
      });
    }
    tourActive = false;
    dom.tourToggle.textContent = '🚀 Tour guiado';
    openStandPanel(findStandIdx(stand.id));
  }

  /* ---------- Tour ---------- */
  dom.tourToggle.addEventListener('click', () => {
    tourActive = !tourActive;
    dom.tourToggle.textContent = tourActive ? '⏹ Detener tour' : '🚀 Tour guiado';
    if (tourActive) {
      tourIndex = 0;
      tourStep();
    }
  });

  function tourStep() {
    if (!tourActive || tourIndex >= stands.length) {
      tourActive = false;
      dom.tourToggle.textContent = '🚀 Tour guiado';
      return;
    }
    const s = stands[tourIndex];
    flyTo(s);
    tourIndex++;
    if (tourActive && tourIndex < stands.length) {
      setTimeout(tourStep, 4000);
    } else {
      tourActive = false;
      dom.tourToggle.textContent = '🚀 Tour guiado';
    }
  }

  dom.resetCam.addEventListener('click', () => {
    tourActive = false;
    dom.tourToggle.textContent = '🚀 Tour guiado';
    const target = new THREE.Vector3(0, 1.8, 4.5);
    const lookAt = new THREE.Vector3(0, 0, 0);
    if (prefersReducedMotion) {
      camera.position.set(0, 1.8, 4.5); camera.lookAt(0, 0, 0);
      if (controls) { controls.target.set(0, 0, 0); }
    } else {
      gsap.to(camera.position, { x: 0, y: 1.8, z: 4.5, duration: 0.9, ease: 'power2.out',
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: () => { if (controls) { controls.target.set(0, 0, 0); } }
      });
    }
  });

  function findStandIdx(id) {
    for (let i = 0; i < stands.length; i++) { if (stands[i].id === id) return i; }
    return 0;
  }

  /* ---------- Raycaster click ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    if (fallbackActive) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(standMeshes, true);
    if (hits.length) {
      for (let i = 0; i < standMeshes.length; i++) {
        if (hits[0].object.parent === standMeshes[i] || hits[0].object === standMeshes[i]) {
          openStandPanel(standMeshes[i].userData.idx);
          return;
        }
      }
    }
  });

  /* ---------- Stand panel ---------- */
  function openStandPanel(idx) {
    activeStandIdx = idx;
    const s = stands[idx];
    dom.standVideo.src = s.demoVideoUrl;
    dom.standVideo.load();
    dom.standVideo.play().catch(() => {});
    dom.standInfo.innerHTML =
      `<div class="cat">${s.category}</div><div class="title">${s.title}</div><div class="contact">📧 ${s.contact}</div>`;
    dom.standSrt.textContent = 'Subtítulos: ' + (s.language === 'es' ? 'Español' : 'Inglés');
    dom.standPanel.classList.remove('hidden');

    analytics.plays[idx] = (analytics.plays[idx] || 0) + 1;
    saveAnalytics();
  }

  dom.standPanelClose.addEventListener('click', () => closeStandPanel());
  dom.demoBtn.addEventListener('click', () => {
    const s = stands[activeStandIdx];
    if (!s) return;
    dom.standVideo.src = s.demoVideoUrl;
    dom.standVideo.load();
    dom.standVideo.play().catch(() => {});
  });
  dom.meetingBtn.addEventListener('click', () => {
    analytics.demoRequests++;
    saveAnalytics();
    dom.meetingToast.classList.remove('hidden');
    setTimeout(() => dom.meetingToast.classList.add('hidden'), 2500);
    /* Mark stand with meeting icon in 3D (add a small red marker) */
    if (activeStandIdx >= 0 && activeStandIdx < standMeshes.length) {
      const g = standMeshes[activeStandIdx];
      if (!g.userData.marker) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0xe04040 }));
        dot.position.y = 0.45;
        dot.position.z = -0.1;
        g.add(dot);
        g.userData.marker = dot;
      }
    }
  });

  function closeStandPanel() {
    dom.standPanel.classList.add('hidden');
    dom.standVideo.pause();
    dom.standVideo.src = '';
  }

  /* ---------- Orbit controls (manual implementation) ---------- */
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let theta = 0; let phi = Math.PI / 3; let radius = 4.5;
  let targetOrigin = new THREE.Vector3(0, 0, 0);

  renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 0) { isDragging = true; dragStart.x = e.clientX; dragStart.y = e.clientY; }
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    theta -= dx * 0.005;
    phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - dy * 0.005));
    dragStart.x = e.clientX; dragStart.y = e.clientY;
    updateCamFromOrbit();
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    radius = Math.max(1.5, Math.min(8, radius + e.deltaY * 0.003));
    updateCamFromOrbit();
  }, { passive: false });

  function updateCamFromOrbit() {
    camera.position.x = targetOrigin.x + radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = targetOrigin.y + radius * Math.cos(phi);
    camera.position.z = targetOrigin.z + radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(targetOrigin);
  }

  /* ---------- Proximity detection ---------- */
  let lastProxIdx = -1;
  function checkProximity() {
    if (!scene || !camera) return;
    let closest = -1;
    let minDist = Infinity;
    standMeshes.forEach((g, i) => {
      const pos = new THREE.Vector3();
      g.getWorldPosition(pos);
      const dist = camera.position.distanceTo(pos);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    if (closest !== lastProxIdx) {
      if (lastProxIdx >= 0) {
        /* Fade out previous screen */
      }
      lastProxIdx = closest;
    }
  }

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const totalPlays = Object.values(analytics.plays).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML =
      `<div class="analytics-row"><span>▶ Reproducciones</span><span>${totalPlays}</span></div>` +
      `<div class="analytics-row"><span>🤝 Reuniones</span><span>${analytics.demoRequests}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D Accessible fallback ---------- */
  dom.accessBtn.addEventListener('click', () => {
    fallbackActive = !fallbackActive;
    dom.fallbackSection.classList.toggle('hidden');
    if (fallbackActive) {
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
      renderer.domElement.style.display = 'none';
      dom.fbStands.innerHTML = '';
      stands.forEach(s => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML =
          `<video controls preload="metadata" src="${s.demoVideoUrl}"></video>` +
          `<div><h3>${s.title}</h3><p>${s.category} · 📧 ${s.contact}</p></div>`;
        dom.fbStands.appendChild(card);
      });
    } else {
      renderer.domElement.style.display = 'block';
      if (!animFrameId) animFrameId = requestAnimationFrame(animate);
    }
  });

  /* ---------- Lifecycle ---------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    else if (!document.hidden && !animFrameId && !fallbackActive) animFrameId = requestAnimationFrame(animate);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId && !fallbackActive) animFrameId = requestAnimationFrame(animate);
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
    if (fallbackActive) return;
    checkProximity();

    /* Subtle floating particles in atrium */
    /* LOD could be implemented by reducing geometry detail based on distance */

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadAnalytics();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    updateCamFromOrbit();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

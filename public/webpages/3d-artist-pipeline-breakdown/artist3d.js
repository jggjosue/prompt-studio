(function () {
  'use strict';

  const WORKS = [
    {
      title: 'Personaje Stylized',
      reelUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      breakdownUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      caption: 'Pipeline: ZBrush → Maya → Substance → UE5',
      nodes: [
        { t: 0.5, label: '🔷 Modeling', detail: 'Retopología en Maya · 12k tris · UVs por ID de material' },
        { t: 2.0, label: '🎨 Texturing', detail: 'Substance Painter · 4K diffuse + roughness + normal' },
        { t: 4.0, label: '💡 Lighting', detail: 'HDRI + 3 point lights · SSS en piel' }
      ],
      settings: { model: { tris: 12480, uvs: 'ID-based' }, textures: { diffuse: '4K PNG', roughness: '4K PNG', normal: '4K PNG' }, lighting: { hdri: 'studio.hdr', points: 3, sss: true } }
    },
    {
      title: 'Escena Arquitectónica',
      reelUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      breakdownUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      caption: 'Pipeline: Blender → UE5 → DaVinci Resolve',
      nodes: [
        { t: 1.0, label: '🏗️ Blockout', detail: 'Blender · Escala 1:1 · Referencias de obra' },
        { t: 3.0, label: '🧱 Materials', detail: 'Tileable textures · PBR metalness workflow' },
        { t: 5.5, label: '🎥 Postprocessing', detail: 'LUT · Bloom · DOF · Color grading' }
      ],
      settings: { software: { modeling: 'Blender 4.0', engine: 'UE5.3', grading: 'DaVinci Resolve' }, materials: { workflow: 'PBR metalness', texel: '1024px/m' }, postfx: { bloom: true, dof: true, lut: 'cinematic.cube' } }
    },
    {
      title: 'FX Simulación',
      reelUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      breakdownUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      caption: 'Pipeline: Houdini → Nuke → AE',
      nodes: [
        { t: 1.5, label: '💨 Simulation', detail: 'Houdini FLIP · 2M partículas · 120 frames' },
        { t: 4.0, label: '🎞️ Compositing', detail: 'Nuke · Deep compositing · Motion blur' },
        { t: 6.0, label: '🎬 Final', detail: 'AE · Color correction + grain' }
      ],
      settings: { simulation: { software: 'Houdini 20', type: 'FLIP', particles: 2000000 }, composite: { software: 'Nuke 15', passes: ['beauty', 'depth', 'motion'] }, finish: { software: 'After Effects 2025', grain: 'film_grain_8mm' } }
    }
  ];

  const PEDESTAL_W = 0.5, PEDESTAL_H = 0.35;
  const SPACING = 0.75;
  const START_X = -((WORKS.length - 1) * SPACING) / 2;

  let scene, camera, renderer;
  let workGroups = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let currentBreakdownVideo = null;
  let comparisonVideo = null;

  let analytics = { views: {}, exports: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    breakdownPanel: document.getElementById('breakdown-panel'),
    breakdownClose: document.getElementById('breakdown-close'),
    breakdownVideo: document.getElementById('breakdown-video'),
    breakdownMeta: document.getElementById('breakdown-meta'),
    breakdownOverlays: document.getElementById('breakdown-overlays'),
    breakdownParams: document.getElementById('breakdown-params'),
    exportSettingsBtn: document.getElementById('export-settings-btn'),
    compareBtn: document.getElementById('compare-btn'),
    comparePanel: document.getElementById('compare-panel'),
    compareClose: document.getElementById('compare-close'),
    compareGrid: document.getElementById('compare-grid'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbWorks: document.getElementById('fb-works')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('Artist3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('Artist3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12121a);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 20);
    camera.position.set(0, 0.3, 2.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x222244, 0.4);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0x4444aa, 0.3);
    key.position.set(2, 4, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xaa44aa, 0.15);
    fill.position.set(-2, 1, 2);
    scene.add(fill);

    buildPedestals();
  }

  function buildPedestals() {
    workGroups.forEach(g => scene.remove(g));
    workGroups = [];

    WORKS.forEach((w, idx) => {
      const x = START_X + idx * SPACING;
      const g = new THREE.Group();
      g.position.set(x, 0, 0);

      /* Pedestal */
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.4, metalness: 0.2, emissive: 0x0a0a1a });
      const base = new THREE.Mesh(new THREE.BoxGeometry(PEDESTAL_W, 0.04, PEDESTAL_H), baseMat);
      base.position.y = -0.15;
      g.add(base);

      /* Stem */
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, metalness: 0.3, roughness: 0.3 });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 10), stemMat);
      stem.position.y = -0.07;
      g.add(stem);

      /* Frame */
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, metalness: 0.4, roughness: 0.3 });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.02), frameMat);
      frame.position.y = 0.08;
      g.add(frame);

      /* Video texture */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = w.reelUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      const sMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.17), sMat);
      screen.position.set(0, 0.08, 0.012);
      g.add(screen);

      /* Label */
      const c = document.createElement('canvas');
      c.width = 256; c.height = 22;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 256, 22);
      ctx.fillStyle = '#e8e6ee';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(w.title, 128, 15);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.022), lMat);
      lMesh.position.set(0, -0.02, 0.015);
      g.add(lMesh);

      g.userData = { idx: idx, origX: x };
      scene.add(g);
      workGroups.push(g);
    });
  }

  /* ---------- Click to open breakdown ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    workGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < workGroups.length; i++) {
        for (let j = 0; j < workGroups[i].children.length; j++) {
          if (hits[0].object === workGroups[i].children[j]) { openBreakdown(workGroups[i].userData.idx); return; }
        }
      }
    }
  });

  function openBreakdown(idx) {
    const w = WORKS[idx];
    currentBreakdownVideo = dom.breakdownVideo;
    currentBreakdownVideo.src = w.breakdownUrl;
    currentBreakdownVideo.load();
    currentBreakdownVideo.play().catch(() => {});
    dom.breakdownMeta.textContent = `${w.title} — ${w.caption}`;
    dom.breakdownParams.textContent = JSON.stringify(w.settings, null, 2);

    dom.breakdownVideo.addEventListener('timeupdate', syncNodeOverlay);
    syncNodeOverlay(); /* initial */

    dom.breakdownPanel.classList.remove('hidden');

    analytics.views[idx] = (analytics.views[idx] || 0) + 1;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 1.8, duration: 0.5 });
    } else {
      camera.position.z = 1.8;
    }
  }

  function syncNodeOverlay() {
    if (!currentBreakdownVideo || !currentBreakdownVideo.duration) return;
    const t = currentBreakdownVideo.currentTime;
    const idx = workGroups.find(g => g.userData) ? workGroups[0].userData.idx : 0;
    /* Find which breakdown panel is shown */
    const activeNodes = WORKS.find(w => dom.breakdownMeta.textContent.includes(w.title));
    if (activeNodes) {
      const node = activeNodes.nodes.find(n => Math.abs(n.t - t) < 1.0);
      dom.breakdownOverlays.textContent = node ? `${node.label}: ${node.detail}` : '⏳ Procesando…';
    }
  }

  dom.breakdownClose.addEventListener('click', () => {
    dom.breakdownPanel.classList.add('hidden');
    if (currentBreakdownVideo) {
      currentBreakdownVideo.pause();
      currentBreakdownVideo.removeEventListener('timeupdate', syncNodeOverlay);
    }
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 2.8, duration: 0.4 });
    } else {
      camera.position.z = 2.8;
    }
  });

  /* ---------- Export settings ---------- */
  dom.exportSettingsBtn.addEventListener('click', () => {
    const params = dom.breakdownParams.textContent;
    const blob = new Blob([params], { type: 'application/json' });
    const a = document.createElement('a');
    a.download = 'settings.json';
    a.href = URL.createObjectURL(blob);
    a.click();
    analytics.exports++;
    saveAnalytics();
  });

  /* ---------- Compare before/after ---------- */
  dom.compareBtn.addEventListener('click', () => {
    dom.comparePanel.classList.toggle('hidden');
    if (!dom.comparePanel.classList.contains('hidden')) {
      dom.compareGrid.innerHTML = `
        <div class="compare-card">
          <video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" muted loop autoplay playsinline></video>
          <div class="label">Antes (blockout)</div>
        </div>
        <div class="compare-card">
          <video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" muted loop autoplay playsinline></video>
          <div class="label">Después (final)</div>
        </div>`;
    }
  });
  dom.compareClose.addEventListener('click', () => dom.comparePanel.classList.add('hidden'));

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const total = Object.values(analytics.views).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Breakdowns</span><span>${total}</span></div>
      <div class="analytics-row"><span>📥 JSON export</span><span>${analytics.exports}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      dom.fbWorks.innerHTML = '';
      WORKS.forEach((w) => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `<video controls preload="metadata" src="${w.breakdownUrl}"></video><div><h3>${w.title}</h3><p>${w.caption}</p></div>`;
        dom.fbWorks.appendChild(card);
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
    workGroups.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.rotation.y = Math.sin(t * 0.08 + i * 0.5) * 0.02;
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

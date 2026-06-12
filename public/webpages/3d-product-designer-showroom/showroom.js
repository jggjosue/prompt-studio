(function () {
  'use strict';

  const VARIANTS = [
    { name: 'Blanco', color: 0xf0ece4, roughness: 0.3, metalness: 0.1 },
    { name: 'Negro', color: 0x2a2a3e, roughness: 0.4, metalness: 0.3 },
    { name: 'Madera', color: 0x8a7a5a, roughness: 0.7, metalness: 0.0 }
  ];

  const HOTSPOTS = [
    { id: 'materiales', title: 'Materiales', desc: 'Aluminio anodizado con acabado satinado. Base de polímero reciclado.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { id: 'dimensiones', title: 'Dimensiones', desc: '240 × 120 × 45 mm. Peso 380 g. Pack: 180 × 100 × 60 mm.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
    { id: 'proceso', title: 'Proceso', desc: 'Diseño conceptual → prototipado → impresión 3D → molde → producción.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
  ];

  const PROMO_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const HOTSPOT_POSITIONS = [
    { angle: 0, y: 0.2 },
    { angle: Math.PI * 0.7, y: 0.3 },
    { angle: Math.PI * 1.4, y: 0.2 }
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    variantBtns: document.querySelectorAll('.variant-btn'),
    hotspotPanel: document.getElementById('hotspot-panel'),
    panelClose: document.getElementById('panel-close'),
    panelTitle: document.getElementById('panel-title'),
    panelVideo: document.getElementById('panel-video'),
    panelDesc: document.getElementById('panel-desc'),
    detailBtn: document.getElementById('detail-btn'),
    playBtn: document.getElementById('play-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let pedestal, productGroup, productMeshes = [];
  let screenMesh, promoVideo;
  let hotspotGroups = [];
  let currentVariant = 0;
  let isDetail = false;
  let isMobile = window.innerWidth < 768;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let rotY = 0, targetRotY = 0;
  let isDragging = false, prevX = 0, velocity = 0;
  let lastTap = 0;

  let analytics = { plays: {}, macroTime: 0, hotspotClicks: {} };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Storage ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('ProductShowroom', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { console.warn('IDB error', e); }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('ProductShowroom', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* ignore */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ece4);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 30);
    camera.position.set(0, 0.8, 2.8);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.9);
    key.position.set(3, 4, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.2);
    fill.position.set(-2, 1, -3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.15);
    rim.position.set(-1, 1, -2);
    scene.add(rim);

    /* Marble floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.15, metalness: 0.05 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Wall */
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.8 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3), wallMat);
    wall.position.set(0, 1.2, -3);
    scene.add(wall);

    /* Pedestal */
    const pedGroup = new THREE.Group();
    const pMat = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.2, metalness: 0.05 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.05, 32), pMat);
    base.position.y = -0.28;
    base.receiveShadow = true;
    pedGroup.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.1, 32), pMat);
    stem.position.y = -0.2;
    stem.castShadow = true;
    pedGroup.add(stem);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.04, 32), pMat);
    top.position.y = -0.13;
    pedGroup.add(top);
    scene.add(pedGroup);
    pedestal = pedGroup;

    /* Product */
    productGroup = new THREE.Group();
    productGroup.position.y = -0.1;
    buildProduct(VARIANTS[0]);
    scene.add(productGroup);

    /* Screen in base for promo video */
    const screenBg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.25, 0.14),
      new THREE.MeshBasicMaterial({ color: 0x222222 })
    );
    screenBg.position.set(0, -0.08, 0.301);
    productGroup.add(screenBg);

    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.src = PROMO_VIDEO;
    vid.loop = true;
    vid.muted = true;
    vid.preload = 'auto';
    vid.load();
    vid.play().catch(() => {});
    promoVideo = vid;
    const tex = new THREE.VideoTexture(vid);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    const sMat = new THREE.MeshBasicMaterial({ map: tex });
    screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.12), sMat);
    screenMesh.position.set(0, -0.08, 0.302);
    productGroup.add(screenMesh);

    /* Hotspots */
    HOTSPOTS.forEach((hs, idx) => {
      const pos = HOTSPOT_POSITIONS[idx];
      const g = new THREE.Group();
      const radius = 0.5;
      g.position.set(Math.cos(pos.angle) * radius, pos.y, Math.sin(pos.angle) * radius);

      const dotMat = new THREE.MeshBasicMaterial({ color: 0x8a7a6a });
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), dotMat);
      g.add(dot);

      const ringMat = new THREE.MeshBasicMaterial({ color: 0x8a7a6a, transparent: true, opacity: 0.25 });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.035, 16), ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      g.add(ring);
      g.userData = { hotspotIdx: idx, ring };

      scene.add(g);
      hotspotGroups.push(g);
    });
  }

  function buildProduct(variant) {
    while (productGroup.children.length > 0) {
      const c = productGroup.children[0];
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
      productGroup.remove(c);
    }
    productMeshes = [];

    const mat = new THREE.MeshStandardMaterial({
      color: variant.color, roughness: variant.roughness, metalness: variant.metalness
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.06), mat);
    body.position.y = 0.04;
    body.castShadow = true;
    productGroup.add(body);
    productMeshes.push(body);

    const topMat = mat.clone();
    topMat.color.setHex(variant.color);
    const topPiece = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 16), topMat);
    topPiece.position.y = 0.1;
    topPiece.castShadow = true;
    productGroup.add(topPiece);
    productMeshes.push(topPiece);
  }

  function setVariant(idx) {
    currentVariant = idx;
    const v = VARIANTS[idx];
    const oldColor = new THREE.Color(VARIANTS[currentVariant === idx ? idx : 0].color);
    const newColor = new THREE.Color(v.color);
    if (!prefersReducedMotion) {
      productMeshes.forEach((m) => {
        gsap.to(m.material.color, { r: newColor.r, g: newColor.g, b: newColor.b, duration: 0.3 });
        gsap.to(m.material, { roughness: v.roughness, metalness: v.metalness, duration: 0.3 });
      });
    } else {
      productMeshes.forEach((m) => {
        m.material.color.copy(newColor);
        m.material.roughness = v.roughness;
        m.material.metalness = v.metalness;
      });
    }
    analytics.plays[idx] = (analytics.plays[idx] || 0) + 1;
    saveAnalytics();
  }

  dom.variantBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.variantBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setVariant(parseInt(btn.dataset.variant));
    });
  });

  /* ---------- Camera detail ---------- */
  dom.detailBtn.addEventListener('click', () => {
    isDetail = !isDetail;
    dom.detailBtn.textContent = isDetail ? '🔍 Alejar' : '🔍 Ver detalle';
    if (isDetail) analytics.macroTime = Date.now();
    else analytics.macroTime = Math.round((Date.now() - analytics.macroTime) / 1000);
    saveAnalytics();
    const pos = isDetail ? { z: 1.4, y: 0.5 } : { z: 2.8, y: 0.8 };
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: pos.z, y: pos.y, duration: 0.8, ease: 'power2.out' });
    } else {
      camera.position.set(0, pos.y, pos.z);
    }
  });

  dom.playBtn.addEventListener('click', () => {
    if (promoVideo) {
      if (promoVideo.paused) { promoVideo.play().catch(() => {}); dom.playBtn.textContent = '⏸'; }
      else { promoVideo.pause(); dom.playBtn.textContent = '▶'; }
    }
  });

  /* ---------- Drag ---------- */
  renderer.domElement.addEventListener('pointerdown', (e) => {
    isDragging = true; prevX = e.clientX; velocity = 0;
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    velocity = dx * 0.005;
    targetRotY += velocity;
    if (isMobile) targetRotY = Math.max(-Math.PI, Math.min(0, targetRotY));
    prevX = e.clientX;
  });
  window.addEventListener('pointerup', () => { isDragging = false; });

  /* Mobile double-tap for macro */
  renderer.domElement.addEventListener('click', (e) => {
    if (!isMobile) return;
    const now = Date.now();
    if (now - lastTap < 300) { dom.detailBtn.click(); lastTap = 0; }
    else lastTap = now;

    /* Hotspot click detection */
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    hotspotGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < hotspotGroups.length; i++) {
        for (let j = 0; j < hotspotGroups[i].children.length; j++) {
          if (hits[0].object === hotspotGroups[i].children[j]) { activateHotspot(i); return; }
        }
      }
    }
  });

  /* Desktop: click for hotspots */
  if (!isMobile) {
    renderer.domElement.addEventListener('click', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);
      const meshes = [];
      hotspotGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length) {
        for (let i = 0; i < hotspotGroups.length; i++) {
          for (let j = 0; j < hotspotGroups[i].children.length; j++) {
            if (hits[0].object === hotspotGroups[i].children[j]) { activateHotspot(i); return; }
          }
        }
      }
    });
  }

  function activateHotspot(idx) {
    const hs = HOTSPOTS[idx];
    dom.panelTitle.textContent = hs.title;
    dom.panelVideo.src = hs.videoUrl;
    dom.panelVideo.load();
    dom.panelVideo.play().catch(() => {});
    dom.panelDesc.textContent = hs.desc;
    dom.hotspotPanel.classList.remove('hidden');
    analytics.hotspotClicks[idx] = (analytics.hotspotClicks[idx] || 0) + 1;
    saveAnalytics();
  }

  dom.panelClose.addEventListener('click', () => {
    dom.hotspotPanel.classList.add('hidden');
    dom.panelVideo.pause();
  });

  /* ---------- Analytics ---------- */
  dom.analyticsPanel.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    renderAnalytics();
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  function renderAnalytics() {
    let html = '<div class="analytics-row"><span>Métrica</span><span>Valor</span></div>';
    html += `<div class="analytics-row"><span>Reproducciones</span><span>${Object.values(analytics.plays).reduce((a, b) => a + b, 0)}</span></div>`;
    html += `<div class="analytics-row"><span>Tiempo macro</span><span>${analytics.macroTime || 0}s</span></div>`;
    const hsTotal = Object.values(analytics.hotspotClicks).reduce((a, b) => a + b, 0);
    html += `<div class="analytics-row"><span>Hotspot clicks</span><span>${hsTotal}</span></div>`;
    dom.analyticsBody.innerHTML = html;
  }

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = `
      <div class="fb-card"><video controls preload="metadata" src="${PROMO_VIDEO}"></video><div><h3>Video Promocional</h3><p>Showroom producto · 3 variantes disponibles</p></div></div>
      <div class="fb-card" style="flex-direction:column"><h3>Variantes</h3><p>Blanco · Negro · Madera — Cambia texturas PBR en tiempo real.</p><p>Hotspots: Materiales, Dimensiones, Proceso.</p></div>`;
  });

  /* ---------- Modal ---------- */
  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
  dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

  /* ---------- Lifecycle ---------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; promoVideo?.pause(); }
    else if (!document.hidden && !animFrameId) { animFrameId = requestAnimationFrame(animate); promoVideo?.play().catch(() => {}); }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId) animFrameId = requestAnimationFrame(animate);
      else if (!entry.isIntersecting && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; promoVideo?.pause(); }
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

    if (!isDragging && !prefersReducedMotion) {
      targetRotY += dt * 0.1;
    }
    if (!prefersReducedMotion) {
      rotY += (targetRotY - rotY) * 0.06;
      productGroup.rotation.y = rotY;
      pedestal.rotation.y = rotY;

      hotspotGroups.forEach((g, i) => {
        g.position.y = HOTSPOT_POSITIONS[i].y + Math.sin(t * 0.5 + i) * 0.005;
        if (g.userData.ring) {
          g.userData.ring.scale.setScalar(1 + Math.sin(t * 1.2 + i) * 0.1);
          g.userData.ring.material.opacity = 0.15 + Math.sin(t * 1.5 + i) * 0.1;
        }
      });
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

(function () {
  'use strict';

  const ARTWORKS = [
    { title: 'Retrato Digital', tech: 'digital', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', caption: 'Timelapse: 45 min de render digital. Capas: sketch → lineart → color.', layers: { sketch: '#e8d8c8', lineart: '#2a2a2e', color: '#b45a6a' } },
    { title: 'Paisaje Acuarela', tech: 'acuarela', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', caption: 'Acuarela tradicional digitalizada. 3 horas de trabajo.', layers: { sketch: '#d8d0c0', lineart: '#4a3a2a', color: '#6a8a5a' } },
    { title: 'Personaje Lineart', tech: 'lineart', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', caption: 'Lineart limpio con tinta digital. Proceso paso a paso.', layers: { sketch: '#f0ece4', lineart: '#1a1a2e', color: '#8a7a6a' } },
    { title: 'Ilustración Fantasía', tech: 'digital', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', caption: 'Escena de fantasía con iluminación atmosférica.', layers: { sketch: '#e0d8cc', lineart: '#3a2a4a', color: '#4a6a8a' } },
    { title: 'Bodegón Acuarela', tech: 'acuarela', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', caption: 'Bodegón clásico con técnica húmeda sobre seco.', layers: { sketch: '#d8d4c8', lineart: '#5a4a3a', color: '#8a6a4a' } },
    { title: 'Retrato Lineart', tech: 'lineart', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', caption: 'Retrato minimalista con líneas expresivas.', layers: { sketch: '#ece8e0', lineart: '#1a1a2e', color: '#7a5a6a' } }
  ];

  const GRID_COLS = 3;
  const PANEL_W = 0.45, PANEL_H = 0.3;
  const SPACING_X = 0.65, SPACING_Y = 0.45;
  const START_X = -((GRID_COLS - 1) * SPACING_X) / 2;

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    macroView: document.getElementById('macro-view'),
    macroClose: document.getElementById('macro-close'),
    macroTitle: document.getElementById('macro-title'),
    macroVideo: document.getElementById('macro-video'),
    macroScrub: document.getElementById('macro-scrub'),
    macroCaption: document.getElementById('macro-caption'),
    layerToggles: document.querySelectorAll('#layer-toggles input'),
    exportFrameBtn: document.getElementById('export-frame-btn'),
    analyticsBtn: document.getElementById('analytics-btn'),
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
  let panelGroups = [];
  let currentFilter = 'all';
  let currentArtIdx = null;
  let videoTextures = [];
  let layerState = { sketch: true, lineart: true, color: true };
  let animFrameId = null;
  let clock = new THREE.Clock();

  let analytics = { plays: {}, exports: 0 };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Storage ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('IllustratorGallery', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { console.warn('IDB error', e); }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('IllustratorGallery', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* ignore */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f4);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 0.2, 2.5);
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.6);
    key.position.set(1, 3, 2);
    scene.add(key);

    buildGrid();
  }

  function buildGrid() {
    panelGroups.forEach(g => scene.remove(g));
    panelGroups = [];
    videoTextures.forEach(v => { v.pause(); v.src = ''; });
    videoTextures = [];

    const filtered = ARTWORKS.filter((a, i) => currentFilter === 'all' || a.tech === currentFilter);
    const rowLen = GRID_COLS;

    filtered.forEach((art, idx) => {
      const col = idx % rowLen;
      const row = Math.floor(idx / rowLen);
      const x = START_X + col * SPACING_X;
      const y = 0.15 - row * SPACING_Y;

      const g = new THREE.Group();
      g.position.set(x, y, 0);

      /* Panel background */
      const panelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.05, transparent: true, opacity: 0.9 });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), panelMat);
      panel.position.z = -0.001;
      g.add(panel);

      /* Video texture */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = art.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      const sMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W * 0.88, PANEL_H * 0.82), sMat);
      screen.position.z = 0.002;
      g.add(screen);
      videoTextures.push(vid);

      /* Title label (canvas texture) */
      const c = document.createElement('canvas');
      c.width = 256; c.height = 28;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 256, 28);
      ctx.fillStyle = '#fff';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(art.title, 128, 18);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W * 0.7, 0.035), lMat);
      lMesh.position.set(0, -PANEL_H / 2 + 0.025, 0.003);
      g.add(lMesh);

      g.userData = { artIdx: ARTWORKS.indexOf(art), origY: y };
      scene.add(g);
      panelGroups.push(g);
    });
  }

  /* ---------- Hover / approach ---------- */
  renderer.domElement.addEventListener('pointermove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    panelGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);

    panelGroups.forEach((g, i) => {
      let hit = false;
      for (let j = 0; j < g.children.length; j++) {
        if (hits.length && hits[0].object === g.children[j]) { hit = true; break; }
      }
      const targetY = hit ? g.userData.origY + 0.02 : g.userData.origY;
      const targetZ = hit ? 0.05 : 0;
      if (!prefersReducedMotion) {
        gsap.to(g.position, { y: targetY, z: targetZ, duration: 0.3 });
      } else {
        g.position.y = targetY; g.position.z = targetZ;
      }
    });
  });

  /* ---------- Click for macro ---------- */
  renderer.domElement.addEventListener('dblclick', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    panelGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < panelGroups.length; i++) {
        for (let j = 0; j < panelGroups[i].children.length; j++) {
          if (hits[0].object === panelGroups[i].children[j]) { openMacro(panelGroups[i].userData.artIdx); return; }
        }
      }
    }
  });

  /* ---------- Macro zoom ---------- */
  function openMacro(idx) {
    currentArtIdx = idx;
    const art = ARTWORKS[idx];
    dom.macroTitle.textContent = art.title;
    dom.macroVideo.src = art.videoUrl;
    dom.macroVideo.load();
    dom.macroVideo.play().catch(() => {});
    dom.macroCaption.textContent = art.caption;
    dom.macroView.classList.remove('hidden');

    analytics.plays[idx] = (analytics.plays[idx] || 0) + 1;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 1.2, y: 0.5, duration: 0.5 });
    } else {
      camera.position.set(0, 0.5, 1.2);
    }
  }

  dom.macroClose.addEventListener('click', closeMacro);
  function closeMacro() {
    dom.macroView.classList.add('hidden');
    dom.macroVideo.pause();
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 2.5, y: 0.2, duration: 0.4 });
    } else {
      camera.position.set(0, 0.2, 2.5);
    }
  }

  /* Macro scrub */
  dom.macroScrub.addEventListener('input', (e) => {
    const pct = parseInt(e.target.value) / 1000;
    if (dom.macroVideo.duration) {
      dom.macroVideo.currentTime = pct * dom.macroVideo.duration;
    }
  });
  dom.macroVideo.addEventListener('timeupdate', () => {
    if (dom.macroVideo.duration) {
      dom.macroScrub.value = Math.round((dom.macroVideo.currentTime / dom.macroVideo.duration) * 1000);
    }
  });

  /* Layer toggles */
  dom.layerToggles.forEach((cb) => {
    cb.addEventListener('change', () => {
      layerState[cb.dataset.layer] = cb.checked;
      applyLayers();
    });
  });

  function applyLayers() {
    if (currentArtIdx == null) return;
    /* Simulate layer blending via CSS overlay div */
    const art = ARTWORKS[currentArtIdx];
    dom.macroCaption.textContent = art.caption + (layerState.sketch && layerState.lineart && layerState.color ? ' (todas las capas activas)' : ' (capas: ' + Object.entries(layerState).filter(([, v]) => v).map(([k]) => k).join(', ') + ')');
  }

  /* Export frame */
  dom.exportFrameBtn.addEventListener('click', () => {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = `ilustracion-${currentArtIdx}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
    analytics.exports++;
    saveAnalytics();
  });

  /* ---------- Filters ---------- */
  dom.filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      rebuildGridAnimated();
    });
  });

  function rebuildGridAnimated() {
    if (!prefersReducedMotion) {
      gsap.to(panelGroups.map(g => g.position), { y: -1.5, duration: 0.3, stagger: 0.03, onComplete: () => {
        buildGrid();
        panelGroups.forEach((g, i) => {
          g.position.y = -1.5;
          gsap.to(g.position, { y: g.userData.origY, duration: 0.4, delay: i * 0.04, ease: 'backOut(1.2)' });
        });
      }});
    } else {
      buildGrid();
    }
  }

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    renderAnalytics();
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  function renderAnalytics() {
    const totalPlays = Object.values(analytics.plays).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>Reproducciones</span><span>${totalPlays}</span></div>
      <div class="analytics-row"><span>Frames exportados</span><span>${analytics.exports}</span></div>`;
  }

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    ARTWORKS.forEach((a) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${a.videoUrl}"></video><div><h3>${a.title}</h3><p>${a.tech} · ${a.caption}</p></div>`;
      dom.fbGrid.appendChild(card);
    });
  });

  /* ---------- Modal ---------- */
  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
  dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

  /* ---------- Lifecycle ---------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; videoTextures.forEach(v => v.pause()); }
    else if (!document.hidden && !animFrameId) { animFrameId = requestAnimationFrame(animate); videoTextures.forEach(v => v.play().catch(() => {})); }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId) animFrameId = requestAnimationFrame(animate);
      else if (!entry.isIntersecting && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; videoTextures.forEach(v => v.pause()); }
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
    panelGroups.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.rotation.y = Math.sin(t * 0.12 + i * 0.4) * 0.02;
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

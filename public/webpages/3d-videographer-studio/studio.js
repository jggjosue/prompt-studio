(function () {
  'use strict';

  const REELS = [
    { title: 'Spot Comercial · Café', duration: 15, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', subs: '[00:00] Amanecer en la finca\n[00:05] Tueste artesanal\n[00:10] La taza perfecta', meta: { cam: 'Sony FX6', lens: '24-70 f/2.8', settings: '4K 24fps, S-Log3', bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' } },
    { title: 'Boda · María & Juan', duration: 20, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', subs: '[00:00] Ceremonia\n[00:07] Primer baile\n[00:14] Discurso emocionante', meta: { cam: 'Canon R5', lens: '50 f/1.2', settings: '4K 60fps, C-Log', bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' } },
    { title: 'Corporativo · TechCorp', duration: 18, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', subs: '[00:00] Oficina central\n[00:06] Equipo de desarrollo\n[00:12] Cliente final', meta: { cam: 'RED Komodo', lens: '35 f/1.8', settings: '6K 24fps, R3D', bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' } },
    { title: 'Deporte · Trail Run', duration: 12, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', subs: '[00:00] Salida\n[00:04] Montaña\n[00:08] Meta', meta: { cam: 'DJI Pocket 3', lens: 'Integrado', settings: '4K 120fps, D-Log', bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' } },
    { title: 'Entrevista · Artista', duration: 25, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', subs: '[00:00] Introducción\n[00:08] Proceso creativo\n[00:18] Mensaje final', meta: { cam: 'Sony A7S III', lens: '85 f/1.4', settings: '4K 24fps, S-Log3', bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' } }
  ];

  const REEL_POSITIONS = (() => {
    const count = REELS.length;
    const radius = 2.5;
    const startAngle = -Math.PI * 0.4;
    const endAngle = Math.PI * 0.4;
    return REELS.map((_, i) => {
      const t = count > 1 ? startAngle + (endAngle - startAngle) * (i / (count - 1)) : 0;
      return { x: Math.sin(t) * radius, z: -Math.cos(t) * radius + 1.5, rot: t };
    });
  })();

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    timelineTrack: document.getElementById('timeline-track'),
    timelineThumb: document.getElementById('timeline-thumb'),
    timelineLabels: document.getElementById('timeline-labels'),
    monitorPanel: document.getElementById('monitor-panel'),
    panelClose: document.getElementById('panel-close'),
    panelTitle: document.getElementById('panel-title'),
    panelVideo: document.getElementById('panel-video'),
    panelSubs: document.getElementById('panel-subs'),
    directorBtn: document.getElementById('director-btn'),
    directorPanel: document.getElementById('director-panel'),
    directorClose: document.getElementById('director-close'),
    directorBody: document.getElementById('director-body'),
    sessionBtn: document.getElementById('session-btn'),
    sessionPanel: document.getElementById('session-panel'),
    sessionClips: document.getElementById('session-clips'),
    sessionPreview: document.getElementById('session-preview'),
    sessionExport: document.getElementById('session-export'),
    sessionClose: document.getElementById('session-close'),
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
  let monitorMeshes = [];
  let videoTextures = [];
  let currentReel = 0;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let cameraTargetZ = 0;
  let selectedClips = [];

  let analytics = { views: {}, totalTime: 0, compilations: 0 };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Storage ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('VideographerStudio', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { console.warn('IDB error', e); }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('VideographerStudio', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* ignore */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xece8e2);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 30);
    camera.position.set(0, 0.8, 2.5);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.7);
    key.position.set(1, 3, 2);
    key.castShadow = true;
    scene.add(key);

    /* Floor */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 8),
      new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Curved wall structure */
    REELS.forEach((reel, idx) => {
      const pos = REEL_POSITIONS[idx];
      const g = new THREE.Group();
      g.position.set(pos.x, 0.1, pos.z);
      g.rotation.y = -pos.rot;

      /* Monitor frame */
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.4, metalness: 0.2 });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.02), frameMat);
      frame.position.z = -0.01;
      g.add(frame);

      /* Video screen */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = reel.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      const sMat = new THREE.MeshBasicMaterial({ map: tex });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.19), sMat);
      screen.position.z = 0.002;
      g.add(screen);
      videoTextures.push(vid);

      /* Title label plane */
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, 256, 32);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(reel.title, 128, 20);
      const labelTex = new THREE.CanvasTexture(canvas);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false });
      const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.04), labelMat);
      labelMesh.position.set(0, -0.12, 0.003);
      g.add(labelMesh);

      g.userData = { reelIdx: idx };
      scene.add(g);
      monitorMeshes.push(g);
    });

    buildTimeline();
  }

  /* ---------- Timeline ---------- */
  function buildTimeline() {
    dom.timelineLabels.innerHTML = REELS.map((r) => `<span>${r.title.slice(0, 12)}</span>`).join('');
    dom.timelineTrack.addEventListener('click', (e) => {
      const rect = dom.timelineTrack.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const idx = Math.min(REELS.length - 1, Math.max(0, Math.round(pct * (REELS.length - 1))));
      selectReel(idx);
    });
  }

  function selectReel(idx) {
    currentReel = idx;
    const pct = REELS.length > 1 ? idx / (REELS.length - 1) : 0;
    dom.timelineThumb.style.left = `${pct * 100}%`;

    /* Camera lateral movement */
    const pos = REEL_POSITIONS[idx];
    cameraTargetZ = pos.z;
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { x: pos.x * 0.4, z: pos.z * 0.4 + 1.5, duration: 0.6, ease: 'power2.out' });
    } else {
      camera.position.set(pos.x * 0.4, 0.8, pos.z * 0.4 + 1.5);
    }

    /* Highlight monitor */
    monitorMeshes.forEach((m, i) => {
      const s = i === idx ? 1.12 : 1;
      if (!prefersReducedMotion) gsap.to(m.scale, { x: s, y: s, z: s, duration: 0.3 });
      else m.scale.set(s, s, s);
    });

    openMonitorPanel(idx);
    analytics.views[idx] = (analytics.views[idx] || 0) + 1;
    saveAnalytics();
  }

  /* ---------- Monitor panel ---------- */
  function openMonitorPanel(idx) {
    const reel = REELS[idx];
    dom.panelTitle.textContent = reel.title;
    dom.panelVideo.src = reel.videoUrl;
    dom.panelVideo.load();
    dom.panelVideo.play().catch(() => {});
    dom.panelSubs.textContent = reel.subs;
    dom.monitorPanel.classList.remove('hidden');
  }

  dom.panelClose.addEventListener('click', () => {
    dom.monitorPanel.classList.add('hidden');
    dom.panelVideo.pause();
  });

  /* Click on monitors */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    monitorMeshes.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < monitorMeshes.length; i++) {
        for (let j = 0; j < monitorMeshes[i].children.length; j++) {
          if (hits[0].object === monitorMeshes[i].children[j]) { selectReel(i); return; }
        }
      }
    }
  });

  /* ---------- Director mode ---------- */
  dom.directorBtn.addEventListener('click', () => {
    dom.directorPanel.classList.toggle('hidden');
    if (!dom.directorPanel.classList.contains('hidden')) renderDirector();
  });
  dom.directorClose.addEventListener('click', () => dom.directorPanel.classList.add('hidden'));

  function renderDirector() {
    const reel = REELS[currentReel];
    if (!reel) return;
    const m = reel.meta;
    dom.directorBody.innerHTML = `
      <div class="director-item"><div class="di-label">Cámara</div><div class="di-value">${m.cam}</div></div>
      <div class="director-item"><div class="di-label">Lente</div><div class="di-value">${m.lens}</div></div>
      <div class="director-item"><div class="di-label">Settings</div><div class="di-value">${m.settings}</div></div>
      <div class="director-item">
        <div class="di-label">Behind the Scenes</div>
        <video controls preload="metadata" src="${m.bts}" style="width:100%;border-radius:4px;margin-top:.2rem;max-height:80px"></video>
      </div>`;
  }

  /* ---------- Session replay ---------- */
  dom.sessionBtn.addEventListener('click', () => {
    dom.sessionPanel.classList.toggle('hidden');
    renderSession();
  });
  dom.sessionClose.addEventListener('click', () => dom.sessionPanel.classList.add('hidden'));

  function renderSession() {
    dom.sessionClips.innerHTML = '';
    REELS.forEach((r, i) => {
      const div = document.createElement('div');
      div.className = `session-clip${selectedClips.includes(i) ? ' selected' : ''}`;
      div.textContent = `${i + 1}. ${r.title} (${r.duration}s)`;
      div.addEventListener('click', () => {
        const idx = selectedClips.indexOf(i);
        if (idx >= 0) selectedClips.splice(idx, 1);
        else selectedClips.push(i);
        renderSession();
        dom.sessionPreview.textContent = selectedClips.length ? `${selectedClips.length} clips seleccionados` : 'Ningún clip seleccionado';
      });
      dom.sessionClips.appendChild(div);
    });
  }

  dom.sessionExport.addEventListener('click', () => {
    if (!selectedClips.length) return;
    const data = { clips: selectedClips.map(i => ({ title: REELS[i].title, duration: REELS[i].duration, url: REELS[i].videoUrl })), timestamps: selectedClips.map((_, i) => i * REELS[selectedClips[0]].duration), created: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'session-replay.json';
    a.click();
    analytics.compilations++;
    saveAnalytics();
  });

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    renderAnalytics();
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  function renderAnalytics() {
    const totalViews = Object.values(analytics.views).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>Reels vistos</span><span>${totalViews}</span></div>
      <div class="analytics-row"><span>Más visto</span><span>${REELS[Object.entries(analytics.views).sort((a, b) => b[1] - a[1])[0]?.[0] || 0]?.title || '-'}</span></div>
      <div class="analytics-row"><span>Compilaciones</span><span>${analytics.compilations}</span></div>`;
  }

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    REELS.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${r.videoUrl}"></video><div><h3>${r.title}</h3><p>${r.duration}s · ${r.meta.cam}</p></div>`;
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

  /* Texture release after 60s */
  let inactivityTimer = null;
  function resetTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      videoTextures.forEach(v => { v.pause(); v.src = ''; });
    }, 60000);
  }
  document.addEventListener('pointermove', resetTimer);
  document.addEventListener('click', resetTimer);

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = dom.sceneRoot.clientWidth / dom.sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.sceneRoot.clientWidth, dom.sceneRoot.clientHeight);
  });

  function animate() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    monitorMeshes.forEach((m, i) => {
      if (!prefersReducedMotion) {
        m.position.y = 0.1 + Math.sin(t * 0.3 + i * 0.6) * 0.008;
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
    resetTimer();
    selectReel(0);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

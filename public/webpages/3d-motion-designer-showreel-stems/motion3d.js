(function () {
  'use strict';

  const SHOWREELS = [
    {
      title: 'Showreel 2026',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      chapters: [0, 4, 10, 16, 22],
      caption: 'Compilación de trabajos 2025–2026. Branding, motion, 3D.',
      layers: [
        { label: 'Assets', desc: '12 ilustraciones vectoriales, 4 texturas, 3 modelos GLB' },
        { label: 'Timeline', desc: '24 cortes · 4 transiciones · Easing personalizado' },
        { label: 'Audio', desc: 'Stems: música CC, SFX diseñados, voz over' }
      ],
      microvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      title: 'Branding Reel',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      chapters: [0, 5, 12, 18],
      caption: 'Proyectos de identidad de marca con animación.',
      layers: [
        { label: 'Assets', desc: 'Logotipos, paletas, mockups 3D' },
        { label: 'Timeline', desc: '15 cortes · 3 escenas principales' },
        { label: 'Audio', desc: 'Música ambiental + SFX sutiles' }
      ],
      microvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    }
  ];

  const PANEL_COLS = 2;
  const PANEL_W = 0.4, PANEL_H = 0.25;
  const SPACING_X = 0.6, SPACING_Y = 0.35;
  const START_X = -((PANEL_COLS - 1) * SPACING_X) / 2;

  let scene, camera, renderer;
  let panelGroups = [];
  let particles, particleGeo, particlePos;
  let barMeshes = [];
  let audioCtx, analyser, sourceNode, gainNodes = {}, convolver, delay;
  let isAudioReady = false;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let activeReelIdx = -1;

  let stemValues = { music: 0.8, sfx: 0.8, voice: 0.8 };
  let fxValues = { reverb: 0.2, delay: 0.1 };
  let stemAdjustCount = { music: 0, sfx: 0, voice: 0 };
  let reelPlayCount = {};

  let analytics = { stemAdjusts: {}, reelPlays: {} };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    reelPanel: document.getElementById('reel-panel'),
    reelClose: document.getElementById('reel-close'),
    reelVideo: document.getElementById('reel-video'),
    reelMarkers: document.getElementById('reel-markers'),
    reelMeta: document.getElementById('reel-meta'),
    stemSliders: document.querySelectorAll('.stem-slider'),
    fxSliders: document.querySelectorAll('.fx-slider'),
    deconstructBtn: document.getElementById('deconstruct-btn'),
    deconPanel: document.getElementById('deconstruct-panel'),
    deconClose: document.getElementById('decon-close'),
    deconBody: document.getElementById('decon-body'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbReels: document.getElementById('fb-reels')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('Motion3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('Motion3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Audio ---------- */
  function initAudio() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;

      convolver = audioCtx.createConvolver();
      delay = audioCtx.createDelay(1);
      delay.delayTime.value = 0.1;

      ['music', 'sfx', 'voice'].forEach((stem) => {
        gainNodes[stem] = audioCtx.createGain();
        gainNodes[stem].gain.value = stemValues[stem];
        gainNodes[stem].connect(analyser);
      });

      isAudioReady = true;
    } catch (e) { console.warn('Audio not available', e); }
  }

  function updateStems() {
    Object.keys(stemValues).forEach((stem) => {
      if (gainNodes[stem]) gainNodes[stem].gain.value = stemValues[stem];
    });
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 0.3, 2.5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x222244, 0.4);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0x4444aa, 0.3);
    key.position.set(2, 3, 2);
    scene.add(key);
    const point = new THREE.PointLight(0xaa4aaa, 0.3, 5);
    point.position.set(-1, 2, 1);
    scene.add(point);

    buildPanels();
    createParticles();
    createBars();
  }

  function buildPanels() {
    panelGroups.forEach(g => scene.remove(g));
    panelGroups = [];

    SHOWREELS.forEach((reel, idx) => {
      const col = idx % PANEL_COLS;
      const row = Math.floor(idx / PANEL_COLS);
      const x = START_X + col * SPACING_X;
      const y = 0.15 - row * SPACING_Y;

      const g = new THREE.Group();
      g.position.set(x, y, 0);

      const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.3, metalness: 0.2, emissive: 0x0a0a1a });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), panelMat);
      g.add(panel);

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
      const sMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W * 0.88, PANEL_H * 0.82), sMat);
      screen.position.z = 0.005;
      g.add(screen);

      const c = document.createElement('canvas');
      c.width = 256; c.height = 24;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 256, 24);
      ctx.fillStyle = '#e8e4ee';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(reel.title, 128, 16);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W * 0.7, 0.025), lMat);
      lMesh.position.set(0, -PANEL_H / 2 + 0.02, 0.008);
      g.add(lMesh);

      g.userData = { idx: idx, origY: y };
      scene.add(g);
      panelGroups.push(g);
    });
  }

  function createParticles() {
    const count = 300;
    particleGeo = new THREE.BufferGeometry();
    particlePos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) particlePos[i] = (Math.random() - 0.5) * 3;
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x6a4aaa, size: 0.008, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    particles = new THREE.Points(particleGeo, mat);
    particles.position.y = -0.2;
    scene.add(particles);
  }

  function createBars() {
    const barCount = 16;
    const barMat = new THREE.MeshStandardMaterial({ color: 0x6a4aaa, emissive: 0x3a2a6a });
    for (let i = 0; i < barCount; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.005, 0.02), barMat);
      bar.position.set(-0.4 + i * 0.055, -0.15, -0.1);
      bar.userData.idx = i;
      scene.add(bar);
      barMeshes.push(bar);
    }
  }

  /* ---------- Click to open reel ---------- */
  renderer.domElement.addEventListener('click', (e) => {
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
          if (hits[0].object === panelGroups[i].children[j]) { openReel(panelGroups[i].userData.idx); return; }
        }
      }
    }
  });

  function openReel(idx) {
    activeReelIdx = idx;
    const reel = SHOWREELS[idx];
    dom.reelVideo.src = reel.videoUrl;
    dom.reelVideo.load();
    dom.reelVideo.play().catch(() => {});
    dom.reelMeta.textContent = reel.caption;

    dom.reelMarkers.innerHTML = '';
    reel.chapters.forEach((t, i) => {
      const mk = document.createElement('div');
      mk.className = 'reel-marker';
      mk.title = `Capítulo ${i + 1} (${t}s)`;
      mk.addEventListener('click', () => { dom.reelVideo.currentTime = t; });
      dom.reelMarkers.appendChild(mk);
    });

    dom.reelPanel.classList.remove('hidden');

    reelPlayCount[idx] = (reelPlayCount[idx] || 0) + 1;
    analytics.reelPlays[idx] = (analytics.reelPlays[idx] || 0) + 1;
    saveAnalytics();
  }

  dom.reelClose.addEventListener('click', () => {
    dom.reelPanel.classList.add('hidden');
    dom.reelVideo.pause();
    activeReelIdx = -1;
  });

  /* ---------- Stems & FX sliders ---------- */
  dom.stemSliders.forEach((slider) => {
    slider.addEventListener('input', () => {
      const stem = slider.dataset.stem;
      stemValues[stem] = parseInt(slider.value) / 100;
      updateStems();
      stemAdjustCount[stem] = (stemAdjustCount[stem] || 0) + 1;
      analytics.stemAdjusts[stem] = (analytics.stemAdjusts[stem] || 0) + 1;
      saveAnalytics();
    });
  });

  dom.fxSliders.forEach((slider) => {
    slider.addEventListener('input', () => {
      const fx = slider.dataset.fx;
      fxValues[fx] = parseInt(slider.value) / 100;
      if (fx === 'reverb' && convolver) { /* placeholder */ }
      if (fx === 'delay' && delay) delay.delayTime.value = fxValues[fx] * 0.5;
    });
  });

  /* ---------- Deconstruct ---------- */
  dom.deconstructBtn.addEventListener('click', () => {
    dom.deconPanel.classList.toggle('hidden');
    if (!dom.deconPanel.classList.contains('hidden') && activeReelIdx >= 0) {
      const reel = SHOWREELS[activeReelIdx];
      dom.deconBody.innerHTML = reel.layers.map((l) =>
        `<div class="decon-item"><span class="label">${l.label}</span><span>${l.desc}</span></div>`
      ).join('');
      dom.deconBody.innerHTML += `<div class="decon-item" style="margin-top:.2rem"><span class="label">Micro</span><span><video src="${reel.microvideo}" autoplay loop muted playsinline style="width:100%;border-radius:4px;max-height:60px"></video></span></div>`;
    } else if (activeReelIdx < 0) {
      dom.deconBody.innerHTML = '<div style="color:var(--muted)">Selecciona un reel primero.</div>';
    }
  });
  dom.deconClose.addEventListener('click', () => dom.deconPanel.classList.add('hidden'));

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const totalAdjusts = Object.values(analytics.stemAdjusts).reduce((a, b) => a + b, 0);
    const totalPlays = Object.values(analytics.reelPlays).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Reels</span><span>${totalPlays}</span></div>
      <div class="analytics-row"><span>🎛 Ajustes stems</span><span>${totalAdjusts}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      dom.fbReels.innerHTML = '';
      SHOWREELS.forEach((r) => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `<video controls preload="metadata" src="${r.videoUrl}"></video><h3>${r.title}</h3><p>${r.caption}</p>`;
        dom.fbReels.appendChild(card);
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

    /* Particle FFT response */
    if (analyser && isAudioReady) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;

      if (particles && !prefersReducedMotion) {
        const pos = particles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length / 3; i++) {
          pos[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.0005 + avg * 0.002;
          if (pos[i * 3 + 1] > 0.5) pos[i * 3 + 1] = -0.5;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      /* Bars */
      barMeshes.forEach((bar, i) => {
        const val = data[Math.floor(i * data.length / barMeshes.length)] || 0;
        const h = 0.005 + val / 255 * 0.12;
        if (!prefersReducedMotion) {
          gsap.to(bar.scale, { y: h / 0.005, duration: 0.1 });
        } else {
          bar.scale.y = h / 0.005;
        }
      });
    }

    /* Panel float */
    panelGroups.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.position.y = g.userData.origY + Math.sin(t * 0.3 + i * 1.2) * 0.005;
      }
    });

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    initAudio();
    loadAnalytics();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

/*
 * festival3d.js — Festival musical 3D
 *
 * Privacidad: antes de habilitar cámara/micrófono para interacción en vivo,
 * mostrar un diálogo informativo. No almacenar streams sin consentimiento.
 *
 * WebAudio: Los stems (voz, bajo, percusión) se controlan mediante
 * ganancias independientes sobre un buffer de audio compartido.
 * Para un festival real, cada stem sería una pista de audio separada.
 */

(function () {
  'use strict';

  const ANGLES = [
    { id: 'front', label: 'Front Row', pos: [0, 0.3, 2.0], target: [0, 0, 0], light: [0xffffff, 0.5] },
    { id: 'side', label: 'Side', pos: [1.2, 0.4, 0.6], target: [0, 0, 0], light: [0xffccaa, 0.35] },
    { id: 'birds', label: "Bird's Eye", pos: [0, 1.5, 0.01], target: [0, 0, 0], light: [0xccddff, 0.2] }
  ];

  const STREAM_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const SIDE_CLIPS = [
    { label: 'Entrevista backstage', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    { label: 'Detrás del escenario', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
  ];

  let scene, camera, renderer;
  let mainScreen, sideLeft, sideRight;
  let mainVideo, leftVideo, rightVideo;
  let crowdMeshes = [];
  let particleSystem = null;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let currentAngle = 'front';
  let clips = [];
  let reactions = { '🔥': 0, '❤️': 0, '🎉': 0, '🚀': 0 };
  let reactionParticles = [];

  let audioCtx = null;
  let stemGains = { vocal: 1.0, bass: 1.0, perc: 1.0 };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metrics = { clipsCreated: 0, reactions: 0, viewTime: { front: 0, side: 0, birds: 0 }, lastAngleChange: Date.now() };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    anglesBtn: document.getElementById('angles-btn'),
    anglesPanel: document.getElementById('angles-panel'),
    anglesClose: document.getElementById('angles-close'),
    anglesBody: document.getElementById('angles-body'),
    stemsBtn: document.getElementById('stems-btn'),
    stemsPanel: document.getElementById('stems-panel'),
    stemsClose: document.getElementById('stems-close'),
    stemsBody: document.getElementById('stems-body'),
    reactionsBtn: document.getElementById('reactions-btn'),
    reactionsPanel: document.getElementById('reactions-panel'),
    reactionsClose: document.getElementById('reactions-close'),
    reactionsBody: document.getElementById('reactions-body'),
    clipsBtn: document.getElementById('clips-btn'),
    clipsPanel: document.getElementById('clips-panel'),
    clipsClose: document.getElementById('clips-close'),
    clipsBody: document.getElementById('clips-body'),
    directorBtn: document.getElementById('director-btn'),
    directorModal: document.getElementById('director-modal'),
    directorVideo: document.getElementById('director-video'),
    directorMarkers: document.getElementById('director-markers'),
    directorClose: document.getElementById('director-close'),
    metricsBtn: document.getElementById('metrics-btn'),
    metricsPanel: document.getElementById('metrics-panel'),
    metricsClose: document.getElementById('metrics-close'),
    metricsBody: document.getElementById('metrics-body')
  };

  /* ---------- IndexedDB ---------- */
  function saveMetrics() {
    try {
      const req = indexedDB.open('Festival3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'metrics', v: metrics }); };
    } catch (e) { /* silent */ }
  }
  function loadMetrics() {
    try {
      const req = indexedDB.open('Festival3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('metrics'); get.onsuccess = () => { if (get.result) metrics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- WebAudio ---------- */
  function initAudio() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      /* Crear nodos de ganancia para stems (simulados) */
      ['vocal', 'bass', 'perc'].forEach(key => {
        const gain = audioCtx.createGain();
        gain.gain.value = stemGains[key];
        gain.connect(audioCtx.destination);
        stemGains[key + 'Node'] = gain;
      });
    } catch (e) { /* silent */ }
  }

  function buildStemsUI() {
    dom.stemsBody.innerHTML = '';
    ['vocal', 'bass', 'perc'].forEach(key => {
      const row = document.createElement('div');
      row.className = 'stem-row';
      row.innerHTML =
        `<label>${key}</label>` +
        `<input type="range" min="0" max="1" step="0.05" value="${stemGains[key]}" data-stem="${key}" aria-label="${key} volume">` +
        `<span class="val">${Math.round(stemGains[key] * 100)}%</span>`;
      const input = row.querySelector('input');
      const val = row.querySelector('.val');
      input.addEventListener('input', () => {
        stemGains[key] = parseFloat(input.value);
        val.textContent = Math.round(stemGains[key] * 100) + '%';
        if (audioCtx && stemGains[key + 'Node']) {
          stemGains[key + 'Node'].gain.value = stemGains[key];
        }
      });
      dom.stemsBody.appendChild(row);
    });
  }

  dom.stemsBtn.addEventListener('click', () => {
    dom.stemsPanel.classList.toggle('hidden');
    if (!dom.stemsPanel.classList.contains('hidden')) buildStemsUI();
  });
  dom.stemsClose.addEventListener('click', () => dom.stemsPanel.classList.add('hidden'));

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1016);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 25);
    camera.position.set(0, 0.3, 2.0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    /* Bloom-like effect via light */
    dom.sceneRoot.appendChild(renderer.domElement);

    /* Ambient + dynamic lights */
    const amb = new THREE.AmbientLight(0x4444aa, 0.2);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffeedd, 0.4);
    key.position.set(0, 2, 2);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x4488ff, 0.1);
    fill.position.set(-2, 1, 1);
    scene.add(fill);
    const spot = new THREE.SpotLight(0xaa88ff, 0.3, 5, Math.PI / 5, 0.5);
    spot.position.set(0, 1.5, 0.5);
    spot.target.position.set(0, 0, 0);
    scene.add(spot);
    scene.add(spot.target);

    buildStage();
    buildCrowd();
    buildParticles();
  }

  function buildStage() {
    /* Stage floor */
    const sMat = new THREE.MeshStandardMaterial({ color: 0x2a2c34, roughness: 0.3, metalness: 0.2 });
    const stage = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), sMat);
    stage.rotation.x = -Math.PI / 2;
    stage.position.y = -0.005;
    stage.receiveShadow = true;
    scene.add(stage);

    /* Main screen */
    mainVideo = document.createElement('video');
    mainVideo.crossOrigin = 'anonymous';
    mainVideo.src = STREAM_URL;
    mainVideo.loop = true;
    mainVideo.muted = true;
    mainVideo.preload = 'auto';
    mainVideo.load();
    mainVideo.play().catch(() => {});
    const mainTex = new THREE.VideoTexture(mainVideo);
    mainTex.minFilter = THREE.LinearFilter;
    const mainMat = new THREE.MeshBasicMaterial({ map: mainTex });
    mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.28), mainMat);
    mainScreen.position.set(0, 0.14, 0);
    scene.add(mainScreen);

    /* Frame */
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a3c44, roughness: 0.3, metalness: 0.4 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.31, 0.02), frameMat);
    frame.position.set(0, 0.14, -0.015);
    scene.add(frame);

    /* Side screens */
    leftVideo = document.createElement('video');
    leftVideo.crossOrigin = 'anonymous';
    leftVideo.src = SIDE_CLIPS[0].url;
    leftVideo.loop = true;
    leftVideo.muted = true;
    leftVideo.preload = 'auto';
    leftVideo.load();
    leftVideo.play().catch(() => {});
    const leftTex = new THREE.VideoTexture(leftVideo);
    leftTex.minFilter = THREE.LinearFilter;
    sideLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.1), new THREE.MeshBasicMaterial({ map: leftTex, transparent: true, opacity: 0.6 }));
    sideLeft.position.set(-0.4, 0.1, 0.02);
    scene.add(sideLeft);

    rightVideo = document.createElement('video');
    rightVideo.crossOrigin = 'anonymous';
    rightVideo.src = SIDE_CLIPS[1].url;
    rightVideo.loop = true;
    rightVideo.muted = true;
    rightVideo.preload = 'auto';
    rightVideo.load();
    rightVideo.play().catch(() => {});
    const rightTex = new THREE.VideoTexture(rightVideo);
    rightTex.minFilter = THREE.LinearFilter;
    sideRight = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.1), new THREE.MeshBasicMaterial({ map: rightTex, transparent: true, opacity: 0.6 }));
    sideRight.position.set(0.4, 0.1, 0.02);
    scene.add(sideRight);
  }

  /* ---------- Crowd ---------- */
  function buildCrowd() {
    const colors = [0xaa88cc, 0x88aacc, 0xccaa88, 0xaacc88, 0xccaacc];
    for (let i = 0; i < 60; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const headMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), headMat);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2c34, roughness: 0.7 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.035, 0.015), bodyMat);
      const g = new THREE.Group();
      head.position.y = 0.025;
      body.position.y = 0.005;
      g.add(head); g.add(body);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.5;
      g.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius + 0.2);
      const scale = 0.6 + Math.random() * 0.4;
      g.scale.set(scale, scale, scale);
      scene.add(g);
      crowdMeshes.push(g);
    }
  }

  /* ---------- Particles (reactions) ---------- */
  function buildParticles() {
    const geo = new THREE.BufferGeometry();
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = Math.random() * 0.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xaa88ff, size: 0.005, transparent: true, opacity: 0.3 });
    particleSystem = new THREE.Points(geo, mat);
    particleSystem.position.set(0, 0, 0);
    scene.add(particleSystem);
  }

  function triggerReactionParticles(color) {
    if (!particleSystem) return;
    const c = new THREE.Color(color);
    gsap.to(particleSystem.material.color, { r: c.r, g: c.g, b: c.b, duration: 0.3 });
    gsap.to(particleSystem.material, { opacity: 0.7, duration: 0.2, yoyo: true, repeat: 1 });
  }

  /* ---------- Camera angles ---------- */
  function buildAnglesUI() {
    dom.anglesBody.innerHTML = '';
    ANGLES.forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'angle-btn' + (a.id === currentAngle ? ' active' : '');
      btn.textContent = a.label;
      btn.addEventListener('click', () => switchAngle(a.id));
      dom.anglesBody.appendChild(btn);
    });
  }

  function switchAngle(id) {
    const now = Date.now();
    const elapsed = (now - metrics.lastAngleChange) / 1000;
    metrics.viewTime[currentAngle] = (metrics.viewTime[currentAngle] || 0) + elapsed;
    metrics.lastAngleChange = now;

    currentAngle = id;
    const angle = ANGLES.find(a => a.id === id);
    if (!angle) return;
    const target = new THREE.Vector3(angle.target[0], angle.target[1], angle.target[2]);
    if (prefersReducedMotion) {
      camera.position.set(angle.pos[0], angle.pos[1], angle.pos[2]);
      camera.lookAt(target);
    } else {
      gsap.to(camera.position, {
        x: angle.pos[0], y: angle.pos[1], z: angle.pos[2],
        duration: 0.7, ease: 'power2.out',
        onUpdate: () => camera.lookAt(target),
        onComplete: () => camera.lookAt(target)
      });
    }
    buildAnglesUI();
    saveMetrics();
  }

  dom.anglesBtn.addEventListener('click', () => dom.anglesPanel.classList.toggle('hidden'));
  dom.anglesClose.addEventListener('click', () => dom.anglesPanel.classList.add('hidden'));

  /* ---------- Reactions ---------- */
  function buildReactionsUI() {
    dom.reactionsBody.innerHTML =
      '<div class="reactions-grid">' +
      Object.keys(reactions).map(emoji =>
        `<button class="reaction-btn" data-emoji="${emoji}">${emoji}</button>`
      ).join('') +
      '</div>' +
      Object.entries(reactions).map(([k, v]) =>
        `<div class="reaction-counter">${k} ×${v}</div>`
      ).join('');
    dom.reactionsBody.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        reactions[emoji]++;
        metrics.reactions++;
        saveMetrics();
        triggerReactionParticles(['#ff4488', '#44ff88', '#ffaa44', '#4488ff'][Math.floor(Math.random() * 4)]);
        buildReactionsUI();
      });
    });
  }

  dom.reactionsBtn.addEventListener('click', () => {
    dom.reactionsPanel.classList.toggle('hidden');
    if (!dom.reactionsPanel.classList.contains('hidden')) buildReactionsUI();
  });
  dom.reactionsClose.addEventListener('click', () => dom.reactionsPanel.classList.add('hidden'));

  /* ---------- Clips ---------- */
  function addClip(label, start) {
    clips.push({ label, start, angle: currentAngle });
    metrics.clipsCreated++;
    saveMetrics();
    renderClips();
  }

  function renderClips() {
    dom.clipsBody.innerHTML = clips.map((c, i) =>
      `<div class="clip-card" data-idx="${i}"><span class="time">${c.label}</span><br><span style="font-size:.38rem;color:var(--muted)">${c.angle}</span></div>`
    ).join('');
    dom.clipsBody.querySelectorAll('.clip-card').forEach(el => {
      el.addEventListener('click', () => {
        const c = clips[parseInt(el.dataset.idx)];
        dom.directorVideo.src = STREAM_URL;
        dom.directorVideo.load();
        dom.directorVideo.play().catch(() => {});
        setTimeout(() => { dom.directorVideo.currentTime = c.start; }, 300);
        dom.directorModal.classList.remove('hidden');
      });
    });
  }

  dom.clipsBtn.addEventListener('click', () => {
    dom.clipsPanel.classList.toggle('hidden');
    renderClips();
  });
  dom.clipsClose.addEventListener('click', () => dom.clipsPanel.classList.add('hidden'));

  /* Tecla M para marcar clip */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' && !e.ctrlKey && !e.metaKey) {
      const t = mainVideo.currentTime;
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      addClip(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, t);
    }
  });

  /* ---------- Director mode ---------- */
  dom.directorBtn.addEventListener('click', () => {
    dom.directorVideo.src = STREAM_URL;
    dom.directorVideo.load();
    dom.directorVideo.play().catch(() => {});
    dom.directorMarkers.innerHTML = clips.map((c, i) =>
      `<button class="dir-marker" data-idx="${i}">📌 ${c.label}</button>`
    ).join('');
    dom.directorMarkers.querySelectorAll('.dir-marker').forEach(el => {
      el.addEventListener('click', () => {
        const c = clips[parseInt(el.dataset.idx)];
        dom.directorVideo.currentTime = c.start;
      });
    });
    dom.directorModal.classList.remove('hidden');
  });
  dom.directorClose.addEventListener('click', () => {
    dom.directorModal.classList.add('hidden');
    dom.directorVideo.pause();
    dom.directorVideo.src = '';
  });

  /* ---------- Metrics ---------- */
  dom.metricsBtn.addEventListener('click', () => {
    const now = Date.now();
    metrics.viewTime[currentAngle] = (metrics.viewTime[currentAngle] || 0) + (now - metrics.lastAngleChange) / 1000;
    metrics.lastAngleChange = now;
    dom.metricsPanel.classList.toggle('hidden');
    dom.metricsBody.innerHTML =
      `<div class="row"><span>🎬 Clips</span><span>${metrics.clipsCreated}</span></div>` +
      `<div class="row"><span>🔥 Reacciones</span><span>${metrics.reactions}</span></div>` +
      `<div class="row"><span>⏱ Front</span><span>${Math.round(metrics.viewTime.front || 0)}s</span></div>` +
      `<div class="row"><span>⏱ Side</span><span>${Math.round(metrics.viewTime.side || 0)}s</span></div>` +
      `<div class="row"><span>⏱ Bird's</span><span>${Math.round(metrics.viewTime.birds || 0)}s</span></div>`;
  });
  dom.metricsClose.addEventListener('click', () => dom.metricsPanel.classList.add('hidden'));

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
    /* Animar crowd sutilmente */
    const t = clock.elapsedTime;
    crowdMeshes.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.position.y = Math.sin(t * 0.5 + i * 0.3) * 0.003;
      }
    });
    /* Partículas orbitan suavemente */
    if (particleSystem) {
      particleSystem.rotation.y += 0.0002;
    }
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadMetrics();
    initAudio();
    buildAnglesUI();
    buildStemsUI();
    renderClips();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

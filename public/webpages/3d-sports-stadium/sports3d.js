/*
 * sports3d.js — Evento deportivo 3D
 *
 * Streaming adaptativo:
 * - HLS.js config: maxBufferLength: 30, lowLatencyMode: true.
 * - Para replays, servir segmentos cortos (4-6s) con proxies 480p para scrubbing fluido.
 *
 * Constraints de cámara:
 * - Mantener altura mínima 0.2 y máxima 2.0 sobre el campo.
 * - No permitir que la cámara atraviese el campo (distancia mínima 0.5 del centro).
 */

(function () {
  'use strict';

  const REPLAYS = [
    { id: 'r1', label: 'Gol 1 — Tiro libre', time: '12:34', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { id: 'r2', label: 'Atajada espectacular', time: '28:15', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    { id: 'r3', label: 'Contraataque y gol', time: '41:03', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { id: 'r4', label: 'Falta y tarjeta roja', time: '52:44', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
    { id: 'r5', label: 'Gol de chilena', time: '67:22', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
  ];

  let scene, camera, renderer;
  let mainScreen, replayVideo;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let activeReplayIdx = -1;
  let isReplayMode = false;
  let comments = [];
  let gameTime = 2700; // 45min in seconds

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metrics = { replaysViewed: 0, anglesChanged: 0, commentsSent: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    replaysBtn: document.getElementById('replays-btn'),
    replaysPanel: document.getElementById('replays-panel'),
    replaysClose: document.getElementById('replays-close'),
    replaysBody: document.getElementById('replays-body'),
    timelineBar: document.getElementById('timeline-bar'),
    timelineScrub: document.getElementById('timeline-scrub'),
    timelineMarkers: document.getElementById('timeline-markers'),
    statsBtn: document.getElementById('stats-btn'),
    statsOverlay: document.getElementById('stats-overlay'),
    statsBody: document.getElementById('stats-body'),
    statsClose: document.getElementById('stats-close'),
    commentsBtn: document.getElementById('comments-btn'),
    commentsPanel: document.getElementById('comments-panel'),
    commentsClose: document.getElementById('comments-close'),
    commentsList: document.getElementById('comments-list'),
    commentsInput: document.getElementById('comments-input'),
    commentsSend: document.getElementById('comments-send'),
    metricsBtn: document.getElementById('metrics-btn'),
    metricsPanel: document.getElementById('metrics-panel'),
    metricsClose: document.getElementById('metrics-close'),
    metricsBody: document.getElementById('metrics-body'),
    gameClock: document.getElementById('game-clock')
  };

  /* ---------- IndexedDB ---------- */
  function saveMetrics() {
    try {
      const req = indexedDB.open('Sports3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'metrics', v: metrics }); };
    } catch (e) { /* silent */ }
  }
  function loadMetrics() {
    try {
      const req = indexedDB.open('Sports3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('metrics'); get.onsuccess = () => { if (get.result) metrics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1a14);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 20);
    camera.position.set(0, 0.6, 2.2);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x334433, 0.3);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.4);
    dir.position.set(3, 5, 2);
    dir.castShadow = true;
    scene.add(dir);

    /* Field */
    const fieldMat = new THREE.MeshStandardMaterial({ color: 0x2a5a3a, roughness: 0.7 });
    const field = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), fieldMat);
    field.rotation.x = -Math.PI / 2;
    field.position.y = -0.01;
    field.receiveShadow = true;
    scene.add(field);

    /* Field lines */
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
    const line = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.02), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.001;
    scene.add(line);
    const line2 = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.7), lineMat);
    line2.rotation.x = -Math.PI / 2;
    line2.position.y = 0.001;
    scene.add(line2);

    /* Main screen (stadium big screen) */
    replayVideo = document.createElement('video');
    replayVideo.crossOrigin = 'anonymous';
    replayVideo.src = REPLAYS[0].videoUrl;
    replayVideo.loop = true;
    replayVideo.muted = true;
    replayVideo.preload = 'auto';
    replayVideo.load();
    replayVideo.play().catch(() => {});
    const vTex = new THREE.VideoTexture(replayVideo);
    vTex.minFilter = THREE.LinearFilter;
    const vMat = new THREE.MeshBasicMaterial({ map: vTex });
    mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.18), vMat);
    mainScreen.position.set(0, 0.25, -0.5);
    scene.add(mainScreen);

    /* Stands */
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1a2a24, roughness: 0.6 });
    const stand = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), standMat);
    stand.position.set(0, 0.2, -0.55);
    scene.add(stand);
    const stand2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), standMat);
    stand2.position.set(0, 0.2, 0.55);
    scene.add(stand2);

    /* Crowd dots */
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x6a8a7a, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 40; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.005, 3, 3), dotMat);
      dot.position.set(-0.6 + Math.random() * 1.2, 0.25 + Math.random() * 0.05, -0.5 + (Math.random() > 0.5 ? 0.55 : -0.55));
      scene.add(dot);
    }
  }

  /* ---------- Camera orbit (free with constraints) ---------- */
  let orbitTheta = 0, orbitPhi = 0.6, orbitRadius = 2.2;
  let isDragging = false, dragStart = { x: 0, y: 0 };

  renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 0) { isDragging = true; dragStart.x = e.clientX; dragStart.y = e.clientY; }
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    orbitTheta -= (e.clientX - dragStart.x) * 0.004;
    orbitPhi = Math.max(0.2, Math.min(1.4, orbitPhi - (e.clientY - dragStart.y) * 0.004));
    dragStart.x = e.clientX; dragStart.y = e.clientY;
    updateOrbit();
  });
  window.addEventListener('mouseup', () => { isDragging = false; metrics.anglesChanged++; });
  renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    orbitRadius = Math.max(1.0, Math.min(4, orbitRadius + e.deltaY * 0.003));
    updateOrbit();
  }, { passive: false });

  function updateOrbit() {
    camera.position.x = orbitRadius * Math.sin(orbitPhi) * Math.sin(orbitTheta);
    camera.position.y = orbitRadius * Math.cos(orbitPhi);
    camera.position.z = orbitRadius * Math.sin(orbitPhi) * Math.cos(orbitTheta);
    camera.lookAt(0, 0, 0);
  }

  /* ---------- Replays ---------- */
  function renderReplays() {
    dom.replaysBody.innerHTML = REPLAYS.map((r, i) =>
      `<div class="replay-card${i === activeReplayIdx ? ' active' : ''}" data-idx="${i}">
        <div class="play">${r.label}</div>
        <div style="font-size:.38rem;color:var(--muted)">⏱ ${r.time}</div>
      </div>`
    ).join('');
    dom.replaysBody.querySelectorAll('.replay-card').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        loadReplay(idx);
      });
    });
  }

  function loadReplay(idx) {
    activeReplayIdx = idx;
    isReplayMode = true;
    const r = REPLAYS[idx];
    replayVideo.src = r.videoUrl;
    replayVideo.load();
    replayVideo.play().catch(() => {});
    dom.timelineBar.classList.remove('hidden');
    dom.timelineScrub.max = 30; /* simulate 30s clip */
    dom.timelineScrub.value = 0;
    metrics.replaysViewed++;
    saveMetrics();
    renderReplays();
    renderTimelineMarkers();

    flyToReplay();
  }

  function flyToReplay() {
    const target = new THREE.Vector3(0.3, 0.35, 1.5);
    if (prefersReducedMotion) { camera.position.copy(target); camera.lookAt(0, 0, 0); }
    else {
      gsap.to(camera.position, { x: target.x, y: target.y, z: target.z, duration: 0.7, ease: 'power2.out',
        onUpdate: () => camera.lookAt(0, 0, 0) });
    }
  }

  /* Timeline scrub */
  dom.timelineScrub.addEventListener('input', () => {
    if (replayVideo) replayVideo.currentTime = parseFloat(dom.timelineScrub.value);
  });

  replayVideo.addEventListener('timeupdate', () => {
    if (replayVideo.duration) {
      dom.timelineScrub.max = replayVideo.duration;
      dom.timelineScrub.value = replayVideo.currentTime;
    }
  });

  function renderTimelineMarkers() {
    dom.timelineMarkers.innerHTML = '';
    [5, 15, 22].forEach(sec => {
      const m = document.createElement('div');
      m.className = 'marker';
      m.style.left = (sec / 30 * 100) + '%';
      m.title = `Jugada clave ${sec}s`;
      dom.timelineMarkers.appendChild(m);
    });
  }

  dom.replaysBtn.addEventListener('click', () => {
    dom.replaysPanel.classList.toggle('hidden');
    renderReplays();
  });
  dom.replaysClose.addEventListener('click', () => dom.replaysPanel.classList.add('hidden'));

  /* ---------- Stats ---------- */
  function renderStats() {
    const data = {
      'Posesión': '58% - 42%',
      'Tiros': '12 - 8',
      'Faltas': '9 - 11',
      'Córners': '5 - 3',
      'Fuera de juego': '2 - 1'
    };
    dom.statsBody.innerHTML = Object.entries(data).map(([k, v]) =>
      `<div class="stat-row"><span>${k}</span><span>${v}</span></div>`
    ).join('');
  }

  dom.statsBtn.addEventListener('click', () => {
    dom.statsOverlay.classList.toggle('hidden');
    renderStats();
  });
  dom.statsClose.addEventListener('click', () => dom.statsOverlay.classList.add('hidden'));

  /* ---------- Comments ---------- */
  function renderComments() {
    dom.commentsList.innerHTML = comments.map(c =>
      `<div class="comment"><span class="stamp">[${c.stamp}]</span> ${c.text}</div>`
    ).join('');
  }

  dom.commentsSend.addEventListener('click', () => {
    const text = dom.commentsInput.value.trim();
    if (!text) return;
    const t = replayVideo.currentTime || 0;
    const m = Math.floor(t / 60); const s = Math.floor(t % 60);
    comments.push({ text, stamp: `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` });
    metrics.commentsSent++;
    saveMetrics();
    dom.commentsInput.value = '';
    renderComments();
  });
  dom.commentsBtn.addEventListener('click', () => dom.commentsPanel.classList.toggle('hidden'));
  dom.commentsClose.addEventListener('click', () => dom.commentsPanel.classList.add('hidden'));

  /* ---------- Game clock sim ---------- */
  setInterval(() => {
    gameTime += 1;
    const m = Math.floor(gameTime / 60);
    const s = gameTime % 60;
    dom.gameClock.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, 1000);

  /* ---------- Metrics ---------- */
  dom.metricsBtn.addEventListener('click', () => {
    dom.metricsPanel.classList.toggle('hidden');
    dom.metricsBody.innerHTML =
      `<div class="row"><span>🎬 Replays</span><span>${metrics.replaysViewed}</span></div>` +
      `<div class="row"><span>🎥 Ángulos</span><span>${metrics.anglesChanged}</span></div>` +
      `<div class="row"><span>💬 Comentarios</span><span>${metrics.commentsSent}</span></div>`;
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
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadMetrics();
    renderReplays();
    renderComments();
    updateOrbit();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

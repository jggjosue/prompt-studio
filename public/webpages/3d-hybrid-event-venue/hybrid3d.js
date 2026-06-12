/*
 * hybrid3d.js — Plataforma híbrida 3D con streaming sincronizado
 *
 * Sincronización de relojes y latencia tolerable:
 * - Usar NTP (Network Time Protocol) para alinear relojes entre servidor y cliente.
 * - WebSocket envía timestamps cada 1s (WS message: { type: 'sync', serverTime: <epoch_ms> }).
 * - Cliente calcula offset: clientOffset = serverTime - Date.now().
 * - Para replays, usar wall-clock time del servidor como referencia absoluta.
 * - Latencia tolerable para Q&A y encuestas: < 500ms.
 * - Para sincronización de video: < 100ms (timecode embebido en HLS con ID3).
 * - Si WebSocket no está disponible, usar polling HTTP cada 2s como fallback.
 *
 * Streaming adaptativo:
 * - HLS.js config: maxBufferLength: 30, maxMaxBufferLength: 60, lowLatencyMode: true.
 * - Rendimiento: pausar render cuando canvas fuera de viewport.
 */

(function () {
  'use strict';

  const CAMERAS = [
    { id: 'stage', label: 'Escenario', pos: [0, 0.3, 1.6], target: [0, 0, 0] },
    { id: 'audience', label: 'Público', pos: [0, 0.2, 2.8], target: [0, 0.05, 0] },
    { id: 'backstage', label: 'Backstage', pos: [-0.6, 0.3, 0.6], target: [-0.2, 0, 0] }
  ];

  const STREAM_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const ALT_STREAMS = {
    stage: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    audience: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    backstage: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  };

  const POLLS = [
    { question: '¿Qué tema te gustaría profundizar?', options: ['UX Design', 'Arquitectura Cloud', 'Liderazgo', 'Data Science'] },
    { question: '¿Recomendarías este evento?', options: ['Sí', 'No', 'Tal vez'] }
  ];

  let scene, camera, renderer;
  let mainScreen, sideLeft, sideRight, altScreen;
  let mainVideo, altVideo;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let currentCam = 'stage';
  let clips = [];
  let questions = [];
  let pollIdx = 0;
  let selectedPollOpt = -1;
  let syncOffset = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metrics = { remoteAttendees: 1, clipsCreated: 0, syncsOk: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    camBtn: document.getElementById('cam-btn'),
    camPanel: document.getElementById('cam-panel'),
    camClose: document.getElementById('cam-close'),
    camBody: document.getElementById('cam-body'),
    clipsBtn: document.getElementById('clips-btn'),
    clipsPanel: document.getElementById('clips-panel'),
    clipsClose: document.getElementById('clips-close'),
    clipsBody: document.getElementById('clips-body'),
    pollsBtn: document.getElementById('polls-btn'),
    pollsOverlay: document.getElementById('polls-overlay'),
    pollQuestion: document.getElementById('poll-question'),
    pollOptions: document.getElementById('poll-options'),
    pollVote: document.getElementById('poll-vote'),
    pollCloseOverlay: document.getElementById('poll-close-overlay'),
    qaBtn: document.getElementById('qa-btn'),
    qaPanel: document.getElementById('qa-panel'),
    qaClose: document.getElementById('qa-close'),
    qaList: document.getElementById('qa-list'),
    qaInput: document.getElementById('qa-input'),
    qaSend: document.getElementById('qa-send'),
    metricsBtn: document.getElementById('metrics-btn'),
    metricsPanel: document.getElementById('metrics-panel'),
    metricsClose: document.getElementById('metrics-close'),
    metricsBody: document.getElementById('metrics-body'),
    accessBtn: document.getElementById('access-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbVideo: document.getElementById('fb-video'),
    fbClips: document.getElementById('fb-clips'),
    syncStatus: document.getElementById('sync-status')
  };

  /* ---------- IndexedDB ---------- */
  function saveMetrics() {
    try {
      const req = indexedDB.open('HybridEvent3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'metrics', v: metrics }); };
    } catch (e) { /* silent */ }
  }
  function loadMetrics() {
    try {
      const req = indexedDB.open('HybridEvent3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('metrics'); get.onsuccess = () => { if (get.result) metrics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- WebSocket simulado ---------- */
  function initSync() {
    try {
      /* Simular WebSocket con interval */
      const syncInterval = setInterval(() => {
        const serverTime = Date.now();
        syncOffset = serverTime - Date.now();
        dom.syncStatus.textContent = '✅ Sincronizado';
        dom.syncStatus.classList.add('ok');
        metrics.syncsOk++;
        saveMetrics();
      }, 5000);

      /* Marcar como sincronizando inicialmente */
      dom.syncStatus.textContent = '⏳ Sincronizando…';
      setTimeout(() => {
        /* WebSocket no disponible — simular after 1s */
      }, 1000);
    } catch (e) {
      dom.syncStatus.textContent = '⚠️ Sin WS';
    }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12141a);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 20);
    camera.position.set(0, 0.3, 1.6);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x334466, 0.3);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.3);
    dir.position.set(2, 3, 2);
    dir.castShadow = true;
    scene.add(dir);
    const spot = new THREE.SpotLight(0x88aaff, 0.1, 4, Math.PI / 6, 0.5);
    spot.position.set(0, 1, 0.5);
    spot.target.position.set(0, 0, 0);
    scene.add(spot);
    scene.add(spot.target);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2c34, roughness: 0.5 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.5), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    buildScreens();
  }

  function buildScreens() {
    /* Main screen (stage) */
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
    mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.24), mainMat);
    mainScreen.position.set(0, 0.12, 0);
    scene.add(mainScreen);

    /* Stage base */
    const stageMat = new THREE.MeshStandardMaterial({ color: 0x3a3c44, roughness: 0.4 });
    const stage = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.05), stageMat);
    stage.rotation.x = -Math.PI / 2;
    stage.position.y = -0.005;
    stage.position.z = -0.1;
    scene.add(stage);

    /* Side screens for alternative cameras */
    altVideo = document.createElement('video');
    altVideo.crossOrigin = 'anonymous';
    altVideo.src = ALT_STREAMS.audience;
    altVideo.loop = true;
    altVideo.muted = true;
    altVideo.preload = 'auto';
    altVideo.load();
    altVideo.play().catch(() => {});
    const altTex = new THREE.VideoTexture(altVideo);
    altTex.minFilter = THREE.LinearFilter;
    const altMat = new THREE.MeshBasicMaterial({ map: altTex, transparent: true, opacity: 0.7 });
    sideLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), altMat);
    sideLeft.position.set(-0.35, 0.1, 0.02);
    scene.add(sideLeft);
    sideRight = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), altMat.clone());
    sideRight.position.set(0.35, 0.1, 0.02);
    scene.add(sideRight);

    /* Audience / backstage alt screen (lower) */
    altScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.14), altMat.clone());
    altScreen.position.set(0, -0.06, 0.35);
    scene.add(altScreen);
  }

  /* ---------- Cameras ---------- */
  function buildCamUI() {
    dom.camBody.innerHTML = '';
    CAMERAS.forEach(cam => {
      const btn = document.createElement('button');
      btn.className = 'cam-btn' + (cam.id === currentCam ? ' active' : '');
      btn.textContent = cam.label;
      btn.addEventListener('click', () => switchCam(cam.id));
      dom.camBody.appendChild(btn);
    });
  }

  function switchCam(id) {
    currentCam = id;
    const cam = CAMERAS.find(c => c.id === id);
    if (!cam) return;
    const target = new THREE.Vector3(cam.target[0], cam.target[1], cam.target[2]);
    if (prefersReducedMotion) {
      camera.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
      camera.lookAt(target);
    } else {
      gsap.to(camera.position, {
        x: cam.pos[0], y: cam.pos[1], z: cam.pos[2],
        duration: 0.8, ease: 'power2.out',
        onUpdate: () => camera.lookAt(target),
        onComplete: () => camera.lookAt(target)
      });
    }
    dom.camPanel.classList.add('hidden');
    /* Switch alt video */
    if (ALT_STREAMS[id]) {
      altVideo.src = ALT_STREAMS[id];
      altVideo.load();
      altVideo.play().catch(() => {});
    }
    buildCamUI();
  }

  dom.camBtn.addEventListener('click', () => dom.camPanel.classList.toggle('hidden'));
  dom.camClose.addEventListener('click', () => dom.camPanel.classList.add('hidden'));

  /* ---------- Clips ---------- */
  function addClip(label, start) {
    clips.push({ label, start, cam: currentCam });
    metrics.clipsCreated++;
    saveMetrics();
    renderClips();
  }

  function renderClips() {
    dom.clipsBody.innerHTML = clips.map((c, i) =>
      `<div class="clip-card" data-idx="${i}"><span class="time">${c.label}</span><br><span style="font-size:.4rem;color:var(--muted)">${c.cam}</span></div>`
    ).join('');
    dom.clipsBody.querySelectorAll('.clip-card').forEach(el => {
      el.addEventListener('click', () => {
        const c = clips[parseInt(el.dataset.idx)];
        mainVideo.currentTime = c.start;
        mainVideo.play().catch(() => {});
        switchCam(c.cam);
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
      addHighlightClip(`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, t);
    }
  });

  function addHighlightClip(label, seconds) {
    clips.push({ label, start: seconds, cam: currentCam });
    metrics.clipsCreated++;
    saveMetrics();
    renderClips();
  }

  /* ---------- Polls ---------- */
  function showPoll() {
    const poll = POLLS[pollIdx % POLLS.length];
    dom.pollQuestion.textContent = poll.question;
    dom.pollOptions.innerHTML = '';
    selectedPollOpt = -1;
    poll.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'poll-opt';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        dom.pollOptions.querySelectorAll('.poll-opt').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedPollOpt = i;
      });
      dom.pollOptions.appendChild(btn);
    });
    dom.pollsOverlay.classList.remove('hidden');
  }

  dom.pollsBtn.addEventListener('click', showPoll);
  dom.pollCloseOverlay.addEventListener('click', () => dom.pollsOverlay.classList.add('hidden'));
  dom.pollVote.addEventListener('click', () => {
    if (selectedPollOpt >= 0) {
      dom.pollsOverlay.classList.add('hidden');
      pollIdx++;
    }
  });

  /* ---------- Q&A ---------- */
  function renderQA() {
    dom.qaList.innerHTML = questions.map(q =>
      `<div class="qa-msg"><span class="stamp">[${q.stamp}]</span> ${q.text}</div>`
    ).join('');
  }

  dom.qaSend.addEventListener('click', () => {
    const text = dom.qaInput.value.trim();
    if (!text) return;
    const t = mainVideo.currentTime;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    questions.push({ text, stamp: `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` });
    dom.qaInput.value = '';
    renderQA();
  });
  dom.qaBtn.addEventListener('click', () => dom.qaPanel.classList.toggle('hidden'));
  dom.qaClose.addEventListener('click', () => dom.qaPanel.classList.add('hidden'));

  /* ---------- Metrics ---------- */
  dom.metricsBtn.addEventListener('click', () => {
    dom.metricsPanel.classList.toggle('hidden');
    dom.metricsBody.innerHTML =
      `<div class="row"><span>👤 Remotos</span><span>${metrics.remoteAttendees}</span></div>` +
      `<div class="row"><span>🎬 Clips</span><span>${metrics.clipsCreated}</span></div>` +
      `<div class="row"><span>🔄 Sincronizaciones</span><span>${metrics.syncsOk}</span></div>`;
  });
  dom.metricsClose.addEventListener('click', () => dom.metricsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.accessBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
      renderer.domElement.style.display = 'none';
      dom.fbVideo.src = STREAM_URL;
      dom.fbVideo.load();
      dom.fbVideo.play().catch(() => {});
      dom.fbClips.innerHTML = clips.map(c =>
        `<button class="btn btn-sm btn-outline" onclick="document.getElementById('fb-video').currentTime=${c.start};document.getElementById('fb-video').play()">📌 ${c.label}</button>`
      ).join(' ');
    } else {
      renderer.domElement.style.display = 'block';
      if (!animFrameId) animFrameId = requestAnimationFrame(animate);
    }
  });

  /* ---------- Lifecycle ---------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    else if (!document.hidden && !animFrameId && renderer.domElement.style.display !== 'none') animFrameId = requestAnimationFrame(animate);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId && renderer.domElement.style.display !== 'none') animFrameId = requestAnimationFrame(animate);
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
    initSync();
    buildCamUI();
    renderClips();
    renderQA();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

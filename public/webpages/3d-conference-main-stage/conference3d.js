/*
 * conference3d.js — Conferencia virtual 3D
 *
 * Integración CDN:
 * - Los streams HLS deben servirse desde CDN configurada para entregar segmentos .ts y playlist .m3u8
 *   con cabeceras CORS (Access-Control-Allow-Origin: *).
 * - Usar Akamai, CloudFront o Cloudflare con caché de 10s para segmentos.
 * - Bitrate recomendado por resolución:
 *   1080p (Full HD) → 4-6 Mbps
 *   720p  (HD)       → 2-4 Mbps
 *   480p  (SD)       → 1-2 Mbps
 *   360p  (Low)      → 0.5-1 Mbps
 * - Para HLS.js configurar maxBufferLength: 30s, maxMaxBufferLength: 60s.
 *
 * Privacidad WebRTC:
 * - Antes de activar cámara/micrófono mostrar un diálogo informativo.
 * - No almacenar streams localmente sin consentimiento explícito.
 * - El panel Q&A no requiere permisos de micrófono (solo texto).
 */

(function () {
  'use strict';

  const SESSIONS = [
    { id: 'keynote', title: 'Keynote: El Futuro del Trabajo', time: '09:00', room: 'Escenario Principal', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', highlightClips: [
      { label: 'Apertura', start: 2 }, { label: 'Innovación', start: 5 }, { label: 'Cierre', start: 10 }
    ]},
    { id: 'room-a', title: 'UX en la Era AI', time: '10:30', room: 'Sala A', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', highlightClips: [
      { label: 'Introducción', start: 1 }, { label: 'Demo', start: 4 }
    ]},
    { id: 'room-b', title: 'Arquitectura Serverless', time: '11:45', room: 'Sala B', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', highlightClips: [
      { label: 'Caso práctico', start: 3 }
    ]},
    { id: 'room-c', title: 'Liderazgo Remoto', time: '14:00', room: 'Sala C', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', highlightClips: [
      { label: 'Estrategias', start: 0 }, { label: 'Q&A', start: 6 }
    ]}
  ];

  const HIGHLIGHT_SIDE_VIDEOS = [
    { label: 'Resumen del día', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
    { label: 'Entrevista keynote', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' }
  ];

  const CAMERA_ANGLES = {
    stage:  { pos: [0, 0.3, 1.8], target: [0, 0, 0] },
    audience: { pos: [0, 0.15, 2.8], target: [0, 0.05, 0] },
    side: { pos: [0.45, 0.3, 0.8], target: [0, 0, 0] }
  };

  let scene, camera, renderer;
  let mainVideo, leftVideo, rightVideo;
  let mainScreenMesh, leftScreenMesh, rightScreenMesh;
  let roomMeshes = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let currentSessionId = 'keynote';
  let highlights = [];
  let questions = [];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metrics = { plays: {}, clipsCreated: 0, questionsSent: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    agendaOverlay: document.getElementById('agenda-overlay'),
    agendaList: document.getElementById('agenda-list'),
    agendaCloseBtn: document.getElementById('agenda-close-btn'),
    anglesBtn: document.getElementById('angles-btn'),
    anglesPanel: document.getElementById('angles-panel'),
    anglesClose: document.getElementById('angles-close'),
    anglesBody: document.getElementById('angles-body'),
    highlightsBtn: document.getElementById('highlights-btn'),
    highlightsPanel: document.getElementById('highlights-panel'),
    highlightsClose: document.getElementById('highlights-close'),
    highlightsBody: document.getElementById('highlights-body'),
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
    lobbyBtn: document.getElementById('lobby-btn'),
    replayModal: document.getElementById('replay-modal'),
    replayVideo: document.getElementById('replay-video'),
    replayInfo: document.getElementById('replay-info'),
    replayClose: document.getElementById('replay-close')
  };

  /* ---------- IndexedDB ---------- */
  function saveMetrics() {
    try {
      const req = indexedDB.open('Conference3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'metrics', v: metrics }); };
    } catch (e) { /* silent */ }
  }
  function loadMetrics() {
    try {
      const req = indexedDB.open('Conference3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('metrics'); get.onsuccess = () => { if (get.result) metrics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12141a);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 20);
    camera.position.set(0, 0.4, 2.2);

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
    const spot = new THREE.SpotLight(0x88aaff, 0.15, 4, Math.PI / 6, 0.5);
    spot.position.set(0, 1.2, 0.5);
    spot.target.position.set(0, 0, 0);
    scene.add(spot);
    scene.add(spot.target);

    buildStage();
    buildRooms();
  }

  function buildStage() {
    /* Stage floor */
    const stageMat = new THREE.MeshStandardMaterial({ color: 0x2a2c34, roughness: 0.6, metalness: 0.1 });
    const stageFloor = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), stageMat);
    stageFloor.rotation.x = -Math.PI / 2;
    stageFloor.position.y = -0.01;
    stageFloor.receiveShadow = true;
    scene.add(stageFloor);

    /* Main screen (center) — large */
    mainVideo = document.createElement('video');
    mainVideo.crossOrigin = 'anonymous';
    mainVideo.src = SESSIONS[0].videoUrl;
    mainVideo.loop = true;
    mainVideo.muted = true;
    mainVideo.preload = 'auto';
    mainVideo.load();
    mainVideo.play().catch(() => {});
    const mainTex = new THREE.VideoTexture(mainVideo);
    mainTex.minFilter = THREE.LinearFilter;
    const mainMat = new THREE.MeshBasicMaterial({ map: mainTex });
    mainScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.2), mainMat);
    mainScreenMesh.position.set(0, 0.1, 0);
    scene.add(mainScreenMesh);

    /* Side screen left */
    leftVideo = document.createElement('video');
    leftVideo.crossOrigin = 'anonymous';
    leftVideo.src = HIGHLIGHT_SIDE_VIDEOS[0].url;
    leftVideo.loop = true;
    leftVideo.muted = true;
    leftVideo.preload = 'auto';
    leftVideo.load();
    leftVideo.play().catch(() => {});
    const leftTex = new THREE.VideoTexture(leftVideo);
    leftTex.minFilter = THREE.LinearFilter;
    const leftMat = new THREE.MeshBasicMaterial({ map: leftTex, transparent: true, opacity: 0.7 });
    leftScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), leftMat);
    leftScreenMesh.position.set(-0.3, 0.1, 0);
    scene.add(leftScreenMesh);

    /* Side screen right */
    rightVideo = document.createElement('video');
    rightVideo.crossOrigin = 'anonymous';
    rightVideo.src = HIGHLIGHT_SIDE_VIDEOS[1].url;
    rightVideo.loop = true;
    rightVideo.muted = true;
    rightVideo.preload = 'auto';
    rightVideo.load();
    rightVideo.play().catch(() => {});
    const rightTex = new THREE.VideoTexture(rightVideo);
    rightTex.minFilter = THREE.LinearFilter;
    const rightMat = new THREE.MeshBasicMaterial({ map: rightTex, transparent: true, opacity: 0.7 });
    rightScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), rightMat);
    rightScreenMesh.position.set(0.3, 0.1, 0);
    scene.add(rightScreenMesh);

    /* Stage pillars */
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3a3c44, roughness: 0.4 });
    [-0.35, 0.35].forEach(x => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), pillarMat);
      pillar.position.set(x, 0.175, 0.05);
      scene.add(pillar);
    });
  }

  function buildRooms() {
    const roomPositions = [
      { x: -0.5, z: -0.3, label: 'Sala A' },
      { x: 0.5, z: -0.3, label: 'Sala B' },
      { x: 0, z: -0.5, label: 'Sala C' }
    ];

    roomPositions.forEach((rp, idx) => {
      const g = new THREE.Group();
      g.position.set(rp.x, 0, rp.z);

      /* Room box */
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x22242c, roughness: 0.6, transparent: true, opacity: 0.6 });
      const room = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.15), wallMat);
      room.position.y = 0.08;
      g.add(room);

      /* Door glow */
      const doorMat = new THREE.MeshBasicMaterial({ color: 0x3a7acc, transparent: true, opacity: 0.2 });
      const door = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.08), doorMat);
      door.position.set(0, 0.08, 0.076);
      g.add(door);

      /* Label */
      const c = document.createElement('canvas');
      c.width = 128; c.height = 18;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 128, 18);
      ctx.fillStyle = '#e8e6e0';
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(rp.label, 64, 13);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.02), lMat);
      lMesh.position.set(0, -0.05, 0.08);
      g.add(lMesh);

      g.userData = { idx: idx };
      scene.add(g);
      roomMeshes.push(g);
    });
  }

  /* ---------- Agenda ---------- */
  function buildAgenda() {
    dom.agendaList.innerHTML = '';
    SESSIONS.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = 'agenda-item' + (i === 0 ? ' active' : '');
      item.innerHTML = `<span class="time">${s.time}</span> <strong>${s.title}</strong> <span class="room">— ${s.room}</span>`;
      item.addEventListener('click', () => {
        dom.agendaList.querySelectorAll('.agenda-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        currentSessionId = s.id;
        selectSession(s);
      });
      dom.agendaList.appendChild(item);
    });
  }

  dom.agendaCloseBtn.addEventListener('click', () => {
    dom.agendaOverlay.classList.add('hidden');
  });

  function selectSession(session) {
    dom.agendaOverlay.classList.add('hidden');
    /* Switch main video */
    const idx = SESSIONS.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      mainVideo.src = session.videoUrl;
      mainVideo.load();
      mainVideo.play().catch(() => {});
      metrics.plays[idx] = (metrics.plays[idx] || 0) + 1;
      saveMetrics();

      /* Fly to room */
      if (session.id === 'keynote') {
        flyToAngle('stage');
      } else {
        const roomIdx = idx - 1;
        if (roomIdx >= 0 && roomIdx < roomMeshes.length) {
          flyToRoom(roomMeshes[roomIdx]);
        }
      }
    }
  }

  /* ---------- Camera angles ---------- */
  function buildAnglesUI() {
    dom.anglesBody.innerHTML = '';
    Object.keys(CAMERA_ANGLES).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'angle-btn';
      btn.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      btn.addEventListener('click', () => flyToAngle(key));
      dom.anglesBody.appendChild(btn);
    });
  }

  function flyToAngle(key) {
    const angle = CAMERA_ANGLES[key];
    const target = new THREE.Vector3(angle.target[0], angle.target[1], angle.target[2]);
    if (prefersReducedMotion) {
      camera.position.set(angle.pos[0], angle.pos[1], angle.pos[2]);
      camera.lookAt(target);
    } else {
      gsap.to(camera.position, {
        x: angle.pos[0], y: angle.pos[1], z: angle.pos[2],
        duration: 0.9, ease: 'power2.out',
        onUpdate: () => camera.lookAt(target),
        onComplete: () => camera.lookAt(target)
      });
    }
    dom.anglesPanel.classList.add('hidden');
  }

  function flyToRoom(mesh) {
    const pos = new THREE.Vector3(); mesh.getWorldPosition(pos);
    const target = new THREE.Vector3(pos.x, 0.08, pos.z + 0.15);
    const lookAt = new THREE.Vector3(pos.x, 0, pos.z);
    if (prefersReducedMotion) {
      camera.position.copy(target); camera.lookAt(lookAt);
    } else {
      gsap.to(camera.position, {
        x: target.x, y: target.y, z: target.z,
        duration: 0.9, ease: 'power2.out',
        onUpdate: () => camera.lookAt(lookAt),
        onComplete: () => camera.lookAt(lookAt)
      });
    }
  }

  dom.anglesBtn.addEventListener('click', () => dom.anglesPanel.classList.toggle('hidden'));
  dom.anglesClose.addEventListener('click', () => dom.anglesPanel.classList.add('hidden'));

  /* ---------- Highlights ---------- */
  function addHighlight(label, start) {
    highlights.push({ label, start, sessionId: currentSessionId });
    metrics.clipsCreated++;
    saveMetrics();
    renderHighlights();
  }

  function renderHighlights() {
    dom.highlightsBody.innerHTML = highlights.map((h, i) =>
      `<div class="highlight-card" data-idx="${i}"><span class="time">${h.label}</span><br><span style="font-size:.42rem;color:var(--muted)">${h.sessionId} · ${h.start}s</span></div>`
    ).join('');

    dom.highlightsBody.querySelectorAll('.highlight-card').forEach(el => {
      el.addEventListener('click', () => {
        const h = highlights[parseInt(el.dataset.idx)];
        dom.replayVideo.src = SESSIONS.find(s => s.id === h.sessionId)?.videoUrl || SESSIONS[0].videoUrl;
        dom.replayVideo.load();
        dom.replayVideo.play().catch(() => {});
        setTimeout(() => { dom.replayVideo.currentTime = h.start; }, 300);
        dom.replayInfo.textContent = `${h.label} · ${h.sessionId} · ${h.start}s`;
        dom.replayModal.classList.remove('hidden');
      });
    });
  }

  dom.highlightsBtn.addEventListener('click', () => dom.highlightsPanel.classList.toggle('hidden'));
  dom.highlightsClose.addEventListener('click', () => dom.highlightsPanel.classList.add('hidden'));
  dom.replayClose.addEventListener('click', () => {
    dom.replayModal.classList.add('hidden');
    dom.replayVideo.pause();
    dom.replayVideo.src = '';
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
    const stamp = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    questions.push({ text, stamp, sessionId: currentSessionId });
    metrics.questionsSent++;
    saveMetrics();
    dom.qaInput.value = '';
    renderQA();
  });
  dom.qaBtn.addEventListener('click', () => dom.qaPanel.classList.toggle('hidden'));
  dom.qaClose.addEventListener('click', () => dom.qaPanel.classList.add('hidden'));

  /* ---------- Metrics ---------- */
  dom.metricsBtn.addEventListener('click', () => {
    dom.metricsPanel.classList.toggle('hidden');
    const totalPlays = Object.values(metrics.plays).reduce((a, b) => a + b, 0);
    dom.metricsBody.innerHTML =
      `<div class="row"><span>▶ Reproducciones</span><span>${totalPlays}</span></div>` +
      `<div class="row"><span>⭐ Clips</span><span>${metrics.clipsCreated}</span></div>` +
      `<div class="row"><span>💬 Preguntas</span><span>${metrics.questionsSent}</span></div>`;
  });
  dom.metricsClose.addEventListener('click', () => dom.metricsPanel.classList.add('hidden'));

  /* ---------- Lobby ---------- */
  dom.lobbyBtn.addEventListener('click', () => {
    flyToAngle('audience');
    dom.anglesPanel.classList.add('hidden');
    dom.highlightsPanel.classList.add('hidden');
    dom.qaPanel.classList.add('hidden');
    dom.metricsPanel.classList.add('hidden');
  });

  /* ---------- Raycaster click on rooms ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);

    const allMeshes = [];
    roomMeshes.forEach(g => { g.children.forEach(c => { if (c.isMesh) allMeshes.push(c); }); });
    [mainScreenMesh, leftScreenMesh, rightScreenMesh].forEach(m => { if (m) allMeshes.push(m); });

    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length) {
      for (let mi = 0; mi < roomMeshes.length; mi++) {
        for (let c = 0; c < roomMeshes[mi].children.length; c++) {
          if (hits[0].object === roomMeshes[mi].children[c]) {
            const session = SESSIONS[mi + 1]; // rooms a,b,c are index 1,2,3
            if (session) selectSession(session);
            return;
          }
        }
      }
      /* Click on main screen = keynote */
      if (hits[0].object === mainScreenMesh) {
        selectSession(SESSIONS[0]);
      }
    }
  });

  /* ---------- Keyboard shortcut for highlights ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' && !e.ctrlKey && !e.metaKey) {
      const t = mainVideo.currentTime;
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      const label = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      addHighlight(`Clip ${label}`, t);
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
    buildAgenda();
    buildAnglesUI();
    renderHighlights();
    renderQA();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

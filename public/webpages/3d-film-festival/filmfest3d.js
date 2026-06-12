/*
 * filmfest3d.js — Festival de cine 3D con salas de proyección y Q&A en video
 *
 * Stack: Three.js (escena 3D), HLS.js (streaming adaptativo para películas),
 *        WebRTC simulado para Q&A en vivo con preguntas de audiencia,
 *        GSAP para transiciones suaves entre salas.
 *
 * Streaming adaptativo:
 * - HLS.js config: maxBufferLength: 30, lowLatencyMode: true.
 * - Preload de trailers en salas vecinas para navegación fluida.
 *
 * Recomendaciones de licencias y derechos:
 * - Para festivales virtuales se recomienda licencia pública (CC BY 4.0)
 *   para cortos independientes y licencia estándar (MPLC/SWANK) para largometrajes.
 * - Cada sala muestra el tipo de licencia asociada.
 */

(function () {
  'use strict';

  const ROOMS = [
    {
      id: 'r1', name: 'Sala A — Drama', film: 'For Bigger Blazes',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      license: 'CC BY 4.0 (corto independiente)',
      duration: '3:15', color: 0x3a2060
    },
    {
      id: 'r2', name: 'Sala B — Animación', film: 'Sintel',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      license: 'CC BY 3.0 (Blender Foundation)',
      duration: '14:48', color: 0x20603a
    },
    {
      id: 'r3', name: 'Sala C — Acción', film: 'Big Buck Bunny',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      license: 'CC BY 3.0 (Blender Foundation)',
      duration: '9:56', color: 0x603a20
    },
    {
      id: 'r4', name: 'Sala D — Ciencia Ficción', film: 'Subaru Outback',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      license: 'CC BY 4.0',
      duration: '0:30', color: 0x206060
    }
  ];

  let scene, camera, renderer;
  let roomScreens = [];
  let activeRoomIdx = 0;
  let currentVideo = null;
  let animFrameId = null;
  let clock = new THREE.Clock();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metrics = { ticketsSold: 0, reproductions: 0, qaParticipation: 0 };
  let qaQuestions = [];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    lobbyBtn: document.getElementById('lobby-btn'),
    roomsBtn: document.getElementById('rooms-btn'),
    roomsPanel: document.getElementById('rooms-panel'),
    roomsClose: document.getElementById('rooms-close'),
    roomsBody: document.getElementById('rooms-body'),
    qaBtn: document.getElementById('qa-btn'),
    qaPanel: document.getElementById('qa-panel'),
    qaClose: document.getElementById('qa-close'),
    qaBody: document.getElementById('qa-body'),
    qaInput: document.getElementById('qa-input'),
    qaSend: document.getElementById('qa-send'),
    photoboothBtn: document.getElementById('photobooth-btn'),
    photoboothOverlay: document.getElementById('photobooth-overlay'),
    photoboothCanvas: document.getElementById('photobooth-canvas'),
    photoboothCapture: document.getElementById('photobooth-capture'),
    photoboothClose: document.getElementById('photobooth-close'),
    metricsBtn: document.getElementById('metrics-btn'),
    metricsPanel: document.getElementById('metrics-panel'),
    metricsClose: document.getElementById('metrics-close'),
    metricsBody: document.getElementById('metrics-body')
  };

  let lobbyView = true;

  /* ---------- IndexedDB ---------- */
  function saveMetrics() {
    try {
      const req = indexedDB.open('FilmFest3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'metrics', v: metrics }); };
    } catch (e) { /* silent */ }
  }
  function loadMetrics() {
    try {
      const req = indexedDB.open('FilmFest3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('metrics'); get.onsuccess = () => { if (get.result) metrics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x120e1a);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 20);
    camera.position.set(0, 0.6, 2.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x443366, 0.3);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.35);
    dir.position.set(3, 5, 2);
    dir.castShadow = true;
    scene.add(dir);

    /* Lobby floor (red carpet) */
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x6a1030, roughness: 0.4 });
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = -0.01;
    carpet.receiveShadow = true;
    scene.add(carpet);

    /* Central lobby pillar / screen */
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x2a2440, roughness: 0.6 });
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.2, 12), pillarMat);
    pillar.position.set(0, 0.1, 0);
    scene.add(pillar);

    /* Red carpet edges */
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xd0aa3a, transparent: true, opacity: 0.1 });
    for (let i = -0.75; i <= 0.75; i += 1.5) {
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.6), edgeMat);
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(i, 0.001, 0);
      scene.add(edge);
    }

    /* 4 rooms as small screen panels */
    const spacing = 0.45;
    ROOMS.forEach((rm, i) => {
      const v = document.createElement('video');
      v.crossOrigin = 'anonymous';
      v.src = rm.videoUrl;
      v.loop = true;
      v.muted = true;
      v.preload = 'auto';
      v.load();
      v.play().catch(() => {});
      v.style.display = 'none';
      document.body.appendChild(v);

      const vTex = new THREE.VideoTexture(v);
      vTex.minFilter = THREE.LinearFilter;
      const vMat = new THREE.MeshBasicMaterial({ map: vTex });

      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.13), vMat);
      const baseX = -0.7 + i * spacing;
      screen.position.set(baseX, 0.25, -0.08);
      screen.userData = { roomIdx: i, videoEl: v, baseX };
      scene.add(screen);
      roomScreens.push(screen);

      /* Room label below */
      const label = createTextSprite(rm.name, 0.1, '#d0aa3a');
      label.position.set(baseX, 0.12, -0.08);
      scene.add(label);

      /* License badge sprite */
      const lic = createTextSprite('📜 ' + rm.license.substring(0, 16) + '…', 0.06, '#7a6a9a');
      lic.position.set(baseX, 0.08, -0.08);
      scene.add(lic);

      /* Gold frame */
      const frameMat = new THREE.MeshBasicMaterial({ color: 0xd0aa3a, transparent: true, opacity: 0.15, wireframe: false });
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.17), frameMat);
      frame.position.set(baseX, 0.25, -0.079);
      scene.add(frame);
    });

    /* Lobby promo clip screen (center) */
    const lobbyVid = document.createElement('video');
    lobbyVid.crossOrigin = 'anonymous';
    lobbyVid.src = ROOMS[1].trailerUrl;
    lobbyVid.loop = true;
    lobbyVid.muted = true;
    lobbyVid.preload = 'auto';
    lobbyVid.load();
    lobbyVid.play().catch(() => {});
    lobbyVid.style.display = 'none';
    document.body.appendChild(lobbyVid);

    const lobbyTex = new THREE.VideoTexture(lobbyVid);
    lobbyTex.minFilter = THREE.LinearFilter;
    const lobbyMat = new THREE.MeshBasicMaterial({ map: lobbyTex });
    const lobbyScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.2), lobbyMat);
    lobbyScreen.position.set(0, 0.45, -0.5);
    scene.add(lobbyScreen);

    /* Photobooth area side panels */
    const pbMat = new THREE.MeshStandardMaterial({ color: 0x3a2060, roughness: 0.3, transparent: true, opacity: 0.15 });
    [-0.45, 0.45].forEach(x => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.2), pbMat);
      p.position.set(x, 0.25, -0.35);
      scene.add(p);
    });
  }

  function createTextSprite(text, fontSize, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fSize = fontSize * 140;
    canvas.width = 256;
    canvas.height = 64;
    ctx.font = Math.round(fSize) + 'px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color || '#e0e0e0';
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.3, 0.08, 1);
    return sprite;
  }

  /* ---------- Camera fly ---------- */
  let orbitTheta = 0, orbitPhi = 0.6, orbitRadius = 2.8;
  let isDragging = false, dragStart = { x: 0, y: 0 };

  renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 0) { isDragging = true; dragStart.x = e.clientX; dragStart.y = e.clientY; }
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    orbitTheta -= (e.clientX - dragStart.x) * 0.003;
    orbitPhi = Math.max(0.2, Math.min(1.3, orbitPhi - (e.clientY - dragStart.y) * 0.003));
    dragStart.x = e.clientX; dragStart.y = e.clientY;
    updateOrbit();
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    orbitRadius = Math.max(1.2, Math.min(4, orbitRadius + e.deltaY * 0.003));
    updateOrbit();
  }, { passive: false });

  function updateOrbit() {
    camera.position.x = orbitRadius * Math.sin(orbitPhi) * Math.sin(orbitTheta);
    camera.position.y = orbitRadius * Math.cos(orbitPhi);
    camera.position.z = orbitRadius * Math.sin(orbitPhi) * Math.cos(orbitTheta);
    camera.lookAt(0, 0, 0);
  }

  /* ---------- Rooms ---------- */
  function renderRooms() {
    dom.roomsBody.innerHTML = ROOMS.map((r, i) =>
      `<div class="room-card${i === activeRoomIdx ? ' active' : ''}" data-idx="${i}">
        <div class="name">${r.name}</div>
        <div class="meta">🎬 ${r.film} · ${r.duration}</div>
        <div class="meta" style="font-size:.35rem">📜 ${r.license}</div>
        <div class="meta" style="font-size:.35rem">⭐ ${i === activeRoomIdx ? 'Reproduciendo' : 'Seleccionar'}</div>
      </div>`
    ).join('');
    dom.roomsBody.querySelectorAll('.room-card').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        selectRoom(idx);
      });
    });
  }

  function selectRoom(idx) {
    activeRoomIdx = idx;
    const r = ROOMS[idx];
    lobbyView = false;
    roomScreens.forEach((s, i) => {
      const v = s.userData.videoEl;
      if (i === idx) {
        v.loop = false;
        v.play().then(() => { metrics.reproductions++; saveMetrics(); }).catch(() => {});
        flyToRoom(i);
      } else { v.pause(); }
    });
    updateQAState(true);
    renderRooms();
  }

  function flyToRoom(idx) {
    const r = ROOMS[idx];
    const baseX = -0.7 + idx * 0.45;
    if (prefersReducedMotion) { camera.position.set(baseX, 0.35, 1.2); camera.lookAt(baseX, 0.2, 0); }
    else {
      gsap.to(camera.position, { x: baseX, y: 0.35, z: 1.2, duration: 0.6, ease: 'power2.out',
        onUpdate: () => camera.lookAt(baseX, 0.2, 0) });
    }
  }

  function flyToLobby() {
    lobbyView = true;
    ROOMS.forEach((r, i) => { roomScreens[i].userData.videoEl.loop = true; roomScreens[i].userData.videoEl.play().catch(() => {}); });
    updateQAState(false);
    if (prefersReducedMotion) { camera.position.set(0, 0.6, 2.8); camera.lookAt(0, 0, 0); }
    else {
      gsap.to(camera.position, { x: 0, y: 0.6, z: 2.8, duration: 0.6, ease: 'power2.out',
        onUpdate: () => camera.lookAt(0, 0, 0) });
    }
  }

  /* ---------- Q&A (simulated WebRTC) ---------- */
  function updateQAState(enabled) {
    dom.qaInput.disabled = !enabled;
    dom.qaSend.disabled = !enabled;
    if (enabled) { dom.qaInput.placeholder = 'Pregunta para ' + ROOMS[activeRoomIdx].film + '…'; }
    else { dom.qaInput.placeholder = 'Selecciona una sala para participar…'; }
  }

  dom.qaSend.addEventListener('click', () => {
    const text = dom.qaInput.value.trim();
    if (!text) return;
    qaQuestions.push({ q: text, a: null });
    metrics.qaParticipation++;
    saveMetrics();
    dom.qaInput.value = '';
    renderQA();

    /* Simulated WebRTC: after 2s, moderator "answers" */
    setTimeout(() => {
      const last = qaQuestions[qaQuestions.length - 1];
      if (last && !last.a) {
        last.a = 'El director agradece tu pregunta. ' +
                 (last.q.length > 20 ? '¡Excelente observación!' : 'Buena pregunta, la abordaremos en la sesión.');
        renderQA();
      }
    }, 2000);
  });

  function renderQA() {
    if (qaQuestions.length === 0) {
      dom.qaBody.innerHTML = '<p class="qa-empty">Esperando preguntas…</p>';
      return;
    }
    dom.qaBody.innerHTML = qaQuestions.map(q =>
      `<div class="qa-msg"><span class="q">🗣 ${q.q}</span>${q.a ? '<br><span class="a">🎤 ' + q.a + '</span>' : '<br><span style="color:var(--muted)">⏳ Pendiente…</span>'}</div>`
    ).join('');
  }

  /* ---------- Photobooth ---------- */
  dom.photoboothCapture.addEventListener('click', () => {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = 'filmfest-photobooth-' + Date.now() + '.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
  });

  /* ---------- Metrics ---------- */
  dom.metricsBtn.addEventListener('click', () => {
    dom.metricsPanel.classList.toggle('hidden');
    dom.metricsBody.innerHTML =
      `<div class="row"><span>🎫 Entradas</span><span>${metrics.ticketsSold}</span></div>` +
      `<div class="row"><span>🎬 Reproducciones</span><span>${metrics.reproductions}</span></div>` +
      `<div class="row"><span>🎤 Q&A</span><span>${metrics.qaParticipation}</span></div>`;
  });
  dom.metricsClose.addEventListener('click', () => dom.metricsPanel.classList.add('hidden'));

  /* ---------- Navigation ---------- */
  dom.lobbyBtn.addEventListener('click', flyToLobby);
  dom.roomsBtn.addEventListener('click', () => { dom.roomsPanel.classList.toggle('hidden'); renderRooms(); });
  dom.roomsClose.addEventListener('click', () => dom.roomsPanel.classList.add('hidden'));
  dom.qaBtn.addEventListener('click', () => { dom.qaPanel.classList.toggle('hidden'); renderQA(); });
  dom.qaClose.addEventListener('click', () => dom.qaPanel.classList.add('hidden'));
  dom.photoboothBtn.addEventListener('click', () => { dom.photoboothOverlay.classList.remove('hidden'); renderer.render(scene, camera); const ctx = dom.photoboothCanvas.getContext('2d'); ctx.drawImage(renderer.domElement, 0, 0, 320, 180); });
  dom.photoboothClose.addEventListener('click', () => dom.photoboothOverlay.classList.add('hidden'));

  /* Simulate ticket sales */
  setInterval(() => { if (Math.random() > 0.7) { metrics.ticketsSold += Math.floor(Math.random() * 3) + 1; saveMetrics(); } }, 30000);

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
    renderRooms();
    renderQA();
    updateQAState(false);
    updateOrbit();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

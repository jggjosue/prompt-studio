(function () {
  'use strict';

  const SESSIONS = [
    {
      title: 'Mindfulness matutino',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      guideUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      caption: 'Respiración guiada y escaneo corporal para empezar el día con calma.',
      transcript: 'Inhala profundamente… 4 segundos. Sostén… 4 segundos. Exhala lentamente… 6 segundos. Nota las sensaciones en tu cuerpo sin juzgar.',
      color: 0x4a7a5a
    },
    {
      title: 'Enfoque profundo',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      guideUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      caption: 'Técnica Pomodoro con intervalos de concentración y pausas conscientes.',
      transcript: '25 minutos de enfoque total. Sin distracciones. Si tu mente divaga, vuelve suavemente a la respiración.',
      color: 0x3a6a8a
    },
    {
      title: 'Visualización creativa',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      guideUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      caption: 'Visualiza tus metas con claridad. Sesión guiada con música ambiental.',
      transcript: 'Imagina un lugar seguro. Cada detalle: colores, sonidos, texturas. Este espacio es tuyo.',
      color: 0x6a4a7a
    }
  ];

  const STATION_RADIUS = 0.15;
  const STATIONS_Y = 0.05;
  const ANGLE_STEP = (Math.PI * 2) / SESSIONS.length;

  let scene, camera, renderer;
  let stationGroups = [];
  let dimOverlay = null;
  let sessionVideo, sessionTimerInterval;
  let animFrameId = null;
  let clock = new THREE.Clock();

  let analytics = { sessions: {}, totalTime: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    sessionPanel: document.getElementById('session-panel'),
    sessionClose: document.getElementById('session-close'),
    sessionVideo: document.getElementById('session-video'),
    sessionTimer: document.getElementById('session-timer'),
    sessionMeta: document.getElementById('session-meta'),
    sessionSub: document.getElementById('session-sub'),
    durSelect: document.getElementById('dur-select'),
    downloadTranscriptBtn: document.getElementById('download-transcript-btn'),
    livecoachBtn: document.getElementById('livecoach-btn'),
    livecPanel: document.getElementById('livecoach-panel'),
    livecClose: document.getElementById('livecoach-close'),
    livecStart: document.getElementById('livec-start'),
    livecPreview: document.getElementById('livec-preview'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbSessions: document.getElementById('fb-sessions')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('Coach3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('Coach3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeaf0ec);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 0.6, 2.5);
    camera.lookAt(0, 0.05, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffeedd, 0.35);
    key.position.set(2, 4, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xccddcc, 0.2);
    fill.position.set(-2, 1, 2);
    scene.add(fill);

    /* Floor circle */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd8e0d8, roughness: 0.7, metalness: 0.05, transparent: true, opacity: 0.6 });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.08;
    scene.add(floor);

    buildStations();
  }

  function buildStations() {
    SESSIONS.forEach((s, i) => {
      const angle = i * ANGLE_STEP;
      const x = Math.sin(angle) * 0.5;
      const z = Math.cos(angle) * 0.5;

      const g = new THREE.Group();
      g.position.set(x, STATIONS_Y, z);

      /* Base platform */
      const baseMat = new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.7 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(STATION_RADIUS, STATION_RADIUS * 1.2, 0.04, 20), baseMat);
      g.add(base);

      /* Screen / video texture */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = s.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      const sMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(STATION_RADIUS * 1.6, STATION_RADIUS * 1.2), sMat);
      screen.position.y = 0.08;
      g.add(screen);

      /* Glow ring */
      const glowMat = new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const glow = new THREE.Mesh(new THREE.RingGeometry(STATION_RADIUS * 0.8, STATION_RADIUS * 1.0, 24), glowMat);
      glow.position.y = -0.02;
      glow.rotation.x = -Math.PI / 2;
      g.add(glow);

      g.userData = { idx: i };
      scene.add(g);
      stationGroups.push(g);
    });
  }

  /* ---------- Click to start session ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    stationGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < stationGroups.length; i++) {
        for (let j = 0; j < stationGroups[i].children.length; j++) {
          if (hits[0].object === stationGroups[i].children[j]) { startSession(stationGroups[i].userData.idx); return; }
        }
      }
    }
  });

  function startSession(idx) {
    const s = SESSIONS[idx];
    dom.sessionVideo.src = s.guideUrl;
    dom.sessionVideo.load();
    dom.sessionVideo.play().catch(() => {});
    dom.sessionMeta.textContent = s.title;
    dom.sessionSub.textContent = s.caption;

    /* Dim scene */
    if (!dimOverlay) {
      dimOverlay = document.createElement('div');
      dimOverlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.4);z-index:3;pointer-events:none;transition:opacity .4s';
      document.getElementById('main').appendChild(dimOverlay);
    }
    dimOverlay.style.opacity = '1';

    /* Timer */
    const durMin = parseInt(dom.durSelect.value);
    let remaining = durMin * 60;
    updateTimerDisplay(remaining);
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = setInterval(() => {
      remaining--;
      updateTimerDisplay(remaining);
      if (remaining <= 0) clearInterval(sessionTimerInterval);
    }, 1000);

    dom.sessionPanel.classList.remove('hidden');

    analytics.sessions[idx] = (analytics.sessions[idx] || 0) + 1;
    analytics.totalTime += remaining;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 1.3, duration: 0.6 });
    } else {
      camera.position.z = 1.3;
    }
  }

  function updateTimerDisplay(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    dom.sessionTimer.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  dom.sessionClose.addEventListener('click', () => {
    dom.sessionPanel.classList.add('hidden');
    dom.sessionVideo.pause();
    clearInterval(sessionTimerInterval);
    if (dimOverlay) dimOverlay.style.opacity = '0';
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 2.5, duration: 0.4 });
    } else {
      camera.position.z = 2.5;
    }
  });

  /* ---------- Download transcript ---------- */
  dom.downloadTranscriptBtn.addEventListener('click', () => {
    const activeSesh = SESSIONS[0]; /* simplified */
    const blob = new Blob([activeSesh.transcript], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = 'transcripcion.txt';
    a.href = URL.createObjectURL(blob);
    a.click();
  });

  /* ---------- Live coaching ---------- */
  dom.livecoachBtn.addEventListener('click', () => dom.livecPanel.classList.toggle('hidden'));
  dom.livecClose.addEventListener('click', () => {
    dom.livecPanel.classList.add('hidden');
    if (dom.livecPreview.srcObject) {
      dom.livecPreview.srcObject.getTracks().forEach(t => t.stop());
      dom.livecPreview.srcObject = null;
    }
  });

  dom.livecStart.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      dom.livecPreview.srcObject = stream;
      dom.livecPreview.classList.remove('hidden');
      dom.livecStart.textContent = '✅ Cámara activa';
      dom.livecStart.disabled = true;
    } catch (e) {
      dom.livecStart.textContent = '❌ Permiso denegado';
    }
  });

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const total = Object.values(analytics.sessions).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Sesiones</span><span>${total}</span></div>
      <div class="analytics-row"><span>⏱ Tiempo total</span><span>${Math.round(analytics.totalTime / 60)} min</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      dom.fbSessions.innerHTML = '';
      SESSIONS.forEach((s) => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `<video controls preload="metadata" src="${s.guideUrl}"></video><div><h3>${s.title}</h3><p>${s.caption}</p></div>`;
        dom.fbSessions.appendChild(card);
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
    stationGroups.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.position.y = STATIONS_Y + Math.sin(t * 0.3 + i * 1.5) * 0.004;
        g.rotation.y = t * 0.02 + i * 0.5;
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

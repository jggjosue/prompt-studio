/*
 * lobby3d.js — Lobby 3D interactivo para coworking
 *
 * Licencias de assets:
 * - Modelos GLB: deben tener licencia royalty-free (Sketchfab CC-BY, Poly Haven, o propios).
 * - Videos de bienvenida: contar con autorización expresa de los ocupantes del coworking.
 * - Locuciones y SRT: producidos internamente o con licencia de uso comercial.
 *
 * Recomendaciones de compresión:
 * - Video: H.265 (HEVC) 720p a 2 Mbps para streaming; generar proxy 480p a 0.8 Mbps.
 * - Audio: AAC 128 kbps estéreo.
 * - GLB: exportar con Draco encoder (compresión ~60-80% en geometría).
 * - Thumbnails WebP 512px con calidad 80.
 * - FFmpeg proxy: ffmpeg -i input.mp4 -vf scale=854:-2 -c:v libx265 -crf 30 -tag:v hvc1 proxy.mp4
 */

(function () {
  'use strict';

  const ZONES = [
    {
      id: 'reception',
      label: 'Recepción',
      key: '1',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      video480p: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      srt: 'Bienvenido a nuestro coworking. Aquí encontrará recepción, atención personalizada y toda la información sobre nuestros espacios.',
      duration: 25,
      position: [0, 0.2, 1.2],
      lookAt: [0, 0, 0.3]
    },
    {
      id: 'meeting-rooms',
      label: 'Salas de reuniones',
      key: '2',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      video480p: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      srt: 'Nuestras salas de reuniones están equipadas con pantalla interactiva, videoconferencia y capacidad para hasta 10 personas. Reserve por hora o medio día.',
      duration: 40,
      position: [-0.5, 0.2, 0.7],
      lookAt: [-0.5, 0, 0.3]
    },
    {
      id: 'open-area',
      label: 'Área abierta',
      key: '3',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      video480p: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      srt: 'El área abierta cuenta con 30 puestos hot-desk, iluminación natural, cabinas acústicas y café de especialidad gratuito.',
      duration: 35,
      position: [0.5, 0.2, 0.7],
      lookAt: [0.5, 0, 0.3]
    }
  ];

  let scene, camera, renderer;
  let hotspotMeshes = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let activeZoneIdx = -1;
  let tourActive = false;
  let tourIdx = 0;
  let lastProxIdx = -1;
  let orbitTheta = 0, orbitPhi = Math.PI / 3.5, orbitRadius = 2.8;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let analytics = { views: {}, playbackTime: 0, tourRoutes: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    tourBtn: document.getElementById('tour-btn'),
    mapBtn: document.getElementById('map-btn'),
    mapPanel: document.getElementById('map-panel'),
    mapClose: document.getElementById('map-close'),
    mapBody: document.getElementById('map-body'),
    videoOverlay: document.getElementById('video-overlay'),
    lobbyVideo: document.getElementById('lobby-video'),
    lobbyVideoInfo: document.getElementById('lobby-video-info'),
    lobbySrt: document.getElementById('lobby-srt'),
    srtDownload: document.getElementById('srt-download'),
    videoClose: document.getElementById('video-close'),
    transcriptBtn: document.getElementById('transcript-btn'),
    transcriptPanel: document.getElementById('transcript-panel'),
    transcriptClose: document.getElementById('transcript-close'),
    transcriptBody: document.getElementById('transcript-body'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body')
  };

  /* ---------- IndexedDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('Lobby3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* silent */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('Lobby3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2efe8);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 20);
    camera.position.set(0, 0.5, 2.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xfff8f0, 0.6);
    scene.add(amb);
    const hemi = new THREE.HemisphereLight(0xffeedd, 0x889988, 0.3);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.4);
    dir.position.set(2, 4, 3);
    dir.castShadow = true;
    scene.add(dir);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.6 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Reception desk */
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.5 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.15), deskMat);
    desk.position.set(0, 0.05, 0.8);
    desk.castShadow = true;
    scene.add(desk);

    /* Info screen panel (center) */
    const screenMat2 = new THREE.MeshStandardMaterial({ color: 0x2a4a5a, roughness: 0.3, metalness: 0.1 });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.18), screenMat2);
    panel.position.set(0, 0.18, 0.25);
    scene.add(panel);

    /* Pillars */
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xe0dbd4, roughness: 0.3 });
    [[-0.7, 0.7], [0.7, 0.7], [-0.7, -0.3], [0.7, -0.3]].forEach(([x, z]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3), pillarMat);
      p.position.set(x, 0.15, z);
      scene.add(p);
    });

    buildHotspots();
  }

  function buildHotspots() {
    ZONES.forEach((z, idx) => {
      const g = new THREE.Group();
      g.position.set(z.position[0], z.position[1], z.position[2]);

      /* Door frame */
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a5a6a, roughness: 0.4, metalness: 0.05 });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.02), frameMat);
      frame.position.y = 0.07;
      g.add(frame);

      /* Glow behind */
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x3a7acc, transparent: true, opacity: 0.15 });
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.16), glowMat);
      glow.position.set(0, 0.07, -0.02);
      g.add(glow);

      /* Label */
      const c = document.createElement('canvas');
      c.width = 128; c.height = 16;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, 128, 16);
      ctx.fillStyle = '#fff';
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(z.label, 64, 11);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.02), lMat);
      lMesh.position.set(0, -0.08, 0.015);
      g.add(lMesh);

      /* Video plane (texture) */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = z.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const vidTex = new THREE.VideoTexture(vid);
      vidTex.minFilter = THREE.LinearFilter;
      const vMat = new THREE.MeshBasicMaterial({ map: vidTex, transparent: true, opacity: 0.6 });
      const vScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.04), vMat);
      vScreen.position.set(0, 0.07, 0.015);
      g.add(vScreen);

      g.userData = { idx, origScale: 1, vidTex };
      g.element = { ariaLabel: z.label };
      scene.add(g);
      hotspotMeshes.push(g);
    });
  }

  /* ---------- Orbit controls ---------- */
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 0) { isDragging = true; dragStart.x = e.clientX; dragStart.y = e.clientY; }
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    orbitTheta -= (e.clientX - dragStart.x) * 0.004;
    orbitPhi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, orbitPhi - (e.clientY - dragStart.y) * 0.004));
    dragStart.x = e.clientX; dragStart.y = e.clientY;
    updateOrbitCam();
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    orbitRadius = Math.max(1.4, Math.min(5, orbitRadius + e.deltaY * 0.003));
    updateOrbitCam();
  }, { passive: false });

  function updateOrbitCam() {
    camera.position.x = orbitRadius * Math.sin(orbitPhi) * Math.sin(orbitTheta);
    camera.position.y = orbitRadius * Math.cos(orbitPhi);
    camera.position.z = orbitRadius * Math.sin(orbitPhi) * Math.cos(orbitTheta);
    camera.lookAt(0, 0, 0.3);
  }

  /* ---------- Proximity ---------- */
  function checkProximity() {
    if (!scene || !camera) return;
    let closest = -1;
    let minDist = Infinity;
    hotspotMeshes.forEach((g, i) => {
      const pos = new THREE.Vector3(); g.getWorldPosition(pos);
      const dist = camera.position.distanceTo(pos);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    if (closest !== lastProxIdx) {
      if (lastProxIdx >= 0 && lastProxIdx < hotspotMeshes.length) {
        gsap.to(hotspotMeshes[lastProxIdx].scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        const g = hotspotMeshes[lastProxIdx];
        g.children.forEach(c => { if (c.material && c.material.opacity !== undefined && c.material.color) { c.material.opacity = 0.15; } });
      }
      lastProxIdx = closest;
      if (closest >= 0 && minDist < 3.5) {
        const g = hotspotMeshes[closest];
        gsap.to(g.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.3, ease: 'power2.out' });
        g.children.forEach(c => { if (c.material && c.material.opacity !== undefined && c.material.color) { c.material.opacity = 0.35; } });
      }
    }
  }

  /* ---------- Click ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const all = [];
    hotspotMeshes.forEach(g => { g.children.forEach(c => { if (c.isMesh) all.push(c); }); });
    const hits = raycaster.intersectObjects(all);
    if (hits.length) {
      for (let i = 0; i < hotspotMeshes.length; i++) {
        for (let c = 0; c < hotspotMeshes[i].children.length; c++) {
          if (hits[0].object === hotspotMeshes[i].children[c]) {
            openVideo(i);
            return;
          }
        }
      }
    }
  });

  /* Detectar double-tap en móvil */
  let lastTap = 0;
  renderer.domElement.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 350) {
      const touch = e.changedTouches[0];
      const rect = renderer.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((touch.clientX - rect.left) / rect.width) * 2 - 1,
        -((touch.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);
      const all = [];
      hotspotMeshes.forEach(g => { g.children.forEach(c => { if (c.isMesh) all.push(c); }); });
      const hits = raycaster.intersectObjects(all);
      if (hits.length) {
        for (let i = 0; i < hotspotMeshes.length; i++) {
          for (let c = 0; c < hotspotMeshes[i].children.length; c++) {
            if (hits[0].object === hotspotMeshes[i].children[c]) {
              openVideo(i);
              return;
            }
          }
        }
      }
    }
    lastTap = now;
  });

  /* ---------- Video overlay ---------- */
  function openVideo(idx) {
    activeZoneIdx = idx;
    const z = ZONES[idx];
    dom.lobbyVideo.src = z.videoUrl;
    dom.lobbyVideo.load();
    dom.lobbyVideo.play().catch(() => {});
    dom.lobbyVideoInfo.textContent = z.label;
    dom.lobbySrt.textContent = '';
    dom.videoOverlay.classList.remove('hidden');

    analytics.views[idx] = (analytics.views[idx] || 0) + 1;
    saveAnalytics();

    /* SRT sync */
    const srtLines = z.srt.split('.');
    let srtIdx = 0;
    const srtInterval = setInterval(() => {
      if (dom.videoOverlay.classList.contains('hidden')) { clearInterval(srtInterval); return; }
      if (srtIdx < srtLines.length) {
        dom.lobbySrt.textContent = srtLines[srtIdx].trim();
        srtIdx++;
      } else {
        clearInterval(srtInterval);
      }
    }, z.duration * 1000 / srtLines.length);
  }

  dom.videoClose.addEventListener('click', () => {
    dom.videoOverlay.classList.add('hidden');
    dom.lobbyVideo.pause();
    dom.lobbyVideo.src = '';
    analytics.playbackTime += dom.lobbyVideo.currentTime || 0;
    saveAnalytics();
  });

  dom.srtDownload.addEventListener('click', () => {
    if (activeZoneIdx < 0) return;
    const z = ZONES[activeZoneIdx];
    const blob = new Blob([z.srt], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = `${z.id}-transcripcion.txt`;
    a.href = URL.createObjectURL(blob);
    a.click();
  });

  /* ---------- Guided tour ---------- */
  dom.tourBtn.addEventListener('click', () => {
    tourActive = !tourActive;
    dom.tourBtn.textContent = tourActive ? '⏹ Detener tour' : '🚀 Iniciar tour';
    if (tourActive) {
      tourIdx = 0;
      tourStep();
      analytics.tourRoutes++;
      saveAnalytics();
    }
  });

  function tourStep() {
    if (!tourActive || tourIdx >= ZONES.length) {
      tourActive = false;
      dom.tourBtn.textContent = '🚀 Iniciar tour';
      return;
    }
    const z = ZONES[tourIdx];
    const target = new THREE.Vector3(z.position[0], 0.35, z.position[2] + 0.4);
    const lookAt = new THREE.Vector3(z.lookAt[0], 0, z.lookAt[2]);
    if (prefersReducedMotion) {
      camera.position.copy(target); camera.lookAt(lookAt);
      openVideo(tourIdx);
      tourIdx++;
      if (tourActive && tourIdx < ZONES.length) setTimeout(tourStep, 4000);
    } else {
      gsap.to(camera.position, {
        x: target.x, y: target.y, z: target.z,
        duration: 1.0, ease: 'power2.out',
        onUpdate: () => camera.lookAt(lookAt),
        onComplete: () => {
          camera.lookAt(lookAt);
          openVideo(tourIdx);
          tourIdx++;
          if (tourActive && tourIdx < ZONES.length) setTimeout(tourStep, 4000);
          else { tourActive = false; dom.tourBtn.textContent = '🚀 Iniciar tour'; }
        }
      });
    }
  }

  /* ---------- Map zones ---------- */
  function buildMap() {
    dom.mapBody.innerHTML = '';
    ZONES.forEach((z, i) => {
      const btn = document.createElement('button');
      btn.className = 'zone-btn';
      btn.innerHTML = `<span class="key">${z.key}</span> ${z.label}`;
      btn.addEventListener('click', () => {
        dom.mapPanel.classList.add('hidden');
        const target = new THREE.Vector3(z.position[0], 0.35, z.position[2] + 0.4);
        const lookAt = new THREE.Vector3(z.lookAt[0], 0, z.lookAt[2]);
        if (prefersReducedMotion) { camera.position.copy(target); camera.lookAt(lookAt); }
        else {
          gsap.to(camera.position, { x: target.x, y: target.y, z: target.z, duration: 0.9, ease: 'power2.out',
            onUpdate: () => camera.lookAt(lookAt), onComplete: () => camera.lookAt(lookAt) });
        }
      });
      dom.mapBody.appendChild(btn);
    });
  }

  dom.mapBtn.addEventListener('click', () => dom.mapPanel.classList.toggle('hidden'));
  dom.mapClose.addEventListener('click', () => dom.mapPanel.classList.add('hidden'));

  /* ---------- Numeric shortcuts ---------- */
  document.addEventListener('keydown', (e) => {
    ZONES.forEach((z, i) => {
      if (e.key === z.key && !e.ctrlKey && !e.metaKey) {
        const target = new THREE.Vector3(z.position[0], 0.35, z.position[2] + 0.4);
        const lookAt = new THREE.Vector3(z.lookAt[0], 0, z.lookAt[2]);
        if (prefersReducedMotion) { camera.position.copy(target); camera.lookAt(lookAt); }
        else {
          gsap.to(camera.position, { x: target.x, y: target.y, z: target.z, duration: 0.9, ease: 'power2.out',
            onUpdate: () => camera.lookAt(lookAt), onComplete: () => camera.lookAt(lookAt) });
        }
      }
    });
  });

  /* ---------- Transcripts ---------- */
  dom.transcriptBtn.addEventListener('click', () => {
    dom.transcriptPanel.classList.toggle('hidden');
    dom.transcriptBody.innerHTML = ZONES.map(z =>
      `<div class="transcript-item"><strong>${z.label}</strong><br>${z.srt}</div>`
    ).join('');
  });
  dom.transcriptClose.addEventListener('click', () => dom.transcriptPanel.classList.add('hidden'));

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const totalViews = Object.values(analytics.views).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML =
      `<div class="analytics-row"><span>👁 Hotspots</span><span>${totalViews}</span></div>` +
      `<div class="analytics-row"><span>⏱ Playback</span><span>${Math.round(analytics.playbackTime)}s</span></div>` +
      `<div class="analytics-row"><span>🚀 Tours</span><span>${analytics.tourRoutes}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

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
    checkProximity();
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadAnalytics();
    buildMap();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    updateOrbitCam();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

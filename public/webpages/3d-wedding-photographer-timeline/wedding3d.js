(function () {
  'use strict';

  const MOMENTS = [
    {
      title: 'Ceremonia',
      time: '15:30',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      extendedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      caption: 'La ceremonia al atardecer. 45 invitados, arco floral, música de cuerdas.',
      credits: 'Oficiante: María López · Música: Cuarteto Allegro',
      photos: ['#d4c8b8', '#c8b8a8', '#b8a898']
    },
    {
      title: 'Votos',
      time: '16:15',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      extendedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      caption: 'Intercambio de votos y anillos. Emoción, lágrimas y aplausos.',
      credits: 'Texto votos: Ana & Carlos · Fotografía: Luz Natural',
      photos: ['#e8ddd0', '#ddd0c0', '#ccc0b0']
    },
    {
      title: 'Primer Baile',
      time: '21:00',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      extendedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      caption: 'Primer baile con "Perfect" de Ed Sheeran. Coreografía sorpresa.',
      credits: 'Coreografía: DanceStudio · DJ: Música & Luces',
      photos: ['#d8c8b8', '#c8b8a8', '#e0d0c0']
    }
  ];

  const PEDESTAL_W = 0.35, PEDESTAL_H = 0.45;
  const SPACING = 0.75;
  const START_X = -((MOMENTS.length - 1) * SPACING) / 2;

  let scene, camera, renderer;
  let pedestalGroups = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let isTransitioning = false;
  let cameraTarget = new THREE.Vector3(0, 0.1, 1.8);

  let activeHighlight = {};
  let viewTimes = {};

  let analytics = { views: {}, timePerPedestal: {} };
  let lastViewTime = Date.now();
  let lastActiveIdx = -1;

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    timelineScrub: document.getElementById('timeline-scrub'),
    timelineTime: document.getElementById('timeline-time'),
    detailView: document.getElementById('detail-view'),
    detailClose: document.getElementById('detail-close'),
    detailVideo: document.getElementById('detail-video'),
    detailMeta: document.getElementById('detail-meta'),
    detailCaption: document.getElementById('detail-caption'),
    detailCredits: document.getElementById('detail-credits'),
    highlightBtn: document.getElementById('highlight-btn'),
    highlightPanel: document.getElementById('highlight-panel'),
    highlightClose: document.getElementById('highlight-close'),
    highlightBody: document.getElementById('highlight-body'),
    highlightExportBtn: document.getElementById('highlight-export-btn'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbTimeline: document.getElementById('fb-timeline')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('Wedding3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('Wedding3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4efe8);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 20);
    camera.position.set(0, 0.6, 2.2);
    camera.lookAt(0, 0.1, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xfff8f0, 0.6);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffeedd, 0.5);
    key.position.set(1, 3, 2);
    scene.add(key);
    const warm = new THREE.DirectionalLight(0xffcc88, 0.2);
    warm.position.set(-1, 2, 1);
    scene.add(warm);

    buildScene();
  }

  function buildScene() {
    pedestalGroups.forEach(g => scene.remove(g));
    pedestalGroups = [];

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d8, roughness: 0.7, metalness: 0.05 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.8), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;
    scene.add(floor);

    MOMENTS.forEach((m, i) => {
      const x = START_X + i * SPACING;
      const g = new THREE.Group();
      g.position.set(x, 0, 0);

      /* Pedestal */
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xeee6dc, roughness: 0.3, metalness: 0.1 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.12, 20), baseMat);
      base.position.y = -0.18;
      g.add(base);

      /* Top plate */
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xf0e8e0, roughness: 0.2, metalness: 0.15 });
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 20), plateMat);
      plate.position.y = -0.12;
      g.add(plate);

      /* Frame / screen */
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.5, metalness: 0.3 });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.02), frameMat);
      frame.position.y = 0.01;
      g.add(frame);

      /* Video texture screen */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = m.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      const sMat = new THREE.MeshBasicMaterial({ map: tex });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.11), sMat);
      screen.position.y = 0.01;
      screen.position.z = 0.012;
      g.add(screen);

      /* Label */
      const c = document.createElement('canvas');
      c.width = 256; c.height = 24;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, 256, 24);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.title, 128, 16);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.025), lMat);
      lMesh.position.set(0, -0.04, 0.013);
      g.add(lMesh);

      g.userData = { idx: i, origX: x, origZ: 0 };
      scene.add(g);
      pedestalGroups.push(g);
    });
  }

  /* ---------- Timeline scrubbing ---------- */
  dom.timelineScrub.addEventListener('input', (e) => {
    const pct = parseInt(e.target.value) / 1000;
    const idx = Math.round(pct * (MOMENTS.length - 1));
    const m = MOMENTS[idx];
    dom.timelineTime.textContent = m.time;
    const targetX = START_X + idx * SPACING;

    if (!prefersReducedMotion) {
      if (!isTransitioning) {
        isTransitioning = true;
        gsap.to(camera.position, { x: targetX, duration: 0.4, ease: 'power2.inOut', onComplete: () => { isTransitioning = false; } });
        gsap.to(cameraTarget, { x: targetX, duration: 0.4, ease: 'power2.inOut' });
      }
    } else {
      camera.position.x = targetX;
      cameraTarget.x = targetX;
    }

    /* Pedestal activation highlight */
    pedestalGroups.forEach((g, i) => {
      const scale = i === idx ? 1.08 : 1;
      if (!prefersReducedMotion) {
        gsap.to(g.scale, { x: scale, y: scale, z: scale, duration: 0.2 });
        gsap.to(g.position, { y: i === idx ? 0.04 : 0, duration: 0.2 });
      } else {
        g.scale.set(scale, scale, scale);
        g.position.y = i === idx ? 0.04 : 0;
      }
    });

    trackTime(idx);
  });

  function trackTime(idx) {
    const now = Date.now();
    if (lastActiveIdx >= 0 && lastActiveIdx < MOMENTS.length) {
      const spent = (now - lastViewTime) / 1000;
      analytics.timePerPedestal[lastActiveIdx] = (analytics.timePerPedestal[lastActiveIdx] || 0) + spent;
      saveAnalytics();
    }
    lastActiveIdx = idx;
    lastViewTime = now;
    analytics.views[idx] = (analytics.views[idx] || 0) + 1;
    saveAnalytics();
  }

  /* ---------- Click to open detail ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    pedestalGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < pedestalGroups.length; i++) {
        for (let j = 0; j < pedestalGroups[i].children.length; j++) {
          if (hits[0].object === pedestalGroups[i].children[j]) {
            openDetail(pedestalGroups[i].userData.idx);
            return;
          }
        }
      }
    }
  });

  function openDetail(idx) {
    const m = MOMENTS[idx];
    dom.detailMeta.textContent = m.title + ' — ' + m.time;
    dom.detailCaption.textContent = m.caption;
    dom.detailCredits.textContent = m.credits;
    dom.detailVideo.src = m.extendedUrl;
    dom.detailVideo.load();
    dom.detailVideo.play().catch(() => {});
    dom.detailView.classList.remove('hidden');

    analytics.views[idx] = (analytics.views[idx] || 0) + 1;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 1.4, duration: 0.5, onComplete: () => { isTransitioning = false; } });
    }
  }

  dom.detailClose.addEventListener('click', closeDetail);
  dom.detailView.addEventListener('click', (e) => { if (e.target === dom.detailView) closeDetail(); });

  function closeDetail() {
    dom.detailView.classList.add('hidden');
    dom.detailVideo.pause();
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 2.2, duration: 0.4 });
    }
  }

  /* ---------- Highlight reel ---------- */
  dom.highlightBtn.addEventListener('click', () => {
    dom.highlightPanel.classList.toggle('hidden');
    renderHighlightBody();
  });
  dom.highlightClose.addEventListener('click', () => dom.highlightPanel.classList.add('hidden'));

  function renderHighlightBody() {
    dom.highlightBody.innerHTML = '';
    MOMENTS.forEach((m, i) => {
      const item = document.createElement('div');
      item.className = 'highlight-item';
      item.innerHTML = `<input type="checkbox" data-idx="${i}" ${activeHighlight[i] ? 'checked' : ''}><span>${m.title} (${m.time})</span>`;
      item.querySelector('input').addEventListener('change', (e) => {
        activeHighlight[i] = e.target.checked;
      });
      dom.highlightBody.appendChild(item);
    });
  }

  dom.highlightExportBtn.addEventListener('click', () => {
    const selected = Object.entries(activeHighlight).filter(([, v]) => v).map(([k]) => MOMENTS[parseInt(k)].title);
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'highlight-reel.json';
    link.href = URL.createObjectURL(blob);
    link.click();
  });

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const totalViews = Object.values(analytics.views).reduce((a, b) => a + b, 0);
    const totalTime = Object.values(analytics.timePerPedestal).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Vistas</span><span>${totalViews}</span></div>
      <div class="analytics-row"><span>⏱ Tiempo total</span><span>${Math.round(totalTime)}s</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      dom.fbTimeline.innerHTML = '';
      MOMENTS.forEach((m) => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `<video controls preload="metadata" src="${m.extendedUrl}"></video><div><h3>${m.title} · ${m.time}</h3><p>${m.caption}</p><p style="color:#c8a86a;font-style:italic;font-size:.48rem">${m.credits}</p></div>`;
        dom.fbTimeline.appendChild(card);
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
    pedestalGroups.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.rotation.y = Math.sin(t * 0.08 + i * 0.6) * 0.01;
      }
    });
    camera.lookAt(cameraTarget);
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

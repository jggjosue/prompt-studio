(function () {
  'use strict';

  const FACES = [
    { id: 'bio', label: 'Bio', meta: 'Full‑stack · 8 años · 20+ proyectos', tools: ['React', 'Node', 'Three.js'], videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', caseUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', srt: '1\n00:00:01,000 --> 00:00:05,000\nHola, soy desarrollador freelance.\n2\n00:00:05,000 --> 00:00:10,000\nEspecializado en apps web y 3D interactivo.', color: 0x4a6a8a },
    { id: 'proyectos', label: 'Proyectos', meta: 'Dashboards, APIs, e‑commerce', tools: ['Next.js', 'D3', 'Postgres'], videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', caseUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', srt: '1\n00:00:01,000 --> 00:00:06,000\nEstos son algunos proyectos destacados.\n2\n00:00:06,000 --> 00:00:12,000\nCada uno con su propio case study.', color: 0x5a7ab4 },
    { id: 'testimonios', label: 'Testimonios', meta: 'Clientes satisfechos · 5 estrellas', tools: ['Liderazgo', 'Comunicación', 'Calidad'], videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', caseUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', srt: '1\n00:00:01,000 --> 00:00:04,000\n"Excelente profesional".\n2\n00:00:04,000 --> 00:00:08,000\n"Entregó a tiempo y con calidad."', color: 0x5ab47a },
    { id: 'contacto', label: 'Contacto', meta: 'hola@ejemplo.com · linkedin.com/in/user', tools: ['Disponible', 'Freelance', 'Remoto'], videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', caseUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', srt: '1\n00:00:01,000 --> 00:00:05,000\nTrabajemos juntos en tu próximo proyecto.\n2\n00:00:05,000 --> 00:00:08,000\nContáctame por email o LinkedIn.', color: 0xb47a5a }
  ];

  const PROJECTS = [
    { title: 'Dash Financiero', desc: 'Dashboard en tiempo real con D3.js y WebSocket.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', caseUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', mockups: ['#4a6a8a', '#5a7ab4', '#3a5a7a'], tools: ['D3', 'React', 'Node'] },
    { title: 'API Gateway', desc: 'Gateway distribuido con rate limiting y auth.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', caseUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', mockups: ['#5a7a4a', '#6a8a5a', '#4a6a3a'], tools: ['Go', 'gRPC', 'Kong'] },
    { title: 'E‑commerce App', desc: 'Plataforma multi‑tenant con microfrontends.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', caseUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', mockups: ['#7a5a4a', '#8a6a5a', '#6a4a3a'], tools: ['Next.js', 'Stripe', 'Postgres'] }
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    facePanel: document.getElementById('face-panel'),
    faceClose: document.getElementById('face-close'),
    faceTitle: document.getElementById('face-title'),
    faceVideo: document.getElementById('face-video'),
    faceMeta: document.getElementById('face-meta'),
    faceSrt: document.getElementById('face-srt'),
    faceSrtBody: document.getElementById('face-srt-body'),
    faceCaseBtn: document.getElementById('face-case-btn'),
    showcaseVitrine: document.getElementById('showcase-vitrine'),
    vitrineClose: document.getElementById('vitrine-close'),
    vitrineScene: document.getElementById('vitrine-scene'),
    vitrineVideo: document.getElementById('vitrine-video'),
    timelineBtn: document.getElementById('timeline-btn'),
    timelinePanel: document.getElementById('timeline-panel'),
    timelineClose: document.getElementById('timeline-close'),
    timelineItems: document.getElementById('timeline-items'),
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
  let cubeGroup, cubeFaces = [];
  let expandedFace = null;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let isDragging = false, prevX = 0;
  let velocity = 0;
  let rotY = 0, targetRotY = 0;
  const MAX_ROT = Math.PI * 0.6;
  let introDone = false;
  let videoTextures = [];
  let idleRotDir = 1;

  let analytics = { plays: {}, avgTime: {}, rotationClicks: 0, caseClicks: 0 };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Storage ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('FreelancePortfolio', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { console.warn('IDB error', e); }
  }

  function loadAnalytics() {
    try {
      const req = indexedDB.open('FreelancePortfolio', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* ignore */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f4);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 0.5, 3.5);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.7);
    key.position.set(2, 3, 3);
    scene.add(key);

    /* Cube */
    cubeGroup = new THREE.Group();
    const s = 0.35;
    const faceData = [
      { pos: [0, 0, s], rot: [0, 0, 0] },
      { pos: [0, 0, -s], rot: [0, Math.PI, 0] },
      { pos: [s, 0, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [-s, 0, 0], rot: [0, -Math.PI / 2, 0] }
    ];

    faceData.forEach((fd, idx) => {
      const f = FACES[idx];
      const g = new THREE.Group();
      g.position.set(fd.pos[0], fd.pos[1], fd.pos[2]);
      g.rotation.set(fd.rot[0], fd.rot[1], fd.rot[2]);

      const bgMat = new THREE.MeshStandardMaterial({ color: f.color, roughness: 0.3, metalness: 0.05, transparent: true, opacity: 0.85 });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.9, s * 1.9), bgMat);
      g.add(panel);

      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = f.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      const vidMat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0.6 });
      const vidMesh = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.5, s * 1.1), vidMat);
      vidMesh.position.y = 0.05;
      g.add(vidMesh);
      videoTextures.push(vid);

      g.userData = { faceIdx: idx, panel };
      cubeGroup.add(g);
      cubeFaces.push(g);
    });

    scene.add(cubeGroup);

    /* Intro dolly-in */
    if (!prefersReducedMotion) {
      camera.position.z = 5;
      gsap.to(camera.position, { z: 3.5, duration: 1.2, ease: 'power3.out', onComplete: () => { introDone = true; } });
    } else {
      introDone = true;
    }
  }

  /* ---------- Cube rotation with inertia ---------- */
  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (expandedFace) return;
    isDragging = true;
    prevX = e.clientX;
    velocity = 0;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging || expandedFace) return;
    const dx = e.clientX - prevX;
    velocity = dx * 0.005;
    if (!prefersReducedMotion) {
      targetRotY += velocity;
      targetRotY = Math.max(-MAX_ROT, Math.min(MAX_ROT, targetRotY));
    }
    prevX = e.clientX;
  });

  window.addEventListener('pointerup', () => { isDragging = false; if (!prefersReducedMotion) analytics.rotationClicks++; saveAnalytics(); });

  /* Click face */
  renderer.domElement.addEventListener('click', (event) => {
    if (expandedFace || !introDone) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    cubeFaces.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < cubeFaces.length; i++) {
        for (let j = 0; j < cubeFaces[i].children.length; j++) {
          if (hits[0].object === cubeFaces[i].children[j]) { expandFace(i); return; }
        }
      }
    }
  });

  /* ---------- Expand face ---------- */
  function expandFace(idx) {
    expandedFace = idx;
    const f = FACES[idx];
    dom.faceTitle.textContent = f.label;
    dom.faceVideo.src = f.videoUrl;
    dom.faceVideo.load();
    dom.faceVideo.play().catch(() => {});
    const toolsHtml = f.tools.map(t => `<span>${t}</span>`).join('');
    dom.faceMeta.innerHTML = `<span>${f.meta}</span>${toolsHtml}`;
    dom.faceSrtBody.textContent = f.srt;
    dom.faceSrt.classList.remove('hidden');
    dom.facePanel.classList.remove('hidden');

    analytics.plays[idx] = (analytics.plays[idx] || 0) + 1;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to(cubeGroup.children[idx].position, { x: 0, y: 0.5, z: 0.8, duration: 0.5 });
      gsap.to(cubeGroup.children[idx].scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.4 });
    }
  }

  dom.faceClose.addEventListener('click', collapseFace);
  function collapseFace() {
    if (expandedFace == null) return;
    const idx = expandedFace;
    dom.facePanel.classList.add('hidden');
    dom.faceVideo.pause();
    if (!prefersReducedMotion) {
      const fd = [
        { x: 0, y: 0, z: 0.35 },
        { x: 0, y: 0, z: -0.35 },
        { x: 0.35, y: 0, z: 0 },
        { x: -0.35, y: 0, z: 0 }
      ];
      gsap.to(cubeGroup.children[idx].position, { x: fd[idx].x, y: fd[idx].y, z: fd[idx].z, duration: 0.4 });
      gsap.to(cubeGroup.children[idx].scale, { x: 1, y: 1, z: 1, duration: 0.3 });
    }
    expandedFace = null;
  }

  /* ---------- Case study ---------- */
  dom.faceCaseBtn.addEventListener('click', () => {
    if (expandedFace == null) return;
    const f = FACES[expandedFace];
    openCaseStudy(f.caseUrl);
  });

  function openCaseStudy(videoUrl) {
    analytics.caseClicks++;
    saveAnalytics();
    initVitrineScene();
    dom.vitrineVideo.src = videoUrl;
    dom.vitrineVideo.load();
    dom.vitrineVideo.play().catch(() => {});
    dom.showcaseVitrine.classList.remove('hidden');
  }

  dom.vitrineClose.addEventListener('click', () => {
    dom.showcaseVitrine.classList.add('hidden');
    dom.vitrineVideo.pause();
    disposeVitrineScene();
  });

  /* ---------- Vitrine 3D scene ---------- */
  let vitrineScene, vitrineCamera, vitrineRenderer;
  function initVitrineScene() {
    const rect = dom.vitrineScene.getBoundingClientRect();
    vitrineScene = new THREE.Scene();
    vitrineCamera = new THREE.PerspectiveCamera(40, rect.width / rect.height, 0.1, 20);
    vitrineCamera.position.set(0, 0.5, 2);
    vitrineRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    vitrineRenderer.setSize(rect.width, rect.height);
    vitrineRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.vitrineScene.appendChild(vitrineRenderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(1, 2, 2);
    vitrineScene.add(light);
    vitrineScene.add(new THREE.AmbientLight(0xffffff, 0.4));

    /* Mockup cubes with halo */
    const colors = ['#4a6a8a', '#5a7ab4', '#3a5a7a'];
    colors.forEach((c, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.1 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.04), mat);
      mesh.position.set((i - 1) * 0.25, -0.05, 0);
      vitrineScene.add(mesh);

      /* Halo ring */
      const ringMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.12, 16), ringMat);
      ring.position.set((i - 1) * 0.25, 0.1, 0);
      ring.rotation.x = -Math.PI / 2;
      vitrineScene.add(ring);
    });

    /* Guide lines */
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4a6a8a, transparent: true, opacity: 0.2 });
    [-1, 0, 1].forEach((i) => {
      const points = [new THREE.Vector3(i * 0.25, -0.15, 0), new THREE.Vector3(i * 0.25, 0.15, 0)];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lineMat);
      vitrineScene.add(line);
    });

    renderVitrine();
  }

  function renderVitrine() {
    if (!vitrineRenderer) return;
    vitrineRenderer.render(vitrineScene, vitrineCamera);
    requestAnimationFrame(renderVitrine);
  }

  function disposeVitrineScene() {
    if (vitrineRenderer) { vitrineRenderer.dispose(); vitrineRenderer = null; }
    vitrineScene = null;
    dom.vitrineScene.innerHTML = '';
  }

  /* ---------- Timeline ---------- */
  dom.timelineBtn.addEventListener('click', () => {
    dom.timelinePanel.classList.toggle('hidden');
    renderTimeline();
  });
  dom.timelineClose.addEventListener('click', () => dom.timelinePanel.classList.add('hidden'));

  function renderTimeline() {
    dom.timelineItems.innerHTML = '';
    PROJECTS.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'timeline-item';
      div.innerHTML = `<div class="ti-title">${p.title}</div><div class="ti-desc">${p.desc}</div>`;
      div.addEventListener('click', () => {
        dom.timelinePanel.classList.add('hidden');
        flyToProject(i);
      });
      dom.timelineItems.appendChild(div);
    });
  }

  function flyToProject(idx) {
    const targetZ = 2.0 + idx * 0.3;
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: targetZ, duration: 0.9, ease: 'power2.inOut' });
    } else {
      camera.position.z = targetZ;
    }
    const p = PROJECTS[idx];
    openCaseStudy(p.caseUrl);
  }

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    renderAnalytics();
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  function renderAnalytics() {
    let html = '<div class="analytics-row"><span>Métrica</span><span>Valor</span></div>';
    html += `<div class="analytics-row"><span>Reproducciones</span><span>${Object.values(analytics.plays).reduce((a, b) => a + b, 0)}</span></div>`;
    html += `<div class="analytics-row"><span>Rotaciones</span><span>${analytics.rotationClicks}</span></div>`;
    html += `<div class="analytics-row"><span>Casos vistos</span><span>${analytics.caseClicks}</span></div>`;
    dom.analyticsBody.innerHTML = html;
  }

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    [...FACES, ...PROJECTS].forEach((item) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${item.videoUrl || item.caseUrl}"></video><div><h3>${item.label || item.title}</h3><p>${item.meta || item.desc}</p></div>`;
      dom.fbGrid.appendChild(card);
    });
  });

  /* ---------- Modal ---------- */
  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
  dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

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

  /* Texture release after inactivity */
  let inactivityTimer = null;
  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      videoTextures.forEach(v => { v.pause(); v.src = ''; });
    }, 30000);
  }
  document.addEventListener('pointermove', resetInactivityTimer);
  document.addEventListener('click', resetInactivityTimer);

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = dom.sceneRoot.clientWidth / dom.sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.sceneRoot.clientWidth, dom.sceneRoot.clientHeight);
  });

  function animate() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    /* Idle rotation */
    if (!isDragging && expandedFace == null && !prefersReducedMotion) {
      targetRotY += dt * 0.15 * idleRotDir;
      if (Math.abs(targetRotY) > MAX_ROT * 0.7) idleRotDir *= -1;
      targetRotY = Math.max(-MAX_ROT, Math.min(MAX_ROT, targetRotY));
    }

    if (!prefersReducedMotion) {
      rotY += (targetRotY - rotY) * 0.08;
      cubeGroup.rotation.y = rotY;
    }

    /* Floating animation */
    if (!prefersReducedMotion) {
      cubeGroup.position.y = Math.sin(t * 0.4) * 0.02;
    }

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadAnalytics();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    resetInactivityTimer();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

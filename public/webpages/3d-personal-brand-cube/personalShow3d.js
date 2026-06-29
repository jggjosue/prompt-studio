(function () {
  'use strict';

  const FACES = [
    { label: 'Bio', subtitle: 'Desarrollador full‑stack · 8 años · 20+ proyectos', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', color: 0xb45a7a },
    { label: 'Proyectos', subtitle: 'Apps, APIs, dashboards y sistemas distribuidos', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', color: 0x5a7ab4 },
    { label: 'Testimonios', subtitle: '“Un profesional excepcional” — Clientes y colegas', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', color: 0x5ab47a },
    { label: 'Contacto', subtitle: 'hola@ejemplo.com · linkedin.com/in/usuario', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', color: 0xb47a5a }
  ];

  const PROJECTS = [
    { title: 'Dash Financiero', desc: 'Dashboard en tiempo real con D3 y WebSocket.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', tags: ['D3', 'WebSocket', 'React'] },
    { title: 'API Gateway', desc: 'Gateway distribuido con rate limiting y auth.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', tags: ['Go', 'gRPC', 'Kong'] },
    { title: 'E‑commerce App', desc: 'Plataforma multi‑tenant con microfrontends.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', tags: ['Next.js', 'Stripe', 'Postgres'] }
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    overlay: document.getElementById('video-overlay'),
    overlayVideo: document.getElementById('overlay-video'),
    overlayCaption: document.getElementById('overlay-caption'),
    overlayClose: document.getElementById('overlay-close'),
    pitchBtn: document.getElementById('pitch-btn'),
    timelineBtn: document.getElementById('timeline-btn'),
    timelinePanel: document.getElementById('timeline-panel'),
    timelineClose: document.getElementById('timeline-close'),
    timelineItems: document.getElementById('timeline-items'),
    shareBtn: document.getElementById('share-btn'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let cubeGroup;
  let faceMeshes = [];
  let videoTextures = [];
  let isExpanded = false;
  let isPitching = false;
  let pitchTimer = null;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let targetRotY = 0, targetRotX = 0;
  let isDragging = false, prevMouse = { x: 0, y: 0 };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f4);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 0.5, 2.8);
    renderer = new THREE.WebGLRenderer({ antialias: true });
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
    const s = 0.35; /* half-size */
    const positions = [
      { pos: [0, 0, s], rot: [0, 0, 0], label: 0 },    /* front */
      { pos: [0, 0, -s], rot: [0, Math.PI, 0], label: 1 }, /* back */
      { pos: [s, 0, 0], rot: [0, Math.PI / 2, 0], label: 2 }, /* right */
      { pos: [-s, 0, 0], rot: [0, -Math.PI / 2, 0], label: 3 } /* left */
    ];

    positions.forEach((p, idx) => {
      const face = FACES[idx];
      const g = new THREE.Group();
      g.position.set(p.pos[0], p.pos[1], p.pos[2]);
      g.rotation.set(p.rot[0], p.rot[1], p.rot[2]);

      const bgMat = new THREE.MeshStandardMaterial({ color: face.color, roughness: 0.3, metalness: 0.05, transparent: true, opacity: 0.85 });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.8, s * 1.8), bgMat);
      g.add(panel);

      /* Video texture on face */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = face.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      const vidMat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0.7 });
      const vidMesh = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.4, s * 1.0), vidMat);
      vidMesh.position.y = 0.05;
      g.add(vidMesh);
      videoTextures.push(vid);

      g.userData = { faceIdx: idx, panel };
      cubeGroup.add(g);
      faceMeshes.push(g);
    });

    /* Top/bottom faces with text */
    const topMat = new THREE.MeshStandardMaterial({ color: 0xe8e4de, roughness: 0.5 });
    const top = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.8, s * 1.8), topMat);
    top.position.y = s;
    top.rotation.x = -Math.PI / 2;
    cubeGroup.add(top);
    const bot = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.8, s * 1.8), topMat);
    bot.position.y = -s;
    bot.rotation.x = Math.PI / 2;
    cubeGroup.add(bot);

    scene.add(cubeGroup);
  }

  /* ---------- Drag / Swipe ---------- */
  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (isExpanded) return;
    isDragging = true;
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging || isExpanded) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    if (!prefersReducedMotion) {
      targetRotY += dx * 0.008;
      targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX + dy * 0.005));
    }
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
  });

  window.addEventListener('pointerup', () => { isDragging = false; });

  /* Click detection via raycasting */
  renderer.domElement.addEventListener('click', (event) => {
    if (isExpanded) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const allMeshes = [];
    faceMeshes.forEach((g) => g.children.forEach((c) => { if (c.isMesh) allMeshes.push(c); }));
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length) {
      for (let i = 0; i < faceMeshes.length; i++) {
        for (let j = 0; j < faceMeshes[i].children.length; j++) {
          if (hits[0].object === faceMeshes[i].children[j]) {
            expandFace(i);
            return;
          }
        }
      }
    }
  });

  /* ---------- Expand face ---------- */
  function expandFace(idx) {
    isExpanded = true;
    const face = FACES[idx];
    dom.overlayVideo.src = face.videoUrl;
    dom.overlayVideo.load();
    dom.overlayVideo.play().catch(() => {});
    dom.overlayCaption.textContent = `${face.label}: ${face.subtitle}`;
    dom.overlay.classList.remove('hidden');

    if (!prefersReducedMotion) {
      gsap.to(cubeGroup.scale, { x: 2.5, y: 2.5, z: 2.5, duration: 0.5, ease: 'backOut(1.5)' });
    } else {
      cubeGroup.scale.set(2.5, 2.5, 2.5);
    }
  }

  dom.overlayClose.addEventListener('click', collapseFace);
  dom.overlayVideo.addEventListener('ended', collapseFace);

  function collapseFace() {
    isExpanded = false;
    dom.overlay.classList.add('hidden');
    dom.overlayVideo.pause();
    if (!prefersReducedMotion) {
      gsap.to(cubeGroup.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
    } else {
      cubeGroup.scale.set(1, 1, 1);
    }
  }

  /* ---------- Pitch mode ---------- */
  dom.pitchBtn.addEventListener('click', () => {
    isPitching = !isPitching;
    dom.pitchBtn.textContent = isPitching ? '⏹ Detener' : '🎤 Pitch';
    if (isPitching) startPitch();
    else stopPitch();
  });

  function startPitch() {
    let faceIdx = 0;
    function playNext() {
      if (!isPitching || faceIdx >= FACES.length) { stopPitch(); return; }
      expandFace(faceIdx);
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(`${FACES[faceIdx].label}: ${FACES[faceIdx].subtitle}`);
        msg.lang = 'es-ES';
        msg.rate = 0.85;
        speechSynthesis.speak(msg);
      }
      const dur = (dom.overlayVideo.duration || 10) * 1000;
      pitchTimer = setTimeout(() => { faceIdx++; playNext(); }, Math.min(dur, 8000));
    }
    playNext();
  }

  function stopPitch() {
    isPitching = false;
    dom.pitchBtn.textContent = '🎤 Pitch';
    if (pitchTimer) clearTimeout(pitchTimer);
    collapseFace();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
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
      div.innerHTML = `
        <div class="ti-title">${p.title}</div>
        <div class="ti-desc">${p.desc} · ${p.tags.join(', ')}</div>
        <input type="range" min="0" max="100" value="0" data-proj="${i}">
      `;
      div.querySelector('input').addEventListener('input', (e) => {
        const pct = e.target.value / 100;
        /* Scrubbing proxy: create temp video to seek */
        const temp = document.createElement('video');
        temp.src = p.videoUrl;
        temp.preload = 'auto';
        temp.currentTime = pct * (temp.duration || 60);
        dom.modalBody.innerHTML = `<p>${p.title} — ${Math.round(pct * 100)}%</p><video controls src="${p.videoUrl}"></video>`;
        dom.modal.classList.remove('hidden');
      });
      div.addEventListener('dblclick', () => {
        dom.overlayVideo.src = p.videoUrl;
        dom.overlayVideo.load();
        dom.overlayVideo.play().catch(() => {});
        dom.overlayCaption.textContent = p.title;
        dom.overlay.classList.remove('hidden');
      });
      dom.timelineItems.appendChild(div);
    });
  }

  /* ---------- Share ---------- */
  dom.shareBtn.addEventListener('click', () => {
    const face = faceMeshes.findIndex((g) => {
      /* crude: just share current rotation as face 0 if no expanded */
      return true;
    });
    const url = `${window.location.origin}${window.location.pathname}?face=0`;
    if (navigator.share) {
      navigator.share({ title: 'Showreel Cube', url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        dom.modalBody.innerHTML = `<p>🔗 Enlace copiado.</p>`;
        dom.modal.classList.remove('hidden');
      });
    }
  });

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    [...FACES, ...PROJECTS].forEach((item) => {
      const isFace = !!item.subtitle;
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${item.videoUrl}"></video><div><h3>${item.label || item.title}</h3><p>${item.subtitle || item.desc}</p></div>`;
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

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = dom.sceneRoot.clientWidth / dom.sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.sceneRoot.clientWidth, dom.sceneRoot.clientHeight);
  });

  function animate() {
    const dt = clock.getDelta();
    if (!isDragging && !isExpanded && !prefersReducedMotion) {
      targetRotY += dt * 0.2;
    }
    if (!prefersReducedMotion) {
      cubeGroup.rotation.y += (targetRotY - cubeGroup.rotation.y) * 0.08;
      cubeGroup.rotation.x += (targetRotX - cubeGroup.rotation.x) * 0.08;
    }
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

(function () {
  'use strict';

  const HLS_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  const CLIPS = [
    { title: 'Apertura', time: '0:30', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', desc: 'Palabras de bienvenida del CEO.' },
    { title: 'Demo producto', time: '12:15', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', desc: 'Presentación del nuevo producto.' },
    { title: 'Q&A', time: '28:40', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', desc: 'Sesión de preguntas y respuestas.' },
    { title: 'Cierre', time: '45:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', desc: 'Discurso de cierre y agradecimientos.' }
  ];

  const CAM_ANGLES = {
    stage: { pos: new THREE.Vector3(0, 1.0, 2.5), target: new THREE.Vector3(0, 0.6, 0) },
    audience: { pos: new THREE.Vector3(0, 0.4, -1.5), target: new THREE.Vector3(0, 0.6, 0) },
    side: { pos: new THREE.Vector3(1.8, 0.8, 0.2), target: new THREE.Vector3(0, 0.6, 0) }
  };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    clipsList: document.getElementById('clips-list'),
    clipsPanel: document.getElementById('clips-panel'),
    hlsOverlay: document.getElementById('hls-overlay'),
    hlsVideo: document.getElementById('hls-video'),
    hlsClose: document.getElementById('hls-close'),
    stream2dBtn: document.getElementById('stream2d-btn'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalVideo: document.getElementById('modal-video'),
    modalBody: document.getElementById('modal-body'),
    camBtns: document.querySelectorAll('.cam-btn'),
    reactionBtns: document.querySelectorAll('.reaction-btn')
  };

  let scene, camera, renderer;
  let currentAngle = 'stage';
  let animFrameId = null;
  let clock = new THREE.Clock();
  let mainScreen, leftPanel, rightPanel;
  let hls = null;
  let particles;
  let reactionParticles = [];

  /* ── Three.js scene ── */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f0ea);

    const w = dom.sceneRoot.clientWidth;
    const h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    applyCameraAngle('stage', true);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    /* Lights */
    const amb = new THREE.AmbientLight(0xfff5ee, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.9);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    /* Stage spot */
    const spot = new THREE.SpotLight(0xffffff, 0.6, 8, Math.PI / 5, 0.5);
    spot.position.set(0, 3, 1);
    spot.target.position.set(0, 0.2, 0);
    scene.add(spot);
    scene.add(spot.target);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.7 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Walls */
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f6, roughness: 0.9, side: THREE.BackSide });
    [[0, 0.8, -2], [0, 0.8, 2], [-1.5, 0.8, 0], [1.5, 0.8, 0]].forEach((p) => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), wallMat);
      w.position.set(p[0], p[1], p[2]);
      if (p[0] === -1.5) w.rotation.y = Math.PI / 2;
      else if (p[0] === 1.5) w.rotation.y = -Math.PI / 2;
      else if (p[2] === 2) w.rotation.y = Math.PI;
      scene.add(w);
    });

    /* Seats (rows of blocks) */
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.8 });
    for (let r = 0; r < 4; r++) {
      for (let c = -2; c <= 2; c++) {
        if (c === 0 && r === 0) continue; /* center gap */
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.12), seatMat);
        s.position.set(c * 0.35, -0.24, -r * 0.4 - 0.5);
        s.castShadow = true;
        scene.add(s);
      }
    }

    /* Stage */
    const stageMat = new THREE.MeshStandardMaterial({ color: 0xe8e4de, roughness: 0.4, metalness: 0.05 });
    const stage = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.5), stageMat);
    stage.position.set(0, -0.27, 0.6);
    stage.receiveShadow = true;
    stage.castShadow = true;
    scene.add(stage);

    /* Main screen (center) */
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x111111, emissiveIntensity: 0.2 });
    mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), screenMat);
    mainScreen.position.set(0, 0.35, 0.9);
    scene.add(mainScreen);

    /* Side panels */
    [leftPanel, rightPanel] = [-1, 1].map((x) => {
      const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), screenMat.clone());
      sm.position.set(x * 0.4, 0.2, 0.9);
      sm.material.emissiveIntensity = 0.05;
      scene.add(sm);
      return sm;
    });

    /* Podium */
    const podMat = new THREE.MeshStandardMaterial({ color: 0xe0dcd6, roughness: 0.3, metalness: 0.1 });
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.1), podMat);
    pod.position.set(0, 0.025, 0.5);
    scene.add(pod);

    /* Ambient particles */
    const pGeo = new THREE.BufferGeometry();
    const pCount = 40;
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 4;
      pos[i*3+1] = Math.random() * 1.5;
      pos[i*3+2] = (Math.random() - 0.5) * 3 - 0.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xc4b8a8, size: 0.012, transparent: true, opacity: 0.12
    }));
    scene.add(particles);

    renderClips();
    setupHLS();
  }

  /* ── Camera ── */
  function applyCameraAngle(angle, immediate) {
    const a = CAM_ANGLES[angle];
    if (!a) return;
    currentAngle = angle;
    if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      camera.position.copy(a.pos);
    } else {
      gsap.to(camera.position, { x: a.pos.x, y: a.pos.y, z: a.pos.z, duration: 0.7, ease: 'power2.out' });
    }
  }

  dom.camBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.camBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyCameraAngle(btn.dataset.angle);
    });
  });

  /* ── HLS ── */
  function setupHLS() {
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(HLS_URL);
      hls.attachMedia(dom.hlsVideo);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        dom.hlsVideo.play().catch(() => {});
        /* Project onto main screen as video texture */
        const tex = new THREE.VideoTexture(dom.hlsVideo);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        mainScreen.material.map = tex;
        mainScreen.material.color.setHex(0xffffff);
        mainScreen.material.needsUpdate = true;
      });
    } else if (dom.hlsVideo.canPlayType('application/vnd.apple.mpegurl')) {
      dom.hlsVideo.src = HLS_URL;
      dom.hlsVideo.play().catch(() => {});
    }
  }

  /* ── Clips ── */
  function renderClips() {
    dom.clipsList.innerHTML = '';
    CLIPS.forEach((clip, idx) => {
      const card = document.createElement('div');
      card.className = 'clip-card';
      card.innerHTML = `
        <strong>${clip.title}</strong>
        <span class="clip-time">${clip.time}</span>
      `;
      card.addEventListener('click', () => {
        /* Show clip in modal and also on side panel */
        dom.modalVideo.src = clip.videoUrl;
        dom.modalVideo.load();
        dom.modalVideo.play();
        dom.modalBody.innerHTML = `<p>${clip.desc}</p><p style="font-size:.62rem;color:var(--muted);margin-top:.2rem">Marcado en vivo · ${clip.time}</p>`;
        dom.modal.classList.remove('hidden');

        /* Also flash on side panel texture */
        const sideVideo = document.createElement('video');
        sideVideo.crossOrigin = 'anonymous';
        sideVideo.preload = 'metadata';
        sideVideo.loop = true;
        sideVideo.muted = true;
        sideVideo.src = clip.videoUrl;
        sideVideo.load();
        sideVideo.play().catch(() => {});
        const tex = new THREE.VideoTexture(sideVideo);
        tex.minFilter = THREE.LinearFilter;
        (idx % 2 === 0 ? leftPanel : rightPanel).material.map = tex;
        (idx % 2 === 0 ? leftPanel : rightPanel).material.color.setHex(0xffffff);
        (idx % 2 === 0 ? leftPanel : rightPanel).material.needsUpdate = true;
      });
      dom.clipsList.appendChild(card);
    });
  }

  /* ── Reactions ── */
  dom.reactionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const icon = btn.dataset.icon;
      spawnReaction(icon);
      /* Subtle light pulse */
      scene.children.forEach((child) => {
        if (child.isDirectionalLight) {
          gsap.to(child, { intensity: child.intensity + 0.1, duration: 0.15, yoyo: true, repeat: 1 });
        }
      });
    });
  });

  function spawnReaction(icon) {
    /* Floating text sprite */
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 32, 32);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 1, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set((Math.random() - 0.5) * 0.8, 0.2, 0.3);
    sprite.scale.set(0.1, 0.1, 1);
    scene.add(sprite);

    gsap.to(sprite.position, { y: 0.8, duration: 2, ease: 'power2.out' });
    gsap.to(sprite.material, { opacity: 0, duration: 1.5, delay: 0.5, onComplete: () => scene.remove(sprite) });
  }

  /* ── Stream 2D only ── */
  dom.stream2dBtn.addEventListener('click', () => {
    const hidden = dom.hlsOverlay.classList.contains('hidden');
    dom.hlsOverlay.classList.toggle('hidden');
    if (!hidden) dom.hlsVideo.pause();
    else dom.hlsVideo.play().catch(() => {});
  });
  dom.hlsClose.addEventListener('click', () => {
    dom.hlsOverlay.classList.add('hidden');
    dom.hlsVideo.pause();
  });

  /* ── Modal ── */
  dom.modal.addEventListener('click', (e) => {
    if (e.target === dom.modal) {
      dom.modal.classList.add('hidden');
      dom.modalVideo.pause();
    }
  });
  dom.modalClose.addEventListener('click', () => {
    dom.modal.classList.add('hidden');
    dom.modalVideo.pause();
  });

  /* ── Fallback ── */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    CLIPS.forEach((clip) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `
        <video controls preload="metadata" src="${clip.videoUrl}" crossorigin="anonymous"></video>
        <div>
          <h3>${clip.title} <span style="font-weight:400;color:var(--muted)">${clip.time}</span></h3>
          <p>${clip.desc}</p>
        </div>
      `;
      dom.fbGrid.appendChild(card);
    });
    /* Also show live stream embed */
    const liveCard = document.createElement('div');
    liveCard.className = 'fb-card';
    liveCard.innerHTML = `
      <video controls preload="metadata" src="${HLS_URL}" crossorigin="anonymous" style="width:100%"></video>
      <div><h3>🔴 Stream en vivo</h3><p>Transmisión principal en directo.</p></div>
    `;
    dom.fbGrid.prepend(liveCard);
  });

  /* ── Visibility API ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      animFrameId = null;
    } else if (!animFrameId) {
      animFrameId = requestAnimationFrame(animate);
    }
  });

  /* ── IntersectionObserver ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId) {
        animFrameId = requestAnimationFrame(animate);
      } else if (!entry.isIntersecting && animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    });
  }, { threshold: 0.05 });

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = dom.sceneRoot.clientWidth / dom.sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.sceneRoot.clientWidth, dom.sceneRoot.clientHeight);
  });

  /* ── Animation loop ── */
  function animate() {
    const t = clock.elapsedTime;

    /* Particle ambient drift */
    const pPos = particles.geometry.attributes.position.array;
    for (let i = 0; i < pPos.length; i += 3) {
      pPos[i+1] += Math.sin(t + i * 0.05) * 0.0001;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    /* Camera look at */
    const target = CAM_ANGLES[currentAngle].target;
    camera.lookAt(target);

    /* Side panel video texture update */
    [leftPanel, rightPanel].forEach((p) => {
      if (p.material.map) p.material.map.needsUpdate = true;
    });

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  /* ── Init ── */
  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

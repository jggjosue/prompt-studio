(function () {
  'use strict';

  const PROJECTS = [
    {
      title: 'Museo de Arte Contemporáneo', desc: 'Museo de 12,000 m² con fachada de vidrio curvo y tres niveles de galerías.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      pos: { x: -1.5, z: 0.5 },
      color: 0xc4b8a8,
      walkthrough: [
        { x: -1.5, y: 0.3, z: 1.5 }, { x: -1.5, y: 0.5, z: 0 }, { x: -1.5, y: 0.8, z: -1 }
      ],
      hotspots: [
        { label: 'Fachada', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', desc: 'Fachada de vidrio curvo laminado.' },
        { label: 'Interior', pdf: 'assets/plano-museo.pdf' }
      ]
    },
    {
      title: 'Torre Corporativa', desc: 'Edificio de 28 pisos con certificación LEED Platinum y jardines verticales.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      pos: { x: 0, z: 0.5 },
      color: 0x8a9ab4,
      walkthrough: [
        { x: 0, y: 0.3, z: 1.5 }, { x: 0, y: 1.2, z: 0 }, { x: 0, y: 2.0, z: -1 }
      ],
      hotspots: [
        { label: 'Lobby', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', desc: 'Lobby de doble altura.' }
      ]
    },
    {
      title: 'Casa Habitacional', desc: 'Vivienda unifamiliar de 350 m² con integración patio-interior y techos verdes.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      pos: { x: 1.5, z: 0.5 },
      color: 0x9ab48a,
      walkthrough: [
        { x: 1.5, y: 0.2, z: 1.5 }, { x: 1.5, y: 0.3, z: 0 }, { x: 1.5, y: 0.4, z: -1 }
      ],
      hotspots: [
        { label: 'Patio', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', desc: 'Integración patio-salón.' },
        { label: 'Planos', pdf: 'assets/plano-casa.pdf' }
      ]
    }
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    projectBtns: document.querySelectorAll('.project-btn'),
    walkthroughBtn: document.getElementById('walkthrough-btn'),
    layersBtn: document.getElementById('layers-btn'),
    layersPanel: document.getElementById('layers-panel'),
    sliderPanel: document.getElementById('slider-panel'),
    beforeAfterSlider: document.getElementById('before-after-slider'),
    freeBtn: document.getElementById('free-btn'),
    videoPanel: document.getElementById('video-panel'),
    videoClose: document.getElementById('video-close'),
    videoTitle: document.getElementById('video-title'),
    projectVideo: document.getElementById('project-video'),
    videoDesc: document.getElementById('video-desc'),
    videoHotspots: document.getElementById('video-hotspots'),
    pdfLink: document.getElementById('pdf-link'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalVideo: document.getElementById('modal-video'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let currentProject = 0;
  let projectGroups = [];
  let isWalkthrough = false;
  let walkthroughProgress = 0;
  let isFreeMode = false;
  let keys = {};
  let animFrameId = null;
  let clock = new THREE.Clock();

  /* ── Scene ── */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f6);

    const w = dom.sceneRoot.clientWidth;
    const h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 1.2, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.9);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    /* Ground plane */
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.8 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    /* Grid */
    const grid = new THREE.GridHelper(8, 10, 0xd4d0c8, 0xe8e4e0);
    grid.position.y = -0.29;
    scene.add(grid);

    createProjects();
  }

  function createProjects() {
    PROJECTS.forEach((proj, idx) => {
      const g = new THREE.Group();
      g.position.set(proj.pos.x, -0.3, proj.pos.z);

      /* Base podium */
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.5 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), baseMat);
      base.position.y = 0.04;
      base.receiveShadow = true;
      base.castShadow = true;
      g.add(base);

      /* Building volume */
      const color = new THREE.Color(proj.color);
      const bldgMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 });
      const h = 0.3 + idx * 0.1;
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, 0.35), bldgMat);
      bldg.position.y = h / 2 + 0.06;
      bldg.castShadow = true;
      g.add(bldg);

      /* Windows detail */
      const winMat = new THREE.MeshStandardMaterial({ color: 0x8ab4c4, emissive: 0x4a7a8a, emissiveIntensity: 0.1 });
      [-0.12, 0.12].forEach((x) => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.005, h * 0.6, 0.08), winMat);
        win.position.set(x, h / 2 + 0.06, 0.18);
        g.add(win);
      });

      /* Hotspot sphere */
      const hsMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, wireframe: true });
      const hs = new THREE.Mesh(new THREE.SphereGeometry(0.08), hsMat);
      hs.position.set(0, h + 0.12, 0);
      g.add(hs);

      /* Glow ring */
      const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
      const glow = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.1, 16), glowMat);
      glow.position.y = -0.02;
      glow.rotation.x = -Math.PI / 2;
      g.add(glow);

      g.userData = { idx, glow, hs };
      scene.add(g);
      projectGroups.push(g);
    });
  }

  /* ── Select project ── */
  function selectProject(idx) {
    currentProject = idx;
    const proj = PROJECTS[idx];
    const g = projectGroups[idx];

    /* Fly to */
    gsap.to(camera.position, {
      x: proj.pos.x, y: 0.5, z: proj.pos.z + 1.2,
      duration: 0.6, ease: 'power2.out'
    });

    /* Glow */
    projectGroups.forEach((pg, i) => {
      const glow = pg.userData.glow;
      gsap.to(glow.material, { opacity: i === idx ? 0.4 : 0, duration: 0.3 });
    });

    /* Show video panel */
    dom.videoTitle.textContent = proj.title;
    dom.projectVideo.src = proj.videoUrl;
    dom.projectVideo.load();
    dom.projectVideo.play().catch(() => {});
    dom.videoDesc.textContent = proj.desc;
    dom.videoHotspots.innerHTML = '';
    proj.hotspots.forEach((hs) => {
      const btn = document.createElement('button');
      btn.textContent = hs.label;
      btn.addEventListener('click', () => {
        if (hs.videoUrl) {
          dom.modalVideo.src = hs.videoUrl;
          dom.modalVideo.load();
          dom.modalVideo.play();
          dom.modalBody.textContent = hs.desc || '';
          dom.modal.classList.remove('hidden');
        }
        if (hs.pdf) {
          dom.pdfLink.style.display = 'block';
          dom.pdfLink.href = hs.pdf;
        }
      });
      dom.videoHotspots.appendChild(btn);
    });
    dom.videoPanel.classList.remove('hidden');
  }

  dom.projectBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.projectBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectProject(parseInt(btn.dataset.project));
    });
  });

  dom.videoClose.addEventListener('click', () => {
    dom.videoPanel.classList.add('hidden');
    dom.projectVideo.pause();
    projectGroups.forEach((pg) => { if (pg.userData.glow) pg.userData.glow.material.opacity = 0; });
    gsap.to(camera.position, { x: 0, y: 1.2, z: 3, duration: 0.5 });
  });

  /* ── Walkthrough ── */
  dom.walkthroughBtn.addEventListener('click', () => {
    isWalkthrough = !isWalkthrough;
    dom.walkthroughBtn.textContent = isWalkthrough ? '⏹ Detener' : '🎬 Iniciar Walkthrough';
    walkthroughProgress = 0;
  });

  function updateWalkthrough() {
    if (!isWalkthrough) return;
    const proj = PROJECTS[currentProject];
    const path = proj.walkthrough;
    walkthroughProgress += 0.002;
    if (walkthroughProgress >= 1) { walkthroughProgress = 0; return; }
    const idx = Math.floor(walkthroughProgress * (path.length - 1));
    const next = Math.min(idx + 1, path.length - 1);
    const frac = (walkthroughProgress * (path.length - 1)) % 1;
    const p = path[idx], n = path[next];
    camera.position.lerp(new THREE.Vector3(n.x, n.y, n.z), 0.02);
    camera.lookAt(proj.pos.x, 0, proj.pos.z - 0.5);
  }

  /* ── Free mode WASD ── */
  dom.freeBtn.addEventListener('click', () => {
    isFreeMode = !isFreeMode;
    dom.freeBtn.textContent = isFreeMode ? '🎮 WASD' : '🎮';
  });

  document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  function updateFreeMove() {
    if (!isFreeMode) return;
    const speed = 0.02;
    if (keys['w']) camera.position.z -= speed;
    if (keys['s']) camera.position.z += speed;
    if (keys['a']) camera.position.x -= speed;
    if (keys['d']) camera.position.x += speed;
    camera.lookAt(0, 0, 0);
  }

  /* ── Layers toggles ── */
  dom.layersBtn.addEventListener('click', () => {
    dom.layersPanel.classList.toggle('hidden');
  });
  dom.layersPanel.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', () => {
      /* Toggle visibility of building elements */
      const g = projectGroups[currentProject];
      if (!g) return;
      g.children.forEach((child, i) => {
        if (i > 0 && child.isMesh) { /* skip base at 0 */
          child.visible = input.checked;
        }
      });
    });
  });

  /* ── Before/After slider ── */
  dom.beforeAfterSlider.addEventListener('input', () => {
    const val = parseFloat(dom.beforeAfterSlider.value);
    projectGroups.forEach((g) => {
      g.children.forEach((child) => {
        if (child.isMesh && child.material && child.material.color) {
          const orig = new THREE.Color(PROJECTS[g.userData.idx].color);
          const target = new THREE.Color(0xf5f0ea);
          child.material.color.lerpColors(orig, target, val);
        }
      });
    });
  });

  /* ── Modal ── */
  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) { dom.modal.classList.add('hidden'); dom.modalVideo.pause(); } });
  dom.modalClose.addEventListener('click', () => { dom.modal.classList.add('hidden'); dom.modalVideo.pause(); });

  /* ── Fallback ── */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    PROJECTS.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `
        <video controls preload="metadata" src="${p.videoUrl}" crossorigin="anonymous"></video>
        <div>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div style="margin-top:.15rem;font-size:.58rem;color:var(--muted)">${p.hotspots.map((h) => h.label).join(' · ')}</div>
        </div>
      `;
      dom.fbGrid.appendChild(card);
    });
  });

  /* ── Visibility ── */
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
    projectGroups.forEach((pg, i) => {
      pg.position.y = -0.3 + Math.sin(t * 0.3 + i * 1.2) * 0.008;
    });
    updateWalkthrough();
    updateFreeMove();
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    selectProject(0);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

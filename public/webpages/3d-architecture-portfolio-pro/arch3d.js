(function () {
  'use strict';

  const PROJECTS = [
    { title: 'Torre Corporativa Nexus', desc: 'Rascacielos de 42 pisos con fachada bioclimática y jardines verticales.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', tags: ['rascacielos', 'bioclimático', 'fachada'], planUrl: '#', entrevista: '#', layers: { structure: true, finishes: true, furniture: true }, hotspots: [{ t: 'Estructura', n: 'Núcleo de hormigón armado con 12 ascensores.' }, { t: 'Fachada', n: 'Doble piel con vidrio Low-E y persianas automatizadas.' }] },
    { title: 'Complejo Residencial Pradera', desc: '120 viviendas con plaza central, huertos urbanos y sistema geotérmico.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', tags: ['residencial', 'geotermia', 'plaza'], planUrl: '#', entrevista: '#', layers: { structure: true, finishes: true, furniture: true }, hotspots: [{ t: 'Geotermia', n: 'Bomba de calor geotérmica para climatización central.' }, { t: 'Huertos', n: 'Huertos urbanos elevados con riego por goteo solar.' }] },
    { title: 'Museo de Arte Contemporáneo', desc: 'Volúmenes flotantes con lucernarios cenitales y auditorio subterráneo.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', tags: ['museo', 'volúmenes', 'auditorio'], planUrl: '#', entrevista: '#', layers: { structure: true, finishes: true, furniture: false }, hotspots: [{ t: 'Lucernarios', n: 'Cubierta con 24 lucernarios orientados al norte.' }, { t: 'Auditorio', n: 'Sala subterránea para 400 personas con acústica variable.' }] }
  ];

  const ENTRY_POSITIONS = [
    { x: -1.8, z: -0.5 }, { x: 0, z: -1 }, { x: 1.8, z: -0.5 }
  ];

  const WALKTHROUGH_PATHS = [
    [{ x: -1.8, y: 0.3, z: -0.5 }, { x: -1.8, y: 0.6, z: 0.8 }, { x: -0.8, y: 0.8, z: 1.2 }, { x: 0.2, y: 0.5, z: 1.5 }],
    [{ x: 0, y: 0.3, z: -1 }, { x: 0, y: 0.5, z: 0.5 }, { x: 0.6, y: 0.7, z: 1.2 }, { x: -0.4, y: 0.4, z: 1.6 }],
    [{ x: 1.8, y: 0.3, z: -0.5 }, { x: 1.8, y: 0.5, z: 0.6 }, { x: 1.0, y: 0.7, z: 1.0 }, { x: 0.8, y: 0.4, z: 1.4 }]
  ];

  let videoTextureMeshes = [];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    projectPanel: document.getElementById('project-panel'),
    projectClose: document.getElementById('project-close'),
    projectTitle: document.getElementById('project-title'),
    projectVideo: document.getElementById('project-video'),
    projectDesc: document.getElementById('project-desc'),
    projectMeta: document.getElementById('project-meta'),
    projectLink: document.getElementById('project-link'),
    hotspots: document.getElementById('hotspots'),
    beforeAfterSlider: document.getElementById('before-after-slider'),
    baRange: document.getElementById('ba-range'),
    modeFree: document.getElementById('mode-free'),
    modeGuided: document.getElementById('mode-guided'),
    layerToggles: document.querySelectorAll('#layer-toggles input'),
    downloadPlanBtn: document.getElementById('download-plan-btn'),
    beforeAfterBtn: document.getElementById('before-after-btn'),
    plansBtn: document.getElementById('plans-btn'),
    controlsHint: document.getElementById('controls-hint'),
    hintClose: document.getElementById('hint-close'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let projectGroups = [];
  let currentProject = null;
  let currentProjectIdx = null;
  let currentLayerState = { structure: true, finishes: true, furniture: true };
  let mode = 'free';
  let walkthroughActive = false;
  let walkPath = [];
  let walkIdx = 0;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let keys = {};
  let euler = new THREE.Euler(0, 0, 0, 'YXZ');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ece4);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 30);
    camera.position.set(0, 1.2, 3.5);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.8);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.3);
    fill.position.set(-2, 1, -3);
    scene.add(fill);

    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    /* Plaza paving */
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const tile = new THREE.Mesh(
          new THREE.PlaneGeometry(0.3, 0.3),
          new THREE.MeshStandardMaterial({ color: j % 2 === 0 ? 0xd8d0c4 : 0xe0d8cc, roughness: 0.8 })
        );
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(i * 0.3, -0.28, j * 0.3);
        tile.receiveShadow = true;
        scene.add(tile);
      }
    }

    PROJECTS.forEach((proj, idx) => {
      const pos = ENTRY_POSITIONS[idx];
      const g = new THREE.Group();
      g.position.set(pos.x, -0.3, pos.z);

      /* Base platform */
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.04, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xc8beb0, roughness: 0.6 })
      );
      base.position.y = 0.02;
      base.receiveShadow = true;
      g.add(base);

      /* Building volumes (layer structure) */
      const structGroup = new THREE.Group();
      structGroup.name = 'structure';
      const bMat = new THREE.MeshStandardMaterial({ color: 0xb8b0a4, roughness: 0.5 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.15), bMat);
      body.position.y = 0.17;
      body.castShadow = true;
      structGroup.add(body);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.17), new THREE.MeshStandardMaterial({ color: 0xa09888, roughness: 0.4 }));
      roof.position.y = 0.33;
      structGroup.add(roof);
      g.add(structGroup);

      /* Finishes layer */
      const finGroup = new THREE.Group();
      finGroup.name = 'finishes';
      const fMat = new THREE.MeshStandardMaterial({ color: [0xd4c8b4, 0xc8d4b4, 0xd4b4b4][idx], roughness: 0.3 });
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.13), fMat);
      fin.position.y = 0.17;
      structGroup.add(fin);
      g.add(finGroup);

      /* Furniture layer */
      const furGroup = new THREE.Group();
      furGroup.name = 'furniture';
      const fuMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 });
      for (let f = 0; f < 3; f++) {
        const fpiece = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.02), fuMat);
        fpiece.position.set((f - 1) * 0.04, 0.32, 0.02);
        furGroup.add(fpiece);
      }
      g.add(furGroup);

      /* Video screen (3D panel) */
      const screenMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x333333, emissiveIntensity: 0.05 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), screenMat);
      screen.position.set(0, 0.25, 0.301);
      g.add(screen);
      videoTextureMeshes.push(screen);

      /* Label circle */
      const labelMat = new THREE.MeshBasicMaterial({ color: 0x8a7a6a, transparent: true, opacity: 0.3 });
      const label = new THREE.Mesh(new THREE.CircleGeometry(0.04), labelMat);
      label.position.y = 0.4;
      g.add(label);

      g.userData = { idx, proj, structGroup, finGroup, furGroup, label, screen };
      scene.add(g);
      projectGroups.push(g);
    });
  }

  /* ---------- Video texture projection ---------- */
  function projectOnScreen(idx) {
    const screen = videoTextureMeshes[idx];
    if (!screen) return;
    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.src = PROJECTS[idx].videoUrl;
    vid.loop = true;
    vid.muted = true;
    vid.preload = 'auto';
    vid.load();
    vid.play().catch(() => {});
    const tex = new THREE.VideoTexture(vid);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    screen.material = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.3 });
  }

  function stopAllProjections() {
    videoTextureMeshes.forEach(s => {
      if (s.material.map) {
        const old = s.material.map;
        s.material = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x333333, emissiveIntensity: 0.05 });
        if (old.image) old.image.pause();
      }
    });
  }

  /* ---------- Layer toggles ---------- */
  dom.layerToggles.forEach((cb) => {
    cb.addEventListener('change', () => {
      currentLayerState[cb.dataset.layer] = cb.checked;
      applyLayers();
    });
  });

  function applyLayers() {
    projectGroups.forEach((g) => {
      const ud = g.userData;
      if (ud.structGroup) ud.structGroup.visible = currentLayerState.structure;
      if (ud.finGroup) ud.finGroup.visible = currentLayerState.finishes;
      if (ud.furGroup) ud.furGroup.visible = currentLayerState.furniture;
    });
  }

  /* ---------- Select project ---------- */
  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const allMeshes = [];
    projectGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) allMeshes.push(c); }));
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length) {
      let found = -1;
      for (let i = 0; i < projectGroups.length; i++) {
        for (let j = 0; j < projectGroups[i].children.length; j++) {
          if (hits[0].object === projectGroups[i].children[j]) { found = i; break; }
        }
        if (found >= 0) break;
      }
      if (found >= 0) selectProject(found);
    }
  });

  function selectProject(idx) {
    currentProjectIdx = idx;
    currentProject = PROJECTS[idx];
    const proj = currentProject;
    dom.projectTitle.textContent = proj.title;
    dom.projectVideo.src = proj.videoUrl;
    dom.projectVideo.load();
    dom.projectVideo.play().catch(() => {});
    dom.projectDesc.textContent = proj.desc;
    dom.projectMeta.innerHTML = proj.tags.map((t) => `<span>${t}</span>`).join('');
    dom.projectLink.href = proj.entrevista;
    dom.beforeAfterSlider.classList.remove('hidden');

    /* Hotspots */
    dom.hotspots.innerHTML = proj.hotspots.map((h) =>
      `<div class="hotspot-item"><div class="hs-title">📍 ${h.t}</div><div class="hs-note">${h.n}</div></div>`
    ).join('');

    dom.projectPanel.classList.remove('hidden');
    projectOnScreen(idx);

    const p = projectGroups[idx];
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { x: p.position.x, y: 1.0, z: p.position.z + 0.8, duration: 0.6 });
    } else {
      camera.position.set(p.position.x, 1.0, p.position.z + 0.8);
    }
  }

  dom.projectClose.addEventListener('click', closeProject);
  function closeProject() {
    dom.projectPanel.classList.add('hidden');
    dom.projectVideo.pause();
    dom.beforeAfterSlider.classList.add('hidden');
    stopAllProjections();
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { x: 0, y: 1.2, z: 3.5, duration: 0.5 });
    } else {
      camera.position.set(0, 1.2, 3.5);
    }
  }

  /* ---------- Before/After slider ---------- */
  dom.beforeAfterBtn.addEventListener('click', () => {
    dom.beforeAfterSlider.classList.toggle('hidden');
  });
  dom.baRange.addEventListener('input', (e) => {
    const val = e.target.value / 100;
    projectGroups.forEach((g) => {
      g.children.forEach((c) => {
        if (c.isMesh && c.material && c.material.color) {
          const base = c.material.color.clone();
          const target = new THREE.Color(0xe8e0d4);
          c.material.color.lerpColors(base, target, val * 0.3);
        }
      });
    });
  });

  /* ---------- Download plan ---------- */
  dom.downloadPlanBtn.addEventListener('click', () => {
    if (currentProjectIdx == null) return;
    const blob = new Blob([`Plano - ${currentProject.title}\n\nTags: ${currentProject.tags.join(', ')}\nDescripción: ${currentProject.desc}\nURL: ${currentProject.planUrl}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `plano-${currentProject.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
  });

  dom.plansBtn.addEventListener('click', () => {
    let text = 'Planos - Portfolio Arquitectura\n\n';
    PROJECTS.forEach((p) => { text += `${p.title}: ${p.planUrl}\n`; });
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'planos-completos.txt';
    a.click();
  });

  /* ---------- Mode toggle ---------- */
  dom.modeFree.addEventListener('click', () => {
    mode = 'free';
    walkthroughActive = false;
    dom.modeFree.classList.add('active');
    dom.modeGuided.classList.remove('active');
    dom.controlsHint.classList.remove('hidden');
    document.body.requestPointerLock?.();
  });
  dom.modeGuided.addEventListener('click', () => {
    mode = 'guided';
    dom.modeGuided.classList.add('active');
    dom.modeFree.classList.remove('active');
    dom.controlsHint.classList.add('hidden');
    if (document.pointerLockElement) document.exitPointerLock();
    startWalkthrough();
  });

  dom.hintClose.addEventListener('click', () => dom.controlsHint.classList.add('hidden'));

  function startWalkthrough() {
    if (currentProjectIdx == null) { selectProject(0); }
    const idx = currentProjectIdx != null ? currentProjectIdx : 0;
    walkPath = WALKTHROUGH_PATHS[idx] || WALKTHROUGH_PATHS[0];
    walkIdx = 0;
    walkthroughActive = true;
    nextWalkPoint();
  }

  function nextWalkPoint() {
    if (!walkthroughActive || walkIdx >= walkPath.length) {
      walkthroughActive = false;
      return;
    }
    const pt = walkPath[walkIdx];
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { x: pt.x, y: pt.y, z: pt.z, duration: 1.5, ease: 'power2.inOut', onComplete: () => {
        walkIdx++;
        setTimeout(nextWalkPoint, 800);
      }});
    } else {
      camera.position.set(pt.x, pt.y, pt.z);
      walkIdx++;
      setTimeout(nextWalkPoint, 300);
    }
  }

  /* ---------- WASD free mode ---------- */
  document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  renderer.domElement.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement !== renderer.domElement) return;
    const movementX = event.movementX || 0;
    euler.y -= movementX * 0.002;
    camera.quaternion.setFromEuler(euler);
  });
  renderer.domElement.addEventListener('click', () => {
    if (mode === 'free' && !document.pointerLockElement) {
      renderer.domElement.requestPointerLock();
    }
  });

  function updateWASD(dt) {
    if (mode !== 'free') return;
    const speed = 0.8 * dt;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    if (keys['w']) camera.position.add(fwd.clone().multiplyScalar(speed));
    if (keys['s']) camera.position.add(fwd.clone().multiplyScalar(-speed));
    if (keys['a']) camera.position.add(right.clone().multiplyScalar(-speed));
    if (keys['d']) camera.position.add(right.clone().multiplyScalar(speed));
    camera.position.y = Math.max(0.2, camera.position.y);
  }

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    PROJECTS.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${p.videoUrl}"></video><div><h3>${p.title}</h3><p>${p.desc}</p><p style="font-size:.55rem;color:var(--muted);margin-top:.15rem">${p.tags.join(', ')}</p></div>`;
      card.addEventListener('click', () => selectProject(i));
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
    const t = clock.elapsedTime;
    projectGroups.forEach((p, i) => {
      if (!prefersReducedMotion) {
        p.position.y = -0.3 + Math.sin(t * 0.25 + i * 0.7) * 0.005;
      }
    });
    updateWASD(dt);
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    applyLayers();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

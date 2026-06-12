(function () {
  'use strict';

  const GARMENTS = [
    {
      id: 'vestido-noche',
      name: 'Vestido de Noche',
      desc: 'Vestido largo en seda con drapeado asimétrico y espalda abierta. Colección Otoño 2025.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      color: 0x3a2a4a,
      tags: ['seda', 'noche', 'drapeado', 'Otoño 2025'],
      credit: 'Diseño: M. Laurent · Confección: Atelier 27 · Modelo: C. Vega'
    },
    {
      id: 'traje-sastre',
      name: 'Traje Sastre',
      desc: 'Traje de dos piezas en lana peinada con corte estructurado y solapa ancha.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      color: 0x4a5a6a,
      tags: ['lana', 'sastre', 'formal', 'Primavera 2025'],
      credit: 'Diseño: P. Durand · Confección: Maison Tailleur · Modelo: A. Rivas'
    },
    {
      id: 'blusa-seda',
      name: 'Blusa de Seda',
      desc: 'Blusa oversized en seda natural con lazo frontal y mangas abullonadas.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      color: 0xc4a876,
      tags: ['seda', 'oversized', 'lazo', 'Verano 2025'],
      credit: 'Diseño: L. Kim · Confección: Studio Soie · Modelo: M. Torres'
    },
    {
      id: 'abrigo-cashmere',
      name: 'Abrigo de Cashmere',
      desc: 'Abrigo largo en cashmere mezcla con cinturón y cuello solapa.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      color: 0x8a7a6a,
      tags: ['cashmere', 'abrigo', 'invierno', 'Invierno 2025'],
      credit: 'Diseño: E. Nakamura · Confección: Cashmere House · Modelo: S. Gómez'
    },
    {
      id: 'falda-plisada',
      name: 'Falda Plisada',
      desc: 'Falda midi plisada en polyester reciclado con estampado geométrico.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      color: 0x5a7a6a,
      tags: ['plisada', 'reciclado', 'midi', 'Primavera 2025'],
      credit: 'Diseño: R. Chen · Confección: EcoModa · Modelo: L. Fernández'
    }
  ];

  const RUNWAY_POSITIONS = [
    { x: -0.6, z: 0 }, { x: -0.3, z: 0 }, { x: 0, z: 0 }, { x: 0.3, z: 0 }, { x: 0.6, z: 0 }
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    panel: document.getElementById('panel'),
    panelClose: document.getElementById('panel-close'),
    panelContent: document.getElementById('panel-content'),
    garmentTitle: document.getElementById('garment-title'),
    garmentDesc: document.getElementById('garment-desc'),
    garmentMeta: document.getElementById('garment-meta'),
    credits: document.getElementById('credits'),
    backstageVideo: document.getElementById('backstage-video'),
    mixerPanel: document.getElementById('mixer-panel'),
    mixerSlots: document.getElementById('mixer-slots'),
    mixerCanvas: document.getElementById('mixer-canvas'),
    exportBtn: document.getElementById('export-btn'),
    audioToggle: document.getElementById('audio-toggle'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modeBtns: document.querySelectorAll('.mode-btn')
  };

  let currentMode = 'runway';
  let selectedGarment = null;
  let isAudioOn = true;
  let scene, camera, renderer, controls;
  let mannequins = [];
  let runwayLights = [];
  let mixerSlots = [null, null, null, null];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let audioCtx = null;
  let bpm = 120;
  let lookbookAngle = 0;
  let lookbookTarget = null;
  let cameraDollyTarget = null;

  /* ── Audio Context init ── */
  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  /* ── Three.js scene ── */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f0ea);

    const w = dom.sceneRoot.clientWidth;
    const h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 1.6, 3.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    dom.sceneRoot.appendChild(renderer.domElement);

    /* Lights */
    const amb = new THREE.AmbientLight(0xfff5ee, 0.4);
    scene.add(amb);

    const key1 = new THREE.DirectionalLight(0xfff0e0, 0.9);
    key1.position.set(2, 4, 3);
    key1.castShadow = true;
    key1.shadow.mapSize.set(512, 512);
    scene.add(key1);
    runwayLights.push(key1);

    const key2 = new THREE.DirectionalLight(0xe8e4ff, 0.6);
    key2.position.set(-2, 3, -2);
    scene.add(key2);
    runwayLights.push(key2);

    const key3 = new THREE.SpotLight(0xc4a876, 0.4, 8, Math.PI / 6, 0.5);
    key3.position.set(0, 3, 0);
    key3.target.position.set(0, 0, 0);
    scene.add(key3);
    scene.add(key3.target);
    runwayLights.push(key3);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.6, metalness: 0.05 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Runway */
    const runwayMat = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.3, metalness: 0.1 });
    const runway = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.6), runwayMat);
    runway.position.set(0, -0.27, 0);
    runway.receiveShadow = true;
    scene.add(runway);

    /* Runway borders */
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xc4a876, roughness: 0.4, metalness: 0.2 });
    [-1.1, 1.1].forEach((x) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.62), borderMat);
      b.position.set(x, -0.24, 0);
      scene.add(b);
    });

    /* Walls */
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8f6f2, roughness: 0.9, side: THREE.BackSide });
    const wallGeom = new THREE.PlaneGeometry(4, 2.5);
    [[0, 0.8, -1.8], [0, 0.8, 1.8], [-2, 0.8, 0], [2, 0.8, 0]].forEach((p) => {
      const w = new THREE.Mesh(wallGeom, wallMat);
      w.position.set(p[0], p[1], p[2]);
      if (p[0] === -2) w.rotation.y = Math.PI / 2;
      else if (p[0] === 2) w.rotation.y = -Math.PI / 2;
      else if (p[2] === 1.8) w.rotation.y = Math.PI;
      scene.add(w);
    });

    /* Background screen (for video texture projection) */
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x111111, emissiveIntensity: 0.1 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), screenMat);
    screen.position.set(0, 0.55, -1.75);
    screen.name = 'bgScreen';
    scene.add(screen);

    /* Create mannequins */
    GARMENTS.forEach((g, idx) => {
      const pos = RUNWAY_POSITIONS[idx] || { x: (idx - 2) * 0.3, z: 0 };
      createMannequin(g, pos, idx);
    });
  }

  function createMannequin(garment, pos, idx) {
    const g = new THREE.Group();
    g.position.set(pos.x, -0.3, pos.z);

    /* Body (simple stylized) */
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d8, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.18, 8), bodyMat);
    body.position.y = 0.18;
    body.castShadow = true;
    g.add(body);

    /* Head */
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d8, roughness: 0.5 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.025), headMat);
    head.position.y = 0.28;
    head.castShadow = true;
    g.add(head);

    /* Garment (colored box representation) */
    const color = new THREE.Color(garment.color);
    const garmentMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.05 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), garmentMat);
    top.position.y = 0.16;
    top.castShadow = true;
    g.add(top);

    const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.035), garmentMat);
    bottom.position.y = 0.07;
    bottom.castShadow = true;
    g.add(bottom);

    /* Glow indicator */
    const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.04), glowMat);
    glow.position.y = -0.02;
    glow.rotation.x = -Math.PI / 2;
    g.add(glow);

    g.userData = { idx, garment, glow, top, bottom, walkPhase: idx * 1.2 };
    scene.add(g);
    mannequins.push(g);
  }

  /* ── Mode switching ── */
  function setMode(mode) {
    currentMode = mode;
    dom.panel.classList.toggle('hidden', mode !== 'runway');
    dom.mixerPanel.classList.toggle('hidden', mode !== 'mixer');
    if (mode === 'lookbook' && selectedGarment != null) {
      lookbookAngle = 0;
      const m = mannequins[selectedGarment];
      if (m) {
        const pos = m.position.clone();
        pos.z += 0.8;
        pos.y = 0.6;
        gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: 0.6, ease: 'power2.out' });
      }
    }
    if (mode === 'mixer') renderMixerSlots();
  }

  dom.modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.modeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setMode(btn.dataset.mode);
    });
  });

  /* ── Garment selection ── */
  function selectGarment(idx) {
    selectedGarment = idx;
    const g = GARMENTS[idx];
    dom.garmentTitle.textContent = g.name;
    dom.garmentDesc.textContent = g.desc;

    dom.backstageVideo.src = g.videoUrl;
    dom.backstageVideo.load();
    dom.backstageVideo.play().catch(() => {});

    dom.credits.textContent = g.credit;
    dom.garmentMeta.innerHTML = g.tags.map((t) => `<span>${t}</span>`).join('');

    dom.panel.classList.remove('hidden');

    /* Dolly camera */
    const pos = mannequins[idx].position;
    gsap.to(camera.position, {
      x: pos.x + 0.5, y: 1.0, z: pos.z + 2.0,
      duration: 0.8, ease: 'power2.out'
    });

    /* Glow effect */
    mannequins.forEach((m, i) => {
      const glow = m.userData.glow;
      if (glow) {
        gsap.to(glow.material, { opacity: i === idx ? 0.4 : 0, duration: 0.3, ease: 'power2.out' });
      }
    });
  }

  dom.panelClose.addEventListener('click', () => {
    dom.panel.classList.add('hidden');
    dom.backstageVideo.pause();
    mannequins.forEach((m) => {
      if (m.userData.glow) m.userData.glow.material.opacity = 0;
    });
    gsap.to(camera.position, { x: 0, y: 1.6, z: 3.8, duration: 0.6, ease: 'power2.out' });
  });

  /* Raycaster for mannequin selection */
  let raycaster = new THREE.Raycaster();
  let pointer = new THREE.Vector2();
  let mannequinMeshes = [];

  function getMannequinMeshes() {
    const meshes = [];
    mannequins.forEach((m) => {
      m.children.forEach((child) => {
        if (child.isMesh) meshes.push(child);
      });
    });
    return meshes;
  }

  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const meshes = getMannequinMeshes();
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length && currentMode === 'runway') {
      let foundIdx = -1;
      for (let i = 0; i < mannequins.length; i++) {
        if (mannequins[i].children.includes(hits[0].object) ||
            mannequins[i].children.includes(hits[0].object.parent)) {
          foundIdx = i;
          break;
        }
      }
      if (foundIdx < 0) {
        /* Check parent chain */
        let obj = hits[0].object;
        while (obj.parent && obj.parent !== scene) {
          for (let i = 0; i < mannequins.length; i++) {
            if (mannequins[i] === obj.parent || mannequins[i] === obj) {
              foundIdx = i;
              break;
            }
          }
          if (foundIdx >= 0) break;
          obj = obj.parent;
        }
      }
      if (foundIdx >= 0) selectGarment(foundIdx);
    }
  });

  /* ── Mixer ── */
  function renderMixerSlots() {
    dom.mixerSlots.innerHTML = '';
    const available = GARMENTS.filter((_, i) => !mixerSlots.includes(i));
    available.forEach((g, i) => {
      const slot = document.createElement('div');
      slot.className = 'mixer-slot';
      slot.draggable = true;
      const realIdx = GARMENTS.indexOf(g);
      slot.dataset.idx = realIdx;
      slot.innerHTML = `<span style="font-size:.6rem;color:var(--muted)">${g.name}</span>`;
      slot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', realIdx);
      });
      slot.addEventListener('click', () => addToMixer(realIdx));
      dom.mixerSlots.appendChild(slot);
    });

    /* Render filled slots */
    mixerSlots.forEach((idx, pos) => {
      if (idx != null) {
        const slot = document.createElement('div');
        slot.className = 'mixer-slot filled';
        const g = GARMENTS[idx];
        slot.innerHTML = `
          <span style="font-size:.6rem;text-align:center;padding:2px">${g.name}</span>
          <button class="remove" data-pos="${pos}">×</button>
        `;
        slot.querySelector('.remove').addEventListener('click', (e) => {
          e.stopPropagation();
          mixerSlots[pos] = null;
          renderMixerSlots();
          updateMixerPreview();
        });
        dom.mixerSlots.appendChild(slot);
      }
    });
  }

  function addToMixer(idx) {
    const empty = mixerSlots.indexOf(null);
    if (empty >= 0) {
      mixerSlots[empty] = idx;
      renderMixerSlots();
      updateMixerPreview();
    }
  }

  function updateMixerPreview() {
    const ctx = dom.mixerCanvas.getContext('2d');
    ctx.clearRect(0, 0, 400, 500);
    ctx.fillStyle = '#f5f0ea';
    ctx.fillRect(0, 0, 400, 500);

    /* Draw mannequin outline */
    ctx.fillStyle = '#e8e0d8';
    ctx.beginPath();
    ctx.ellipse(200, 80, 25, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(185, 105, 30, 80);

    mixerSlots.forEach((idx, pos) => {
      if (idx == null) return;
      const g = GARMENTS[idx];
      const colors = ['#3a2a4a', '#4a5a6a', '#c4a876', '#8a7a6a', '#5a7a6a'];
      ctx.fillStyle = colors[idx % colors.length];
      const yOff = 50 + pos * 90;
      ctx.fillRect(160, yOff, 80, 30);
      ctx.fillStyle = '#fff';
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(g.name, 170, yOff + 18);
    });

    /* Draw collage label */
    ctx.fillStyle = '#c4a876';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('✦ COLLAGE ✦', 160, 480);
  }

  dom.exportBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'collage-showroom.png';
    link.href = dom.mixerCanvas.toDataURL('image/png');
    link.click();
  });

  /* ── Audio sync ── */
  dom.audioToggle.addEventListener('click', () => {
    isAudioOn = !isAudioOn;
    initAudio();
    dom.audioToggle.textContent = isAudioOn ? '🔊' : '🔇';
  });

  function updateLightsWithBPM(t) {
    if (!isAudioOn) return;
    const beatPhase = Math.sin(t * bpm / 60 * Math.PI * 2);
    const intensity = 0.7 + 0.3 * ((beatPhase + 1) / 2);
    runwayLights.forEach((light, i) => {
      if (light.isDirectionalLight) {
        light.intensity = intensity * (i === 0 ? 0.9 : 0.6);
      }
      if (light.isSpotLight) {
        light.intensity = 0.3 + 0.2 * ((beatPhase + 1) / 2);
        const hue = 0.08 + 0.02 * Math.sin(t * 0.5 + i);
        light.color.setHSL(hue, 0.3, 0.7);
      }
    });
  }

  /* ── Mannequin walk animation ── */
  function animateMannequins(t) {
    mannequins.forEach((m, idx) => {
      const phase = t * 0.6 + m.userData.walkPhase;
      const bobY = Math.sin(phase) * 0.008;
      m.position.y = -0.3 + Math.abs(bobY);
      m.rotation.y = Math.sin(phase * 0.5) * 0.05;
      if (m.userData.top) {
        m.userData.top.rotation.x = Math.sin(phase * 2) * 0.02;
      }
    });
  }

  /* ── Lookbook 360 ── */
  function updateLookbook(t) {
    if (currentMode !== 'lookbook' || selectedGarment == null) return;
    lookbookAngle += 0.005;
    const m = mannequins[selectedGarment];
    if (m) {
      m.rotation.y = lookbookAngle;
      /* Zoom with scroll */
    }
  }

  /* ── Fallback ── */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    GARMENTS.forEach((g) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `
        <h3>${g.name}</h3>
        <video controls preload="metadata" src="${g.videoUrl}" crossorigin="anonymous"></video>
        <p>${g.desc}</p>
        <div style="margin-top:.2rem;font-size:.62rem;color:var(--muted)">${g.credit}</div>
      `;
      dom.fbGrid.appendChild(card);
    });
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
  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = dom.sceneRoot.clientWidth / dom.sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.sceneRoot.clientWidth, dom.sceneRoot.clientHeight);
  }
  window.addEventListener('resize', onResize);

  /* ── Animation loop ── */
  function animate() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    animateMannequins(t);
    updateLightsWithBPM(t);
    updateLookbook(t);

    /* Dolly follow in runway mode */
    if (currentMode === 'runway' && selectedGarment != null) {
      const m = mannequins[selectedGarment];
      if (m) {
        const destX = m.position.x * 0.4;
        const destZ = m.position.z + 2.0;
        camera.position.x += (destX - camera.position.x) * 0.03;
        camera.position.z += (destZ - camera.position.z) * 0.03;
      }
    }

    camera.lookAt(0, 0.2, 0);
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  /* ── Scroll-to-zoom in lookbook ── */
  dom.sceneRoot.addEventListener('wheel', (e) => {
    if (currentMode === 'lookbook') {
      const delta = e.deltaY * 0.001;
      camera.position.z = Math.max(1.5, Math.min(5, camera.position.z + delta));
      e.preventDefault();
    }
  }, { passive: false });

  /* ── Init ── */
  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

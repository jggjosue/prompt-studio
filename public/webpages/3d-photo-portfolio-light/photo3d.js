(function () {
  'use strict';

  const SERIES = [
    {
      name: 'Retratos',
      items: [
        { title: 'Elisa', year: '2025', gear: 'Leica M6 · 50mm f/1.4', notes: 'Luz natural en horas doradas. Revelado en plata sobre gelatina.', clip: 0, bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
        { title: 'Carlos', year: '2024', gear: 'Hasselblad 500C · 80mm', notes: 'Retrato ambiental en estudio. Película Portra 400.', clip: 1, bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
        { title: 'Mara', year: '2025', gear: 'Fujifilm GFX 100 · 110mm', notes: 'Serie "Rostros del sur". Iluminación con ventana norte.', clip: 2, bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
      ]
    },
    {
      name: 'Urbano',
      items: [
        { title: 'Metrópolis', year: '2024', gear: 'Sony A7R IV · 24mm', notes: 'Larga exposición desde azotea. 30 segundos, ISO 100.', clip: 3, bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
        { title: 'Estación', year: '2025', gear: 'Leica Q2 · 28mm', notes: 'Fotografía callejera en blanco y negro. Contraste alto.', clip: 4, bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
        { title: 'Callejón', year: '2024', gear: 'Ricoh GR III · 28mm', notes: 'Serie nocturna. Luces de neón y reflejos en charcos.', clip: 5, bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
      ]
    },
    {
      name: 'Naturaleza',
      items: [
        { title: 'Amanecer', year: '2025', gear: 'Nikon Z8 · 70-200mm', notes: 'Primera luz en el páramo. Degradado natural de colores.', clip: 6, bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
        { title: 'Bosque', year: '2024', gear: 'Canon R5 · 100mm Macro', notes: 'Detalle de helecho con rocío. Apilamiento de enfoque.', clip: 7, bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
        { title: 'Río', year: '2025', gear: 'Fujifilm X-T5 · 16mm', notes: 'Larga exposición con filtro ND. Agua sedosa al atardecer.', clip: 8, bts: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
      ]
    }
  ];

  const CLIP_URLS = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  ];

  const FLAT_ITEMS = [];
  SERIES.forEach((s, si) => {
    s.items.forEach((item, ii) => {
      FLAT_ITEMS.push({ ...item, seriesIdx: si, itemIdx: ii, flatIdx: FLAT_ITEMS.length });
    });
  });

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    cardOverlay: document.getElementById('card-overlay'),
    cardTitle: document.getElementById('card-title'),
    cardMeta: document.getElementById('card-meta'),
    cardNotes: document.getElementById('card-notes'),
    cardBtsBtn: document.getElementById('card-bts-btn'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalVideo: document.getElementById('modal-video'),
    modalTranscript: document.getElementById('modal-transcript'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    seriesBtns: document.querySelectorAll('.series-btn')
  };

  let scene, camera, renderer;
  let panels = [];
  let videoTextures = {};
  let activePanel = null;
  let currentSeries = 'all';
  let animFrameId = null;
  let clock = new THREE.Clock();
  let isScrubbing = false;
  let inactivityTimer = null;

  /* ── Three.js ── */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfaf8);

    const w = dom.sceneRoot.clientWidth;
    const h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 30);
    camera.position.set(0, 0.5, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    dom.sceneRoot.appendChild(renderer.domElement);

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xfff5ee, 0.8);
    key.position.set(2, 4, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4e0, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    createPanels();
  }

  function createPanels() {
    const cols = 3;
    FLAT_ITEMS.forEach((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = (col - 1) * 1.6;
      const z = -row * 1.8 - 0.5;

      const g = new THREE.Group();
      g.position.set(x, 0, z);

      /* Frame */
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xe8e4e0, roughness: 0.5, metalness: 0.05
      });
      const w2 = 0.45;
      const h2 = 0.32;
      const depth = 0.025;
      const frameThick = 0.015;

      /* Back plate */
      const back = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, depth), frameMat);
      back.position.z = -depth;
      back.castShadow = true;
      g.add(back);

      /* Screen (video plane) */
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x222222, emissive: 0x111111, emissiveIntensity: 0.05
      });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(w2 - 0.04, h2 - 0.04), screenMat);
      screen.position.z = 0.002;
      g.add(screen);

      /* Frame border */
      const borderMat = new THREE.MeshStandardMaterial({ color: 0xd4d0c8, roughness: 0.6 });
      const border = new THREE.Mesh(new THREE.BoxGeometry(w2 + 0.02, h2 + 0.02, 0.005), borderMat);
      border.position.z = 0.004;
      g.add(border);

      g.userData = {
        item,
        screen,
        basePos: { x, z },
        isPlaying: false,
        videoEl: null
      };

      scene.add(g);
      panels.push(g);
    });
  }

  /* ── Video texture management ── */
  function getOrCreateVideo(clipIdx) {
    if (videoTextures[clipIdx]) return videoTextures[clipIdx];
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.src = CLIP_URLS[clipIdx];
    video.load();

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    videoTextures[clipIdx] = { video, texture };
    return videoTextures[clipIdx];
  }

  function playPanelClip(panel, clipIdx) {
    const vt = getOrCreateVideo(clipIdx);
    const screen = panel.userData.screen;
    if (screen.material.map !== vt.texture) {
      screen.material.map = vt.texture;
      screen.material.color.setHex(0xffffff);
      screen.material.needsUpdate = true;
    }
    if (vt.video.paused) {
      vt.video.play().catch(() => {});
      screen.material.emissiveIntensity = 0.15;
    }
    panel.userData.isPlaying = true;
    panel.userData.videoEl = vt.video;
    resetInactivityTimer();
  }

  function stopPanelClip(panel) {
    const vt = panel.userData.videoEl;
    if (vt && !vt.paused) vt.pause();
    panel.userData.isPlaying = false;
    const screen = panel.userData.screen;
    screen.material.emissiveIntensity = 0.05;
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      panels.forEach((p) => {
        if (p !== activePanel) stopPanelClip(p);
      });
      /* Release textures */
      Object.keys(videoTextures).forEach((key) => {
        const vt = videoTextures[key];
        if (vt.video) vt.video.pause();
      });
    }, 60000);
  }

  /* ── Proximity / hover ── */
  function checkProximity() {
    let nearest = null;
    let minDist = Infinity;
    panels.forEach((p) => {
      const d = camera.position.distanceTo(p.position);
      if (d < minDist) { minDist = d; nearest = p; }
    });

    if (nearest && minDist < 2.0) {
      if (nearest !== activePanel) {
        if (activePanel) stopPanelClip(activePanel);
        activePanel = nearest;
        const clipIdx = nearest.userData.item.clip;
        playPanelClip(nearest, clipIdx);
        showCard(nearest.userData.item);
      }
    } else {
      if (activePanel) {
        stopPanelClip(activePanel);
        activePanel = null;
      }
      dom.cardOverlay.classList.add('hidden');
    }
  }

  /* ── Card overlay ── */
  function showCard(item) {
    dom.cardTitle.textContent = item.title;
    dom.cardMeta.innerHTML = `
      <span>${item.year}</span>
      <span>${item.gear}</span>
    `;
    dom.cardNotes.textContent = `“${item.notes}”`;
    dom.cardOverlay.classList.remove('hidden');
    dom.cardBtsBtn.onclick = () => {
      dom.modalVideo.src = item.bts;
      dom.modalVideo.load();
      dom.modalVideo.play();
      dom.modalTranscript.textContent = `Detrás de cámaras de "${item.title}": ${item.notes} Equipo: ${item.gear}. Año: ${item.year}.`;
      dom.modal.classList.remove('hidden');
    };
  }

  /* ── Scrub on panel ── */
  let scrubTarget = null;

  renderer.domElement.addEventListener('mousedown', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(x, y);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      panels.map((p) => p.userData.screen).filter(Boolean)
    );
    if (hits.length) {
      const hitPanel = panels.find((p) => p.userData.screen === hits[0].object);
      if (hitPanel) {
        isScrubbing = true;
        scrubTarget = hitPanel;
        const vt = hitPanel.userData.videoEl;
        if (vt && vt.duration) {
          const u = hits[0].uv.x;
          vt.currentTime = u * vt.duration;
        }
      }
    }
  });

  renderer.domElement.addEventListener('mousemove', (e) => {
    if (!isScrubbing || !scrubTarget) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(x, y);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([scrubTarget.userData.screen]);
    if (hits.length) {
      const vt = scrubTarget.userData.videoEl;
      if (vt && vt.duration) {
        vt.currentTime = hits[0].uv.x * vt.duration;
      }
    }
  });

  document.addEventListener('mouseup', () => {
    isScrubbing = false;
    scrubTarget = null;
  });

  /* ── Series filtering ── */
  function filterSeries(seriesIdx) {
    currentSeries = seriesIdx;
    const visible = seriesIdx === 'all'
      ? FLAT_ITEMS.map((_, i) => i)
      : FLAT_ITEMS.filter((item) => item.seriesIdx === parseInt(seriesIdx)).map((item) => item.flatIdx);

    const hidden = seriesIdx === 'all'
      ? []
      : FLAT_ITEMS.filter((item) => item.seriesIdx !== parseInt(seriesIdx)).map((item) => item.flatIdx);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    visible.forEach((idx, pos) => {
      const panel = panels[idx];
      const col = pos % 3;
      const row = Math.floor(pos / 3);
      const tx = (col - 1) * 1.6;
      const tz = -row * 1.8 - 0.5;
      if (reduce) {
        panel.position.x = tx;
        panel.position.z = tz;
        panel.visible = true;
      } else {
        gsap.to(panel.position, { x: tx, z: tz, duration: 0.5, ease: 'power2.out', delay: pos * 0.03 });
        panel.visible = true;
      }
    });

    hidden.forEach((idx) => {
      const panel = panels[idx];
      if (reduce) {
        panel.visible = false;
      } else {
        gsap.to(panel.position, { y: -2, duration: 0.4, ease: 'power2.in', delay: idx * 0.01 })
          .then(() => { panel.visible = false; panel.position.y = 0; });
      }
    });
  }

  dom.seriesBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.seriesBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      filterSeries(btn.dataset.series);
    });
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
    FLAT_ITEMS.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `
        <h3>${item.title}</h3>
        <video controls preload="metadata" src="${CLIP_URLS[item.clip]}" crossorigin="anonymous"></video>
        <p>${item.notes}</p>
        <div style="font-size:.6rem;color:var(--muted);margin-top:.2rem">${item.gear} · ${item.year}</div>
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
  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = dom.sceneRoot.clientWidth / dom.sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.sceneRoot.clientWidth, dom.sceneRoot.clientHeight);
  });

  /* ── Animation loop ── */
  function animate() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    /* Gentle camera pan */
    if (!isScrubbing) {
      camera.position.x = Math.sin(t * 0.1) * 0.3;
      camera.lookAt(0, 0, -3);

      /* Update video textures */
      panels.forEach((p) => {
        if (p.userData.isPlaying && p.userData.screen.material.map) {
          p.userData.screen.material.map.needsUpdate = true;
        }
        /* Float animation */
        p.position.y = Math.sin(t * 0.4 + p.position.x * 2) * 0.015;
        p.rotation.y = Math.sin(t * 0.2 + p.position.z * 0.5) * 0.02;
      });
    }

    checkProximity();
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

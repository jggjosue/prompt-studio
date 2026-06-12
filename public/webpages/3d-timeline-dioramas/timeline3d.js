(function () {
  'use strict';

  const CHAPTERS = [
    {
      id: 0, title: 'Orígenes', year: '1920',
      desc: 'Los primeros experimentos con radiofrecuencia y comunicación inalámbrica sentaron las bases.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      cameraCue: { x: 0, z: 3.5 },
      lightingCue: { color: 0xfff0e0, intensity: 0.9 },
      pos: 0,
      hotspots: [
        { label: '🔬 Laboratorio', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', desc: 'El laboratorio de Marconi en 1920.' },
        { label: '📄 Patente', pdf: 'assets/patent-1920.pdf' }
      ]
    },
    {
      id: 1, title: 'Expansión', year: '1950',
      desc: 'La posguerra trajo la televisión y los primeros ordenadores comerciales.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      cameraCue: { x: -2.5, z: 3.5 },
      lightingCue: { color: 0xe8f0ff, intensity: 0.85 },
      pos: -2.5,
      hotspots: [
        { label: '📺 Televisor', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', desc: 'El auge de la TV en los años 50.' }
      ]
    },
    {
      id: 2, title: 'Digital', year: '1980',
      desc: 'El microprocesador y el PC cambiaron la forma de trabajar y comunicarse.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      cameraCue: { x: -5, z: 3.5 },
      lightingCue: { color: 0xf0e8ff, intensity: 0.8 },
      pos: -5,
      hotspots: [
        { label: '💾 Disquete', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', desc: 'Almacenamiento magnético de 1.44 MB.' }
      ]
    },
    {
      id: 3, title: 'Internet', year: '2000',
      desc: 'La web, los buscadores y la burbuja punto-com. Nace la era conectada.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      cameraCue: { x: -7.5, z: 3.5 },
      lightingCue: { color: 0xe0f8e0, intensity: 0.85 },
      pos: -7.5,
      hotspots: [
        { label: '🌐 WWW', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', desc: 'La World Wide Web en 1993.' }
      ]
    },
    {
      id: 4, title: 'IA', year: '2020',
      desc: 'Inteligencia artificial, machine learning y redes neuronales transforman industrias.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      cameraCue: { x: -10, z: 3.5 },
      lightingCue: { color: 0xfff0f0, intensity: 0.9 },
      pos: -10,
      hotspots: [
        { label: '🧠 Red Neuronal', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', desc: 'Arquitectura de deep learning.' },
        { label: '📄 Paper', pdf: 'assets/paper-ai.pdf' }
      ]
    }
  ];

  /* Flatten for fallback */
  const ALL_VIDEOS = CHAPTERS.map((ch, i) => ({
    title: ch.title,
    year: ch.year,
    desc: ch.desc,
    videoUrl: ch.videoUrl,
    idx: i + 1
  }));

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    chapterLabel: document.getElementById('chapter-label'),
    timelineTrack: document.getElementById('timeline-track'),
    timelineProgress: document.getElementById('timeline-progress'),
    chapterDots: document.getElementById('chapter-dots'),
    scrubHandle: document.getElementById('scrub-handle'),
    videoPanel: document.getElementById('video-panel'),
    videoPanelClose: document.getElementById('video-panel-close'),
    videoTitle: document.getElementById('video-title'),
    chapterVideo: document.getElementById('chapter-video'),
    videoDesc: document.getElementById('video-desc'),
    hotspots: document.getElementById('hotspots'),
    pdfLink: document.getElementById('pdf-link'),
    curatorBtn: document.getElementById('curator-btn'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalVideo: document.getElementById('modal-video'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let dioramaGroups = [];
  let timelineLine;
  let camTarget = { x: 0, z: 3.5 };
  let currentChapter = 0;
  let isCuratorMode = false;
  let curatorInterval = null;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let progressTarget = 0;

  /* ── Three.js scene ── */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f6);

    const w = dom.sceneRoot.clientWidth;
    const h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 30);
    camera.position.set(0, 1.5, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    /* Ambient */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xfff5ee, 0.9);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4e0, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf8f6f2, roughness: 0.8 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Timeline line (floating horizontal guide) */
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xd4d0c8, transparent: true, opacity: 0.4 });
    const line = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.01), lineMat);
    line.position.set(-5, -0.1, 0);
    scene.add(line);
    timelineLine = line;

    /* Year labels on sprites */
    createDioramas();
    renderChapterDots();
  }

  function createDioramas() {
    CHAPTERS.forEach((ch, idx) => {
      const g = new THREE.Group();
      const x = ch.pos;
      g.position.set(x, -0.3, 0);

      /* Pedestal */
      const pedMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.5, metalness: 0.05 });
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.4), pedMat);
      ped.position.y = 0.075;
      ped.castShadow = true;
      ped.receiveShadow = true;
      g.add(ped);

      /* Diorama base (colored abstract shape) */
      const colors = [0xc4a876, 0x8a9ab4, 0x9ab48a, 0xb49a8a, 0x8ab4b4];
      const dioramaMat = new THREE.MeshStandardMaterial({
        color: colors[idx % colors.length], roughness: 0.3, metalness: 0.1
      });
      const diorama = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.25), dioramaMat);
      diorama.position.y = 0.25;
      diorama.castShadow = true;
      g.add(diorama);

      /* Inner detail */
      const detailMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d8, roughness: 0.6 });
      const detail = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6), detailMat);
      detail.position.y = 0.35;
      g.add(detail);

      /* Glow ring */
      const glowMat = new THREE.MeshBasicMaterial({
        color: colors[idx % colors.length],
        transparent: true, opacity: 0, side: THREE.DoubleSide
      });
      const glow = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.08, 16), glowMat);
      glow.position.y = -0.02;
      glow.rotation.x = -Math.PI / 2;
      g.add(glow);

      /* Atmospheric glow above */
      const auraMat = new THREE.MeshBasicMaterial({
        color: colors[idx % colors.length],
        transparent: true, opacity: 0.03
      });
      const aura = new THREE.Mesh(new THREE.CircleGeometry(0.15), auraMat);
      aura.position.y = 0.5;
      aura.rotation.x = -Math.PI / 2;
      g.add(aura);

      g.userData = { chIdx: idx, glow, aura };
      scene.add(g);
      dioramaGroups.push(g);
    });
  }

  function renderChapterDots() {
    dom.chapterDots.innerHTML = '';
    CHAPTERS.forEach((ch, idx) => {
      const dot = document.createElement('div');
      dot.className = 'chapter-dot' + (idx === 0 ? ' active' : '');
      const pct = (idx / (CHAPTERS.length - 1)) * 100;
      dot.style.left = `${pct}%`;
      dot.dataset.idx = idx;
      dot.title = ch.title;
      dot.addEventListener('click', () => goToChapter(idx));
      dom.chapterDots.appendChild(dot);
    });
  }

  /* ── Chapter navigation ── */
  function goToChapter(idx) {
    if (idx < 0 || idx >= CHAPTERS.length) return;
    currentChapter = idx;
    const ch = CHAPTERS[idx];

    /* Camera */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      camera.position.x = ch.cameraCue.x;
      camera.position.z = ch.cameraCue.z;
    } else {
      gsap.to(camera.position, {
        x: ch.cameraCue.x, z: ch.cameraCue.z,
        duration: 0.8, ease: 'power2.out'
      });
    }

    camTarget.x = ch.cameraCue.x;
    camTarget.z = ch.cameraCue.z;

    /* Glow effect on diorama */
    dioramaGroups.forEach((dg, i) => {
      const glow = dg.userData.glow;
      if (glow) {
        gsap.to(glow.material, { opacity: i === idx ? 0.5 : 0, duration: 0.3 });
      }
    });

    /* Chapter label */
    dom.chapterLabel.textContent = `Capítulo ${idx + 1}: ${ch.title}`;

    /* Dots */
    document.querySelectorAll('.chapter-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    /* Progress */
    progressTarget = (idx / (CHAPTERS.length - 1)) * 100;
    dom.timelineProgress.style.width = `${progressTarget}%`;
    dom.scrubHandle.style.left = `${progressTarget}%`;

    /* Show video panel */
    showVideoPanel(idx);
  }

  function showVideoPanel(idx) {
    const ch = CHAPTERS[idx];
    dom.videoTitle.textContent = `${ch.title} (${ch.year})`;
    dom.chapterVideo.src = ch.videoUrl;
    dom.chapterVideo.load();
    dom.chapterVideo.play().catch(() => {});
    dom.videoDesc.textContent = ch.desc;
    dom.videoPanel.classList.remove('hidden');

    /* Hotspots */
    dom.hotspots.innerHTML = '';
    ch.hotspots.forEach((hs) => {
      const btn = document.createElement('button');
      btn.className = 'hotspot-btn';
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
      dom.hotspots.appendChild(btn);
    });

    /* PDF link */
    const pdf = ch.hotspots.find((h) => h.pdf);
    if (pdf) {
      dom.pdfLink.style.display = 'block';
      dom.pdfLink.href = pdf.pdf;
    } else {
      dom.pdfLink.style.display = 'none';
    }
  }

  /* ── Timeline scrubbing ── */
  let isScrubbing = false;

  dom.timelineTrack.addEventListener('mousedown', (e) => {
    isScrubbing = true;
    scrub(e);
  });
  document.addEventListener('mousemove', (e) => {
    if (isScrubbing) scrub(e);
  });
  document.addEventListener('mouseup', () => {
    if (isScrubbing) {
      isScrubbing = false;
      const w = dom.timelineTrack.offsetWidth;
      const pct = parseFloat(dom.scrubHandle.style.left || '0');
      const idx = Math.round((pct / 100) * (CHAPTERS.length - 1));
      goToChapter(idx);
    }
  });

  function scrub(e) {
    const rect = dom.timelineTrack.getBoundingClientRect();
    let pct = ((e.clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    dom.timelineProgress.style.width = `${pct}%`;
    dom.scrubHandle.style.left = `${pct}%`;
  }

  dom.videoPanelClose.addEventListener('click', () => {
    dom.videoPanel.classList.add('hidden');
    dom.chapterVideo.pause();
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

  /* ── Curator mode ── */
  dom.curatorBtn.addEventListener('click', () => {
    isCuratorMode = !isCuratorMode;
    dom.curatorBtn.textContent = isCuratorMode ? '⏹ Salir' : '🎬 Curador';
    if (isCuratorMode) {
      let ci = 0;
      goToChapter(ci);
      curatorInterval = setInterval(() => {
        ci = (ci + 1) % CHAPTERS.length;
        goToChapter(ci);
      }, 8000);
    } else {
      clearInterval(curatorInterval);
      curatorInterval = null;
    }
  });

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goToChapter(Math.min(currentChapter + 1, CHAPTERS.length - 1));
    } else if (e.key === 'ArrowLeft') {
      goToChapter(Math.max(currentChapter - 1, 0));
    } else if (e.key === ' ') {
      e.preventDefault();
      if (dom.chapterVideo.paused) dom.chapterVideo.play();
      else dom.chapterVideo.pause();
    }
  });

  /* ── Fallback ── */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    ALL_VIDEOS.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `
        <video controls preload="metadata" src="${item.videoUrl}" crossorigin="anonymous"></video>
        <div>
          <h3>${item.idx}. ${item.title} (${item.year})</h3>
          <p>${item.desc}</p>
        </div>
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
    const t = clock.elapsedTime;

    /* Smooth camera follow */
    camera.position.x += (camTarget.x - camera.position.x) * 0.03;
    camera.position.z += (camTarget.z - camera.position.z) * 0.03;
    camera.lookAt(camera.position.x, 0, 0);

    /* Diorama float animation */
    dioramaGroups.forEach((dg, idx) => {
      dg.position.y = -0.3 + Math.sin(t * 0.5 + idx * 1.2) * 0.015;
      dg.rotation.y = Math.sin(t * 0.3 + idx * 0.8) * 0.02;
    });

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  /* ── Init ── */
  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    /* Start at chapter 0 */
    goToChapter(0);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

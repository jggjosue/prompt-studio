(function () {
  'use strict';

  const WIDGETS = [
    {
      title: 'Ingresos', color: 0x4a7a9a,
      data: [12, 15, 18, 22, 28, 35, 42, 50],
      insight: { videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', desc: 'Crecimiento sostenido impulsado por expansión internacional y nuevos mercados.' }
    },
    {
      title: 'Usuarios', color: 0x5a8a6a,
      data: [200, 450, 780, 1200, 1800, 2500, 3400, 5000],
      insight: { videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', desc: 'Adopción acelerada post-lanzamiento de la versión 3.0.' }
    },
    {
      title: 'Retención', color: 0x8a7a4a,
      data: [0.85, 0.87, 0.88, 0.90, 0.91, 0.92, 0.93, 0.94],
      insight: { videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', desc: 'Mejora continua en retención gracias a onboarding optimizado.' }
    },
    {
      title: 'Ventas', color: 0x9a4a5a,
      data: [340, 420, 510, 680, 820, 950, 1100, 1300],
      insight: { videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', desc: 'Temporada alta impulsada por campañas de marketing digital.' }
    }
  ];

  const PERIODS = ['2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4', '2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4'];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    scrubTrack: document.getElementById('scrub-track'),
    scrubProgress: document.getElementById('scrub-progress'),
    scrubHandle: document.getElementById('scrub-handle'),
    scrubLabel: document.getElementById('scrub-label'),
    insightPanel: document.getElementById('insight-panel'),
    insightClose: document.getElementById('insight-close'),
    insightTitle: document.getElementById('insight-title'),
    insightVideo: document.getElementById('insight-video'),
    insightDesc: document.getElementById('insight-desc'),
    insightClipBtn: document.getElementById('insight-clip-btn'),
    comparatorBtn: document.getElementById('comparator-btn'),
    comparatorOverlay: document.getElementById('comparator-overlay'),
    compVideoA: document.getElementById('comp-video-a'),
    compVideoB: document.getElementById('comp-video-b'),
    compClose: document.getElementById('comp-close'),
    exportBtn: document.getElementById('export-btn'),
    wsIndicator: document.getElementById('websocket-indicator'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalVideo: document.getElementById('modal-video'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let widgets = [];
  let barGroups = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let scrubValue = 0;
  let isScrubbing = false;
  let currentWidgetIdx = null;
  let isComparatorOpen = false;
  let ws = null;

  /* ── Three.js scene ── */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f6);

    const w = dom.sceneRoot.clientWidth;
    const h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 20);
    camera.position.set(0, 2.5, 5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    /* Lights */
    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.9);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    /* Floor grid */
    const gridHelper = new THREE.GridHelper(8, 12, 0xd4d0c8, 0xe8e4e0);
    gridHelper.position.y = -0.3;
    scene.add(gridHelper);

    createWidgets();
  }

  function createWidgets() {
    const positions = [
      { x: -1.2, z: -0.6 },
      { x: 1.2, z: -0.6 },
      { x: -1.2, z: 1.2 },
      { x: 1.2, z: 1.2 }
    ];

    WIDGETS.forEach((wData, idx) => {
      const pos = positions[idx];
      const g = new THREE.Group();
      g.position.set(pos.x, -0.3, pos.z);

      /* Card base */
      const cardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.02 });
      const card = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.8), cardMat);
      card.position.y = 0.02;
      card.receiveShadow = true;
      g.add(card);

      /* Title bar */
      const titleMat = new THREE.MeshStandardMaterial({ color: wData.color, roughness: 0.5 });
      const titleBar = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.015, 0.06), titleMat);
      titleBar.position.set(0, 0.05, 0.33);
      g.add(titleBar);

      /* Bar chart group */
      const barGroup = new THREE.Group();
      barGroup.position.set(0, 0.06, 0);
      const barMat = new THREE.MeshStandardMaterial({ color: wData.color, roughness: 0.4, transparent: true, opacity: 0.8 });
      const maxVal = Math.max(...wData.data);
      wData.data.forEach((val, i) => {
        const h = (val / maxVal) * 0.2;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, Math.max(h, 0.01), 0.04), barMat);
        const xPos = (i - 3.5) * 0.07;
        bar.position.set(xPos, h / 2, 0);
        bar.userData.baseH = h;
        bar.userData.val = val;
        barGroup.add(bar);
      });
      g.add(barGroup);
      barGroups.push(barGroup);

      /* Glow ring */
      const glowMat = new THREE.MeshBasicMaterial({ color: wData.color, transparent: true, opacity: 0 });
      const glow = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.1, 16), glowMat);
      glow.position.y = -0.02;
      glow.rotation.x = -Math.PI / 2;
      g.add(glow);

      g.userData = { idx, glow, wData };
      scene.add(g);
      widgets.push(g);
    });
  }

  /* ── Widget selection ── */
  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    widgets.forEach((w) => w.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      let found = -1;
      for (let i = 0; i < widgets.length; i++) {
        if (widgets[i].children.includes(hits[0].object) ||
            hits[0].object.parent === widgets[i]) {
          found = i; break;
        }
      }
      if (found >= 0) selectWidget(found);
    }
  });

  function selectWidget(idx) {
    currentWidgetIdx = idx;
    const wData = WIDGETS[idx];

    /* Glow */
    widgets.forEach((w, i) => {
      const glow = w.userData.glow;
      gsap.to(glow.material, { opacity: i === idx ? 0.3 : 0, duration: 0.3 });
    });

    /* Camera */
    const wPos = widgets[idx].position;
    gsap.to(camera.position, {
      x: wPos.x, y: 0.8, z: wPos.z + 1.2,
      duration: 0.6, ease: 'power2.out'
    });

    /* Show insight panel */
    dom.insightTitle.textContent = wData.title;
    dom.insightVideo.src = wData.insight.videoUrl;
    dom.insightVideo.load();
    dom.insightVideo.play().catch(() => {});
    dom.insightDesc.textContent = wData.insight.desc;
    dom.insightPanel.classList.remove('hidden');
  }

  dom.insightClose.addEventListener('click', () => {
    dom.insightPanel.classList.add('hidden');
    dom.insightVideo.pause();
    widgets.forEach((w) => { if (w.userData.glow) w.userData.glow.material.opacity = 0; });
    gsap.to(camera.position, { x: 0, y: 2.5, z: 5, duration: 0.5, ease: 'power2.out' });
  });

  /* ── Scrubbing ── */
  dom.scrubTrack.addEventListener('mousedown', (e) => { isScrubbing = true; doScrub(e); });
  document.addEventListener('mousemove', (e) => { if (isScrubbing) doScrub(e); });
  document.addEventListener('mouseup', () => { isScrubbing = false; });

  function doScrub(e) {
    const rect = dom.scrubTrack.getBoundingClientRect();
    let pct = ((e.clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    scrubValue = pct / 100;
    dom.scrubProgress.style.width = `${pct}%`;
    dom.scrubHandle.style.left = `${pct}%`;
    const periodIdx = Math.round(scrubValue * (PERIODS.length - 1));
    dom.scrubLabel.textContent = `Periodo: ${PERIODS[periodIdx]}`;
    updateBars();
  }

  function updateBars() {
    const periodIdx = Math.round(scrubValue * (PERIODS.length - 1));
    barGroups.forEach((bg, bgIdx) => {
      const data = WIDGETS[bgIdx].data;
      const maxVal = Math.max(...data);
      bg.children.forEach((bar, i) => {
        if (i >= data.length) return;
        const targetH = (data[i] / maxVal) * 0.2;
        const currentVal = data[i] * (0.5 + scrubValue * 0.5);
        const h = (currentVal / maxVal) * 0.2;
        bar.scale.y = h / Math.max(bar.userData.baseH, 0.001);
        bar.position.y = h / 2;
      });
    });
  }

  /* ── Comparator ── */
  dom.comparatorBtn.addEventListener('click', () => {
    isComparatorOpen = !isComparatorOpen;
    dom.comparatorOverlay.classList.toggle('hidden');
    if (isComparatorOpen) {
      dom.compVideoA.src = WIDGETS[0].insight.videoUrl;
      dom.compVideoB.src = WIDGETS[1].insight.videoUrl;
      dom.compVideoA.load(); dom.compVideoB.load();
      dom.compVideoA.play().catch(() => {}); dom.compVideoB.play().catch(() => {});
    } else {
      dom.compVideoA.pause(); dom.compVideoB.pause();
    }
  });
  dom.compClose.addEventListener('click', () => {
    isComparatorOpen = false;
    dom.comparatorOverlay.classList.add('hidden');
    dom.compVideoA.pause(); dom.compVideoB.pause();
  });

  /* ── Insight clip ── */
  dom.insightClipBtn.addEventListener('click', () => {
    dom.modalVideo.src = dom.insightVideo.src;
    dom.modalVideo.load();
    dom.modalVideo.play();
    dom.modalBody.innerHTML = `<p>🎬 Clip generado — ${WIDGETS[currentWidgetIdx]?.title || 'Insight'}</p><p style="font-size:.6rem;color:var(--muted)">Marca de tiempo: ${new Date().toISOString()}</p>`;
    dom.modal.classList.remove('hidden');
  });

  /* ── Export snapshot ── */
  dom.exportBtn.addEventListener('click', () => {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = `dashboard-snapshot-${Date.now()}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
  });

  /* ── WebSocket simulation ── */
  let wsInterval = null;
  function startWebSocket() {
    /* Simulate live data updates */
    wsInterval = setInterval(() => {
      scrubValue = Math.random();
      const pct = scrubValue * 100;
      dom.scrubProgress.style.width = `${pct}%`;
      dom.scrubHandle.style.left = `${pct}%`;
      const periodIdx = Math.round(scrubValue * (PERIODS.length - 1));
      dom.scrubLabel.textContent = `📡 Live: ${PERIODS[periodIdx]}`;
      updateBars();
      dom.wsIndicator.textContent = '🟢 Live';
    }, 5000);
  }

  /* ── Modal ── */
  dom.modal.addEventListener('click', (e) => {
    if (e.target === dom.modal) { dom.modal.classList.add('hidden'); dom.modalVideo.pause(); }
  });
  dom.modalClose.addEventListener('click', () => { dom.modal.classList.add('hidden'); dom.modalVideo.pause(); });

  /* ── Fallback ── */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    WIDGETS.forEach((w) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `
        <video controls preload="metadata" src="${w.insight.videoUrl}" crossorigin="anonymous"></video>
        <div>
          <h3>${w.title}</h3>
          <p>${w.insight.desc}</p>
          <div style="margin-top:.2rem;font-size:.6rem;color:var(--muted)">Datos: ${w.data.join(', ')}</div>
          <div style="margin-top:.15rem"><a href="#" onclick="alert('CSV exportado: ${w.title}.csv');return false">📥 CSV</a></div>
        </div>
      `;
      dom.fbGrid.appendChild(card);
    });
  });

  /* ── Visibility API ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    else if (!document.hidden && !animFrameId) { animFrameId = requestAnimationFrame(animate); }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId) animFrameId = requestAnimationFrame(animate);
      else if (!entry.isIntersecting && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
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

    /* Widget float */
    widgets.forEach((w, i) => {
      w.position.y = -0.3 + Math.sin(t * 0.4 + i * 1.5) * 0.01;
    });

    /* Camera look at center when not inspecting */
    if (currentWidgetIdx == null) {
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  /* ── Init ── */
  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    startWebSocket();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

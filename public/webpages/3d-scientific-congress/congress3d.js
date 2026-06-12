/*
 * congress3d.js — Congreso científico 3D
 *
 * Metadatos de papers:
 * - Usar schema.org/ScholarlyArticle para estructurar metadatos.
 * - DOI, ORCID, y afiliaciones deben incluirse en los metadatos.
 * - Los abstracts deben tener versión en HTML y PDF.
 *
 * Formatos de video:
 * - Presentaciones: H.265 720p, 2-4 Mbps, segmentos de 10min para capítulos.
 * - Thumbnails WebP 512px para preview rápido.
 * - Proxies 480p para scrubbing; versiones completas bajo demanda.
 */

(function () {
  'use strict';

  const POSTERS = [
    { id: 'p1', title: 'Edición genética CRISPR-Cas9', authors: 'María López et al.', topic: 'biologia', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', abstract: 'Estudio de aplicaciones de CRISPR en terapia génica para enfermedades raras.' },
    { id: 'p2', title: 'Física de partículas en colisionadores', authors: 'Carlos Ruiz et al.', topic: 'fisica', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', abstract: 'Nuevos resultados del LHC en la búsqueda de materia oscura.' },
    { id: 'p3', title: 'Nanopartículas en oncología', authors: 'Ana Torres et al.', topic: 'medicina', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', abstract: 'Nanopartículas lipídicas para entrega dirigida de fármacos antitumorales.' },
    { id: 'p4', title: 'Biodiversidad del Amazonas', authors: 'José Pérez et al.', topic: 'biologia', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', abstract: 'Monitoreo satelital de deforestación y pérdida de biodiversidad.' },
    { id: 'p5', title: 'Fusión nuclear confinada', authors: 'Elena García et al.', topic: 'fisica', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', abstract: 'Avances en confinamiento magnético para reactores de fusión.' },
    { id: 'p6', title: 'Inmunoterapia CAR-T', authors: 'Luis Martínez et al.', topic: 'medicina', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', abstract: 'Resultados de fase II en leucemia linfoblástica aguda con CAR-T.' }
  ];

  let scene, camera, renderer;
  let posterMeshes = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let currentTopic = 'all';
  let activePosterIdx = -1;
  let favorites = [];
  let questions = [];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metrics = { papersViewed: 0, videosPlayed: 0, questionsSent: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    filterBtns: document.querySelectorAll('#filter-topic .btn-filter'),
    tourBtn: document.getElementById('tour-btn'),
    favoritesBtn: document.getElementById('favorites-btn'),
    favoritesPanel: document.getElementById('favorites-panel'),
    favoritesClose: document.getElementById('favorites-close'),
    favoritesBody: document.getElementById('favorites-body'),
    csvExport: document.getElementById('csv-export'),
    qaBtn: document.getElementById('qa-btn'),
    qaPanel: document.getElementById('qa-panel'),
    qaClose: document.getElementById('qa-close'),
    qaQuestions: document.getElementById('qa-questions'),
    qaInput: document.getElementById('qa-input'),
    qaSend: document.getElementById('qa-send'),
    metricsBtn: document.getElementById('metrics-btn'),
    metricsPanel: document.getElementById('metrics-panel'),
    metricsClose: document.getElementById('metrics-close'),
    metricsBody: document.getElementById('metrics-body'),
    posterOverlay: document.getElementById('poster-overlay'),
    posterVideo: document.getElementById('poster-video'),
    posterInfo: document.getElementById('poster-info'),
    posterAbstract: document.getElementById('poster-abstract'),
    pdfOpen: document.getElementById('pdf-open'),
    posterFav: document.getElementById('poster-fav'),
    posterQa: document.getElementById('poster-qa'),
    posterClose: document.getElementById('poster-close')
  };

  /* ---------- IndexedDB ---------- */
  function saveMetrics() {
    try {
      const req = indexedDB.open('Congress3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'metrics', v: metrics }); };
    } catch (e) { /* silent */ }
  }
  function loadMetrics() {
    try {
      const req = indexedDB.open('Congress3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('metrics'); get.onsuccess = () => { if (get.result) metrics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0eee8);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 15);
    camera.position.set(0, 0.5, 2.5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.4);
    dir.position.set(3, 4, 2);
    dir.castShadow = true;
    scene.add(dir);

    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.7 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    buildPosters();
  }

  function buildPosters() {
    posterMeshes.forEach(m => scene.remove(m));
    posterMeshes = [];

    const topicColors = { biologia: 0x4a8a5a, fisica: 0x3a5a8a, medicina: 0xcc5a5a };
    const positions = [
      [-0.5, 0, -0.3], [0.5, 0, -0.3], [-0.5, 0, 0.3],
      [0.5, 0, 0.3], [0, 0, -0.6], [0, 0, 0.6]
    ];

    POSTERS.forEach((p, idx) => {
      const g = new THREE.Group();
      g.position.set(positions[idx][0], 0, positions[idx][2]);
      const color = topicColors[p.topic] || 0x7a7a7a;

      /* Board */
      const boardMat = new THREE.MeshStandardMaterial({ color: 0xf5f3f0, roughness: 0.5 });
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.02), boardMat);
      board.position.y = 0.08;
      g.add(board);

      /* Accent top */
      const accentMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
      const accent = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.015, 0.021), accentMat);
      accent.position.y = 0.155;
      g.add(accent);

      /* Screen (video) */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = p.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const vTex = new THREE.VideoTexture(vid);
      vTex.minFilter = THREE.LinearFilter;
      const vMat = new THREE.MeshBasicMaterial({ map: vTex, transparent: true, opacity: 0.7 });
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.04), vMat);
      scr.position.set(0, 0.1, 0.012);
      g.add(scr);

      /* Title label */
      const c = document.createElement('canvas'); c.width = 128; c.height = 14;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, 0, 128, 14);
      ctx.fillStyle = '#1a1a2e'; ctx.font = '5px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(p.title.length > 16 ? p.title.slice(0, 15) + '…' : p.title, 64, 10);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lM = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.016), lMat);
      lM.position.set(0, 0.02, 0.012);
      g.add(lM);

      g.userData = { idx, origY: 0 };
      scene.add(g);
      posterMeshes.push(g);
    });
  }

  /* ---------- Filters ---------- */
  dom.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTopic = btn.dataset.topic;
      applyFilter();
    });
  });

  function applyFilter() {
    posterMeshes.forEach((g, i) => {
      const p = POSTERS[i];
      g.visible = currentTopic === 'all' || p.topic === currentTopic;
    });
    if (!prefersReducedMotion) {
      gsap.to(posterMeshes.map(g => g.position), {
        y: (i) => posterMeshes[i].visible ? 0 : -0.12,
        duration: 0.3, stagger: { each: 0.02, from: 'start' }, ease: 'power2.out'
      });
    } else {
      posterMeshes.forEach((g, i) => { g.position.y = g.visible ? 0 : -0.12; });
    }
  }

  /* ---------- Click ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const all = [];
    posterMeshes.forEach(g => { g.children.forEach(c => { if (c.isMesh) all.push(c); }); });
    const hits = raycaster.intersectObjects(all);
    if (hits.length) {
      for (let i = 0; i < posterMeshes.length; i++) {
        for (let c = 0; c < posterMeshes[i].children.length; c++) {
          if (hits[0].object === posterMeshes[i].children[c]) {
            openPoster(posterMeshes[i].userData.idx);
            return;
          }
        }
      }
    }
  });

  /* ---------- Poster overlay ---------- */
  function openPoster(idx) {
    activePosterIdx = idx;
    const p = POSTERS[idx];
    dom.posterVideo.src = p.videoUrl;
    dom.posterVideo.load();
    dom.posterVideo.play().catch(() => {});
    dom.posterInfo.innerHTML =
      `<div class="title">${p.title}</div><div class="authors">${p.authors}</div><div class="topic">${p.topic}</div>`;
    dom.posterAbstract.textContent = p.abstract;
    dom.posterOverlay.classList.remove('hidden');
    metrics.papersViewed++;
    metrics.videosPlayed++;
    saveMetrics();

    flyToPoster(idx);
  }

  dom.posterClose.addEventListener('click', () => closePoster());
  dom.posterFav.addEventListener('click', () => {
    if (activePosterIdx < 0) return;
    const p = POSTERS[activePosterIdx];
    if (!favorites.find(f => f.id === p.id)) {
      favorites.push(p);
      renderFavorites();
    }
  });
  dom.pdfOpen.addEventListener('click', () => {
    /* Simular PDF con texto */
    if (activePosterIdx < 0) return;
    const p = POSTERS[activePosterIdx];
    const blob = new Blob([`${p.title}\n${p.authors}\n\n${p.abstract}\n\nDOI: 10.1234/example.2024`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = `${p.id}-paper.txt`;
    a.href = URL.createObjectURL(blob);
    a.click();
  });

  function closePoster() {
    dom.posterOverlay.classList.add('hidden');
    dom.posterVideo.pause();
    dom.posterVideo.src = '';
  }

  function flyToPoster(idx) {
    const positions = [[-0.5,0,-0.3],[0.5,0,-0.3],[-0.5,0,0.3],[0.5,0,0.3],[0,0,-0.6],[0,0,0.6]];
    const pos = positions[idx];
    if (!pos) return;
    const target = new THREE.Vector3(pos[0], 0.3, pos[2] + 0.2);
    const lookAt = new THREE.Vector3(pos[0], 0, pos[2]);
    if (prefersReducedMotion) { camera.position.copy(target); camera.lookAt(lookAt); }
    else {
      gsap.to(camera.position, { x: target.x, y: target.y, z: target.z, duration: 0.7, ease: 'power2.out',
        onUpdate: () => camera.lookAt(lookAt), onComplete: () => camera.lookAt(lookAt) });
    }
  }

  /* ---------- Favorites & CSV ---------- */
  function renderFavorites() {
    dom.favoritesBody.innerHTML = favorites.map(f =>
      `<div class="fav-item">⭐ ${f.title}</div>`
    ).join('');
  }

  dom.favoritesBtn.addEventListener('click', () => {
    dom.favoritesPanel.classList.toggle('hidden');
    renderFavorites();
  });
  dom.favoritesClose.addEventListener('click', () => dom.favoritesPanel.classList.add('hidden'));

  dom.csvExport.addEventListener('click', () => {
    const rows = favorites.map(f => `${f.id},${f.title},${f.authors},${f.topic}`);
    const csv = 'ID,Title,Authors,Topic\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.download = 'favoritos.csv';
    a.href = URL.createObjectURL(blob);
    a.click();
  });

  /* ---------- Q&A ---------- */
  function renderQA() {
    dom.qaQuestions.innerHTML = questions.map(q =>
      `<div class="qa-q"><span class="stamp">[${q.stamp}]</span> ${q.text}</div>`
    ).join('');
  }

  dom.qaSend.addEventListener('click', () => {
    const text = dom.qaInput.value.trim();
    if (!text || activePosterIdx < 0) return;
    const t = dom.posterVideo.currentTime;
    const m = Math.floor(t / 60); const s = Math.floor(t % 60);
    questions.push({ text, stamp: `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, poster: POSTERS[activePosterIdx].title });
    metrics.questionsSent++;
    saveMetrics();
    dom.qaInput.value = '';
    renderQA();
  });
  dom.qaBtn.addEventListener('click', () => dom.qaPanel.classList.toggle('hidden'));
  dom.qaClose.addEventListener('click', () => dom.qaPanel.classList.add('hidden'));

  /* ---------- Tour ---------- */
  dom.tourBtn.addEventListener('click', () => {
    let idx = 0;
    const visible = POSTERS.filter((p, i) => posterMeshes[i] && posterMeshes[i].visible);
    if (!visible.length) return;
    const step = () => {
      if (idx >= visible.length) return;
      const vi = POSTERS.indexOf(visible[idx]);
      openPoster(vi);
      idx++;
      if (idx < visible.length) setTimeout(step, 5000);
    };
    step();
  });

  /* ---------- Metrics ---------- */
  dom.metricsBtn.addEventListener('click', () => {
    dom.metricsPanel.classList.toggle('hidden');
    dom.metricsBody.innerHTML =
      `<div class="row"><span>📄 Papers</span><span>${metrics.papersViewed}</span></div>` +
      `<div class="row"><span>▶ Videos</span><span>${metrics.videosPlayed}</span></div>` +
      `<div class="row"><span>💬 Preguntas</span><span>${metrics.questionsSent}</span></div>`;
  });
  dom.metricsClose.addEventListener('click', () => dom.metricsPanel.classList.add('hidden'));

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
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadMetrics();
    renderFavorites();
    renderQA();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

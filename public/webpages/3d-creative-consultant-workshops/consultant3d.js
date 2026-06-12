(function () {
  'use strict';

  const WORKSHOPS = [
    {
      title: 'Design Thinking para Equipos',
      client: 'TechCorp · 2026',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      workshopUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      caption: 'Workshop de 3 días sobre innovación centrada en el usuario. 24 asistentes.',
      sections: [
        { label: 'Introducción', start: 0 },
        { label: 'Ejercicios', start: 5 },
        { label: 'Q&A', start: 12 }
      ],
      attachments: ['slides-dt.pdf', 'guia-ejercicios.pdf', 'template-mapa.pdf']
    },
    {
      title: 'Storytelling de Marca',
      client: 'BrandLab · 2025',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      workshopUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      caption: 'Taller intensivo de narrativa corporativa. 18 participantes.',
      sections: [
        { label: 'Introducción', start: 0 },
        { label: 'Ejercicios', start: 4 },
        { label: 'Q&A', start: 10 }
      ],
      attachments: ['slides-storytelling.pdf', 'brand-canvas.pdf']
    }
  ];

  const TABLE_W = 0.5, TABLE_H = 0.3;
  const SPACING = 0.75;
  const START_X = -((WORKSHOPS.length - 1) * SPACING) / 2;

  let scene, camera, renderer;
  let tableGroups = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let activeVideo = null;
  let bookmarks = [];
  let currentWsIdx = 0;

  let analytics = { views: {}, bookmarks: 0 };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    workshopPanel: document.getElementById('workshop-panel'),
    workshopClose: document.getElementById('workshop-close'),
    workshopVideo: document.getElementById('workshop-video'),
    workshopMeta: document.getElementById('workshop-meta'),
    workshopSections: document.getElementById('workshop-sections'),
    notesBody: document.getElementById('notes-body'),
    notesExportBtn: document.getElementById('notes-export-btn'),
    workshopAttachments: document.getElementById('workshop-attachments'),
    bookmarksBtn: document.getElementById('bookmarks-btn'),
    bookmarksPanel: document.getElementById('bookmarks-panel'),
    bookmarksClose: document.getElementById('bookmarks-close'),
    bookmarksBody: document.getElementById('bookmarks-body'),
    summaryBtn: document.getElementById('summary-btn'),
    summaryPanel: document.getElementById('summary-panel'),
    summaryClose: document.getElementById('summary-close'),
    summaryGenBtn: document.getElementById('summary-gen-btn'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbWorkshops: document.getElementById('fb-workshops')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('ConsultantCreative', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('ConsultantCreative', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0eeea);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 20);
    camera.position.set(0, 0.5, 2.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffeedd, 0.4);
    key.position.set(2, 4, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xccddcc, 0.2);
    fill.position.set(-2, 1, 2);
    scene.add(fill);

    buildTables();
  }

  function buildTables() {
    tableGroups.forEach(g => scene.remove(g));
    tableGroups = [];

    WORKSHOPS.forEach((ws, idx) => {
      const x = START_X + idx * SPACING;
      const g = new THREE.Group();
      g.position.set(x, 0.05, 0);

      const tableMat = new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.5, metalness: 0.1 });
      const table = new THREE.Mesh(new THREE.BoxGeometry(TABLE_W, 0.02, TABLE_H), tableMat);
      g.add(table);

      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = ws.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      const sMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), sMat);
      screen.position.y = 0.015;
      screen.position.z = 0.005;
      g.add(screen);

      const c = document.createElement('canvas');
      c.width = 256; c.height = 24;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 256, 24);
      ctx.fillStyle = '#fff';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ws.title, 128, 16);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.025), lMat);
      lMesh.position.set(0, -0.12, 0.005);
      g.add(lMesh);

      g.userData = { idx: idx, origY: 0.05 };
      scene.add(g);
      tableGroups.push(g);
    });
  }

  /* ---------- Click to open workshop ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    tableGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < tableGroups.length; i++) {
        for (let j = 0; j < tableGroups[i].children.length; j++) {
          if (hits[0].object === tableGroups[i].children[j]) { openWorkshop(tableGroups[i].userData.idx); return; }
        }
      }
    }
  });

  function openWorkshop(idx) {
    currentWsIdx = idx;
    const ws = WORKSHOPS[idx];
    activeVideo = dom.workshopVideo;
    activeVideo.src = ws.workshopUrl;
    activeVideo.load();
    activeVideo.play().catch(() => {});
    dom.workshopMeta.textContent = `${ws.title} — ${ws.client}`;

    /* Section buttons */
    dom.workshopSections.innerHTML = '';
    ws.sections.forEach((sec, i) => {
      const btn = document.createElement('button');
      btn.className = 'section-btn' + (i === 0 ? ' active' : '');
      btn.textContent = sec.label;
      btn.dataset.start = sec.start;
      btn.addEventListener('click', () => {
        dom.workshopVideo.currentTime = sec.start;
        dom.workshopSections.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      dom.workshopSections.appendChild(btn);
    });

    /* Attachments */
    dom.workshopAttachments.innerHTML = ws.attachments.map(a =>
      `<button class="attach-btn" data-file="${a}">📄 ${a}</button>`
    ).join('');
    dom.workshopAttachments.querySelectorAll('.attach-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const blob = new Blob(['Material: ' + btn.dataset.file], { type: 'text/plain' });
        const a = document.createElement('a');
        a.download = btn.dataset.file;
        a.href = URL.createObjectURL(blob);
        a.click();
      });
    });

    dom.workshopPanel.classList.remove('hidden');

    analytics.views[idx] = (analytics.views[idx] || 0) + 1;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 1.8, duration: 0.5 });
    } else {
      camera.position.z = 1.8;
    }
  }

  dom.workshopClose.addEventListener('click', () => {
    dom.workshopPanel.classList.add('hidden');
    if (activeVideo) activeVideo.pause();
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 2.8, duration: 0.4 });
    } else {
      camera.position.z = 2.8;
    }
  });

  /* ---------- Notes export ---------- */
  dom.notesExportBtn.addEventListener('click', () => {
    const notes = dom.notesBody.textContent;
    const env = WORKSHOPS[currentWsIdx];
    const blob = new Blob([`Notas: ${env.title}\n\n${notes}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = 'notas-workshop.txt';
    a.href = URL.createObjectURL(blob);
    a.click();
  });

  /* ---------- Bookmarks ---------- */
  dom.workshopVideo.addEventListener('timeupdate', () => {
    if (!dom.workshopPanel.classList.contains('hidden')) {
      const t = dom.workshopVideo.currentTime;
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      const currLabel = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      /* Add bookmark button next to meta */
      let bmBtn = dom.workshopMeta.querySelector('.bookmark-btn');
      if (!bmBtn) {
        bmBtn = document.createElement('button');
        bmBtn.className = 'bookmark-btn';
        bmBtn.textContent = '🔖';
        bmBtn.title = 'Marcar timestamp';
        bmBtn.addEventListener('click', () => {
          const ws = WORKSHOPS[currentWsIdx];
          bookmarks.push({ ws: ws.title, time: currLabel, seconds: t });
          analytics.bookmarks++;
          saveAnalytics();
          renderBookmarks();
        });
        dom.workshopMeta.appendChild(bmBtn);
      }
    }
  });

  function renderBookmarks() {
    dom.bookmarksBody.innerHTML = bookmarks.map((b, i) =>
      `<div class="bm-item" data-idx="${i}"><span class="time">${b.time}</span><span>${b.ws}</span></div>`
    ).join('');
    dom.bookmarksBody.querySelectorAll('.bm-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        const bm = bookmarks[idx];
        if (activeVideo) activeVideo.currentTime = bm.seconds;
      });
    });
  }

  dom.bookmarksBtn.addEventListener('click', () => {
    dom.bookmarksPanel.classList.toggle('hidden');
    renderBookmarks();
  });
  dom.bookmarksClose.addEventListener('click', () => dom.bookmarksPanel.classList.add('hidden'));

  /* ---------- Auto summary ---------- */
  dom.summaryBtn.addEventListener('click', () => dom.summaryPanel.classList.toggle('hidden'));
  dom.summaryClose.addEventListener('click', () => dom.summaryPanel.classList.add('hidden'));
  dom.summaryGenBtn.addEventListener('click', () => {
    const ws = WORKSHOPS[currentWsIdx];
    const pkg = {
      title: ws.title,
      bookmarks: bookmarks.filter(b => b.ws === ws.title),
      notes: dom.notesBody.textContent,
      materials: ws.attachments
    };
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.download = 'resumen-workshop.json';
    a.href = URL.createObjectURL(blob);
    a.click();
  });

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const total = Object.values(analytics.views).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Workshops</span><span>${total}</span></div>
      <div class="analytics-row"><span>🔖 Bookmarks</span><span>${analytics.bookmarks}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      dom.fbWorkshops.innerHTML = '';
      WORKSHOPS.forEach((ws) => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `<video controls preload="metadata" src="${ws.workshopUrl}"></video><div><h3>${ws.title}</h3><p>${ws.client} · ${ws.caption}</p></div>`;
        dom.fbWorkshops.appendChild(card);
      });
    }
  });

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
    const t = clock.elapsedTime;
    tableGroups.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.position.y = g.userData.origY + Math.sin(t * 0.22 + i * 1.4) * 0.003;
      }
    });
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadAnalytics();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

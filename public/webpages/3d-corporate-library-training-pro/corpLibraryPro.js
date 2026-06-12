(function () {
  'use strict';

  const CLIPS = [
    { id: 'seguridad', title: 'Seguridad Informática', dept: 'IT', level: 'basic', durationSec: 480, duration: '8:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', transcript: 'Conceptos básicos de seguridad: contraseñas seguras, 2FA, phishing y cómo reportar incidentes.', tags: ['seguridad', 'phishing', '2FA'] },
    { id: 'cloud', title: 'Cloud Avanzado', dept: 'IT', level: 'advanced', durationSec: 900, duration: '15:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', transcript: 'Arquitecturas cloud: microservicios, serverless, Kubernetes y CI/CD pipelines.', tags: ['cloud', 'Kubernetes', 'serverless'] },
    { id: 'git', title: 'Git para Equipos', dept: 'IT', level: 'intermediate', durationSec: 720, duration: '12:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', transcript: 'Flujos de trabajo con Git: branching, code review, merge strategies y conflict resolution.', tags: ['git', 'branching', 'code review'] },
    { id: 'onboarding', title: 'Onboarding RH', dept: 'RH', level: 'basic', durationSec: 360, duration: '6:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', transcript: 'Proceso de onboarding: documentación, beneficios, cultura y herramientas corporativas.', tags: ['onboarding', 'beneficios', 'cultura'] },
    { id: 'evaluacion', title: 'Evaluación Desempeño', dept: 'RH', level: 'intermediate', durationSec: 600, duration: '10:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', transcript: 'Metodologías de evaluación: OKRs, feedback 360° y planes de desarrollo individual.', tags: ['evaluación', 'OKRs', 'feedback'] },
    { id: 'presupuestos', title: 'Presupuestos', dept: 'Finanzas', level: 'basic', durationSec: 420, duration: '7:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', transcript: 'Elaboración de presupuestos anuales, control de gastos y reporting financiero.', tags: ['presupuesto', 'gastos', 'reporting'] },
    { id: 'marketing', title: 'Marketing Digital', dept: 'Marketing', level: 'intermediate', durationSec: 660, duration: '11:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', transcript: 'Estrategias de marketing digital: SEO, SEM, redes sociales y analytics.', tags: ['SEO', 'SEM', 'analytics'] }
  ];

  const SHELF_POSITIONS = [
    { x: -1.8, z: -0.8, label: 'IT' }, { x: -1.8, z: 1, label: 'RH' },
    { x: 1.8, z: -0.8, label: 'Finanzas' }, { x: 1.8, z: 1, label: 'Marketing' }
  ];

  let notesDB = {};
  let playlists = [];
  let completionDB = {};
  let metricsDB = { views: {}, timeSpent: {}, completions: {} };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    searchInput: document.getElementById('search-input'),
    deptFilter: document.getElementById('dept-filter'),
    levelFilter: document.getElementById('level-filter'),
    durationFilter: document.getElementById('duration-filter'),
    clipPanel: document.getElementById('clip-panel'),
    clipClose: document.getElementById('clip-close'),
    clipTitle: document.getElementById('clip-title'),
    clipVideo: document.getElementById('clip-video'),
    clipMeta: document.getElementById('clip-meta'),
    transcriptBody: document.getElementById('transcript-body'),
    notesInput: document.getElementById('notes-input'),
    notesAddBtn: document.getElementById('notes-add-btn'),
    notesTimeline: document.getElementById('notes-timeline'),
    notesCount: document.getElementById('notes-count'),
    exportNotesBtn: document.getElementById('export-notes-btn'),
    playlistBtn: document.getElementById('playlist-btn'),
    addToPlaylistBtn: document.getElementById('add-to-playlist-btn'),
    markCompleteBtn: document.getElementById('mark-complete-btn'),
    playlistPanel: document.getElementById('playlist-panel'),
    playlistClose: document.getElementById('playlist-close'),
    playlistList: document.getElementById('playlist-list'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    statsBar: document.getElementById('stats-bar'),
    statCompletion: document.getElementById('stat-completion'),
    statAvgTime: document.getElementById('stat-avg-time'),
    statTopNotes: document.getElementById('stat-top-notes'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body'),
    proxyCanvas: document.getElementById('proxy-canvas'),
    proxyTime: document.getElementById('proxy-time'),
    scrubberProxy: document.getElementById('scrubber-proxy')
  };

  let scene, camera, renderer;
  let shelfGroups = [];
  let bookMeshes = [];
  let currentClipIdx = null;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let videoTimePoll = null;
  let searchIndex = null;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Algolia-like search index ---------- */
  function buildSearchIndex() {
    const idx = [];
    CLIPS.forEach((c, i) => {
      const tokens = `${c.title} ${c.transcript} ${c.tags.join(' ')} ${c.dept} ${c.level}`
        .toLowerCase().split(/[\s,.-]+/).filter(Boolean);
      const freq = {};
      tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
      idx.push({ i, tokens: Object.keys(freq), freq });
    });
    searchIndex = idx;
  }

  function searchAlgolia(query) {
    if (!query.trim()) return CLIPS.map((_, i) => i);
    const qTokens = query.toLowerCase().split(/[\s,.-]+/).filter(Boolean);
    const scores = searchIndex.map(entry => {
      let score = 0;
      qTokens.forEach(qt => {
        entry.tokens.forEach(t => {
          if (t.startsWith(qt)) score += (entry.freq[t] || 0) * (t === qt ? 2 : 1);
        });
      });
      return { i: entry.i, score };
    });
    scores.sort((a, b) => b.score - a.score);
    return scores.filter(s => s.score > 0).map(s => s.i);
  }

  /* ---------- Three.js scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f4);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 20);
    camera.position.set(0, 1.8, 4);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.8);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.8 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    scene.add(floor);

    createShelves();
  }

  function createShelves() {
    SHELF_POSITIONS.forEach((sp) => {
      const g = new THREE.Group();
      g.position.set(sp.x, -0.3, sp.z);

      const boardMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.6 });
      for (let r = 0; r < 3; r++) {
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.16), boardMat);
        board.position.set(0, r * 0.18, 0);
        board.receiveShadow = true;
        g.add(board);
      }
      [-0.22, 0.22].forEach((x) => {
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 0.16), new THREE.MeshStandardMaterial({ color: 0xd4c8b4 }));
        side.position.set(x, 0.18, 0);
        g.add(side);
      });

      const clipIdx = CLIPS.findIndex((c) => c.dept === sp.label);
      const books = [];
      for (let r = 0; r < 3; r++) {
        for (let b = 0; b < 2; b++) {
          const ci = clipIdx >= 0 ? clipIdx : 0;
          const colors = [0x8a7a6a, 0x4a6a8a, 0x6a8a5a, 0x8a5a6a];
          const bookMat = new THREE.MeshStandardMaterial({ color: colors[(ci + r + b) % colors.length], roughness: 0.5 });
          const book = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.1, 0.1), bookMat);
          book.position.set((b - 0.5) * 0.08, r * 0.18 + 0.06, 0);
          book.castShadow = true;
          book.userData = { clipIdx: ci };
          g.add(book);
          books.push(book);
          bookMeshes.push(book);
        }
      }
      g.userData = { label: sp.label, books };
      scene.add(g);
      shelfGroups.push(g);
    });
  }

  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(bookMeshes);
    if (hits.length) {
      const idx = hits[0].object.userData.clipIdx;
      if (idx != null) selectClip(idx);
    }
  });

  /* ---------- Clip selection ---------- */
  function selectClip(idx) {
    currentClipIdx = idx;
    const clip = CLIPS[idx];
    dom.clipTitle.textContent = clip.title;
    dom.clipVideo.src = clip.videoUrl;
    dom.clipVideo.load();
    dom.clipVideo.play().catch(() => {});
    dom.clipMeta.innerHTML = `<span>${clip.dept}</span><span>${clip.level}</span><span>${clip.duration}</span><span>${clip.tags.join(', ')}</span>`;
    dom.transcriptBody.textContent = clip.transcript;
    dom.clipPanel.classList.remove('hidden');
    renderNotes();
    updateStats();

    metricsDB.views[idx] = (metricsDB.views[idx] || 0) + 1;
    saveMetrics();

    if (videoTimePoll) clearInterval(videoTimePoll);
    videoTimePoll = setInterval(() => {
      if (!dom.clipVideo.paused) {
        metricsDB.timeSpent[idx] = (metricsDB.timeSpent[idx] || 0) + 1;
      }
    }, 1000);

    const pos = bookMeshes[idx].getWorldPosition(new THREE.Vector3());
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { x: pos.x, y: 0.5, z: pos.z + 1, duration: 0.6 });
    } else {
      camera.position.set(pos.x, 0.5, pos.z + 1);
    }
  }

  dom.clipClose.addEventListener('click', closeClipPanel);
  function closeClipPanel() {
    dom.clipPanel.classList.add('hidden');
    dom.clipVideo.pause();
    dom.scrubberProxy.classList.add('hidden');
    if (videoTimePoll) { clearInterval(videoTimePoll); videoTimePoll = null; }
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { x: 0, y: 1.8, z: 4, duration: 0.5 });
    } else {
      camera.position.set(0, 1.8, 4);
    }
  }

  /* ---------- Scrubber with proxy thumbnails ---------- */
  dom.clipVideo.addEventListener('timeupdate', () => {
    const v = dom.clipVideo;
    if (v.duration && !isNaN(v.duration) && v.seeking) {
      const pct = v.currentTime / v.duration;
      const cw = 120, ch = 68;
      dom.proxyCanvas.width = cw;
      dom.proxyCanvas.height = ch;
      const ctx = dom.proxyCanvas.getContext('2d');
      ctx.drawImage(v, 0, 0, cw, ch);
      dom.proxyTime.textContent = formatTime(v.currentTime);
    }
  });
  dom.clipVideo.addEventListener('seeking', () => {
    dom.scrubberProxy.classList.remove('hidden');
  });
  dom.clipVideo.addEventListener('seeked', () => {
    dom.scrubberProxy.classList.add('hidden');
  });

  /* ---------- Notes ---------- */
  dom.notesAddBtn.addEventListener('click', addNote);
  dom.notesInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addNote(); });

  function addNote() {
    if (currentClipIdx == null) return;
    const text = dom.notesInput.value.trim();
    if (!text) return;
    const ts = dom.clipVideo.currentTime;
    if (!notesDB[currentClipIdx]) notesDB[currentClipIdx] = [];
    notesDB[currentClipIdx].push({ ts, text, date: new Date().toISOString() });
    dom.notesInput.value = '';
    renderNotes();
    saveNotes();
  }

  function renderNotes() {
    dom.notesTimeline.innerHTML = '';
    if (currentClipIdx == null || !notesDB[currentClipIdx]) { dom.notesCount.textContent = ''; return; }
    dom.notesCount.textContent = `(${notesDB[currentClipIdx].length})`;
    notesDB[currentClipIdx].forEach((note, i) => {
      const div = document.createElement('div');
      div.className = 'note-item';
      div.innerHTML = `<span style="color:var(--blue)">${formatTime(note.ts)}</span> ${note.text}`;
      div.addEventListener('click', () => { dom.clipVideo.currentTime = note.ts; });
      dom.notesTimeline.appendChild(div);
    });
  }

  function saveNotes() {
    try {
      setData('notes', notesDB);
    } catch (e) { console.warn('Save notes error', e); }
  }

  function loadNotes() {
    try {
      const d = getData('notes');
      if (d) notesDB = d;
    } catch (e) { /* ignore */ }
  }

  dom.exportNotesBtn.addEventListener('click', () => {
    let text = 'Notas de Formación\n\n';
    Object.keys(notesDB).forEach((key) => {
      const clip = CLIPS[parseInt(key)];
      if (!clip) return;
      text += `--- ${clip.title} ---\n`;
      notesDB[key].forEach((n) => { text += `[${formatTime(n.ts)}] ${n.text} (${n.date})\n`; });
      text += '\n';
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'notas-formacion.txt';
    a.click();
  });

  /* ---------- Playlists ---------- */
  dom.playlistBtn.addEventListener('click', () => {
    dom.playlistPanel.classList.toggle('hidden');
    renderPlaylists();
  });
  dom.playlistClose.addEventListener('click', () => dom.playlistPanel.classList.add('hidden'));

  dom.addToPlaylistBtn.addEventListener('click', () => {
    if (currentClipIdx == null) return;
    const name = prompt('Nombre de la playlist:', `Lista ${playlists.length + 1}`);
    if (!name) return;
    let pl = playlists.find(p => p.name === name);
    if (!pl) { pl = { name, clips: [] }; playlists.push(pl); }
    if (!pl.clips.includes(currentClipIdx)) pl.clips.push(currentClipIdx);
    setData('playlists', playlists);
    renderPlaylists();
  });

  function renderPlaylists() {
    dom.playlistList.innerHTML = '';
    if (!playlists.length) { dom.playlistList.innerHTML = '<p style="font-size:.62rem;color:var(--muted)">Sin playlists aún.</p>'; return; }
    playlists.forEach((pl, i) => {
      const div = document.createElement('div');
      div.className = 'playlist-item';
      div.innerHTML = `<div class="pli-title">${pl.name}</div><div class="pli-meta">${pl.clips.length} clips</div>`;
      div.addEventListener('click', () => {
        dom.modalBody.innerHTML = `<h4>${pl.name}</h4><ul>${pl.clips.map(c => `<li>${CLIPS[c].title}</li>`).join('')}</ul>`;
        dom.modal.classList.remove('hidden');
      });
      dom.playlistList.appendChild(div);
    });
  }

  /* ---------- Completion & Metrics ---------- */
  dom.markCompleteBtn.addEventListener('click', () => {
    if (currentClipIdx == null) return;
    completionDB[currentClipIdx] = true;
    metricsDB.completions[currentClipIdx] = (metricsDB.completions[currentClipIdx] || 0) + 1;
    setData('completions', completionDB);
    saveMetrics();
    updateStats();
  });

  function updateStats() {
    const total = CLIPS.length;
    const completed = Object.keys(completionDB).length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    dom.statCompletion.textContent = `✔ ${rate}% completado`;

    const times = Object.values(metricsDB.timeSpent || {});
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    dom.statAvgTime.textContent = `⏱ Promedio ${formatTime(avg)}`;

    const noteCounts = {};
    Object.values(notesDB).forEach(arr => {
      if (arr) arr.forEach(n => {
        const word = n.text.split(/\s+/).slice(0, 3).join(' ');
        noteCounts[word] = (noteCounts[word] || 0) + 1;
      });
    });
    const top = Object.entries(noteCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]).join(', ');
    dom.statTopNotes.textContent = `📝 ${top || 'Sin notas'}`;
    dom.statsBar.classList.remove('hidden');
  }

  function saveMetrics() {
    setData('metrics', metricsDB);
  }

  /* ---------- Search with Algolia-like ranking ---------- */
  dom.searchInput.addEventListener('input', search);
  dom.deptFilter.addEventListener('change', search);
  dom.levelFilter.addEventListener('change', search);
  dom.durationFilter.addEventListener('change', search);

  function search() {
    const query = dom.searchInput.value;
    const dept = dom.deptFilter.value;
    const level = dom.levelFilter.value;
    const dur = dom.durationFilter.value;

    let ranked = query.trim() ? searchAlgolia(query) : CLIPS.map((_, i) => i);

    CLIPS.forEach((clip, idx) => {
      const inRanked = ranked.includes(idx);
      const matchDept = dept === 'all' || clip.dept === dept;
      const matchLevel = level === 'all' || clip.level === level;
      let matchDur = dur === 'all';
      if (!matchDur) {
        const sec = clip.durationSec;
        if (dur === 'short') matchDur = sec < 480;
        else if (dur === 'medium') matchDur = sec >= 480 && sec <= 720;
        else if (dur === 'long') matchDur = sec > 720;
      }
      const show = inRanked && matchDept && matchLevel && matchDur;
      const books = shelfGroups.flatMap((sg) => sg.userData.books).filter((b) => b.userData.clipIdx === idx);
      books.forEach((b) => {
        b.visible = show;
        if (show && query.trim()) {
          b.material.emissive = new THREE.Color(0x444444);
          b.material.emissiveIntensity = 0.3;
          if (!prefersReducedMotion) {
            gsap.to(b.position, { y: b.position.y + 0.05, duration: 0.3, yoyo: true, repeat: 1 });
          }
        } else {
          b.material.emissive = new THREE.Color(0x000000);
        }
      });
    });
  }

  /* ---------- Storage helpers ---------- */
  function setData(key, val) {
    try {
      const req = indexedDB.open('CorpLibraryPro', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' });
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('data', 'readwrite');
        tx.objectStore('data').put({ k: key, v: val, updated: Date.now() });
      };
    } catch (e) { console.warn('IndexedDB error', e); }
  }

  function getData(key) {
    let result = null;
    try {
      const req = indexedDB.open('CorpLibraryPro', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' });
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('data', 'readonly');
        const get = tx.objectStore('data').get(key);
        get.onsuccess = () => { if (get.result) result = get.result.v; };
      };
    } catch (e) { /* ignore */ }
    return result;
  }

  function loadAllData() {
    loadNotes();
    try {
      const p = getData('playlists');
      if (p) playlists = p;
      const c = getData('completions');
      if (c) completionDB = c;
      const m = getData('metrics');
      if (m) metricsDB = m;
    } catch (e) { /* ignore */ }
  }

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    CLIPS.forEach((c, i) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${c.videoUrl}"></video><div><h3>${c.title}</h3><p>${c.dept} · ${c.level} · ${c.duration}</p><p style="font-size:.55rem;color:var(--muted);margin-top:.15rem">${c.tags.join(', ')}</p></div>`;
      card.addEventListener('click', () => { selectClip(i); });
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
    const t = clock.elapsedTime;
    if (!prefersReducedMotion) {
      shelfGroups.forEach((sg, i) => {
        sg.position.y = -0.3 + Math.sin(t * 0.3 + i * 1.2) * 0.005;
      });
    }
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function init() {
    buildSearchIndex();
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    loadAllData();
    updateStats();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

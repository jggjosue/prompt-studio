(function () {
  'use strict';

  const CLIPS = [
    { title: 'Seguridad Informática', dept: 'IT', level: 'basic', duration: '8:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', transcript: 'Conceptos básicos de seguridad: contraseñas seguras, 2FA, phishing y cómo reportar incidentes.', tags: ['seguridad', 'phishing', '2FA'] },
    { title: 'Cloud Avanzado', dept: 'IT', level: 'advanced', duration: '15:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', transcript: 'Arquitecturas cloud: microservicios, serverless, Kubernetes y CI/CD pipelines.', tags: ['cloud', 'Kubernetes', 'serverless'] },
    { title: 'Git para Equipos', dept: 'IT', level: 'intermediate', duration: '12:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', transcript: 'Flujos de trabajo con Git: branching, code review, merge strategies y conflict resolution.', tags: ['git', 'branching', 'code review'] },
    { title: 'Onboarding RH', dept: 'RH', level: 'basic', duration: '6:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', transcript: 'Proceso de onboarding: documentación, beneficios, cultura y herramientas corporativas.', tags: ['onboarding', 'beneficios', 'cultura'] },
    { title: 'Evaluación Desempeño', dept: 'RH', level: 'intermediate', duration: '10:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', transcript: 'Metodologías de evaluación: OKRs, feedback 360° y planes de desarrollo individual.', tags: ['evaluación', 'OKRs', 'feedback'] },
    { title: 'Presupuestos', dept: 'Finanzas', level: 'basic', duration: '7:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', transcript: 'Elaboración de presupuestos anuales, control de gastos y reporting financiero.', tags: ['presupuesto', 'gastos', 'reporting'] },
    { title: 'Marketing Digital', dept: 'Marketing', level: 'intermediate', duration: '11:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', transcript: 'Estrategias de marketing digital: SEO, SEM, redes sociales y analytics.', tags: ['SEO', 'SEM', 'analytics'] }
  ];

  const SHELF_LABELS = { IT: 'IT', RH: 'RH', Finanzas: 'Finanzas', Marketing: 'Marketing' };
  const SHELF_POSITIONS = [
    { x: -1.8, z: -0.8, label: 'IT' }, { x: -1.8, z: 1, label: 'RH' },
    { x: 1.8, z: -0.8, label: 'Finanzas' }, { x: 1.8, z: 1, label: 'Marketing' }
  ];

  let notesDB = {};

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    searchInput: document.getElementById('search-input'),
    deptFilter: document.getElementById('dept-filter'),
    levelFilter: document.getElementById('level-filter'),
    clipPanel: document.getElementById('clip-panel'),
    clipClose: document.getElementById('clip-close'),
    clipTitle: document.getElementById('clip-title'),
    clipVideo: document.getElementById('clip-video'),
    clipMeta: document.getElementById('clip-meta'),
    transcriptBody: document.getElementById('transcript-body'),
    notesInput: document.getElementById('notes-input'),
    notesAddBtn: document.getElementById('notes-add-btn'),
    notesTimeline: document.getElementById('notes-timeline'),
    exportNotesBtn: document.getElementById('export-notes-btn'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let shelfGroups = [];
  let bookMeshes = [];
  let currentClip = null;
  let animFrameId = null;
  let clock = new THREE.Clock();

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

  function selectClip(idx) {
    currentClip = idx;
    const clip = CLIPS[idx];
    dom.clipTitle.textContent = clip.title;
    dom.clipVideo.src = clip.videoUrl;
    dom.clipVideo.load();
    dom.clipVideo.play().catch(() => {});
    dom.clipMeta.innerHTML = `<span>🏢 ${clip.dept}</span><span>📊 ${clip.level}</span><span>⏱ ${clip.duration}</span><span>🏷 ${clip.tags.join(', ')}</span>`;
    dom.transcriptBody.textContent = clip.transcript;
    dom.clipPanel.classList.remove('hidden');
    renderNotes();

    const pos = bookMeshes[idx].getWorldPosition(new THREE.Vector3());
    gsap.to(camera.position, { x: pos.x, y: 0.5, z: pos.z + 1, duration: 0.6 });
  }

  dom.clipClose.addEventListener('click', () => { dom.clipPanel.classList.add('hidden'); dom.clipVideo.pause(); gsap.to(camera.position, { x: 0, y: 1.8, z: 4, duration: 0.5 }); });

  dom.notesAddBtn.addEventListener('click', () => {
    if (currentClip == null) return;
    const text = dom.notesInput.value.trim();
    if (!text) return;
    const ts = dom.clipVideo.currentTime;
    if (!notesDB[currentClip]) notesDB[currentClip] = [];
    notesDB[currentClip].push({ ts, text, date: new Date().toISOString() });
    dom.notesInput.value = '';
    renderNotes();
    saveNotesToIndexedDB();
  });

  function renderNotes() {
    dom.notesTimeline.innerHTML = '';
    if (currentClip == null || !notesDB[currentClip]) return;
    notesDB[currentClip].forEach((note, i) => {
      const div = document.createElement('div');
      div.className = 'note-item';
      div.innerHTML = `<span style="color:var(--blue)">${note.ts.toFixed(1)}s</span> ${note.text}`;
      dom.notesTimeline.appendChild(div);
    });
  }

  function saveNotesToIndexedDB() {
    try {
      const req = indexedDB.open('CorpLibraryNotes', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes', { keyPath: 'id' });
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('notes', 'readwrite');
        tx.objectStore('notes').put({ id: 'all', data: notesDB, updated: Date.now() });
      };
    } catch (e) { console.warn('IndexedDB error', e); }
  }

  function loadNotesFromIndexedDB() {
    try {
      const req = indexedDB.open('CorpLibraryNotes', 1);
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('notes', 'readonly');
        const get = tx.objectStore('notes').get('all');
        get.onsuccess = () => { if (get.result) notesDB = get.result.data || {}; };
      };
    } catch (e) { /* ignore */ }
  }

  dom.exportNotesBtn.addEventListener('click', () => {
    let text = 'Notas de Formación\n\n';
    Object.keys(notesDB).forEach((key) => {
      const clip = CLIPS[parseInt(key)];
      if (!clip) return;
      text += `--- ${clip.title} ---\n`;
      notesDB[key].forEach((n) => { text += `[${n.ts.toFixed(1)}s] ${n.text} (${n.date})\n`; });
      text += '\n';
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'notas-formacion.txt';
    a.click();
  });

  dom.searchInput.addEventListener('input', search);
  dom.deptFilter.addEventListener('change', search);
  dom.levelFilter.addEventListener('change', search);

  function search() {
    const query = dom.searchInput.value.toLowerCase();
    const dept = dom.deptFilter.value;
    const level = dom.levelFilter.value;
    CLIPS.forEach((clip, idx) => {
      const matchText = `${clip.title} ${clip.transcript} ${clip.tags.join(' ')}`.toLowerCase().includes(query);
      const matchDept = dept === 'all' || clip.dept === dept;
      const matchLevel = level === 'all' || clip.level === level;
      const show = matchText && matchDept && matchLevel;
      const books = shelfGroups.flatMap((sg) => sg.userData.books).filter((b) => b.userData.clipIdx === idx);
      books.forEach((b) => {
        b.visible = show;
        if (show && query) {
          b.material.emissive = new THREE.Color(0x444444);
          b.material.emissiveIntensity = 0.3;
          gsap.to(b.position, { y: b.position.y + 0.05, duration: 0.3, yoyo: true, repeat: 1 });
        } else {
          b.material.emissive = new THREE.Color(0x000000);
        }
      });
    });
  }

  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
  dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    CLIPS.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${c.videoUrl}"></video><div><h3>${c.title}</h3><p>${c.dept} · ${c.level} · ${c.duration}</p></div>`;
      dom.fbGrid.appendChild(card);
    });
  });

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
    shelfGroups.forEach((sg, i) => {
      sg.position.y = -0.3 + Math.sin(t * 0.3 + i * 1.2) * 0.005;
    });
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    loadNotesFromIndexedDB();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

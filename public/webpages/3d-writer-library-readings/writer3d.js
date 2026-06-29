(function () {
  'use strict';

  const BOOKS = [
    {
      title: 'El Jardín de las Palabras',
      subtitle: 'Novela · 2025',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      readingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      excerpt: '—Las palabras no se llevan en el bolsillo —dijo el abuelo—. Se llevan en la lengua, y cuando las sueltas ya no vuelven.',
      transcript: '—Las palabras no se llevan en el bolsillo —dijo el abuelo—. Se llevan en la lengua, y cuando las sueltas ya no vuelven. El niño asintió sin entender del todo, pero guardó la frase en algún lugar profundo.',
      caption: 'Capítulo I: El legado',
      extras: [
        { label: '📖 Comprar', url: '#' },
        { label: '📄 Extracto PDF', url: '#' }
      ]
    },
    {
      title: 'Cenizas del Miércoles',
      subtitle: 'Poesía · 2024',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      readingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      excerpt: 'Todo lo que arde deja cenizas,\npero no todo lo que deja cenizas ardió.',
      transcript: 'Todo lo que arde deja cenizas, pero no todo lo que deja cenizas ardió. Algunas cosas se deshacen en frío, sin llama, sin aviso.',
      caption: 'Poema XII: Combustión',
      extras: [
        { label: '📖 Comprar', url: '#' },
        { label: '🎧 Audio completo', url: '#' }
      ]
    },
    {
      title: 'La Frontera Invisible',
      subtitle: 'Cuentos · 2023',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      readingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      excerpt: 'La frontera no era una línea en el mapa. Era el silencio entre dos personas que ya no tenían nada que decirse.',
      transcript: 'La frontera no era una línea en el mapa. Era el silencio entre dos personas que ya no tenían nada que decirse. Y sin embargo, seguían caminando juntos.',
      caption: 'Cuento III: El lindero',
      extras: [
        { label: '📖 Comprar', url: '#' },
        { label: '📄 Extracto PDF', url: '#' }
      ]
    }
  ];

  const SHELF_COLS = 3;
  const BOOK_W = 0.08, BOOK_H = 0.16, BOOK_D = 0.05;
  const SPACING_X = 0.18;
  const START_X = -((SHELF_COLS - 1) * SPACING_X) / 2;

  let scene, camera, renderer;
  let bookGroups = [];
  let animFrameId = null;
  let clock = new THREE.Clock();

  let analytics = { plays: {}, downloads: {} };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    readerPanel: document.getElementById('reader-panel'),
    readerClose: document.getElementById('reader-close'),
    readerVideo: document.getElementById('reader-video'),
    readerText: document.getElementById('reader-text'),
    readerSub: document.getElementById('reader-sub'),
    readerExtras: document.getElementById('reader-extras'),
    liveBtn: document.getElementById('liveread-btn'),
    livePanel: document.getElementById('live-panel'),
    liveClose: document.getElementById('live-close'),
    liveVideo: document.getElementById('live-video'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbBooks: document.getElementById('fb-books')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- IDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('Writer3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* noop */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('Writer3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* noop */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ece6);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 20);
    camera.position.set(0, 0.5, 2.5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffeedd, 0.4);
    key.position.set(2, 4, 3);
    scene.add(key);
    const warm = new THREE.DirectionalLight(0xffcc88, 0.15);
    warm.position.set(-1, 2, 1);
    scene.add(warm);

    buildLibrary();
  }

  function buildLibrary() {
    bookGroups.forEach(g => scene.remove(g));
    bookGroups = [];

    /* Shelf */
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.6, metalness: 0.05 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.12), shelfMat);
    shelf.position.y = -0.05;
    scene.add(shelf);

    /* Shelf back */
    const backMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.7 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.32, 0.005), backMat);
    back.position.set(0, 0.11, -0.06);
    scene.add(back);

    BOOKS.forEach((book, idx) => {
      const x = START_X + idx * SPACING_X;
      const g = new THREE.Group();
      g.position.set(x, 0.08, 0);

      /* Book spine */
      const spineColor = [0x8a3a2a, 0x2a4a5a, 0x5a3a4a][idx % 3];
      const spineMat = new THREE.MeshStandardMaterial({ color: spineColor, roughness: 0.5, metalness: 0.1 });
      const spine = new THREE.Mesh(new THREE.BoxGeometry(BOOK_W, BOOK_H, BOOK_D), spineMat);
      g.add(spine);

      /* Spine label */
      const c = document.createElement('canvas');
      c.width = 100; c.height = 120;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, 100, 120);
      ctx.save();
      ctx.translate(50, 60);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#f0ece6';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(book.title.length > 12 ? book.title.slice(0, 12) + '…' : book.title, 0, 3);
      ctx.restore();

      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(BOOK_H * 0.8, BOOK_W * 0.7), lMat);
      lMesh.rotation.y = Math.PI / 2;
      lMesh.position.z = 0.027;
      g.add(lMesh);

      g.userData = { idx: idx, origY: 0.08 };
      scene.add(g);
      bookGroups.push(g);
    });
  }

  /* ---------- Click to read ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    bookGroups.forEach((g) => g.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      for (let i = 0; i < bookGroups.length; i++) {
        for (let j = 0; j < bookGroups[i].children.length; j++) {
          if (hits[0].object === bookGroups[i].children[j]) { openReader(bookGroups[i].userData.idx); return; }
        }
      }
    }
  });

  function openReader(idx) {
    const book = BOOKS[idx];
    dom.readerVideo.src = book.readingUrl;
    dom.readerVideo.load();
    dom.readerVideo.play().catch(() => {});

    /* Highlight text with synced scroll */
    const words = book.transcript.split(' ');
    dom.readerText.innerHTML = words.map((w, i) => `<span class="word" data-idx="${i}">${w}</span>`).join(' ');
    dom.readerSub.textContent = book.caption;

    dom.readerExtras.innerHTML = book.extras.map(e =>
      `<button class="extra-btn" data-url="${e.url}">${e.label}</button>`
    ).join('');
    dom.readerExtras.querySelectorAll('.extra-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        analytics.downloads[idx] = (analytics.downloads[idx] || 0) + 1;
        saveAnalytics();
      });
    });

    dom.readerPanel.classList.remove('hidden');

    analytics.plays[idx] = (analytics.plays[idx] || 0) + 1;
    saveAnalytics();

    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 1.8, duration: 0.5 });
    } else {
      camera.position.z = 1.8;
    }

    /* Sync text highlight with video */
    dom.readerVideo.addEventListener('timeupdate', syncText);
  }

  function syncText() {
    if (!dom.readerVideo.duration) return;
    const pct = dom.readerVideo.currentTime / dom.readerVideo.duration;
    const words = dom.readerText.querySelectorAll('.word');
    const idx = Math.floor(pct * words.length);
    words.forEach((w, i) => {
      w.style.background = i <= idx ? 'rgba(90,58,42,0.15)' : 'transparent';
      w.style.borderRadius = '2px';
    });
    /* Auto-scroll */
    if (words[idx]) words[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  dom.readerClose.addEventListener('click', () => {
    dom.readerPanel.classList.add('hidden');
    dom.readerVideo.pause();
    dom.readerVideo.removeEventListener('timeupdate', syncText);
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { z: 2.5, duration: 0.4 });
    } else {
      camera.position.z = 2.5;
    }
  });

  /* ---------- Live reading ---------- */
  dom.liveBtn.addEventListener('click', () => {
    dom.livePanel.classList.toggle('hidden');
    if (!dom.livePanel.classList.contains('hidden')) {
      dom.liveVideo.src = BOOKS[0].readingUrl;
      dom.liveVideo.load();
      dom.liveVideo.play().catch(() => {});
    } else {
      dom.liveVideo.pause();
    }
  });
  dom.liveClose.addEventListener('click', () => {
    dom.livePanel.classList.add('hidden');
    dom.liveVideo.pause();
  });

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const totalPlays = Object.values(analytics.plays).reduce((a, b) => a + b, 0);
    const totalDownloads = Object.values(analytics.downloads).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML = `
      <div class="analytics-row"><span>▶ Lecturas</span><span>${totalPlays}</span></div>
      <div class="analytics-row"><span>📄 Descargas</span><span>${totalDownloads}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    dom.fallbackSection.classList.toggle('hidden');
    if (!dom.fallbackSection.classList.contains('hidden')) {
      dom.fbBooks.innerHTML = '';
      BOOKS.forEach((b) => {
        const card = document.createElement('div');
        card.className = 'fb-card';
        card.innerHTML = `<video controls preload="metadata" src="${b.readingUrl}"></video><div><h3>${b.title}</h3><p>${b.subtitle}</p><p style="font-style:italic;font-size:.48rem;color:var(--muted)">"${b.excerpt.slice(0, 60)}…"</p></div>`;
        dom.fbBooks.appendChild(card);
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
    bookGroups.forEach((g, i) => {
      if (!prefersReducedMotion) {
        g.position.y = g.userData.origY + Math.sin(t * 0.3 + i * 1.1) * 0.003;
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

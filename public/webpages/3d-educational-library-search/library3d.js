(function () {
  'use strict';

  const CLIPS = [
    { title: 'Introducción a Álgebra', duration: '8:30', lang: 'ES', transcript: 'En este video aprenderás los fundamentos del álgebra: variables, ecuaciones lineales y despejes. Comenzamos con definiciones básicas y ejemplos prácticos.', tags: ['matemáticas', 'álgebra', 'principiante'], difficulty: 'Fácil', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { title: 'Ecuaciones Diferenciales', duration: '12:15', lang: 'EN', transcript: 'Differential equations are fundamental to physics and engineering. This lecture covers first-order ODEs, separation of variables, and integrating factors.', tags: ['matemáticas', 'ecuaciones', 'avanzado'], difficulty: 'Difícil', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    { title: 'Historia del Arte Moderno', duration: '15:00', lang: 'ES', transcript: 'Recorrido por las corrientes del arte moderno: impresionismo, cubismo, surrealismo y expresionismo abstracto. Análisis de obras clave.', tags: ['arte', 'historia', 'intermedio'], difficulty: 'Intermedio', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { title: 'Programación en Python', duration: '10:45', lang: 'ES', transcript: 'Introducción a Python: variables, listas, condicionales y bucles. Ideal para quienes empiezan desde cero en programación.', tags: ['programación', 'python', 'principiante'], difficulty: 'Fácil', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { title: 'Machine Learning 101', duration: '14:20', lang: 'EN', transcript: 'Supervised and unsupervised learning, neural networks basics, training vs inference. Practical examples with real datasets.', tags: ['ML', 'IA', 'intermedio'], difficulty: 'Intermedio', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { title: 'Filosofía Antigua', duration: '11:00', lang: 'ES', transcript: 'Los presocráticos, Sócrates, Platón y Aristóteles. Las preguntas fundamentales sobre el ser, el conocimiento y la ética.', tags: ['filosofía', 'historia', 'principiante'], difficulty: 'Fácil', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' }
  ];

  const SHELF_POSITIONS = [
    { x: -1.5, z: -1, label: 'Matemáticas' },
    { x: 0, z: -1, label: 'Arte y Filosofía' },
    { x: 1.5, z: -1, label: 'Programación' },
    { x: -1.5, z: 1.2, label: 'Ciencia' },
    { x: 0, z: 1.2, label: 'Historia' },
    { x: 1.5, z: 1.2, label: 'Idiomas' }
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    clipPanel: document.getElementById('clip-panel'),
    clipClose: document.getElementById('clip-close'),
    clipTitle: document.getElementById('clip-title'),
    clipVideo: document.getElementById('clip-video'),
    clipMeta: document.getElementById('clip-meta'),
    transcriptBody: document.getElementById('transcript-body'),
    clipPlaylistBtn: document.getElementById('clip-playlist-btn'),
    clipReviewBtn: document.getElementById('clip-review-btn'),
    playlistPanel: document.getElementById('playlist-panel'),
    playlistBtn: document.getElementById('playlist-btn'),
    playlistItems: document.getElementById('playlist-items'),
    playlistClear: document.getElementById('playlist-clear'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let shelves = [];
  let bookMeshes = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let currentClipIdx = null;
  let playlist = [];
  let reviews = {};

  /* ── Three.js scene ── */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e0d4);

    const w = dom.sceneRoot.clientWidth;
    const h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 1.8, 3.5);
    camera.lookAt(0, 0.2, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xfff5ee, 0.6);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.8);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4ff, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd4c8b4, roughness: 0.8 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    scene.add(floor);

    createShelves();
  }

  function createShelves() {
    SHELF_POSITIONS.forEach((sp, sIdx) => {
      const g = new THREE.Group();
      g.position.set(sp.x, -0.3, sp.z);

      /* Shelf board */
      const boardMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.6 });
      for (let r = 0; r < 3; r++) {
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.18), boardMat);
        board.position.set(0, r * 0.2, 0);
        board.receiveShadow = true;
        g.add(board);
      }

      /* Side panels */
      const sideMat = new THREE.MeshStandardMaterial({ color: 0xd4c8b4, roughness: 0.7 });
      [-0.26, 0.26].forEach((x) => {
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 0.18), sideMat);
        side.position.set(x, 0.2, 0);
        g.add(side);
      });

      /* Label area */
      const labelMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.5 });
      const label = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.015, 0.02), labelMat);
      label.position.set(0, 0.43, 0.09);
      g.add(label);

      /* Place books (3 per shelf = 9 per bookcase) */
      for (let r = 0; r < 3; r++) {
        for (let b = 0; b < 3; b++) {
          const clipIdx = (sIdx * 3 + r) * 3 + b;
          if (clipIdx >= CLIPS.length * 3) continue;
          const clip = CLIPS[clipIdx % CLIPS.length];
          const colors = [0x8a7a6a, 0x6a7a8a, 0x7a6a8a, 0x8a8a5a, 0x5a8a7a, 0x8a5a6a];
          const bookMat = new THREE.MeshStandardMaterial({
            color: colors[(sIdx + r + b) % colors.length],
            roughness: 0.5
          });
          const book = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.12), bookMat);
          const xOff = (b - 1) * 0.08;
          book.position.set(xOff, r * 0.2 + 0.08, 0);
          book.castShadow = true;
          book.userData = { clipIdx: clipIdx % CLIPS.length, shelfIdx: sIdx };
          g.add(book);
          bookMeshes.push(book);
        }
      }

      g.userData = { shelfIdx: sIdx, label: sp.label };
      scene.add(g);
      shelves.push(g);
    });
  }

  /* ── Raycaster selection ── */
  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(bookMeshes);
    if (hits.length) {
      const clipIdx = hits[0].object.userData.clipIdx;
      if (clipIdx != null) selectClip(clipIdx, hits[0].object);
    }
  });

  /* ── Select clip ── */
  function selectClip(idx, bookMesh) {
    currentClipIdx = idx;
    const clip = CLIPS[idx];

    dom.clipTitle.textContent = clip.title;
    dom.clipVideo.src = clip.videoUrl;
    dom.clipVideo.load();
    dom.clipVideo.play().catch(() => {});
    dom.clipMeta.innerHTML = `
      <span>⏱ ${clip.duration}</span>
      <span>🌐 ${clip.lang}</span>
      <span>📊 ${clip.difficulty}</span>
      <span>🏷 ${clip.tags.join(', ')}</span>
    `;
    dom.transcriptBody.innerHTML = clip.transcript
      .split('. ')
      .map((s, i) => `<span data-ts="${i * 5}" style="cursor:pointer;display:inline" class="transcript-segment">${s}.</span> `)
      .join('');
    dom.clipPanel.classList.remove('hidden');

    /* Fly-to book */
    const pos = bookMesh.getWorldPosition(new THREE.Vector3());
    gsap.to(camera.position, {
      x: pos.x, y: 0.6, z: pos.z + 0.8,
      duration: 0.7, ease: 'power2.out'
    });

    /* Highlight shelf */
    shelves.forEach((s) => {
      const children = s.children;
      children.forEach((child) => {
        if (child.isMesh && child.material && child.material.color) {
          gsap.to(child.material.color, {
            r: 1, g: 1, b: 1,
            duration: 0.3
          });
        }
      });
    });
  }

  dom.clipClose.addEventListener('click', () => {
    dom.clipPanel.classList.add('hidden');
    dom.clipVideo.pause();
    gsap.to(camera.position, { x: 0, y: 1.8, z: 3.5, duration: 0.5, ease: 'power2.out' });
    /* Reset shelf colors */
    shelves.forEach((s) => {
      s.children.forEach((child) => {
        if (child.isMesh && child.material && child.material.color) {
          gsap.to(child.material.color, { r: child.material.color.r, g: child.material.color.g, b: child.material.color.b, duration: 0.2 });
        }
      });
    });
  });

  /* ── Transcript click to seek ── */
  dom.transcriptBody.addEventListener('click', (e) => {
    const seg = e.target.closest('.transcript-segment');
    if (seg) {
      const ts = parseFloat(seg.dataset.ts);
      if (!isNaN(ts) && dom.clipVideo.duration) {
        dom.clipVideo.currentTime = ts;
      }
    }
  });

  /* ── Search ── */
  function semanticSearch(query) {
    const q = query.toLowerCase();
    const results = CLIPS.map((clip, idx) => {
      const text = `${clip.title} ${clip.transcript} ${clip.tags.join(' ')}`.toLowerCase();
      let score = 0;
      const terms = q.split(/\s+/);
      terms.forEach((term) => {
        if (text.includes(term)) score += 1;
        if (clip.title.toLowerCase().includes(term)) score += 2;
        if (clip.tags.some((t) => t.toLowerCase().includes(term))) score += 1.5;
      });
      return { idx, score };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);

    /* Reset all books to normal */
    bookMeshes.forEach((b) => {
      b.material.emissive = new THREE.Color(0x000000);
    });

    if (results.length === 0) {
      dom.modalBody.innerHTML = `<p>No se encontraron resultados para "${query}".</p>`;
      dom.modal.classList.remove('hidden');
      return;
    }

    /* Illuminate matching books */
    const firstResult = results[0];
    bookMeshes.forEach((b) => {
      if (b.userData.clipIdx === firstResult.idx) {
        b.material.emissive = new THREE.Color(0x444444);
        b.material.emissiveIntensity = 0.3;
        /* Fly to */
        const pos = b.getWorldPosition(new THREE.Vector3());
        gsap.to(camera.position, {
          x: pos.x, y: 0.8, z: pos.z + 1,
          duration: 0.8, ease: 'power2.out'
        });
      }
    });

    /* Show results count */
    dom.modalBody.innerHTML = `<p>🔍 ${results.length} resultado(s) para "${query}"</p>
      <ul style="margin-top:.3rem;font-size:.72rem">${results.slice(0, 5).map((r) => `<li>${CLIPS[r.idx].title} (score: ${r.score.toFixed(1)})</li>`).join('')}</ul>`;
    dom.modal.classList.remove('hidden');
  }

  dom.searchBtn.addEventListener('click', () => {
    const q = dom.searchInput.value.trim();
    if (q) semanticSearch(q);
  });
  dom.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = dom.searchInput.value.trim();
      if (q) semanticSearch(q);
    }
  });

  /* ── Playlist ── */
  dom.clipPlaylistBtn.addEventListener('click', () => {
    if (currentClipIdx == null) return;
    const clip = CLIPS[currentClipIdx];
    if (!playlist.includes(currentClipIdx)) {
      playlist.push(currentClipIdx);
      renderPlaylist();
    }
  });

  function renderPlaylist() {
    dom.playlistItems.innerHTML = '';
    playlist.forEach((idx, i) => {
      const item = document.createElement('div');
      item.className = 'playlist-item';
      item.innerHTML = `
        <span>${CLIPS[idx].title}</span>
        <button class="remove" data-idx="${i}">×</button>
      `;
      item.querySelector('.remove').addEventListener('click', (e) => {
        e.stopPropagation();
        playlist.splice(i, 1);
        renderPlaylist();
      });
      dom.playlistItems.appendChild(item);
    });
  }

  dom.playlistBtn.addEventListener('click', () => {
    dom.playlistPanel.classList.toggle('hidden');
  });
  dom.playlistClear.addEventListener('click', () => {
    playlist = [];
    renderPlaylist();
  });

  /* ── Mark for review ── */
  dom.clipReviewBtn.addEventListener('click', () => {
    if (currentClipIdx == null) return;
    const ts = dom.clipVideo.currentTime;
    const note = prompt('Nota personal para este timestamp:');
    if (note) {
      if (!reviews[currentClipIdx]) reviews[currentClipIdx] = [];
      reviews[currentClipIdx].push({ ts, note, date: new Date().toISOString() });
      dom.modalBody.innerHTML = `<p>🔖 Marcado en ${ts.toFixed(1)}s: "${note}"</p>`;
      dom.modal.classList.remove('hidden');
    }
  });

  /* ── Modal ── */
  dom.modal.addEventListener('click', (e) => {
    if (e.target === dom.modal) {
      dom.modal.classList.add('hidden');
      dom.modalVideo?.pause();
    }
  });
  dom.modalClose.addEventListener('click', () => {
    dom.modal.classList.add('hidden');
    dom.modalVideo?.pause();
  });

  /* ── Fallback ── */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    CLIPS.forEach((clip) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `
        <video controls preload="metadata" src="${clip.videoUrl}" crossorigin="anonymous"></video>
        <div>
          <h3>${clip.title}</h3>
          <p>${clip.tags.join(' · ')} · ${clip.duration} · ${clip.difficulty}</p>
          <p style="font-size:.6rem;color:var(--muted);margin-top:.2rem">${clip.transcript.slice(0, 80)}...</p>
        </div>
      `;
      dom.fbGrid.appendChild(card);
    });
  });

  /* ── IntersectionObserver ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId) animFrameId = requestAnimationFrame(animate);
      else if (!entry.isIntersecting && animFrameId) {
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

  /* ── Animation ── */
  function animate() {
    const t = clock.elapsedTime;

    shelves.forEach((s, i) => {
      s.position.y = -0.3 + Math.sin(t * 0.3 + i * 1.1) * 0.005;
    });

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

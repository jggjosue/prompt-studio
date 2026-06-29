(function () {
  'use strict';

  const ROUTES = [
    { name: 'IA', color: 0x10B981, voiceover: 'Bienvenidos a la ruta de Inteligencia Artificial. Exploramos proyectos de NLP, visión artificial y MLOps.' },
    { name: 'Sostenibilidad', color: 0x0EA5E9, voiceover: 'Ruta de Sostenibilidad. Proyectos de energía solar, reciclaje inteligente y agua limpia.' },
    { name: 'Salud', color: 0xF59E0B, voiceover: 'Ruta de Salud. Telemedicina, wearables y genómica con deep learning.' }
  ];

  const PROJECTS = [
    { title: 'Chatbot NLP', route: 0, desc: 'Asistente conversacional con GPT-4 y fine-tuning por industria.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', tags: ['NLP', 'GPT-4', 'chatbot'], link: '#', ficha: 'Modelo: GPT-4 · Dataset: 10k conversaciones · Precisión: 94%' },
    { title: 'Visión Artificial', route: 0, desc: 'Detección de objetos en tiempo real con YOLOv8 y cámaras edge.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', tags: ['CV', 'YOLOv8', 'edge'], link: '#', ficha: 'Framework: YOLOv8 · Latencia: 15ms · Cobertura: 95%' },
    { title: 'ML Ops Pipeline', route: 0, desc: 'Pipeline automatizado de entrenamiento, validación y deploy.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', tags: ['MLOps', 'CI/CD', 'Kubernetes'], link: '#', ficha: 'Plataforma: Kubeflow · Tiempo deploy: 12min · Tests: 200+' },
    { title: 'Paneles Solares', route: 1, desc: 'Sistema de monitoreo solar con IA predictiva de rendimiento.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', tags: ['solar', 'energía', 'IA'], link: '#', ficha: 'Paneles: 500 · Eficiencia: 22% · Ahorro: 40%' },
    { title: 'Reciclaje Smart', route: 1, desc: 'Contenedores inteligentes con clasificación automatizada de residuos.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', tags: ['reciclaje', 'IoT', 'smart city'], link: '#', ficha: 'Sensores: 12 tipos · Precisión: 91% · Cobertura: 300 contenedores' },
    { title: 'Agua Limpia', route: 1, desc: 'Filtración descentralizada con sensores IoT y dashboard en tiempo real.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', tags: ['agua', 'IoT', 'filtración'], link: '#', ficha: 'Capacidad: 10k L/día · Sensores: 8 · Autonomía: 72h' },
    { title: 'Telemedicina', route: 2, desc: 'Plataforma de consultas remotas con diagnóstico asistido por IA.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', tags: ['salud', 'telemedicina', 'IA'], link: '#', ficha: 'Consultas: 5000/mes · Precisión: 92% · NPS: 85' },
    { title: 'Wearable Salud', route: 2, desc: 'Dispositivo wearable con monitoreo cardíaco y detección de caídas.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', tags: ['wearable', 'cardíaco', 'IoT'], link: '#', ficha: 'Batería: 7 días · Precisión ECG: 96% · Peso: 22g' },
    { title: 'Genómica IA', route: 2, desc: 'Análisis genómico con deep learning para medicina personalizada.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', tags: ['genómica', 'deep learning', 'medicina'], link: '#', ficha: 'Genomas: 50k · Modelo: Transformer · AUC: 0.94' }
  ];

  const GRID_POSITIONS = [
    { x: -1.8, z: -0.8 }, { x: 0, z: -0.8 }, { x: 1.8, z: -0.8 },
    { x: -1.8, z: 0.8 }, { x: 0, z: 0.8 }, { x: 1.8, z: 0.8 },
    { x: -1.8, z: 2.4 }, { x: 0, z: 2.4 }, { x: 1.8, z: 2.4 }
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    routeBtns: document.querySelectorAll('.route-btn'),
    projectPanel: document.getElementById('project-panel'),
    projectClose: document.getElementById('project-close'),
    projectTitle: document.getElementById('project-title'),
    projectVideo: document.getElementById('project-video'),
    projectDesc: document.getElementById('project-desc'),
    projectMeta: document.getElementById('project-meta'),
    projectLink: document.getElementById('project-link'),
    tourBtn: document.getElementById('tour-btn'),
    shareBtn: document.getElementById('share-btn'),
    curatorBtn: document.getElementById('curator-btn'),
    curatorPanel: document.getElementById('curator-panel'),
    curatorItems: document.getElementById('curator-items'),
    curatorExport: document.getElementById('curator-export'),
    curatorClose: document.getElementById('curator-close'),
    favBtn: document.getElementById('fav-btn'),
    exportPdfBtn: document.getElementById('export-pdf-btn'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    introOverlay: document.getElementById('intro-overlay'),
    startExploreBtn: document.getElementById('start-explore-btn'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer, particles;
  let plots = [];
  let screenMeshes = [];
  let currentRoute = 'all';
  let currentProject = null;
  let curatorList = [];
  let isTour = false;
  let tourIdx = 0;
  let tourTimer = 0;
  let animFrameId = null;
  let clock = new THREE.Clock();
  let analyticsData = { views: {}, routeStarts: {} };
  let textureVideos = [];
  
  let mouseX = 0, mouseY = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function saveData(key, val) {
    try {
      const req = indexedDB.open('InnovationGardenV2', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' });
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('data', 'readwrite');
        tx.objectStore('data').put({ k: key, v: val, updated: Date.now() });
      };
    } catch (e) {}
  }

  function loadData(key) {
    try {
      const req = indexedDB.open('InnovationGardenV2', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' });
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('data', 'readonly');
        const get = tx.objectStore('data').get(key);
        get.onsuccess = () => {
          if (get.result) {
            if (key === 'analytics') analyticsData = get.result.v;
            if (key === 'curator') curatorList = get.result.v;
          }
        };
      };
    } catch (e) {}
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 40);
    camera.position.set(0, 2.5, 4.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, 1);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);

    const gridHelper = new THREE.GridHelper(20, 20, 0x10B981, 0x10B981);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    gridHelper.position.y = -0.3;
    scene.add(gridHelper);

    createParticles();

    PROJECTS.forEach((proj, idx) => {
      const pos = GRID_POSITIONS[idx];
      const g = new THREE.Group();
      g.position.set(pos.x, -0.3, pos.z);

      const routeColor = ROUTES[proj.route].color;

      const plotMat = new THREE.MeshStandardMaterial({ 
        color: 0x0f172a, 
        metalness: 0.8, 
        roughness: 0.2,
        emissive: routeColor,
        emissiveIntensity: 0.1
      });
      const plot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.1, 16), plotMat);
      plot.position.y = 0.05;
      plot.receiveShadow = true;
      g.add(plot);

      const ringMat = new THREE.MeshBasicMaterial({ color: routeColor, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.35, 16), ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.11;
      g.add(ring);

      const pedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.6 });
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.15), pedMat);
      ped.position.y = 0.14;
      ped.castShadow = true;
      g.add(ped);

      const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x000000 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.11), screenMat);
      screen.position.set(0, 0.19, 0.005);
      screen.rotation.x = -0.1;
      screen.userData = { projIdx: idx };
      g.add(screen);
      screenMeshes.push(screen);

      const vegMat = new THREE.MeshPhysicalMaterial({ 
          color: routeColor, 
          transparent: true, 
          opacity: 0.8, 
          wireframe: true,
          emissive: routeColor,
          emissiveIntensity: 0.2
      });
      
      const geo1 = new THREE.IcosahedronGeometry(0.06, 0);
      const geo2 = new THREE.OctahedronGeometry(0.04, 0);

      const tree1 = new THREE.Mesh(geo1, vegMat);
      tree1.position.set(-0.15, 0.15, -0.1);
      g.add(tree1);

      const tree2 = new THREE.Mesh(geo2, vegMat);
      tree2.position.set(0.15, 0.12, 0.1);
      g.add(tree2);

      const labelMat = new THREE.MeshBasicMaterial({ color: routeColor, transparent: true, opacity: 0 });
      const label = new THREE.Mesh(new THREE.CircleGeometry(0.4), labelMat);
      label.rotation.x = -Math.PI / 2;
      label.position.y = 0.01;
      g.add(label);

      const pLight = new THREE.PointLight(routeColor, 0.5, 2);
      pLight.position.set(0, 0.5, 0);
      g.add(pLight);

      g.userData = { idx, proj, label, nodes: [tree1, tree2] };
      scene.add(g);
      plots.push(g);
    });

    // Removed mouse parallax to favor scroll parallax
  }

  function createParticles() {
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colorsArr = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;     
        positions[i + 1] = Math.random() * 5 - 0.5; 
        positions[i + 2] = (Math.random() - 0.5) * 20; 

        const c = Math.random();
        let color = new THREE.Color(0x10B981);
        if(c > 0.6) color.setHex(0x0EA5E9);
        else if (c > 0.3) color.setHex(0xF59E0B);
        
        colorsArr[i] = color.r;
        colorsArr[i + 1] = color.g;
        colorsArr[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function projectVideoOnScreen(idx) {
    const screen = screenMeshes[idx];
    if (!screen) return;
    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.src = PROJECTS[idx].videoUrl;
    vid.loop = true;
    vid.muted = true;
    vid.preload = 'auto';
    vid.load();
    vid.play().catch(() => {});
    const tex = new THREE.VideoTexture(vid);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    screen.material = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xcccccc, emissiveIntensity: 0.5 });
    textureVideos.push(vid);
  }

  function stopAllTextureProjections() {
    textureVideos.forEach(v => { v.pause(); v.src = ''; });
    textureVideos = [];
  }

  function filterRoute(routeIdx) {
    currentRoute = routeIdx;
    const visible = routeIdx === 'all' ? PROJECTS : PROJECTS.filter((p) => p.route === parseInt(routeIdx));
    const visibleIdxs = visible.map((_, i) => PROJECTS.indexOf(visible[i]));

    if (routeIdx !== 'all') {
      const r = parseInt(routeIdx);
      analyticsData.routeStarts[r] = (analyticsData.routeStarts[r] || 0) + 1;
      saveData('analytics', analyticsData);
    }

    plots.forEach((p, i) => {
      const shouldShow = visibleIdxs.includes(i);
      if (shouldShow) {
        if (!prefersReducedMotion) gsap.to(p.position, { y: -0.3, duration: 0.5, ease: 'back.out(1.5)' });
        else p.position.y = -0.3;
        p.visible = true;
      } else {
        if (!prefersReducedMotion) {
          gsap.to(p.position, { y: -2, duration: 0.4, ease: 'power2.in' }).then(() => { p.visible = false; p.position.y = -0.3; });
        } else {
          p.visible = false;
        }
      }
    });
  }

  dom.routeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.routeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      filterRoute(btn.dataset.route);
    });
  });

  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    plots.forEach((p) => p.children.forEach((c) => { if (c.isMesh) meshes.push(c); }));
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      let found = -1;
      for (let i = 0; i < plots.length; i++) {
        for (let j = 0; j < plots[i].children.length; j++) {
          if (hits[0].object === plots[i].children[j]) { found = i; break; }
        }
        if (found >= 0) break;
      }
      if (found >= 0) selectProject(found);
    }
  });

  function selectProject(idx) {
    if (dom.introOverlay) dom.introOverlay.classList.add('hidden');
    currentProject = idx;
    const proj = PROJECTS[idx];
    dom.projectTitle.textContent = proj.title;
    dom.projectVideo.src = proj.videoUrl;
    dom.projectVideo.load();
    dom.projectVideo.play().catch(() => {});
    dom.projectDesc.textContent = proj.desc;
    dom.projectMeta.innerHTML = proj.tags.map((t) => `<span>${t}</span>`).join('') + `<span>${proj.ficha}</span>`;
    dom.projectPanel.classList.remove('hidden');

    analyticsData.views[idx] = (analyticsData.views[idx] || 0) + 1;
    saveData('analytics', analyticsData);

    projectVideoOnScreen(idx);

    const p = plots[idx];
    if (!prefersReducedMotion) {
      gsap.to(camera.position, { 
        x: p.position.x, 
        y: 0.8, 
        z: p.position.z + 1.5, 
        duration: 0.8, 
        ease: 'power3.inOut',
        onUpdate: () => camera.lookAt(p.position.x, 0, p.position.z) 
      });
    } else {
      camera.position.set(p.position.x, 0.8, p.position.z + 1.5);
      camera.lookAt(p.position.x, 0, p.position.z);
    }
    plots.forEach((pl, i) => {
      if (pl.userData.label) gsap.to(pl.userData.label.material, { opacity: i === idx ? 0.2 : 0, duration: 0.3 });
    });
  }

  dom.projectClose.addEventListener('click', closeProject);
  function closeProject() {
    dom.projectPanel.classList.add('hidden');
    dom.projectVideo.pause();
    stopAllTextureProjections();
    screenMeshes.forEach(s => {
      s.material = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x000000 });
    });
    
    currentProject = null;

    if (!prefersReducedMotion) {
      gsap.to(camera.position, { 
        x: mouseX * 1.5, 
        y: 2.5 + mouseY * 0.8, 
        z: 4.5, 
        duration: 0.8,
        ease: 'power3.inOut',
        onUpdate: () => camera.lookAt(0, 0, 0)
      });
    } else {
      camera.position.set(0, 2.5, 4.5);
      camera.lookAt(0, 0, 0);
    }
    plots.forEach((p) => { if (p.userData.label) p.userData.label.material.opacity = 0; });
  }

  dom.favBtn.addEventListener('click', () => {
    if (currentProject == null) return;
    if (!curatorList.includes(currentProject)) {
      curatorList.push(currentProject);
      saveData('curator', curatorList);
      dom.modalBody.innerHTML = `<p>⭐ Proyecto añadido a la playlist.</p>`;
      dom.modal.classList.remove('hidden');
    }
  });

  dom.curatorBtn.addEventListener('click', () => {
    dom.curatorPanel.classList.toggle('hidden');
    renderCurator();
  });
  dom.curatorClose.addEventListener('click', () => dom.curatorPanel.classList.add('hidden'));

  function renderCurator() {
    dom.curatorItems.innerHTML = '';
    curatorList.forEach((idx, i) => {
      const item = document.createElement('div');
      item.className = 'curator-item';
      item.textContent = `${i + 1}. ${PROJECTS[idx].title}`;
      item.addEventListener('click', () => selectProject(idx));
      dom.curatorItems.appendChild(item);
    });
  }

  dom.curatorExport.addEventListener('click', exportPDF);
  dom.exportPdfBtn.addEventListener('click', () => {
    if (currentProject == null) return;
    exportSinglePDF(currentProject);
  });

  function exportPDF() {
    const lines = ['Playlist - Jardín de Innovación', '================================', ''];
    curatorList.forEach((idx) => {
      const p = PROJECTS[idx];
      lines.push(`● ${p.title}`);
      lines.push(`  ${p.desc}`);
      lines.push(`  Tags: ${p.tags.join(', ')}`);
      lines.push(`  Ficha: ${p.ficha}`);
      lines.push('');
    });
    downloadPDF(lines.join('\n'), 'playlist-innovacion.pdf');
  }

  function exportSinglePDF(idx) {
    const p = PROJECTS[idx];
    const lines = [
      `Ficha de Proyecto - ${p.title}`,
      '================================',
      '',
      `Descripción: ${p.desc}`,
      `Ruta: ${ROUTES[p.route].name}`,
      `Tags: ${p.tags.join(', ')}`,
      `Ficha técnica: ${p.ficha}`,
      `Recurso: ${p.link}`
    ];
    downloadPDF(lines.join('\n'), `proyecto-${p.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  }

  function downloadPDF(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  dom.tourBtn.addEventListener('click', () => {
    isTour = !isTour;
    dom.tourBtn.textContent = isTour ? '⏹ Detener' : '🎬 Tour';
    tourIdx = 0;
    tourTimer = 0;
    if (isTour && 'speechSynthesis' in window) {
      const routeIdx = currentRoute === 'all' ? 0 : parseInt(currentRoute);
      const msg = new SpeechSynthesisUtterance(ROUTES[routeIdx].voiceover);
      msg.lang = 'es-ES';
      msg.rate = 0.9;
      speechSynthesis.speak(msg);
    }
  });

  function updateTour() {
    if (!isTour || plots.length === 0) return;
    const visible = currentRoute === 'all' ? PROJECTS : PROJECTS.filter((p) => p.route === parseInt(currentRoute));
    if (tourIdx >= visible.length) { tourIdx = 0; }
    if (visible.length === 0) return;
    const globalIdx = PROJECTS.indexOf(visible[tourIdx]);
    const p = plots[globalIdx];
    if (p) {
      selectProject(globalIdx);
    }
    tourIdx = (tourIdx + 1) % Math.max(visible.length, 1);
  }

  dom.shareBtn.addEventListener('click', () => {
    if (currentProject == null) return;
    const url = `${window.location.origin}${window.location.pathname}?proj=${currentProject}`;
    if (navigator.share) {
      navigator.share({ title: 'Waypoint - Jardín de Innovación', url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        dom.modalBody.innerHTML = `<p>🔗 Waypoint copiado al portapapeles.</p><p style="font-size:.55rem;color:var(--muted);word-break:break-all">${url}</p>`;
        dom.modal.classList.remove('hidden');
      });
    }
  });

  function checkWaypoint() {
    const params = new URLSearchParams(window.location.search);
    const projIdx = params.get('proj');
    if (projIdx !== null && parseInt(projIdx) >= 0 && parseInt(projIdx) < PROJECTS.length) {
      setTimeout(() => selectProject(parseInt(projIdx)), 500);
    }
  }

  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    renderAnalytics();
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  function renderAnalytics() {
    let html = '<div class="analytics-row"><span>Proyecto</span><span>Visitas</span></div>';
    PROJECTS.forEach((p, i) => {
      html += `<div class="analytics-row"><span>${p.title}</span><span>${analyticsData.views[i] || 0}</span></div>`;
    });
    html += '<div class="analytics-row" style="margin-top:.5rem;font-weight:600;color:var(--green);"><span>Ruta</span><span>Inicios</span></div>';
    ROUTES.forEach((r, i) => {
      html += `<div class="analytics-row"><span>${r.name}</span><span>${analyticsData.routeStarts[i] || 0}</span></div>`;
    });
    dom.analyticsBody.innerHTML = html;
  }

  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    PROJECTS.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${p.videoUrl}"></video><div><h3>${p.title}</h3><p>${p.desc}</p><p style="font-size:.7rem;color:var(--accent);margin-top:.3rem">${ROUTES[p.route].name} · ${p.tags.join(', ')}</p></div>`;
      card.addEventListener('click', () => {
        dom.fallbackSection.classList.add('hidden');
        selectProject(i);
      });
      dom.fbGrid.appendChild(card);
    });
  });

  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
  dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

  if (dom.startExploreBtn) {
    dom.startExploreBtn.addEventListener('click', () => {
      dom.introOverlay.classList.add('hidden');
    });
  }

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
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    
    if (!prefersReducedMotion) {
      plots.forEach((p, i) => {
        p.position.y = -0.3 + Math.sin(t * 0.8 + i * 1.2) * 0.015;
        
        if (p.userData.nodes) {
          p.userData.nodes[0].rotation.y = t * 0.5 + i;
          p.userData.nodes[1].rotation.x = t * 0.3 + i;
          p.userData.nodes[1].rotation.z = t * 0.4 + i;
        }
      });
      
      if (particles) {
        particles.rotation.y = t * 0.02;
        particles.position.y = Math.sin(t * 0.5) * 0.2;
      }
    }

    tourTimer += dt;
    if (isTour && tourTimer > 4) { updateTour(); tourTimer = 0; }
    
    // Look at center if no project selected
    if(currentProject === null && !isTour) {
       camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function initScrollParallax() {
    if(typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    
    ScrollTrigger.defaults({
      scroller: "#scroll-container"
    });

    // Camera movement timeline mapped to scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5
      }
    });

    tl.to(camera.position, {
      z: -2.5,
      x: 1.5,
      y: 1.2,
      ease: "power1.inOut"
    }, 0);
    
    // Staggered entry for HTML cards
    gsap.utils.toArray('.section-card').forEach((card, i) => {
      if (i === 0) return; // Skip intro card
      gsap.from(card, {
        scrollTrigger: {
          trigger: card.parentElement,
          start: "top 85%",
          end: "top 50%",
          scrub: 1
        },
        y: 120,
        opacity: 0,
        rotationX: 5,
        transformOrigin: "bottom center"
      });
    });
  }

  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
    loadData('analytics');
    loadData('curator');
    checkWaypoint();
    
    // Initialize Parallax
    setTimeout(initScrollParallax, 500);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

(function () {
  'use strict';

  const ROUTES = [
    { name: 'IA', color: 0x6a8a5a },
    { name: 'Sostenibilidad', color: 0x5a8a7a },
    { name: 'Salud', color: 0x8a5a6a }
  ];

  const PROJECTS = [
    { title: 'Chatbot NLP', route: 0, desc: 'Asistente conversacional con GPT-4 y fine-tuning por industria.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', tags: ['NLP', 'GPT-4', 'chatbot'], link: '#' },
    { title: 'Visión Artificial', route: 0, desc: 'Detección de objetos en tiempo real con YOLOv8 y cámaras edge.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', tags: ['CV', 'YOLOv8', 'edge'], link: '#' },
    { title: 'ML Ops Pipeline', route: 0, desc: 'Pipeline automatizado de entrenamiento, validación y deploy.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', tags: ['MLOps', 'CI/CD', 'Kubernetes'], link: '#' },
    { title: 'Paneles Solares', route: 1, desc: 'Sistema de monitoreo solar con IA predictiva de rendimiento.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', tags: ['solar', 'energía', 'IA'], link: '#' },
    { title: 'Reciclaje Smart', route: 1, desc: 'Contenedores inteligentes con clasificación automatizada de residuos.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', tags: ['reciclaje', 'IoT', 'smart city'], link: '#' },
    { title: 'Agua Limpia', route: 1, desc: 'Filtración descentralizada con sensores IoT y dashboard en tiempo real.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', tags: ['agua', 'IoT', 'filtración'], link: '#' },
    { title: 'Telemedicina', route: 2, desc: 'Plataforma de consultas remotas con diagnóstico asistido por IA.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', tags: ['salud', 'telemedicina', 'IA'], link: '#' },
    { title: 'Wearable Salud', route: 2, desc: 'Dispositivo wearable con monitoreo cardíaco y detección de caídas.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', tags: ['wearable', 'cardíaco', 'IoT'], link: '#' },
    { title: 'Genómica', route: 2, desc: 'Análisis genómico con deep learning para medicina personalizada.', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', tags: ['genómica', 'deep learning', 'medicina'], link: '#' }
  ];

  const GRID_POSITIONS = [
    { x: -1.6, z: -0.8 }, { x: 0, z: -0.8 }, { x: 1.6, z: -0.8 },
    { x: -1.6, z: 0.8 }, { x: 0, z: 0.8 }, { x: 1.6, z: 0.8 },
    { x: -1.6, z: 2.4 }, { x: 0, z: 2.4 }, { x: 1.6, z: 2.4 }
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
    curatorBtn: document.getElementById('curator-btn'),
    curatorPanel: document.getElementById('curator-panel'),
    curatorItems: document.getElementById('curator-items'),
    curatorExport: document.getElementById('curator-export'),
    curatorClose: document.getElementById('curator-close'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let plots = [];
  let currentRoute = 'all';
  let currentProject = null;
  let curatorList = [];
  let isTour = false;
  let tourIdx = 0;
  let animFrameId = null;
  let clock = new THREE.Clock();

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8ece4);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 2.5, 3.8);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.8);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8f0e8, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    const groundMat = new THREE.MeshStandardMaterial({ color: 0xd8dcd0, roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    PROJECTS.forEach((proj, idx) => {
      const pos = GRID_POSITIONS[idx];
      const g = new THREE.Group();
      g.position.set(pos.x, -0.3, pos.z);

      const plotMat = new THREE.MeshStandardMaterial({ color: 0x5a7a4a, roughness: 0.8, transparent: true, opacity: 0.2 });
      const plot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.01, 0.5), plotMat);
      plot.position.y = 0.005;
      g.add(plot);

      const pedMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.5 });
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.15), pedMat);
      ped.position.y = 0.04;
      ped.castShadow = true;
      g.add(ped);

      const screenMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x111111, emissiveIntensity: 0.05 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.08), screenMat);
      screen.position.y = 0.08;
      g.add(screen);

      const vegMat = new THREE.MeshStandardMaterial({ color: 0x4a6a3a });
      for (let v = 0; v < 3; v++) {
        const veg = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 4), vegMat);
        veg.position.set((v - 1) * 0.08, -0.26, 0.1);
        g.add(veg);
      }

      const routeColor = new THREE.Color(ROUTES[proj.route].color);
      const labelMat = new THREE.MeshBasicMaterial({ color: routeColor, transparent: true, opacity: 0 });
      const label = new THREE.Mesh(new THREE.CircleGeometry(0.03), labelMat);
      label.position.y = 0.1;
      g.add(label);

      g.userData = { idx, proj, label };
      scene.add(g);
      plots.push(g);
    });
  }

  function filterRoute(routeIdx) {
    currentRoute = routeIdx;
    const visible = routeIdx === 'all' ? PROJECTS : PROJECTS.filter((p) => p.route === parseInt(routeIdx));
    const visibleIdxs = visible.map((_, i) => PROJECTS.indexOf(visible[i]));
    plots.forEach((p, i) => {
      const shouldShow = visibleIdxs.includes(i);
      if (shouldShow) {
        gsap.to(p.position, { y: -0.3, duration: 0.4 });
        p.visible = true;
      } else {
        gsap.to(p.position, { y: -1.5, duration: 0.3 }).then(() => { p.visible = false; p.position.y = -0.3; });
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
        if (plots[i].children.includes(hits[0].object) || hits[0].object.parent === plots[i]) { found = i; break; }
      }
      if (found >= 0) selectProject(found);
    }
  });

  function selectProject(idx) {
    currentProject = idx;
    const proj = PROJECTS[idx];
    dom.projectTitle.textContent = proj.title;
    dom.projectVideo.src = proj.videoUrl;
    dom.projectVideo.load();
    dom.projectVideo.play().catch(() => {});
    dom.projectDesc.textContent = proj.desc;
    dom.projectMeta.innerHTML = proj.tags.map((t) => `<span>${t}</span>`).join('');
    dom.projectLink.href = proj.link;
    dom.projectLink.style.display = 'inline';
    dom.projectPanel.classList.remove('hidden');

    const p = plots[idx];
    gsap.to(camera.position, { x: p.position.x, y: 0.5, z: p.position.z + 1.2, duration: 0.6 });
    plots.forEach((pl, i) => {
      if (pl.userData.label) gsap.to(pl.userData.label.material, { opacity: i === idx ? 0.4 : 0, duration: 0.3 });
    });
  }

  dom.projectClose.addEventListener('click', () => {
    dom.projectPanel.classList.add('hidden');
    dom.projectVideo.pause();
    gsap.to(camera.position, { x: 0, y: 2.5, z: 3.8, duration: 0.5 });
    plots.forEach((p) => { if (p.userData.label) p.userData.label.material.opacity = 0; });
  });

  dom.tourBtn.addEventListener('click', () => {
    isTour = !isTour;
    dom.tourBtn.textContent = isTour ? '⏹ Detener' : '🎬 Tour';
    tourIdx = 0;
  });

  function updateTour() {
    if (!isTour || plots.length === 0) return;
    const p = plots[tourIdx];
    if (p) {
      gsap.to(camera.position, { x: p.position.x, y: 0.5, z: p.position.z + 1.2, duration: 1.2, ease: 'power2.out' });
    }
    tourIdx = (tourIdx + 1) % PROJECTS.length;
  }

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
      dom.curatorItems.appendChild(item);
    });
  }

  dom.curatorExport.addEventListener('click', () => {
    let text = 'Playlist - Jardín de Innovación\n\n';
    curatorList.forEach((idx) => {
      const p = PROJECTS[idx];
      text += `- ${p.title}: ${p.desc} (${p.tags.join(', ')})\n`;
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'playlist-innovacion.txt';
    a.click();
  });

  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
  dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = '';
    PROJECTS.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `<video controls preload="metadata" src="${p.videoUrl}"></video><div><h3>${p.title}</h3><p>${p.desc}</p></div>`;
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

  let tourTimer = 0;
  function animate() {
    const t = clock.elapsedTime;
    plots.forEach((p, i) => {
      p.position.y = -0.3 + Math.sin(t * 0.3 + i * 0.8) * 0.008;
      p.rotation.y = Math.sin(t * 0.15 + i * 0.5) * 0.02;
    });
    tourTimer += clock.getDelta();
    if (isTour && tourTimer > 2) { updateTour(); tourTimer = 0; }
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

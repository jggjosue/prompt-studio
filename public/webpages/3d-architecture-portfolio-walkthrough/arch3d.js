import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const projects = [
  {
    id: 'residencial', title: 'Residencial Altamira',
    pos: [-2.8, 0.9, -0.5], dims: [2.2, 1.6, 2.0], color: 0x2d4a5c,
    cam: [-5.6, 2.8, 5.2], look: [-2.8, 0.9, -0.5],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    desc: 'Conjunto residencial con 12 viviendas, áreas verdes y sustentabilidad.',
    metrics: 'Visitas: 2.4k | Descargas: 180 | Reproducciones: 890',
    before: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&q=60',
    after: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=640&q=80'
  },
  {
    id: 'oficinas', title: 'Oficinas Corporativas',
    pos: [0, 1.1, -3.4], dims: [2.6, 2.0, 2.4], color: 0x3a5068,
    cam: [0.5, 3.0, 5.8], look: [0, 1.0, -3.4],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    desc: 'Torre corporativa de 14 niveles con eficiencia energética y diseño bioclimático.',
    metrics: 'Visitas: 3.1k | Descargas: 240 | Reproducciones: 1.2k',
    before: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=640&q=60',
    after: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=640&q=80'
  },
  {
    id: 'cultural', title: 'Centro Cultural',
    pos: [2.6, 1.2, -0.8], dims: [2.4, 2.2, 2.6], color: 0x4a3d5c,
    cam: [5.2, 3.2, 5.0], look: [2.5, 1.1, -0.8],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    desc: 'Centro cultural con auditorio, galerías y talleres. Capacidad para 800 personas.',
    metrics: 'Visitas: 1.8k | Descargas: 95 | Reproducciones: 650',
    before: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=640&q=60',
    after: 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=640&q=80'
  }
];

const projectCopy = document.getElementById('project-copy');
const metricsEl = document.getElementById('metrics');
const hotButtons = document.querySelectorAll('.hot-btn');
const startTourBtn = document.getElementById('start-tour');
const modeBtn = document.getElementById('mode-toggle');
const beforeAfterBtn = document.getElementById('before-after-toggle');
const fallbackBtn = document.getElementById('fallback-toggle');
const fallback = document.getElementById('fallback');
const dialog = document.getElementById('dialog');
const closeDialog = document.getElementById('close-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogVideo = document.getElementById('dialog-video');
const dialogDesc = document.getElementById('dialog-desc');
const baOverlay = document.getElementById('ba-overlay');
const closeBa = document.getElementById('close-ba');
const baBefore = document.getElementById('ba-before-img');
const baAfter = document.getElementById('ba-after-img');
const baHandle = document.getElementById('ba-handle');

let freeMode = false;
let tourActive = false;
let tourIndex = 0;
let tourTimer = null;
let baActive = false;
let baDragging = false;

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080c14);
scene.fog = new THREE.Fog(0x080c14, 8, 30);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(1, 3.2, 9.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneRoot.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.25, 0.3, 0.1);
composer.addPass(bloomPass);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 18;
controls.minDistance = 3;
controls.target.set(0, 1.2, -1.6);
controls.enabled = false;

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const key = new THREE.DirectionalLight(0xf0dcc5, 1.4);
key.position.set(5, 10, 7);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const fill = new THREE.DirectionalLight(0x8899bb, 0.5);
fill.position.set(-4, 3, -2);
scene.add(fill);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x111a24, roughness: 0.9, metalness: 0.1 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.3;
floor.receiveShadow = true;
scene.add(floor);

const gridHelper = new THREE.GridHelper(20, 30, 0x2a3a52, 0x1a2a40);
gridHelper.position.y = -0.28;
scene.add(gridHelper);

const buildingGroup = new THREE.Group();
const buildingMeshes = [];
const hotspotMeshes = [];

projects.forEach((proj) => {
  const mat = new THREE.MeshStandardMaterial({
    color: proj.color, roughness: 0.35, metalness: 0.45
  });
  const geo = new THREE.BoxGeometry(proj.dims[0], proj.dims[1], proj.dims[2]);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(proj.pos[0], proj.pos[1], proj.pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { projectId: proj.id };
  buildingGroup.add(mesh);
  buildingMeshes.push(mesh);

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.6 });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(proj.dims[0] * 0.95, 0.08, proj.dims[2] * 0.95), roofMat);
  roof.position.set(proj.pos[0], proj.pos[1] + proj.dims[1] / 2, proj.pos[2]);
  buildingGroup.add(roof);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x7db4ff, emissive: 0x2e6ab0, emissiveIntensity: 0.4, transparent: true, opacity: 0.7 })
  );
  sphere.position.set(proj.pos[0], proj.pos[1] + proj.dims[1] / 2 + 0.45, proj.pos[2]);
  sphere.userData = { projectId: proj.id };
  scene.add(sphere);
  hotspotMeshes.push(sphere);
});

const glowRingMat = new THREE.MeshBasicMaterial({ color: 0x7db4ff, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
projects.forEach((proj) => {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.45, 32), glowRingMat.clone());
  ring.position.set(proj.pos[0], -0.2, proj.pos[2]);
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);
});

scene.add(buildingGroup);

const particlesGeo = new THREE.BufferGeometry();
const count = 180;
const pos = new Float32Array(count * 3);
for (let i = 0; i < count; i += 1) {
  pos[i * 3] = (Math.random() - 0.5) * 10;
  pos[i * 3 + 1] = Math.random() * 3.5;
  pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ color: 0xdcc7a3, size: 0.035, transparent: true, opacity: 0.5 })
);
scene.add(particles);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function findProject(id) {
  return projects.find((p) => p.id === id);
}

function updateNarrative(proj) {
  projectCopy.textContent = `${proj.title} — ${proj.desc}`;
  metricsEl.textContent = proj.metrics;
}

function moveCameraTo(proj) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    camera.position.set(...proj.cam);
    controls.target.set(...proj.look);
    return;
  }
  gsap.to(camera.position, {
    x: proj.cam[0], y: proj.cam[1], z: proj.cam[2],
    duration: 1.6, ease: 'power2.inOut'
  });
  gsap.to(controls.target, {
    x: proj.look[0], y: proj.look[1], z: proj.look[2],
    duration: 1.6, ease: 'power2.inOut'
  });
}

function openDialog(proj) {
  dialogTitle.textContent = proj.title;
  dialogDesc.textContent = proj.desc;
  dialogVideo.src = proj.video;
  dialogVideo.load();
  dialog.classList.remove('hidden');
}

function activateProject(id) {
  const proj = findProject(id);
  if (!proj) return;
  moveCameraTo(proj);
  updateNarrative(proj);
  openDialog(proj);
}

renderer.domElement.addEventListener('click', (event) => {
  if (baActive) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(hotspotMeshes);
  if (!hit.length) return;
  activateProject(hit[0].object.userData.projectId);
});

hotButtons.forEach((btn) => {
  btn.addEventListener('click', () => activateProject(btn.dataset.project));
});

window.addEventListener('keydown', (event) => {
  if (event.key === '1') activateProject('residencial');
  if (event.key === '2') activateProject('oficinas');
  if (event.key === '3') activateProject('cultural');
  if (event.key === 'f' || event.key === 'F') toggleFreeMode();
  if (event.key === ' ') { event.preventDefault(); startTourBtn.click(); }
});

closeDialog.addEventListener('click', () => {
  dialog.classList.add('hidden');
  dialogVideo.pause();
  dialogVideo.src = '';
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    dialog.classList.add('hidden');
    dialogVideo.pause();
    dialogVideo.src = '';
  }
});

function toggleFreeMode() {
  freeMode = !freeMode;
  controls.enabled = freeMode;
  modeBtn.textContent = freeMode ? 'Modo guiado' : 'Modo libre';
  if (freeMode) {
    clearInterval(tourTimer);
    tourActive = false;
    startTourBtn.textContent = 'Iniciar tour';
  }
}

modeBtn.addEventListener('click', toggleFreeMode);

startTourBtn.addEventListener('click', () => {
  if (freeMode) return;
  clearInterval(tourTimer);
  tourActive = !tourActive;
  startTourBtn.textContent = tourActive ? 'Detener tour' : 'Iniciar tour';
  if (!tourActive) return;
  tourIndex = 0;
  activateProject(projects[0].id);
  tourTimer = setInterval(() => {
    tourIndex = (tourIndex + 1) % projects.length;
    activateProject(projects[tourIndex].id);
  }, 6000);
});

function initBeforeAfter(proj) {
  baBefore.src = proj.before;
  baAfter.src = proj.after;
  baHandle.style.left = '50%';
  document.querySelector('.ba-before').style.clipPath = 'inset(0 50% 0 0)';
}

beforeAfterBtn.addEventListener('click', () => {
  baActive = !baActive;
  baOverlay.classList.toggle('hidden');
  if (baActive) {
    initBeforeAfter(projects[0]);
  }
});

const baContainer = document.querySelector('.ba-container');

function updateBa(clientX) {
  const rect = baContainer.getBoundingClientRect();
  let pct = ((clientX - rect.left) / rect.width) * 100;
  pct = Math.max(0, Math.min(100, pct));
  baHandle.style.left = `${pct}%`;
  document.querySelector('.ba-before').style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  baHandle.setAttribute('aria-valuenow', Math.round(pct));
}

baHandle.addEventListener('mousedown', (e) => { baDragging = true; e.preventDefault(); });
document.addEventListener('mousemove', (e) => { if (baDragging) updateBa(e.clientX); });
document.addEventListener('mouseup', () => { baDragging = false; });

baHandle.addEventListener('touchstart', (e) => { baDragging = true; e.preventDefault(); });
document.addEventListener('touchmove', (e) => {
  if (baDragging && e.touches.length) updateBa(e.touches[0].clientX);
});
document.addEventListener('touchend', () => { baDragging = false; });

closeBa.addEventListener('click', () => {
  baActive = false;
  baOverlay.classList.add('hidden');
});

function renderFallback() {
  fallback.innerHTML = '<h2>Proyectos — Versión 2D</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  projects.forEach((proj) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `
      <h3>${proj.title}</h3>
      <video controls preload="metadata" src="${proj.video}" crossorigin="anonymous">
        <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
      </video>
      <p>${proj.desc}</p>
      <p class="metrics">${proj.metrics}</p>
      <div class="dl-links">
        <a class="download" href="assets/planos-${proj.id}.pdf" download>📐 Planos PDF</a>
        <a class="download" href="assets/ficha-${proj.id}.pdf" download>📋 Ficha técnica</a>
      </div>
    `;
    grid.appendChild(card);
  });
  fallback.appendChild(grid);
}

fallbackBtn.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
  fallbackBtn.textContent = hidden ? 'Ocultar fallback' : 'Fallback 2D';
});

renderFallback();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    composer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
  });
}, { threshold: 0.05 });
observer.observe(sceneRoot);

function animate() {
  const t = performance.now() * 0.001;
  hotspotMeshes.forEach((mesh, idx) => {
    const proj = projects[idx];
    mesh.position.y = proj.pos[1] + proj.dims[1] / 2 + 0.45 + Math.sin(t * 1.6 + idx) * 0.05;
    mesh.scale.setScalar(1 + Math.sin(t * 2 + idx) * 0.07);
  });
  const arr = particles.geometry.attributes.position.array;
  for (let i = 1; i < arr.length; i += 3) {
    arr[i] += Math.sin(t + i * 0.01) * 0.0006;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  controls.update();
  composer.render();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

animate();

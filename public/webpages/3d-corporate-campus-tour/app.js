import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const hotspots = [
  { id: 'lobby', title: 'Lobby Experience', pos: [-2.2, 1.1, -0.6], cam: [-4.3, 2.4, 4.8], look: [-2.2, 1.1, -0.6], video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', metrics: 'Capacidad 220 | Proyectos 12 | Años 8' },
  { id: 'auditorium', title: 'Auditorium Program', pos: [0, 1.2, -3.2], cam: [0.3, 2.6, 3.9], look: [0, 1.1, -3.2], video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', metrics: 'Capacidad 640 | Proyectos 38 | Años 14' },
  { id: 'terrace', title: 'R&D Terrace', pos: [2.4, 1.2, -0.8], cam: [4.8, 2.3, 4.6], look: [2.3, 1.1, -0.8], video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', metrics: 'Capacidad 110 | Proyectos 22 | Años 5' }
];

const zoneCopy = document.getElementById('zone-copy');
const metricsEl = document.getElementById('metrics');
const viewButtons = document.querySelectorAll('.view-btn');
const startTourBtn = document.getElementById('start-tour');
const toggleFallbackBtn = document.getElementById('toggle-fallback');
const fallback = document.getElementById('fallback');
const dialog = document.getElementById('dialog');
const closeDialog = document.getElementById('close-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogVideo = document.getElementById('dialog-video');
const subtitle = document.getElementById('subtitle');

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1119);
scene.fog = new THREE.Fog(0x0b1119, 7, 32);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.8, 8.6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 14;
controls.minDistance = 4;
controls.target.set(0, 1.2, -1.2);

scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const key = new THREE.DirectionalLight(0xe7dcc6, 1.25);
key.position.set(4, 8, 6);
scene.add(key);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshStandardMaterial({ color: 0x161d2b, roughness: 0.85 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.3;
scene.add(floor);

const campusGroup = new THREE.Group();
const buildingMat = new THREE.MeshStandardMaterial({ color: 0x2d3e5a, roughness: 0.45, metalness: 0.3 });

const lobbyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 2.2), buildingMat.clone());
lobbyMesh.position.set(-2.2, 0.9, -0.6);
campusGroup.add(lobbyMesh);

const audMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 2.8), buildingMat.clone());
audMesh.position.set(0, 1.1, -3.2);
campusGroup.add(audMesh);

const terraceMesh = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.6, 2.2), buildingMat.clone());
terraceMesh.position.set(2.4, 0.8, -0.8);
campusGroup.add(terraceMesh);

scene.add(campusGroup);

const hotspotMeshes = [];
const hotspotMat = new THREE.MeshStandardMaterial({ color: 0x7db4ff, emissive: 0x2e6ab0, emissiveIntensity: 0.35, transparent: true, opacity: 0.65 });

hotspots.forEach((hotspot) => {
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), hotspotMat.clone());
  sphere.position.set(...hotspot.pos);
  sphere.userData = { hotspotId: hotspot.id };
  scene.add(sphere);
  hotspotMeshes.push(sphere);
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function updateNarrative(hotspot) {
  zoneCopy.textContent = hotspot.title;
  metricsEl.textContent = hotspot.metrics;
}

function moveCamera(hotspot) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    camera.position.set(...hotspot.cam);
    controls.target.set(...hotspot.look);
    return;
  }
  gsap.to(camera.position, { x: hotspot.cam[0], y: hotspot.cam[1], z: hotspot.cam[2], duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls.target, { x: hotspot.look[0], y: hotspot.look[1], z: hotspot.look[2], duration: 1.5, ease: 'power2.inOut' });
}

function openDialog(hotspot) {
  dialogTitle.textContent = hotspot.title;
  dialogVideo.src = hotspot.video;
  subtitle.textContent = `${hotspot.title} - subtitles synchronized`;
  dialog.classList.remove('hidden');
}

function activateHotspot(hotspotId) {
  const hotspot = hotspots.find((h) => h.id === hotspotId);
  if (!hotspot) return;
  moveCamera(hotspot);
  updateNarrative(hotspot);
  openDialog(hotspot);
}

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(hotspotMeshes);
  if (!hit.length) return;
  activateHotspot(hit[0].object.userData.hotspotId);
});

viewButtons.forEach((btn) => {
  btn.addEventListener('click', () => activateHotspot(btn.dataset.view));
});

window.addEventListener('keydown', (event) => {
  if (event.key === '1') activateHotspot('lobby');
  if (event.key === '2') activateHotspot('auditorium');
  if (event.key === '3') activateHotspot('terrace');
});

let tourIndex = 0;
let tourTimer = null;
startTourBtn.addEventListener('click', () => {
  clearInterval(tourTimer);
  tourIndex = 0;
  activateHotspot(hotspots[tourIndex].id);
  tourTimer = setInterval(() => {
    tourIndex = (tourIndex + 1) % hotspots.length;
    activateHotspot(hotspots[tourIndex].id);
  }, 5200);
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

function renderFallback() {
  fallback.innerHTML = '<h2>2D Chapter Fallback</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  hotspots.forEach((hotspot) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `<h3>${hotspot.title}</h3><video controls preload="metadata" src="${hotspot.video}"></video><p>${hotspot.metrics}</p><a href="assets/transcript.txt" download>Transcript</a>`;
    grid.appendChild(card);
  });
  fallback.appendChild(grid);
}

toggleFallbackBtn.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
  toggleFallbackBtn.textContent = hidden ? 'Hide Fallback' : 'Fallback 2D';
});

renderFallback();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
  });
}, { threshold: 0.05 });
observer.observe(sceneRoot);

function animate() {
  const t = performance.now() * 0.001;
  hotspotMeshes.forEach((mesh, index) => {
    mesh.position.y = hotspots[index].pos[1] + Math.sin(t * 1.8 + index) * 0.06;
    mesh.scale.setScalar(1 + Math.sin(t * 2.2 + index) * 0.08);
  });
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

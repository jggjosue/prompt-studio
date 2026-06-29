import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const videos = [
  document.getElementById('face-video-1'),
  document.getElementById('face-video-2'),
  document.getElementById('face-video-3'),
  document.getElementById('face-video-4'),
  document.getElementById('face-video-5'),
  document.getElementById('face-video-6')
];

const faceData = [
  { id: 0, title: 'Showreel Highlights', desc: 'A concise reel of featured direction, editing, and motion composition.' },
  { id: 1, title: 'Personal Bio', desc: 'Background, values, and creative process in a short narrative clip.' },
  { id: 2, title: 'Selected Projects', desc: 'Case snapshots from product, branding, and storytelling executions.' },
  { id: 3, title: 'Client Results', desc: 'Outcomes, impact metrics, and transformation stories.' },
  { id: 4, title: 'Studio Rituals', desc: 'Behind-the-scenes microvideo with workflow and craft focus.' },
  { id: 5, title: 'Contact and CTA', desc: 'Final invitation and next step to collaborate.' }
];

const sceneRoot = document.getElementById('scene');
const faceTitle = document.getElementById('face-title');
const faceDesc = document.getElementById('face-desc');
const overlay = document.getElementById('overlay');
const closeOverlay = document.getElementById('close-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayVideo = document.getElementById('overlay-video');
const overlayCaption = document.getElementById('overlay-caption');
const fallbackBtn = document.getElementById('toggle-fallback');
const fallback = document.getElementById('fallback');

videos.forEach((video) => video.play().catch(() => {}));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1015);
scene.fog = new THREE.Fog(0x0d1015, 8, 30);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.3, 5.6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3.4;
controls.maxDistance = 7.8;

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const key = new THREE.DirectionalLight(0xd6d0c9, 1.2);
key.position.set(4, 5, 6);
scene.add(key);
const rim = new THREE.PointLight(0x8493a7, 24, 16, 2);
rim.position.set(-3, -0.4, -2);
scene.add(rim);

const textures = videos.map((video) => {
  const tex = new THREE.VideoTexture(video);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
});

const cubeMaterials = textures.map((texture) => new THREE.MeshPhysicalMaterial({
  map: texture,
  metalness: 0.62,
  roughness: 0.28,
  clearcoat: 0.9,
  clearcoatRoughness: 0.16
}));

const cube = new THREE.Mesh(new THREE.BoxGeometry(2.25, 2.25, 2.25), cubeMaterials);
scene.add(cube);

const base = new THREE.Mesh(
  new THREE.CylinderGeometry(2, 2.25, 0.18, 40),
  new THREE.MeshStandardMaterial({ color: 0x1a1f29, roughness: 0.72, metalness: 0.4 })
);
base.position.y = -1.34;
scene.add(base);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function faceIndexFromNormal(normal) {
  const n = normal.clone();
  const abs = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)];
  const maxAxis = abs.indexOf(Math.max(...abs));
  if (maxAxis === 0) return n.x > 0 ? 0 : 1;
  if (maxAxis === 1) return n.y > 0 ? 2 : 3;
  return n.z > 0 ? 4 : 5;
}

function updateInfoByFace(idx) {
  const data = faceData[idx];
  if (!data) return;
  faceTitle.textContent = data.title;
  faceDesc.textContent = data.desc;
}

function openFaceModal(idx) {
  const data = faceData[idx];
  const video = videos[idx];
  if (!data || !video) return;

  overlayTitle.textContent = data.title;
  overlayCaption.textContent = data.desc;
  overlayVideo.src = video.src;
  overlay.classList.remove('hidden');
}

function closeFaceModal() {
  overlay.classList.add('hidden');
  overlayVideo.pause();
  overlayVideo.src = '';
}

renderer.domElement.addEventListener('pointermove', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(cube);
  if (!hits.length) return;
  const idx = faceIndexFromNormal(hits[0].face.normal.clone().transformDirection(cube.matrixWorld));
  updateInfoByFace(idx);
});

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(cube);
  if (!hits.length) return;

  const idx = faceIndexFromNormal(hits[0].face.normal.clone().transformDirection(cube.matrixWorld));
  openFaceModal(idx);
});

closeOverlay.addEventListener('click', closeFaceModal);
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closeFaceModal();
});

function renderFallback() {
  fallback.innerHTML = '<h2>Linear Accessible Version</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  faceData.forEach((item, idx) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `
      <h4>${item.title}</h4>
      <video controls preload="metadata" src="${videos[idx].src}"></video>
      <p>${item.desc}</p>
    `;
    grid.appendChild(card);
  });
  fallback.appendChild(grid);
}

fallbackBtn.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
  fallbackBtn.textContent = hidden ? 'Hide Fallback' : 'Linear Fallback';
});

renderFallback();

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animate() {
  requestAnimationFrame(animate);
  if (!reduced) {
    cube.rotation.y += 0.004;
    cube.rotation.x = Math.sin(performance.now() * 0.00035) * 0.08;
    base.rotation.y += 0.001;
  }
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const clips = [
  {
    id: 'bio-cell',
    title: 'Cell Biology Foundations',
    tags: ['biology', 'cells', 'science'],
    duration: '6:40',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    transcript: 'A quick overview of cell structures, membrane behavior, and transport mechanisms.'
  },
  {
    id: 'alg-functions',
    title: 'Algebra and Functions',
    tags: ['algebra', 'math', 'functions'],
    duration: '5:22',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    transcript: 'Understand slope, intercepts, and function transformations with visual examples.'
  },
  {
    id: 'world-history',
    title: 'Modern History Snapshot',
    tags: ['history', 'society', 'timeline'],
    duration: '8:10',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    transcript: 'A concise timeline of key events that shaped modern political and cultural systems.'
  }
];

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const resultsEl = document.getElementById('results');
const favListEl = document.getElementById('favorites');
const fallback = document.getElementById('fallback');
const toggle2d = document.getElementById('toggle-2d');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalVideo = document.getElementById('modal-video');
const modalTranscript = document.getElementById('modal-transcript');
const closeModal = document.getElementById('close-modal');
const favBtn = document.getElementById('fav-btn');

const favorites = new Set();
let currentClip = null;

function indexScore(clip, query) {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  let score = 0;
  if (clip.title.toLowerCase().includes(q)) score += 3;
  clip.tags.forEach((tag) => {
    if (tag.includes(q)) score += 2;
  });
  if (clip.transcript.toLowerCase().includes(q)) score += 1;
  return score;
}

function renderCatalog(items) {
  listEl.innerHTML = '';
  items.forEach((clip) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'item';
    card.innerHTML = `<strong>${clip.title}</strong><span>${clip.duration} · ${clip.tags.join(', ')}</span>`;
    card.addEventListener('click', () => openModal(clip));
    listEl.appendChild(card);
  });
  resultsEl.textContent = `Showing ${items.length} clip${items.length === 1 ? '' : 's'}`;
}

function renderFavorites() {
  favListEl.innerHTML = '';
  if (!favorites.size) {
    favListEl.innerHTML = '<li>No favorites yet.</li>';
    return;
  }
  [...favorites].forEach((id) => {
    const clip = clips.find((item) => item.id === id);
    if (!clip) return;
    const li = document.createElement('li');
    li.textContent = clip.title;
    favListEl.appendChild(li);
  });
}

function openModal(clip) {
  currentClip = clip;
  modalTitle.textContent = clip.title;
  modalVideo.src = clip.video;
  modalTranscript.textContent = clip.transcript;
  modal.classList.remove('hidden');
}

function closeClipModal() {
  modal.classList.add('hidden');
  modalVideo.pause();
  modalVideo.src = '';
}

function renderFallback2D() {
  fallback.innerHTML = '<h2>2D Accessible List</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';

  clips.forEach((clip) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `
      <h3>${clip.title}</h3>
      <p class="muted">${clip.duration} · ${clip.tags.join(', ')}</p>
      <video controls preload="metadata" src="${clip.video}"></video>
      <p>${clip.transcript}</p>
    `;
    grid.appendChild(card);
  });

  fallback.appendChild(grid);
}

searchEl.addEventListener('input', () => {
  const query = searchEl.value;
  const filtered = clips
    .map((clip) => ({ clip, score: indexScore(clip, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.clip);

  renderCatalog(filtered);
  highlightShelves(filtered.map((c) => c.id));
});

closeModal.addEventListener('click', closeClipModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeClipModal();
});

favBtn.addEventListener('click', () => {
  if (!currentClip) return;
  favorites.add(currentClip.id);
  renderFavorites();
});

toggle2d.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
  toggle2d.textContent = hidden ? 'Hide 2D List' : '2D List';
});

renderCatalog(clips);
renderFavorites();
renderFallback2D();

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1117);
scene.fog = new THREE.Fog(0x0d1117, 8, 34);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.4, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const key = new THREE.DirectionalLight(0xd9c8aa, 1.2);
key.position.set(5, 7, 6);
scene.add(key);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 36), new THREE.MeshStandardMaterial({ color: 0x141a23, roughness: 0.9 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.1;
scene.add(floor);

const shelves = [];
const bookMap = new Map();
const shelfGeo = new THREE.BoxGeometry(7, 3, 0.7);
const shelfMat = new THREE.MeshStandardMaterial({ color: 0x2a3342, roughness: 0.6, metalness: 0.25 });

for (let i = 0; i < 5; i += 1) {
  const left = new THREE.Mesh(shelfGeo, shelfMat.clone());
  left.position.set(-4, 1.4, -i * 5);
  scene.add(left);
  shelves.push(left);

  const right = new THREE.Mesh(shelfGeo, shelfMat.clone());
  right.position.set(4, 1.4, -i * 5);
  scene.add(right);
  shelves.push(right);
}

const bookGeo = new THREE.BoxGeometry(0.7, 1.1, 0.35);
clips.forEach((clip, index) => {
  const mat = new THREE.MeshStandardMaterial({ color: [0xb9a06c, 0x7ea6c7, 0xa77777][index % 3], roughness: 0.45, metalness: 0.35 });
  const book = new THREE.Mesh(bookGeo, mat);
  const side = index % 2 === 0 ? -4 : 4;
  book.position.set(side + (index % 2 === 0 ? -1.4 + index * 0.48 : 1.4 - index * 0.48), 1.35, -2.6 - index * 3.6);
  book.userData.clipId = clip.id;
  scene.add(book);
  bookMap.set(clip.id, book);
});

function highlightShelves(ids) {
  bookMap.forEach((mesh, id) => {
    const active = ids.includes(id);
    mesh.scale.set(active ? 1.15 : 1, active ? 1.15 : 1, active ? 1.15 : 1);
    mesh.material.emissive = new THREE.Color(active ? 0x5a86b0 : 0x000000);
    mesh.material.emissiveIntensity = active ? 0.5 : 0;
  });
}

function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.001;
  camera.position.z = 10 + Math.sin(t * 0.25) * 0.4;
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

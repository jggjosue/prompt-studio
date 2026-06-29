import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const clips = [
  {
    id: 'physics-vectors',
    title: 'Physics: Vectors and Forces',
    duration: '08:20',
    language: 'EN',
    level: 'intermediate',
    tags: ['physics', 'vectors', 'force', 'mechanics'],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    transcript: 'Vector decomposition, force arrows, and equilibrium with examples.',
    snippet: 'Understand vector decomposition and resultant force in real scenarios.'
  },
  {
    id: 'algebra-functions',
    title: 'Algebra: Functions in Motion',
    duration: '06:45',
    language: 'EN',
    level: 'beginner',
    tags: ['math', 'algebra', 'functions', 'graphs'],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    transcript: 'Linear and quadratic functions visualized with dynamic plots.',
    snippet: 'Explore function transformations and graph behavior interactively.'
  },
  {
    id: 'history-modern',
    title: 'Modern History in 12 Events',
    duration: '09:10',
    language: 'EN',
    level: 'all',
    tags: ['history', 'timeline', 'society', 'geopolitics'],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    transcript: 'A concise narrated timeline with context and outcomes.',
    snippet: 'Navigate key milestones that shaped modern institutions.'
  },
  {
    id: 'biology-cell',
    title: 'Biology: Cell Systems',
    duration: '07:05',
    language: 'EN',
    level: 'intermediate',
    tags: ['biology', 'cell', 'organelles', 'science'],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    transcript: 'Cell membrane, nucleus, and transport mechanisms explained.',
    snippet: 'Learn the function of organelles and material transport across membranes.'
  }
];

const searchInput = document.getElementById('search');
const resultsEl = document.getElementById('results');
const favoritesEl = document.getElementById('favorites');
const player = document.getElementById('player');
const closePlayer = document.getElementById('close-player');
const clipTitle = document.getElementById('clip-title');
const clipVideo = document.getElementById('clip-video');
const clipSubtitle = document.getElementById('clip-subtitle');
const clipTranscript = document.getElementById('clip-transcript');
const favBtn = document.getElementById('fav-btn');
const toggleNavBtn = document.getElementById('toggle-nav');
const toggleFallbackBtn = document.getElementById('toggle-fallback');
const fallback = document.getElementById('fallback');

const favorites = new Set();
let currentClip = null;
let firstPerson = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1219);
scene.fog = new THREE.Fog(0x0d1219, 8, 36);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.2, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('scene-root').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, -2.6);

scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const key = new THREE.DirectionalLight(0xe8dbc6, 1.2);
key.position.set(5, 8, 6);
scene.add(key);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), new THREE.MeshStandardMaterial({ color: 0x151d2a, roughness: 0.88 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.35;
scene.add(floor);

const shelves = [];
const booksByClip = new Map();

function makeShelf(zIndex) {
  const left = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.8, 0.6), new THREE.MeshStandardMaterial({ color: 0x2e3b52, roughness: 0.55, metalness: 0.2 }));
  left.position.set(-4, 1.1, zIndex);
  scene.add(left);

  const right = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.8, 0.6), new THREE.MeshStandardMaterial({ color: 0x2e3b52, roughness: 0.55, metalness: 0.2 }));
  right.position.set(4, 1.1, zIndex);
  scene.add(right);
  shelves.push(left, right);
}

for (let i = 0; i < 5; i += 1) makeShelf(-i * 4.4);

clips.forEach((clip, idx) => {
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 1.1, 0.3),
    new THREE.MeshStandardMaterial({ color: [0xc8ab78, 0x7fa3c7, 0xa87f7f, 0x8fb07f][idx % 4], roughness: 0.45, metalness: 0.3, emissive: 0x000000 })
  );
  const side = idx % 2 === 0 ? -4 : 4;
  const z = -1.2 - Math.floor(idx / 2) * 4.3;
  book.position.set(side + (idx % 2 === 0 ? -1 + idx * 0.2 : 1 - idx * 0.2), 1.18, z);
  book.userData.clipId = clip.id;
  scene.add(book);
  booksByClip.set(clip.id, book);
});

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function semanticScore(clip, query) {
  const q = tokenize(query);
  if (!q.length) return 1;
  const hay = tokenize(`${clip.title} ${clip.tags.join(' ')} ${clip.level} ${clip.transcript} ${clip.snippet}`);
  const freq = new Map();
  hay.forEach((token) => freq.set(token, (freq.get(token) || 0) + 1));
  let score = 0;
  q.forEach((token) => {
    if (freq.has(token)) score += 3 + Math.min(2, freq.get(token));
    clip.tags.forEach((tag) => {
      if (tag.includes(token)) score += 2;
    });
    if (clip.title.toLowerCase().includes(token)) score += 2;
  });
  return score;
}

function highlightShelves(ids) {
  booksByClip.forEach((book, clipId) => {
    const active = ids.includes(clipId);
    book.material.emissive.setHex(active ? 0x446a98 : 0x000000);
    book.material.emissiveIntensity = active ? 0.65 : 0;
    gsap.to(book.scale, { x: active ? 1.12 : 1, y: active ? 1.12 : 1, z: active ? 1.12 : 1, duration: 0.35 });
  });
}

function openClip(clip) {
  currentClip = clip;
  clipTitle.textContent = clip.title;
  clipVideo.src = clip.video;
  clipSubtitle.textContent = `${clip.duration} · ${clip.language} · ${clip.level}`;
  clipTranscript.textContent = clip.transcript;
  player.classList.remove('hidden');
  const book = booksByClip.get(clip.id);
  if (book && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.to(camera.position, { x: book.position.x * 0.62, y: 2, z: book.position.z + 3.4, duration: 1.0, ease: 'power2.out' });
    gsap.to(controls.target, { x: book.position.x, y: 1.1, z: book.position.z, duration: 1.0, ease: 'power2.out' });
  }
}

function closeClip() {
  player.classList.add('hidden');
  clipVideo.pause();
  clipVideo.src = '';
  currentClip = null;
}

function renderResults(items) {
  resultsEl.innerHTML = '';
  items.forEach((clip, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'result';
    card.innerHTML = `<h4>${index + 1}. ${clip.title}</h4><p>${clip.snippet}</p>`;
    card.addEventListener('click', () => openClip(clip));
    resultsEl.appendChild(card);
  });
}

function renderFavorites() {
  favoritesEl.innerHTML = '';
  if (!favorites.size) {
    favoritesEl.innerHTML = '<li>No favorites yet.</li>';
    return;
  }
  [...favorites].forEach((id) => {
    const clip = clips.find((item) => item.id === id);
    if (!clip) return;
    const li = document.createElement('li');
    li.textContent = clip.title;
    favoritesEl.appendChild(li);
  });
}

function runSearch(query) {
  const ranked = clips
    .map((clip) => ({ clip, score: semanticScore(clip, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.clip);

  renderResults(ranked);
  highlightShelves(ranked.map((item) => item.id));
}

searchInput.addEventListener('input', () => runSearch(searchInput.value));
closePlayer.addEventListener('click', closeClip);
favBtn.addEventListener('click', () => {
  if (!currentClip) return;
  favorites.add(currentClip.id);
  renderFavorites();
});

toggleNavBtn.addEventListener('click', () => {
  firstPerson = !firstPerson;
  toggleNavBtn.textContent = firstPerson ? 'First Person' : 'Orbit Mode';
  controls.enableRotate = !firstPerson;
});

toggleFallbackBtn.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
  toggleFallbackBtn.textContent = hidden ? 'Hide 2D Fallback' : '2D Fallback';
});

window.addEventListener('keydown', (event) => {
  const index = Number(event.key);
  if (!Number.isInteger(index) || index < 1 || index > 9) return;
  const clip = clips[index - 1];
  if (clip) openClip(clip);
});

function renderFallback() {
  fallback.innerHTML = '<h3>2D Accessible Library</h3>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  clips.forEach((clip) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `<h4>${clip.title}</h4><p>${clip.duration} · ${clip.level}</p><video controls preload="metadata" src="${clip.video}"></video><p>${clip.transcript}</p>`;
    grid.appendChild(card);
  });
  fallback.appendChild(grid);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([...booksByClip.values()]);
  if (!hits.length) return;
  const id = hits[0].object.userData.clipId;
  const clip = clips.find((item) => item.id === id);
  if (clip) openClip(clip);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
  });
}, { threshold: 0.05 });
observer.observe(document.getElementById('scene-root'));

function animate() {
  const t = performance.now() * 0.001;
  shelves.forEach((shelf, i) => {
    shelf.position.y = 1.1 + Math.sin(t * 0.25 + i) * 0.01;
  });
  if (firstPerson) {
    camera.position.z -= 0.01;
    if (camera.position.z < -16) camera.position.z = 9;
  }
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

if ('requestIdleCallback' in window) {
  requestIdleCallback(() => runSearch(''));
} else {
  runSearch('');
}

renderFavorites();
renderFallback();
animate();

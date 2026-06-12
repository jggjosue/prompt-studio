import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const artworks = [
  {
    title: 'Retrato en azul', artist: 'María Vega', year: '2023',
    tech: 'Óleo sobre lienzo, 120×90 cm',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    desc: 'Exploración cromática de la identidad a través del azul ultramar y matices de cobalto. La mirada del sujeto interpela al espectador desde una composición asimétrica.',
    curatorNotes: 'Vega utiliza el azul como vehículo emocional — cada capa de pintura revela una introspección distinta.',
    color: 0x2a4a6a, pos: [-0.9, 0.65, -3.4], rot: 0,
    cam: [-1.2, 1.4, -1.6], look: [-0.9, 0.65, -3.4]
  },
  {
    title: 'Composición_#7', artist: 'Luis Torres', year: '2024',
    tech: 'Acrílico y técnica mixta, 150×150 cm',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    desc: 'Geometrías en tensión dialogan con el caos controlado. Capas de acrílico y collage digital se superponen en una sinfonía visual.',
    curatorNotes: 'Torres rompe la jerarquía del plano pictórico — cada elemento compite y colabora simultáneamente.',
    color: 0x8a3a4a, pos: [0, 0.65, -3.4], rot: 0,
    cam: [0, 1.4, -1.6], look: [0, 0.65, -3.4]
  },
  {
    title: 'Horizonte líquido', artist: 'Ana Kurz', year: '2024',
    tech: 'Fotografía digital impresa en papel algodón, 80×120 cm',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    desc: 'Captura del movimiento perpetuo del agua en la costa atlántica. La exposición larga transforma las olas en vapor esculpido.',
    curatorNotes: 'Kurz congela el tiempo sin detenerlo — el horizonte se vuelve frontera líquida entre lo real y lo soñado.',
    color: 0x3a6a5a, pos: [0.9, 0.65, -3.4], rot: 0,
    cam: [1.2, 1.4, -1.6], look: [0.9, 0.65, -3.4]
  },
  {
    title: 'Geometría sagrada', artist: 'Diego Montero', year: '2023',
    tech: 'Escultura en acero y vidrio soplado, 90×90×90 cm',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    desc: 'Estructura fractal que evoca patrones arquitectónicos antiguos. El vidrio atrapa la luz y la refracta en el espacio circundante.',
    curatorNotes: 'Montero convierte el acero en filigrana — la escultura respira con la luz cambiante del día.',
    color: 0x5a4a6a, pos: [0, 0.65, -3.1], rot: 0,
    cam: [0, 1.6, -0.8], look: [0, 0.65, -3.1]
  }
];

const artCopy = document.getElementById('art-copy');
const artButtons = document.querySelectorAll('.art-btn');
const curatorBtn = document.getElementById('curator-mode');
const searchBtn = document.getElementById('search-btn');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const favToggleBtn = document.getElementById('favorites-toggle');
const favPanel = document.getElementById('favorites-panel');
const favList = document.getElementById('fav-list');
const closeFav = document.getElementById('close-fav');
const fallbackBtn = document.getElementById('fallback-toggle');
const fallback = document.getElementById('fallback');
const dialog = document.getElementById('dialog');
const closeDialog = document.getElementById('close-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogVideo = document.getElementById('dialog-video');
const dialogDesc = document.getElementById('dialog-desc');
const dialogMeta = document.getElementById('dialog-meta');
const favToggle = document.getElementById('fav-toggle');
const noteInput = document.getElementById('note-input');
const saveNote = document.getElementById('save-note');
const curatorInfo = document.getElementById('curator-info');

let currentArt = 0;
let curatorActive = false;
let curatorTimer = null;
let curatorIndex = 0;
let favorites = JSON.parse(localStorage.getItem('museum-favs') || '[]');
let personalNotes = JSON.parse(localStorage.getItem('museum-notes') || '{}');

function saveFavs() { localStorage.setItem('museum-favs', JSON.stringify(favorites)); }
function saveNotes() { localStorage.setItem('museum-notes', JSON.stringify(personalNotes)); }

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e14);
scene.fog = new THREE.Fog(0x0b0e14, 5, 18);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 8;
controls.minDistance = 1.5;
controls.target.set(0, 0.65, -1.8);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const key = new THREE.DirectionalLight(0xf0e0ca, 1.0);
key.position.set(2, 5, 3);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const fill = new THREE.DirectionalLight(0x8899bb, 0.3);
fill.position.set(-2, 1, -4);
scene.add(fill);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.MeshStandardMaterial({ color: 0x111824, roughness: 0.92, metalness: 0.05 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.3;
floor.receiveShadow = true;
scene.add(floor);

const roomMat = new THREE.MeshStandardMaterial({ color: 0x141c2a, roughness: 0.85, side: THREE.BackSide });
const room = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 8), roomMat);
room.position.set(0, 1.3, 0);
room.receiveShadow = true;
scene.add(room);

const frameMeshes = [];

function generateArtTexture(artwork) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const c = new THREE.Color(artwork.color);
  ctx.fillStyle = `rgb(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0})`;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.06})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 10 + Math.random() * 60, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 8; i += 1) {
    ctx.strokeStyle = `rgba(200,180,150,${0.08 + Math.random() * 0.12})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, Math.random() * 512);
    ctx.lineTo(Math.random() * 512, Math.random() * 512);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.font = '24px serif';
  ctx.fillText(artwork.title, 30, 480);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

artworks.forEach((art, idx) => {
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a3444, roughness: 0.5, metalness: 0.2 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.06), frameMat);
  frame.position.set(art.pos[0], art.pos[1], art.pos[2]);
  frame.userData = { artIndex: idx };
  scene.add(frame);
  frameMeshes.push(frame);

  const artTex = generateArtTexture(art);
  const artMat = new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.6 });
  const artMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.75), artMat);
  artMesh.position.set(art.pos[0], art.pos[1], art.pos[2] + 0.04);
  scene.add(artMesh);

  const labelMat = new THREE.MeshBasicMaterial({ color: 0xc7a676, transparent: true, opacity: 0.15 });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.06), labelMat);
  label.position.set(art.pos[0], art.pos[1] - 0.48, art.pos[2] + 0.05);
  scene.add(label);
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function renderMeta(art) {
  dialogMeta.innerHTML = `
    <span>${art.artist}</span>
    <span>${art.year}</span>
    <span>${art.tech}</span>
  `;
}

function updateFavBtn(art) {
  favToggle.textContent = favorites.includes(art.title) ? '♥ Favorito' : '♡ Favorito';
}

function openArtwork(idx) {
  clearInterval(curatorTimer);
  curatorActive = false;
  curatorBtn.textContent = 'Iniciar curaduría';
  currentArt = idx;
  const art = artworks[idx];
  dialogTitle.textContent = art.title;
  dialogVideo.src = art.video;
  dialogVideo.load();
  dialogDesc.textContent = art.desc;
  renderMeta(art);
  updateFavBtn(art);
  noteInput.value = personalNotes[art.title] || '';
  artCopy.textContent = `${art.title} — ${art.artist}, ${art.year}`;
  curatorInfo.textContent = `🎙️ ${art.curatorNotes}`;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    camera.position.set(...art.cam);
    controls.target.set(...art.look);
  } else {
    gsap.to(camera.position, { x: art.cam[0], y: art.cam[1], z: art.cam[2], duration: 1.2, ease: 'power2.inOut' });
    gsap.to(controls.target, { x: art.look[0], y: art.look[1], z: art.look[2], duration: 1.2, ease: 'power2.inOut' });
  }

  dialog.classList.remove('hidden');
}

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(frameMeshes);
  if (!hit.length) return;
  openArtwork(hit[0].object.userData.artIndex);
});

artButtons.forEach((btn) => {
  btn.addEventListener('click', () => openArtwork(Number(btn.dataset.art)));
});

window.addEventListener('keydown', (event) => {
  const n = Number(event.key);
  if (n >= 1 && n <= 4) openArtwork(n - 1);
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

favToggle.addEventListener('click', () => {
  const art = artworks[currentArt];
  const idx = favorites.indexOf(art.title);
  if (idx === -1) {
    favorites.push(art.title);
  } else {
    favorites.splice(idx, 1);
  }
  saveFavs();
  updateFavBtn(art);
});

saveNote.addEventListener('click', () => {
  const text = noteInput.value.trim();
  if (!text) return;
  personalNotes[artworks[currentArt].title] = text;
  saveNotes();
});

curatorBtn.addEventListener('click', () => {
  clearInterval(curatorTimer);
  curatorActive = !curatorActive;
  curatorBtn.textContent = curatorActive ? 'Detener curaduría' : 'Iniciar curaduría';
  if (!curatorActive) return;
  curatorIndex = 0;
  openArtwork(curatorIndex);
  curatorTimer = setInterval(() => {
    curatorIndex = (curatorIndex + 1) % artworks.length;
    openArtwork(curatorIndex);
  }, 7000);
});

searchBtn.addEventListener('click', () => {
  const hidden = searchBar.classList.contains('hidden');
  searchBar.classList.toggle('hidden');
  if (!hidden) { searchInput.value = ''; searchResults.innerHTML = ''; }
  if (hidden) searchInput.focus();
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  searchResults.innerHTML = '';
  if (!q) return;
  artworks.forEach((art, idx) => {
    const match = art.title.toLowerCase().includes(q) || art.artist.toLowerCase().includes(q) || art.tech.toLowerCase().includes(q);
    if (!match) return;
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.innerHTML = `<span class="sr-title">${art.title}</span> — ${art.artist}`;
    div.addEventListener('click', () => {
      searchBar.classList.add('hidden');
      openArtwork(idx);
    });
    searchResults.appendChild(div);
  });
});

favToggleBtn.addEventListener('click', () => {
  favPanel.classList.toggle('hidden');
  renderFavs();
});

closeFav.addEventListener('click', () => favPanel.classList.add('hidden'));

function renderFavs() {
  favList.innerHTML = '';
  if (!favorites.length) {
    favList.innerHTML = '<p class="anno-meta">Sin favoritos aún.</p>';
    return;
  }
  favorites.forEach((title) => {
    const art = artworks.find((a) => a.title === title);
    if (!art) return;
    const div = document.createElement('div');
    div.className = 'fav-item';
    div.textContent = art.title;
    div.addEventListener('click', () => {
      favPanel.classList.add('hidden');
      openArtwork(artworks.indexOf(art));
    });
    favList.appendChild(div);
  });
}

function renderFallback() {
  fallback.innerHTML = '<h2>Obras — Versión 2D</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  artworks.forEach((art) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `
      <h3>${art.title}</h3>
      <p class="meta">${art.artist} · ${art.year} · ${art.tech}</p>
      <video controls preload="metadata" src="${art.video}" crossorigin="anonymous">
        <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
      </video>
      <p>${art.desc}</p>
      <p class="meta" style="border-left:2px solid var(--accent);padding-left:.4rem;margin-top:.3rem">🎙️ ${art.curatorNotes}</p>
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
if (favorites.length) renderFavs();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
  });
}, { threshold: 0.05 });
observer.observe(sceneRoot);

function animate() {
  const t = performance.now() * 0.001;
  frameMeshes.forEach((mesh, idx) => {
    const art = artworks[idx];
    mesh.position.y = art.pos[1] + Math.sin(t * 0.8 + idx) * 0.008;
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

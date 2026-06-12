import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PROXIMITY_THRESHOLD = 3.5;
const INACTIVITY_TIMEOUT = 30000;
const COLORS = ['#d4c4b4', '#b4c4d4', '#c4d4b4', '#d4b4c4', '#b4b4d4'];

const products = [
  { name: 'Hub Inteligente', category: 'electronics', desc: 'Controla tu hogar con voz y app. Compatible con 200+ dispositivos.', specs: 'WiFi 6 · BT 5.2 · 4K HDMI · USB-C', colors: ['#e8e0d8', '#2a3a4a', '#8a7a6a'] },
  { name: 'Lámpara Aura', category: 'home', desc: 'Iluminación ambiental con temperatura de color ajustable y ritmo circadiano.', specs: '2700-6500K · 800lm · WiFi · Alexa', colors: ['#f0e8e0', '#c4a056', '#4a5a4a'] },
  { name: 'Reloj Meridian', category: 'accessories', desc: 'Reloj inteligente con GPS, monitor cardíaco y 14 días de batería.', specs: 'AMOLED 1.4" · GPS · HR · 5ATM', colors: ['#e0e0e0', '#1a1a2a', '#c4a056'] },
  { name: 'Altavoz Sphere', category: 'electronics', desc: 'Altavoz 360° con audio espacial y cancelación activa de ruido.', specs: '360° · ANC · 30h · IPX7 · WiFi 6', colors: ['#f0ece8', '#3a4a5a', '#8a7a6a'] },
  { name: 'Maceta Bio', category: 'home', desc: 'Maceta autorriego con sensores de humedad y luz para plantas de interior.', specs: '2L · Sensor HR · USB-C · App', colors: ['#e8ece4', '#5a6a4a', '#c4a056'] },
  { name: 'Estuche Pulse', category: 'accessories', desc: 'Cargador inalámbrico con batería integrada y soporte magnético.', specs: '10000mAh · 15W · MagSafe · USB-C', colors: ['#e8e4e0', '#2a2a3a', '#6a7a8a'] }
];

const getVideo = (idx) => {
  const vids = ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'];
  return vids[idx % vids.length];
};

const proxIndicator = document.getElementById('proximity-indicator');
const filterBtns = document.querySelectorAll('.filter-btn');
const fallbackBtn = document.getElementById('fallback-btn');
const fallbackSection = document.getElementById('fallback-section');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalVideo = document.getElementById('modal-video');
const modalDesc = document.getElementById('modal-desc');
const modalSpecs = document.getElementById('modal-specs');
const modalColors = document.getElementById('modal-colors');
const sampleBtn = document.getElementById('sample-btn');

let currentFilter = 'all';
let inactivityTimer = null;
let videoCache = {};
let lastActiveTime = Date.now();

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f7f4);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.0, 6.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 10;
controls.minDistance = 1.5;
controls.target.set(0, 0.6, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const key = new THREE.DirectionalLight(0xfff5ee, 1.2);
key.position.set(3, 6, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const fill = new THREE.DirectionalLight(0xe8e4e0, 0.4);
fill.position.set(-3, 1, -3);
scene.add(fill);

const floorMat = new THREE.MeshStandardMaterial({ color: 0xf0eee8, roughness: 0.7 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.3;
floor.receiveShadow = true;
scene.add(floor);

const showcases = [];
const showcaseMeshes = [];
const screenMeshes = [];
const productMeshes = [];

function createShowcase(product, idx) {
  const g = new THREE.Group();
  const col = (idx % 3) - 1;
  const row = Math.floor(idx / 3);
  const x = col * 2.2;
  const z = row * -2.5;
  g.position.set(x, 0, z);

  const baseMat = new THREE.MeshStandardMaterial({ color: 0xe8e4de, roughness: 0.3, metalness: 0.05 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.7), baseMat);
  base.position.y = 0.03;
  base.receiveShadow = true;
  base.castShadow = true;
  g.add(base);

  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ef, roughness: 0.6 });
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.6), pedestalMat);
  pedestal.position.y = 0.2;
  pedestal.castShadow = true;
  g.add(pedestal);

  const productMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(COLORS[idx % COLORS.length]), roughness: 0.25, metalness: 0.4
  });
  const prod = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.15), productMat);
  prod.position.y = 0.42;
  prod.castShadow = true;
  g.add(prod);
  productMeshes.push(prod);

  const screenMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x111111, emissiveIntensity: 0.05 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.16), screenMat);
  screen.position.set(0, 0.28, 0.31);
  g.add(screen);
  screenMeshes.push(screen);

  const glowMat = new THREE.MeshBasicMaterial({ color: 0xc4b8aa, transparent: true, opacity: 0.03, side: THREE.DoubleSide });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), glowMat);
  glow.position.y = -0.25;
  glow.rotation.x = -Math.PI / 2;
  g.add(glow);

  const backdropMat = new THREE.MeshStandardMaterial({ color: 0xf0eee8, roughness: 0.8, side: THREE.DoubleSide });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), backdropMat);
  backdrop.position.set(0, 0.3, -0.31);
  g.add(backdrop);

  g.userData = { idx, product, baseX: x, baseZ: z, category: product.category };
  scene.add(g);
  showcases.push(g);
  showcaseMeshes.push(base);

  return g;
}

products.forEach((p, i) => createShowcase(p, i));

const particlesGeo = new THREE.BufferGeometry();
const pCount = 60;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i += 1) {
  pPos[i * 3] = (Math.random() - 0.5) * 10;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 2 + 0.6;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ color: 0xc4b8aa, size: 0.015, transparent: true, opacity: 0.15 })
);
scene.add(particles);

function checkProximity() {
  let nearest = null;
  let minDist = Infinity;
  showcases.forEach((sc) => {
    const dist = camera.position.distanceTo(sc.position);
    if (dist < minDist) { minDist = dist; nearest = sc; }
  });
  if (nearest && minDist < PROXIMITY_THRESHOLD) {
    const idx = nearest.userData.idx;
    proxIndicator.textContent = `🔍 ${products[idx].name} — video disponible`;
    key.intensity = 1.2 + (1 - minDist / PROXIMITY_THRESHOLD) * 0.15;
    const screen = screenMeshes[idx];
    if (screen) screen.material.emissiveIntensity = 0.05 + (1 - minDist / PROXIMITY_THRESHOLD) * 0.2;
    lastActiveTime = Date.now();
    resetInactivityTimer();
  } else {
    proxIndicator.textContent = '🔍 Acércate a una vitrina para ver el video.';
    key.intensity = 1.2;
  }
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    screenMeshes.forEach((s) => { s.material.emissiveIntensity = 0.05; });
  }, INACTIVITY_TIMEOUT);
}

function applyFilter(filter) {
  currentFilter = filter;
  const visible = products.map((p, i) => ({ idx: i, cat: p.category }));
  const filtered = filter === 'all' ? visible : visible.filter((v) => v.cat === filter);
  const hidden = filter === 'all' ? [] : visible.filter((v) => v.cat !== filter);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stagger = reduce ? 0 : 0.04;

  filtered.forEach((v, pos) => {
    const sc = showcases[v.idx];
    const col = (pos % 3) - 1;
    const row = Math.floor(pos / 3);
    const tx = col * 2.2;
    const tz = row * -2.5;
    if (reduce) {
      sc.position.x = tx;
      sc.position.z = tz;
      sc.visible = true;
    } else {
      gsap.to(sc.position, { x: tx, z: tz, duration: 0.6, ease: 'power2.out', delay: pos * stagger });
      sc.visible = true;
    }
  });

  hidden.forEach((v) => {
    const sc = showcases[v.idx];
    if (reduce) {
      sc.visible = false;
    } else {
      gsap.to(sc.position, { y: -1.5, duration: 0.4, ease: 'power2.in', delay: 0.05 }).then(() => { sc.visible = false; sc.position.y = 0; });
    }
  });
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

function openModal(idx) {
  const p = products[idx];
  modalTitle.textContent = p.name;
  modalVideo.src = getVideo(idx);
  modalVideo.load();
  modalDesc.textContent = p.desc;
  modalSpecs.innerHTML = p.specs.split('·').map((s) => `<span>${s.trim()}</span>`).join('');
  modalColors.innerHTML = p.colors.map((c) => `<span class="color-swatch" style="background:${c}" title="${c}"></span>`).join('');
  modal.classList.remove('hidden');
}

renderer.domElement.addEventListener('dblclick', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(x, y);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(showcaseMeshes);
  if (hits.length) {
    const idx = hits[0].object.parent.userData.idx;
    const p = products[idx];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      camera.position.set(0, 1.2, 2.5);
    } else {
      gsap.to(camera.position, { x: 0, y: 1.2, z: 2.5, duration: 0.6, ease: 'power2.out' });
    }
    openModal(idx);
  }
});

showcaseMeshes.forEach((mesh) => {
  mesh.addEventListener('click', (event) => {
    event.stopPropagation();
    const idx = mesh.parent.userData.idx;
    openModal(idx);
  });
});

closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
  modalVideo.pause();
  modalVideo.src = '';
});
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
    modalVideo.pause();
    modalVideo.src = '';
  }
});

sampleBtn.addEventListener('click', () => {
  const form = document.createElement('div');
  form.style.cssText = 'position:fixed;inset:0;z-index:40;background:rgba(248,247,244,.95);display:grid;place-items:center;padding:1rem';
  form.innerHTML = `
    <div class="light-card" style="padding:1.5rem;max-width:400px;width:100%">
      <h3 style="margin-bottom:.75rem">Solicitar muestra</h3>
      <p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem">Completa el formulario y te contactaremos.</p>
      <form onsubmit="event.preventDefault();this.parentElement.parentElement.remove();alert('Muestra solicitada correctamente.')">
        <input placeholder="Nombre" style="display:block;width:100%;margin-bottom:.4rem;padding:.35rem;border:1px solid var(--line);border-radius:6px;font-family:inherit">
        <input type="email" placeholder="Email" style="display:block;width:100%;margin-bottom:.4rem;padding:.35rem;border:1px solid var(--line);border-radius:6px;font-family:inherit">
        <button type="submit" class="btn btn-primary" style="margin-top:.3rem;width:100%">Enviar</button>
      </form>
    </div>
  `;
  form.addEventListener('click', (e) => { if (e.target === form) form.remove(); });
  document.body.appendChild(form);
});

function renderFallback() {
  fallbackSection.innerHTML = '<h2 style="margin-bottom:.5rem">Galería de productos — Versión 2D</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  products.forEach((p, idx) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `
      <h3>${p.name}</h3>
      <span class="tag">${p.category}</span>
      <video controls preload="metadata" src="${getVideo(idx)}" crossorigin="anonymous">
        <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
      </video>
      <p style="font-size:.75rem;color:var(--muted)">${p.desc}</p>
      <p style="font-size:.7rem">${p.specs}</p>
    `;
    grid.appendChild(card);
  });
  fallbackSection.appendChild(grid);
}

fallbackBtn.addEventListener('click', () => {
  const hidden = fallbackSection.classList.contains('hidden');
  fallbackSection.classList.toggle('hidden');
  fallbackBtn.textContent = hidden ? 'Ocultar fallback' : 'Fallback 2D';
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
  productMeshes.forEach((mesh, idx) => {
    mesh.rotation.y += 0.005;
    mesh.position.y = 0.42 + Math.sin(t * 0.8 + idx) * 0.008;
  });
  checkProximity();
  const pArr = particles.geometry.attributes.position.array;
  for (let i = 0; i < pArr.length; i += 3) {
    pArr[i + 1] += Math.sin(t + i * 0.01) * 0.0002;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

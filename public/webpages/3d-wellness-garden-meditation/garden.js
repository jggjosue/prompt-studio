import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const spots = [
  {
    id: 'bench', title: 'Banco del cerezo',
    pos: [-1.8, 0, -2.4], cam: [-2.6, 1.2, -1.2], look: [-1.8, 0.3, -2.4],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    desc: 'Respiración guiada · 3 min. Siéntate, cierra los ojos y sigue el ritmo de la respiración mientras el viento mueve las flores del cerezo.',
    duration: 180
  },
  {
    id: 'fountain', title: 'Fuente de loto',
    pos: [0, 0, -2.6], cam: [0, 1.2, -1.4], look: [0, 0.3, -2.6],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    desc: 'Micro-meditación · 5 min. El sonido del agua te guía hacia un estado de calma profunda. Visualiza los pétalos de loto flotando.',
    duration: 300
  },
  {
    id: 'stones', title: 'Círculo de piedras',
    pos: [1.8, 0, -2.2], cam: [2.6, 1.2, -1.0], look: [1.8, 0.2, -2.2],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    desc: 'Escáner corporal · 4 min. Recostado en el centro, un recorrido de atención plena desde los pies hasta la coronilla.',
    duration: 240
  }
];

const spotCopy = document.getElementById('spot-copy');
const spotButtons = document.querySelectorAll('.spot-btn');
const ambientToggle = document.getElementById('toggle-ambient');
const modeBtn = document.getElementById('mode-toggle');
const fallbackBtn = document.getElementById('fallback-toggle');
const fallback = document.getElementById('fallback');
const dialog = document.getElementById('session-dialog');
const closeSession = document.getElementById('close-session');
const sessionTitle = document.getElementById('session-title');
const sessionVideo = document.getElementById('session-video');
const sessionDesc = document.getElementById('session-desc');
const sessionTimer = document.getElementById('session-timer');
const audioOnlyBtn = document.getElementById('audio-only');
const volSlider = document.getElementById('vol-slider');
const breathIndicator = document.getElementById('breath-indicator');

const ambientAudio = document.getElementById('ambient-audio');
let ambientPlaying = true;
let freeMode = false;
let audioOnly = false;
let timerInterval = null;

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1410);
scene.fog = new THREE.Fog(0x0c1410, 6, 22);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.2, 5.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 10;
controls.minDistance = 1.5;
controls.target.set(0, 0.3, -1.6);

const ambientLight = new THREE.AmbientLight(0xc8d8c0, 0.5);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xf5e8d0, 1.2);
sun.position.set(4, 8, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const fill = new THREE.DirectionalLight(0xaaccaa, 0.3);
fill.position.set(-3, 2, -4);
scene.add(fill);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 16),
  new THREE.MeshStandardMaterial({ color: 0x1a2e22, roughness: 0.95, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.3;
ground.receiveShadow = true;
scene.add(ground);

function createTree(x, z, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 0.5 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 })
  );
  trunk.position.y = 0.25 * scale;
  trunk.castShadow = true;
  group.add(trunk);

  const crownMat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.85 });
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.35 * scale, 8, 8), crownMat);
  crown.position.set(0, 0.65 * scale + 0.2 * scale, 0);
  crown.castShadow = true;
  group.add(crown);

  const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 8, 8), crownMat);
  crown2.position.set(0.15 * scale, 0.8 * scale + 0.1 * scale, 0.1 * scale);
  crown2.castShadow = true;
  group.add(crown2);

  group.position.set(x, -0.3, z);
  return group;
}

const treePositions = [
  [-3, -3.5], [3.5, -3.2], [-3.5, -1], [3.8, -0.8],
  [-2.5, 1.5], [2.8, 1.8], [-0.5, -4], [0.5, -4.2]
];
treePositions.forEach(([x, z]) => scene.add(createTree(x, z, 0.6 + Math.random() * 0.4));

const pathMat = new THREE.MeshStandardMaterial({ color: 0x2a3a28, roughness: 0.95 });
for (let i = -2; i <= 2; i += 0.25) {
  const stone = new THREE.Mesh(new THREE.CircleGeometry(0.08 + Math.random() * 0.06, 6), pathMat);
  stone.rotation.x = -Math.PI / 2;
  stone.position.set(i * 0.7, -0.28, -1.8 + Math.sin(i) * 0.1);
  scene.add(stone);
}

const spotMeshes = [];

function createBench(x, z) {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.2), new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 }));
  seat.position.y = 0.2;
  seat.castShadow = true;
  g.add(seat);

  const legMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a });
  for (let lx of [-0.2, 0.2]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.04), legMat);
    leg.position.set(lx, 0.075, 0);
    g.add(leg);
  }

  const glowMat = new THREE.MeshBasicMaterial({ color: 0x8ab87a, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), glowMat);
  glow.position.y = 0.35;
  glow.rotation.x = -Math.PI / 2;
  g.add(glow);

  g.position.set(x, -0.3, z);
  return g;
}

const bench = createBench(-1.8, -2.4);
scene.add(bench);
const benchGlow = bench.children[3];

function createFountain(x, z) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0x6a7a6a, roughness: 0.7 }));
  base.position.y = 0.06;
  base.receiveShadow = true;
  g.add(base);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0x7a8a7a, roughness: 0.6 }));
  column.position.y = 0.2;
  g.add(column);

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x6a7a6a, roughness: 0.3, metalness: 0.2 }));
  bowl.position.y = 0.33;
  g.add(bowl);

  const water = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshStandardMaterial({ color: 0x88bbdd, emissive: 0x4488aa, emissiveIntensity: 0.2, transparent: true, opacity: 0.7 }));
  water.position.set(0, 0.38, 0);
  g.add(water);

  const glowMat = new THREE.MeshBasicMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), glowMat);
  glow.position.y = 0.1;
  glow.rotation.x = -Math.PI / 2;
  g.add(glow);

  g.position.set(x, -0.3, z);
  return g;
}

const fountain = createFountain(0, -2.6);
scene.add(fountain);
const fountainGlow = fountain.children[5];

function createStoneCircle(x, z) {
  const g = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 });
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 6, 6), stoneMat);
    s.position.set(Math.cos(angle) * 0.3, 0.02 + Math.random() * 0.03, Math.sin(angle) * 0.3);
    s.scale.y = 0.5 + Math.random() * 0.3;
    g.add(s);
  }
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x8ab87a, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), glowMat);
  glow.position.y = 0.05;
  glow.rotation.x = -Math.PI / 2;
  g.add(glow);

  g.position.set(x, -0.3, z);
  return g;
}

const stoneCircle = createStoneCircle(1.8, -2.2);
scene.add(stoneCircle);
const stoneGlow = stoneCircle.children[8];

const spotGlows = [benchGlow, fountainGlow, stoneGlow];
const spotGroups = [bench, fountain, stoneCircle];

const glowMeshes = [];
spotGroups.forEach((g) => {
  const glow = g.children[g.children.length - 1];
  if (glow && glow.isMesh) glowMeshes.push(glow);
});

const flowersGeo = new THREE.BufferGeometry();
const flowerCount = 80;
const fPos = new Float32Array(flowerCount * 3);
const fColors = new Float32Array(flowerCount * 3);
for (let i = 0; i < flowerCount; i += 1) {
  const angle = Math.random() * Math.PI * 2;
  const rad = 0.6 + Math.random() * 3;
  fPos[i * 3] = Math.cos(angle) * rad;
  fPos[i * 3 + 1] = -0.26 + Math.random() * 0.04;
  fPos[i * 3 + 2] = -2 + Math.sin(angle) * rad;
  const hue = 0.25 + Math.random() * 0.15;
  const c = new THREE.Color().setHSL(hue, 0.6, 0.5 + Math.random() * 0.3);
  fColors[i * 3] = c.r;
  fColors[i * 3 + 1] = c.g;
  fColors[i * 3 + 2] = c.b;
}
flowersGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
flowersGeo.setAttribute('color', new THREE.BufferAttribute(fColors, 3));
const flowers = new THREE.Points(
  flowersGeo,
  new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.8 })
);
scene.add(flowers);

const particlesGeo = new THREE.BufferGeometry();
const pCount = 150;
const pPos = new Float32Array(pCount * 3);
const pVel = new Float32Array(pCount);
for (let i = 0; i < pCount; i += 1) {
  pPos[i * 3] = (Math.random() - 0.5) * 8;
  pPos[i * 3 + 1] = Math.random() * 3;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  pVel[i] = 0.002 + Math.random() * 0.004;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ color: 0xaaccaa, size: 0.02, transparent: true, opacity: 0.35 })
);
scene.add(particles);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function openSession(idx) {
  clearInterval(timerInterval);
  const spot = spots[idx];
  sessionTitle.textContent = spot.title;
  sessionVideo.src = spot.video;
  sessionVideo.load();
  sessionDesc.textContent = spot.desc;
  spotCopy.textContent = `🧘 ${spot.title} — ${spot.desc}`;
  breathIndicator.textContent = '🌬️ Sesión iniciada. Sigue la guía de respiración.';

  dialog.classList.remove('hidden');

  setTimeout(() => {
    if (!sessionVideo.paused) {
      timerInterval = setInterval(() => {
        if (!sessionVideo.paused) {
          const t = sessionVideo.currentTime;
          const m = Math.floor(t / 60);
          const s = Math.floor(t % 60);
          sessionTimer.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }
      }, 500);
    }
  }, 100);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    camera.position.set(...spot.cam);
    controls.target.set(...spot.look);
  } else {
    gsap.to(camera.position, { x: spot.cam[0], y: spot.cam[1], z: spot.cam[2], duration: 1.8, ease: 'power2.inOut' });
    gsap.to(controls.target, { x: spot.look[0], y: spot.look[1], z: spot.look[2], duration: 1.8, ease: 'power2.inOut' });
  }
}

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(spotGlows);
  if (!hits.length) return;
  const glowIdx = spotGlows.indexOf(hits[0].object);
  if (glowIdx !== -1) openSession(glowIdx);
});

spotButtons.forEach((btn) => {
  btn.addEventListener('click', () => openSession(Number(btn.dataset.spot)));
});

closeSession.addEventListener('click', () => {
  dialog.classList.add('hidden');
  sessionVideo.pause();
  sessionVideo.src = '';
  clearInterval(timerInterval);
  sessionTimer.textContent = '0:00';
  breathIndicator.textContent = '🌬️ Respiración guiada disponible al activar una sesión.';
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    dialog.classList.add('hidden');
    sessionVideo.pause();
    sessionVideo.src = '';
    clearInterval(timerInterval);
    sessionTimer.textContent = '0:00';
    breathIndicator.textContent = '🌬️ Respiración guiada disponible al activar una sesión.';
  }
});

sessionVideo.addEventListener('play', () => {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const t = sessionVideo.currentTime;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    sessionTimer.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }, 500);
});
sessionVideo.addEventListener('pause', () => clearInterval(timerInterval));
sessionVideo.addEventListener('ended', () => {
  clearInterval(timerInterval);
  sessionTimer.textContent = '0:00';
});

audioOnlyBtn.addEventListener('click', () => {
  audioOnly = !audioOnly;
  audioOnlyBtn.textContent = audioOnly ? '🔊 Con audio' : '🎵 Solo audio';
  sessionVideo.muted = audioOnly;
});

volSlider.addEventListener('input', () => {
  sessionVideo.volume = Number(volSlider.value);
});

ambientToggle.addEventListener('click', () => {
  ambientPlaying = !ambientPlaying;
  ambientToggle.textContent = ambientPlaying ? '🔇 Silenciar ambiente' : '🔊 Activar ambiente';
  if (ambientPlaying) {
    ambientAudio.play().catch(() => {});
  } else {
    ambientAudio.pause();
  }
});

modeBtn.addEventListener('click', () => {
  freeMode = !freeMode;
  controls.enabled = freeMode;
  modeBtn.textContent = freeMode ? 'Modo guiado' : 'Modo libre';
});

window.addEventListener('keydown', (event) => {
  if (event.key >= '1' && event.key <= '3') openSession(Number(event.key) - 1);
  if (event.key === 'a' || event.key === 'A') ambientToggle.click();
});

function renderFallback() {
  fallback.innerHTML = '<h2>Sesiones de bienestar — Versión 2D</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  spots.forEach((spot) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `
      <h3>${spot.title}</h3>
      <video controls preload="metadata" src="${spot.video}" crossorigin="anonymous">
        <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
      </video>
      <p>${spot.desc}</p>
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

document.addEventListener('click', () => {
  if (ambientPlaying && ambientAudio.paused) {
    ambientAudio.play().catch(() => {});
  }
}, { once: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
  });
}, { threshold: 0.05 });
observer.observe(sceneRoot);

function animate() {
  const t = performance.now() * 0.001;
  const breath = Math.sin(t * 0.5) * 0.5 + 0.5;

  spotGlows.forEach((glow, idx) => {
    if (glow) {
      glow.material.opacity = 0.06 + breath * 0.08;
      glow.scale.setScalar(1 + breath * 0.1);
    }
  });

  sun.intensity = 1.0 + Math.sin(t * 0.3) * 0.1;
  ambientLight.intensity = 0.45 + Math.sin(t * 0.4) * 0.05;

  const arr = particles.geometry.attributes.position.array;
  for (let i = 0; i < arr.length; i += 3) {
    arr[i + 1] += Math.sin(t + i * 0.01) * 0.0004;
    arr[i] += Math.sin(t * 0.5 + i) * 0.0003;
  }
  particles.geometry.attributes.position.needsUpdate = true;

  const fArr = flowers.geometry.attributes.position.array;
  for (let i = 0; i < fArr.length; i += 3) {
    fArr[i + 1] = -0.26 + Math.sin(t + i * 0.1) * 0.015;
  }
  flowers.geometry.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

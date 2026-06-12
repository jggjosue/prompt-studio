import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const FLY_DURATION = 1000;
const zoneData = [
  { id: 'lobby', title: 'Lobby', metrics: 'Capacidad: 120 | Equipo: 15', cam: [-4.2, 2.2, 4.5], look: [-2, 0.8, -1.2], pos: [-2, 0.6, -1.2] },
  { id: 'auditorium', title: 'Auditorio', metrics: 'Capacidad: 640 | Proyectos: 38', cam: [0.3, 2.4, 4.8], look: [0, 0.8, -2.8], pos: [0, 0.6, -2.8] },
  { id: 'lab', title: 'Lab R&D', metrics: 'Proyectos: 22 | Patentes: 8', cam: [4.6, 2.2, 4.2], look: [2, 0.8, -1.4], pos: [2, 0.6, -1.4] },
  { id: 'terrace', title: 'Terraza', metrics: 'Área: 320m² | Plantas: 140', cam: [4.2, 2.8, -0.5], look: [1.8, 1.0, 0.8], pos: [1.8, 0.6, 0.8] },
  { id: 'cafe', title: 'Cafetería', metrics: 'Capacidad: 80 | Menú: 12 opciones', cam: [-4.0, 2.2, 0.5], look: [-1.8, 0.8, 1.0], pos: [-1.8, 0.6, 1.0] }
];

const getVideo = (idx) => {
  const vids = ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'];
  return vids[idx % vids.length];
};

const zoneCopy = document.getElementById('zone-copy');
const metricsDisplay = document.getElementById('metrics-display');
const zoneBtns = document.querySelectorAll('.zone-btn');
const startBtn = document.getElementById('start-tour-btn');
const autoTourBtn = document.getElementById('auto-tour');
const toggleViewBtn = document.getElementById('toggle-view');
const fallbackBtn = document.getElementById('fallback-btn');
const fallbackSection = document.getElementById('fallback-section');
const videoPanel = document.getElementById('video-panel');
const closePanel = document.getElementById('close-panel');
const panelTitle = document.getElementById('panel-title');
const panelVideo = document.getElementById('panel-video');
const panelSubtitle = document.getElementById('panel-subtitle');

let useTextureView = true;
let autoTourActive = false;
let autoTourIdx = 0;
let autoTourTimer = null;
let tourStarted = false;
let currentZone = 0;

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0eee8);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4.0, 8.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 14;
controls.minDistance = 3;
controls.target.set(0, 0.8, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sun = new THREE.DirectionalLight(0xfff0dd, 1.4);
sun.position.set(5, 10, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);
const skyFill = new THREE.DirectionalLight(0x7ab8d4, 0.3);
skyFill.position.set(-3, 2, -3);
scene.add(skyFill);
const bounce = new THREE.DirectionalLight(0xc4a056, 0.08);
bounce.position.set(0, -1, 0);
scene.add(bounce);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 16),
  new THREE.MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.8 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.3;
floor.receiveShadow = true;
scene.add(floor);

const buildingColors = [0xe8e4dc, 0xf0ece6, 0xece8e2, 0xe4e0da, 0xeae6de];
const buildingGeo = [
  { w: 2.4, h: 1.6, d: 1.8 }, { w: 2.8, h: 2.0, d: 2.4 }, { w: 2.2, h: 1.8, d: 1.6 },
  { w: 2.0, h: 1.2, d: 2.0 }, { w: 2.0, h: 1.4, d: 1.6 }
];

const hotspotMeshes = [];
const videoPlanes = [];

zoneData.forEach((z, idx) => {
  const mat = new THREE.MeshStandardMaterial({ color: buildingColors[idx], roughness: 0.6 });
  const g = buildingGeo[idx];
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(g.w, g.h, g.d), mat);
  mesh.position.set(z.pos[0], z.pos[1], z.pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const accentMat = new THREE.MeshStandardMaterial({ color: 0xc4a056, roughness: 0.4, metalness: 0.2 });
  const rim = new THREE.Mesh(new THREE.BoxGeometry(g.w * 1.02, 0.04, g.d * 1.02), accentMat);
  rim.position.set(z.pos[0], z.pos[1] - g.h / 2, z.pos[2]);
  scene.add(rim);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0xc4a056, transparent: true, opacity: 0.3,
      emissive: 0xc4a056, emissiveIntensity: 0.08
    })
  );
  sphere.position.set(z.pos[0], z.pos[1] + g.h / 2 + 0.35, z.pos[2]);
  sphere.userData = { zoneIdx: idx };
  scene.add(sphere);
  hotspotMeshes.push(sphere);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.34, 32),
    new THREE.MeshBasicMaterial({ color: 0xc4a056, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  ring.position.copy(sphere.position);
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);

  if (idx < 3) {
    const vMat = new THREE.MeshStandardMaterial({ color: 0xdddad4, roughness: 0.5, side: THREE.DoubleSide });
    const vPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), vMat);
    vPlane.position.set(z.pos[0], z.pos[1] + g.h / 2 + 0.02, z.pos[2] - g.d / 2 - 0.01);
    scene.add(vPlane);
    videoPlanes.push(vPlane);
  }
});

scene.add(new THREE.GridHelper(12, 20, 0xddd8d0, 0xe8e4dc));

const particlesGeo = new THREE.BufferGeometry();
const pCount = 80;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i += 1) {
  pPos[i * 3] = (Math.random() - 0.5) * 12;
  pPos[i * 3 + 1] = Math.random() * 4;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ color: 0xc4a056, size: 0.025, transparent: true, opacity: 0.2 })
);
scene.add(particles);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function openZone(idx) {
  currentZone = idx;
  const z = zoneData[idx];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    camera.position.set(...z.cam);
    controls.target.set(...z.look);
  } else {
    gsap.to(camera.position, { x: z.cam[0], y: z.cam[1], z: z.cam[2], duration: FLY_DURATION / 1000, ease: 'power2.inOut' });
    gsap.to(controls.target, { x: z.look[0], y: z.look[1], z: z.look[2], duration: FLY_DURATION / 1000, ease: 'power2.inOut' });
  }

  zoneCopy.textContent = `📍 ${z.title} — explora el hotspot para ver el video explicativo.`;
  metricsDisplay.textContent = '';
  openVideoPanel(idx);
}

function openVideoPanel(idx) {
  const z = zoneData[idx];
  panelTitle.textContent = z.title;
  panelVideo.src = getVideo(idx);
  panelVideo.load();
  panelSubtitle.textContent = `Subtítulos sincronizados disponibles. ${z.metrics}`;
  videoPanel.classList.remove('hidden');

  setTimeout(() => {
    metricsDisplay.textContent = `📊 ${z.metrics}`;
  }, 300);
}

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(hotspotMeshes);
  if (!hits.length) return;
  openZone(hits[0].object.userData.zoneIdx);
  if (!tourStarted) {
    tourStarted = true;
    startBtn.classList.add('hidden');
  }
});

zoneBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const idx = Number(btn.dataset.zone);
    openZone(idx);
    if (!tourStarted) { tourStarted = true; startBtn.classList.add('hidden'); }
  });
});

startBtn.addEventListener('click', () => {
  tourStarted = true;
  startBtn.classList.add('hidden');
  openZone(0);
});

autoTourBtn.addEventListener('click', () => {
  autoTourActive = !autoTourActive;
  autoTourBtn.textContent = autoTourActive ? '⏸️ Pausar tour' : '🎧 Tour automático';
  if (autoTourActive) {
    if (!tourStarted) { tourStarted = true; startBtn.classList.add('hidden'); }
    autoTourIdx = 0;
    openZone(0);
    autoTourTimer = setInterval(() => {
      autoTourIdx = (autoTourIdx + 1) % zoneData.length;
      openZone(autoTourIdx);
    }, 8000);
  } else {
    clearInterval(autoTourTimer);
  }
});

toggleViewBtn.addEventListener('click', () => {
  useTextureView = !useTextureView;
  toggleViewBtn.textContent = useTextureView ? '🎬 Textura 3D' : '🖼️ Overlay HTML';
});

closePanel.addEventListener('click', () => {
  videoPanel.classList.add('hidden');
  panelVideo.pause();
  panelVideo.src = '';
});
videoPanel.addEventListener('click', (event) => {
  if (event.target === videoPanel) {
    videoPanel.classList.add('hidden');
    panelVideo.pause();
    panelVideo.src = '';
  }
});

window.addEventListener('keydown', (event) => {
  const n = Number(event.key);
  if (n >= 1 && n <= 5) { openZone(n - 1); if (!tourStarted) { tourStarted = true; startBtn.classList.add('hidden'); } }
  if (event.key === ' ') { event.preventDefault(); autoTourBtn.click(); }
});

function renderFallback() {
  fallbackSection.innerHTML = `
    <h3>Corporate Campus — Light Mode Tour</h3>
    <video class="fallback-video" controls preload="metadata" src="${getVideo(0)}" crossorigin="anonymous">
      <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
    </video>
    <div style="margin-top:.5rem;display:flex;flex-wrap:wrap;gap:.5rem">
      ${zoneData.map((z) => `<button class="btn btn-outline" data-fb-idx="${zoneData.indexOf(z)}" style="font-size:.72rem">${z.title}</button>`).join('')}
    </div>
    <p style="margin-top:.5rem;color:var(--muted);font-size:.8rem">Selecciona una zona para ver su video explicativo. Transcripción disponible abajo.</p>
    <a href="assets/transcript.txt" download style="color:var(--accent);font-size:.8rem">📝 Transcripción completa</a>
  `;
  fallbackSection.querySelectorAll('[data-fb-idx]').forEach((b) => {
    b.addEventListener('click', () => {
      const v = fallbackSection.querySelector('.fallback-video');
      v.src = getVideo(Number(b.dataset.fbIdx));
      v.load();
      v.play().catch(() => {});
    });
  });
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
  hotspotMeshes.forEach((mesh, idx) => {
    const z = zoneData[idx];
    const g = buildingGeo[idx];
    const baseY = z.pos[1] + g.h / 2 + 0.35;
    mesh.position.y = baseY + Math.sin(t * 1.4 + idx) * 0.04;
    mesh.material.opacity = 0.25 + Math.sin(t * 1.8 + idx) * 0.08;
  });
  const pArr = particles.geometry.attributes.position.array;
  for (let i = 0; i < pArr.length; i += 3) {
    pArr[i + 1] += Math.sin(t + i * 0.01) * 0.0003;
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

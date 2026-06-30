import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const hotspots = [
  {
    title: 'Integración API REST',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    desc: 'Demo de integración con la API REST del producto. Endpoints, autenticación y respuestas.',
    snippet: `const api = new ProductAPI({ token: 'sk-xxx' });

// Listar recursos
const resources = await api.list({
  limit: 50,
  filter: { status: 'active' }
});

// Crear recurso
const created = await api.create({
  name: 'Mi proyecto',
  type: 'production'
});

console.log(created.id);`,
    sandbox: 'https://codesandbox.io/s/example',
    cam: [-2.2, 1.6, 2.2],
    look: [0, 0.6, 0],
    pos: [-1.2, 0.6, 0.8]
  },
  {
    title: 'Dashboard en tiempo real',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    desc: 'Visualiza métricas en vivo con el dashboard integrado. WebSockets y gráficos interactivos.',
    snippet: `import { Dashboard } from '@tech/dashboard';

const dash = new Dashboard('#mount', {
  theme: 'dark',
  refresh: 5000
});

dash.addChart('requests', {
  type: 'line',
  data: stream,
  options: { smoothing: true }
});

dash.on('point:click', (p) => {
  console.log('Selected:', p);
});`,
    sandbox: 'https://codesandbox.io/s/example',
    cam: [2.2, 1.6, 2.2],
    look: [0, 0.6, 0],
    pos: [1.2, 0.5, 0.9]
  },
  {
    title: 'Autenticación y permisos',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    desc: 'Flujo completo de autenticación: login, MFA, roles y permisos por recurso.',
    snippet: `const { Auth } = require('@tech/auth');

const session = await Auth.login({
  email: 'user@example.com',
  provider: 'oauth2'
});

// Verificar permiso
if (session.can('resources:write')) {
  await api.update(id, changes);
}

// MFA challenge
await Auth.verifyMFA(session, {
  code: userInput
});`,
    sandbox: 'https://codesandbox.io/s/example',
    cam: [0, 2.4, 3.0],
    look: [0, 0.6, 0],
    pos: [0, 0.65, 1.0]
  }
];

const hsCopy = document.getElementById('hs-copy');
const hsButtons = document.querySelectorAll('.hs-btn');
const fallbackBtn = document.getElementById('fallback-toggle');
const fallback = document.getElementById('fallback');
const dialog = document.getElementById('dialog');
const closeDialog = document.getElementById('close-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogVideo = document.getElementById('dialog-video');
const snippetCode = document.getElementById('snippet-code');
const snippetPre = document.getElementById('snippet-pre');
const copyBtn = document.getElementById('copy-snippet');
const sandboxLink = document.getElementById('sandbox-link');

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0c10);
scene.fog = new THREE.Fog(0x0a0c10, 4, 14);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.8, 4.5);

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
controls.minDistance = 2;
controls.target.set(0, 0.6, 0);
controls.enabled = false;

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const key = new THREE.DirectionalLight(0xf0e8e0, 1.2);
key.position.set(3, 6, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const fill = new THREE.DirectionalLight(0x4a9eff, 0.3);
fill.position.set(-3, 2, -3);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 0.2);
rim.position.set(0, -1, -3);
scene.add(rim);

const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x1a2230, roughness: 0.5, metalness: 0.3 });
const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.15, 32), pedestalMat);
pedestal.position.set(0, 0.05, 0);
pedestal.receiveShadow = true;
pedestal.castShadow = true;
scene.add(pedestal);

const productMat = new THREE.MeshStandardMaterial({
  color: 0x4a9eff, roughness: 0.2, metalness: 0.7,
  emissive: 0x1a4a8a, emissiveIntensity: 0.1
});
const productBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.35), productMat);
productBody.position.set(0, 0.3, 0);
productBody.castShadow = true;
scene.add(productBody);

const detailMat = new THREE.MeshStandardMaterial({ color: 0x2a3a5a, roughness: 0.4, metalness: 0.5 });
for (let i = 0; i < 4; i += 1) {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), detailMat);
  dot.position.set(-0.2 + i * 0.13, 0.3, 0.18);
  scene.add(dot);
}

const glowRing = new THREE.Mesh(
  new THREE.RingGeometry(0.45, 0.55, 48),
  new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
);
glowRing.position.set(0, 0.01, 0);
glowRing.rotation.x = -Math.PI / 2;
scene.add(glowRing);

const hsMeshes = [];
hotspots.forEach((hs, idx) => {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x4a9eff, emissive: 0x4a9eff, emissiveIntensity: 0.3, transparent: true, opacity: 0.8 })
  );
  sphere.position.set(hs.pos[0], hs.pos[1], hs.pos[2]);
  sphere.userData = { hsIndex: idx };
  scene.add(sphere);
  hsMeshes.push(sphere);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 24),
    new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
  );
  ring.position.copy(sphere.position);
  ring.lookAt(0, 0.6, 0);
  scene.add(ring);
});

const particlesGeo = new THREE.BufferGeometry();
const pCount = 120;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i += 1) {
  pPos[i * 3] = (Math.random() - 0.5) * 8;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 3 + 0.6;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ color: 0x6ab0ff, size: 0.02, transparent: true, opacity: 0.3 })
);
scene.add(particles);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function openHotspot(idx) {
  const hs = hotspots[idx];
  dialogTitle.textContent = hs.title;
  dialogVideo.src = hs.video;
  dialogVideo.load();
  snippetCode.textContent = hs.snippet;
  snippetPre.querySelector('code').textContent = hs.snippet;
  if (window.Prism) {
    snippetPre.innerHTML = `<code class="language-javascript">${Prism.highlight(hs.snippet, Prism.languages.javascript, 'javascript')}</code>`;
  }
  sandboxLink.href = hs.sandbox;
  hsCopy.textContent = `🎯 ${hs.title} — ${hs.desc}`;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    camera.position.set(...hs.cam);
    controls.target.set(...hs.look);
  } else {
    gsap.to(camera.position, { x: hs.cam[0], y: hs.cam[1], z: hs.cam[2], duration: 1.3, ease: 'power2.inOut' });
    gsap.to(controls.target, { x: hs.look[0], y: hs.look[1], z: hs.look[2], duration: 1.3, ease: 'power2.inOut' });
  }

  dialog.classList.remove('hidden');
}

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(hsMeshes);
  if (!hits.length) return;
  openHotspot(hits[0].object.userData.hsIndex);
});

hsButtons.forEach((btn) => {
  btn.addEventListener('click', () => openHotspot(Number(btn.dataset.hs)));
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

copyBtn.addEventListener('click', async () => {
  const text = hotspots.find((_, i) => document.querySelector(`[data-hs="${i}"]`) && dialogTitle.textContent === hotspots[i].title)
    ? hotspots.find((h) => h.title === dialogTitle.textContent)?.snippet
    : snippetCode.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = '✅ Copiado';
    setTimeout(() => { copyBtn.textContent = '📋 Copiar snippet'; }, 2000);
  } catch { }
});

window.addEventListener('keydown', (event) => {
  if (event.key >= '1' && event.key <= '3') openHotspot(Number(event.key) - 1);
});

function renderFallback() {
  fallback.innerHTML = '<h2>Tech demos — Versión 2D</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  hotspots.forEach((hs) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `
      <h3>${hs.title}</h3>
      <video controls preload="metadata" src="${hs.video}" crossorigin="anonymous">
        <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
      </video>
      <p>${hs.desc}</p>
      <pre><code class="language-javascript">${hs.snippet}</code></pre>
    `;
    grid.appendChild(card);
  });
  fallback.appendChild(grid);
  if (window.Prism) {
    requestAnimationFrame(() => Prism.highlightAllUnder(fallback));
  }
}

fallbackBtn.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
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
  hsMeshes.forEach((mesh, idx) => {
    const hs = hotspots[idx];
    mesh.position.y = hs.pos[1] + Math.sin(t * 1.5 + idx) * 0.04;
    const s = 1 + Math.sin(t * 2 + idx) * 0.1;
    mesh.scale.setScalar(s);
    mesh.material.emissiveIntensity = 0.2 + Math.sin(t * 2.5 + idx) * 0.15;
  });
  productBody.rotation.y = Math.sin(t * 0.3) * 0.15;
  glowRing.scale.setScalar(1 + Math.sin(t * 0.8) * 0.05);
  const pArr = particles.geometry.attributes.position.array;
  for (let i = 0; i < pArr.length; i += 3) {
    pArr[i + 1] += Math.sin(t + i * 0.01) * 0.0004;
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

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const videos = [
  document.getElementById('back-1'),
  document.getElementById('back-2'),
  document.getElementById('back-3')
];
videos.forEach((v) => v.play().catch(() => {}));

const garments = [
  { id: 'suit-arc', title: 'Arc Tailored Suit', collection: 'Runway Noir', video: videos[0], subtitle: 'Pattern cutting and hand-finished shoulder structure.', specs: 'Material: Wool blend · Colorway: Graphite / Pearl · Fit: Structured' },
  { id: 'dress-veil', title: 'Veil Column Dress', collection: 'Atelier Light', video: videos[1], subtitle: 'Draping process and movement tests under stage light.', specs: 'Material: Satin mesh · Colorway: Moon Silver · Fit: Fluid' },
  { id: 'coat-mono', title: 'Monolith Coat', collection: 'Urban Archive', video: videos[2], subtitle: 'Layered construction with matte textures and metallic details.', specs: 'Material: Technical wool · Colorway: Obsidian / Steel · Fit: Oversized' }
];

const playlistEl = document.getElementById('playlist');
const lookbookBtn = document.getElementById('lookbook-btn');
const editorBtn = document.getElementById('editor-btn');
const overlay = document.getElementById('overlay');
const closeOverlay = document.getElementById('close-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayVideo = document.getElementById('overlay-video');
const overlaySubtitle = document.getElementById('overlay-subtitle');
const overlaySpecs = document.getElementById('overlay-specs');
const hint = document.getElementById('hint');

let lookbook = false;
let editor = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1017);
scene.fog = new THREE.Fog(0x0c1017, 8, 34);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.2, 9.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
document.getElementById('scene-root').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.4, -2);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const key = new THREE.DirectionalLight(0xf1dfc5, 1.2);
key.position.set(5, 7, 6);
scene.add(key);

const runway = new THREE.Mesh(
  new THREE.BoxGeometry(2.5, 0.14, 14),
  new THREE.MeshStandardMaterial({ color: 0x252e3d, roughness: 0.34, metalness: 0.58 })
);
runway.position.y = 0.06;
runway.position.z = -1.8;
scene.add(runway);

const sceneFloor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), new THREE.MeshStandardMaterial({ color: 0x151c2a, roughness: 0.9 }));
sceneFloor.rotation.x = -Math.PI / 2;
sceneFloor.position.y = -0.45;
scene.add(sceneFloor);

const mannequins = [];
const garmentMeshes = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

for (let i = 0; i < 5; i += 1) {
  const model = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.25, 0.9, 4, 12),
    new THREE.MeshStandardMaterial({ color: 0xb9bcc7, roughness: 0.4, metalness: 0.35 })
  );
  model.position.set((i % 2 === 0 ? -0.4 : 0.4), 1, -6 + i * 2.4);
  scene.add(model);
  mannequins.push(model);
}

garments.forEach((garment, idx) => {
  const tex = new THREE.VideoTexture(garment.video);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.2, 0.15),
    new THREE.MeshPhysicalMaterial({ map: tex, color: 0xffffff, roughness: 0.3, metalness: 0.2, clearcoat: 0.8 })
  );
  mesh.position.set(-2.6 + idx * 2.6, 1.1, 1.8);
  mesh.userData.garment = garment;
  scene.add(mesh);
  garmentMeshes.push(mesh);
});

function renderPlaylist() {
  playlistEl.innerHTML = '';
  garments.forEach((garment) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'clip-btn';
    btn.innerHTML = `${garment.title}<span>${garment.collection}</span>`;
    btn.addEventListener('click', () => openGarment(garment));
    playlistEl.appendChild(btn);
  });
}

function openGarment(garment) {
  overlayTitle.textContent = garment.title;
  overlaySubtitle.textContent = garment.subtitle;
  overlaySpecs.textContent = garment.specs;
  overlayVideo.src = garment.video.src;
  overlay.classList.remove('hidden');
}

function closeGarment() {
  overlay.classList.add('hidden');
  overlayVideo.pause();
  overlayVideo.src = '';
}

renderer.domElement.addEventListener('mousemove', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(garmentMeshes);

  garmentMeshes.forEach((mesh) => {
    const hover = hits.length && hits[0].object === mesh;
    gsap.to(mesh.position, { y: hover ? 1.18 : 1.1, duration: 0.25, overwrite: true });
    gsap.to(mesh.scale, { x: hover ? 1.06 : 1, y: hover ? 1.06 : 1, z: hover ? 1.06 : 1, duration: 0.25, overwrite: true });
  });

  if (hits.length) {
    hint.textContent = `Swatches: Charcoal, Pearl, Steel · ${hits[0].object.userData.garment.title}`;
  } else {
    hint.textContent = 'Hover over a garment for swatches. Click to open backstage clip and specs.';
  }
});

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(garmentMeshes);
  if (!hits.length) return;

  const garment = hits[0].object.userData.garment;
  gsap.to(camera.position, { x: hits[0].object.position.x, y: 2, z: 4.2, duration: 0.8, ease: 'power2.out' });
  gsap.to(controls.target, { x: hits[0].object.position.x, y: 1.1, z: hits[0].object.position.z, duration: 0.8, ease: 'power2.out' });
  openGarment(garment);
});

lookbookBtn.addEventListener('click', () => {
  lookbook = !lookbook;
  lookbookBtn.textContent = lookbook ? 'Lookbook 360 On' : 'Modo lookbook';
});

editorBtn.addEventListener('click', () => {
  editor = !editor;
  editorBtn.textContent = editor ? 'Editor On' : 'Modo editor';
});

closeOverlay.addEventListener('click', closeGarment);
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closeGarment();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
  });
}, { threshold: 0.05 });
observer.observe(document.getElementById('scene-root'));

function animate() {
  const t = performance.now() * 0.001;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    mannequins.forEach((model, i) => {
      model.position.z = -6 + ((t * 1.4 + i * 2.2) % 12);
      model.rotation.y = Math.sin(t * 2 + i) * 0.1;
    });
    garmentMeshes.forEach((mesh, i) => {
      if (lookbook) mesh.rotation.y += 0.02;
      else mesh.rotation.y = Math.sin(t + i) * 0.08;
    });
    key.intensity = 1 + Math.sin(t * 2.6) * 0.2;
  }
  if (editor) {
    controls.target.x = Math.sin(t * 0.4) * 0.6;
  }
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderPlaylist();
animate();

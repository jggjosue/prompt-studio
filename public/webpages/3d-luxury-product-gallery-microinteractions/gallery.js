import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const products = [
  {
    id: 'aura-timepiece',
    title: 'Aura Timepiece',
    collection: 'heritage',
    material: 'titanium',
    year: '2026',
    video: document.getElementById('promo-1'),
    subtitle: 'Precision engineering meets heritage finishing.',
    copy: 'Limited titanium edition featuring ceramic inlays and hand-finished bezel.',
    specs: ['44mm case', 'Sapphire crystal', '72h reserve', 'Water resistant 100m']
  },
  {
    id: 'velour-sphere',
    title: 'Velour Sphere',
    collection: 'atelier',
    material: 'ceramic',
    year: '2025',
    video: document.getElementById('promo-2'),
    subtitle: 'A contemporary silhouette with rich ceramic depth.',
    copy: 'Studio-crafted composition with matte ceramic shell and mirror-polished structure.',
    specs: ['Dual texture shell', 'Low-reflection finish', 'Collector series']
  },
  {
    id: 'noir-capsule',
    title: 'Noir Capsule',
    collection: 'heritage',
    material: 'leather',
    year: '2024',
    video: document.getElementById('promo-3'),
    subtitle: 'Quiet luxury refined for daily ritual.',
    copy: 'Premium leather composition with brushed metallic frame and capsule profile.',
    specs: ['Hand-stitched leather', 'Brushed frame', 'Micrograin interior']
  }
];

products.forEach((p) => p.video.play().catch(() => {}));

const sceneRoot = document.getElementById('scene-root');
const breadcrumbs = document.getElementById('breadcrumbs');
const overlay = document.getElementById('overlay');
const closeOverlay = document.getElementById('close-overlay');
const specTitle = document.getElementById('spec-title');
const specVideo = document.getElementById('spec-video');
const subtitles = document.getElementById('subtitles');
const specCopy = document.getElementById('spec-copy');
const specList = document.getElementById('spec-list');
const toggleOverlayBtn = document.getElementById('toggle-overlay');
const collectionFilter = document.getElementById('filter-collection');
const materialFilter = document.getElementById('filter-material');
const yearFilter = document.getElementById('filter-year');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1219);
scene.fog = new THREE.Fog(0x0d1219, 8, 34);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.2, 9.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.03;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.target.set(0, 1.2, -0.6);

scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const key = new THREE.DirectionalLight(0xf0dbc0, 1.3);
key.position.set(5, 8, 6);
scene.add(key);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x151b25, roughness: 0.86, metalness: 0.18 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.5;
scene.add(floor);

const showcaseMeshes = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function makeShowcase(product, idx) {
  const group = new THREE.Group();
  const x = (idx - 1) * 3.5;
  group.position.set(x, 0, -1.4);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1.18, 0.9, 32),
    new THREE.MeshStandardMaterial({ color: 0x252f3f, roughness: 0.38, metalness: 0.6 })
  );
  pedestal.position.y = -0.05;

  const screenTex = new THREE.VideoTexture(product.video);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 1),
    new THREE.MeshStandardMaterial({ map: screenTex, emissive: 0x2f2f2f, emissiveIntensity: 0.2, metalness: 0.3, roughness: 0.4 })
  );
  screen.position.set(0, 1.2, 0.85);

  const productBody = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.45, 0.16, 120, 24, 2, 3),
    new THREE.MeshPhysicalMaterial({ color: 0xc6b18a, metalness: 0.88, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 })
  );
  productBody.position.set(0, 0.86, 0);

  group.add(pedestal, screen, productBody);
  group.userData = { product, pedestal, screen, productBody, active: true, baseX: x };
  scene.add(group);
  showcaseMeshes.push(group);
}

products.forEach(makeShowcase);

function openSpec(product) {
  specTitle.textContent = product.title;
  subtitles.textContent = product.subtitle;
  specCopy.textContent = product.copy;
  specList.innerHTML = '';
  product.specs.forEach((item) => {
    const p = document.createElement('div');
    p.className = 'spec-item';
    p.textContent = item;
    specList.appendChild(p);
  });
  specVideo.src = product.video.src;
  overlay.classList.remove('hidden');
  breadcrumbs.textContent = `Home / Collection / ${product.title}`;
}

function closeSpec() {
  overlay.classList.add('hidden');
  specVideo.pause();
  specVideo.src = '';
}

renderer.domElement.addEventListener('mousemove', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const allChildren = showcaseMeshes.flatMap((s) => s.children);
  const hits = raycaster.intersectObjects(allChildren);
  showcaseMeshes.forEach((showcase) => {
    const hovering = hits.some((hit) => showcase.children.includes(hit.object));
    gsap.to(showcase.userData.pedestal.position, { y: hovering ? 0.03 : -0.05, duration: 0.35, overwrite: true });
    gsap.to(showcase.userData.productBody.scale, { x: hovering ? 1.08 : 1, y: hovering ? 1.08 : 1, z: hovering ? 1.08 : 1, duration: 0.35, overwrite: true });
  });
});

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const allChildren = showcaseMeshes.flatMap((s) => s.children);
  const hits = raycaster.intersectObjects(allChildren);
  if (!hits.length) return;
  const showcase = showcaseMeshes.find((s) => s.children.includes(hits[0].object));
  if (showcase) {
    gsap.to(showcase.rotation, { y: showcase.rotation.y + 0.4, duration: 0.5, ease: 'power2.out' });
    openSpec(showcase.userData.product);
  }
});

function applyFilters() {
  const c = collectionFilter.value;
  const m = materialFilter.value;
  const y = yearFilter.value;
  let visibleIdx = 0;
  showcaseMeshes.forEach((showcase) => {
    const p = showcase.userData.product;
    const ok = (c === 'all' || p.collection === c) && (m === 'all' || p.material === m) && (y === 'all' || p.year === y);
    showcase.userData.active = ok;
    gsap.to(showcase.scale, { x: ok ? 1 : 0.01, y: ok ? 1 : 0.01, z: ok ? 1 : 0.01, duration: 0.45 });
    gsap.to(showcase.position, { x: ok ? (visibleIdx++ - 1) * 3.4 : showcase.userData.baseX, duration: 0.6, ease: 'power2.out' });
  });
}

collectionFilter.addEventListener('change', applyFilters);
materialFilter.addEventListener('change', applyFilters);
yearFilter.addEventListener('change', applyFilters);

closeOverlay.addEventListener('click', closeSpec);
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closeSpec();
});
toggleOverlayBtn.addEventListener('click', () => {
  overlay.classList.toggle('hidden');
});

const proxThreshold = 3.5;

function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.001;
  showcaseMeshes.forEach((showcase, index) => {
    if (!showcase.userData.active) return;
    const dist = camera.position.distanceTo(showcase.position);
    const near = dist < proxThreshold;
    showcase.userData.screen.material.emissiveIntensity = near ? 0.68 : 0.2;
    showcase.userData.screen.material.opacity = near ? 1 : 0.8;
    showcase.userData.productBody.rotation.y += near ? 0.015 : 0.004;
    if (near) showcase.userData.product.video?.play?.().catch(() => {});
    else showcase.userData.product.video?.pause?.();
    showcase.position.y = Math.sin(t + index * 0.7) * 0.03;
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

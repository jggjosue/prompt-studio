import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const details = {
  'Main Entrance': { title: 'Main Entrance', copy: 'A luminous arrival sequence with a framed canopy, guiding lines, and a premium first impression.', meta: 'Focus: Welcome court' },
  'Innovation Hub': { title: 'Innovation Hub', copy: 'Collaboration energy, research light, and a flexible lab edge for rapid experimentation.', meta: 'Focus: Research and prototype energy' },
  'Executive Offices': { title: 'Executive Offices', copy: 'Calm leadership floors above the campus core with privacy, clear views, and measured light.', meta: 'Focus: Leadership level' },
  'Event Auditorium': { title: 'Event Auditorium', copy: 'A polished destination for launches, briefings, and large-format storytelling.', meta: 'Focus: Event destination' },
  'Green Plaza': { title: 'Green Plaza', copy: 'Landscape-forward circulation, softer lighting, and an outdoor social center.', meta: 'Focus: Rest and circulation' },
  'Smart Parking': { title: 'Smart Parking', copy: 'Arrival guidance, clear wayfinding, and efficient night access.', meta: 'Focus: Visitor entry flow' },
  'Data Center': { title: 'Data Center', copy: 'Secure infrastructure with climate control, resilience, and visible operational confidence.', meta: 'Focus: Critical systems' },
  'Schedule Visit': { title: 'Schedule Visit', copy: 'A guided path toward a visit request, with fast contact and confirmation flow.', meta: 'Focus: Booking path' },
  'Cafeteria Premium': { title: 'Cafeteria Premium', copy: 'A warm hospitality zone with coffee, meals, and informal social breaks.' },
  'Fitness Studio': { title: 'Fitness Studio', copy: 'A wellness amenity that supports energy, recovery, and daily routine.' },
  'Wellness Room': { title: 'Wellness Room', copy: 'A quiet reset room for reflection, pause, or short private breaks.' },
  'View Access Flow': { title: 'Access Flow', copy: 'Smart badge entry, visitor check-in, and protected data zones working together.' },
  'AI Research Lab': { title: 'AI Research Lab', copy: 'Experimentation, model work, and analytics are coordinated inside one premium space.' },
  'Product Strategy Rooms': { title: 'Product Strategy Rooms', copy: 'Decision-making rooms that keep teams aligned on roadmap and priorities.' },
  'Prototype Studio': { title: 'Prototype Studio', copy: 'Physical and digital prototypes move quickly through a flexible making environment.' }
};

const focusPoints = [
  { name: 'Main Entrance', x: -2.8, y: 1.8, z: 8.2, look: [-1.2, 0.9, 0.2] },
  { name: 'Executive Offices', x: 2.8, y: 2.8, z: -1.5, look: [2.0, 1.2, -1.5] },
  { name: 'Innovation Hub', x: 0.2, y: 1.8, z: 0.5, look: [0.1, 0.9, 0.4] },
  { name: 'Event Auditorium', x: -3.8, y: 1.9, z: -0.5, look: [-3.1, 0.9, -0.4] },
  { name: 'Green Plaza', x: 0.3, y: 3.0, z: 6.8, look: [0.1, 0.7, 2.0] },
  { name: 'Smart Parking', x: 4.8, y: 2.6, z: 4.8, look: [3.4, 0.8, 2.8] },
  { name: 'Data Center', x: 4.8, y: 2.0, z: -3.5, look: [3.0, 0.8, -2.2] },
  { name: 'Schedule Visit', x: 0.3, y: 2.0, z: 7.5, look: [0.2, 0.9, 0.5] }
];

const canvas = document.getElementById('campus-canvas');
const hotspotList = document.getElementById('hotspot-list');
const hotspotTitle = document.getElementById('hotspot-title');
const hotspotCopy = document.getElementById('hotspot-copy');
const hotspotMeta = document.getElementById('hotspot-meta');
const modal = document.getElementById('detail-modal');
const modalTitle = document.getElementById('modal-title');
const modalCopy = document.getElementById('modal-copy');
const nav = document.getElementById('site-nav');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x07111d, 8, 28);
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(0, 2.4, 8.5);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI * 0.52;
controls.minPolarAngle = Math.PI * 0.28;
controls.minDistance = 5.5;
controls.maxDistance = 12;
controls.target.set(0, 0.9, 0);

const ambient = new THREE.AmbientLight(0x8ab6ff, 0.7);
scene.add(ambient);
const key = new THREE.DirectionalLight(0xffe0b0, 1.65);
key.position.set(-5, 9, 5);
scene.add(key);
const cyan = new THREE.PointLight(0x71d8ff, 4, 22);
cyan.position.set(-3, 3, 2);
scene.add(cyan);
const gold = new THREE.PointLight(0xf0c56b, 3.5, 20);
gold.position.set(3, 2.5, -1);
scene.add(gold);

const campus = new THREE.Group();
scene.add(campus);

function makeBuilding(w, h, d, color, x, z, emissive = 0x0b1624) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.45, emissive, emissiveIntensity: 0.12 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  campus.add(mesh);
  return mesh;
}

const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x07111d, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
campus.add(ground);

const plaza = new THREE.Mesh(new THREE.CircleGeometry(3.8, 40), new THREE.MeshStandardMaterial({ color: 0x12253a, roughness: 0.85, metalness: 0.1 }));
plaza.rotation.x = -Math.PI / 2;
plaza.position.y = 0.01;
campus.add(plaza);

makeBuilding(1.8, 2.3, 1.7, 0x1f3550, -2.8, 0.5);
makeBuilding(2.4, 3.6, 2.1, 0x243c5c, 2.7, -1.4);
makeBuilding(2.2, 2.4, 1.8, 0x20324b, 0.2, -0.8);
makeBuilding(2.6, 2.1, 1.4, 0x182b41, -4.0, -0.6);
makeBuilding(1.6, 2.5, 1.6, 0x16263a, 4.7, 4.1);
makeBuilding(2.2, 1.9, 2.2, 0x142638, 4.6, -3.8);

const path = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.12, 12, 60), new THREE.MeshStandardMaterial({ color: 0x71d8ff, emissive: 0x71d8ff, emissiveIntensity: 0.4, roughness: 0.2 }));
path.rotation.x = Math.PI / 2;
path.position.y = 0.05;
campus.add(path);

const trees = new THREE.Group();
for (let i = 0; i < 14; i += 1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0x4b3928 }));
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshStandardMaterial({ color: 0x2e5e4a, emissive: 0x163326, emissiveIntensity: 0.12 }));
  const angle = (i / 14) * Math.PI * 2;
  trunk.position.set(Math.cos(angle) * 5.4, 0.25, Math.sin(angle) * 5.4);
  leaf.position.set(trunk.position.x, 0.7, trunk.position.z);
  trees.add(trunk, leaf);
}
campus.add(trees);

const starCount = 300;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i += 1) {
  starPositions[i * 3] = (Math.random() - 0.5) * 24;
  starPositions[i * 3 + 1] = Math.random() * 8 + 1.5;
  starPositions[i * 3 + 2] = (Math.random() - 0.5) * 24;
}
const starfield = new THREE.Points(
  new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(starPositions, 3)),
  new THREE.PointsMaterial({ color: 0xb9d8ff, size: 0.03, transparent: true, opacity: 0.45 })
);
scene.add(starfield);

const hotspots = [];
focusPoints.forEach((point) => {
  const el = document.createElement('button');
  el.className = 'hotspot';
  el.textContent = point.name;
  el.dataset.focus = point.name;
  el.style.left = `${50 + point.x * 6}%`;
  el.style.top = `${52 - point.z * 2.5}%`;
  el.addEventListener('click', () => focusOn(point.name));
  hotspotList.appendChild(el);
  hotspots.push({ el, point });
});

function resize() {
  const rect = canvas.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);
}
window.addEventListener('resize', resize);
resize();

function showDetails(name) {
  const data = details[name] || { title: name, copy: 'A focused campus story point.', meta: 'Campus detail' };
  hotspotTitle.textContent = data.title;
  hotspotCopy.textContent = data.copy;
  hotspotMeta.textContent = data.meta || '';
  modalTitle.textContent = data.title;
  modalCopy.textContent = data.copy;
}

function openModal(name) {
  showDetails(name);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function focusOn(name) {
  const point = focusPoints.find((item) => item.name === name);
  if (!point) return;
  showDetails(name);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    camera.position.set(point.x, point.y, point.z);
    controls.target.set(point.look[0], point.look[1], point.look[2]);
  } else {
    gsap.to(camera.position, { x: point.x, y: point.y, z: point.z, duration: 1.2, ease: 'power2.inOut' });
    gsap.to(controls.target, { x: point.look[0], y: point.look[1], z: point.look[2], duration: 1.2, ease: 'power2.inOut' });
  }
  hotspots.forEach((item) => item.el.classList.toggle('active', item.point.name === name));
}

document.querySelectorAll('[data-focus], .zone-open, .innovation-open, .amenity-open').forEach((btn) => {
  btn.addEventListener('click', () => openModal(btn.dataset.focus || btn.dataset.zone || btn.dataset.innovation || btn.dataset.amenity));
});

document.getElementById('modal-close').addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (event) => { if (event.target === modal) modal.classList.remove('open'); });

document.getElementById('nav-toggle').addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  document.getElementById('nav-toggle').setAttribute('aria-expanded', String(opened));
});

document.getElementById('start-light-tour').addEventListener('click', () => focusOn('Main Entrance'));
document.getElementById('hero-start-tour').addEventListener('click', () => focusOn('Main Entrance'));
document.getElementById('view-access-flow').addEventListener('click', () => openModal('View Access Flow'));

document.querySelectorAll('.map-filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    document.querySelectorAll('.map-filter').forEach((item) => item.classList.remove('active'));
    btn.classList.add('active');
    const visual = document.querySelector('.map-visual');
    visual.className = `map-visual ${filter === 'all' ? '' : `filter-${filter}`}`;
  });
});

const visitForm = document.getElementById('visit-form');
visitForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const fd = new FormData(visitForm);
  const type = fd.get('type');
  const date = fd.get('date');
  const time = fd.get('time');
  const contact = fd.get('contact');
  const status = document.getElementById('visit-status');
  const summary = document.getElementById('visit-summary');
  if (!type || !date || !time || !contact) {
    status.textContent = 'Please complete all visit fields.';
    return;
  }
  const message = `Visit scheduled: ${type} on ${date} at ${time}. Contact: ${contact}.`;
  status.textContent = 'Visit request ready to send.';
  summary.textContent = message;
});

document.getElementById('contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const fd = new FormData(event.currentTarget);
  const values = ['name', 'email', 'company', 'interest', 'message'].map((key) => fd.get(key));
  const status = document.getElementById('contact-status');
  if (values.some((value) => !value)) {
    status.textContent = 'Please fill in every contact field.';
    return;
  }
  status.textContent = 'Thank you. Your request has been prepared for follow-up.';
});

document.querySelectorAll('.section').forEach((section) => section.setAttribute('data-fade', ''));
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('in'));
}, { threshold: 0.16 });
document.querySelectorAll('[data-fade]').forEach((item) => observer.observe(item));

function animate() {
  controls.update();
  campus.rotation.y = Math.sin(performance.now() * 0.0001) * 0.03;
  starfield.rotation.y += 0.00008;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
focusOn('Main Entrance');
animate();

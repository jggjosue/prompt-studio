import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const container = $('#canvas-container');
const nav = $('#site-nav');
const menuToggle = $('#menu-toggle');
const modal = $('#modal');
const modalTitle = $('#modal-title');
const modalBody = $('#modal-body');
const tooltip = $('#tooltip');
const progressFill = $('#progress-fill');
const streamStatus = $('#stream-status');
const viewerCount = $('#viewer-count');
const connectionState = $('#connection-state');
const selectionChip = $('#selection-chip');

function openModal(title, body) {
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

$$('[data-scroll]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelector(btn.dataset.scroll)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  nav.classList.remove('open');
}));

$$('[data-action="enter-room"]').forEach(btn => btn.addEventListener('click', () => {
  cameraTarget.copy(new THREE.Vector3(0, 1.3, 7));
  roomFocus = 'hero';
  openModal('Entering Streaming Room', 'The camera is now moving through the virtual conference room toward the main broadcast desk.');
}));

$('#modal-close')?.addEventListener('click', closeModal);
modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });

$$('.feature-card').forEach(btn => {
  btn.addEventListener('mouseenter', () => showTip(btn, `${btn.dataset.label}: premium interaction detail.`));
  btn.addEventListener('mouseleave', hideTip);
  btn.addEventListener('click', () => openModal(btn.dataset.label, `${btn.dataset.label} is active in the streaming room and ready for collaboration.`));
});

$$('.agenda-item').forEach(btn => btn.addEventListener('click', () => {
  activeSession = btn.dataset.session;
  openModal(btn.dataset.session, `Selected session: ${btn.dataset.session}. Add to calendar and view session details are confirmed.`);
}));

$$('.speaker-card button').forEach(btn => btn.addEventListener('click', e => {
  const speaker = e.currentTarget.closest('[data-speaker]').dataset.speaker;
  openModal(speaker, `${speaker} is now expanded with full profile details, talk topic, and session access.`);
}));

$$('.control-btn').forEach(btn => btn.addEventListener('click', () => {
  btn.classList.toggle('active');
  openModal(btn.dataset.control, `${btn.dataset.control} confirmed. The control surface has updated its visual state.`);
}));

$$('.choose-plan').forEach(btn => btn.addEventListener('click', () => {
  selectionChip.textContent = `Selected plan: ${btn.closest('.price-card').querySelector('h3').textContent}`;
  document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' });
}));

$('#analytics-more')?.addEventListener('click', () => openModal('Full Analytics', 'Expanded dashboard shows viewer retention, chat peaks, and replay performance across the event.'));

let playing = true;
let recording = false;
$('#play-toggle')?.addEventListener('click', e => {
  playing = !playing;
  e.currentTarget.textContent = playing ? 'Pause' : 'Play';
  streamStatus.textContent = playing ? 'LIVE' : 'PAUSED';
});
$('#record-toggle')?.addEventListener('click', e => {
  recording = !recording;
  e.currentTarget.textContent = recording ? 'Recording...' : 'Record Session';
  e.currentTarget.classList.toggle('recording', recording);
});
$('#ask-question')?.addEventListener('click', () => openModal('Ask Question', 'Mini form activated. Ask the production team anything about the live stream, agenda, or speakers.'));
$('#share-stream')?.addEventListener('click', () => openModal('Share Stream', 'Share confirmation shown. Stream link copied for invitees and presenters.'));

$('#register-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  if (![...form.values()].every(v => String(v).trim())) return openModal('Registration', 'Please complete all registration fields.');
  openModal('Registration Confirmed', `Thanks ${form.get('name')}. Your ${form.get('eventType')} demo request is confirmed.`);
  e.currentTarget.reset();
});
$('#contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  if (![...form.values()].every(v => String(v).trim())) return openModal('Contact Form', 'Please fill out every contact field before sending.');
  openModal('Request Sent', `Thanks ${form.get('name')}. We will reply about ${form.get('need')} shortly.`);
  e.currentTarget.reset();
});

function showTip(el, text) {
  tooltip.hidden = false;
  tooltip.textContent = text;
  const r = el.getBoundingClientRect();
  tooltip.style.left = `${Math.min(window.innerWidth - 280, r.left)}px`;
  tooltip.style.top = `${r.bottom + 12}px`;
}
function hideTip() { tooltip.hidden = true; }

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.18 });
$$('.reveal').forEach(el => io.observe(el));

// 3D scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x05070c, 8, 40);
scene.background = new THREE.Color(0x05070c);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = true;
controls.autoRotate = false;

scene.add(new THREE.AmbientLight(0x88aaff, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(5, 8, 5); scene.add(key);
const fill = new THREE.PointLight(0x61d7ff, 2.2, 50); fill.position.set(-4, 4, 6); scene.add(fill);
const live = new THREE.PointLight(0xff5b6e, 1.6, 30); live.position.set(0, 5, -4); scene.add(live);

const room = new THREE.Group();
scene.add(room);

const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 48), new THREE.MeshStandardMaterial({ color: 0x0c1220, roughness: 0.9, metalness: 0.15 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.75;
room.add(floor);

const table = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.8, 0.35, 10), new THREE.MeshStandardMaterial({ color: 0x20283d, metalness: 0.3, roughness: 0.45 }));
table.position.set(0, -1, 1);
room.add(table);

const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.6), new THREE.MeshStandardMaterial({ color: 0x0b1a32, emissive: 0x123d66, emissiveIntensity: 0.8 }));
screen.position.set(0, 2.4, -7);
room.add(screen);

const sideScreens = [new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x13213a, emissive: 0x19385c, emissiveIntensity: 0.6 })), new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x13213a, emissive: 0x19385c, emissiveIntensity: 0.6 }))];
sideScreens[0].position.set(-4.9, 1.4, -5.2); sideScreens[0].rotation.y = 0.5;
sideScreens[1].position.set(4.9, 1.4, -5.2); sideScreens[1].rotation.y = -0.5;
sideScreens.forEach(s => room.add(s));

const camGeo = new THREE.ConeGeometry(0.3, 1.1, 12);
const cameraRig = new THREE.Mesh(camGeo, new THREE.MeshStandardMaterial({ color: 0x1b2230, metalness: 0.4, roughness: 0.4 }));
cameraRig.rotation.x = Math.PI;
cameraRig.position.set(-2.5, 0.4, 3.8);
room.add(cameraRig);

const micGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.0, 10);
for (const x of [-1.2, 0, 1.2]) {
  const mic = new THREE.Mesh(micGeo, new THREE.MeshStandardMaterial({ color: 0x4d5a73, metalness: 0.35 }));
  mic.position.set(x, -0.45, 1.9);
  room.add(mic);
}

const spots = [
  { name: 'Live Broadcast', pos: [0, 2, -4] },
  { name: 'Speaker Panel', pos: [-4.7, 1.4, -4.8] },
  { name: 'Audience Chat', pos: [4.5, 1.1, -4.6] },
  { name: 'Stream Controls', pos: [0, 0.3, 3.4] },
  { name: 'Agenda Timeline', pos: [3.7, 0.2, 1.4] },
  { name: 'Analytics Dashboard', pos: [-3.6, 0.2, 1.4] },
  { name: 'Recording Mode', pos: [0, 3, 4.2] },
];
const hotspotMeshes = spots.map((spot, i) => {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x61d7ff : 0xff5b6e, emissive: 0x112233, emissiveIntensity: 2 }));
  mesh.position.set(...spot.pos);
  mesh.userData = spot;
  room.add(mesh);
  return mesh;
});

const cameraStops = {
  hero: new THREE.Vector3(0, 2.8, 14),
  room: new THREE.Vector3(0, 2.4, 10),
  demo: new THREE.Vector3(0, 2.1, 7),
  agenda: new THREE.Vector3(2.2, 1.6, 8),
  analytics: new THREE.Vector3(-2.4, 1.6, 8)
};
let roomFocus = 'hero';
let activeSession = 'Opening Stream';
const cameraTarget = new THREE.Vector3(0, 1.2, 0);

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const t = max > 0 ? scrollY / max : 0;
  const section = t < .14 ? 'hero' : t < .28 ? 'room' : t < .43 ? 'demo' : t < .56 ? 'agenda' : t < .72 ? 'analytics' : 'room';
  roomFocus = section;
  const target = cameraStops[section] || cameraStops.hero;
  camera.position.lerp(target, 0.06);
  cameraTarget.lerp(new THREE.Vector3(0, 1.2, 0), 0.06);
  progressFill.style.width = `${Math.min(100, 18 + t * 82)}%`;
  if (section === 'analytics') viewerCount.textContent = '3,250 viewers';
  streamStatus.textContent = playing ? 'LIVE' : 'PAUSED';
  connectionState.textContent = section === 'analytics' ? 'Analytics synced' : 'Stable connection';
});

$$('[data-hotspot]').forEach(el => {
  el.addEventListener('mouseenter', () => showTip(el, `${el.dataset.hotspot} hotspot active.`));
  el.addEventListener('mouseleave', hideTip);
  el.addEventListener('click', () => openModal(el.dataset.hotspot, `Hotspot detail for ${el.dataset.hotspot}.`));
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  room.rotation.y = Math.sin(t * 0.1) * 0.08;
  screen.scale.setScalar(1 + Math.sin(t * 1.2) * 0.015);
  sideScreens.forEach((s, i) => s.position.y = 1.4 + Math.sin(t * 1.5 + i) * 0.06);
  hotspotMeshes.forEach((m, i) => { m.position.y += Math.sin(t * 2 + i) * 0.001; m.scale.setScalar(1 + Math.sin(t * 2.5 + i) * 0.08); });
  camera.lookAt(cameraTarget);
  controls.update();
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

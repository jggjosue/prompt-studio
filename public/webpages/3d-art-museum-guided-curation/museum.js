import * as THREE from 'three';

const sceneRoot = document.getElementById('scene-root');
const nav = document.getElementById('primary-nav');
const navToggle = document.getElementById('nav-toggle');
const tourState = document.getElementById('tour-state');
const modal = document.getElementById('detail-modal');
const modalClose = document.getElementById('modal-close');
const modalKicker = document.getElementById('modal-kicker');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalMeta = document.getElementById('modal-meta');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const visitType = document.getElementById('visit-type');

const hotspotDetails = [
  {
    kicker: 'Artist',
    title: 'Lumen Archive',
    body: 'Elena Marquez layers amber light over slow-moving geometry to make the wall feel like a memory surface.',
    meta: {
      Artist: 'Elena Marquez',
      Collection: 'Light Installations',
      Year: '2026',
      'Curator Note': 'The work is placed early in the route so the visit begins with warmth before moving into shadow.'
    }
  },
  {
    kicker: 'Collection',
    title: 'Memory Atrium',
    body: 'A deep-blue abstraction anchors the second room and sets the tonal transition toward architecture and silence.',
    meta: {
      Artist: 'Theo Laurent',
      Collection: 'Architectural Dreams',
      Year: '2025',
      'Curator Note': 'The canvas sits slightly off-axis to reward slow scrolling and side glances.'
    }
  },
  {
    kicker: 'Curator Note',
    title: 'Echo Form',
    body: 'A reflective sculpture rotates gently in the center of the hall, gathering the room light as the camera passes.',
    meta: {
      Artist: 'Amara Voss',
      Collection: 'Digital Sculptures',
      Year: '2026',
      'Curator Note': 'The sculpture acts as the spatial hinge between the exhibition and collection rooms.'
    }
  }
];

const detailContent = {
  exhibition: {
    kicker: 'Featured Exhibition',
    title: 'Light, Form & Memory',
    body: 'This exhibition studies how digital rooms can hold emotional residue. Warm projections, reflective sculptures, and quiet architectural planes create a calm sequence of discovery.',
    meta: {
      Rooms: 'North Hall, Atrium, Projection Chamber',
      Duration: '42 minute guided route',
      Medium: '3D installation, generative image, spatial sculpture',
      'Curator Note': 'Designed to be experienced slowly, with each light shift revealing a new relationship between object and space.'
    }
  }
};

document.querySelectorAll('.collection-card').forEach((card) => {
  const title = card.dataset.collection;
  detailContent[title] = {
    kicker: 'Collection',
    title,
    body: `${title} is presented as a focused gallery room with staged lighting, interactive notes, and a camera path tuned to reveal depth through scroll.`,
    meta: {
      Artist: title === 'Digital Sculptures' ? 'Theo Laurent' : 'Museum 3D Studio',
      Collection: title,
      Year: '2026',
      'Curator Note': 'Open this collection during the guided tour to see how the camera path reframes the work.'
    }
  };
});

function openModal(content) {
  modalKicker.textContent = content.kicker;
  modalTitle.textContent = content.title;
  modalBody.textContent = content.body;
  modalMeta.innerHTML = Object.entries(content.meta).map(([term, desc]) => `<dt>${term}</dt><dd>${desc}</dd>`).join('');
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navToggle.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
  nav.classList.toggle('is-open');
});

nav.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }
});

document.querySelectorAll('[data-tour-start]').forEach((button) => {
  button.addEventListener('click', () => startGuidedTour());
});

document.querySelectorAll('[data-hotspot]').forEach((button) => {
  button.addEventListener('click', () => {
    openModal(hotspotDetails[Number(button.dataset.hotspot)]);
  });
});

document.querySelectorAll('[data-detail]').forEach((button) => {
  button.addEventListener('click', () => openModal(detailContent[button.dataset.detail]));
});

document.querySelectorAll('.collection-card .text-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.collection-card');
    openModal(detailContent[card.dataset.collection]);
  });
});

document.querySelectorAll('[data-plan]').forEach((button) => {
  button.addEventListener('click', () => {
    visitType.value = button.dataset.plan;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
    formStatus.textContent = `${button.dataset.plan} selected. Complete the form to request your visit.`;
  });
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const type = String(data.get('visit-type') || '').trim();
  const message = String(data.get('message') || '').trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !validEmail || !type || !message) {
    formStatus.textContent = 'Please complete every field with a valid email.';
    return;
  }

  contactForm.reset();
  formStatus.textContent = `Thank you, ${name}. Your ${type} request has been received.`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1018);
scene.fog = new THREE.Fog(0x0b1018, 5, 17);

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
camera.position.set(0, 1.35, 6.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneRoot.appendChild(renderer.domElement);

const target = new THREE.Vector3(0, 0.9, -2.5);
const currentTarget = target.clone();
const desiredCamera = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();
let tourActive = false;
let tourStart = 0;

const group = new THREE.Group();
scene.add(group);

const ambient = new THREE.HemisphereLight(0xf8f0dc, 0x1b2533, 1.1);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffeed2, 2.2);
keyLight.position.set(1.8, 4.6, 2.6);
keyLight.castShadow = true;
scene.add(keyLight);

const blueLight = new THREE.PointLight(0x6d8fc5, 1.1, 9);
blueLight.position.set(-3, 2.1, -4);
scene.add(blueLight);

const goldLight = new THREE.PointLight(0xd8ad62, 1.4, 8);
goldLight.position.set(3, 2.3, -6.5);
scene.add(goldLight);

const materials = {
  wall: new THREE.MeshStandardMaterial({ color: 0xe7dfd2, roughness: 0.78 }),
  floor: new THREE.MeshStandardMaterial({ color: 0x1a2028, roughness: 0.32, metalness: 0.28 }),
  trim: new THREE.MeshStandardMaterial({ color: 0xbaa063, roughness: 0.38, metalness: 0.42 }),
  frame: new THREE.MeshStandardMaterial({ color: 0x12161d, roughness: 0.42, metalness: 0.18 }),
  plinth: new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.7 })
};

const floor = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.08, 16), materials.floor);
floor.position.set(0, -0.06, -3.6);
floor.receiveShadow = true;
group.add(floor);

function addWall(width, height, depth, x, y, z) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials.wall);
  wall.position.set(x, y, z);
  wall.receiveShadow = true;
  wall.castShadow = true;
  group.add(wall);
  return wall;
}

addWall(0.12, 3.2, 15, -3.95, 1.55, -3.6);
addWall(0.12, 3.2, 15, 3.95, 1.55, -3.6);
addWall(7.8, 3.2, 0.12, 0, 1.55, -10.9);
addWall(7.8, 0.08, 15, 0, 3.12, -3.6);

for (let i = 0; i < 7; i += 1) {
  const z = 2.2 - i * 2.05;
  const rail = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.035, 0.035), materials.trim);
  rail.position.set(0, 2.94, z);
  group.add(rail);

  const lamp = new THREE.PointLight(0xffe4b8, 0.72, 3.4);
  lamp.position.set(i % 2 ? 2.65 : -2.65, 2.68, z - 0.45);
  group.add(lamp);
}

function artTexture(primary, secondary, accent, title) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 640);
  grad.addColorStop(0, primary);
  grad.addColorStop(0.54, secondary);
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 640);
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = i % 2 ? '#fff4d8' : '#10141d';
    ctx.beginPath();
    ctx.ellipse(110 + i * 41, 120 + Math.sin(i) * 90, 90, 24 + i * 6, i * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.72;
  ctx.strokeStyle = '#f1d58d';
  ctx.lineWidth = 7;
  ctx.strokeRect(42, 48, 428, 536);
  ctx.globalAlpha = 0.56;
  ctx.fillStyle = '#fffaf1';
  ctx.font = '600 28px serif';
  ctx.fillText(title, 54, 590);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addArtwork(x, z, side, colors, title) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.64, 0.12), materials.frame);
  frame.position.set(x, 1.42, z);
  frame.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
  frame.castShadow = true;
  group.add(frame);

  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 1.38),
    new THREE.MeshStandardMaterial({ map: artTexture(colors[0], colors[1], colors[2], title), roughness: 0.52 })
  );
  art.position.set(x + (side === 'left' ? 0.071 : -0.071), 1.42, z);
  art.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
  group.add(art);
}

addArtwork(-3.86, 1.0, 'left', ['#e2c56f', '#96404e', '#17243a'], 'Lumen');
addArtwork(3.86, -1.1, 'right', ['#e8e1d6', '#385d70', '#bf7d52'], 'Atrium');
addArtwork(-3.86, -4.0, 'left', ['#1d2534', '#d0b170', '#784a58'], 'Nocturne');
addArtwork(3.86, -6.4, 'right', ['#cdd5d4', '#243b58', '#cb9b4c'], 'Archive');

const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.72, 0.52, 48), materials.plinth);
plinth.position.set(0, 0.22, -3.2);
plinth.castShadow = true;
plinth.receiveShadow = true;
group.add(plinth);

const sculpture = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.42, 0.12, 128, 16),
  new THREE.MeshStandardMaterial({ color: 0xe8d2a3, roughness: 0.24, metalness: 0.58 })
);
sculpture.position.set(0, 0.92, -3.2);
sculpture.castShadow = true;
group.add(sculpture);

const floatingFrames = [];
for (let i = 0; i < 5; i += 1) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.92, 0.04),
    new THREE.MeshStandardMaterial({ color: i % 2 ? 0x32455e : 0xb68b45, roughness: 0.5, metalness: 0.2 })
  );
  mesh.position.set(-1.9 + i * 0.95, 1.72 + Math.sin(i) * 0.16, -7.6 - i * 0.28);
  mesh.rotation.y = -0.36 + i * 0.18;
  mesh.castShadow = true;
  floatingFrames.push(mesh);
  group.add(mesh);
}

const rooms = [
  { camera: [0, 1.35, 6.4], target: [0, 0.9, -1.5], label: 'Scroll to move through the gallery' },
  { camera: [-1.3, 1.42, 2.15], target: [-3.7, 1.35, 0.3], label: 'Room 01: warm light and first works' },
  { camera: [1.55, 1.48, -0.55], target: [3.65, 1.32, -1.1], label: 'Room 02: color, memory, and depth' },
  { camera: [0, 1.62, -2.2], target: [0, 0.9, -3.2], label: 'Atrium: Echo Form sculpture' },
  { camera: [-1.15, 1.55, -5.25], target: [-3.7, 1.34, -4.0], label: 'Collection corridor: modern abstractions' },
  { camera: [1.15, 1.55, -7.05], target: [1.1, 1.52, -8.2], label: 'Private route: floating frames' },
  { camera: [0, 1.72, -9.35], target: [0, 1.3, -10.7], label: 'Final room: book a guided visit' }
];

function lerpArray(a, b, t) {
  return a.map((value, index) => value + (b[index] - value) * t);
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
}

function updateDesiredCamera() {
  const progress = scrollProgress() * (rooms.length - 1);
  const index = Math.min(rooms.length - 2, Math.floor(progress));
  const local = progress - index;
  const eased = local * local * (3 - 2 * local);
  const from = rooms[index];
  const to = rooms[index + 1];
  const cameraPos = lerpArray(from.camera, to.camera, eased);
  const targetPos = lerpArray(from.target, to.target, eased);
  desiredCamera.set(...cameraPos);
  desiredTarget.set(...targetPos);
  tourState.textContent = rooms[Math.round(progress)]?.label || rooms[0].label;
}

function startGuidedTour() {
  tourActive = true;
  tourStart = performance.now();
  tourState.textContent = 'Guided tour in motion';
  document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
}

function resizeRenderer() {
  const rect = sceneRoot.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function updateParallax() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  document.querySelectorAll('.parallax-layer').forEach((layer) => {
    const rect = layer.getBoundingClientRect();
    const speed = Number(layer.dataset.speed || 0);
    const offset = (window.innerHeight / 2 - rect.top) * speed;
    layer.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

function animate(time) {
  if (tourActive) {
    const elapsed = time - tourStart;
    const duration = 9000;
    const progress = Math.min(1, elapsed / duration);
    window.scrollTo({ top: progress * (document.documentElement.scrollHeight - window.innerHeight), behavior: 'auto' });
    if (progress >= 1) {
      tourActive = false;
      tourState.textContent = 'Guided tour complete';
    }
  }

  updateDesiredCamera();
  updateParallax();
  const damp = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.065;
  camera.position.lerp(desiredCamera, damp);
  currentTarget.lerp(desiredTarget, damp);
  camera.lookAt(currentTarget);

  const t = time * 0.001;
  sculpture.rotation.x = t * 0.22;
  sculpture.rotation.y = t * 0.48;
  floatingFrames.forEach((mesh, index) => {
    mesh.position.y += Math.sin(t + index) * 0.0008;
    mesh.rotation.y += 0.0015;
  });
  keyLight.intensity = 1.8 + Math.sin(scrollProgress() * Math.PI) * 0.55;
  goldLight.intensity = 1.1 + Math.sin(t * 0.8) * 0.18;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeRenderer);
window.addEventListener('scroll', updateParallax, { passive: true });

resizeRenderer();
updateDesiredCamera();
camera.position.copy(desiredCamera);
currentTarget.copy(desiredTarget);
requestAnimationFrame(animate);

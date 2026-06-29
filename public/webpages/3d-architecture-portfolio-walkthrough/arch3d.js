const cameraViews = {
  gallery: { label: 'Gallery view', position: { x: 6.4, y: 4.1, z: 8.2 }, target: { x: 0, y: 1.15, z: 0 } },
  urban: { label: 'Urban model view', position: { x: -5.5, y: 5.1, z: 6.1 }, target: { x: -0.5, y: 1.25, z: -1.1 } },
  interior: { label: 'Interior view', position: { x: 3.8, y: 2.45, z: 3.7 }, target: { x: 1.05, y: 1.05, z: -1.4 } }
};

const projects = {
  villa: {
    label: 'Modern Villa',
    title: 'Modern Villa Visualization',
    point: { x: -2.8, y: 1.55, z: -0.35 },
    description: 'A private residence presentation focused on warm exterior light, pool reflections, glass volumes, and a calm arrival sequence.',
    scope: 'Exterior render set, sales hero frames, animated approach camera, landscaping context.',
    deliverables: '12 still renders, 45-second walkthrough, interactive hotspot model.',
    timeline: '4 weeks'
  },
  tower: {
    label: 'Urban Tower',
    title: 'Urban Tower Concept',
    point: { x: 0.1, y: 2.6, z: -1.65 },
    description: 'A mixed-use tower concept with facade rhythm studies, skyline context, public podium, and investor-ready night lighting.',
    scope: 'Urban massing, tower facade, podium studies, plaza visualization.',
    deliverables: 'Concept film, WebGL-style model, facade options, presentation images.',
    timeline: '6 weeks'
  },
  interior: {
    label: 'Luxury Interior',
    title: 'Luxury Interior Walkthrough',
    point: { x: 2.65, y: 1.34, z: -0.12 },
    description: 'A guided interior experience showing lobby, lounge, elevator arrival, furnishings, marble, bronze, and soft indirect light.',
    scope: 'Interior modeling, material palette, furniture staging, walkthrough camera.',
    deliverables: 'Interactive room tour, 16 still renders, material closeups.',
    timeline: '5 weeks'
  },
  center: {
    label: 'Cultural Center',
    title: 'Futuristic Cultural Center',
    point: { x: 0.62, y: 1.18, z: 1.92 },
    description: 'A sculptural civic proposal with atrium depth, plaza movement, floating roof planes, and cinematic dusk presentation.',
    scope: 'Concept geometry, public-space narrative, atrium lighting, exterior sequence.',
    deliverables: 'Short film, still renders, interactive concept model.',
    timeline: '7 weeks'
  }
};

const canvas = document.getElementById('arch-canvas');
const ctx = canvas.getContext('2d');
const shell = canvas.closest('.canvas-shell');
const statusEl = document.getElementById('scene-status');
const hotspotLayer = document.getElementById('hotspot-layer');
const startButtons = document.querySelectorAll('[data-start-walkthrough]');
const cameraButtons = document.querySelectorAll('[data-camera]');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const modal = document.getElementById('project-modal');
const modalClose = document.querySelector('.modal-close');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalScope = document.getElementById('modal-scope');
const modalDeliverables = document.getElementById('modal-deliverables');
const modalTimeline = document.getElementById('modal-timeline');
const modalRender = document.getElementById('modal-render');
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let width = 1;
let height = 1;
let dpr = 1;
let activeTween = null;
let dragState = null;
let camera = cloneCamera(cameraViews.gallery);
let walkthrough = { active: false, step: 0, timer: 0 };
let lastTime = performance.now();

const buildingMeshes = [
  cuboid('villa-base', -2.78, 0.25, -0.35, 2.45, 0.5, 1.65, '#d9d4c8', '#98958f'),
  cuboid('villa-glass', -3.1, 0.82, -0.5, 1.34, 0.7, 1.12, '#7ed0ff', '#275d78', 0.7),
  cuboid('villa-core', -2.05, 0.98, -0.16, 1.08, 1.0, 1.36, '#202b38', '#0f1720'),
  cuboid('villa-roof', -2.62, 1.58, -0.35, 2.9, 0.1, 1.95, '#d8bd78', '#8b713a'),
  cuboid('tower-a', -0.34, 1.78, -1.7, 0.84, 3.55, 0.84, '#73c9ff', '#1c5b7f', 0.72),
  cuboid('tower-b', 0.58, 1.26, -1.78, 0.72, 2.5, 0.72, '#1a2432', '#0c121b'),
  cuboid('tower-podium', 0.04, 0.58, -0.72, 1.0, 1.16, 1.4, '#d9d4c8', '#918f87'),
  cuboid('tower-plinth', 0.08, 0.12, -1.32, 2.22, 0.16, 1.86, '#d8bd78', '#8a6d34'),
  cuboid('interior-slab', 2.58, 0.68, -0.16, 1.95, 0.24, 1.2, '#d8bd78', '#8a6d34'),
  cuboid('interior-glass', 2.18, 1.1, -0.2, 1.36, 0.82, 0.92, '#8bd5ff', '#275e7d', 0.68),
  cuboid('interior-room', 3.1, 0.96, -0.05, 1.18, 0.56, 0.78, '#ded8ca', '#9d988f'),
  cuboid('center-base', 0.62, 0.22, 1.92, 2.0, 0.42, 1.46, '#d9d4c8', '#918f87'),
  cuboid('center-dome', 0.62, 0.8, 1.92, 1.55, 1.12, 1.12, '#72caff', '#255a78', 0.62)
];

const contextTowers = Array.from({ length: 26 }, (_, i) => {
  const angle = (i / 26) * Math.PI * 2;
  const radius = 7 + Math.sin(i * 1.71) * 0.75;
  const h = 0.55 + ((i * 37) % 140) / 52;
  return cuboid(
    `context-${i}`,
    Math.cos(angle) * radius,
    h / 2,
    Math.sin(angle) * radius - 0.35,
    0.25 + (i % 4) * 0.08,
    h,
    0.25 + (i % 3) * 0.08,
    i % 4 === 0 ? '#3f95bf' : '#172231',
    '#0b1018',
    i % 4 === 0 ? 0.45 : 1
  );
});

const planes = [
  { x: -4.8, y: 1.7, z: -3.7, w: 1.7, h: 1.08, color: 'rgba(64,183,255,.34)' },
  { x: 4.9, y: 1.55, z: -3.4, w: 1.7, h: 1.08, color: 'rgba(216,189,120,.32)' },
  { x: -4.7, y: 1.28, z: 2.7, w: 1.7, h: 1.08, color: 'rgba(216,189,120,.28)' },
  { x: 3.95, y: 2.15, z: 2.85, w: 1.7, h: 1.08, color: 'rgba(64,183,255,.3)' }
];

const hotspotButtons = Object.entries(projects).map(([id, project]) => {
  const button = document.createElement('button');
  button.className = 'hotspot';
  button.type = 'button';
  button.dataset.project = id;
  button.dataset.label = project.label;
  button.setAttribute('aria-label', `View details for ${project.title}`);
  button.addEventListener('click', () => openProject(id));
  hotspotLayer.appendChild(button);
  return { id, button, point: project.point };
});

function cloneCamera(view) {
  return {
    position: { ...view.position },
    target: { ...view.target }
  };
}

function cuboid(id, x, y, z, w, h, d, fill, shade, alpha = 1) {
  return { id, x, y, z, w, h, d, fill, shade, alpha };
}

function vecSub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vecAdd(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function vecScale(a, s) {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function normalize(a) {
  const len = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / len, y: a.y / len, z: a.z / len };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec(a, b, t) {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) };
}

function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function basis() {
  const forward = normalize(vecSub(camera.target, camera.position));
  const right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
  const up = normalize(cross(right, forward));
  return { forward, right, up };
}

function project(point) {
  const b = basis();
  const rel = vecSub(point, camera.position);
  const x = dot(rel, b.right);
  const y = dot(rel, b.up);
  const z = dot(rel, b.forward);
  if (z <= 0.08) return null;
  const focal = Math.min(width, height) * 0.96;
  return {
    x: width / 2 + (x / z) * focal,
    y: height / 2 - (y / z) * focal,
    z,
    scale: Math.max(0.3, Math.min(1.4, 8 / z))
  };
}

function resizeCanvas() {
  const rect = shell.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = Math.max(1, Math.floor(rect.width));
  height = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setStatus(text) {
  statusEl.textContent = text;
}

function tweenCamera(position, target, label) {
  activeTween = {
    fromPosition: { ...camera.position },
    fromTarget: { ...camera.target },
    position: { ...position },
    target: { ...target },
    start: performance.now(),
    duration: reduceMotion ? 1 : 1350,
    label
  };
  setStatus(label);
}

function drawBackground(time) {
  const sky = ctx.createLinearGradient(0, 0, width, height);
  sky.addColorStop(0, '#101b2a');
  sky.addColorStop(0.48, '#07101a');
  sky.addColorStop(1, '#03050a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 12; i += 1) {
    const x = (i / 11) * width;
    const pulse = Math.sin(time * 0.0008 + i) * 18;
    const grad = ctx.createLinearGradient(x, 0, x + pulse, height);
    grad.addColorStop(0, 'rgba(64,183,255,.18)');
    grad.addColorStop(1, 'rgba(216,189,120,.04)');
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - width * 0.18 + pulse, height);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFloor() {
  const corners = [
    project({ x: -8, y: 0, z: -5.5 }),
    project({ x: 8, y: 0, z: -5.5 }),
    project({ x: 8, y: 0, z: 5.8 }),
    project({ x: -8, y: 0, z: 5.8 })
  ];
  if (corners.some((p) => !p)) return;
  ctx.fillStyle = '#0a111c';
  polygon(corners, true);

  ctx.strokeStyle = 'rgba(64,183,255,.16)';
  ctx.lineWidth = 1;
  for (let x = -8; x <= 8; x += 0.75) {
    line3d({ x, y: 0.01, z: -5.5 }, { x, y: 0.01, z: 5.8 });
  }
  for (let z = -5.5; z <= 5.8; z += 0.75) {
    line3d({ x: -8, y: 0.01, z }, { x: 8, y: 0.01, z });
  }
}

function line3d(a, b) {
  const pa = project(a);
  const pb = project(b);
  if (!pa || !pb) return;
  ctx.beginPath();
  ctx.moveTo(pa.x, pa.y);
  ctx.lineTo(pb.x, pb.y);
  ctx.stroke();
}

function polygon(points, fill = false) {
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  if (fill) ctx.fill();
  ctx.stroke();
}

function cuboidCorners(item) {
  const x0 = item.x - item.w / 2;
  const x1 = item.x + item.w / 2;
  const y0 = item.y - item.h / 2;
  const y1 = item.y + item.h / 2;
  const z0 = item.z - item.d / 2;
  const z1 = item.z + item.d / 2;
  return [
    { x: x0, y: y0, z: z0 },
    { x: x1, y: y0, z: z0 },
    { x: x1, y: y1, z: z0 },
    { x: x0, y: y1, z: z0 },
    { x: x0, y: y0, z: z1 },
    { x: x1, y: y0, z: z1 },
    { x: x1, y: y1, z: z1 },
    { x: x0, y: y1, z: z1 }
  ];
}

function drawCuboid(item) {
  const corners = cuboidCorners(item).map(project);
  if (corners.some((p) => !p)) return;
  const faces = [
    { ids: [0, 1, 2, 3], color: item.shade },
    { ids: [1, 5, 6, 2], color: item.fill },
    { ids: [4, 5, 6, 7], color: item.fill },
    { ids: [3, 2, 6, 7], color: lighten(item.fill, 24) },
    { ids: [0, 4, 7, 3], color: item.shade }
  ];

  ctx.save();
  ctx.globalAlpha = item.alpha;
  faces
    .map((face) => ({ ...face, z: face.ids.reduce((sum, id) => sum + corners[id].z, 0) / face.ids.length }))
    .sort((a, b) => b.z - a.z)
    .forEach((face) => {
      ctx.fillStyle = face.color;
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      polygon(face.ids.map((id) => corners[id]), true);
    });
  ctx.restore();
}

function lighten(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((value >> 16) & 255) + amount);
  const g = Math.min(255, ((value >> 8) & 255) + amount);
  const b = Math.min(255, (value & 255) + amount);
  return `rgb(${r},${g},${b})`;
}

function drawPlanes(time) {
  planes.forEach((plane, idx) => {
    const bob = Math.sin(time * 0.001 + idx) * 0.08;
    const p = project({ x: plane.x, y: plane.y + bob, z: plane.z });
    if (!p) return;
    const w = plane.w * p.scale * 70;
    const h = plane.h * p.scale * 70;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(time * 0.0006 + idx) * 0.08);
    ctx.strokeStyle = plane.color;
    ctx.fillStyle = plane.color.replace(')', ', .14)').replace('rgba', 'rgba');
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-w * 0.32, -h * 0.28 + i * h * 0.13);
      ctx.lineTo(w * (0.28 - i * 0.025), -h * 0.28 + i * h * 0.13);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawHotspotGuides(time) {
  Object.values(projects).forEach((project, idx) => {
    const p = projectPointPulse(project.point, time, idx);
    if (!p) return;
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#40b7ff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 16 + Math.sin(time * 0.004 + idx) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

function projectPointPulse(point, time, idx) {
  return project({ x: point.x, y: point.y + Math.sin(time * 0.002 + idx) * 0.04, z: point.z });
}

function updateHotspots(time) {
  const rect = shell.getBoundingClientRect();
  hotspotButtons.forEach(({ button, point }, idx) => {
    const p = projectPointPulse(point, time, idx);
    const visible = p && p.x > -20 && p.x < rect.width + 20 && p.y > -20 && p.y < rect.height + 20;
    button.style.transform = visible ? `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)` : 'translate(-999px, -999px)';
    button.style.opacity = visible ? '1' : '0';
    button.style.pointerEvents = visible ? 'auto' : 'none';
  });
}

function draw(time) {
  drawBackground(time);
  drawFloor();
  drawPlanes(time);

  [...contextTowers, ...buildingMeshes]
    .map((item) => ({ item, distance: Math.hypot(item.x - camera.position.x, item.y - camera.position.y, item.z - camera.position.z) }))
    .sort((a, b) => b.distance - a.distance)
    .forEach(({ item }) => drawCuboid(item));

  drawHotspotGuides(time);
  const vignette = ctx.createRadialGradient(width / 2, height * 0.42, width * 0.1, width / 2, height / 2, width * 0.72);
  vignette.addColorStop(0, 'rgba(255,255,255,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,.46)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function updateTween() {
  if (!activeTween) return;
  const t = Math.min(1, (performance.now() - activeTween.start) / activeTween.duration);
  const eased = ease(t);
  camera.position = lerpVec(activeTween.fromPosition, activeTween.position, eased);
  camera.target = lerpVec(activeTween.fromTarget, activeTween.target, eased);
  if (t >= 1) {
    setStatus(activeTween.label);
    activeTween = null;
  }
}

function updateWalkthrough(delta) {
  if (!walkthrough.active || activeTween) return;
  walkthrough.timer += delta;
  if (walkthrough.timer < 1.15) return;
  walkthrough.timer = 0;
  walkthrough.step += 1;

  const order = ['villa', 'tower', 'interior', 'center'];
  const positions = [
    { x: -4.7, y: 2.75, z: 4.4 },
    { x: -1.4, y: 4.55, z: 5.05 },
    { x: 4.35, y: 2.35, z: 3.15 },
    { x: 3.7, y: 2.85, z: -3.75 }
  ];

  if (walkthrough.step >= order.length) {
    walkthrough.active = false;
    startButtons.forEach((button) => { button.textContent = 'Start Walkthrough'; });
    setStatus('Walkthrough complete');
    return;
  }

  const project = projects[order[walkthrough.step]];
  tweenCamera(positions[walkthrough.step], project.point, project.title);
}

function render(now) {
  const delta = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!activeTween && !dragState && !walkthrough.active && !reduceMotion) {
    const drift = Math.sin(now * 0.00022) * 0.002;
    camera.position.x += drift;
  }
  updateTween();
  updateWalkthrough(delta);
  draw(now);
  updateHotspots(now);
  requestAnimationFrame(render);
}

function activateCamera(name) {
  const view = cameraViews[name];
  if (!view) return;
  walkthrough.active = false;
  startButtons.forEach((button) => { button.textContent = 'Start Walkthrough'; });
  cameraButtons.forEach((button) => button.classList.toggle('active', button.dataset.camera === name));
  tweenCamera(view.position, view.target, view.label);
}

function startWalkthrough() {
  document.getElementById('walkthrough').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  walkthrough = { active: true, step: 0, timer: 0 };
  startButtons.forEach((button) => { button.textContent = 'Walkthrough Active'; });
  tweenCamera({ x: -4.7, y: 2.75, z: 4.4 }, projects.villa.point, projects.villa.title);
}

function openProject(id) {
  const project = projects[id];
  if (!project) return;
  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;
  modalScope.textContent = project.scope;
  modalDeliverables.textContent = project.deliverables;
  modalTimeline.textContent = project.timeline;
  modalRender.className = `modal-render modal-${id}`;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  tweenCamera(vecAdd(project.point, { x: 2.35, y: 1.35, z: 3.05 }), project.point, project.title);
}

function closeProject() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

startButtons.forEach((button) => button.addEventListener('click', startWalkthrough));
cameraButtons.forEach((button) => button.addEventListener('click', () => activateCamera(button.dataset.camera)));
document.querySelectorAll('[data-project]').forEach((button) => button.addEventListener('click', () => openProject(button.dataset.project)));

modalClose.addEventListener('click', closeProject);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeProject();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeProject();
});

canvas.addEventListener('pointerdown', (event) => {
  dragState = { x: event.clientX, y: event.clientY, start: cloneCamera({ position: camera.position, target: camera.target }) };
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (!dragState) return;
  const dx = (event.clientX - dragState.x) / Math.max(1, width);
  const dy = (event.clientY - dragState.y) / Math.max(1, height);
  const offset = vecSub(dragState.start.position, dragState.start.target);
  const radius = Math.hypot(offset.x, offset.z);
  const angle = Math.atan2(offset.z, offset.x) + dx * Math.PI * 1.35;
  camera.position.x = dragState.start.target.x + Math.cos(angle) * radius;
  camera.position.z = dragState.start.target.z + Math.sin(angle) * radius;
  camera.position.y = Math.max(1.4, Math.min(6.8, dragState.start.position.y + dy * 5));
  activeTween = null;
  walkthrough.active = false;
});

canvas.addEventListener('pointerup', () => {
  dragState = null;
});

menuToggle.addEventListener('click', () => {
  const open = !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});

mobileNav.querySelectorAll('a, button').forEach((item) => {
  item.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input, select, textarea')];
  let valid = true;
  fields.forEach((field) => {
    const fieldValid = field.checkValidity();
    field.classList.toggle('field-error', !fieldValid);
    if (!fieldValid) valid = false;
  });

  if (!valid) {
    formStatus.textContent = 'Please complete all fields with a valid email.';
    return;
  }

  form.reset();
  formStatus.textContent = 'Message sent. The studio will respond with a visualization plan.';
});

form.querySelectorAll('input, select, textarea').forEach((field) => {
  field.addEventListener('input', () => field.classList.remove('field-error'));
});

resizeCanvas();
new ResizeObserver(resizeCanvas).observe(shell);
requestAnimationFrame(render);

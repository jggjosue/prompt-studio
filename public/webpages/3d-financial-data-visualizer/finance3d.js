import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('scene');
const widgetList = document.getElementById('widget-list');
const tableBody = document.getElementById('kpi-table-body');
const insightTitle = document.getElementById('insight-title');
const insightText = document.getElementById('insight-text');
const insightVideo = document.getElementById('insight-video');
const timeline = document.getElementById('timeline');
const splitBtn = document.getElementById('toggle-split');

const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const kpis = [
  { id: 'revenue', label: 'Revenue', current: 18.4, previous: 16.2, unit: 'M', color: 0x6ab0ff, insight: 'Revenue climbs due to enterprise expansion and stronger renewals.' },
  { id: 'margin', label: 'Gross Margin', current: 67.5, previous: 63.1, unit: '%', color: 0x67da9f, insight: 'Margin rises from infrastructure efficiencies and better deal mix.' },
  { id: 'opex', label: 'Operating Cost', current: 5.8, previous: 6.3, unit: 'M', color: 0xffb56a, insight: 'Operating costs decline while customer support automation improves.' },
  { id: 'cashflow', label: 'Free Cash Flow', current: 4.2, previous: 2.9, unit: 'M', color: 0xa68eff, insight: 'Cash flow improves as collection cycles shorten over two quarters.' }
];

const narrativeMoments = [
  { t: 0.08, text: 'Opening context: baseline trends and macro adjustments.' },
  { t: 0.26, text: 'Revenue widget enters focus and compares Q/Q movement.' },
  { t: 0.48, text: 'Margin narrative overlays efficiency factors in operations.' },
  { t: 0.68, text: 'Cost controls animate with a restrained burn-rate profile.' },
  { t: 0.88, text: 'Closing outlook aligns cash generation and strategic runway.' }
];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);
scene.fog = new THREE.Fog(0x0b1220, 8, 36);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.2, 13);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 24;
controls.minDistance = 7;
controls.target.set(0, 1.8, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.45));

const keyLight = new THREE.DirectionalLight(0xaed1ff, 1.3);
keyLight.position.set(8, 10, 10);
scene.add(keyLight);

const rim = new THREE.PointLight(0x6ab0ff, 42, 25, 2);
rim.position.set(-4, 2, 3);
scene.add(rim);

const plane = new THREE.Mesh(
  new THREE.CircleGeometry(10, 64),
  new THREE.MeshStandardMaterial({ color: 0x111a2a, roughness: 0.8, metalness: 0.2 })
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1.45;
scene.add(plane);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(4.9, 0.06, 24, 80),
  new THREE.MeshBasicMaterial({ color: 0x4c6f9e, transparent: true, opacity: 0.58 })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = -0.88;
scene.add(ring);

const widgets = [];
const bars = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let activeKpiId = null;
let splitView = false;

function kpiDelta(kpi) {
  return (((kpi.current - kpi.previous) / kpi.previous) * 100).toFixed(1);
}

function formatValue(kpi, value) {
  return `${value.toFixed(1)}${kpi.unit}`;
}

function createWidgets() {
  const radius = 3.9;
  const geo = new THREE.BoxGeometry(1.35, 1, 1.35);

  kpis.forEach((kpi, idx) => {
    const material = new THREE.MeshStandardMaterial({
      color: 0x182236,
      emissive: new THREE.Color(kpi.color).multiplyScalar(0.18),
      metalness: 0.45,
      roughness: 0.33
    });

    const mesh = new THREE.Mesh(geo, material);
    const angle = (idx / kpis.length) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * radius, 0.45, Math.sin(angle) * radius);
    mesh.userData = { kpiId: kpi.id, baseY: mesh.position.y, angle };
    scene.add(mesh);
    widgets.push(mesh);

    const barGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 24);
    const barMat = new THREE.MeshStandardMaterial({ color: kpi.color, emissive: kpi.color, emissiveIntensity: 0.2 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(mesh.position.x, -0.8, mesh.position.z);
    scene.add(bar);
    bars.push({ mesh: bar, kpi });
  });
}

function renderWidgetsUI() {
  widgetList.innerHTML = '';
  tableBody.innerHTML = '';

  kpis.forEach((kpi) => {
    const delta = Number(kpiDelta(kpi));
    const cls = delta >= 0 ? 'up' : 'down';

    const btn = document.createElement('button');
    btn.className = 'widget-item';
    btn.type = 'button';
    btn.dataset.id = kpi.id;
    btn.innerHTML = `
      <span class="kpi-name">${kpi.label}</span>
      <span class="kpi-val">${formatValue(kpi, kpi.current)}</span>
      <span class="kpi-delta ${cls}">${delta >= 0 ? '+' : ''}${delta}% vs prev</span>
    `;
    btn.addEventListener('click', () => selectWidget(kpi.id));
    widgetList.appendChild(btn);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${kpi.label}</td>
      <td>${formatValue(kpi, kpi.current)}</td>
      <td>${formatValue(kpi, kpi.previous)}</td>
      <td>${delta >= 0 ? '+' : ''}${delta}%</td>
    `;
    tableBody.appendChild(row);
  });
}

function setActiveUI(kpiId) {
  document.querySelectorAll('.widget-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.id === kpiId);
  });
}

function selectWidget(kpiId) {
  activeKpiId = kpiId;
  const kpi = kpis.find((item) => item.id === kpiId);
  if (!kpi) return;

  insightTitle.textContent = `${kpi.label} Insight`;
  insightText.textContent = kpi.insight;
  setActiveUI(kpiId);

  const focusWidget = widgets.find((w) => w.userData.kpiId === kpiId);
  if (focusWidget && !isReducedMotion) {
    controls.target.lerp(focusWidget.position, 0.22);
  }

  if (insightVideo.paused) {
    insightVideo.play().catch(() => {});
  }
}

function scrubData(percent) {
  bars.forEach(({ mesh, kpi }, i) => {
    const value = kpi.previous + (kpi.current - kpi.previous) * percent;
    const h = Math.max(0.35, (value / 20) * 6.2);
    mesh.scale.y = h;
    mesh.position.y = -0.8 + h / 2;

    const wobble = Math.sin(percent * Math.PI * 5 + i) * 0.07;
    if (!isReducedMotion) {
      mesh.rotation.z = wobble;
    }
  });
}

function syncTimelineFromVideo() {
  if (!Number.isFinite(insightVideo.duration) || insightVideo.duration <= 0) return;
  const ratio = insightVideo.currentTime / insightVideo.duration;
  timeline.value = String(ratio * 100);
  scrubData(ratio);
  updateNarrativeText(ratio);
}

function updateNarrativeText(ratio) {
  let msg = narrativeMoments[0].text;
  for (const item of narrativeMoments) {
    if (ratio >= item.t) msg = item.text;
  }
  if (!activeKpiId) {
    insightText.textContent = msg;
  }
}

function handlePointerSelect(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(widgets);
  if (!hit.length) return;

  selectWidget(hit[0].object.userData.kpiId);
}

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;

  widgets.forEach((mesh, idx) => {
    const offset = idx * 0.6;
    const floatY = Math.sin(time * 1.6 + offset) * 0.18;
    mesh.position.y = mesh.userData.baseY + floatY;
    mesh.rotation.y += 0.0045;

    if (activeKpiId === mesh.userData.kpiId) {
      mesh.scale.lerp(new THREE.Vector3(1.18, 1.18, 1.18), 0.08);
    } else {
      mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
    }
  });

  ring.rotation.z += 0.002;
  controls.update();

  if (splitView) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setScissorTest(true);

    renderer.setViewport(0, 0, width / 2, height);
    renderer.setScissor(0, 0, width / 2, height);
    camera.position.x = -2.4;
    renderer.render(scene, camera);

    renderer.setViewport(width / 2, 0, width / 2, height);
    renderer.setScissor(width / 2, 0, width / 2, height);
    camera.position.x = 2.4;
    renderer.render(scene, camera);

    camera.position.x = 0;
    renderer.setScissorTest(false);
  } else {
    renderer.render(scene, camera);
  }
}

splitBtn.addEventListener('click', () => {
  splitView = !splitView;
  splitBtn.textContent = `Split Camera: ${splitView ? 'On' : 'Off'}`;
});

timeline.addEventListener('input', () => {
  const ratio = Number(timeline.value) / 100;
  if (Number.isFinite(insightVideo.duration) && insightVideo.duration > 0) {
    insightVideo.currentTime = ratio * insightVideo.duration;
  }
  scrubData(ratio);
  updateNarrativeText(ratio);
});

insightVideo.addEventListener('timeupdate', syncTimelineFromVideo);
renderer.domElement.addEventListener('click', handlePointerSelect);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

fetch('assets/financial-dataset.json')
  .then((res) => res.json())
  .then((data) => {
    if (!Array.isArray(data.kpis)) return;
    data.kpis.forEach((incoming) => {
      const target = kpis.find((k) => k.id === incoming.id);
      if (!target) return;
      target.current = Number(incoming.current ?? target.current);
      target.previous = Number(incoming.previous ?? target.previous);
    });
    renderWidgetsUI();
    scrubData(0);
  })
  .catch(() => {
    renderWidgetsUI();
    scrubData(0);
  });

createWidgets();
renderWidgetsUI();
scrubData(0);
animate();

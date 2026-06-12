import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const lessonVideo = document.getElementById('lesson-video');
const subtitle = document.getElementById('subtitle');
const massInput = document.getElementById('mass');
const frictionInput = document.getElementById('friction');
const resultEl = document.getElementById('result');
const exportBtn = document.getElementById('export-json');
const fallbackBtn = document.getElementById('btn-fallback');
const fallback = document.getElementById('fallback');

const cues = [
  { t: 0.08, text: 'Setup: object release and baseline state.' },
  { t: 0.26, text: 'Force vector introduced with synchronized motion.' },
  { t: 0.52, text: 'Friction comparison and damping behavior.' },
  { t: 0.78, text: 'Challenge mode: optimize mass and friction.' }
];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d121a);
scene.fog = new THREE.Fog(0x0d121a, 8, 34);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.4, 8.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('scene-root').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, -1.1);

scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const key = new THREE.DirectionalLight(0xe9ddc8, 1.25);
key.position.set(4, 8, 6);
scene.add(key);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshStandardMaterial({ color: 0x151c28, roughness: 0.9 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.4;
scene.add(floor);

const instrument = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), new THREE.MeshStandardMaterial({ color: 0xc6b48d, metalness: 0.62, roughness: 0.28 }));
instrument.position.set(0, 0.65, -1);
scene.add(instrument);

const ramp = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 1.4), new THREE.MeshStandardMaterial({ color: 0x2d3749, roughness: 0.45 }));
ramp.position.set(0, 0.2, -1.2);
ramp.rotation.z = -0.18;
scene.add(ramp);

const worker = new Worker('assets/sim-worker.js');
let simState = { velocity: 0.62, energy: 0.48 };

worker.onmessage = (event) => {
  simState = event.data;
  resultEl.textContent = `Result: velocity ${simState.velocity.toFixed(2)} m/s · energy ${simState.energy.toFixed(2)} J`;
};

function runSandbox() {
  worker.postMessage({
    mass: Number(massInput.value),
    friction: Number(frictionInput.value) / 100,
    seed: 42
  });
}

massInput.addEventListener('input', runSandbox);
frictionInput.addEventListener('input', runSandbox);

document.querySelectorAll('.speed-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const speed = Number(btn.dataset.speed);
    lessonVideo.playbackRate = speed;
  });
});

lessonVideo.addEventListener('timeupdate', () => {
  if (!Number.isFinite(lessonVideo.duration) || lessonVideo.duration <= 0) return;
  const ratio = lessonVideo.currentTime / lessonVideo.duration;
  let line = cues[0].text;
  cues.forEach((cue) => {
    if (ratio >= cue.t) line = cue.text;
  });
  subtitle.textContent = line;
  const targetX = -1.8 + ratio * 3.6;
  gsap.to(instrument.position, { x: targetX, duration: 0.12, overwrite: true });
});

exportBtn.addEventListener('click', () => {
  const payload = {
    mass: Number(massInput.value),
    friction: Number(frictionInput.value),
    playbackRate: lessonVideo.playbackRate,
    state: simState,
    seed: 42
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'session-parameters.json';
  a.click();
  URL.revokeObjectURL(url);
});

function renderFallback() {
  fallback.innerHTML = '<h2>Static 2D Fallback</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  const card = document.createElement('article');
  card.className = 'fallback-card';
  card.innerHTML = `
    <h3>Full Lesson Video</h3>
    <video controls playsinline preload="metadata" src="${lessonVideo.querySelector('source').src}"></video>
    <p>Transcript available: synchronized experiment setup, force cues, friction comparison, and challenge solution.</p>
    <a href="assets/transcript.txt" download>Download Transcript</a>
  `;
  grid.appendChild(card);
  fallback.appendChild(grid);
}

fallbackBtn.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
  fallbackBtn.textContent = hidden ? 'Hide 2D Fallback' : '2D Fallback';
});

renderFallback();
runSandbox();

function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.001;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    instrument.rotation.y += 0.016 * lessonVideo.playbackRate;
    instrument.position.y = 0.65 + Math.sin(t * 2.4) * 0.04;
  }
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const video = document.getElementById('film-video');
const playBtn = document.getElementById('play-toggle');
const modeBtn = document.getElementById('mode-toggle');
const fallbackBtn = document.getElementById('fallback-toggle');
const scrubber = document.getElementById('scrubber');
const subtitle = document.getElementById('subtitle');
const chaptersEl = document.getElementById('chapters');
const fallback = document.getElementById('fallback');

const chapterData = [
  { id: 'cap1', title: 'Prologue', start: 0.0, end: 0.25, cameraCue: [-2.8, 2.5, 8.3], lightingCue: 0.9, particleCue: 0.25, note: 'Opening narrative establishes the atmosphere.' },
  { id: 'cap2', title: 'Conflict', start: 0.25, end: 0.5, cameraCue: [2.4, 1.9, 6.6], lightingCue: 1.2, particleCue: 0.55, note: 'Tension rises while light contrast sharpens.' },
  { id: 'cap3', title: 'Reveal', start: 0.5, end: 0.75, cameraCue: [0.4, 3.1, 5.2], lightingCue: 1.45, particleCue: 0.9, note: 'Visual reveal with peak particle activity.' },
  { id: 'cap4', title: 'Resolve', start: 0.75, end: 1.0, cameraCue: [0, 2.3, 7.4], lightingCue: 1.0, particleCue: 0.4, note: 'Resolution and softer fade-out composition.' }
];

let cinematicMode = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1019);
scene.fog = new THREE.Fog(0x0a1019, 8, 34);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.3, 8.4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.getElementById('scene-root').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, -1.4);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const key = new THREE.DirectionalLight(0xf5d9b2, 1.1);
key.position.set(4, 7, 5);
scene.add(key);

const panelGeo = new THREE.PlaneGeometry(2.5, 1.4);
const tex = new THREE.VideoTexture(video);
tex.colorSpace = THREE.SRGBColorSpace;
const panel = new THREE.Mesh(panelGeo, new THREE.MeshStandardMaterial({ map: tex, emissive: 0x111111, emissiveIntensity: 0.35 }));
panel.position.set(0, 1.4, -2.4);
scene.add(panel);

const floor = new THREE.Mesh(new THREE.CircleGeometry(8.5, 64), new THREE.MeshStandardMaterial({ color: 0x182132, roughness: 0.88, metalness: 0.15 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.4;
scene.add(floor);

const particlesGeo = new THREE.BufferGeometry();
const count = 220;
const pos = new Float32Array(count * 3);
for (let i = 0; i < count; i += 1) {
  pos[i * 3] = (Math.random() - 0.5) * 8;
  pos[i * 3 + 1] = Math.random() * 3;
  pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const particles = new THREE.Points(particlesGeo, new THREE.PointsMaterial({ color: 0xdcc7a3, size: 0.038, transparent: true, opacity: 0.55 }));
scene.add(particles);

function renderChapters() {
  chaptersEl.innerHTML = '';
  chapterData.forEach((chapter, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chap-btn${idx === 0 ? ' active' : ''}`;
    btn.textContent = chapter.title;
    btn.addEventListener('click', () => jumpToChapter(idx));
    chaptersEl.appendChild(btn);
  });
}

function setActiveChapter(idx) {
  document.querySelectorAll('.chap-btn').forEach((btn, i) => btn.classList.toggle('active', i === idx));
}

function applyChapterCue(chapter) {
  if (!chapter) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    camera.position.set(...chapter.cameraCue);
  } else {
    gsap.to(camera.position, { x: chapter.cameraCue[0], y: chapter.cameraCue[1], z: chapter.cameraCue[2], duration: 1.1, ease: 'power2.out' });
  }
  renderer.toneMappingExposure = chapter.lightingCue;
  particles.material.opacity = 0.35 + chapter.particleCue * 0.35;
  subtitle.textContent = chapter.note;
}

function jumpToChapter(idx) {
  const chapter = chapterData[idx];
  setActiveChapter(idx);
  if (Number.isFinite(video.duration) && video.duration > 0) {
    video.currentTime = chapter.start * video.duration;
  }
  applyChapterCue(chapter);
}

video.addEventListener('timeupdate', () => {
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;
  const ratio = video.currentTime / video.duration;
  scrubber.value = String(ratio * 100);

  let idx = 0;
  chapterData.forEach((chapter, i) => {
    if (ratio >= chapter.start) idx = i;
  });
  setActiveChapter(idx);
  applyChapterCue(chapterData[idx]);
});

scrubber.addEventListener('input', () => {
  const ratio = Number(scrubber.value) / 100;
  if (Number.isFinite(video.duration) && video.duration > 0) {
    video.currentTime = ratio * video.duration;
  }
});

playBtn.addEventListener('click', () => {
  if (video.paused) {
    video.play().catch(() => {});
    playBtn.textContent = 'Pause';
  } else {
    video.pause();
    playBtn.textContent = 'Play';
  }
});

modeBtn.addEventListener('click', () => {
  cinematicMode = !cinematicMode;
  modeBtn.textContent = cinematicMode ? 'Modo Cinematico' : 'Modo Explorador';
  controls.enabled = !cinematicMode;
});

function renderFallback() {
  fallback.innerHTML = `
    <h3>Linear Short Film Fallback</h3>
    <video controls preload="metadata" src="${video.querySelector('source').src}"></video>
    <p>Transcript and chapter notes are available for accessibility and review.</p>
    <a href="assets/transcript.txt" download>Download transcript</a>
  `;
}

fallbackBtn.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
  fallbackBtn.textContent = hidden ? 'Hide Fallback' : 'Fallback 2D';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
  });
}, { threshold: 0.05 });
observer.observe(document.getElementById('scene-root'));

function animate() {
  const t = performance.now() * 0.001;
  if (cinematicMode && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    camera.position.x = Math.sin(t * 0.22) * 2.8;
    camera.position.z = 7 + Math.cos(t * 0.18) * 1.2;
    camera.lookAt(0, 1.2, -2.2);
  }
  const arr = particles.geometry.attributes.position.array;
  for (let i = 1; i < arr.length; i += 3) {
    arr[i] += Math.sin(t + i * 0.01) * 0.0008;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  panel.rotation.y = Math.sin(t * 0.45) * 0.08;
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderChapters();
renderFallback();
animate();

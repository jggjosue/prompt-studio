import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const bgVideo = document.getElementById('bg-video');
const playBtn = document.getElementById('play-toggle');
const exportBtn = document.getElementById('export-frame');
const fallbackBtn = document.getElementById('fallback-toggle');
const fallback = document.getElementById('fallback');
const scrubber = document.getElementById('scrubber');
const freqIndicator = document.getElementById('freq-indicator');
const moodBtns = document.querySelectorAll('.mood-btn');
const stemBtns = document.querySelectorAll('.stem-btn');

let currentMood = 'calm';
let currentStem = 0;
let isPlaying = false;

const letterData = [
  { char: 'T', x: -2.6, y: 0.6 + Math.random() * 0.8, z: -0.6, h: 0.7, w: 0.45, freqBand: 0 },
  { char: 'Y', x: -1.6, y: 0.3 + Math.random() * 0.8, z: -0.3, h: 0.6, w: 0.4, freqBand: 1 },
  { char: 'P', x: -0.6, y: 0.5 + Math.random() * 0.8, z: 0, h: 0.65, w: 0.4, freqBand: 2 },
  { char: 'O', x: 0.4, y: 0.4 + Math.random() * 0.8, z: 0.1, h: 0.6, w: 0.4, freqBand: 0 },
  { char: 'G', x: 1.4, y: 0.7 + Math.random() * 0.8, z: -0.2, h: 0.65, w: 0.4, freqBand: 1 },
  { char: 'R', x: 2.4, y: 0.3 + Math.random() * 0.8, z: -0.5, h: 0.6, w: 0.4, freqBand: 2 },
  { char: 'A', x: -2.0, y: -0.4 + Math.random() * 0.6, z: -1.2, h: 0.5, w: 0.35, freqBand: 0 },
  { char: 'P', x: -1.0, y: -0.2 + Math.random() * 0.6, z: -1.0, h: 0.55, w: 0.35, freqBand: 1 },
  { char: 'H', x: 0, y: -0.3 + Math.random() * 0.6, z: -0.9, h: 0.5, w: 0.35, freqBand: 2 },
  { char: 'Y', x: 1.0, y: -0.1 + Math.random() * 0.6, z: -1.1, h: 0.5, w: 0.35, freqBand: 0 },
];

function makeLetterTexture(ch, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  ctx.font = 'bold 80px Fraunces, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ch, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080b12);
scene.fog = new THREE.Fog(0x080b12, 5, 16);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 5.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 10;
controls.minDistance = 2;
controls.target.set(0, 0.3, -0.4);
controls.enabled = false;

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const key = new THREE.DirectionalLight(0xf0e0d0, 1.4);
key.position.set(3, 6, 4);
scene.add(key);
const rim = new THREE.DirectionalLight(0xb88ad4, 0.6);
rim.position.set(-3, 2, -4);
scene.add(rim);

const bgMat = new THREE.MeshStandardMaterial({ color: 0x0a0e18, roughness: 0.9 });
const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.6), bgMat);
bgPlane.position.set(0, 0.3, -2.8);
scene.add(bgPlane);

const videoTex = new THREE.VideoTexture(bgVideo);
videoTex.colorSpace = THREE.SRGBColorSpace;
const screenMat = new THREE.MeshStandardMaterial({ map: videoTex, emissive: 0x222233, emissiveIntensity: 0.3 });
const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.6), screenMat);
screen.position.set(0, 0.3, -2.75);
scene.add(screen);

const letters = [];
const baseColors = [0x88aadd, 0xddaa88, 0x88ddaa, 0xdd88aa, 0xaadd88, 0xaa88dd];

letterData.forEach((ld, idx) => {
  const color = baseColors[idx % baseColors.length];
  const tex = makeLetterTexture(ld.char, color);
  const mat = new THREE.MeshStandardMaterial({
    map: tex, roughness: 0.25, metalness: 0.65,
    emissive: new THREE.Color(color), emissiveIntensity: 0.08
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(ld.w, ld.h, 0.08), mat);
  mesh.position.set(ld.x, ld.y, ld.z);
  mesh.castShadow = true;
  mesh.userData = {
    baseY: ld.y, baseX: ld.x, baseZ: ld.z,
    freqBand: ld.freqBand, rotSpeed: 0.3 + Math.random() * 0.5,
    floatOff: Math.random() * Math.PI * 2
  };
  scene.add(mesh);
  letters.push(mesh);

  const glowMat = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.08, side: THREE.DoubleSide
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(ld.w + 0.08, ld.h + 0.08), glowMat);
  glow.position.set(ld.x, ld.y, ld.z - 0.05);
  scene.add(glow);
});

const particlesGeo = new THREE.BufferGeometry();
const pCount = 200;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i += 1) {
  pPos[i * 3] = (Math.random() - 0.5) * 10;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 4 + 1;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ color: 0xccb8e8, size: 0.025, transparent: true, opacity: 0.4 })
);
scene.add(particles);

let audioCtx = null;
let analyser = null;
let source = null;
let frequencyData = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  frequencyData = new Uint8Array(analyser.frequencyCount);
  source = audioCtx.createMediaElementSource(bgVideo);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function getAudioLevels() {
  if (!analyser) return { avg: 0.3, band: 0.3 };
  analyser.getByteFrequencyData(frequencyData);
  let sum = 0;
  for (let i = 0; i < frequencyData.length; i += 1) sum += frequencyData[i];
  const avg = sum / frequencyData.length / 255;
  const band = frequencyData.length > 4
    ? (frequencyData[4] + frequencyData[5] + frequencyData[6]) / 3 / 255
    : avg;
  return { avg, band };
}

function setMood(mood) {
  currentMood = mood;
  moodBtns.forEach((b) => b.classList.toggle('active', b.dataset.mood === mood));
}

function setStem(idx) {
  currentStem = idx;
  stemBtns.forEach((b) => b.classList.toggle('active', Number(b.dataset.stem) === idx));
  const stems = [
    { playbackRate: 1, detune: 0 },
    { playbackRate: 1.15, detune: -200 },
    { playbackRate: 0.9, detune: 200 },
    { playbackRate: 1.05, detune: -400 }
  ];
  const s = stems[idx];
  bgVideo.playbackRate = s.playbackRate;
  if (source && audioCtx) {
    try { source.detune.value = s.detune; } catch {}
  }
}

playBtn.addEventListener('click', async () => {
  if (isPlaying) {
    bgVideo.pause();
    playBtn.textContent = 'Play';
    isPlaying = false;
    return;
  }
  try {
    await bgVideo.play();
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
    playBtn.textContent = 'Pause';
    isPlaying = true;
  } catch {}
});

bgVideo.addEventListener('timeupdate', () => {
  if (Number.isFinite(bgVideo.duration) && bgVideo.duration > 0) {
    scrubber.value = String((bgVideo.currentTime / bgVideo.duration) * 100);
  }
});

scrubber.addEventListener('input', () => {
  if (Number.isFinite(bgVideo.duration) && bgVideo.duration > 0) {
    bgVideo.currentTime = (Number(scrubber.value) / 100) * bgVideo.duration;
  }
});

moodBtns.forEach((btn) => btn.addEventListener('click', () => setMood(btn.dataset.mood)));
stemBtns.forEach((btn) => btn.addEventListener('click', () => setStem(Number(btn.dataset.stem))));

exportBtn.addEventListener('click', () => {
  renderer.render(scene, camera);
  const link = document.createElement('a');
  link.download = `typography-frame-${Date.now()}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
});

function renderFallback() {
  fallback.innerHTML = `
    <h3>Cinematic Typography Show — Fallback 2D</h3>
    <video class="fallback-video" controls preload="metadata" src="${bgVideo.querySelector('source').src}" crossorigin="anonymous">
      <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
    </video>
    <p style="margin-top:.5rem;color:var(--muted);font-size:.8rem">Mood presets and audio stem selection available in the 3D version.</p>
    <a href="assets/transcript.txt" download style="color:var(--accent);font-size:.8rem">📝 Transcript</a>
  `;
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
  const levels = getAudioLevels();
  const amp = levels.avg;
  const band = levels.band;

  const moodMul = currentMood === 'energetic' ? 1.8 : 0.6;
  const freqBandMap = [band * moodMul, levels.avg * moodMul, band * moodMul * 0.8];

  letters.forEach((mesh, idx) => {
    const ud = mesh.userData;
    const fb = freqBandMap[ud.freqBand] || 0.3;
    const float = Math.sin(t * ud.rotSpeed + ud.floatOff) * 0.03;
    const reactY = fb * 0.25;
    const reactS = 1 + fb * 0.3;
    mesh.position.y = ud.baseY + float + reactY;
    mesh.position.x = ud.baseX + Math.sin(t * ud.rotSpeed * 0.5 + ud.floatOff) * 0.02;
    mesh.scale.setScalar(reactS);
    mesh.rotation.z = Math.sin(t * ud.rotSpeed * 0.3 + ud.floatOff) * fb * 0.15;
    mesh.material.emissiveIntensity = 0.06 + fb * 0.3;
  });

  const bgOpacity = Math.min(0.2 + amp * 0.4, 0.6);
  screenMat.emissiveIntensity = 0.2 + amp * 0.5;
  videoTex.needsUpdate = true;

  const pArr = particles.geometry.attributes.position.array;
  for (let i = 0; i < pArr.length; i += 3) {
    pArr[i + 1] += Math.sin(t + i * 0.01) * (0.0006 + amp * 0.001);
    pArr[i] += Math.sin(t * 0.5 + i * 0.02) * (0.0004 + band * 0.001);
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.material.opacity = 0.3 + amp * 0.3;
  particles.material.size = 0.02 + band * 0.03;

  const hue = 0.75 + amp * 0.08 + (currentMood === 'energetic' ? 0.05 : 0);
  renderer.toneMappingExposure = 0.9 + amp * 0.3;
  key.intensity = 1.2 + amp * 0.4;

  freqIndicator.textContent = `🎵 Frecuencia: ${(band * 100).toFixed(0)}% | Amplitud: ${(amp * 100).toFixed(0)}%`;

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

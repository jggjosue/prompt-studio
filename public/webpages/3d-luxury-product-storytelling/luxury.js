import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const root = document.getElementById('scene-root');
const videoEl = document.getElementById('story-video');
const playBtn = document.getElementById('play-story');
const chaptersEl = document.getElementById('chapters');
const scrub = document.getElementById('story-scrub');
const subtitleEl = document.getElementById('subtitle');
const notesEl = document.getElementById('tech-notes');
const fallbackBtn = document.getElementById('toggle-fallback');
const fallbackView = document.getElementById('fallback-view');
const transcriptEl = document.getElementById('transcript');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const storyData = {
  chapters: [
    { id: 'intro', label: 'Arrival', start: 0.0, cam: [0, 1.9, 8.6], look: [0, 0.6, 0] },
    { id: 'craft', label: 'Craft', start: 0.24, cam: [2.6, 1.4, 5.8], look: [0.6, 0.5, 0] },
    { id: 'detail', label: 'Detail', start: 0.53, cam: [-2.7, 1.1, 5.1], look: [-0.4, 0.7, 0.1] },
    { id: 'finale', label: 'Finale', start: 0.8, cam: [0, 2.3, 7.6], look: [0, 0.65, 0] }
  ],
  subtitles: [
    { at: 0.08, text: 'A silhouette appears, composed under cinematic light.' },
    { at: 0.27, text: 'Brushed metal and polished glass reveal artisanal precision.' },
    { at: 0.56, text: 'Technical harmony: engineered structure with refined balance.' },
    { at: 0.82, text: 'The final statement: quiet luxury, deliberate presence.' }
  ],
  notes: [
    'Material stack: dual-layer PBR with controlled roughness shift.',
    'Pedestal shading: warm key light and cool rim to emphasize contour.',
    'Story sync: chapter camera cues mapped to video timeline percentages.',
    'Particles: low-density motes for atmosphere without visual noise.'
  ],
  transcript: [
    'Arrival: A calm reveal introduces the product over a matte pedestal.',
    'Craft: Light sweeps across precision finishes and engineered geometry.',
    'Detail: Focus narrows to material transitions and technical integrity.',
    'Finale: The scene opens again for a composed premium closing frame.'
  ]
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0c10);
scene.fog = new THREE.Fog(0x0b0c10, 8, 28);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.9, 8.6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
root.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.target.set(0, 0.6, 0);
controls.maxDistance = 12;
controls.minDistance = 4.4;

scene.add(new THREE.AmbientLight(0xffffff, 0.32));

const key = new THREE.SpotLight(0xffe6bb, 85, 30, Math.PI / 7, 0.4, 2);
key.position.set(2.8, 6.4, 3.2);
key.target.position.set(0, 0.4, 0);
scene.add(key, key.target);

const rim = new THREE.PointLight(0x8fa8ff, 24, 18, 2);
rim.position.set(-3.2, 1.4, -1.8);
scene.add(rim);

const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(1.8, 2.2, 0.9, 44),
  new THREE.MeshStandardMaterial({ color: 0x15171d, metalness: 0.45, roughness: 0.38 })
);
pedestal.position.y = -0.48;
scene.add(pedestal);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(7.2, 72),
  new THREE.MeshStandardMaterial({ color: 0x101216, roughness: 0.88, metalness: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.94;
scene.add(floor);

const videoTexture = new THREE.VideoTexture(videoEl);
videoTexture.colorSpace = THREE.SRGBColorSpace;

const luxuryProduct = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.68, 0.24, 220, 22, 2, 3),
  new THREE.MeshPhysicalMaterial({
    color: 0xb59a6d,
    metalness: 1,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.2
  })
);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.2, 0.03, 16, 120),
  new THREE.MeshStandardMaterial({ map: videoTexture, emissive: 0x7d5f35, emissiveIntensity: 0.35, metalness: 0.8, roughness: 0.36 })
);
ring.rotation.x = Math.PI / 2;

luxuryProduct.add(body, ring);
luxuryProduct.position.y = 0.43;
scene.add(luxuryProduct);

const particleCount = 180;
const particlesGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i += 1) {
  positions[i * 3] = (Math.random() - 0.5) * 9;
  positions[i * 3 + 1] = Math.random() * 4;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 9;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMat = new THREE.PointsMaterial({ color: 0xe9d8bb, size: 0.04, transparent: true, opacity: 0.55 });
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

let activeChapter = 0;
let isPlaying = false;

function renderNotes() {
  notesEl.innerHTML = '';
  storyData.notes.forEach((note) => {
    const li = document.createElement('li');
    li.textContent = note;
    notesEl.appendChild(li);
  });
}

function renderTranscript() {
  transcriptEl.innerHTML = storyData.transcript.map((line) => `<p>${line}</p>`).join('');
}

function renderChapters() {
  chaptersEl.innerHTML = '';
  storyData.chapters.forEach((chapter, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chapter-btn${idx === activeChapter ? ' active' : ''}`;
    btn.textContent = chapter.label;
    btn.addEventListener('click', () => jumpToChapter(idx));
    chaptersEl.appendChild(btn);
  });
}

function setActiveChapter(index) {
  activeChapter = index;
  document.querySelectorAll('.chapter-btn').forEach((el, idx) => {
    el.classList.toggle('active', idx === index);
  });
}

function moveCamera(chapter) {
  if (reduceMotion) {
    camera.position.set(chapter.cam[0], chapter.cam[1], chapter.cam[2]);
    controls.target.set(chapter.look[0], chapter.look[1], chapter.look[2]);
    return;
  }
  gsap.to(camera.position, {
    x: chapter.cam[0], y: chapter.cam[1], z: chapter.cam[2], duration: 1.7, ease: 'power2.inOut'
  });
  gsap.to(controls.target, {
    x: chapter.look[0], y: chapter.look[1], z: chapter.look[2], duration: 1.7, ease: 'power2.inOut'
  });
}

function jumpToChapter(index) {
  const chapter = storyData.chapters[index];
  setActiveChapter(index);
  moveCamera(chapter);

  if (Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
    videoEl.currentTime = chapter.start * videoEl.duration;
  }
}

function pickSubtitle(ratio) {
  let current = storyData.subtitles[0]?.text || '';
  storyData.subtitles.forEach((item) => {
    if (ratio >= item.at) {
      current = item.text;
    }
  });
  subtitleEl.textContent = current;
}

function syncFromVideo() {
  if (!Number.isFinite(videoEl.duration) || videoEl.duration <= 0) return;
  const ratio = videoEl.currentTime / videoEl.duration;
  scrub.value = String(ratio * 100);
  pickSubtitle(ratio);

  let chapterIndex = 0;
  storyData.chapters.forEach((chapter, idx) => {
    if (ratio >= chapter.start) chapterIndex = idx;
  });
  if (chapterIndex !== activeChapter) {
    setActiveChapter(chapterIndex);
  }
}

playBtn.addEventListener('click', () => {
  if (videoEl.paused) {
    videoEl.play().catch(() => {});
    playBtn.textContent = 'Pause Story';
    isPlaying = true;
  } else {
    videoEl.pause();
    playBtn.textContent = 'Play Story';
    isPlaying = false;
  }
});

scrub.addEventListener('input', () => {
  const ratio = Number(scrub.value) / 100;
  if (Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
    videoEl.currentTime = ratio * videoEl.duration;
  }
  pickSubtitle(ratio);
});

fallbackBtn.addEventListener('click', () => {
  const willShow = fallbackView.classList.contains('hidden');
  fallbackView.classList.toggle('hidden');
  fallbackBtn.textContent = willShow ? 'Hide 2D Story' : 'Show 2D Story';
});

videoEl.addEventListener('timeupdate', syncFromVideo);
videoEl.addEventListener('ended', () => {
  playBtn.textContent = 'Play Story';
  isPlaying = false;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const tempVec = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.001;

  luxuryProduct.rotation.y += 0.0035;
  ring.rotation.z += 0.002;

  if (!reduceMotion) {
    const pulse = isPlaying ? 1 + Math.sin(t * 3.2) * 0.04 : 1;
    body.scale.setScalar(pulse);

    const arr = particles.geometry.attributes.position.array;
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += Math.sin(t + i) * 0.0007;
      if (arr[i] > 4.2) arr[i] = 0;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    tempVec.set(0, 0.5 + Math.sin(t * 0.6) * 0.15, 0);
    controls.target.lerp(tempVec, 0.02);
  }

  controls.update();
  renderer.render(scene, camera);
}

renderNotes();
renderTranscript();
renderChapters();
pickSubtitle(0);
animate();

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const tracks = [
  { name: 'Guitarra', icon: '🎸', color: 0xd46a6a,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    desc: 'Grabación de guitarra eléctrica — take 3. Distorsión suave con amp sim.',
    stem: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { name: 'Voz', icon: '🎤', color: 0x6aaad4,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    desc: 'Toma principal de voz con micrófono condensador. Compresión ligera.',
    stem: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { name: 'Batería', icon: '🥁', color: 0xd4aa6a,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    desc: 'Batería acústica grabada en sala live. Overheads + room mic.',
    stem: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { name: 'Teclado', icon: '🎹', color: 0x6ad4aa,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    desc: 'Sintetizador analógico — capa de pads y arpegio secuenciado.',
    stem: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
];

const mixInfo = document.getElementById('mix-info');
const trackButtons = document.querySelectorAll('.track-btn');
const faderSliders = document.querySelectorAll('.fader-slider');
const faderVals = document.querySelectorAll('.fader-val');
const recordBtn = document.getElementById('record-toggle');
const exportBtn = document.getElementById('export-stems');
const fallbackBtn = document.getElementById('fallback-toggle');
const fallback = document.getElementById('fallback');
const dialog = document.getElementById('dialog');
const closeDialog = document.getElementById('close-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogVideo = document.getElementById('dialog-video');
const dialogDesc = document.getElementById('dialog-desc');

let recording = false;
let mediaRecorder = null;
let recordedChunks = [];

const howlers = [];
tracks.forEach((t) => {
  const h = new Howl({ src: [t.stem], html5: true, loop: true, volume: 0.5 });
  howlers.push(h);
});

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0a0e);
scene.fog = new THREE.Fog(0x0c0a0e, 5, 14);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.0, 5.0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 10;
controls.minDistance = 2;
controls.target.set(0, 0.6, -0.8);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const key = new THREE.DirectionalLight(0xf0e0d0, 1.0);
key.position.set(3, 6, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const fill = new THREE.DirectionalLight(0x8866aa, 0.3);
fill.position.set(-3, 1, -3);
scene.add(fill);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0x12101a, roughness: 0.9, metalness: 0.05 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.3;
floor.receiveShadow = true;
scene.add(floor);

const consoleMat = new THREE.MeshStandardMaterial({ color: 0x1a1624, roughness: 0.6, metalness: 0.2 });
const consoleTable = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 0.9), consoleMat);
consoleTable.position.set(0, 0.05, -1.2);
consoleTable.receiveShadow = true;
consoleTable.castShadow = true;
scene.add(consoleTable);

const chanMat = new THREE.MeshStandardMaterial({ color: 0x221e30, roughness: 0.5, metalness: 0.1 });
const chanCount = 4;
const channelMeshes = [];
for (let i = 0; i < chanCount; i += 1) {
  const x = (i - 1.5) * 0.7;
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.12), chanMat);
  ch.position.set(x, 0.2, -1.2);
  ch.userData = { trackIndex: i };
  scene.add(ch);
  channelMeshes.push(ch);

  const faderMat = new THREE.MeshStandardMaterial({ color: 0x4444aa, emissive: 0x2222aa, emissiveIntensity: 0.15 });
  const faderKnob = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), faderMat);
  faderKnob.position.set(x, 0.32, -1.2);
  faderKnob.userData = { trackIndex: i, isFader: true };
  scene.add(faderKnob);
}

const speakerMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.7 });
const speakerL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.3), speakerMat);
speakerL.position.set(-1.8, 0.35, 0.8);
scene.add(speakerL);
const speakerR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.3), speakerMat);
speakerR.position.set(1.8, 0.35, 0.8);
scene.add(speakerR);

const trackMeshes = [];
tracks.forEach((t, idx) => {
  const mat = new THREE.MeshStandardMaterial({
    color: t.color, roughness: 0.3, metalness: 0.4,
    emissive: t.color, emissiveIntensity: 0.05
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.08), mat);
  const x = (idx - 1.5) * 0.8;
  mesh.position.set(x, 0.55, 0.2);
  mesh.userData = { trackIndex: idx };
  scene.add(mesh);
  trackMeshes.push(mesh);

  const glowMat = new THREE.MeshBasicMaterial({ color: t.color, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.5), glowMat);
  glow.position.set(x, 0.55, 0.13);
  scene.add(glow);
});

const particlesGeo = new THREE.BufferGeometry();
const pCount = 100;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i += 1) {
  pPos[i * 3] = (Math.random() - 0.5) * 8;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 3 + 1;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ color: 0xaa88cc, size: 0.02, transparent: true, opacity: 0.35 })
);
scene.add(particles);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function openSession(idx) {
  const t = tracks[idx];
  dialogTitle.textContent = `${t.icon} ${t.name}`;
  dialogVideo.src = t.video;
  dialogVideo.load();
  dialogDesc.textContent = t.desc;
  mixInfo.textContent = `🎬 Reproduciendo: ${t.icon} ${t.name} — ${t.desc}`;
  dialog.classList.remove('hidden');
}

function updateFader3D(trackIndex, value) {
  const knob = scene.children.find((c) => c.userData && c.userData.isFader && c.userData.trackIndex === trackIndex);
  if (knob) {
    knob.position.y = 0.3 + value * 0.15;
    knob.material.emissiveIntensity = 0.1 + value * 0.4;
  }
}

function updateAllHowlers() {
  const vals = [];
  faderSliders.forEach((s) => vals.push(Number(s.value)));
  vals.forEach((v, i) => {
    howlers[i].volume(v);
    updateFader3D(i, v);
  });
}

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(trackMeshes);
  if (!hits.length) return;
  openSession(hits[0].object.userData.trackIndex);
});

trackButtons.forEach((btn) => {
  btn.addEventListener('click', () => openSession(Number(btn.dataset.track)));
});

faderSliders.forEach((slider, idx) => {
  slider.addEventListener('input', () => {
    const val = Number(slider.value);
    faderVals[idx].textContent = `${Math.round(val * 100)}%`;
    const t = tracks[idx];
    mixInfo.textContent = `🎚️ ${t.icon} ${t.name}: ${Math.round(val * 100)}%`;
    updateAllHowlers();
  });
});

closeDialog.addEventListener('click', () => {
  dialog.classList.add('hidden');
  dialogVideo.pause();
  dialogVideo.src = '';
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    dialog.classList.add('hidden');
    dialogVideo.pause();
    dialogVideo.src = '';
  }
});

recordBtn.addEventListener('click', async () => {
  if (recording) {
    recording = false;
    recordBtn.textContent = 'Grabar';
    recordBtn.classList.remove('warn');
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    howlers.forEach((h) => h.fade(h.volume(), 0, 300));
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    recording = true;
    recordBtn.textContent = 'Detener';
    recordBtn.classList.add('warn');
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => { if (e.data.size) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `sesion-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(blob);
    };
    mediaRecorder.start();
    howlers.forEach((h) => h.play());
    mixInfo.textContent = '🔴 Grabando sesión — todos los stems activos.';
  } catch {
    recordBtn.textContent = 'Grabar';
    recordBtn.classList.remove('warn');
    mixInfo.textContent = '⚠️ Permiso de grabación denegado.';
  }
});

exportBtn.addEventListener('click', () => {
  const vals = [];
  faderSliders.forEach((s) => vals.push(Math.round(Number(s.value) * 100)));
  let content = 'Export stems — Recording Studio\n\n';
  tracks.forEach((t, i) => {
    content += `${t.icon} ${t.name}: ${vals[i]}%\n`;
  });
  content += '\nTimestamp: ' + new Date().toISOString();
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `stems-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(blob);
  mixInfo.textContent = '📦 Stems exportados con niveles actuales.';
});

window.addEventListener('keydown', (event) => {
  if (event.key >= '1' && event.key <= '4') openSession(Number(event.key) - 1);
  if (event.key === ' ') { event.preventDefault(); recordBtn.click(); }
});

function renderFallback() {
  fallback.innerHTML = '<h2>Sesiones — Versión 2D</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  tracks.forEach((t, idx) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `
      <h3>${t.icon} ${t.name}</h3>
      <video controls preload="metadata" src="${t.video}" crossorigin="anonymous">
        <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
      </video>
      <p>${t.desc}</p>
      <div class="mix">Nivel: <input type="range" min="0" max="1" step="0.01" value="${faderSliders[idx].value}" data-fb-idx="${idx}" style="flex:1;accent-color:var(--accent)"></div>
    `;
    grid.appendChild(card);
    const fbSlider = card.querySelector('input[type="range"]');
    fbSlider.addEventListener('input', () => {
      faderSliders[idx].value = fbSlider.value;
      faderSliders[idx].dispatchEvent(new Event('input'));
    });
  });
  fallback.appendChild(grid);
}

fallbackBtn.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
  fallbackBtn.textContent = hidden ? 'Ocultar fallback' : 'Fallback 2D';
});

updateAllHowlers();
renderFallback();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
  });
}, { threshold: 0.05 });
observer.observe(sceneRoot);

function animate() {
  const t = performance.now() * 0.001;
  trackMeshes.forEach((mesh, idx) => {
    const bY = 0.55;
    mesh.position.y = bY + Math.sin(t * 1.2 + idx * 1.5) * 0.025;
  });
  const pArr = particles.geometry.attributes.position.array;
  for (let i = 0; i < pArr.length; i += 3) {
    pArr[i + 1] += Math.sin(t + i * 0.01) * 0.0004;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

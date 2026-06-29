import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const interviews = [
  {
    title: 'UX Research — Ana López',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    desc: 'Investigación de usabilidad para plataforma educativa.',
    notes: [
      { time: 2.0, text: 'El usuario dudó en el menú principal.' },
      { time: 5.5, text: 'Sugiere iconos más grandes.' },
      { time: 9.0, text: 'Tiempo de carga aceptable según el perfil.' }
    ]
  },
  {
    title: 'Product — Carlos Méndez',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    desc: 'Revisión de roadmap y prioridades del equipo.',
    notes: [
      { time: 1.5, text: 'Q3 release debe incluir analytics.' },
      { time: 4.0, text: 'Preocupación por deuda técnica.' },
      { time: 7.8, text: 'Propone sprint de estabilización.' }
    ]
  },
  {
    title: 'Engineering — Elena Rivas',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    desc: 'Arquitectura del nuevo sistema de microservicios.',
    notes: [
      { time: 3.0, text: 'Propone migración gradual.' },
      { time: 6.2, text: 'API Gateway como prioridad.' },
      { time: 10.5, text: 'Monitoreo distribuido con OTEL.' }
    ]
  }
];

const cardCopy = document.getElementById('card-copy');
const cardButtons = document.querySelectorAll('.card-btn');
const recordBtn = document.getElementById('record-toggle');
const sideBySideBtn = document.getElementById('side-by-side');
const exportBtn = document.getElementById('export-pdf');
const fallbackBtn = document.getElementById('fallback-toggle');
const fallback = document.getElementById('fallback');
const dialog = document.getElementById('dialog');
const closeDialog = document.getElementById('close-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogVideo = document.getElementById('dialog-video');
const notesList = document.getElementById('notes-list');
const noteInput = document.getElementById('note-input');
const saveNoteBtn = document.getElementById('save-note');
const annotationList = document.getElementById('annotation-list');
const sbsOverlay = document.getElementById('sbs-overlay');
const closeSbs = document.getElementById('close-sbs');
const sbsLeftSelect = document.getElementById('sbs-left-select');
const sbsRightSelect = document.getElementById('sbs-right-select');
const sbsLeftVideo = document.getElementById('sbs-left-video');
const sbsRightVideo = document.getElementById('sbs-right-video');
const sbsLeftNotes = document.getElementById('sbs-left-notes');
const sbsRightNotes = document.getElementById('sbs-right-notes');

let currentInterview = 0;
let recording = false;
let mediaRecorder = null;
let recordedChunks = [];

let activeNoteTimers = [];

const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e16);
scene.fog = new THREE.Fog(0x0a0e16, 6, 28);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.5, 8.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneRoot.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 16;
controls.minDistance = 3;
controls.target.set(0, 1.2, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const key = new THREE.DirectionalLight(0xf5e6d0, 1.3);
key.position.set(3, 8, 5);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const fill = new THREE.DirectionalLight(0x8899bb, 0.4);
fill.position.set(-3, 2, -4);
scene.add(fill);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 14),
  new THREE.MeshStandardMaterial({ color: 0x0d1422, roughness: 0.92, metalness: 0.05 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.3;
floor.receiveShadow = true;
scene.add(floor);

const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e2a3a, roughness: 0.55, metalness: 0.25 });
const table = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 3.6), tableMat);
table.position.set(0, 0, 0);
table.receiveShadow = true;
table.castShadow = true;
scene.add(table);

const topMat = new THREE.MeshStandardMaterial({ color: 0x2a384a, roughness: 0.45, metalness: 0.15 });
const topSurface = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.04, 3.4), topMat);
topSurface.position.set(0, 0.12, 0);
scene.add(topSurface);

const cardMeshes = [];
const cardGeos = [
  { w: 1.2, h: 0.7, d: 0.05 },
  { w: 1.2, h: 0.7, d: 0.05 },
  { w: 1.2, h: 0.7, d: 0.05 }
];

interviews.forEach((_, idx) => {
  const geo = cardGeos[idx];
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a3a52, roughness: 0.4, metalness: 0.3,
    emissive: 0x1a2a40, emissiveIntensity: 0.1
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(geo.w, geo.h, geo.d), mat);
  const xPos = (idx - 1) * 1.7;
  mesh.position.set(xPos, 0.4, 0);
  mesh.userData = { cardIndex: idx };
  scene.add(mesh);
  cardMeshes.push(mesh);

  const glowMat = new THREE.MeshBasicMaterial({ color: 0x7ba9d4, transparent: true, opacity: 0.15 });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(geo.w + 0.06, geo.h + 0.06), glowMat);
  glow.position.set(xPos, 0.42, 0);
  glow.rotation.x = -Math.PI / 2;
  scene.add(glow);
});

const particlesGeo = new THREE.BufferGeometry();
const count = 120;
const pos = new Float32Array(count * 3);
for (let i = 0; i < count; i += 1) {
  pos[i * 3] = (Math.random() - 0.5) * 10;
  pos[i * 3 + 1] = Math.random() * 4;
  pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ color: 0x9bb8d4, size: 0.03, transparent: true, opacity: 0.4 })
);
scene.add(particles);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function clearNoteTimers() {
  activeNoteTimers.forEach((t) => clearTimeout(t));
  activeNoteTimers = [];
}

function renderNotes(notes, container, videoEl) {
  container.innerHTML = '';
  if (!notes || !notes.length) {
    container.innerHTML = '<p class="anno-meta">Sin anotaciones.</p>';
    return;
  }
  notes.forEach((note, idx) => {
    const div = document.createElement('div');
    div.className = 'note-item';
    const timeSpan = document.createElement('span');
    timeSpan.className = 'note-time';
    timeSpan.textContent = formatTime(note.time);
    timeSpan.addEventListener('click', () => {
      if (videoEl && Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
        videoEl.currentTime = note.time;
      }
    });
    div.appendChild(timeSpan);
    div.append(note.text);
    container.appendChild(div);
  });
}

function showSyncAnnotations(notes, videoEl, container) {
  clearNoteTimers();
  if (!notes || !videoEl) return;
  notes.forEach((note) => {
    const delay = (note.time - videoEl.currentTime) * 1000;
    if (delay < 0) return;
    const timer = setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'note-item';
      div.textContent = `⏱ ${formatTime(note.time)} — ${note.text}`;
      container.prepend(div);
    }, delay);
    activeNoteTimers.push(timer);
  });
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function openInterview(idx) {
  clearNoteTimers();
  currentInterview = idx;
  const inv = interviews[idx];
  dialogTitle.textContent = inv.title;
  dialogVideo.src = inv.video;
  dialogVideo.load();
  renderNotes(inv.notes, notesList, dialogVideo);
  annotationList.innerHTML = `<p class="anno-meta">Anotaciones para: <strong>${inv.title}</strong></p>`;
  cardCopy.textContent = `${inv.title} — ${inv.desc}`;

  dialogVideo.addEventListener('play', () => showSyncAnnotations(inv.notes, dialogVideo, annotationList), { once: true });
  dialogVideo.addEventListener('seeked', () => {
    clearNoteTimers();
    annotationList.innerHTML = `<p class="anno-meta">Anotaciones sincronizadas para: <strong>${inv.title}</strong></p>`;
    if (!dialogVideo.paused) showSyncAnnotations(inv.notes, dialogVideo, annotationList);
  }, { once: false });

  dialog.classList.remove('hidden');
}

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(cardMeshes);
  if (!hit.length) return;
  openInterview(hit[0].object.userData.cardIndex);
});

cardButtons.forEach((btn) => {
  btn.addEventListener('click', () => openInterview(Number(btn.dataset.card)));
});

closeDialog.addEventListener('click', () => {
  dialog.classList.add('hidden');
  dialogVideo.pause();
  dialogVideo.src = '';
  clearNoteTimers();
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    dialog.classList.add('hidden');
    dialogVideo.pause();
    dialogVideo.src = '';
    clearNoteTimers();
  }
});

saveNoteBtn.addEventListener('click', () => {
  const text = noteInput.value.trim();
  if (!text) return;
  const inv = interviews[currentInterview];
  const time = dialogVideo.currentTime;
  inv.notes.push({ time, text });
  renderNotes(inv.notes, notesList, dialogVideo);
  const div = document.createElement('div');
  div.className = 'note-item';
  div.textContent = `📌 ${formatTime(time)} — ${text}`;
  annotationList.prepend(div);
  noteInput.value = '';
});

recordBtn.addEventListener('click', async () => {
  if (recording) {
    recording = false;
    recordBtn.textContent = 'Grabar';
    recordBtn.classList.remove('warn');
    recordBtn.classList.add('btn');
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `entrevista-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };
    mediaRecorder.start();
  } catch {
    recordBtn.textContent = 'Grabar';
    recordBtn.classList.remove('warn');
    alert('Permiso de grabación denegado.');
  }
});

function initSbs() {
  sbsLeftSelect.innerHTML = '';
  sbsRightSelect.innerHTML = '';
  interviews.forEach((inv, idx) => {
    const o1 = document.createElement('option');
    o1.value = idx; o1.textContent = inv.title;
    const o2 = document.createElement('option');
    o2.value = idx; o2.textContent = inv.title;
    sbsLeftSelect.appendChild(o1);
    sbsRightSelect.appendChild(o2);
  });
  sbsLeftSelect.value = '0';
  sbsRightSelect.value = '1';

  function loadSbsVideo(select, video, notesEl) {
    const idx = Number(select.value);
    const inv = interviews[idx];
    video.src = inv.video;
    video.load();
    renderNotes(inv.notes, notesEl, video);
  }

  loadSbsVideo(sbsLeftSelect, sbsLeftVideo, sbsLeftNotes);
  loadSbsVideo(sbsRightSelect, sbsRightVideo, sbsRightNotes);

  sbsLeftSelect.addEventListener('change', () => loadSbsVideo(sbsLeftSelect, sbsLeftVideo, sbsLeftNotes));
  sbsRightSelect.addEventListener('change', () => loadSbsVideo(sbsRightSelect, sbsRightVideo, sbsRightNotes));

  sbsLeftVideo.addEventListener('play', () => {
    const inv = interviews[Number(sbsLeftSelect.value)];
    showSyncAnnotations(inv.notes, sbsLeftVideo, sbsLeftNotes);
  });
  sbsRightVideo.addEventListener('play', () => {
    const inv = interviews[Number(sbsRightSelect.value)];
    showSyncAnnotations(inv.notes, sbsRightVideo, sbsRightNotes);
  });
}

sideBySideBtn.addEventListener('click', () => {
  sbsOverlay.classList.remove('hidden');
  initSbs();
});
closeSbs.addEventListener('click', () => sbsOverlay.classList.add('hidden'));
sbsOverlay.addEventListener('click', (e) => { if (e.target === sbsOverlay) sbsOverlay.classList.add('hidden'); });

exportBtn.addEventListener('click', () => {
  let content = 'Resumen de Entrevistas\n\n';
  interviews.forEach((inv, idx) => {
    content += `${idx + 1}. ${inv.title}\n${inv.desc}\n`;
    inv.notes.forEach((n) => { content += `   [${formatTime(n.time)}] ${n.text}\n`; });
    content += '\n';
  });
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'resumen-entrevistas.txt';
  a.click();
  URL.revokeObjectURL(blob);
});

function renderFallback() {
  fallback.innerHTML = '<h2>Entrevistas — Versión 2D</h2>';
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  interviews.forEach((inv, idx) => {
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.innerHTML = `
      <h3>${inv.title}</h3>
      <video controls preload="metadata" src="${inv.video}" crossorigin="anonymous">
        <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
      </video>
      <p>${inv.desc}</p>
      ${inv.notes.map((n) => `<div class="anno-item">[${formatTime(n.time)}] ${n.text}</div>`).join('')}
    `;
    grid.appendChild(card);
  });
  fallback.appendChild(grid);
}

fallbackBtn.addEventListener('click', () => {
  const hidden = fallback.classList.contains('hidden');
  fallback.classList.toggle('hidden');
  fallbackBtn.textContent = hidden ? 'Ocultar fallback' : 'Fallback 2D';
});

renderFallback();

window.addEventListener('keydown', (event) => {
  if (event.key === '1' || event.key === '2' || event.key === '3') {
    openInterview(Number(event.key) - 1);
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
  });
}, { threshold: 0.05 });
observer.observe(sceneRoot);

function animate() {
  const t = performance.now() * 0.001;
  cardMeshes.forEach((mesh, idx) => {
    const baseY = 0.4;
    mesh.position.y = baseY + Math.sin(t * 1.4 + idx * 1.2) * 0.04;
    const scale = 1 + Math.sin(t * 1.8 + idx * 1.5) * 0.015;
    mesh.scale.setScalar(scale);
  });
  const arr = particles.geometry.attributes.position.array;
  for (let i = 1; i < arr.length; i += 3) {
    arr[i] += Math.sin(t + i * 0.01) * 0.0005;
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

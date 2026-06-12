import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---- DOM Elements ----
const container = document.getElementById('canvas-container');
const camBtns = document.querySelectorAll('.cam-btn');
const btnFallback = document.getElementById('btn-fallback');
const btnCloseFallback = document.getElementById('btn-close-fallback');
const fallbackView = document.getElementById('fallback-view');
const btnPlayHighlights = document.getElementById('btn-play-highlights');
const btnMarkMoment = document.getElementById('btn-mark-moment');
const toast = document.getElementById('toast');
const subtitleEl = document.getElementById('live-subtitle');

// Videos
const mainVideo = document.getElementById('main-stream');
const sideVideo1 = document.getElementById('side-clip-1');
const sideVideo2 = document.getElementById('side-clip-2');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Scene Setup ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050608);
scene.fog = new THREE.Fog(0x050608, 10, 40);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2;
controls.minDistance = 2;
controls.maxDistance = 20;

// ---- Lighting ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Stage Light
const spotLight = new THREE.SpotLight(0xffffff, 100);
spotLight.position.set(0, 10, 5);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.5;
spotLight.target.position.set(0, 0, -10);
scene.add(spotLight);
scene.add(spotLight.target);

// ---- Geometry (Room & Screens) ----

// Room (Floor)
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
scene.add(floor);

// Central Main Screen
const mainTex = new THREE.VideoTexture(mainVideo);
mainTex.colorSpace = THREE.SRGBColorSpace;
const mainScreenGeo = new THREE.PlaneGeometry(16, 9);
const mainScreenMat = new THREE.MeshBasicMaterial({ map: mainTex });
const mainScreen = new THREE.Mesh(mainScreenGeo, mainScreenMat);
mainScreen.position.set(0, 3, -15);
scene.add(mainScreen);

// Side Screen Left
const sideTex1 = new THREE.VideoTexture(sideVideo1);
sideTex1.colorSpace = THREE.SRGBColorSpace;
const sideScreenGeo = new THREE.PlaneGeometry(8, 4.5);
const sideScreenMat1 = new THREE.MeshBasicMaterial({ map: sideTex1 });
const sideScreen1 = new THREE.Mesh(sideScreenGeo, sideScreenMat1);
sideScreen1.position.set(-14, 2, -10);
sideScreen1.rotation.y = Math.PI / 6;
scene.add(sideScreen1);

// Side Screen Right
const sideTex2 = new THREE.VideoTexture(sideVideo2);
sideTex2.colorSpace = THREE.SRGBColorSpace;
const sideScreenMat2 = new THREE.MeshBasicMaterial({ map: sideTex2 });
const sideScreen2 = new THREE.Mesh(sideScreenGeo, sideScreenMat2);
sideScreen2.position.set(14, 2, -10);
sideScreen2.rotation.y = -Math.PI / 6;
scene.add(sideScreen2);

// Play videos
mainVideo.play().catch(e => console.log(e));
sideVideo1.play().catch(e => console.log(e));
sideVideo2.play().catch(e => console.log(e));

// Virtual Audience (Simple spheres)
const audienceGroup = new THREE.Group();
const audMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.9 });
const audGeo = new THREE.SphereGeometry(0.5, 16, 16);

for(let i=0; i<50; i++) {
  const person = new THREE.Mesh(audGeo, audMat);
  person.position.x = (Math.random() - 0.5) * 30;
  person.position.z = Math.random() * 20 + 2;
  person.position.y = -1.5;
  // Save offset for animation
  person.userData.offset = Math.random() * Math.PI * 2;
  audienceGroup.add(person);
}
scene.add(audienceGroup);

// ---- Camera Angles ----
const cameraAngles = {
  center: { pos: new THREE.Vector3(0, 1, 15), look: new THREE.Vector3(0, 3, -15) },
  left: { pos: new THREE.Vector3(-10, 2, 5), look: new THREE.Vector3(-14, 2, -10) },
  right: { pos: new THREE.Vector3(10, 2, 5), look: new THREE.Vector3(14, 2, -10) },
  audience: { pos: new THREE.Vector3(0, 5, 20), look: new THREE.Vector3(0, -2, 5) }
};

// Init Camera
camera.position.copy(cameraAngles.center.pos);
controls.target.copy(cameraAngles.center.look);

camBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    camBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    const angle = cameraAngles[e.target.dataset.cam];
    
    if (prefersReducedMotion) {
      camera.position.copy(angle.pos);
      controls.target.copy(angle.look);
    } else {
      gsap.to(camera.position, {
        x: angle.pos.x, y: angle.pos.y, z: angle.pos.z,
        duration: 1.5, ease: "power2.inOut"
      });
      gsap.to(controls.target, {
        x: angle.look.x, y: angle.look.y, z: angle.look.z,
        duration: 1.5, ease: "power2.inOut"
      });
    }
  });
});

// ---- Interactions ----
btnPlayHighlights.addEventListener('click', () => {
  // Sync side clips
  sideVideo1.currentTime = 0;
  sideVideo2.currentTime = 0;
  // Move camera slightly
  if(!prefersReducedMotion) {
    gsap.to(camera.position, { y: camera.position.y + 2, duration: 2, yoyo: true, repeat: 1 });
  }
});

btnMarkMoment.addEventListener('click', () => {
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
});

// Fake Subtitles Stream
const subs = [
  "Welcome to the Global Tech Summit.",
  "We are about to begin the keynote presentation.",
  "Today, we unveil the future of 3D web experiences.",
  "Our new rendering engine pushes WebGL to its absolute limits.",
  "Thank you for joining us from around the world."
];
let subIdx = 0;
setInterval(() => {
  subtitleEl.style.opacity = 0;
  setTimeout(() => {
    subIdx = (subIdx + 1) % subs.length;
    subtitleEl.textContent = subs[subIdx];
    subtitleEl.style.opacity = 1;
  }, 500);
}, 5000);

// ---- Animation Loop ----
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // Animate audience subtly
  if (!prefersReducedMotion) {
    audienceGroup.children.forEach(person => {
      person.position.y = -1.5 + Math.sin(time * 2 + person.userData.offset) * 0.1;
    });
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ---- Fallback ----
btnFallback.addEventListener('click', () => fallbackView.classList.remove('hidden'));
btnCloseFallback.addEventListener('click', () => fallbackView.classList.add('hidden'));

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

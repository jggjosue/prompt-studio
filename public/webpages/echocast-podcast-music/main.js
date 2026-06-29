import * as THREE from 'three';

// 1. Scene Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#05010d');
scene.fog = new THREE.Fog('#05010d', 10, 30);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 2. Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xff7e40, 1);
dirLight.position.set(10, 10, 5);
scene.add(dirLight);

const pointLight1 = new THREE.PointLight(0x9d4edd, 2);
pointLight1.position.set(-5, 5, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff2a5f, 1.5);
pointLight2.position.set(0, -2, 5);
scene.add(pointLight2);

// 3. Procedural Objects
// Microphone
const micGroup = new THREE.Group();
micGroup.position.set(-2, 0, 0);

const standGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 16);
const standMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
const stand = new THREE.Mesh(standGeo, standMat);
stand.position.y = -1;
micGroup.add(stand);

const headGeo = new THREE.CapsuleGeometry(0.2, 0.4, 16, 16);
const headMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1, wireframe: true });
const head = new THREE.Mesh(headGeo, headMat);
head.position.y = 0.2;
micGroup.add(head);

const innerHeadGeo = new THREE.CapsuleGeometry(0.18, 0.38, 16, 16);
const innerHeadMat = new THREE.MeshStandardMaterial({ color: 0xff2a5f, emissive: 0xff2a5f, emissiveIntensity: 0.2 });
const innerHead = new THREE.Mesh(innerHeadGeo, innerHeadMat);
innerHead.position.y = 0.2;
micGroup.add(innerHead);

scene.add(micGroup);

// Vinyls
const vinylGroup = new THREE.Group();
const vinylGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 32);
const vinylMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.5 });
const vinyls = [];

for(let i = 0; i < 10; i++) {
  const v = new THREE.Mesh(vinylGeo, vinylMat);
  v.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 5 - 2
  );
  v.rotation.x = Math.PI / 2 + (Math.random() * 0.2);
  vinylGroup.add(v);
  vinyls.push({ mesh: v, speed: Math.random() * 0.02 });
}
scene.add(vinylGroup);

// Abstract Audio Wave Sphere
const waveGeo = new THREE.SphereGeometry(1, 64, 64);
const waveMat = new THREE.MeshStandardMaterial({ 
  color: 0xff7e40, 
  emissive: 0xff2a5f, 
  emissiveIntensity: 0.5,
  roughness: 0.2,
  wireframe: true 
});
const waveSphere = new THREE.Mesh(waveGeo, waveMat);
waveSphere.position.set(3, 0, -5);
waveSphere.scale.set(2, 2, 2);
scene.add(waveSphere);

// Particles
const particlesGroup = new THREE.Group();
particlesGroup.position.z = -10;
const particleGeo = new THREE.SphereGeometry(0.05, 8, 8);
const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });

for(let i = 0; i < 100; i++) {
  const pMat = particleMat.clone();
  pMat.opacity = Math.random();
  const p = new THREE.Mesh(particleGeo, pMat);
  p.position.set(
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 10
  );
  particlesGroup.add(p);
}
scene.add(particlesGroup);


// 4. Scroll Animation
let scrollY = window.scrollY;
let currentScrollPercent = 0;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  // Calculate percentage of scroll
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  currentScrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 5. Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();

  // Microphone Animation
  micGroup.position.y = -currentScrollPercent * 10 + Math.sin(elapsedTime) * 0.1;
  micGroup.rotation.y = currentScrollPercent * Math.PI * 2;

  // Vinyls Animation
  vinylGroup.position.y = currentScrollPercent * 15;
  vinylGroup.rotation.y = currentScrollPercent * Math.PI;
  vinyls.forEach(v => {
    v.mesh.rotation.y += v.speed;
  });

  // Wave Sphere Animation
  waveSphere.rotation.x = elapsedTime * 0.2;
  waveSphere.rotation.y = elapsedTime * 0.3;
  waveSphere.position.z = -5 + currentScrollPercent * 10;
  
  // Simple distortion simulation (scaling on axes)
  const scalePhase = Math.sin(elapsedTime * 2);
  waveSphere.scale.set(2 + scalePhase * 0.1, 2 + Math.cos(elapsedTime * 2) * 0.1, 2);

  renderer.render(scene, camera);
}

animate();

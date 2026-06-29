import * as THREE from 'three';

// --- Scene Setup ---
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 5);
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0x818cf8, 2);
pointLight1.position.set(-10, -10, -10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x38bdf8, 2);
pointLight2.position.set(10, 0, -10);
scene.add(pointLight2);

// --- Group for all objects to rotate ---
const mainGroup = new THREE.Group();
scene.add(mainGroup);

// --- Stars (Simple Particle System) ---
const starGeometry = new THREE.BufferGeometry();
const starCount = 5000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 200;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 });
const stars = new THREE.Points(starGeometry, starMaterial);
mainGroup.add(stars);

// --- Data Nodes (Spheres) ---
const createDataNode = (color, position) => {
  const geo = new THREE.SphereGeometry(0.5, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ 
    color: color, 
    emissive: color, 
    emissiveIntensity: 0.5, 
    wireframe: true 
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...position);
  // Save base position for float animation
  mesh.userData = { 
    baseY: position[1], 
    randomSeed: Math.random() * 100,
    speed: 1.5 + Math.random() * 1.5 
  };
  mainGroup.add(mesh);
  return mesh;
};

const nodes = [
  createDataNode(0x38bdf8, [-5, 2, -5]),
  createDataNode(0x818cf8, [5, -2, -8]),
  createDataNode(0x34d399, [0, 4, -10])
];

// --- Floating Screens (Boxes) ---
const createFloatingScreen = (position, rotation) => {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.set(...rotation);
  
  const outerGeo = new THREE.BoxGeometry(4, 2.5, 0.1);
  const outerMat = new THREE.MeshStandardMaterial({ color: 0x141c2b, transparent: true, opacity: 0.8 });
  const outerBox = new THREE.Mesh(outerGeo, outerMat);
  group.add(outerBox);
  
  const innerGeo = new THREE.BoxGeometry(3.8, 2.3, 0.11);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x0a0e14 });
  const innerBox = new THREE.Mesh(innerGeo, innerMat);
  group.add(innerBox);
  
  group.userData = { 
    baseY: position[1], 
    randomSeed: Math.random() * 100,
    speed: 1 + Math.random() * 1
  };
  mainGroup.add(group);
  return group;
};

const screens = [
  createFloatingScreen([-8, -5, -15], [0, 0.5, 0]),
  createFloatingScreen([8, -8, -12], [0, -0.5, 0]),
  createFloatingScreen([0, -12, -8], [-0.2, 0, 0])
];

// --- Data Lines ---
const linePoints = [];
for (let i = 0; i < 50; i++) {
  linePoints.push(
    new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20 - 10
    )
  );
}
const lineGroup = new THREE.Group();
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 });

for (let i = 1; i < linePoints.length; i++) {
  const geo = new THREE.BufferGeometry().setFromPoints([linePoints[i-1], linePoints[i]]);
  const line = new THREE.Line(geo, lineMaterial);
  lineGroup.add(line);
}
mainGroup.add(lineGroup);

// --- Resize Handler ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Scroll & Animation State ---
let scrollYProgress = 0;
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollYProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
});

// Hero text animation on load
setTimeout(() => {
  const heroText = document.querySelector('.animate-hero');
  if (heroText) {
    heroText.style.transition = 'opacity 1s, transform 1s';
    heroText.style.opacity = '1';
    heroText.style.transform = 'translateY(0)';
  }
}, 100);

const clock = new THREE.Clock();

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  
  // Floating animation for nodes and screens
  const floatingObjects = [...nodes, ...screens];
  floatingObjects.forEach((obj) => {
    obj.position.y = obj.userData.baseY + Math.sin(elapsedTime * obj.userData.speed + obj.userData.randomSeed) * 0.5;
    obj.rotation.x += 0.002;
    obj.rotation.y += 0.005;
  });

  // Smooth camera movement based on scroll
  // state.camera.position.z = THREE.MathUtils.lerp(15, 5, progress);
  // state.camera.position.y = THREE.MathUtils.lerp(0, -10, progress);
  // state.camera.rotation.x = THREE.MathUtils.lerp(0, 0.2, progress);
  
  const targetCamZ = THREE.MathUtils.lerp(15, 5, scrollYProgress);
  const targetCamY = THREE.MathUtils.lerp(0, -10, scrollYProgress);
  const targetCamRotX = THREE.MathUtils.lerp(0, 0.2, scrollYProgress);

  camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
  camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetCamRotX, 0.1);
  
  // Rotate whole scene
  mainGroup.rotation.y = elapsedTime * 0.05;

  renderer.render(scene, camera);
}

animate();

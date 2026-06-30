import * as THREE from 'three';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ---- DOM Elements ----
const container = document.getElementById('canvas-container');

// Video elements (from hidden DOM)
const videos = [
  document.getElementById('vid1'),
  document.getElementById('vid2'),
  document.getElementById('vid3')
];

// Check user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Scene Setup ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0b0a);
// Fog helps with depth perception and hiding objects far away
scene.fog = new THREE.Fog(0x0c0b0a, 10, 50);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
// Start camera at z = 10
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// ---- Lighting ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Add some spot lights to simulate projectors
const spotLight1 = new THREE.SpotLight(0xc4a77d, 2);
spotLight1.position.set(-5, 5, 0);
spotLight1.angle = Math.PI / 6;
spotLight1.penumbra = 0.5;
scene.add(spotLight1);

const spotLight2 = new THREE.SpotLight(0x7da7c4, 2);
spotLight2.position.set(5, -5, -20);
spotLight2.angle = Math.PI / 6;
spotLight2.penumbra = 0.5;
scene.add(spotLight2);

// ---- Particles (Dust/Light) ----
const particleCount = 1000;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);

for(let i=0; i<particleCount*3; i+=3) {
  particlePos[i] = (Math.random() - 0.5) * 40;
  particlePos[i+1] = (Math.random() - 0.5) * 40;
  particlePos[i+2] = (Math.random() - 0.5) * 80; // Spread along Z
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
  transparent: true,
  opacity: 0.4
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);


// ---- Geometry & Materials (Gallery Panels) ----
const panels = [];
const textures = [];

// We will lay out panels along the Z axis from z=0 to z=-60
const totalDepth = -60;
const numPanels = 8; // Match the 8 sections roughly

const panelGeo = new THREE.PlaneGeometry(6, 4);
const tallGeo = new THREE.PlaneGeometry(4, 6);

// Fake data to populate panels
const panelData = [
  { type: 'video', src: videos[0], x: -3, y: 1 },
  { type: 'image', color: 0x222222, x: 4, y: -1, isTall: true },
  { type: 'video', src: videos[1], x: 2, y: 2 },
  { type: 'image', color: 0x333333, x: -4, y: 0 },
  { type: 'video', src: videos[2], x: 3, y: -2 },
  { type: 'image', color: 0x111111, x: -2, y: 3, isTall: true },
  { type: 'image', color: 0x444444, x: 5, y: 1 },
  { type: 'video', src: videos[0], x: -3, y: -1 } // loop back to first video
];

panelData.forEach((data, i) => {
  let mat;
  if (data.type === 'video') {
    const texture = new THREE.VideoTexture(data.src);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    mat = new THREE.MeshStandardMaterial({ 
      map: texture,
      side: THREE.DoubleSide,
      roughness: 0.4
    });
    // Play video
    data.src.play().catch(e => { /* console.log('Autoplay prevented:', e) */ });
  } else {
    // Placeholder for image
    mat = new THREE.MeshStandardMaterial({ 
      color: data.color,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.8
    });
  }

  const mesh = new THREE.Mesh(data.isTall ? tallGeo : panelGeo, mat);
  
  // Distribute along Z axis
  const zPos = (i / (numPanels - 1)) * totalDepth;
  
  mesh.position.set(data.x, data.y, zPos);
  
  // Slight random rotation for artistic feel
  mesh.rotation.y = (Math.random() - 0.5) * 0.4;
  mesh.rotation.x = (Math.random() - 0.5) * 0.2;
  
  scene.add(mesh);
  panels.push({
    mesh: mesh,
    baseX: data.x,
    baseY: data.y,
    baseZ: zPos,
    rotY: mesh.rotation.y,
    rotX: mesh.rotation.x
  });
});

// ---- Scroll Animation ----
const scrollContainer = document.getElementById('scroll-container');

// We map the total scroll progress (0 to 1) to camera Z position
let scrollProgress = 0;

ScrollTrigger.create({
  trigger: scrollContainer,
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    scrollProgress = self.progress;
  }
});

// ---- Mouse Parallax ----
const mouse = new THREE.Vector2(0, 0);
const targetCameraPos = new THREE.Vector3(0, 0, 10);
const currentCameraPos = new THREE.Vector3(0, 0, 10);

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ---- Animation Loop ----
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // 1. Calculate target camera position based on scroll
  // Start at z=10, end at z = totalDepth - 10
  const targetZ = 10 + (totalDepth - 20) * scrollProgress;
  
  // Add mouse parallax
  targetCameraPos.set(
    mouse.x * 2,
    mouse.y * 2,
    targetZ
  );

  // Smoothly move camera
  if (!prefersReducedMotion) {
    currentCameraPos.lerp(targetCameraPos, 0.05);
    camera.position.copy(currentCameraPos);
    
    // Add subtle camera tilt based on mouse
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mouse.x * 0.1, 0.05);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, mouse.y * 0.1, 0.05);
  } else {
    camera.position.set(0, 0, targetZ);
  }

  // 2. Animate panels slightly
  panels.forEach((p, i) => {
    // Float effect
    p.mesh.position.y = p.baseY + Math.sin(time + i) * 0.2;
    // Rotate slightly towards camera as they get closer
    const distToCamera = p.baseZ - camera.position.z;
    if (distToCamera < 0 && distToCamera > -20) {
      // It's passing the camera
      p.mesh.rotation.y = THREE.MathUtils.lerp(p.mesh.rotation.y, p.rotY + Math.PI/4, 0.02);
    } else {
      p.mesh.rotation.y = THREE.MathUtils.lerp(p.mesh.rotation.y, p.rotY, 0.05);
    }
  });

  // 3. Animate particles
  particles.rotation.y = time * 0.02;

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

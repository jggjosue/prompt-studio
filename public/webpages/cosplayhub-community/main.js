// Setup Three.js Scene
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0d0614, 0.02);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create 3D Objects for the "Hub"
const objects = [];

// Helper function to create glowing materials
function createGlowingMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.8
  });
}

// 1. Central "Core" element
const coreGeometry = new THREE.IcosahedronGeometry(2, 0);
const coreMaterial = new THREE.MeshStandardMaterial({
  color: 0xd946ef,
  wireframe: true,
  emissive: 0xd946ef,
  emissiveIntensity: 0.2
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
core.position.set(2, 0, -5);
scene.add(core);
objects.push({ mesh: core, rotationSpeed: 0.005 });

// 2. Floating platforms (representing booths/stages)
const platformGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
const platformMat = new THREE.MeshStandardMaterial({
  color: 0x140a1e,
  roughness: 0.7,
  metalness: 0.3
});

for(let i=0; i<5; i++) {
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.x = (Math.random() - 0.5) * 15;
  platform.position.y = (Math.random() - 0.5) * 10;
  platform.position.z = (Math.random() - 1) * 20 - 10;
  scene.add(platform);
  
  // Add a glowing prop to each platform
  const propGeo = new THREE.OctahedronGeometry(0.5);
  const colors = [0xd946ef, 0x8b5cf6, 0x2dd4bf];
  const propMat = createGlowingMaterial(colors[i % colors.length]);
  const prop = new THREE.Mesh(propGeo, propMat);
  prop.position.y = 0.8;
  platform.add(prop);
  
  objects.push({ mesh: prop, rotationSpeed: 0.01 });
}

// 3. Floating Particles (dust/ambience)
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 1000;
const posArray = new Float32Array(particleCount * 3);

for(let i=0; i < particleCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 50;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: 0x2dd4bf,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleMesh);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xd946ef, 2, 50);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x2dd4bf, 2, 50);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);


// GSAP Scroll Animations
gsap.registerPlugin(ScrollTrigger);

// Animate Camera along Z axis based on scroll
gsap.to(camera.position, {
  z: -25,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1
  }
});

// Rotate Camera slightly based on scroll
gsap.to(camera.rotation, {
  y: Math.PI * 0.1,
  x: -Math.PI * 0.05,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5
  }
});

// UI Parallax Animations
gsap.utils.toArray('.parallax-card').forEach(card => {
  const speed = card.dataset.speed || 1;
  gsap.fromTo(card, 
    { y: 100 },
    {
      y: -100 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: card,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    }
  );
});

// Fade in sections
gsap.utils.toArray('.section').forEach(section => {
  gsap.fromTo(section,
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "top 50%",
        scrub: false
      }
    }
  );
});


// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Rotate objects
  objects.forEach(obj => {
    obj.mesh.rotation.x += obj.rotationSpeed;
    obj.mesh.rotation.y += obj.rotationSpeed;
  });

  // Slow particle rotation
  particleMesh.rotation.y = elapsedTime * 0.05;

  renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

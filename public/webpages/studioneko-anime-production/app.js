// 1. Scene Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.002);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 2. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xf43f5e, 2, 50); // Accent Red
pointLight.position.set(2, 2, 5);
scene.add(pointLight);

const blueLight = new THREE.PointLight(0x3b82f6, 1.5, 50);
blueLight.position.set(-2, -2, 5);
scene.add(blueLight);

// 3. Procedural Environment (Floating Storyboards/Canvases)
const objects = [];
const planeGeometry = new THREE.PlaneGeometry(3, 1.7); // 16:9 ish
const materialBase = new THREE.MeshStandardMaterial({ 
  color: 0x111111, 
  roughness: 0.2, 
  metalness: 0.8,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.9
});

// Create a pipeline of floating screens/canvases along the Z-axis
for (let i = 0; i < 20; i++) {
  const mesh = new THREE.Mesh(planeGeometry, materialBase.clone());
  
  // Random positions along a path
  mesh.position.x = (Math.random() - 0.5) * 15;
  mesh.position.y = (Math.random() - 0.5) * 15;
  mesh.position.z = -i * 8; // Spread them backwards
  
  // Random rotation
  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;
  
  // Add wireframe inner for "sketching" vibe
  const edges = new THREE.EdgesGeometry(planeGeometry);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.3 }));
  mesh.add(line);
  
  scene.add(mesh);
  objects.push(mesh);
}

// 4. Particles (Dust / Magic)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  // Spread particles around the Z path
  posArray[i] = (Math.random() - 0.5) * 30; 
  // Let Z axis go deep
  if(i % 3 === 2) {
    posArray[i] = (Math.random() - 0.5) * 200;
  }
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: 0xffffff,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// 5. GSAP Scroll Animation
gsap.registerPlugin(ScrollTrigger);

// Timeline to move camera along Z axis as user scrolls
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Smooth scrubbing
  }
});

// Camera dives deep into the scene
tl.to(camera.position, {
  z: -160,
  ease: "power1.inOut"
}, 0);

// Rotate camera slightly for cinematic feel
tl.to(camera.rotation, {
  z: Math.PI * 0.1,
  x: -Math.PI * 0.05,
  ease: "power1.inOut"
}, 0);

// 6. Intersection Observer for HTML Elements (Fade in text when scrolling)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.classList.add('active');
    } else {
      entry.target.classList.remove('active');
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.content').forEach(el => {
  observer.observe(el);
});

// 7. Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Slow rotation for floating objects
  objects.forEach((obj, idx) => {
    obj.rotation.x += 0.001 * (idx % 2 === 0 ? 1 : -1);
    obj.rotation.y += 0.002 * (idx % 3 === 0 ? 1 : -1);
  });

  // Slow drift for particles
  particlesMesh.rotation.y = -elapsedTime * 0.02;
  particlesMesh.rotation.z = elapsedTime * 0.01;

  // Parallax based on mouse movement
  camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;

  renderer.render(scene, camera);
}

// Mouse movement for parallax effect
let mouseX = 0;
let mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

animate();

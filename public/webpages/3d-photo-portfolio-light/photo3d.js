// Smooth Scrolling with Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Mobile Menu Toggle
const menuBtn = document.querySelector('.mobile-menu-btn');
const mobileOverlay = document.querySelector('.mobile-menu-overlay');
const mobileLinks = document.querySelectorAll('.mobile-nav a');

menuBtn.addEventListener('click', () => {
  mobileOverlay.classList.toggle('active');
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileOverlay.classList.remove('active');
  });
});


// Three.js Scene Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
// Soft warm white background to match the light theme
scene.background = new THREE.Color(0xfcfaf8); 
// Add some fog for depth fading
scene.fog = new THREE.FogExp2(0xfcfaf8, 0.04);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
// Start camera a bit back
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfff5e6, 0.5); // Warm light
directionalLight.position.set(5, 5, 2);
scene.add(directionalLight);

// Create Floating Photos (Planes)
const textureLoader = new THREE.TextureLoader();
// Using some high quality Unsplash placeholders for photography portfolio
const photoUrls = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop', // Portrait
  'https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=800&auto=format&fit=crop', // Editorial/Fashion
  'https://images.unsplash.com/photo-1512413914594-814d48348d79?q=80&w=800&auto=format&fit=crop', // Lifestyle
  'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop', // Accessories
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop', // Nature / Editorial
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=800&auto=format&fit=crop', // Fashion
  'https://images.unsplash.com/photo-1509631179647-0c952806c9a0?q=80&w=800&auto=format&fit=crop', // Mood
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop'  // Runway
];

const planes = [];
const numPlanes = 15;

const geometry = new THREE.PlaneGeometry(3, 4);

for (let i = 0; i < numPlanes; i++) {
  const url = photoUrls[i % photoUrls.length];
  
  const material = new THREE.MeshPhysicalMaterial({ 
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0, // fade in
    side: THREE.DoubleSide
  });

  // Load texture asynchronously
  textureLoader.load(url, (texture) => {
    material.map = texture;
    material.needsUpdate = true;
    gsap.to(material, { opacity: 1, duration: 2, ease: "power2.out" });
  });

  const mesh = new THREE.Mesh(geometry, material);
  
  // Position them randomly along the Z-axis to create a tunnel/gallery effect
  const zPos = - (i * 4) - 2; 
  // Randomize X and Y to scatter them
  const xPos = (Math.random() - 0.5) * 12;
  const yPos = (Math.random() - 0.5) * 8;
  
  mesh.position.set(xPos, yPos, zPos);
  
  // Slight random rotation for dynamic feel
  mesh.rotation.z = (Math.random() - 0.5) * 0.2;
  mesh.rotation.y = (Math.random() - 0.5) * 0.4;
  
  // Store initial values for animation
  mesh.userData = {
    initialY: yPos,
    initialX: xPos,
    initialRotZ: mesh.rotation.z,
    speed: Math.random() * 0.02 + 0.01
  };
  
  scene.add(mesh);
  planes.push(mesh);
}

// Add some subtle floating dust/particles to enhance the "light" mood
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 200;
const posArray = new Float32Array(particlesCount * 3);

for(let i=0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 20;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
  size: 0.05,
  color: 0xd4af37, // subtle gold
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// Scroll Interaction Logic
let scrollY = 0;
let targetScrollY = 0;

lenis.on('scroll', (e) => {
  targetScrollY = e.scroll;
  
  // Handle HTML Parallax elements
  document.querySelectorAll('.parallax-text').forEach(el => {
    const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
    if (!el.dataset.initY) {
      el.dataset.initY = el.getBoundingClientRect().top + window.scrollY;
    }
    const initY = parseFloat(el.dataset.initY);
    // Calculate distance from center of viewport
    const distFromCenter = (targetScrollY + window.innerHeight / 2) - initY;
    const yPos = distFromCenter * speed;
    el.style.transform = `translateY(${yPos}px)`;
  });
});

// Window Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Smooth scroll interpolation for camera
  scrollY += (targetScrollY - scrollY) * 0.1;
  
  // Move camera forward based on scroll
  // The multiplier adjusts how fast we move through the Z space
  camera.position.z = 5 - (scrollY * 0.015);
  
  // Add a slight sway to the camera
  camera.position.x = Math.sin(elapsedTime * 0.2) * 0.5;
  camera.position.y = Math.cos(elapsedTime * 0.1) * 0.3;

  // Animate planes slightly (floating effect)
  planes.forEach(plane => {
    plane.position.y = plane.userData.initialY + Math.sin(elapsedTime * plane.userData.speed * 10) * 0.5;
    plane.rotation.z = plane.userData.initialRotZ + Math.sin(elapsedTime * 0.5) * 0.05;
  });

  // Rotate particles slowly
  particlesMesh.rotation.y = elapsedTime * 0.05;

  renderer.render(scene, camera);
}

animate();

// Ensure GSAP ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// THREE.JS SCENE SETUP
// ==========================================
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.02);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x4ade80, 2, 50);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00aaff, 2, 50);
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);

// ==========================================
// 3D OBJECTS (Floating Gallery)
// ==========================================
const objects = [];

// Helper to create a floating screen/panel
function createFloatingScreen(x, y, z, rotationY, color) {
  const geometry = new THREE.BoxGeometry(4, 2.5, 0.1);
  const material = new THREE.MeshPhysicalMaterial({ 
    color: color,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.8
  });
  const mesh = new THREE.Mesh(geometry, material);
  
  // Add wireframe edge for style
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
  mesh.add(line);

  mesh.position.set(x, y, z);
  mesh.rotation.y = rotationY;
  
  scene.add(mesh);
  objects.push(mesh);
  return mesh;
}

// Create several floating screens for the gallery
createFloatingScreen(-4, 2, -5, Math.PI / 4, 0x111111);
createFloatingScreen(5, 0, -10, -Math.PI / 6, 0x222222);
createFloatingScreen(-3, -3, -15, Math.PI / 8, 0x050505);
createFloatingScreen(6, 4, -20, -Math.PI / 4, 0x1a1a1a);
createFloatingScreen(0, -1, -25, 0, 0x4ade80); // Accent colored screen further back

// Particles / Dust
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 40;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: 0x4ade80,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// ==========================================
// ANIMATION LOOP
// ==========================================
const clock = new THREE.Clock();

function tick() {
  const elapsedTime = clock.getElapsedTime();

  // Gentle float animation for objects
  objects.forEach((obj, index) => {
    obj.position.y += Math.sin(elapsedTime * 0.5 + index) * 0.005;
    obj.rotation.x = Math.sin(elapsedTime * 0.2 + index) * 0.05;
  });

  // Slowly rotate particles
  particlesMesh.rotation.y = elapsedTime * 0.05;

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

tick();

// ==========================================
// GSAP SCROLL ANIMATIONS
// ==========================================

// Camera Path Animation
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1
  }
});

// Animate camera moving forward through the Z axis and panning slightly
tl.to(camera.position, {
  z: -20,
  x: 2,
  y: -1,
  ease: "power1.inOut"
}, 0);

tl.to(camera.rotation, {
  y: Math.PI / 8,
  z: Math.PI / 16,
  ease: "power1.inOut"
}, 0);

// HTML Parallax Elements
document.querySelectorAll('[data-parallax]').forEach(elem => {
  const speed = parseFloat(elem.getAttribute('data-parallax'));
  gsap.to(elem, {
    y: () => -100 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: elem,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});

// Section reveal animations
gsap.utils.toArray('.section-title').forEach(title => {
  gsap.from(title, {
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
      trigger: title,
      start: "top 80%",
    }
  });
});

// ==========================================
// UI LOGIC & EVENTS
// ==========================================

// Handle Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Handle Form Submission
const contactForm = document.getElementById('contact-form');
if(contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    const originalText = btn.innerText;
    
    // Simulate loading
    btn.innerText = "Enviando...";
    btn.disabled = true;
    
    setTimeout(() => {
      contactForm.reset();
      contactForm.classList.add('hidden');
      document.getElementById('form-success').classList.remove('hidden');
    }, 1500);
  });
}

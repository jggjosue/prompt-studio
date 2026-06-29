// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- Navbar and UI Logic ---
const navbar = document.querySelector('.navbar');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

mobileMenuBtn.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '100%';
  navLinks.style.left = '0';
  navLinks.style.width = '100%';
  navLinks.style.background = 'rgba(11, 12, 16, 0.95)';
  navLinks.style.padding = '2rem';
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop,
        behavior: 'smooth'
      });
      if (window.innerWidth <= 900) {
        navLinks.style.display = 'none';
      }
    }
  });
});

// GSAP Parallax Animations for HTML elements
const parallaxElements = document.querySelectorAll('.parallax-element');
parallaxElements.forEach(el => {
  const speed = el.getAttribute('data-speed') || 0.1;
  gsap.fromTo(el, 
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'top 20%',
        scrub: 1,
      }
    }
  );
});

const parallaxTexts = document.querySelectorAll('.parallax-text');
parallaxTexts.forEach(el => {
  const speed = el.getAttribute('data-speed') || 0.1;
  gsap.to(el, {
    y: () => -100 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});


// --- Three.js 3D Background Logic ---

const canvasContainer = document.getElementById('canvas-container');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b0c10, 0.05);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff4757, 2, 50);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffa502, 2, 50);
pointLight2.position.set(-5, 3, 2);
scene.add(pointLight2);

// Objects: Abstract representation of a Gastronomic Fair (floating ingredients, plates, particles)
const objects = [];

// Create a glowing central "Core" (representing the fire/cooking)
const coreGeo = new THREE.SphereGeometry(2, 32, 32);
const coreMat = new THREE.MeshStandardMaterial({ 
  color: 0xffa502, 
  emissive: 0xff4757,
  emissiveIntensity: 0.5,
  wireframe: true 
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.set(0, 0, -5);
scene.add(core);

// Create floating abstract "ingredients" (cubes, spheres, toruses)
const geometries = [
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.SphereGeometry(0.3, 16, 16),
  new THREE.TorusGeometry(0.4, 0.15, 16, 32),
  new THREE.ConeGeometry(0.4, 0.8, 16)
];

const colors = [0xff4757, 0xffa502, 0x2ecc71, 0xffffff, 0x1e272e];

for (let i = 0; i < 50; i++) {
  const geo = geometries[Math.floor(Math.random() * geometries.length)];
  const mat = new THREE.MeshStandardMaterial({ 
    color: colors[Math.floor(Math.random() * colors.length)],
    roughness: 0.2,
    metalness: 0.8
  });
  const mesh = new THREE.Mesh(geo, mat);
  
  // Position randomly along a deep path
  mesh.position.x = (Math.random() - 0.5) * 20;
  mesh.position.y = (Math.random() - 0.5) * 10;
  mesh.position.z = (Math.random() - 0.5) * 30 - 10;
  
  // Random rotation
  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;
  
  scene.add(mesh);
  objects.push({
    mesh: mesh,
    rotSpeedX: (Math.random() - 0.5) * 0.02,
    rotSpeedY: (Math.random() - 0.5) * 0.02,
    floatSpeed: (Math.random() - 0.5) * 0.01,
    floatOffset: Math.random() * Math.PI * 2
  });
}

// Particles (sparks / aromas)
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 40;
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
  size: 0.05,
  color: 0xffa502,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Rotate core
  core.rotation.y += 0.005;
  core.rotation.x += 0.002;

  // Animate floating objects
  objects.forEach(obj => {
    obj.mesh.rotation.x += obj.rotSpeedX;
    obj.mesh.rotation.y += obj.rotSpeedY;
    obj.mesh.position.y += Math.sin(elapsedTime + obj.floatOffset) * obj.floatSpeed;
  });

  // Animate particles
  particlesMesh.rotation.y = elapsedTime * 0.05;

  // Add subtle mouse interaction to camera
  camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, -5);

  renderer.render(scene, camera);
}

// Mouse movement for subtle parallax
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

// Scroll Animation - Move camera deep into the scene based on scroll
gsap.to(camera.position, {
  z: -15, // Move deep into the scene
  ease: "none",
  scrollTrigger: {
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: 1
  }
});

// Window resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

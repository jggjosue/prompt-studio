import * as THREE from 'three';

// --- THREE.JS SETUP ---
const canvas = document.querySelector('#c');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.015);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 3D SCENE OBJECTS (Creative Hub) ---
const objects = [];
const group = new THREE.Group();
scene.add(group);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xe0fe10, 2, 50); // Neon green
pointLight1.position.set(5, 5, -10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00aaff, 2, 50); // Cyan
pointLight2.position.set(-5, -5, -20);
scene.add(pointLight2);

// Materials
const neonMaterial = new THREE.MeshStandardMaterial({
  color: 0xe0fe10,
  emissive: 0xe0fe10,
  emissiveIntensity: 0.5,
  wireframe: true
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 0.9,
  opacity: 1,
  metalness: 0,
  roughness: 0.1,
  ior: 1.5,
  thickness: 0.5,
});

// Create Floating Screens/Monitors
const screenGeo = new THREE.PlaneGeometry(3, 1.7);
for (let i = 0; i < 15; i++) {
  const mesh = new THREE.Mesh(screenGeo, glassMaterial);
  mesh.position.set(
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 20,
    -Math.random() * 50 - 5
  );
  mesh.rotation.set(
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5
  );
  
  // Add wireframe edge to screens
  const edges = new THREE.EdgesGeometry(screenGeo);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x333333 }));
  mesh.add(line);
  
  group.add(mesh);
  objects.push(mesh);
}

// Create floating reels/cylinders
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 0.2, 32);
for (let i = 0; i < 10; i++) {
  const mesh = new THREE.Mesh(cylinderGeo, neonMaterial);
  mesh.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
    -Math.random() * 50 - 10
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  group.add(mesh);
  objects.push({ mesh, speedX: Math.random() * 0.01, speedY: Math.random() * 0.01 });
}

// Particles
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.5
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // Rotate group slightly based on time
  group.rotation.y = Math.sin(time * 0.1) * 0.1;

  // Animate reels and screens
  objects.forEach(obj => {
    if (obj.mesh) {
        obj.mesh.rotation.x += obj.speedX;
        obj.mesh.rotation.y += obj.speedY;
    } else {
        // Screens float slightly
        obj.position.y += Math.sin(time * 2 + obj.position.x) * 0.002;
    }
  });

  particlesMesh.rotation.y = time * 0.02;

  renderer.render(scene, camera);
}
animate();

// --- GSAP SCROLL ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// Camera path animation on scroll
ScrollTrigger.create({
  trigger: "#scroll-wrapper",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    // Move camera forward on Z axis
    const progress = self.progress;
    gsap.to(camera.position, {
        z: 10 - (progress * 40),
        y: Math.sin(progress * Math.PI * 2) * 2,
        x: Math.cos(progress * Math.PI) * 2,
        duration: 0.5,
        ease: "power1.out"
    });
    
    // Rotate camera slightly to look around
    gsap.to(camera.rotation, {
        z: Math.sin(progress * Math.PI * 2) * 0.1,
        duration: 0.5,
        ease: "power1.out"
    });
  }
});

// HTML Parallax Elements
const parallaxElements = document.querySelectorAll('.parallax');
window.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

    // 3D scene mouse parallax
    gsap.to(scene.rotation, {
        x: mouseY * 0.05,
        y: mouseX * 0.05,
        duration: 1
    });

    // HTML elements parallax
    parallaxElements.forEach(el => {
        const speed = el.getAttribute('data-speed') || 0.1;
        const x = mouseX * 100 * speed;
        const y = mouseY * 100 * speed;
        gsap.to(el, {
            x: x,
            y: y,
            duration: 1,
            ease: "power1.out"
        });
    });
});

// Animate Sections in on scroll
const sections = document.querySelectorAll('.content-block');
sections.forEach(section => {
    gsap.fromTo(section, 
        { opacity: 0, y: 50 },
        {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        }
    );
});


// --- UI INTERACTIONS ---

// Mobile Menu Toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
const mobileLinks = document.querySelectorAll('.mobile-link');

mobileBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    // Animate lines to X (simple implementation)
    const spans = mobileBtn.querySelectorAll('span');
    if (mobileNav.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        const spans = mobileBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
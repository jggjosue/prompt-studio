// --------------------------------------------------------
// Three.js Setup & Scene Creation
// --------------------------------------------------------

const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 0;
camera.position.x = 0;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Environment / Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00f3ff, 2);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

const purpleLight = new THREE.PointLight(0x9d00ff, 2);
purpleLight.position.set(-2, -3, 2);
scene.add(purpleLight);

// --------------------------------------------------------
// Objects Creation
// --------------------------------------------------------

// Group for all animated objects
const sceneGroup = new THREE.Group();
scene.add(sceneGroup);

// 1. Particle System (The "Data" or "Neural Network")
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  // Spread particles across a wide space
  posArray[i] = (Math.random() - 0.5) * 20; 
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02,
  color: 0x00f3ff,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
sceneGroup.add(particlesMesh);

// 2. Geometric Nodes (representing skills/modules)
const nodeMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x111111,
  wireframe: true,
  emissive: 0x9d00ff,
  emissiveIntensity: 0.5
});

// Central Core (AI)
const coreGeometry = new THREE.IcosahedronGeometry(1.5, 1);
const coreMesh = new THREE.Mesh(coreGeometry, nodeMaterial);
coreMesh.position.set(0, 0, -5);
sceneGroup.add(coreMesh);

// Orbiting module (Web3/Data)
const torusGeometry = new THREE.TorusGeometry(0.8, 0.2, 16, 100);
const torusMesh = new THREE.Mesh(torusGeometry, new THREE.MeshStandardMaterial({
  color: 0x00f3ff,
  wireframe: true
}));
torusMesh.position.set(4, 2, -10);
sceneGroup.add(torusMesh);

// --------------------------------------------------------
// Animation Loop
// --------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Subtle continuous rotation
  particlesMesh.rotation.y = elapsedTime * 0.05;
  particlesMesh.rotation.x = elapsedTime * 0.02;

  coreMesh.rotation.y = elapsedTime * 0.2;
  coreMesh.rotation.z = elapsedTime * 0.1;

  torusMesh.rotation.x = elapsedTime * 0.5;
  torusMesh.rotation.y = elapsedTime * 0.3;

  renderer.render(scene, camera);
}
animate();

// --------------------------------------------------------
// Window Resize Handling
// --------------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --------------------------------------------------------
// GSAP Scroll Animations
// --------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// 1. Camera Movement through 3D space
// Create a timeline connected to scroll
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1 // smooth scrubbing
  }
});

// Move camera forward into the scene
tl.to(camera.position, {
  z: -12,
  x: 2,
  ease: "none"
}, 0);

// Rotate the entire scene slightly as we move
tl.to(sceneGroup.rotation, {
  y: Math.PI * 0.5,
  ease: "none"
}, 0);

// Change light colors based on scroll
tl.to(pointLight.color, {
  r: 0.6, // shifting towards purple
  g: 0,
  b: 1,
  ease: "none"
}, 0);


// 2. HTML Parallax and Fade Effects
const scenes = gsap.utils.toArray('.scene');

scenes.forEach((scene, i) => {
  const elements = scene.querySelectorAll('.parallax-element');
  
  if(elements.length > 0) {
    // Fade up elements in each section
    gsap.fromTo(elements, 
      { 
        y: 100, 
        opacity: 0 
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: scene,
          start: "top 70%", // Trigger when section is 70% in view
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      }
    );
  }
});

// Subtle parallax for the glitch text
gsap.to(".glitch-text", {
  yPercent: -50,
  ease: "none",
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});

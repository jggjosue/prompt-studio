// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Basic Audio setup
let audioCtx;
let oscillator;
let isPlaying = false;

function playAmbientSound() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  
  if (isPlaying) {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
    }
    isPlaying = false;
    alert("Ambient sound paused.");
    return;
  }

  // Create a very simple ambient drone sound
  oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.value = 130.81; // C3
  
  // Slow attack
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 3);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
  isPlaying = true;
  alert("Ambient sound playing (synthetic drone).");
}

window.playAmbientSound = playAmbientSound;

// --- Three.js Setup ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070913); // Match bg dark
scene.fog = new THREE.FogExp2(0x070913, 0.05);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 1, 10);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 3D Objects ---

// 1. Breathing Sphere (Shader)
const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0x818cf8,
  wireframe: true,
  transparent: true,
  opacity: 0.8
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(2, 0, 0); // To the right for #breathe section
scene.add(sphere);

// 2. Zen Garden / Floating Stones
const stoneGeom = new THREE.DodecahedronGeometry(0.5);
const stoneMat = new THREE.MeshStandardMaterial({
  color: 0x334155,
  roughness: 0.8,
  metalness: 0.1
});

const stones = new THREE.Group();
for(let i=0; i<10; i++) {
  const stone = new THREE.Mesh(stoneGeom, stoneMat);
  stone.position.x = (Math.random() - 0.5) * 10 - 2; // Offset to left
  stone.position.y = (Math.random() - 0.5) * 5;
  stone.position.z = (Math.random() - 0.5) * 10 - 10;
  
  stone.rotation.x = Math.random() * Math.PI;
  stone.rotation.y = Math.random() * Math.PI;
  
  const scale = 0.5 + Math.random() * 1.5;
  stone.scale.set(scale, scale, scale);
  
  stones.add(stone);
}
scene.add(stones);

// 3. Serene Lake (Plane with basic waves via vertex displacement in render loop)
const lakeGeom = new THREE.PlaneGeometry(30, 30, 32, 32);
// Rotate to lie flat
lakeGeom.rotateX(-Math.PI / 2);

const lakeMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  transparent: true,
  opacity: 0.6,
  roughness: 0.1,
  metalness: 0.8
});
const lake = new THREE.Mesh(lakeGeom, lakeMat);
lake.position.set(0, -2, -20);
scene.add(lake);

// 4. Light Particles
const particlesGeom = new THREE.BufferGeometry();
const particlesCount = 300;
const posArray = new Float32Array(particlesCount * 3);
for(let i=0; i < particlesCount * 3; i++) {
  // Spread across the scene Z depth
  posArray[i] = (Math.random() - 0.5) * 25;
}
particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
  size: 0.05,
  color: 0x818cf8,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeom, particlesMat);
scene.add(particlesMesh);


// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x818cf8, 2);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

// --- Animation Loop ---
const clock = new THREE.Clock();

function tick() {
  const elapsedTime = clock.getElapsedTime();

  // Breathing Sphere Animation
  const breatheScale = 1 + Math.sin(elapsedTime * 1.5) * 0.15;
  sphere.scale.set(breatheScale, breatheScale, breatheScale);
  sphere.rotation.y = elapsedTime * 0.1;
  sphere.rotation.x = elapsedTime * 0.05;

  // Floating Stones Animation
  stones.children.forEach((stone, idx) => {
    stone.position.y += Math.sin(elapsedTime * 0.5 + idx) * 0.005;
    stone.rotation.x += 0.002;
    stone.rotation.y += 0.003;
  });

  // Lake Waves Animation
  const positions = lakeGeom.attributes.position;
  for(let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    // Simple sine wave calculation based on x, z, and time
    const y = Math.sin(x * 0.5 + elapsedTime) * 0.2 + Math.cos(z * 0.5 + elapsedTime) * 0.2;
    positions.setY(i, y);
  }
  lakeGeom.attributes.position.needsUpdate = true;

  // Particles Slow Rotation
  particlesMesh.rotation.y = elapsedTime * 0.05;

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

tick();

// --- Resize Handling ---
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


// --- GSAP Scroll Animations ---

// 1. DOM Reveal & Parallax
gsap.utils.toArray('.panel').forEach(panel => {
  const content = panel.querySelector('.content');
  const speed = content.getAttribute('data-parallax') || 0;
  
  // Fade and slide up as the panel enters
  gsap.fromTo(content, 
    { opacity: 0, y: 100 },
    { 
      opacity: 1, 
      y: 0,
      duration: 1.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: panel,
        start: "top 70%",
        end: "top 30%",
        toggleActions: "play none none reverse"
      }
    }
  );

  // Parallax effect on scroll
  if (speed) {
    gsap.to(content, {
      y: () => (window.innerHeight * speed),
      ease: "none",
      scrollTrigger: {
        trigger: panel,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }
});

// 2. Camera Journey through the 3D scene
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5 // Smoother scrub
  }
});

// Initial -> Breathe Section
tl.to(camera.position, { z: 2, x: 1, y: 0.5, duration: 1 })
  .to(camera.rotation, { y: 0.2, x: -0.1, duration: 1 }, "<")
  .to(sphere.material, { opacity: 1, wireframe: false, duration: 1 }, "<")
  
// Breathe -> Explore Section (Stones)
  .to(camera.position, { z: -6, x: -1.5, y: -0.5, duration: 1.5 })
  .to(camera.rotation, { y: -0.3, x: 0.1, duration: 1.5 }, "<")
  .to(stones.rotation, { y: Math.PI, duration: 1.5 }, "<") // Rotate the whole stone group
  
// Explore -> Sleep Section (Lake)
  .to(camera.position, { z: -16, y: -1, x: 0, duration: 1.5 })
  .to(camera.rotation, { y: 0, x: -0.2, duration: 1.5 }, "<")
  
// Sleep -> Join Section (CTA)
  .to(camera.position, { z: -10, y: 3, x: 0, duration: 1.5 })
  .to(camera.rotation, { x: -0.4, duration: 1.5 }, "<")
  // Speed up particles
  .to(particlesMesh.rotation, { y: Math.PI * 2, duration: 1.5 }, "<");

// Change Light Colors dynamically
tl.to(pointLight.color, { r: 0.2, g: 0.9, b: 0.7, duration: 1.5 }, 1) // Mint
  .to(pointLight.color, { r: 0.4, g: 0.2, b: 0.8, duration: 1.5 }, 2.5) // Deep Purple
  .to(pointLight.color, { r: 0.9, g: 0.5, b: 0.2, duration: 1.5 }, 4); // Warm sunset

// Rotate and expand sphere based on scroll
gsap.to(sphere.rotation, {
  y: Math.PI * 4,
  x: Math.PI * 2,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});

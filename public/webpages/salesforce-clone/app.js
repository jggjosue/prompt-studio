// Initialize Three.js Scene
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

// Fog for depth
scene.fog = new THREE.FogExp2(0x050b14, 0.04);

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

// --- 3D Objects Setup ---

// 1. Core Sphere (Represents CRM Engine)
const coreGeometry = new THREE.IcosahedronGeometry(1.5, 1);
const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x7000ff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

// Inner solid core
const innerCoreGeo = new THREE.IcosahedronGeometry(1.2, 2);
const innerCoreMat = new THREE.MeshPhongMaterial({
    color: 0x00e5ff,
    emissive: 0x005566,
    shininess: 100
});
const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
core.add(innerCore);

// 2. Data Nodes (Particles/Leads)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 300;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles in a wide area
    posArray[i] = (Math.random() - 0.5) * 30;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// 3. Pipeline Rings
const ringGroup = new THREE.Group();
for(let i=0; i<3; i++) {
    const ringGeo = new THREE.TorusGeometry(3 + i, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ringGroup.add(ring);
}
scene.add(ringGroup);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x00e5ff, 2, 20);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

// --- Animation & Scroll Logic ---

// Clock for continuous rotation
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Continuous subtle rotations
    core.rotation.y = elapsedTime * 0.2;
    core.rotation.x = elapsedTime * 0.1;
    
    ringGroup.rotation.y = elapsedTime * 0.05;
    ringGroup.rotation.z = elapsedTime * 0.02;

    particlesMesh.rotation.y = elapsedTime * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// GSAP ScrollTrigger setup
gsap.registerPlugin(ScrollTrigger);

// Timeline for Camera Movement based on Scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".content",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Section 1: Qualify (Platform)
tl.to(camera.position, { x: 5, y: 2, z: 5 }, 0)
  .to(core.position, { x: -3 }, 0)
  .to(core.scale, { x: 1.5, y: 1.5, z: 1.5 }, 0);

// Section 2: Pipeline
tl.to(camera.position, { x: -4, y: -1, z: 8 }, 1)
  .to(core.position, { x: 3 }, 1)
  .to(ringGroup.rotation, { x: Math.PI / 4 }, 1);

// Section 3: Support
tl.to(camera.position, { x: 4, y: 3, z: 6 }, 2)
  .to(core.position, { x: -2, y: -2 }, 2)
  .to(particlesMaterial, { color: new THREE.Color(0x7000ff) }, 2);

// Section 4: Analytics
tl.to(camera.position, { x: 0, y: 0, z: 15 }, 3)
  .to(core.position, { x: 0, y: 0 }, 3)
  .to(core.scale, { x: 2, y: 2, z: 2 }, 3)
  .to(particlesMaterial, { color: new THREE.Color(0x00e5ff) }, 3);

// Section 5: Demo (Reset/End)
tl.to(camera.position, { x: 0, y: 5, z: 12 }, 4)
  .to(core.position, { y: -3 }, 4);


// --- Interactive Elements ---

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(5, 11, 20, 0.95)';
        nav.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    } else {
        nav.style.background = 'linear-gradient(to bottom, rgba(5, 11, 20, 0.9), transparent)';
        nav.style.borderBottom = 'none';
    }
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate text on load
gsap.from(".animate-text", {
    y: 30,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out"
});

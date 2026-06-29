// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    // Simple animation for hamburger lines
    const spans = hamburger.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when a link is clicked
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
            hamburger.click();
        }
    });
});

// Setup GSAP
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// THREE.JS SETUP
// ==========================================
const canvasContainer = document.getElementById('canvas-container');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Initial camera position
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

// ==========================================
// 3D OBJECTS
// ==========================================

// 1. Central Artifact (Icosahedron)
const artifactGeometry = new THREE.IcosahedronGeometry(3, 1); // 1 detail level for some geometry
const artifactMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.8,
    wireframe: true, // Start wireframe to represent "the void/awakening"
    transparent: true,
    opacity: 0.8
});
const artifact = new THREE.Mesh(artifactGeometry, artifactMaterial);
scene.add(artifact);

// Inside the artifact: A solid glowing core
const coreGeometry = new THREE.IcosahedronGeometry(2, 2);
const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.4,
    metalness: 0.9,
    emissive: 0x000000,
    emissiveIntensity: 0.5
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
artifact.add(core); // Add core to artifact so they rotate together

// 2. Particles (The Void / Stars)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles across a large area
    posArray[i] = (Math.random() - 0.5) * 100;
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

// ==========================================
// LIGHTING
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Main dramatic light
const pointLight1 = new THREE.PointLight(0x4287f5, 2, 50); // Blueish start
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xd4af37, 1, 50); // Gold accent
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);

// ==========================================
// ANIMATION LOOP
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Constant slow rotation
    artifact.rotation.y = elapsedTime * 0.1;
    artifact.rotation.x = elapsedTime * 0.05;

    particlesMesh.rotation.y = elapsedTime * 0.02;

    renderer.render(scene, camera);
}
animate();

// ==========================================
// RESIZE HANDLER
// ==========================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// GSAP SCROLL ANIMATIONS
// ==========================================

// Timeline for the 3D scene linked to scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // Smooth scrubbing
    }
});

// 1. Intro -> Conflict (Move closer, change color to red/orange, wireframe off)
tl.to(camera.position, { z: 12, ease: "power1.inOut" }, 0)
  .to(pointLight1.color, { r: 1, g: 0.1, b: 0.1 }, 0) // Turn red
  .to(pointLight2.color, { r: 0.8, g: 0.2, b: 0 }, 0) // Deep orange
  .to(coreMaterial.emissive, { r: 0.5, g: 0, b: 0 }, 0)
  .to(artifact.rotation, { z: Math.PI / 2 }, 0)
  .to(scene.fog, { density: 0.04 }, 0); // Thicker fog

// 2. Conflict -> Discovery (Move very close, change to Gold/Cyan)
tl.to(camera.position, { z: 7, ease: "power1.inOut" }, 0.25)
  .to(artifactMaterial, { wireframe: false, opacity: 1 }, 0.25)
  .to(pointLight1.color, { r: 0, g: 0.8, b: 1 }, 0.25) // Cyan
  .to(pointLight2.color, { r: 0.8, g: 0.7, b: 0.2 }, 0.25) // Gold
  .to(coreMaterial.emissive, { r: 0.2, g: 0.6, b: 0.8 }, 0.25)
  .to(artifact.rotation, { z: Math.PI }, 0.25)
  .to(particlesMesh.rotation, { x: Math.PI / 4 }, 0.25);

// 3. Discovery -> Climax (Zoom inside or super close, intense white light)
tl.to(camera.position, { z: 4, ease: "power1.inOut" }, 0.5)
  .to(pointLight1, { intensity: 5 }, 0.5)
  .to(pointLight2, { intensity: 5 }, 0.5)
  .to(pointLight1.color, { r: 1, g: 1, b: 1 }, 0.5) // White
  .to(pointLight2.color, { r: 1, g: 1, b: 1 }, 0.5) // White
  .to(coreMaterial.emissive, { r: 1, g: 1, b: 1 }, 0.5)
  .to(artifact.rotation, { x: Math.PI * 2, y: Math.PI * 2 }, 0.5)
  .to(particlesMaterial, { size: 0.1, color: new THREE.Color(0xffaa00) }, 0.5); // Particles explode in size/color

// 4. Climax -> Ending (Zoom out slowly, calm colors, slow rotation)
tl.to(camera.position, { z: 25, ease: "power1.inOut" }, 0.75)
  .to(pointLight1, { intensity: 1.5 }, 0.75)
  .to(pointLight2, { intensity: 1.5 }, 0.75)
  .to(pointLight1.color, { r: 0.2, g: 0.5, b: 0.8 }, 0.75) // Calm blue
  .to(pointLight2.color, { r: 0.1, g: 0.8, b: 0.5 }, 0.75) // Calm green
  .to(coreMaterial.emissive, { r: 0, g: 0, b: 0 }, 0.75) // Core turns off
  .to(artifactMaterial, { wireframe: true, opacity: 0.3 }, 0.75)
  .to(particlesMaterial, { size: 0.03, color: new THREE.Color(0xffffff) }, 0.75)
  .to(scene.fog, { density: 0.01 }, 0.75);


// ==========================================
// DOM ELEMENT ANIMATIONS
// ==========================================

// Parallax for hero text
gsap.to(".parallax-text", {
    yPercent: 100,
    ease: "none",
    scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// Fade in for Narrative Cards
gsap.utils.toArray('.narrative-card').forEach(card => {
    gsap.from(card, {
        y: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
            trigger: card,
            start: "top 80%", // When top of card hits 80% of viewport
            toggleActions: "play none none reverse"
        }
    });
});

// Timeline Points animation
gsap.utils.toArray('.timeline-point').forEach((point, i) => {
    gsap.from(point, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.1,
        scrollTrigger: {
            trigger: ".timeline-visual",
            start: "top 70%",
            toggleActions: "play none none reverse"
        }
    });
});

// Grid Items animation
gsap.utils.toArray('.grid-item, .card').forEach(item => {
    gsap.from(item, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });
});

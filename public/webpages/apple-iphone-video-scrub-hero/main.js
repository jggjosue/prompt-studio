// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- Three.js Setup ---
const container = document.getElementById('canvas-container');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
// No background color so it's transparent over our CSS background
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

// Mock Smartphone Model (Enhanced with details)
const phoneGroup = new THREE.Group();

// 1. Main body
const bodyGeo = new THREE.BoxGeometry(2.5, 5.2, 0.25);
const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0x1c1c1e, // Titanium dark
    metalness: 0.8, 
    roughness: 0.2 
});
const body = new THREE.Mesh(bodyGeo, bodyMat);
phoneGroup.add(body);

// 2. Dynamic Screen Texture
const screenCanvas = document.createElement('canvas');
screenCanvas.width = 512;
screenCanvas.height = 1024;
const ctx = screenCanvas.getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 512, 1024);
gradient.addColorStop(0, '#0a0a0a');
gradient.addColorStop(0.4, '#29004d');
gradient.addColorStop(0.7, '#8f00ff');
gradient.addColorStop(1, '#ff007f');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 512, 1024);
ctx.beginPath();
ctx.arc(256, 800, 400, 0, Math.PI * 2);
ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
ctx.fill();

const screenTex = new THREE.CanvasTexture(screenCanvas);

// Screen Mesh
const screenGeo = new THREE.BoxGeometry(2.35, 5.05, 0.02);
const screenMat = new THREE.MeshStandardMaterial({ 
    map: screenTex,
    metalness: 0.1, 
    roughness: 0.1,
    emissive: 0x111111
});
const screen = new THREE.Mesh(screenGeo, screenMat);
screen.position.z = 0.13;
phoneGroup.add(screen);

// 3. Camera Island (back)
const islandGeo = new THREE.BoxGeometry(0.9, 1.0, 0.04);
const islandMat = new THREE.MeshStandardMaterial({ 
    color: 0x111111, 
    metalness: 0.7, 
    roughness: 0.3 
});
const island = new THREE.Mesh(islandGeo, islandMat);
island.position.set(-0.65, 1.9, -0.14);
phoneGroup.add(island);

// 4. Lenses
const lensGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 32);
const lensMat = new THREE.MeshStandardMaterial({ 
    color: 0x000000, 
    metalness: 0.9, 
    roughness: 0.05 
});
lensGeo.rotateX(Math.PI / 2);

const lens1 = new THREE.Mesh(lensGeo, lensMat);
lens1.position.set(-0.25, 0.25, -0.02);
island.add(lens1);

const lens2 = new THREE.Mesh(lensGeo, lensMat);
lens2.position.set(-0.25, -0.25, -0.02);
island.add(lens2);

const lens3 = new THREE.Mesh(lensGeo, lensMat);
lens3.position.set(0.25, 0, -0.02);
island.add(lens3);

scene.add(phoneGroup);

// Update reference from phone to phoneGroup for animations
const phone = phoneGroup;

// Initial Position
camera.position.z = 10;
phone.rotation.y = -Math.PI / 4; // Start at an angle
phone.rotation.x = 0.2;

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();


// --- GSAP Scroll Animations ---

// Master Timeline for 3D Phone Scrubbing
const phoneTl = gsap.timeline({
    scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing effect
    }
});

// Hero to Design (Rotate to front)
phoneTl.to(phone.rotation, {
    y: 0,
    x: 0,
    ease: "power1.inOut"
}, 0);

phoneTl.to(phone.position, {
    x: 2, // Move right for left text
    ease: "power1.inOut"
}, 0); // At the same time

// Design to Display (Rotate to show screen, zoom in)
phoneTl.to(phone.rotation, {
    y: Math.PI / 8,
    x: -0.1,
    ease: "power1.inOut"
}, 0.2); // Relative timing (0 to 1)

phoneTl.to(phone.position, {
    x: -2, // Move left for right text
    z: 2, // Zoom in
    ease: "power1.inOut"
}, 0.2);

// Display to Camera (Rotate to show back)
phoneTl.to(phone.rotation, {
    y: Math.PI, // Show back
    x: 0,
    ease: "power1.inOut"
}, 0.4);

phoneTl.to(phone.position, {
    x: 2,
    z: 1,
    ease: "power1.inOut"
}, 0.4);

// Camera to Performance (Rotate dramatically, show chip internally - simulated)
phoneTl.to(phone.rotation, {
    y: Math.PI * 2 + Math.PI / 4, 
    x: 0.5,
    z: -0.2,
    ease: "power1.inOut"
}, 0.6);

phoneTl.to(phone.position, {
    x: 0,
    y: 1,
    z: 3,
    ease: "power1.inOut"
}, 0.6);

// Performance to Battery (Flat and sleek)
phoneTl.to(phone.rotation, {
    y: Math.PI * 2,
    x: 0,
    z: 0,
    ease: "power1.inOut"
}, 0.8);

phoneTl.to(phone.position, {
    x: -2,
    y: 0,
    z: 0,
    ease: "power1.inOut"
}, 0.8);

// Battery to Pricing (Center and proud)
phoneTl.to(phone.rotation, {
    y: Math.PI * 2,
    x: 0,
    z: 0,
    ease: "power1.inOut"
}, 0.95);

phoneTl.to(phone.position, {
    x: 0,
    y: 0,
    z: 0,
    ease: "power1.inOut"
}, 0.95);

// Parallax Text Reveal
const parallaxTexts = document.querySelectorAll('.parallax-text');

parallaxTexts.forEach(text => {
    gsap.fromTo(text, 
        { 
            y: 100, 
            opacity: 0 
        }, 
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: text,
                start: "top 85%", // Trigger when top of element is 85% down viewport
                end: "top 50%",
                scrub: true, // Smooth reveal based on scroll
            }
        }
    );
});

// Fade out Hero text on scroll
gsap.to('.hero-title, .hero-subtitle', {
    opacity: 0,
    y: -50,
    scrollTrigger: {
        trigger: '#hero',
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

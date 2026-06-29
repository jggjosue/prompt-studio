import * as THREE from 'three';

// ----------------------------------------------------
// 1. Setup Three.js Scene
// ----------------------------------------------------
const canvas = document.querySelector('#webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize for high DPI

const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Initial position

// ----------------------------------------------------
// 2. Create the 3D Cube
// ----------------------------------------------------
// We'll create a cube where each face can have different visual properties
const geometry = new THREE.BoxGeometry(2, 2, 2);

// Materials for the 6 faces. 
// For a premium look, we'll use MeshPhysicalMaterial for glass-like, reflective properties
const commonMaterialProps = {
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.9, // glass-like
    ior: 1.5,
    thickness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
};

const materials = [
    new THREE.MeshPhysicalMaterial({ ...commonMaterialProps, color: 0x00ffcc }), // right
    new THREE.MeshPhysicalMaterial({ ...commonMaterialProps, color: 0xbf00ff }), // left
    new THREE.MeshPhysicalMaterial({ ...commonMaterialProps, color: 0x111111 }), // top
    new THREE.MeshPhysicalMaterial({ ...commonMaterialProps, color: 0x333333 }), // bottom
    new THREE.MeshPhysicalMaterial({ ...commonMaterialProps, color: 0xff0055 }), // front
    new THREE.MeshPhysicalMaterial({ ...commonMaterialProps, color: 0x0055ff }), // back
];

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// Add an inner wireframe cube for extra tech detail
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
const wireframeCube = new THREE.LineSegments(edges, lineMaterial);
wireframeCube.scale.set(1.05, 1.05, 1.05); // slightly larger
cube.add(wireframeCube);

// Add Particles around the cube
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles randomly
    posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// ----------------------------------------------------
// 3. Lighting
// ----------------------------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x00ffcc, 50, 100);
pointLight1.position.set(2, 3, 4);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xbf00ff, 50, 100);
pointLight2.position.set(-2, -3, -4);
scene.add(pointLight2);

// ----------------------------------------------------
// 4. GSAP Scroll Animations
// ----------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// Timeline to control Cube Rotation and Camera Position based on scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Define keyframes for each section
// Note: Sections are ~100vh each, so we map rotations accordingly

// 1. Home to Cube Intro (Zoom in, slight rotate)
tl.to(cube.rotation, { x: 0.5, y: 1.0, z: 0.2, ease: "power1.inOut" }, 0)
  .to(camera.position, { z: 4, ease: "power1.inOut" }, 0);

// 2. Cube Intro to Projects (Rotate to right face, move camera left)
tl.to(cube.rotation, { x: 0.2, y: Math.PI / 2, z: 0, ease: "power1.inOut" }, 1)
  .to(camera.position, { x: -1.5, ease: "power1.inOut" }, 1);

// 3. Projects to Services (Rotate to left face, move camera right)
tl.to(cube.rotation, { x: -0.2, y: -Math.PI / 2, z: 0.1, ease: "power1.inOut" }, 2)
  .to(camera.position, { x: 1.5, z: 3.5, ease: "power1.inOut" }, 2);

// 4. Services to Skills (Rotate to top face, center camera)
tl.to(cube.rotation, { x: -Math.PI / 2, y: 0, z: 0, ease: "power1.inOut" }, 3)
  .to(camera.position, { x: 0, z: 5, ease: "power1.inOut" }, 3)
  .to(cube.position, { y: -1, ease: "power1.inOut" }, 3); // move cube down slightly

// 5. Skills to Process (Rotate to bottom face)
tl.to(cube.rotation, { x: Math.PI / 2, y: 0.5, z: 0.2, ease: "power1.inOut" }, 4)
  .to(cube.position, { y: 0, x: -1.5, ease: "power1.inOut" }, 4);

// 6. Process to Pricing (Rotate back to front, but zoomed out)
tl.to(cube.rotation, { x: Math.PI * 2, y: Math.PI * 2, z: 0, ease: "power1.inOut" }, 5)
  .to(cube.position, { x: 0, y: 0, ease: "power1.inOut" }, 5)
  .to(camera.position, { z: 7, ease: "power1.inOut" }, 5);

// 7. Pricing to Contact (Rotate to back face, fast spin)
tl.to(cube.rotation, { x: Math.PI * 2.5, y: Math.PI * 3, z: Math.PI, ease: "power1.inOut" }, 6)
  .to(camera.position, { z: 3, ease: "power1.inOut" }, 6);


// ----------------------------------------------------
// 4.5 GSAP Parallax for HTML Elements
// ----------------------------------------------------
// Add parallax effect to headings
gsap.utils.toArray('h1, h2, .subtitle').forEach(elem => {
    gsap.fromTo(elem, 
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: elem,
                start: "top 90%",
                end: "top 50%",
                scrub: 1
            }
        }
    );
});

// Add parallax and stagger to glass cards
gsap.utils.toArray('.cards-grid, .skills-container, .process-list').forEach(container => {
    const children = container.children;
    gsap.fromTo(children, 
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: container,
                start: "top 85%",
                end: "top 40%",
                scrub: 1
            }
        }
    );
});

// Add a distinct Y-axis parallax speed to some cards based on their index
gsap.utils.toArray('.glass-card').forEach((card, i) => {
    // slightly different speed for odd/even cards to create depth
    const yOffset = i % 2 === 0 ? -50 : 50;
    gsap.to(card, {
        y: yOffset,
        ease: "none",
        scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// ----------------------------------------------------
// 5. Render Loop & Continuous Animation
// ----------------------------------------------------
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Constant slow rotation for the particle mesh
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Slight continuous hover effect for the cube (independent of scroll)
    // We add a tiny offset to the base position
    const hoverY = Math.sin(elapsedTime * 2) * 0.1;
    // To not conflict with GSAP positional tweens entirely, 
    // we would ideally group the cube in another Object3D and animate the group.
    // For simplicity, we apply a small bobbing to the wireframe instead.
    wireframeCube.position.y = hoverY;

    renderer.render(scene, camera);
}

animate();

// ----------------------------------------------------
// 6. Event Listeners (Resize, Mouse Move for Parallax)
// ----------------------------------------------------
window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Simple Mouse Parallax effect on the camera
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Add parallax to render loop (interferes slightly with GSAP, so we just tilt the scene slightly)
gsap.ticker.add(() => {
    targetX = mouseX * 0.0005;
    targetY = mouseY * 0.0005;
    
    // Tilt the entire scene slightly based on mouse
    scene.rotation.y += 0.05 * (targetX - scene.rotation.y);
    scene.rotation.x += 0.05 * (targetY - scene.rotation.x);
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
    // Simple toggle (in production, add a nice animation class)
    if(navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(5,5,5,0.9)';
        navLinks.style.padding = '20px';
    }
});

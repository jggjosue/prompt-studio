/**
 * 3D Artist Pipeline Breakdown - Cinematic Scroll Experience
 * Uses Three.js for 3D rendering and GSAP/ScrollTrigger for scroll-based animations.
 */

// Basic Three.js setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.03);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 10);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Responsive handling
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0); // starts off
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0x7c3aed, 0); // purple accent
pointLight1.position.set(-3, 2, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00d2ff, 0); // blue accent
pointLight2.position.set(3, -2, 2);
scene.add(pointLight2);

// ----------------------------------------------------
// Object Creation for Different Stages
// ----------------------------------------------------
const objectsGroup = new THREE.Group();
scene.add(objectsGroup);

// Master Object: A stylized cube/character that evolves
const geometry = new THREE.IcosahedronGeometry(2, 0); // Starts very low poly
const material = new THREE.MeshStandardMaterial({
    color: 0x444444,
    wireframe: true, // Stage 1/2/3: Wireframe/Blocking
    transparent: true,
    opacity: 0
});
const mainMesh = new THREE.Mesh(geometry, material);
mainMesh.castShadow = true;
mainMesh.receiveShadow = true;
objectsGroup.add(mainMesh);

// Helper particles (floating in background)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 300;
const posArray = new Float32Array(particlesCount * 3);
for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 30;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.4
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);


// ----------------------------------------------------
// GSAP & ScrollTrigger Animations
// ----------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// Parallax text fading for each section
const sections = document.querySelectorAll('.section .content');
sections.forEach((section) => {
    gsap.fromTo(section, 
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play reverse play reverse'
            }
        }
    );
});

// Master Timeline for 3D Transitions synced to Scroll
// We'll create a single scrollTrigger over the entire body length
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1 // smooth scrubbing
    }
});

// Helper variables for positions based on alignment
// align-left text means we want object on right, and vice versa.
const rightPos = 2.5;
const leftPos = -2.5;
const centerPos = 0;

// Hero -> Idea (Fades in wireframe)
tl.to(mainMesh.material, { opacity: 1, duration: 0.5 })
  .to(objectsGroup.position, { x: rightPos, y: 0, z: 0, duration: 1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 0.5, y: Math.PI * 0.25, duration: 1 }, "<");

// Idea -> References (Floating particles move, object goes to left)
tl.to(objectsGroup.position, { x: leftPos, duration: 1 })
  .to(mainMesh.rotation, { x: Math.PI, y: Math.PI * 0.5, duration: 1 }, "<")
  .to(particlesMesh.rotation, { y: Math.PI * 0.5, duration: 1 }, "<");

// References -> Blocking (Object stays wireframe, scales slightly)
tl.to(objectsGroup.position, { x: rightPos, duration: 1 })
  .to(mainMesh.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 1.5, y: Math.PI * 0.75, duration: 1 }, "<");

// Blocking -> Modeling (Wireframe OFF, solid color ON, higher poly)
tl.to(objectsGroup.position, { x: leftPos, duration: 1 })
  .to(mainMesh.material, { wireframe: false, color: 0x888888, duration: 0.1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 2, y: Math.PI, duration: 1 }, "<");
// Note: In a real app, we'd swap geometries here (e.g. higher detail mesh)
// For now, we simulate by keeping the shape but changing material.

// Modeling -> Sculpting (Slight deformation / rotation)
tl.to(objectsGroup.position, { x: rightPos, duration: 1 })
  .to(mainMesh.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 2.5, y: Math.PI * 1.25, duration: 1 }, "<");

// Sculpting -> UVs (Show UV checker map - simulated by changing color/roughness)
tl.to(objectsGroup.position, { x: leftPos, duration: 1 })
  .to(mainMesh.material, { color: 0xaaaaaa, wireframe: true, duration: 0.1 }, "<") // Simulate UV unwrap look
  .to(mainMesh.rotation, { x: Math.PI * 3, y: Math.PI * 1.5, duration: 1 }, "<");

// UVs -> Texturing (Wireframe OFF, vibrant color ON)
tl.to(objectsGroup.position, { x: rightPos, duration: 1 })
  .to(mainMesh.material, { wireframe: false, color: 0x7c3aed, roughness: 0.7, metalness: 0.1, duration: 0.1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 3.5, y: Math.PI * 1.75, duration: 1 }, "<");

// Texturing -> Materials (Add gloss/metalness)
tl.to(objectsGroup.position, { x: leftPos, duration: 1 })
  .to(mainMesh.material, { roughness: 0.1, metalness: 0.8, duration: 1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 4, y: Math.PI * 2, duration: 1 }, "<");

// Materials -> Lighting (Turn on lights dramatically)
tl.to(objectsGroup.position, { x: rightPos, duration: 1 })
  .to(directionalLight, { intensity: 2, duration: 1 }, "<")
  .to(pointLight1, { intensity: 5, distance: 10, duration: 1 }, "<")
  .to(pointLight2, { intensity: 5, distance: 10, duration: 1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 4.5, y: Math.PI * 2.25, duration: 1 }, "<");

// Lighting -> Rigging (Scale down, move left)
tl.to(objectsGroup.position, { x: leftPos, duration: 1 })
  .to(mainMesh.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 5, y: Math.PI * 2.5, duration: 1 }, "<");

// Rigging -> Animation (Rapid rotation/bouncing simulation)
tl.to(objectsGroup.position, { x: rightPos, duration: 1 })
  .to(mainMesh.position, { y: 1, duration: 0.5, yoyo: true, repeat: 1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 6, y: Math.PI * 4, duration: 1 }, "<");

// Animation -> Render (Center, camera moves in, lights max)
tl.to(objectsGroup.position, { x: leftPos, duration: 1 })
  .to(camera.position, { z: 6, duration: 1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 6.5, y: Math.PI * 4.5, duration: 1 }, "<");

// Render -> Final Composition (Center object, epic final look)
tl.to(objectsGroup.position, { x: centerPos, duration: 1 })
  .to(mainMesh.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1 }, "<")
  .to(camera.position, { z: 8, duration: 1 }, "<")
  .to(mainMesh.rotation, { x: Math.PI * 7, y: Math.PI * 5, duration: 1 }, "<")
  .to(particlesMaterial, { size: 0.1, color: 0xffffff, opacity: 0.8, duration: 1 }, "<");


// ----------------------------------------------------
// Render Loop
// ----------------------------------------------------
const clock = new THREE.Clock();
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

function tick() {
    const elapsedTime = clock.getElapsedTime();

    // Subtle idle animation
    mainMesh.rotation.x += 0.002;
    mainMesh.rotation.y += 0.003;
    
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Mouse parallax effect
    targetX = mouseX * 2;
    targetY = mouseY * 2;
    
    objectsGroup.rotation.y += 0.05 * (targetX - objectsGroup.rotation.y);
    objectsGroup.rotation.x += 0.05 * (targetY - objectsGroup.rotation.x);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();

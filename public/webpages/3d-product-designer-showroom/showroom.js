// Initialize Three.js
const canvas = document.querySelector('#webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
// No background color, let CSS background show through via alpha: true

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00d2ff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xff0055, 2, 20);
pointLight.position.set(-5, -2, 2);
scene.add(pointLight);

// Create 3D Objects for Showroom
const objectsGroup = new THREE.Group();
scene.add(objectsGroup);

// Helper to create abstract "screens" or "UI cards"
function createScreen(width, height, color, x, y, z, rx, ry, rz) {
    const geometry = new THREE.BoxGeometry(width, height, 0.1);
    const material = new THREE.MeshPhysicalMaterial({ 
        color: color, 
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
        transmission: 0.5,
        clearcoat: 1.0
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add wireframe edge for tech look
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.5 }));
    mesh.add(line);

    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    
    return mesh;
}

// 1. Home Section Objects (Abstract shapes floating)
const screen1 = createScreen(3, 2, 0x111111, 2, 0, 0, 0, -0.3, 0);
objectsGroup.add(screen1);

const screen2 = createScreen(1.5, 3, 0x222222, -2.5, 1, -2, 0.1, 0.4, -0.1);
objectsGroup.add(screen2);

// 2. Showroom Prototypes (Further down Z axis)
const proto1 = createScreen(4, 2.5, 0x050505, -3, -5, -8, 0, 0.5, 0);
objectsGroup.add(proto1);
const proto2 = createScreen(2, 4, 0x1a1a1a, 3, -4, -10, 0, -0.4, 0.1);
objectsGroup.add(proto2);

// 3. Case Studies
const case1 = createScreen(3, 3, 0x0a0a0a, 0, -10, -15, 0.2, 0, 0);
objectsGroup.add(case1);

// 4. Design Process (Wireframes layout)
const processGroup = new THREE.Group();
for(let i=0; i<5; i++) {
    const p = createScreen(1, 1.5, 0x000000, -2 + i*1.2, -15, -20 - i, 0, 0.2, 0);
    processGroup.add(p);
}
objectsGroup.add(processGroup);

// 5. Systems (Grid of tokens)
const sysScreen = createScreen(5, 3, 0x111111, 0, -22, -25, -0.2, 0, 0);
objectsGroup.add(sysScreen);


// Animation Loop
const clock = new THREE.Clock();

function tick() {
    const elapsedTime = clock.getElapsedTime();
    
    // Gentle floating animation
    screen1.position.y = Math.sin(elapsedTime * 0.5) * 0.2;
    screen2.position.y = 1 + Math.sin(elapsedTime * 0.6 + 1) * 0.2;
    
    proto1.position.y = -5 + Math.sin(elapsedTime * 0.4) * 0.3;
    proto2.position.y = -4 + Math.cos(elapsedTime * 0.5) * 0.3;

    sysScreen.rotation.y = Math.sin(elapsedTime * 0.2) * 0.1;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick();

// GSAP ScrollTrigger setup
gsap.registerPlugin(ScrollTrigger);

// We animate the camera down the Y and Z axis as user scrolls
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Animate camera position matching the sections
tl.to(camera.position, {
    y: -5,
    z: 2,
    ease: "power1.inOut"
}, 0) // Showroom
.to(camera.rotation, {
    x: -0.1,
    y: 0.2
}, 0)
.to(camera.position, {
    y: -10,
    z: -5,
    ease: "power1.inOut"
}, 1) // Case studies
.to(camera.rotation, {
    x: 0,
    y: 0
}, 1)
.to(camera.position, {
    y: -15,
    z: -15,
    ease: "power1.inOut"
}, 2) // Process
.to(camera.rotation, {
    x: 0.1,
    y: -0.2
}, 2)
.to(camera.position, {
    y: -22,
    z: -18,
    ease: "power1.inOut"
}, 3) // Systems
.to(camera.rotation, {
    x: -0.2,
    y: 0
}, 3)
.to(camera.position, {
    y: -25,
    z: -20,
    ease: "power1.inOut"
}, 4); // Conversion

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

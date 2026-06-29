// GSAP Registration
gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// Three.js Setup
// ----------------------------------------------------
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Camera
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 10;
camera.position.x = 2; // Offset slightly to the right to balance text on left
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ----------------------------------------------------
// The 3D Cube
// ----------------------------------------------------
// We use a Group to easily manipulate the whole cube
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

const geometry = new THREE.BoxGeometry(3, 3, 3);
// Let's create an array of materials with slightly different colors/styles for faces
const materials = [
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2, metalness: 0.8 }), // Right - blue
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3, metalness: 0.6 }), // Left
    new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.2, metalness: 0.7 }), // Top
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4, metalness: 0.5 }), // Bottom
    new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.1, metalness: 0.9 }), // Front
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5, metalness: 0.4 }), // Back
];

const cube = new THREE.Mesh(geometry, materials);
cubeGroup.add(cube);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0x3b82f6, 1); // Blue accent light
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

// ----------------------------------------------------
// Resize Handler
// ----------------------------------------------------
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Adjust camera position on mobile
    if (sizes.width < 768) {
        camera.position.x = 0;
        camera.position.z = 12;
    } else {
        camera.position.x = 2;
        camera.position.z = 10;
    }
});
// Initial check
if (sizes.width < 768) {
    camera.position.x = 0;
    camera.position.z = 12;
}

// ----------------------------------------------------
// Animation Loop
// ----------------------------------------------------
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Subtle continuous idle rotation
    cubeGroup.rotation.y += 0.002;
    cubeGroup.rotation.x += 0.001;

    // Floating effect
    cubeGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.2;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

// ----------------------------------------------------
// GSAP Scroll Animations
// ----------------------------------------------------

// 1. DOM Parallax Effects
gsap.utils.toArray('.parallax-element').forEach(el => {
    gsap.fromTo(el, 
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// 2. 3D Cube Scroll Transitions
// We create a master timeline that is scrubbed with scroll
let tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // smooth scrubbing
    }
});

// About Section: Move to left and scale up
tl.to(cubeGroup.position, { x: -2, y: -1, z: 2 }, 0)
  .to(cubeGroup.rotation, { x: Math.PI / 4, y: Math.PI / 4, z: 0 }, 0);

// Expertise Section: Center and rotate
tl.to(cubeGroup.position, { x: 0, y: 0, z: 0 }, 0.2)
  .to(cubeGroup.rotation, { x: Math.PI / 2, y: Math.PI, z: Math.PI / 4 }, 0.2);

// Projects Section: Move right
tl.to(cubeGroup.position, { x: 2, y: 1, z: -2 }, 0.4)
  .to(cubeGroup.rotation, { x: Math.PI, y: Math.PI * 1.5, z: 0 }, 0.4);

// Content Section: Scale down and move left
tl.to(cubeGroup.position, { x: -2, y: 0, z: -5 }, 0.6)
  .to(cubeGroup.rotation, { x: Math.PI * 1.5, y: Math.PI * 2, z: Math.PI / 2 }, 0.6);

// Services Section: Center large
tl.to(cubeGroup.position, { x: 0, y: 0, z: 4 }, 0.8)
  .to(cubeGroup.rotation, { x: Math.PI * 2, y: Math.PI * 2.5, z: Math.PI }, 0.8);

// Contact Section: Final resting place
tl.to(cubeGroup.position, { x: 0, y: 2, z: -2 }, 1)
  .to(cubeGroup.rotation, { x: 0, y: Math.PI * 3, z: 0 }, 1);

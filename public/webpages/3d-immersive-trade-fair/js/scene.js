// Scene Setup
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.015);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 0); // Start at the beginning of the hall

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.outputEncoding = THREE.sRGBEncoding;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x00d2ff, 2, 50);
blueLight.position.set(5, 5, -10);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0x7b2cbf, 2, 50);
purpleLight.position.set(-5, 5, -30);
scene.add(purpleLight);

// Environment (Trade Fair Hall)
const hallLength = 200; // Total length of the scrollable area

// Floor
const floorGeometry = new THREE.PlaneGeometry(50, hallLength + 50);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x0a0a12,
    roughness: 0.2,
    metalness: 0.8
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -hallLength / 2 + 10;
scene.add(floor);

// Grid Helper for a techy look
const gridHelper = new THREE.GridHelper(50, 50, 0x00d2ff, 0x222233);
gridHelper.position.y = 0.01;
gridHelper.position.z = floor.position.z;
scene.add(gridHelper);

// Generate Booths along the corridor
const boothGeometry = new THREE.BoxGeometry(4, 3, 4);
const boothMaterial = new THREE.MeshStandardMaterial({
    color: 0x111122,
    roughness: 0.4,
    metalness: 0.5,
    emissive: 0x000000
});
const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x00d2ff });

const booths = [];
const numberOfBooths = 20;

for (let i = 0; i < numberOfBooths; i++) {
    const boothGroup = new THREE.Group();
    
    // Main booth body
    const booth = new THREE.Mesh(boothGeometry, boothMaterial);
    booth.position.y = 1.5;
    boothGroup.add(booth);
    
    // Add a glowing screen to the booth
    const screenGeo = new THREE.PlaneGeometry(3, 1.5);
    const screen = new THREE.Mesh(screenGeo, screenMaterial);
    screen.position.set(0, 2, 2.01);
    boothGroup.add(screen);
    
    // Position the booth along the hall
    const side = i % 2 === 0 ? 1 : -1; // alternate sides
    const zPos = -(i * (hallLength / numberOfBooths)) - 10;
    const xPos = side * 8; // 8 units from center
    
    boothGroup.position.set(xPos, 0, zPos);
    
    // Rotate booth to face the center path slightly
    boothGroup.rotation.y = side * -0.2;
    
    scene.add(boothGroup);
    booths.push(boothGroup);
}

// Particles (Floating Data/Atmosphere)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i+=3) {
    posArray[i] = (Math.random() - 0.5) * 40; // x
    posArray[i+1] = Math.random() * 10;       // y
    posArray[i+2] = -Math.random() * hallLength; // z
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Gently animate particles
    particlesMesh.rotation.y = elapsedTime * 0.02;
    
    // Pulse booth screens
    booths.forEach((b, index) => {
        const screen = b.children[1];
        screen.material.opacity = 0.5 + Math.sin(elapsedTime * 2 + index) * 0.5;
        screen.material.transparent = true;
    });

    renderer.render(scene, camera);
}

animate();

// Window Resize Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// GSAP ScrollTrigger for Camera Movement
gsap.registerPlugin(ScrollTrigger);

// Animate camera Z position based on scroll
gsap.to(camera.position, {
    z: -hallLength + 20, // Move camera to the end of the hall
    ease: "none",
    scrollTrigger: {
        trigger: ".ui-layer",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // smooth scrubbing
    }
});

// Optionally animate camera X and Y for a more dynamic feel
gsap.to(camera.position, {
    y: 1.5,
    x: Math.sin(camera.position.z * 0.1) * 2, // Slight wobble
    ease: "none",
    scrollTrigger: {
        trigger: ".ui-layer",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

import * as THREE from 'three';

// 1. Setup Scene, Camera, Renderer
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0f18, 0.02); // Dark fog matching background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Start camera position
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 2. Lighting (Futuristic Educational Vibe)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x3b82f6, 50, 100);
blueLight.position.set(5, 10, 10);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0x8b5cf6, 50, 100);
purpleLight.position.set(-5, 5, -10);
scene.add(purpleLight);

// 3. Build the Library Environment (Aisles and Shelves)
const libraryGroup = new THREE.Group();
scene.add(libraryGroup);

const shelfMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    roughness: 0.2, 
    metalness: 0.8 
});

const clipMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.5 }), // Blue
    new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.5 }), // Purple
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.5 }), // Green (Success/Math)
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5 })  // Yellow (History/Art)
];

// Create shelves along the Z axis
const numShelves = 25;
const shelfSpacing = 15;
const aisleWidth = 12;

for (let i = 0; i < numShelves; i++) {
    const zPos = -i * shelfSpacing;

    // Left Shelf
    createShelf(-aisleWidth / 2, 0, zPos);
    // Right Shelf
    createShelf(aisleWidth / 2, 0, zPos);
}

function createShelf(x, y, z) {
    const shelfGroup = new THREE.Group();
    
    // Main structure
    const structureGeo = new THREE.BoxGeometry(2, 12, 8);
    const structure = new THREE.Mesh(structureGeo, shelfMaterial);
    structure.position.set(x, y + 6, z);
    shelfGroup.add(structure);

    // Books / Clips on the shelf
    for (let level = 0; level < 4; level++) {
        const rowY = y + 2 + level * 2.5;
        for (let b = -3; b <= 3; b++) {
            // Randomly skip some books for variation
            if (Math.random() > 0.7) continue;

            const width = 0.2 + Math.random() * 0.3;
            const height = 1.5 + Math.random() * 0.5;
            const depth = 1.5;

            const clipGeo = new THREE.BoxGeometry(depth, height, width);
            const mat = clipMaterials[Math.floor(Math.random() * clipMaterials.length)];
            const clip = new THREE.Mesh(clipGeo, mat);

            // Position book slightly sticking out towards aisle
            const xOffset = x < 0 ? x + 0.5 : x - 0.5;
            clip.position.set(xOffset, rowY, z + b);
            shelfGroup.add(clip);
        }
    }
    
    libraryGroup.add(shelfGroup);
}

// Add some floating holographic screens in the air
const screens = [];
for (let i = 0; i < 15; i++) {
    const screenGeo = new THREE.PlaneGeometry(3, 2);
    const screenMat = new THREE.MeshBasicMaterial({
        color: clipMaterials[i % clipMaterials.length].color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    
    const screen = new THREE.Mesh(screenGeo, screenMat);
    
    // Random position in the air, mostly down the aisle
    screen.position.set(
        (Math.random() - 0.5) * 8, // Between -4 and 4 X
        4 + Math.random() * 6,     // Between 4 and 10 Y
        -Math.random() * 150       // Down the Z axis
    );
    
    // Random rotation
    screen.rotation.y = (Math.random() - 0.5) * Math.PI / 4;
    screen.rotation.x = (Math.random() - 0.5) * Math.PI / 8;
    
    libraryGroup.add(screen);
    screens.push(screen);
}

// Floor grid (digital vibe)
const gridHelper = new THREE.GridHelper(200, 50, 0x3b82f6, 0x1e293b);
gridHelper.position.y = 0;
scene.add(gridHelper);

// 4. Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Floating animation for screens
    screens.forEach((screen, index) => {
        screen.position.y += Math.sin(time * 2 + index) * 0.005;
        screen.rotation.y += Math.sin(time + index) * 0.002;
    });

    renderer.render(scene, camera);
}
animate();

// 5. Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 6. GSAP ScrollTrigger Integration
// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Move camera forward based on scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-content",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Animate Camera Z position
tl.to(camera.position, {
    z: -350, // Move deep into the library
    ease: "none"
});

// Animate Camera Y position slightly for dynamic feel
tl.to(camera.position, {
    y: 3,
    ease: "power1.inOut"
}, "<0.5"); // Start halfway through

// Parallax for HTML UI elements
const parallaxElements = document.querySelectorAll('.parallax-element');

parallaxElements.forEach((el) => {
    const speed = parseFloat(el.getAttribute('data-speed')) || 1;
    
    gsap.fromTo(el, 
        { 
            y: 100, 
            opacity: 0 
        },
        {
            y: -50 * speed,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
                trigger: el,
                start: "top 80%",
                end: "bottom 20%",
                scrub: true
            }
        }
    );
});

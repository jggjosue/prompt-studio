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
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pointerTarget = new THREE.Vector2();
const pointerCurrent = new THREE.Vector2();

// 2. Lighting (Futuristic Educational Vibe)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x3b82f6, 50, 100);
blueLight.position.set(5, 10, 10);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0x8b5cf6, 50, 100);
purpleLight.position.set(-5, 5, -10);
scene.add(purpleLight);

const cyanLight = new THREE.PointLight(0x22d3ee, 35, 90);
cyanLight.position.set(0, 3, 12);
scene.add(cyanLight);

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

const particleCount = reducedMotion ? 350 : 1100;
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 36;
    particlePositions[i * 3 + 1] = Math.random() * 18 - 2;
    particlePositions[i * 3 + 2] = 24 - Math.random() * 390;
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
        color: 0x7dd3fc,
        size: 0.055,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })
);
scene.add(particles);

const portals = [];
for (let i = 0; i < 10; i++) {
    const portal = new THREE.Group();
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(5.2, 0.045, 8, 96),
        new THREE.MeshBasicMaterial({
            color: i % 2 ? 0x8b5cf6 : 0x38bdf8,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending
        })
    );
    const innerRing = new THREE.Mesh(
        new THREE.TorusGeometry(4.45, 0.018, 8, 96),
        ring.material.clone()
    );
    innerRing.material.opacity = 0.32;
    portal.add(ring, innerRing);
    portal.position.set((i % 2 ? 1 : -1) * 0.7, 5.4, 5 - i * 38);
    portal.rotation.z = i * 0.16;
    scene.add(portal);
    portals.push(portal);
}

window.addEventListener('pointermove', (event) => {
    pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// 4. Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Floating animation for screens
    screens.forEach((screen, index) => {
        screen.position.y += Math.sin(time * 1.4 + index) * 0.003;
        screen.rotation.y += Math.sin(time * 0.7 + index) * 0.0015;
    });

    pointerCurrent.lerp(pointerTarget, reducedMotion ? 0.02 : 0.055);
    camera.rotation.y += ((-pointerCurrent.x * 0.035) - camera.rotation.y) * 0.035;
    camera.rotation.x += ((pointerCurrent.y * 0.02) - camera.rotation.x) * 0.035;
    particles.rotation.y = time * 0.006;
    portals.forEach((portal, index) => {
        portal.rotation.z += (index % 2 ? -1 : 1) * (reducedMotion ? 0.0002 : 0.0012);
        const pulse = 1 + Math.sin(time * 1.2 + index) * 0.035;
        portal.scale.setScalar(pulse);
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
        scrub: reducedMotion ? 0 : 1.2,
    }
});

// Animate Camera Z position
tl.to(camera.position, {
    z: -350,
    ease: "none"
}, 0)
.to(camera.position, {
    keyframes: [
        { x: -2.2, y: 6.4 },
        { x: 2.7, y: 4.2 },
        { x: -1.8, y: 7.2 },
        { x: 0, y: 4.8 }
    ],
    ease: "sine.inOut"
}, 0)
.to(libraryGroup.rotation, {
    y: Math.PI * 0.08,
    ease: "sine.inOut"
}, 0);

// Parallax for HTML UI elements
const parallaxElements = document.querySelectorAll('.parallax-element');

parallaxElements.forEach((el) => {
    const speed = parseFloat(el.getAttribute('data-speed')) || 1;
    
    gsap.fromTo(el, 
        { 
            y: 100, 
            opacity: 0,
            rotateX: 8,
            rotateY: el.classList.contains('left') ? -7 : 7,
            scale: 0.94
        },
        {
            y: -50 * speed,
            opacity: 1,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
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

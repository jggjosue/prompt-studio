// Three.js and GSAP Integration for VaultPay 3D

// 1. Setup Scene, Camera, Renderer
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
// Deep dark blue background
scene.background = new THREE.Color(0x02040a); 
scene.fog = new THREE.Fog(0x02040a, 5, 20);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
// Initial camera position outside the "vault"
camera.position.set(0, 0, 8);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 2. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x3b82f6, 2); // Blue accent light
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.5); // Purple accent light
directionalLight2.position.set(-5, -5, 2);
scene.add(directionalLight2);

// 3. Objects

// Group for everything so we can move the whole scene easily if needed
const sceneGroup = new THREE.Group();
scene.add(sceneGroup);

// --- The Vault Corridor ---
const corridorMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.8,
    roughness: 0.2,
    side: THREE.BackSide
});
const corridorGeometry = new THREE.CylinderGeometry(4, 4, 20, 32);
const corridor = new THREE.Mesh(corridorGeometry, corridorMaterial);
corridor.rotation.x = Math.PI / 2;
corridor.position.z = -2;
sceneGroup.add(corridor);

// --- The Metal Card ---
const cardGroup = new THREE.Group();
cardGroup.position.set(2, 0, -5); // Initially positioned for the second section
sceneGroup.add(cardGroup);

const cardGeometry = new THREE.BoxGeometry(3.37, 2.12, 0.05); // Credit card ratio
const cardMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1
});
const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
cardGroup.add(cardMesh);

// Chip
const chipGeom = new THREE.BoxGeometry(0.5, 0.4, 0.06);
const chipMat = new THREE.MeshStandardMaterial({color: 0xffaa00, metalness: 1, roughness: 0.3});
const chip = new THREE.Mesh(chipGeom, chipMat);
chip.position.set(-1.1, 0.3, 0.01);
cardGroup.add(chip);

// --- Floating Coins / Data Nodes ---
const nodes = [];
const nodeGeom = new THREE.IcosahedronGeometry(0.2, 0);
const nodeMat = new THREE.MeshStandardMaterial({color: 0x3b82f6, wireframe: true});

for(let i=0; i<15; i++) {
    const mesh = new THREE.Mesh(nodeGeom, nodeMat);
    mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 15 - 5
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    sceneGroup.add(mesh);
    nodes.push(mesh);
}


// 4. Animation Loop
const clock = new THREE.Clock();
let currentIntersect = null;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Idle animation for card
    cardGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.2;
    cardGroup.position.y = Math.sin(elapsedTime) * 0.1;

    // Idle animation for nodes
    nodes.forEach((node, idx) => {
        node.rotation.x += 0.01;
        node.rotation.y += 0.01;
        node.position.y += Math.sin(elapsedTime + idx) * 0.005;
    });

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};
tick();

// 5. GSAP ScrollTrigger Integration
gsap.registerPlugin(ScrollTrigger);

// Setup timeline for main 3D scene based on scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".content-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Intro sequence (Section 1 -> 2)
tl.to(camera.position, { z: -1, ease: "power2.inOut" }, 0);
tl.to(cardGroup.position, { x: 0, z: -3, ease: "power2.inOut" }, 0);
tl.to(cardGroup.rotation, { x: Math.PI * 2, y: Math.PI / 4, z: Math.PI / 8, ease: "power1.inOut" }, 0);

// Middle sequence (Section 2 -> 3)
tl.to(camera.position, { x: -2, z: -6, ease: "power2.inOut" }, 1);
tl.to(cardGroup.position, { x: 4, y: 2, ease: "power2.inOut" }, 1);
tl.to(cardGroup.rotation, { y: -Math.PI / 2, ease: "power1.inOut" }, 1);

// End sequence (Section 3 -> 4)
tl.to(camera.position, { x: 0, z: -12, ease: "power2.inOut" }, 2);
tl.to(cardGroup.position, { x: -4, y: 0, ease: "power2.inOut" }, 2);

// Animate nodes dynamically with scroll
nodes.forEach((node, idx) => {
    tl.to(node.position, {
        y: `+=${(Math.random() - 0.5) * 5}`,
        z: `+=${Math.random() * 5}`,
        ease: "none"
    }, 0);
    tl.to(node.rotation, {
        x: `+=${Math.PI * 2}`,
        y: `+=${Math.PI * 2}`,
        ease: "none"
    }, 0);
});

// HTML Parallax & Reveal Elements
const parallaxElements = gsap.utils.toArray('[data-parallax="true"]');
parallaxElements.forEach((elem) => {
    gsap.fromTo(elem, 
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                end: "top 15%",
                toggleActions: "play reverse play reverse",
                scrub: 0.5
            }
        }
    );
});

// Staggered list items
gsap.from(".feature-list li", {
    scrollTrigger: {
        trigger: ".feature-list",
        start: "top 80%",
        toggleActions: "play none none reverse"
    },
    x: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "back.out(1.7)"
});

// Dashboard Cards Stagger
gsap.from(".dash-card", {
    scrollTrigger: {
        trigger: ".dashboard-sim",
        start: "top 80%",
        toggleActions: "play none none reverse"
    },
    scale: 0.8,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "elastic.out(1, 0.7)"
});

// Animate Progress Bar Fill
gsap.fromTo(".progress", 
    { width: "0%" },
    {
        width: "75%",
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".dash-card",
            start: "top 80%",
            toggleActions: "play none none reverse"
        }
    }
);

// Plan Cards Entrance
gsap.from(".plan-card", {
    scrollTrigger: {
        trigger: ".plans-grid",
        start: "top 85%",
        toggleActions: "play none none reverse"
    },
    y: 100,
    opacity: 0,
    rotationX: 45,
    transformOrigin: "bottom center",
    duration: 1,
    stagger: 0.3,
    ease: "power3.out"
});


// 6. Resize Handler
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// app.js
gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#webgl-canvas');

// Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0F172A, 0.015);

// Camera Setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 10);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xF59E0B, 2, 20); // Brand primary color
pointLight.position.set(-2, 2, 2);
scene.add(pointLight);

const purpleLight = new THREE.PointLight(0x8B5CF6, 2, 20); // Brand CTA color
purpleLight.position.set(2, 0, -2);
scene.add(purpleLight);


// --- 3D Objects ---

// Materials
const darkMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a2333, 
    roughness: 0.2,
    metalness: 0.8
});
const screenMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x050505,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x111111
});
const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    roughness: 0.3,
    metalness: 0.5
});

// Group to hold all objects for easier global rotation
const sceneGroup = new THREE.Group();
scene.add(sceneGroup);

// 1. Counter (Base)
const counterGeo = new THREE.BoxGeometry(10, 0.5, 4);
const counter = new THREE.Mesh(counterGeo, darkMaterial);
counter.position.y = -1;
sceneGroup.add(counter);

// 2. POS Terminal (Hero / POS section)
const terminalGroup = new THREE.Group();
terminalGroup.position.set(0, -0.2, 0);

const termBaseGeo = new THREE.BoxGeometry(1.5, 1.2, 1.2);
const termBase = new THREE.Mesh(termBaseGeo, darkMaterial);
termBase.rotation.x = -Math.PI * 0.1;
terminalGroup.add(termBase);

const termScreenGeo = new THREE.PlaneGeometry(1.3, 0.9);
const termScreen = new THREE.Mesh(termScreenGeo, screenMaterial);
termScreen.position.set(0, 0.1, 0.61);
termScreen.rotation.x = -Math.PI * 0.1;
terminalGroup.add(termScreen);

sceneGroup.add(terminalGroup);

// 3. Floating Cards (Payments section)
const cardGroup = new THREE.Group();
cardGroup.position.set(-3, 0, -1);
cardGroup.visible = false; // Hidden initially
sceneGroup.add(cardGroup);

const cardGeo = new THREE.BoxGeometry(1.5, 0.9, 0.05);
for(let i=0; i<3; i++) {
    const mat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x8B5CF6 : (i===1 ? 0xF59E0B : 0xffffff),
        roughness: 0.2,
        metalness: 0.6
    });
    const card = new THREE.Mesh(cardGeo, mat);
    card.position.set(0, i * 0.5, -i * 0.5);
    card.rotation.x = -Math.PI * 0.2;
    card.rotation.y = Math.PI * 0.1 * (i-1);
    cardGroup.add(card);
}

// 4. Inventory Boxes (Inventory section)
const inventoryGroup = new THREE.Group();
inventoryGroup.position.set(3, 0, -2);
inventoryGroup.visible = false;
sceneGroup.add(inventoryGroup);

const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
for(let i=0; i<5; i++) {
    const box = new THREE.Mesh(boxGeo, darkMaterial);
    box.position.set(
        (Math.random() - 0.5) * 3,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
    );
    box.rotation.set(Math.random(), Math.random(), 0);
    inventoryGroup.add(box);
}


// --- Scroll Animations (GSAP ScrollTrigger) ---

// Setup timeline tied to scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
    }
});

// Section 1: Hero to POS
tl.to(camera.position, { x: -2, y: 1.5, z: 6, duration: 1 }, 0)
  .to(terminalGroup.rotation, { y: Math.PI * 0.2, duration: 1 }, 0);

// Section 2: POS to Payments
tl.to(camera.position, { x: 0, y: 1, z: 5, duration: 1 }, 1)
  .to(sceneGroup.rotation, { y: Math.PI * 0.1, duration: 1 }, 1)
  .call(() => { cardGroup.visible = true; }, null, 1)
  .fromTo(cardGroup.position, { y: -3 }, { y: 1, duration: 1 }, 1);

// Section 3: Payments to Inventory
tl.to(camera.position, { x: 3, y: 2, z: 7, duration: 1 }, 2)
  .to(sceneGroup.rotation, { y: -Math.PI * 0.2, duration: 1 }, 2)
  .call(() => { inventoryGroup.visible = true; }, null, 2)
  .fromTo(inventoryGroup.position, { y: -5 }, { y: 0, duration: 1 }, 2);

// Section 4: Inventory to Dashboard/End
tl.to(camera.position, { x: 0, y: 3, z: 12, duration: 1 }, 3)
  .to(sceneGroup.rotation, { y: 0, x: Math.PI * 0.1, duration: 1 }, 3);


// --- Animation Loop ---
const clock = new THREE.Clock();

function tick() {
    const elapsedTime = clock.getElapsedTime();

    // Subtle idle floating animations
    terminalGroup.position.y = Math.sin(elapsedTime) * 0.05 - 0.2;
    
    cardGroup.children.forEach((card, index) => {
        card.position.y += Math.sin(elapsedTime * 2 + index) * 0.002;
    });

    inventoryGroup.children.forEach((box, index) => {
        box.rotation.x += 0.005;
        box.rotation.y += 0.005;
    });

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();

// --- Resize Handling ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

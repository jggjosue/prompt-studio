// Three.js & GSAP Setup for Voyage Cruise Line 3D
gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050b14);
scene.fog = new THREE.FogExp2(0x050b14, 0.005);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0x38bdf8, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);
const accentLight = new THREE.PointLight(0x0ea5e9, 2, 50);
accentLight.position.set(-10, 5, -10);
scene.add(accentLight);

// --- Create 3D Assets ---
const shipGroup = new THREE.Group();

// Hull
const hullGeo = new THREE.CylinderGeometry(2, 2, 10, 32);
hullGeo.rotateZ(Math.PI / 2);
const hullMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.8 });
const hull = new THREE.Mesh(hullGeo, hullMat);
hull.scale.set(1, 0.5, 0.3);
shipGroup.add(hull);

// Main Deck
const deckGeo = new THREE.BoxGeometry(8, 0.5, 2);
const deckMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
const deck = new THREE.Mesh(deckGeo, deckMat);
deck.position.y = 1.25;
shipGroup.add(deck);

// Upper Decks
const upperDeckGeo = new THREE.BoxGeometry(6, 1.5, 1.8);
const upperDeck = new THREE.Mesh(upperDeckGeo, deckMat);
upperDeck.position.y = 2.25;
shipGroup.add(upperDeck);

// Pool
const poolGeo = new THREE.BoxGeometry(1.5, 0.1, 1);
const poolMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
const pool = new THREE.Mesh(poolGeo, poolMat);
pool.position.set(-2, 3.05, 0);
shipGroup.add(pool);

// Cabin Details (simple grid on the side)
const cabinGeo = new THREE.PlaneGeometry(5, 1);
const cabinMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    wireframe: true // stylized cabins
});
const cabinSide1 = new THREE.Mesh(cabinGeo, cabinMat);
cabinSide1.position.set(0, 2.25, 0.91);
shipGroup.add(cabinSide1);
const cabinSide2 = new THREE.Mesh(cabinGeo, cabinMat);
cabinSide2.position.set(0, 2.25, -0.91);
cabinSide2.rotation.y = Math.PI;
shipGroup.add(cabinSide2);

scene.add(shipGroup);

// Ocean
const oceanGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
const oceanMat = new THREE.MeshStandardMaterial({ 
    color: 0x0284c7, 
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const ocean = new THREE.Mesh(oceanGeo, oceanMat);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -0.5;
scene.add(ocean);

// Initial Camera Position
camera.position.set(15, 5, 15);
camera.lookAt(0, 0, 0);

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Subtle ship floating
    shipGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.1;
    shipGroup.rotation.z = Math.sin(elapsedTime * 1.2) * 0.02;
    shipGroup.rotation.x = Math.cos(elapsedTime * 0.8) * 0.02;

    // Ocean animation (modifying vertices if not wireframe, but wireframe rotation looks cool)
    ocean.rotation.z = elapsedTime * 0.05;

    renderer.render(scene, camera);
}
animate();

// --- Window Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP Scroll Animations ---

// Setup a master timeline linked to scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Path definitions based on sections
// Hero -> Deck -> Cabins -> Amenities -> Ports -> Booking

// 1. To Deck (Move close to upper deck)
tl.to(camera.position, {
    x: 0,
    y: 6,
    z: 5,
    ease: "power1.inOut"
}, 0);
tl.to(camera.rotation, {
    x: -Math.PI / 6,
    ease: "power1.inOut"
}, 0);

// 2. To Cabins (Side view)
tl.to(camera.position, {
    x: 8,
    y: 2,
    z: 8,
    ease: "power1.inOut"
}, 1);
tl.to(shipGroup.rotation, {
    y: Math.PI / 4,
    ease: "power1.inOut"
}, 1);

// 3. To Amenities (Rotate around)
tl.to(camera.position, {
    x: -8,
    y: 3,
    z: -8,
    ease: "power1.inOut"
}, 2);
tl.to(shipGroup.rotation, {
    y: Math.PI,
    ease: "power1.inOut"
}, 2);

// 4. To Ports (Pull back for map view)
tl.to(camera.position, {
    x: 0,
    y: 15,
    z: 20,
    ease: "power1.inOut"
}, 3);
tl.to(shipGroup.rotation, {
    y: 0,
    ease: "power1.inOut"
}, 3);

// 5. To Booking (Heroic angle)
tl.to(camera.position, {
    x: 10,
    y: 2,
    z: 10,
    ease: "power1.inOut"
}, 4);

// Ensure the camera always looks at the ship center during animations
tl.eventCallback("onUpdate", () => {
    // If we wanted to force lookAt, we could do it here, 
    // but GSAP is tweening rotation so lookAt might fight it.
    // Instead, we just let GSAP handle position and rotation if we mapped them properly, 
    // or we tween a dummy object and lookAt that.
    camera.lookAt(0, 1, 0);
});

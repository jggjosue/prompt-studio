// Initialize Three.js Scene
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 25); // Start slightly above and further back

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 3D Objects ---

// 1. Globe (Earth representation)
const globeGeometry = new THREE.SphereGeometry(10, 64, 64);
const globeMaterial = new THREE.MeshBasicMaterial({
    color: 0x0a0a1f,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
globe.position.set(0, -10, 0);
scene.add(globe);

// Add glowing atmosphere to globe
const atmosGeometry = new THREE.SphereGeometry(10.2, 32, 32);
const atmosMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
});
const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
globe.add(atmosphere);

// Add Luminous Routes (Abstract arcs around the globe)
function createRoute(startLat, startLng, endLat, endLng) {
    // Simple abstract representation using a torus or curved tube would be ideal,
    // but for simplicity, we'll add some glowing rings around the globe to simulate routes.
    const routeGeometry = new THREE.TorusGeometry(10.5, 0.05, 16, 100);
    const routeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff5c00,
        transparent: true,
        opacity: 0.5
    });
    const route = new THREE.Mesh(routeGeometry, routeMaterial);
    
    // Random rotation to make it look like a global network
    route.rotation.x = Math.random() * Math.PI;
    route.rotation.y = Math.random() * Math.PI;
    
    globe.add(route);
}

// Create several routes
for(let i = 0; i < 15; i++) {
    createRoute();
}


// 2. Abstract Airplane (Composed of simple shapes)
const airplaneGroup = new THREE.Group();

const fuselageGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
fuselage.rotation.z = Math.PI / 2;
airplaneGroup.add(fuselage);

const wingGeo = new THREE.BoxGeometry(2, 0.1, 4);
const wing = new THREE.Mesh(wingGeo, fuselageMat);
airplaneGroup.add(wing);

const tailGeo = new THREE.BoxGeometry(1, 0.1, 1.5);
const tail = new THREE.Mesh(tailGeo, fuselageMat);
tail.position.set(-1.5, 0.5, 0);
airplaneGroup.add(tail);

airplaneGroup.position.set(0, -2, 10);
// Point airplane forward (away from camera)
airplaneGroup.rotation.y = Math.PI; 
scene.add(airplaneGroup);


// 3. Particles (Stars / Clouds)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles across a large volume
    posArray[i] = (Math.random() - 0.5) * 100;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.8
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);


// --- GSAP Scroll Animations ---
gsap.registerPlugin(ScrollTrigger);

// Timeline for Camera Movement
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // Smooth scrubbing
    }
});

// Camera dives towards the globe and orbits
tl.to(camera.position, {
    z: 15,
    y: 0,
    ease: "power1.inOut"
}, 0)
.to(globe.rotation, {
    y: Math.PI * 2, // Rotate globe as we scroll
    x: 0.5,
    ease: "none"
}, 0)
.to(airplaneGroup.position, {
    z: 5,
    y: 0,
    ease: "power1.inOut"
}, 0)
.to(airplaneGroup.rotation, {
    z: 0.2, // Bank turn
    ease: "power1.inOut"
}, 0)
.to(camera.position, {
    z: 10,
    y: -5,
    x: 5,
    ease: "power1.inOut"
}, 0.5) // Halfway down
.to(airplaneGroup.rotation, {
    z: -0.2,
    ease: "power1.inOut"
}, 0.5);

// DOM Parallax Effects
document.querySelectorAll('[data-parallax]').forEach(elem => {
    const speed = elem.getAttribute('data-parallax');
    gsap.to(elem, {
        y: () => (ScrollTrigger.maxScroll(window) * speed),
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 0
        }
    });
});

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Constant slow rotation for globe and particles
    globe.rotation.y += 0.001;
    particlesMesh.rotation.y = -elapsedTime * 0.02;
    
    // Gentle floating for airplane
    airplaneGroup.position.y += Math.sin(elapsedTime * 2) * 0.005;
    
    renderer.render(scene, camera);
}

animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

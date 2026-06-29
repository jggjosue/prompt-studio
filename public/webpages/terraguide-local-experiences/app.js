// TerraGuide Local Experiences - 3D interactions and animations

// --------------------------------------------------------
// 1. Three.js Setup
// --------------------------------------------------------
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.02);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Initial camera position (looking at the globe)
camera.position.set(0, 0, 20);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --------------------------------------------------------
// 2. 3D Objects & Environments
// --------------------------------------------------------

// A. The Globe (Hero Section)
const globeGroup = new THREE.Group();
scene.add(globeGroup);

const sphereGeometry = new THREE.SphereGeometry(8, 64, 64);
const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x111111,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
globeGroup.add(globe);

// Add some glowing dots on the globe
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 17;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xff4081,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
globeGroup.add(particlesMesh);

// B. The Route / Map Terrain (Experiences Section)
// Positioned further back and down
const mapGroup = new THREE.Group();
mapGroup.position.set(0, -30, -50);
mapGroup.rotation.x = -Math.PI / 2.5;
scene.add(mapGroup);

const gridHelper = new THREE.GridHelper(100, 50, 0xff4081, 0x222222);
gridHelper.position.y = -5;
mapGroup.add(gridHelper);

// Add some abstract mountains
const terrainGeo = new THREE.PlaneGeometry(100, 100, 32, 32);
const terrainMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, wireframe: true });
const terrain = new THREE.Mesh(terrainGeo, terrainMat);
terrain.rotation.x = -Math.PI / 2;
terrain.position.y = -6;
// Displace vertices to make mountains
const vertices = terrain.geometry.attributes.position.array;
for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 2] = Math.random() * 5; // z-axis in PlaneGeometry becomes y-axis after rotation
}
terrain.geometry.computeVertexNormals();
mapGroup.add(terrain);

// --------------------------------------------------------
// 3. Animation Loop
// --------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Subtle idle animations
    globeGroup.rotation.y = elapsedTime * 0.05;
    globeGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --------------------------------------------------------
// 4. GSAP ScrollTrigger & Parallax
// --------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// Timeline to control camera path
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // smooth scrubbing
    }
});

// Animate camera to move from Globe -> Map -> Booking
tl.to(camera.position, {
    z: -30,
    y: -20,
    ease: "power1.inOut",
    duration: 1
}, 0) // Start at same time
.to(camera.rotation, {
    x: -0.2,
    ease: "power1.inOut",
    duration: 1
}, 0)
.to(globeGroup.position, {
    y: 20, // Move globe out of view
    duration: 0.5
}, 0)
.to(camera.position, {
    z: -45,
    y: -25,
    x: 10,
    ease: "power1.inOut",
    duration: 1
}, 1);

// Parallax for HTML elements
const parallaxElements = document.querySelectorAll('.parallax-element');
parallaxElements.forEach((el) => {
    const speed = parseFloat(el.getAttribute('data-speed')) || 1;
    gsap.fromTo(el, {
        y: 100 * speed
    }, {
        y: -100 * speed,
        ease: "none",
        scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

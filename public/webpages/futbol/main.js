// main.js

// --- Three.js Setup ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Initial camera position (outside the stadium, like a tunnel)
camera.position.set(0, 5, 50);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 3D Objects ---

// 1. Pitch (Grid)
const gridHelper = new THREE.GridHelper(200, 100, 0x00ff88, 0x003311);
gridHelper.position.y = -2;
scene.add(gridHelper);

// 2. The Ball
const ballGeometry = new THREE.IcosahedronGeometry(2, 2);
const ballMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    wireframe: true,
    emissive: 0x00ff88,
    emissiveIntensity: 0.2
});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 0, 0);
scene.add(ball);

// Ball Core
const coreGeometry = new THREE.SphereGeometry(1.8, 32, 32);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x050505 });
const core = new THREE.Mesh(coreGeometry, coreMaterial);
ball.add(core);

// 3. Stadium Lights (Abstract Cylinders/Spotlights)
const lightGroup = new THREE.Group();
const createLightTower = (x, z) => {
    const towerGeo = new THREE.CylinderGeometry(0.5, 1, 20, 8);
    const towerMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(x, 8, z);
    
    // Spotlight
    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(x, 18, z);
    spotLight.target = ball;
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    spotLight.distance = 100;
    scene.add(spotLight);
    
    // Light bulb glow
    const bulbGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, 10, 0);
    tower.add(bulb);

    lightGroup.add(tower);
};

createLightTower(-30, -20);
createLightTower(30, -20);
createLightTower(-30, 20);
createLightTower(30, 20);
scene.add(lightGroup);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 4. Particles (Fans / Atmosphere)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Distribute particles mainly on the sides (stands)
    const x = (Math.random() - 0.5) * 150;
    const y = Math.random() * 50;
    const z = (Math.random() - 0.5) * 150;
    
    // Keep middle area clear for pitch
    if (Math.abs(x) < 20 && Math.abs(z) < 30) {
        posArray[i*3] = x > 0 ? x + 20 : x - 20;
    } else {
        posArray[i*3] = x;
    }
    
    posArray[i*3+1] = y;
    posArray[i*3+2] = z;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: 0x00ff88,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Rotate ball slowly
    ball.rotation.y = elapsedTime * 0.5;
    ball.rotation.x = elapsedTime * 0.2;
    
    // Float ball
    ball.position.y = Math.sin(elapsedTime * 2) * 0.5;

    // Slowly rotate particles
    particlesMesh.rotation.y = elapsedTime * 0.05;

    renderer.render(scene, camera);
}
animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP ScrollTrigger ---
gsap.registerPlugin(ScrollTrigger);

// 1. Camera Movement Timeline
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Camera moves forward into the stadium
tl.to(camera.position, {
    z: -30, // move past the ball
    y: 2,
    ease: "power1.inOut"
}, 0);

// Camera looks around slightly
tl.to(camera.rotation, {
    y: Math.PI / 8,
    ease: "power1.inOut"
}, 0.2);

tl.to(camera.rotation, {
    y: -Math.PI / 8,
    ease: "power1.inOut"
}, 0.5);

tl.to(camera.rotation, {
    y: 0,
    ease: "power1.inOut"
}, 0.8);

// Change particle colors based on scroll
tl.to(particlesMaterial.color, {
    r: 1, g: 0.26, b: 0.26, // --secondary-color (#ff4444)
    ease: "none"
}, 0.3);


// 2. DOM Parallax Effects
const parallaxElements = document.querySelectorAll('[data-parallax]');

parallaxElements.forEach(el => {
    const speed = parseFloat(el.getAttribute('data-parallax'));
    
    gsap.to(el, {
        y: () => -window.innerHeight * speed,
        ease: "none",
        scrollTrigger: {
            trigger: el.closest('.panel'),
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// Initial load animation
gsap.from(".hero-title", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out",
    delay: 0.2
});

gsap.from(".hero-subtitle, .hero-actions", {
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out",
    delay: 0.8
});

// main.js - CryptoPulse Trading 3D Experience

// Initialize Three.js Scene
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Add Fog for depth
scene.fog = new THREE.FogExp2(0x0C0A09, 0.02);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0C0A09, 1);

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xCA8A04, 1.5, 50); // Gold accent
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x0ea5e9, 1, 50); // Cyan tech
pointLight2.position.set(-10, 5, -10);
scene.add(pointLight2);

// 3D Objects: Grid (Trading Floor)
const gridHelper = new THREE.GridHelper(200, 100, 0xCA8A04, 0x333333);
gridHelper.position.y = -5;
// Make grid fade out at edges
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.15;
scene.add(gridHelper);

// 3D Objects: Floating Data Nodes (Particles)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles across a wide and deep area
    posArray[i] = (Math.random() - 0.5) * 100;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xCA8A04,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// 3D Objects: Candlesticks
const candlestickGroup = new THREE.Group();
const candleMaterialGreen = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.2 });
const candleMaterialRed = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.2 });

for(let i = 0; i < 20; i++) {
    const isGreen = Math.random() > 0.5;
    const height = Math.random() * 4 + 1;
    
    // Body
    const geometry = new THREE.BoxGeometry(0.8, height, 0.8);
    const material = isGreen ? candleMaterialGreen : candleMaterialRed;
    const mesh = new THREE.Mesh(geometry, material);
    
    // Wick
    const wickGeo = new THREE.CylinderGeometry(0.05, 0.05, height + 2);
    const wickMesh = new THREE.Mesh(wickGeo, material);
    
    const singleCandle = new THREE.Group();
    singleCandle.add(mesh);
    singleCandle.add(wickMesh);
    
    // Position
    singleCandle.position.x = (i - 10) * 3;
    singleCandle.position.z = -15 - (Math.random() * 20);
    singleCandle.position.y = (Math.random() - 0.5) * 5;
    
    candlestickGroup.add(singleCandle);
}
scene.add(candlestickGroup);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.02;
    
    // Floating effect for candlesticks
    candlestickGroup.children.forEach((candle, index) => {
        candle.position.y += Math.sin(elapsedTime + index) * 0.005;
    });

    renderer.render(scene, camera);
}
animate();

// --- GSAP & ScrollTrigger ---
gsap.registerPlugin(ScrollTrigger);

// 1. Camera Z-axis movement based on scroll (fly through)
const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;

gsap.to(camera.position, {
    z: -30, // Move forward into the scene
    y: 2,   // Slightly dip down
    ease: "none",
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

gsap.to(camera.rotation, {
    x: 0.1, // Look up slightly as we move forward
    ease: "none",
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// 2. Parallax effect for HTML elements
const parallaxEls = document.querySelectorAll('.parallax-el');
parallaxEls.forEach(el => {
    const speed = parseFloat(el.getAttribute('data-speed')) || 1;
    gsap.to(el, {
        y: () => -50 * speed,
        ease: "none",
        scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// 3. Section specific 3D animations
// When reaching "Analysis" section, move candlesticks to view
ScrollTrigger.create({
    trigger: "#analysis",
    start: "top center",
    end: "bottom center",
    onEnter: () => {
        gsap.to(candlestickGroup.position, { y: 2, duration: 1, ease: "power2.out" });
        gsap.to(pointLight1.color, { r: 0.1, g: 0.6, b: 1, duration: 1 }); // Change light to blue/cyan
    },
    onLeaveBack: () => {
        gsap.to(candlestickGroup.position, { y: 0, duration: 1, ease: "power2.out" });
        gsap.to(pointLight1.color, { r: 0.79, g: 0.54, b: 0.015, duration: 1 }); // Back to gold (CA8A04)
    }
});

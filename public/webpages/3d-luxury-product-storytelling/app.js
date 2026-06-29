// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// THREE.JS SETUP
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 15);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Environment setup for luxury reflections
const cubeTextureLoader = new THREE.CubeTextureLoader();
// Generating a procedural environment since we don't have HDRIs readily available without a server
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Create a basic gradient texture for reflection
const createEnvMap = () => {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color('#111');
    const envCamera = new THREE.PerspectiveCamera(90, 1, 0.1, 10);
    const light1 = new THREE.DirectionalLight(0xffffff, 2);
    light1.position.set(1, 1, 1);
    envScene.add(light1);
    
    const renderTarget = pmremGenerator.fromScene(envScene);
    scene.environment = renderTarget.texture;
};
createEnvMap();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffedd5, 2); // Warm light
dirLight.position.set(5, 5, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);

const blueLight = new THREE.DirectionalLight(0xe0f2fe, 1); // Cool rim light
blueLight.position.set(-5, 5, -5);
scene.add(blueLight);

// The Luxury Product (Torus Knot for complex reflections)
const geometry = new THREE.TorusKnotGeometry(2, 0.6, 256, 64);
const material = new THREE.MeshPhysicalMaterial({
    color: 0xCA8A04, // Gold
    metalness: 1.0,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 2.0,
});

const product = new THREE.Mesh(geometry, material);
product.castShadow = true;
product.receiveShadow = true;
scene.add(product);

// Particles
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 500;
const posArray = new Float32Array(particleCount * 3);
for(let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 30;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xCA8A04,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// GSAP ScrollTrigger Animations
gsap.registerPlugin(ScrollTrigger);

// 1. Initial State (Hero)
product.position.set(0, -0.5, 0);
product.rotation.set(0, 0, 0);

// Timeline tied to scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".story-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // smooth scrubbing
    }
});

// Chapter 1: The Origin (Move right, rotate)
tl.to(product.position, { x: 3, y: 0, z: -2, ease: "power1.inOut" }, 0)
  .to(product.rotation, { x: Math.PI / 4, y: Math.PI / 2, ease: "power1.inOut" }, 0);

// Chapter 2: Rare Materials (Move left, zoom in)
tl.to(product.position, { x: -3, y: 0, z: 2, ease: "power1.inOut" }, 0.25)
  .to(product.rotation, { x: Math.PI / 2, y: Math.PI, ease: "power1.inOut" }, 0.25);

// Chapter 3: Artisan Craft (Move right, zoom out slightly)
tl.to(product.position, { x: 3, y: 0, z: 0, ease: "power1.inOut" }, 0.5)
  .to(product.rotation, { x: Math.PI, y: Math.PI * 1.5, ease: "power1.inOut" }, 0.5);

// Chapter 4: Microscopic Precision (Move left, zoom in tight)
tl.to(product.position, { x: -4, y: 0, z: 5, ease: "power1.inOut" }, 0.75)
  .to(product.rotation, { x: Math.PI * 1.5, y: Math.PI * 2, ease: "power1.inOut" }, 0.75)
  .to(material, { roughness: 0.05, clearcoatRoughness: 0.0, ease: "power1.inOut" }, 0.75); // Enhance reflections for macro

// Final Chapter: Collection (Center, zoom out)
tl.to(product.position, { x: 0, y: 1, z: 0, ease: "power1.inOut" }, 0.9)
  .to(product.rotation, { x: Math.PI * 2, y: Math.PI * 2.5, ease: "power1.inOut" }, 0.9)
  .to(material, { roughness: 0.15, clearcoatRoughness: 0.1, ease: "power1.inOut" }, 0.9);


// Parallax Texts Animation
const parallaxElements = document.querySelectorAll('.parallax-text');
parallaxElements.forEach((el, index) => {
    // Skip the hero text as it's visible initially
    if(index === 0) {
        gsap.fromTo(el, 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 0.5 }
        );
        return;
    }

    gsap.fromTo(el,
        { opacity: 0, y: 100 },
        {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 80%", // trigger when top of element hits 80% of viewport
                end: "bottom 20%",
                toggleActions: "play reverse play reverse"
            }
        }
    );
});

// Render Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Idle animation for the product (independent of scroll)
    product.rotation.y += 0.002;
    product.rotation.x += 0.001;
    product.position.y += Math.sin(elapsedTime * 0.5) * 0.001; // subtle float

    // Idle animation for particles
    particles.rotation.y = elapsedTime * 0.05;
    particles.position.y = Math.sin(elapsedTime * 0.2) * 0.5;

    renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Smooth Scroll for Navbar Links
document.querySelectorAll('.desktop-menu a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            lenis.scrollTo(targetElement);
        }
    });
});

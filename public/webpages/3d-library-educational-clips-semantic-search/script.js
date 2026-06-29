// Initialize Three.js Scene
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 3D Environment Generation ---

// 1. Data Nodes (Particles)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles in a tunnel shape
    posArray[i] = (Math.random() - 0.5) * 50; 
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00F0FF,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// 2. Floating Educational Clips (Planes)
const clipGeometry = new THREE.PlaneGeometry(1.6, 0.9);
const clipMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x1A1A2E, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
    wireframe: true
});

const clipsGroup = new THREE.Group();

for (let i = 0; i < 30; i++) {
    const clip = new THREE.Mesh(clipGeometry, clipMaterial);
    
    // Position randomly along a Z-axis path
    clip.position.x = (Math.random() - 0.5) * 20;
    clip.position.y = (Math.random() - 0.5) * 10;
    clip.position.z = (Math.random() - 0.5) * 50 - 10; // Deeper into Z

    // Random rotation
    clip.rotation.x = Math.random() * Math.PI;
    clip.rotation.y = Math.random() * Math.PI;

    clipsGroup.add(clip);
}
scene.add(clipsGroup);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x7000FF, 2, 100);
pointLight.position.set(0, 0, 5);
scene.add(pointLight);

// Animation Loop
const clock = new THREE.Clock();

function tick() {
    const elapsedTime = clock.getElapsedTime();

    // Subtle ambient animation
    particlesMesh.rotation.y = elapsedTime * 0.05;
    
    clipsGroup.children.forEach((clip, index) => {
        clip.rotation.y += 0.002 * (index % 2 === 0 ? 1 : -1);
        clip.rotation.x += 0.001;
    });

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- GSAP Scroll Animations ---
gsap.registerPlugin(ScrollTrigger);

// 1. Move Camera through the 3D scene on scroll
ScrollTrigger.create({
    trigger: "#scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Smooth scrubbing
    onUpdate: (self) => {
        // Move camera Z position (fly through)
        camera.position.z = 5 - (self.progress * 40);
        
        // Slight camera rotation for dynamic feel
        camera.rotation.z = self.progress * 0.5;
    }
});

// 2. UI Elements Parallax & Fade
gsap.utils.toArray('.section-header, .glass-dashboard, .glass-panel').forEach(section => {
    gsap.fromTo(section, 
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "top 50%",
                scrub: 1
            }
        }
    );
});

// 3. Hero content Parallax (moves opposite to scroll slightly)
gsap.to('.hero-content', {
    y: 150,
    opacity: 0,
    scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

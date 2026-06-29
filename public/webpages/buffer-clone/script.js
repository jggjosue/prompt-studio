// Initialize Three.js Scene for 3D Background
const canvas = document.querySelector('#webgl-canvas');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.03); // Match bg color for depth

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Initial camera position for Hero
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x6366f1, 1, 100); // Primary Accent
pointLight1.position.set(5, 5, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xa855f7, 0.8, 100); // Secondary Accent
pointLight2.position.set(-5, -5, 2);
scene.add(pointLight2);

// Create 3D Objects for the "Control Center"
const objectsGroup = new THREE.Group();
scene.add(objectsGroup);

// Utility to create glowing panels (representing dashboards)
function createPanel(width, height, color, x, y, z, rx, ry, rz) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.2,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        emissive: color,
        emissiveIntensity: 0.1
    });
    
    // Add a wireframe edge for tech look
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
    const lines = new THREE.LineSegments(edges, lineMaterial);
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.add(lines);
    
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    
    objectsGroup.add(mesh);
    return mesh;
}

// Create particles (nodes)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 500;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles in a wide tunnel
    posArray[i] = (Math.random() - 0.5) * 40;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x6366f1,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Add some abstract UI panels floating in space
// (width, height, color, x, y, z, rx, ry, rz)
const panel1 = createPanel(4, 3, 0x6366f1, 4, 1, -5, 0, -0.5, 0);
const panel2 = createPanel(3, 5, 0xa855f7, -5, -1, -8, 0, 0.4, 0);
const panel3 = createPanel(6, 2, 0xec4899, 2, -4, -12, -0.3, 0, 0);
const panel4 = createPanel(2, 4, 0x6366f1, -3, 3, -15, 0.2, 0.5, 0);
const panel5 = createPanel(5, 3, 0xa855f7, 5, -2, -20, 0, -0.2, 0);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Slight floaty movement for panels
    objectsGroup.children.forEach((child, index) => {
        child.position.y += Math.sin(elapsedTime * 0.5 + index) * 0.002;
        child.rotation.z = Math.sin(elapsedTime * 0.2 + index) * 0.02;
    });
    
    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.02;
    
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

// GSAP Scroll Animations
gsap.registerPlugin(ScrollTrigger);

// 1. Tie Camera position/rotation to scroll
// The entire scroll duration will map to moving the camera deeply into the Z axis
const mainTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Move camera forward through the scene
mainTimeline.to(camera.position, {
    z: -25, // Move deep into the scene
    ease: "none"
}, 0);

// Add slight rotation to camera for a more dynamic "flight" feel
mainTimeline.to(camera.rotation, {
    z: 0.2,
    ease: "power1.inOut"
}, 0);

// 2. HTML Parallax Effects
// Select all elements with the 'parallax-element' class
const parallaxElements = document.querySelectorAll('.parallax-element');

parallaxElements.forEach((el) => {
    const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
    
    gsap.to(el, {
        y: () => (ScrollTrigger.maxScroll(window) * speed),
        ease: "none",
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true // Recalculate on resize
        }
    });
});

// 3. Reveal Animations for sections (Fade up)
gsap.utils.toArray('.section').forEach(section => {
    gsap.from(section.querySelectorAll('.text-content, .center-content'), {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: section,
            start: "top 70%",
        }
    });
    
    gsap.from(section.querySelectorAll('.glass-card'), {
        y: 100,
        opacity: 0,
        rotationX: 10,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
            trigger: section,
            start: "top 70%",
        }
    });
});

// Form Submission handling
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    
    btn.innerText = "Creating Workspace...";
    btn.style.opacity = "0.7";
    
    // Simulate API call
    setTimeout(() => {
        btn.innerText = "Welcome Aboard! 🎉";
        btn.style.background = "#10b981"; // Success green
        btn.style.opacity = "1";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "";
            e.target.reset();
        }, 3000);
    }, 1500);
});

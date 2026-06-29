// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

// --- 3D Scene Setup ---
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Initial camera position
camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- Objects in Scene ---

// Group for all objects to easily rotate/move everything together if needed
const mainGroup = new THREE.Group();
scene.add(mainGroup);

// Materials
const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true, transparent: true, opacity: 0.2 });
const solidMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 });
const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x7b2cbf, transparent: true, opacity: 0.8 });

// 1. Grid/Floor (The "Desk")
const gridHelper = new THREE.GridHelper(50, 50, 0x00ffcc, 0x00ffcc);
gridHelper.position.y = -2;
gridHelper.material.opacity = 0.1;
gridHelper.material.transparent = true;
mainGroup.add(gridHelper);

// 2. Abstract Monitors / Screens
const screens = [];
for (let i = 0; i < 5; i++) {
    const geometry = new THREE.PlaneGeometry(3 + Math.random() * 2, 2 + Math.random() * 1.5);
    const screen = new THREE.Mesh(geometry, screenMaterial.clone());
    
    // Position randomly along the Z axis (depth)
    screen.position.x = (Math.random() - 0.5) * 15;
    screen.position.y = (Math.random() - 0.5) * 5 + 2;
    screen.position.z = - (i * 15) - 5;
    
    // Random rotation
    screen.rotation.y = (Math.random() - 0.5) * 0.5;
    
    screen.material.opacity = 0.4 + Math.random() * 0.4;
    
    mainGroup.add(screen);
    screens.push(screen);
}

// 3. Floating Geometric Shapes (representing components/code)
const shapes = [];
const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.OctahedronGeometry(1, 0)
];

for(let i=0; i<30; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mesh = new THREE.Mesh(geo, wireframeMaterial);
    
    mesh.position.x = (Math.random() - 0.5) * 30;
    mesh.position.y = (Math.random() - 0.5) * 20;
    mesh.position.z = (Math.random() - 0.5) * 100 - 10; // Spread deeply
    
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    mainGroup.add(mesh);
    shapes.push({ mesh, speedX: Math.random() * 0.01, speedY: Math.random() * 0.01 });
}

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ffcc, 2, 50);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0x7b2cbf, 2, 50);
pointLight2.position.set(0, 5, -30);
scene.add(pointLight2);


// --- Scroll Animations (GSAP) ---

// Camera path animation
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".content",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Move camera forward (into the screen) as we scroll down
tl.to(camera.position, {
    z: -80,
    ease: "none"
}, 0);

// Slightly rotate the group for a parallax effect on the whole scene
tl.to(mainGroup.rotation, {
    y: Math.PI / 4,
    ease: "none"
}, 0);


// HTML Parallax effects
document.querySelectorAll('[data-parallax]').forEach(elem => {
    const speed = parseFloat(elem.getAttribute('data-parallax'));
    gsap.to(elem, {
        y: () => (ScrollTrigger.maxScroll(window) * speed),
        ease: "none",
        scrollTrigger: {
            trigger: ".content",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true
        }
    });
});

// Fade in sections
gsap.utils.toArray('.section-content').forEach(section => {
    gsap.to(section, {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
            trigger: section,
            start: "top 80%", // trigger when top of section is 80% down viewport
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });
});


// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();

    // Animate shapes
    shapes.forEach(obj => {
        obj.mesh.rotation.x += obj.speedX;
        obj.mesh.rotation.y += obj.speedY;
        obj.mesh.position.y += Math.sin(time + obj.mesh.position.x) * 0.01;
    });
    
    // Animate screens slightly
    screens.forEach((screen, index) => {
        screen.position.y += Math.sin(time * 0.5 + index) * 0.005;
    });

    // Move lights slightly
    pointLight.position.x = Math.sin(time * 0.5) * 10;
    pointLight2.position.x = Math.cos(time * 0.3) * 10;

    renderer.render(scene, camera);
}

animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Mobile Menu Toggle ---
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if(hamburger) {
    hamburger.addEventListener('click', () => {
        // Toggle mobile menu visibility logic here
        // For simplicity in this demo, just alert or toggle a class
        alert('Mobile menu toggled');
    });
}

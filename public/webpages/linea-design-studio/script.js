import * as THREE from 'three';

// --- Three.js Setup ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
// Deep dark background
scene.background = new THREE.Color('#050507');
scene.fog = new THREE.FogExp2('#050507', 0.02);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 5;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x5a4fcf, 2, 20); // Accent color light
pointLight.position.set(2, 3, 2);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 1, 20);
pointLight2.position.set(-2, -2, 2);
scene.add(pointLight2);

// --- Materials ---
const materialGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
    envMapIntensity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
});

const materialWireframe = new THREE.MeshBasicMaterial({
    color: 0x5a4fcf,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});

// --- Objects (Design Elements) ---
const objects = [];
const objectDistance = 4; // Distance between sections vertically

// 1. Hero: Abstract Grid/Lines
const geomHero = new THREE.TorusGeometry(1.5, 0.4, 16, 60);
const meshHero = new THREE.Mesh(geomHero, materialWireframe);
meshHero.position.y = -objectDistance * 0;
meshHero.position.x = 2;
scene.add(meshHero);
objects.push(meshHero);

// 2. Services: Primitives (Blocks)
const geomServices = new THREE.IcosahedronGeometry(1, 1);
const meshServices = new THREE.Mesh(geomServices, materialGlass);
meshServices.position.y = -objectDistance * 1;
meshServices.position.x = -2;
scene.add(meshServices);
objects.push(meshServices);

// 3. Projects: Screens/Planes
const geomProjects = new THREE.PlaneGeometry(2, 3);
const meshProjects = new THREE.Mesh(geomProjects, materialGlass);
meshProjects.position.y = -objectDistance * 2;
meshProjects.position.x = 2;
scene.add(meshProjects);
objects.push(meshProjects);

// 4. Process: Intersecting shapes
const geomProcess = new THREE.TorusKnotGeometry(0.8, 0.2, 100, 16);
const meshProcess = new THREE.Mesh(geomProcess, materialWireframe);
meshProcess.position.y = -objectDistance * 3;
meshProcess.position.x = -2;
scene.add(meshProcess);
objects.push(meshProcess);

// 5. Packages: Solid blocks
const geomPackages = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const meshPackages = new THREE.Mesh(geomPackages, materialGlass);
meshPackages.position.y = -objectDistance * 4;
meshPackages.position.x = 2;
scene.add(meshPackages);
objects.push(meshPackages);

// 6. Contact: Floating particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 200;
const posArray = new Float32Array(particlesCount * 3);
for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x5a4fcf
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
particlesMesh.position.y = -objectDistance * 5;
scene.add(particlesMesh);


// --- Scroll Animation (Three.js camera movement) ---
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);
    if(newSection !== currentSection) {
        currentSection = newSection;
        // Trigger subtle animation on objects when entering new section
        if(objects[currentSection]) {
            gsap.to(objects[currentSection].rotation, {
                duration: 1.5,
                ease: "power2.inOut",
                x: "+=2",
                y: "+=3",
                z: "+=1.5"
            });
        }
    }
});

// --- Mouse Interaction ---
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
});

// --- Animation Loop ---
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Animate camera position based on scroll
    // Map scroll position to camera Y position
    camera.position.y = -(scrollY / sizes.height) * objectDistance;

    // Parallax effect on camera based on mouse
    const parallaxX = cursor.x * 0.5;
    const parallaxY = -cursor.y * 0.5;
    
    // Smooth camera transition
    camera.position.x += (parallaxX - camera.position.x) * 5 * deltaTime;
    // We add the base Y (scroll) + Parallax Y
    const targetY = -(scrollY / sizes.height) * objectDistance + parallaxY;
    // We don't interpolate the Y scroll directly here to avoid delay on fast scrolls, 
    // just the parallax offset, but for simplicity we blend them:
    // camera.position.y += (targetY - camera.position.y) * 5 * deltaTime;

    // Animate objects continuously
    for(const object of objects) {
        object.rotation.x += deltaTime * 0.1;
        object.rotation.y += deltaTime * 0.12;
    }
    
    particlesMesh.rotation.y = elapsedTime * 0.05;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

// --- Resize Handling ---
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


// --- DOM Interactions & GSAP ---
document.addEventListener("DOMContentLoaded", (event) => {
    // GSAP ScrollTrigger Setup for HTML elements
    gsap.registerPlugin(ScrollTrigger);

    // Parallax effect for UI elements
    const parallaxElements = document.querySelectorAll('.parallax-el');
    
    parallaxElements.forEach((el) => {
        const speed = el.dataset.speed || 1;
        gsap.to(el, {
            y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed * 0.1,
            ease: "none",
            scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    });

    // Form submission
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = "Enviando...";
            btn.style.opacity = "0.7";
            
            setTimeout(() => {
                alert("¡Gracias por contactarnos! Un diseñador de Linea se pondrá en contacto contigo pronto.");
                form.reset();
                btn.innerText = originalText;
                btn.style.opacity = "1";
            }, 1000);
        });
    }
});

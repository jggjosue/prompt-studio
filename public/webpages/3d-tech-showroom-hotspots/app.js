/**
 * 3D Tech Showroom Hotspots - Main Application Script
 * Handles Three.js setup, GSAP scroll animations, and UI interactions.
 */

// --- 1. Three.js Setup ---
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

// Camera
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 2, 8);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00d4ff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xb537f2, 3, 10);
pointLight.position.set(-5, 3, 0);
scene.add(pointLight);

// --- 2. Create Showroom Objects ---
const objectsToTest = [];

// Object 1: Quantum Data Module (Glowing Cube)
const geo1 = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const mat1 = new THREE.MeshStandardMaterial({ 
    color: 0x00d4ff, 
    wireframe: true,
    emissive: 0x002244,
    emissiveIntensity: 0.5
});
const obj1 = new THREE.Mesh(geo1, mat1);
obj1.position.set(-3, 0, 0);
obj1.userData = { panelId: 'panel-1' };
scene.add(obj1);
objectsToTest.push(obj1);

// Object 2: Synapse IA (Sphere/Icosahedron)
const geo2 = new THREE.IcosahedronGeometry(1, 1);
const mat2 = new THREE.MeshStandardMaterial({
    color: 0xb537f2,
    flatShading: true,
    metalness: 0.8,
    roughness: 0.2
});
const obj2 = new THREE.Mesh(geo2, mat2);
obj2.position.set(0, 0.5, 0);
obj2.userData = { panelId: 'panel-2' };
scene.add(obj2);
objectsToTest.push(obj2);

// Object 3: HoloScreen Pro (Floating Planes)
const geo3 = new THREE.PlaneGeometry(2, 1.2);
const mat3 = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
    emissive: 0xffaa00,
    emissiveIntensity: 0.2
});
const obj3 = new THREE.Mesh(geo3, mat3);
obj3.position.set(3, 0, 0);
obj3.userData = { panelId: 'panel-3' };
scene.add(obj3);
objectsToTest.push(obj3);

// Particles Background
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 500;
const posArray = new Float32Array(particlesCount * 3);

for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);


// --- 3. Animation Loop ---
const clock = new THREE.Clock();
let currentIntersect = null;

function tick() {
    const elapsedTime = clock.getElapsedTime();

    // Floating animations
    obj1.rotation.x = elapsedTime * 0.2;
    obj1.rotation.y = elapsedTime * 0.3;
    obj1.position.y = Math.sin(elapsedTime) * 0.2;

    obj2.rotation.y = elapsedTime * 0.5;
    obj2.position.y = Math.sin(elapsedTime * 1.5) * 0.2 + 0.5;

    obj3.rotation.y = Math.sin(elapsedTime * 0.5) * 0.3;
    obj3.position.y = Math.sin(elapsedTime * 0.8) * 0.1;

    particlesMesh.rotation.y = -elapsedTime * 0.02;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick();

// --- 4. Resize Handling ---
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- 5. GSAP Scroll Animations ---
gsap.registerPlugin(ScrollTrigger);

// Timeline for Camera Movement on Scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-content",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Hero to Features
tl.to(camera.position, {
    z: 4,
    x: 2,
    y: 1,
    ease: "power1.inOut"
}, 0);

// Features to Showroom (Bring camera right in front of objects)
tl.to(camera.position, {
    z: 3,
    x: 0,
    y: 0,
    ease: "power1.inOut"
}, 0.33);
tl.to(scene.rotation, {
    y: Math.PI * 2, // Full rotation to show objects
    ease: "power1.inOut"
}, 0.33);

// Showroom to Pricing/Contact (Move away or look up)
tl.to(camera.position, {
    z: 8,
    y: 4,
    x: -2,
    ease: "power1.inOut"
}, 0.66);
tl.to(camera.rotation, {
    x: -0.5,
    ease: "power1.inOut"
}, 0.66);

// Parallax effects on DOM elements
gsap.utils.toArray('.parallax-text').forEach(text => {
    gsap.to(text, {
        y: -50,
        scrollTrigger: {
            trigger: text,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// --- 6. Raycasting & Hotspots ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
    
    // Check intersection for hover effects (cursor change)
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objectsToTest);
    
    if(intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        currentIntersect = intersects[0];
    } else {
        document.body.style.cursor = 'default';
        currentIntersect = null;
    }
});

window.addEventListener('click', () => {
    if(currentIntersect) {
        const panelId = currentIntersect.object.userData.panelId;
        openPanel(panelId);
    }
});

function openPanel(id) {
    // Close all panels first
    document.querySelectorAll('.hotspot-panel').forEach(p => p.classList.remove('active'));
    // Open target
    const panel = document.getElementById(id);
    if(panel) {
        panel.classList.add('active');
    }
}

// Close buttons for panels
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.hotspot-panel').classList.remove('active');
    });
});

// --- 7. UI Interactivity ---
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    
    btn.innerText = 'Enviando...';
    btn.style.opacity = '0.7';
    
    setTimeout(() => {
        btn.innerText = '¡Solicitud Enviada!';
        btn.style.background = '#4CAF50';
        btn.style.color = 'white';
        btn.style.opacity = '1';
        e.target.reset();
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 3000);
    }, 1500);
});

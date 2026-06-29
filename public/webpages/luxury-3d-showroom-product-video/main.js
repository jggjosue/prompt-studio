import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// --- Scene Setup ---
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.02);

// Camera setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
const initialCameraPos = { x: 0, y: 1.5, z: 12 }; // Far back
camera.position.set(initialCameraPos.x, initialCameraPos.y, initialCameraPos.z);

// --- Materials ---
const materials = {
    obsidian: new THREE.MeshPhysicalMaterial({
        color: 0x111111,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    }),
    platinum: new THREE.MeshPhysicalMaterial({
        color: 0xe5e4e2,
        metalness: 1.0,
        roughness: 0.3,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
    }),
    'rose-gold': new THREE.MeshPhysicalMaterial({
        color: 0xb76e79,
        metalness: 1.0,
        roughness: 0.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
    })
};

// --- Objects ---
// 1. The Pedestal
const pedestalGeo = new THREE.CylinderGeometry(2, 2.2, 0.5, 64);
const pedestalMat = new THREE.MeshStandardMaterial({ 
    color: 0x0a0a0a, 
    roughness: 0.1, 
    metalness: 0.8 
});
const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
pedestal.position.y = -0.25;
pedestal.receiveShadow = true;
scene.add(pedestal);

// Glowing ring around pedestal
const ringGeo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.position.y = 0;
ring.rotation.x = Math.PI / 2;
scene.add(ring);

// 2. The Product Placeholder (Sleek Rounded Box)
const productGroup = new THREE.Group();
const productGeo = new RoundedBoxGeometry(1.2, 2.5, 0.4, 6, 0.1);
const productMesh = new THREE.Mesh(productGeo, materials.obsidian);
productMesh.position.y = 1.25;
productMesh.castShadow = true;
productMesh.receiveShadow = true;
productGroup.add(productMesh);

// Add some internal details to the product to make it look premium
const detailGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.45, 32);
const detailMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.9, roughness: 0.1 });
const detailMesh = new THREE.Mesh(detailGeo, detailMat);
detailMesh.position.set(0, 1.8, 0);
detailMesh.rotation.x = Math.PI / 2;
productGroup.add(detailMesh);

scene.add(productGroup);

// --- Lighting ---
RectAreaLightUniformsLib.init();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Main spotlight
const spotLight = new THREE.SpotLight(0xffffff, 50);
spotLight.position.set(0, 8, 4);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 2;
spotLight.distance = 20;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

// Backlight for rim lighting
const backLight = new THREE.RectAreaLight(0xd4af37, 5, 4, 10);
backLight.position.set(0, 3, -4);
backLight.lookAt(0, 1, 0);
scene.add(backLight);

// Fill light
const fillLight = new THREE.DirectionalLight(0x88bbff, 0.5);
fillLight.position.set(-5, 3, 5);
scene.add(fillLight);

// --- Particles ---
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 200;
const posArray = new Float32Array(particlesCount * 3);
for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xd4af37,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// --- Controls (for 360 mode) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.enablePan = false;
controls.enabled = false; // Disabled by default, enabled in Section 4

// --- Hotspots Logic ---
const raycaster = new THREE.Raycaster();
const hotspots3D = [
    { position: new THREE.Vector3(0, 1.8, 0.2), element: document.getElementById('marker-1') },
    { position: new THREE.Vector3(0.5, 0.5, 0.2), element: document.getElementById('marker-2') }
];

function updateHotspots() {
    hotspots3D.forEach(hotspot => {
        if (!hotspot.element.classList.contains('visible')) return;
        
        const pos = hotspot.position.clone();
        // Adjust for product rotation
        pos.applyMatrix4(productGroup.matrixWorld);
        pos.project(camera);
        
        const x = (pos.x * .5 + .5) * window.innerWidth;
        const y = (pos.y * -.5 + .5) * window.innerHeight;
        
        // Hide if behind object
        if(pos.z > 1) {
            hotspot.element.style.opacity = 0;
        } else {
            hotspot.element.style.opacity = 1;
            hotspot.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        }
    });
}

// --- GSAP Scroll Animations ---
gsap.registerPlugin(ScrollTrigger);

// Parallax for HTML elements
gsap.utils.toArray('.parallax-text').forEach(text => {
    const speed = text.getAttribute('data-speed');
    gsap.to(text, {
        y: () => -100 * speed,
        ease: "none",
        scrollTrigger: {
            trigger: text.closest('.step'),
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// Setup master timeline linked to scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Section 1: Reveal (Camera moves in)
tl.to(camera.position, {
    z: 6,
    y: 2,
    ease: "power2.inOut"
}, "0"); // Start at beginning of scroll

// Section 2: Details (Camera rotates, product rotates, hotspots appear)
tl.to(camera.position, {
    x: 4,
    y: 2,
    z: 4,
    ease: "power2.inOut"
}, "0.25");
tl.to(productGroup.rotation, {
    y: Math.PI / 4,
    ease: "power2.inOut"
}, "0.25");

// Show hotspots around section 2
ScrollTrigger.create({
    trigger: "#step-2",
    start: "top center",
    end: "bottom center",
    onEnter: () => document.querySelectorAll('.hotspot-marker').forEach(m => m.classList.add('visible')),
    onLeave: () => document.querySelectorAll('.hotspot-marker').forEach(m => m.classList.remove('visible')),
    onEnterBack: () => document.querySelectorAll('.hotspot-marker').forEach(m => m.classList.add('visible')),
    onLeaveBack: () => document.querySelectorAll('.hotspot-marker').forEach(m => m.classList.remove('visible')),
});

// Section 3: Materials (Camera moves to other side)
tl.to(camera.position, {
    x: -3,
    y: 1.5,
    z: 5,
    ease: "power2.inOut"
}, "0.5");
tl.to(productGroup.rotation, {
    y: -Math.PI / 6,
    ease: "power2.inOut"
}, "0.5");

// Section 4: 360 View (Camera centers, allow interaction)
tl.to(camera.position, {
    x: 0,
    y: 1.5,
    z: 5.5,
    ease: "power2.inOut"
}, "0.75");
tl.to(productGroup.rotation, {
    y: 0,
    ease: "power2.inOut"
}, "0.75");

ScrollTrigger.create({
    trigger: "#step-4",
    start: "top center",
    end: "bottom center",
    onEnter: () => {
        document.querySelector('.canvas-container').classList.add('interactive');
        controls.enabled = true;
    },
    onLeave: () => {
        document.querySelector('.canvas-container').classList.remove('interactive');
        controls.enabled = false;
        // reset rotation smoothly
        gsap.to(productGroup.rotation, {y: 0, duration: 1});
        gsap.to(camera.position, {x: 0, y: 1.5, z: 5.5, duration: 1});
    },
    onEnterBack: () => {
        document.querySelector('.canvas-container').classList.add('interactive');
        controls.enabled = true;
    },
    onLeaveBack: () => {
        document.querySelector('.canvas-container').classList.remove('interactive');
        controls.enabled = false;
    }
});

// Section 5: Checkout (Camera slightly moves away, out of focus)
tl.to(camera.position, {
    z: 7,
    y: 2,
    ease: "power2.inOut"
}, "1.0");

// --- Material Switching ---
document.querySelectorAll('.mat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mat-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const matName = e.currentTarget.getAttribute('data-mat');
        if(materials[matName]) {
            productMesh.material = materials[matName];
        }
    });
});

// --- Form Submission ---
document.getElementById('reservation-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Request Sent";
    btn.style.background = "#4CAF50";
    btn.style.color = "white";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "var(--accent-color)";
        btn.style.color = "black";
        e.target.reset();
    }, 3000);
});


// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Idle animation for the product
    if(!controls.enabled) {
        productGroup.position.y = 1.25 + Math.sin(elapsedTime * 2) * 0.05;
    }
    
    // Animate particles
    particlesMesh.rotation.y = elapsedTime * 0.05;
    
    updateHotspots();
    
    if(controls.enabled) controls.update();
    
    // Always look at the product
    if(!controls.enabled) {
        camera.lookAt(productGroup.position);
    }
    
    renderer.render(scene, camera);
}

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loop
animate();

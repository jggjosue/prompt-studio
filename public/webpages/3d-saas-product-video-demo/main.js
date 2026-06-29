import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import ScrollTrigger from 'ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- Initialization ---
const loader = document.getElementById('loader');

// Wait for a bit to simulate loading and ensure fonts load
function hideLoader() {
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000);
    }, 1000);
}

if (document.readyState === 'complete') {
    hideLoader();
} else {
    window.addEventListener('load', hideLoader);
}

// --- Three.js Setup ---
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050507, 0.02);

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x3b82f6, 50, 50);
blueLight.position.set(5, 5, 5);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0x8b5cf6, 50, 50);
purpleLight.position.set(-5, -5, 5);
scene.add(purpleLight);

// --- Scene Objects ---

// 1. Grid Floor
const gridHelper = new THREE.GridHelper(100, 100, 0x1a1c29, 0x1a1c29);
gridHelper.position.y = -5;
scene.add(gridHelper);

// 2. Particles (Data flow)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 60;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// 3. Floating UI Modules (Dashboards / Screens)
const screensGroup = new THREE.Group();
scene.add(screensGroup);

// Create a function to generate a complex "dashboard" mesh
function createDashboard() {
    const group = new THREE.Group();
    
    // Main backplate
    const bgGeo = new THREE.PlaneGeometry(4, 2.5);
    const bgMat = new THREE.MeshBasicMaterial({ 
        color: 0x0a0c10, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        wireframe: true 
    });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    group.add(bg);
    
    // Add some "UI elements" (smaller planes)
    for(let j=0; j<3; j++) {
        const uiGeo = new THREE.PlaneGeometry(1, 0.5);
        const uiMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 });
        const ui = new THREE.Mesh(uiGeo, uiMat);
        ui.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 1.5, 0.1);
        group.add(ui);
    }
    
    // Add some "bar charts"
    for(let j=0; j<5; j++) {
        const h = Math.random() * 1.5;
        const barGeo = new THREE.BoxGeometry(0.2, h, 0.2);
        const barMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.6 });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(-1.5 + j * 0.4, -1 + h/2, 0.1);
        group.add(bar);
    }
    
    return group;
}

for(let i=0; i<15; i++) {
    const dashboard = createDashboard();
    dashboard.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 50 - 15
    );
    dashboard.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
    );
    screensGroup.add(dashboard);
}

// --- Camera Animation Path (ScrollTrigger) ---

// Define camera positions for each section
const cameraPath = {
    hero: { pos: {x: 0, y: 0, z: 15}, rot: {x: 0, y: 0, z: 0} },
    problem: { pos: {x: 10, y: 5, z: 5}, rot: {x: -0.2, y: 0.5, z: 0} },
    demo: { pos: {x: -10, y: 2, z: 10}, rot: {x: 0, y: -0.5, z: 0} },
    features: { pos: {x: 0, y: 10, z: -5}, rot: {x: -1, y: 0, z: 0} },
    metrics: { pos: {x: -5, y: 15, z: -10}, rot: {x: -0.5, y: -0.5, z: 0} },
    integrations: { pos: {x: 5, y: 8, z: 0}, rot: {x: 0, y: 1, z: 0} },
    pricing: { pos: {x: 5, y: -2, z: 20}, rot: {x: 0.1, y: 0.2, z: 0} },
    testimonials: { pos: {x: -8, y: -5, z: 15}, rot: {x: 0.2, y: -0.2, z: 0} },
    faq: { pos: {x: 0, y: 5, z: 5}, rot: {x: -0.1, y: 0, z: 0} },
    contact: { pos: {x: 0, y: 0, z: 15}, rot: {x: 0, y: 0, z: 0} }
};

// Set initial camera position
camera.position.set(cameraPath.hero.pos.x, cameraPath.hero.pos.y, cameraPath.hero.pos.z);

// Create GSAP Timeline for Camera
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Helper function to add camera animation to timeline
function addCameraStop(sectionId, pathData) {
    tl.to(camera.position, {
        x: pathData.pos.x,
        y: pathData.pos.y,
        z: pathData.pos.z,
        ease: "power1.inOut"
    }, sectionId);
    
    tl.to(camera.rotation, {
        x: pathData.rot.x,
        y: pathData.rot.y,
        z: pathData.rot.z,
        ease: "power1.inOut"
    }, sectionId);
}

// We map the stops relatively
addCameraStop("+=1", cameraPath.problem);
addCameraStop("+=1", cameraPath.demo);
addCameraStop("+=1", cameraPath.features);
addCameraStop("+=1", cameraPath.metrics);
addCameraStop("+=1", cameraPath.integrations);
addCameraStop("+=1", cameraPath.pricing);
addCameraStop("+=1", cameraPath.testimonials);
addCameraStop("+=1", cameraPath.faq);
addCameraStop("+=1", cameraPath.contact);

// --- DOM Parallax Animations ---
document.querySelectorAll('.parallax-el').forEach(el => {
    const speed = parseFloat(el.getAttribute('data-speed')) || 1.1;
    
    gsap.to(el, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * (speed - 1),
        ease: "none",
        scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// --- Render Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Float screens
    screensGroup.children.forEach((screen, index) => {
        screen.position.y += Math.sin(elapsedTime + index) * 0.01;
        screen.rotation.x += 0.001;
        screen.rotation.y += 0.002;
    });

    renderer.render(scene, camera);
}

animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- UI Interactions ---

// Video Player
const video = document.getElementById('product-video');
const videoOverlay = document.getElementById('video-overlay');

videoOverlay.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        videoOverlay.style.opacity = '0';
    } else {
        video.pause();
        videoOverlay.style.opacity = '1';
    }
});
video.addEventListener('ended', () => {
    videoOverlay.style.opacity = '1';
});

// Form submission
const form = document.getElementById('trial-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Processing...';
    
    setTimeout(() => {
        btn.innerHTML = 'Demo Requested Successfully!';
        btn.style.background = '#10b981'; // green
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            form.reset();
        }, 3000);
    }, 1500);
});

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('active');
    });
});

// Metrics Counter Animation
const metrics = document.querySelectorAll('.metric-val');
metrics.forEach(metric => {
    ScrollTrigger.create({
        trigger: metric,
        start: "top 85%",
        once: true,
        onEnter: () => {
            const target = parseFloat(metric.getAttribute('data-target'));
            const isFloat = target % 1 !== 0;
            gsap.to(metric, {
                innerHTML: target,
                duration: 2.5,
                snap: { innerHTML: isFloat ? 0.01 : 1 },
                ease: "power2.out",
                onUpdate: function() {
                    if(!isFloat) {
                        metric.innerHTML = Math.round(this.targets()[0].innerHTML);
                    }
                }
            });
        }
    });
});

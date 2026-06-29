// Initialize Smooth Scrolling (Lenis)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Update ScrollTrigger on Lenis scroll
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0, 0)

// Navbar Background and Mobile Menu
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(5, 5, 8, 0.9)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(5, 5, 8, 0.7)';
        navbar.style.boxShadow = 'none';
    }
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    // Animate hamburger to X
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.click();
    });
});

// GSAP Animations
// Hero Elements
gsap.from(".badge", { opacity: 0, y: 20, duration: 1, delay: 0.2 });
gsap.from(".hero h1", { opacity: 0, y: 30, duration: 1, delay: 0.4 });
gsap.from(".hero p", { opacity: 0, y: 30, duration: 1, delay: 0.6 });
gsap.from(".hero-buttons", { opacity: 0, y: 30, duration: 1, delay: 0.8 });

gsap.from(".video-panel", { opacity: 0, x: 50, rotationY: -30, duration: 1.5, delay: 0.5, ease: "power3.out" });
gsap.from(".whiteboard-panel", { opacity: 0, x: 50, y: 50, rotationY: 30, duration: 1.5, delay: 0.7, ease: "power3.out" });
gsap.from(".quiz-panel", { opacity: 0, y: 50, rotationX: 30, duration: 1.5, delay: 0.9, ease: "power3.out" });

// Parallax Effects on Scroll
const parallaxTexts = document.querySelectorAll('.parallax-text');
parallaxTexts.forEach(text => {
    const speed = text.getAttribute('data-speed');
    gsap.to(text, {
        y: () => -50 * speed,
        ease: "none",
        scrollTrigger: {
            trigger: text,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

const parallaxBoxes = document.querySelectorAll('.parallax-box');
parallaxBoxes.forEach(box => {
    const speed = box.getAttribute('data-speed');
    gsap.to(box, {
        y: () => -100 * speed,
        ease: "none",
        scrollTrigger: {
            trigger: box.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// Feature Cards Stagger
gsap.from(".feature-card", {
    scrollTrigger: {
        trigger: ".features-grid",
        start: "top 80%",
    },
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out"
});

// Classroom Dashboard Animation
gsap.from(".glass-dashboard", {
    scrollTrigger: {
        trigger: ".classroom",
        start: "top 70%",
    },
    opacity: 0,
    rotationY: -30,
    z: -200,
    duration: 1.5,
    ease: "power3.out"
});

// --- THREE.JS BACKGROUND ---
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
// Fog to blend into background
scene.fog = new THREE.FogExp2(0x050508, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x4F46E5, 2, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xE879F9, 2, 100);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

// Particles / Geometric Objects representing learning/data
const objects = [];
const geometry1 = new THREE.IcosahedronGeometry(1, 0);
const geometry2 = new THREE.OctahedronGeometry(1, 0);
const geometry3 = new THREE.TorusGeometry(0.8, 0.2, 16, 32);

const material1 = new THREE.MeshPhysicalMaterial({
    color: 0x4F46E5,
    metalness: 0.5,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
    wireframe: true
});

const material2 = new THREE.MeshPhysicalMaterial({
    color: 0x06B6D4,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.5
});

const material3 = new THREE.MeshPhysicalMaterial({
    color: 0xE879F9,
    metalness: 0.1,
    roughness: 0.5,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});

for (let i = 0; i < 60; i++) {
    let mesh;
    const rand = Math.random();
    if (rand < 0.33) mesh = new THREE.Mesh(geometry1, material1);
    else if (rand < 0.66) mesh = new THREE.Mesh(geometry2, material2);
    else mesh = new THREE.Mesh(geometry3, material3);

    mesh.position.x = (Math.random() - 0.5) * 40;
    mesh.position.y = (Math.random() - 0.5) * 40;
    mesh.position.z = (Math.random() - 0.5) * 40 - 10; // Push back

    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    const scale = Math.random() * 0.5 + 0.1;
    mesh.scale.set(scale, scale, scale);

    scene.add(mesh);
    objects.push({
        mesh: mesh,
        rx: (Math.random() - 0.5) * 0.01,
        ry: (Math.random() - 0.5) * 0.01
    });
}

camera.position.z = 5;

// Scroll animation for Camera
ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: (self) => {
        // Move camera forward through the objects as you scroll down
        camera.position.z = 5 - (self.progress * 25);
        // Rotate camera slightly
        camera.rotation.y = self.progress * 0.5;
        camera.rotation.z = self.progress * 0.2;
    }
});

// Mouse Movement Parallax
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;

    objects.forEach(obj => {
        obj.mesh.rotation.x += obj.rx;
        obj.mesh.rotation.y += obj.ry;
    });

    renderer.render(scene, camera);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

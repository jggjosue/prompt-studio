// Initialize GSAP and ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------------------
// 1. Three.js Scene Setup (The 3D Wellness Garden)
// --------------------------------------------------------
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Soft fog to create depth and calm atmosphere
scene.fog = new THREE.FogExp2(0xf7f9f6, 0.05);
scene.background = new THREE.Color(0xf7f9f6);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Initial camera position
camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfff5e6, 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Elements of the Garden
const objectsToAnimate = [];

// Create a path
const pathGeometry = new THREE.PlaneGeometry(3, 50);
const pathMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xdad3c7, 
    roughness: 0.9,
    metalness: 0.1
});
const path = new THREE.Mesh(pathGeometry, pathMaterial);
path.rotation.x = -Math.PI * 0.5;
path.position.y = 0;
path.position.z = -20;
scene.add(path);

// Add "stones" and "plants" along the path
const stoneGeometry = new THREE.DodecahedronGeometry(0.2, 1);
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x8a948d, roughness: 0.8 });

const plantGeometry = new THREE.ConeGeometry(0.5, 1.5, 5);
const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x6b8e6b, roughness: 0.7 });

for (let i = 0; i < 40; i++) {
    // Stones
    const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
    const xStone = (Math.random() - 0.5) * 6;
    const zStone = -Math.random() * 45;
    stone.position.set(xStone > 0 ? xStone + 1.5 : xStone - 1.5, 0.1, zStone);
    stone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    const scale = Math.random() * 0.5 + 0.5;
    stone.scale.set(scale, scale, scale);
    scene.add(stone);

    // Plants
    if (i % 2 === 0) {
        const plant = new THREE.Mesh(plantGeometry, plantMaterial);
        const xPlant = (Math.random() - 0.5) * 8;
        const zPlant = -Math.random() * 45;
        plant.position.set(xPlant > 0 ? xPlant + 2 : xPlant - 2, 0.75, zPlant);
        scene.add(plant);
    }
}

// Floating Particles (Leaves / Dust)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 300;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x8fbc8f,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Softly rotate particles
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
}
animate();

// --------------------------------------------------------
// 2. GSAP Scroll Animations (Camera movement & Parallax)
// --------------------------------------------------------

// Camera moves deeper into the garden on scroll
gsap.to(camera.position, {
    z: -40, // Move forward
    y: 1.0, // Drop slightly
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Animate HTML Elements
const sections = document.querySelectorAll('.step-section');

sections.forEach((section) => {
    const glassPanel = section.querySelector('.content-glass');
    const parallaxText = section.querySelector('.parallax-text');

    // Fade and slide in panels
    if (glassPanel) {
        gsap.fromTo(glassPanel, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: "top 70%",
                    end: "top 30%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }

    // Extra parallax for titles
    if (parallaxText) {
        gsap.to(parallaxText, {
            y: -30,
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    }
});

// --------------------------------------------------------
// 3. UI Interactions (Audio, Breathing, Form)
// --------------------------------------------------------

// Breathing Text Logic
const breathingText = document.querySelector('.breathing-text');
if (breathingText) {
    setInterval(() => {
        if(breathingText.innerText === 'Inhala') {
            breathingText.innerText = 'Exhala';
        } else {
            breathingText.innerText = 'Inhala';
        }
    }, 4000); // 4 seconds inhale, 4 seconds exhale to match CSS animation (8s total)
}

// Audio Toggle
const audioBtn = document.getElementById('toggle-audio');
const audioIcon = audioBtn.querySelector('i');
const audio = document.getElementById('ambient-audio');
let isPlaying = false;

audioBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        audioIcon.classList.remove('fa-volume-up');
        audioIcon.classList.add('fa-volume-mute');
    } else {
        // Try to play
        audio.play().catch(e => console.log("Audio play blocked by browser", e));
        audioIcon.classList.remove('fa-volume-mute');
        audioIcon.classList.add('fa-volume-up');
    }
    isPlaying = !isPlaying;
});

// Form Submission
const form = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulate sending
        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Enviando...';
        btn.disabled = true;

        setTimeout(() => {
            form.reset();
            btn.innerText = originalText;
            btn.disabled = false;
            form.style.display = 'none';
            formMessage.classList.remove('hidden');
        }, 1500);
    });
}

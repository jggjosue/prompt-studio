// --- Three.js Setup ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02); // Match background color for depth

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff007f, 2, 50); // Pink
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00f0ff, 2, 50); // Cyan
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);

// --- Objects ---
// 1. The "Smartphone"
const phoneGeometry = new THREE.BoxGeometry(3, 6, 0.2);
const phoneMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0x222222, 
    metalness: 0.9, 
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
});
const phone = new THREE.Mesh(phoneGeometry, phoneMaterial);
phone.position.set(0, 0, -5);
scene.add(phone);

// 2. Floating Particles (Avatars/Memories)
const particles = new THREE.Group();
const geo = new THREE.SphereGeometry(0.2, 16, 16);
const mat1 = new THREE.MeshBasicMaterial({ color: 0xff007f });
const mat2 = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
const mat3 = new THREE.MeshBasicMaterial({ color: 0xFFFC00 });

for(let i=0; i<50; i++) {
    const mesh = new THREE.Mesh(geo, i % 3 === 0 ? mat1 : (i % 2 === 0 ? mat2 : mat3));
    mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40 - 15
    );
    particles.add(mesh);
}
scene.add(particles);

camera.position.z = 2;

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Subtle floating animation for phone
    phone.position.y = Math.sin(elapsedTime) * 0.2;
    phone.rotation.x = Math.sin(elapsedTime * 0.5) * 0.1;
    phone.rotation.y = Math.sin(elapsedTime * 0.3) * 0.1;

    // Rotate particles slowly
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;

    renderer.render(scene, camera);
}
animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP ScrollTrigger Animations ---
gsap.registerPlugin(ScrollTrigger);

// 1. Move Three.js Camera on Scroll (Diving into the phone)
gsap.to(camera.position, {
    z: -30, // Move deep into the scene
    ease: "none",
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// Rotate the phone as we scroll past it
gsap.to(phone.rotation, {
    z: Math.PI / 2,
    y: Math.PI,
    ease: "none",
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// 2. Parallax HTML Elements
gsap.utils.toArray('.parallax-element').forEach(el => {
    const speed = el.getAttribute('data-speed');
    gsap.to(el, {
        y: () => (ScrollTrigger.maxScroll(window) * speed),
        ease: "none",
        scrollTrigger: {
            trigger: "#scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });
});

// 3. Fade in/up Sections
gsap.utils.toArray('.panel').forEach(panel => {
    gsap.from(panel.querySelector('.content-box') || panel.querySelector('.content-row'), {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: panel,
            start: "top 70%",
            toggleActions: "play none none reverse"
        }
    });
});

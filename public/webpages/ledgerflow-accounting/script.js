// Initialize Three.js Scene
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0f172a, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create Abstract Financial Objects
const objects = [];
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhysicalMaterial({
    color: 0x3b82f6,
    metalness: 0.5,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    wireframe: true
});

for (let i = 0; i < 100; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.x = (Math.random() - 0.5) * 40;
    mesh.position.y = (Math.random() - 0.5) * 40;
    mesh.position.z = (Math.random() - 0.5) * 40;
    
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    const scale = Math.random() * 1.5 + 0.5;
    mesh.scale.set(scale, scale, scale);
    
    scene.add(mesh);
    objects.push(mesh);
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x10b981, 2);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

camera.position.z = 15;

// Animation Loop
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

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    targetX = mouseX * 2;
    targetY = mouseY * 2;
    
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    const elapsedTime = clock.getElapsedTime();

    objects.forEach((obj, index) => {
        obj.rotation.x += 0.002;
        obj.rotation.y += 0.003;
        obj.position.y += Math.sin(elapsedTime * 0.5 + index) * 0.01;
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

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Parallax effects on text and elements
const parallaxElements = document.querySelectorAll('.parallax-text, .parallax-card, .float-1, .float-2, .dashboard-ui');

parallaxElements.forEach(el => {
    const speed = el.getAttribute('data-speed') || 1;
    
    gsap.to(el, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed * 0.1,
        ease: "none",
        scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// Feature cards stagger animation
gsap.from(".feature-card", {
    scrollTrigger: {
        trigger: ".features",
        start: "top 70%"
    },
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out"
});

// Dashboard bars animation
gsap.from(".bar", {
    scrollTrigger: {
        trigger: ".dashboard-preview",
        start: "top 60%"
    },
    scaleY: 0,
    transformOrigin: "bottom",
    duration: 1.5,
    stagger: 0.1,
    ease: "elastic.out(1, 0.3)"
});

// Move 3D camera on scroll
gsap.to(camera.position, {
    z: 5,
    y: -5,
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true
    }
});

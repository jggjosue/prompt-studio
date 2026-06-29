gsap.registerPlugin(ScrollTrigger);

// 1. Scene Setup
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
// No background color set in Three.js, using alpha: true to let CSS background show

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 2. Objects
const objects = [];
const material = new THREE.MeshStandardMaterial({ 
    color: 0xCA8A04, // Gold accent color
    wireframe: true,
    transparent: true,
    opacity: 0.3
});

const geometries = [
    new THREE.TorusGeometry(1, 0.3, 16, 100),
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.OctahedronGeometry(1.2),
    new THREE.ConeGeometry(1, 2, 32),
    new THREE.SphereGeometry(1, 32, 32)
];

// Create scattered objects
for(let i=0; i<40; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mesh = new THREE.Mesh(geo, material);
    
    mesh.position.x = (Math.random() - 0.5) * 30;
    mesh.position.y = (Math.random() - 0.5) * 30;
    mesh.position.z = (Math.random() - 0.5) * -60; // Spread along Z axis
    
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    scene.add(mesh);
    objects.push(mesh);
}

// 3. Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    objects.forEach((obj, idx) => {
        obj.rotation.x += 0.002 * (idx % 2 === 0 ? 1 : -1);
        obj.rotation.y += 0.003 * (idx % 3 === 0 ? 1 : -1);
    });
    
    renderer.render(scene, camera);
}
animate();

// 4. GSAP ScrollTrigger Integration
// Camera movement along Z axis based on scroll
gsap.to(camera.position, {
    z: -45,
    ease: "none",
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5
    }
});

// Parallax effects on HTML elements
const parallaxTexts = document.querySelectorAll('.parallax-text');
parallaxTexts.forEach(text => {
    gsap.fromTo(text, 
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: text,
                start: "top 85%",
                end: "top 50%",
                scrub: 1
            }
        }
    );
});

const cards = document.querySelectorAll('.parallax-card');
cards.forEach((card, i) => {
    gsap.fromTo(card,
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
                end: "top 70%",
                scrub: 1
            }
        }
    );
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

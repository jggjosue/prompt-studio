// Initialize Three.js Scene
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02); // Dark fog for depth

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

// Create 3D Objects (Abstract Interview Room)

// 1. The Table
const tableGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
const tableMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222,
    metalness: 0.8,
    roughness: 0.2
});
const table = new THREE.Mesh(tableGeometry, tableMaterial);
table.position.y = -2;
scene.add(table);

// 2. Chairs (Interviewer & Candidate)
const createChair = (x, z, rotation) => {
    const chairGeo = new THREE.BoxGeometry(2, 2.5, 2);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    const chair = new THREE.Mesh(chairGeo, chairMat);
    chair.position.set(x, -1, z);
    chair.rotation.y = rotation;
    scene.add(chair);
    return chair;
};
createChair(0, 7, 0); // Interviewer
createChair(0, -7, Math.PI); // Candidate

// 3. Floating Screens/Monitors (Representing Replays/Data)
const createScreen = (x, y, z, rotY) => {
    const screenGeo = new THREE.PlaneGeometry(4, 2.5);
    const screenMat = new THREE.MeshBasicMaterial({ 
        color: 0x6366f1, 
        transparent: true, 
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(x, y, z);
    screen.rotation.y = rotY;
    
    // Add wireframe edge
    const edges = new THREE.EdgesGeometry(screenGeo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xec4899 }));
    screen.add(line);
    
    scene.add(screen);
    return screen;
};

const screens = [
    createScreen(-8, 3, 0, Math.PI/4),
    createScreen(8, 2, 2, -Math.PI/6),
    createScreen(0, 5, -8, 0)
];

// 4. Data Particles (Floating notes/annotations representation)
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 200;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 30;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xec4899,
    transparent: true,
    opacity: 0.6
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0x6366f1, 2);
spotLight.position.set(0, 10, 0);
spotLight.angle = Math.PI/4;
spotLight.penumbra = 0.5;
scene.add(spotLight);

const accentLight = new THREE.PointLight(0xec4899, 1, 20);
accentLight.position.set(5, 2, 5);
scene.add(accentLight);


// Initial Camera Position
camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

// Animation Loop
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Gentle floating for screens
    screens.forEach((screen, index) => {
        screen.position.y += Math.sin(elapsedTime + index) * 0.005;
    });

    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Subtle camera parallax based on mouse
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 2 + 5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
animate();

// GSAP Scroll Animations
gsap.registerPlugin(ScrollTrigger);

// 3D Camera Scroll Animation
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

tl.to(camera.position, {
    z: 5,
    y: 2,
    ease: "power1.inOut"
}, 0)
.to(scene.rotation, {
    y: Math.PI / 2,
    ease: "power1.inOut"
}, 0)
.to(accentLight.position, {
    x: -5,
    z: -5,
}, 0);


// HTML Elements Parallax
const parallaxElements = document.querySelectorAll('.parallax-content, .parallax-panel');

parallaxElements.forEach(el => {
    const speed = el.dataset.speed || 1;
    gsap.fromTo(el, 
        { y: 50 * speed, opacity: 0 },
        { 
            y: -50 * speed,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
                trigger: el.parentElement,
                start: "top 80%",
                end: "bottom 20%",
                scrub: true
            }
        }
    );
});

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

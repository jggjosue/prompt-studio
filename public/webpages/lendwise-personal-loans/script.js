// --- Calculator Logic ---
const amountInput = document.getElementById('amount');
const amountVal = document.getElementById('amount-val');
const termInput = document.getElementById('term');
const termVal = document.getElementById('term-val');
const monthlyVal = document.getElementById('monthly-val');

function updateCalculator() {
    const amount = parseFloat(amountInput.value);
    const term = parseInt(termInput.value);
    
    amountVal.textContent = amount.toLocaleString();
    termVal.textContent = term;
    
    // Fictitious rate: 8.99% APR (annual) -> roughly 0.0899 / 12 monthly rate
    const r = 0.0899 / 12;
    const n = term;
    // Formula: M = P [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]
    let monthly = 0;
    if (r > 0) {
        monthly = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
        monthly = amount / n;
    }
    
    monthlyVal.textContent = '$' + monthly.toFixed(2);
}

amountInput.addEventListener('input', updateCalculator);
termInput.addEventListener('input', updateCalculator);

// Initial calculation
updateCalculator();


// --- GSAP Animations ---
gsap.registerPlugin(ScrollTrigger);

// Fade in panels on scroll
gsap.utils.toArray('.content-box').forEach(box => {
    gsap.to(box, {
        scrollTrigger: {
            trigger: box,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    });
});


// --- Three.js 3D Background ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xD4AF37, 2);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Objects
const objects = [];

// 1. Gold Coin (Cylinder) representing finance
const coinGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
const goldMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xD4AF37, 
    metalness: 0.8, 
    roughness: 0.2 
});
const coin = new THREE.Mesh(coinGeometry, goldMaterial);
coin.position.set(2, 1, -2);
coin.rotation.x = Math.PI / 2;
scene.add(coin);
objects.push(coin);

// 2. Shield (representing security) - simple custom shape
const shieldShape = new THREE.Shape();
shieldShape.moveTo(0, 1.5);
shieldShape.quadraticCurveTo(1, 1.5, 1, 0.5);
shieldShape.quadraticCurveTo(1, -0.5, 0, -1.5);
shieldShape.quadraticCurveTo(-1, -0.5, -1, 0.5);
shieldShape.quadraticCurveTo(-1, 1.5, 0, 1.5);
const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 };
const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
const shieldMaterial = new THREE.MeshStandardMaterial({ color: 0x4cd137, metalness: 0.5, roughness: 0.3 });
const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
shield.position.set(-3, -2, -3);
scene.add(shield);
objects.push(shield);

// 3. Document/Card (Box) representing forms
const cardGeometry = new THREE.BoxGeometry(1.5, 2, 0.1);
const cardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.8 });
const card = new THREE.Mesh(cardGeometry, cardMaterial);
card.position.set(3, -4, -4);
scene.add(card);
objects.push(card);


// Floating animation
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    
    // Auto rotation
    coin.rotation.z = elapsedTime * 0.5;
    coin.position.y = 1 + Math.sin(elapsedTime) * 0.2;
    
    shield.rotation.y = Math.sin(elapsedTime * 0.5) * 0.3;
    shield.position.y = -2 + Math.cos(elapsedTime * 0.8) * 0.2;
    
    card.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
    card.rotation.y = elapsedTime * 0.2;
    card.position.y = -4 + Math.sin(elapsedTime * 1.2) * 0.3;

    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Parallax Camera based on scroll
let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    
    // Move camera down as we scroll down
    const newY = -(scrollY / window.innerHeight) * 3;
    gsap.to(camera.position, {
        y: newY,
        duration: 0.5,
        ease: "power2.out"
    });
    
    // Rotate objects slightly on scroll
    gsap.to(coin.rotation, {
        x: Math.PI/2 + scrollY * 0.002,
        duration: 0.5
    });
});

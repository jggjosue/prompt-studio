// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Three.js Setup
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x080D19, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x0EA5E9, 2, 50);
blueLight.position.set(5, 5, 5);
scene.add(blueLight);

const cyanLight = new THREE.PointLight(0x38BDF8, 2, 50);
cyanLight.position.set(-5, -5, 5);
scene.add(cyanLight);

const orangeLight = new THREE.PointLight(0xF97316, 1, 50);
orangeLight.position.set(0, 5, -20);
scene.add(orangeLight);

// Elements Arrays to animate
const cards = [];
const nodes = [];
const connections = [];

// Helper to create glowing material
function createGlowMaterial(color) {
    return new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8,
        roughness: 0.2,
        metalness: 0.8,
        clearcoat: 1.0,
    });
}

// 1. Create Floating Cards (Prompts) for Editor Section
const cardGeometry = new THREE.BoxGeometry(2, 3, 0.1);
const cardMaterial = createGlowMaterial(0x0EA5E9);

for(let i = 0; i < 15; i++) {
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    
    // Position them around the "Editor" area (Z between -10 and -30)
    card.position.x = (Math.random() - 0.5) * 20;
    card.position.y = (Math.random() - 0.5) * 20;
    card.position.z = -10 - (Math.random() * 20);
    
    card.rotation.x = Math.random() * Math.PI;
    card.rotation.y = Math.random() * Math.PI;
    
    scene.add(card);
    cards.push({
        mesh: card,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        floatSpeed: (Math.random() - 0.5) * 0.02,
        initialY: card.position.y
    });
}

// 2. Create Workflow Nodes for Workflows Section
const nodeGeometry = new THREE.IcosahedronGeometry(0.5, 1);
const nodeMaterial = createGlowMaterial(0x38BDF8);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.3 });

const numNodes = 20;
const nodeMeshes = [];

for(let i = 0; i < numNodes; i++) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    // Position them around the "Workflows" area (Z between -35 and -55)
    node.position.x = (Math.random() - 0.5) * 30;
    node.position.y = (Math.random() - 0.5) * 20;
    node.position.z = -35 - (Math.random() * 20);
    
    scene.add(node);
    nodes.push({
        mesh: node,
        pulseSpeed: 0.02 + Math.random() * 0.05,
        initialScale: Math.random() * 0.5 + 0.5
    });
    nodeMeshes.push(node);
}

// Connect nodes with lines
for(let i = 0; i < numNodes; i++) {
    for(let j = i + 1; j < numNodes; j++) {
        if(Math.random() > 0.85) { // 15% chance to connect
            const points = [];
            points.push(nodeMeshes[i].position);
            points.push(nodeMeshes[j].position);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            scene.add(line);
            connections.push(line);
        }
    }
}

// 3. Create Particles (Global)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i+=3) {
    // Spread particles across the whole Z journey (0 to -100)
    posArray[i] = (Math.random() - 0.5) * 50;
    posArray[i+1] = (Math.random() - 0.5) * 50;
    posArray[i+2] = Math.random() * -100;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x0EA5E9,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Set initial Camera Position
camera.position.z = 5;

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
    const elapsedTime = clock.getElapsedTime();

    // Parallax effect on camera
    targetX = mouseX * 2;
    targetY = mouseY * 2;
    
    // Smooth camera movement (mouse parallax)
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;

    // Animate Cards
    cards.forEach((c) => {
        c.mesh.rotation.x += c.rotSpeed;
        c.mesh.rotation.y += c.rotSpeed;
        c.mesh.position.y = c.initialY + Math.sin(elapsedTime * 2 + c.mesh.position.x) * 0.5;
    });

    // Animate Nodes
    nodes.forEach((n) => {
        const scale = n.initialScale + Math.sin(elapsedTime * 5 * n.pulseSpeed) * 0.2;
        n.mesh.scale.set(scale, scale, scale);
    });

    // Rotate particle system slowly
    particlesMesh.rotation.y = elapsedTime * 0.02;

    renderer.render(scene, camera);
}

animate();

// GSAP Scroll Animations
// Move camera through the scene based on scroll
const totalScrollHeight = document.body.scrollHeight - window.innerHeight;

// Create a timeline linked to scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // smooth scrubbing
    }
});

// Camera travels deep into the Z-axis
tl.to(camera.position, {
    z: -80,
    ease: "none"
}, 0);

// Rotate lights for dramatic effect during scroll
tl.to(blueLight.position, {
    x: -10,
    y: -10,
    z: -50,
    ease: "none"
}, 0);

tl.to(orangeLight.position, {
    x: 10,
    y: 10,
    z: -80,
    ease: "none"
}, 0);

// UI HTML Animations - Parallax for text elements
gsap.utils.toArray('.chapter').forEach(chapter => {
    const content = chapter.querySelector('.content-block');
    if (content) {
        const speed = content.getAttribute('data-speed') || 1;
        
        // Fade in and move up
        gsap.fromTo(content, 
            {
                y: 100 * speed,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: chapter,
                    start: "top 80%",
                    end: "center center",
                    scrub: 1
                }
            }
        );

        // Fade out when scrolling past
        gsap.to(content, {
            y: -100 * speed,
            opacity: 0,
            scrollTrigger: {
                trigger: chapter,
                start: "center center",
                end: "bottom 20%",
                scrub: 1
            }
        });
    }
});

// Hide scroll indicator on scroll
gsap.to('.scroll-indicator', {
    opacity: 0,
    scrollTrigger: {
        trigger: "body",
        start: "5% top",
        end: "15% top",
        scrub: true
    }
});

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

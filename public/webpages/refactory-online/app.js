// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. Three.js Setup & Scene Creation
// ==========================================
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
camera.position.y = 0;
camera.position.x = 0;

// Renderer setup
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x05050A, 1);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0x6366F1, 2, 50);
pointLight1.position.set(-5, 0, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x06B6D4, 2, 50);
pointLight2.position.set(5, 5, -5);
scene.add(pointLight2);

// ==========================================
// 2. 3D Objects & Data Visualization Elements
// ==========================================

// Group to hold all scrollable elements
const mainGroup = new THREE.Group();
scene.add(mainGroup);

// --- Particles (Background Nodes) ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles over a large z-depth
    if (i % 3 === 2) {
        posArray[i] = (Math.random() - 0.5) * 80; // z
    } else {
        posArray[i] = (Math.random() - 0.5) * 40; // x, y
    }
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x6366F1,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
mainGroup.add(particlesMesh);

// --- Architecture Nodes (Connected Lines) ---
const nodesGroup = new THREE.Group();
nodesGroup.position.z = -10; // Placed at Stage 1
mainGroup.add(nodesGroup);

const nodeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const nodeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x06B6D4, 
    emissive: 0x06B6D4, 
    emissiveIntensity: 0.5 
});

const nodePositions = [];
for (let i = 0; i < 20; i++) {
    const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
    mesh.position.x = (Math.random() - 0.5) * 15;
    mesh.position.y = (Math.random() - 0.5) * 10;
    mesh.position.z = (Math.random() - 0.5) * 5;
    nodesGroup.add(mesh);
    nodePositions.push(mesh.position);
}

// Connect nodes with lines
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x06B6D4, transparent: true, opacity: 0.2 });
for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 5) {
            const points = [nodePositions[i], nodePositions[j]];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            nodesGroup.add(line);
        }
    }
}

// --- Tech Debt Cubes (Abstract Bugs) ---
const cubesGroup = new THREE.Group();
cubesGroup.position.z = -25; // Placed at Stage 2
mainGroup.add(cubesGroup);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xEF4444, 
    wireframe: true,
    transparent: true,
    opacity: 0.7
});

for (let i = 0; i < 15; i++) {
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = (Math.random() - 0.5) * 20;
    cube.position.y = (Math.random() - 0.5) * 15;
    cube.position.z = (Math.random() - 0.5) * 10;
    cube.rotation.x = Math.random() * Math.PI;
    cube.rotation.y = Math.random() * Math.PI;
    cubesGroup.add(cube);
}

// --- Pipeline Rings (CI/CD) ---
const pipelineGroup = new THREE.Group();
pipelineGroup.position.z = -40; // Placed at Stage 4
mainGroup.add(pipelineGroup);

const ringGeometry = new THREE.TorusGeometry(3, 0.1, 16, 100);
const colors = [0x10B981, 0xF59E0B, 0x6366F1];

for (let i = 0; i < 3; i++) {
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = i * -2;
    pipelineGroup.add(ring);
}


// ==========================================
// 3. Animation Loop
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Subtle idle animations
    particlesMesh.rotation.y = elapsedTime * 0.02;
    nodesGroup.rotation.y = Math.sin(elapsedTime * 0.1) * 0.2;
    nodesGroup.rotation.x = Math.cos(elapsedTime * 0.1) * 0.1;
    
    cubesGroup.children.forEach((cube, index) => {
        cube.rotation.x += 0.01 * (index % 2 === 0 ? 1 : -1);
        cube.rotation.y += 0.015;
    });

    pipelineGroup.children.forEach((ring, index) => {
        ring.rotation.z = elapsedTime * (0.5 + index * 0.1);
        ring.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;
    });

    renderer.render(scene, camera);
}

animate();


// ==========================================
// 4. GSAP ScrollTrigger Integrations
// ==========================================

// Animate Camera Z position based on scroll (fly through the scene)
gsap.to(camera.position, {
    z: -45, // Move camera deep into the scene
    ease: "none",
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // Smooth scrubbing
    }
});

// HTML Parallax & Fade Effects
const panels = document.querySelectorAll('.panel');

panels.forEach((panel) => {
    const content = panel.querySelector('.content-block');
    const floating = panel.querySelector('.floating-ui');

    if (content) {
        // Fade and slide in content blocks
        gsap.fromTo(content, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: panel,
                    start: "top 75%", // Trigger when panel is 75% down viewport
                    end: "top 25%",
                    toggleActions: "play none none reverse"
                }
            }
        );
        
        // Parallax effect on scroll
        gsap.to(content, {
            y: -100,
            ease: "none",
            scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    if (floating) {
        // Different parallax speed for floating UI elements
        const speed = parseFloat(floating.getAttribute('data-speed')) || 1.5;
        
        gsap.fromTo(floating,
            { y: 100, opacity: 0 },
            {
                y: -150 * speed,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: panel,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            }
        );
    }
});

// Specific animation for Diff Viewer
const diffViewer = document.querySelector('.diff-viewer');
if (diffViewer) {
    gsap.fromTo(diffViewer,
        { scale: 0.9, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
                trigger: "#compare",
                start: "top 60%",
                toggleActions: "play none none reverse"
            }
        }
    );
}

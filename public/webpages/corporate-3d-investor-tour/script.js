// Initialize Three.js Scene
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0C0A09, 0.05);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

// Create Corporate Abstract Elements (Nodes and Connections)
const nodes = new THREE.Group();
scene.add(nodes);

const geometry = new THREE.IcosahedronGeometry(0.5, 0);
const material = new THREE.MeshStandardMaterial({
    color: 0xCA8A04, // Gold
    wireframe: true,
    transparent: true,
    opacity: 0.6
});

// Create random nodes
const nodeCount = 50;
const nodePositions = [];
for (let i = 0; i < nodeCount; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    
    // Distribute them along a path (z-axis)
    mesh.position.x = (Math.random() - 0.5) * 20;
    mesh.position.y = (Math.random() - 0.5) * 20;
    mesh.position.z = - (Math.random() * 50);
    
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    // Add random scale
    const scale = Math.random() * 1.5 + 0.5;
    mesh.scale.set(scale, scale, scale);

    nodes.add(mesh);
    nodePositions.push(mesh.position);
}

// Add particles for "data streams"
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 1000;
const posArray = new Float32Array(particleCount * 3);

for(let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 40;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xFAFAF9,
    transparent: true,
    opacity: 0.4
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Add spaceships and comets
const spaceObjects = new THREE.Group();
scene.add(spaceObjects);

// Spaceships
const shipMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });
for (let i = 0; i < 10; i++) {
    const ship = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1, 8), shipMaterial);
    body.rotation.x = Math.PI / 2;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.4), shipMaterial);
    ship.add(body);
    ship.add(wing);
    
    ship.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, -5 - (Math.random() * 40));
    ship.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    
    // Custom data for animation
    ship.userData = {
        speed: Math.random() * 0.05 + 0.02,
        rotSpeed: (Math.random() - 0.5) * 0.02
    };
    spaceObjects.add(ship);
}

// Comets
const cometMaterial = new THREE.MeshBasicMaterial({ color: 0x4f9cf9 });
for (let i = 0; i < 15; i++) {
    const comet = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), cometMaterial);
    const tailMaterial = new THREE.MeshBasicMaterial({ color: 0x4f9cf9, transparent: true, opacity: 0.4 });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 1.5, 8), tailMaterial);
    tail.position.y = -0.75;
    comet.add(head);
    comet.add(tail);

    comet.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, - (Math.random() * 40));
    comet.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    
    // Custom data for animation
    comet.userData = {
        speed: Math.random() * 0.1 + 0.05
    };
    spaceObjects.add(comet);
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xCA8A04, 2, 50);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

camera.position.z = 5;

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Subtle rotation of nodes
    nodes.rotation.y = elapsedTime * 0.05;
    nodes.rotation.x = elapsedTime * 0.02;

    // Subtle particle movement
    particles.rotation.y = -elapsedTime * 0.03;

    // Animate spaceships and comets
    spaceObjects.children.forEach(obj => {
        if (obj.userData.rotSpeed !== undefined) {
            // It's a spaceship
            obj.translateY(obj.userData.speed);
            obj.rotation.z += obj.userData.rotSpeed;
        } else if (obj.userData.speed !== undefined) {
            // It's a comet
            obj.translateY(obj.userData.speed);
        }
        
        // Loop back if they go too far
        if (obj.position.length() > 60) {
            obj.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, -5 - (Math.random() * 40));
        }
    });

    renderer.render(scene, camera);
}
animate();

// --- GSAP ScrollTrigger ---
gsap.registerPlugin(ScrollTrigger);

// 1. HTML Panels Animation
const panels = gsap.utils.toArray('.panel');

panels.forEach((panel, i) => {
    gsap.to(panel, {
        scrollTrigger: {
            trigger: panel,
            start: "top 75%",
            end: "top 25%",
            scrub: 1,
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 1
    });
});

// 2. HTML Parallax Elements
const parallaxElements = gsap.utils.toArray('.parallax-element');
parallaxElements.forEach((el) => {
    const speed = el.getAttribute('data-speed') || 1;
    gsap.to(el, {
        scrollTrigger: {
            trigger: el.closest('.panel'),
            start: "top bottom",
            end: "bottom top",
            scrub: true
        },
        y: (i, target) => - (100 * speed),
        ease: "none"
    });
});

// 3. 3D Camera Scroll Animation
const scrollContainer = document.getElementById('scroll-container');

gsap.to(camera.position, {
    scrollTrigger: {
        trigger: scrollContainer,
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    },
    z: -45, // Move camera deep into the nodes
    ease: "none"
});

gsap.to(camera.rotation, {
    scrollTrigger: {
        trigger: scrollContainer,
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    },
    z: Math.PI / 4, // Add slight roll
    ease: "none"
});

// 4. Specific Chart Bar Growth Animation (Financial Dashboard)
const chartBars = gsap.utils.toArray('.bar');
gsap.from(chartBars, {
    scrollTrigger: {
        trigger: "#financial",
        start: "top 60%",
    },
    height: "0%",
    stagger: 0.2,
    duration: 1.5,
    ease: "power3.out"
});

// Interactivity Buttons
document.querySelector('.meeting-btn').addEventListener('click', () => {
    alert("Scheduling system initialized. (Simulated functionality for prototype)");
});

document.querySelectorAll('.doc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        alert("Downloading document: " + e.target.innerText + " (Simulated)");
    });
});

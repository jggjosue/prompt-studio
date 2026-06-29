// Scene Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050a15, 0.002);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00e5ff, 2, 100);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const blueLight = new THREE.DirectionalLight(0x0088cc, 1);
blueLight.position.set(10, 20, 10);
scene.add(blueLight);

// --- 3D Objects ---

// 1. Background Particles (The Cloud)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles over a large area
    posArray[i] = (Math.random() - 0.5) * 200;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// 2. Central Data Core
const coreGeometry = new THREE.IcosahedronGeometry(4, 1);
const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.8,
    emissive: 0x0088cc,
    emissiveIntensity: 0.5
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
core.position.set(0, 0, -20);
scene.add(core);

// Inner solid core
const innerCoreGeo = new THREE.IcosahedronGeometry(2, 0);
const innerCoreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x00e5ff,
    emissiveIntensity: 1,
    flatShading: true
});
const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
core.add(innerCore);

// 3. Data Nodes & Pipelines (Lines connecting to core)
const nodesGroup = new THREE.Group();
const linesGroup = new THREE.Group();
scene.add(nodesGroup);
scene.add(linesGroup);

const nodeGeo = new THREE.OctahedronGeometry(0.5);
const nodeMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x0088cc });
const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.3 });

for(let i = 0; i < 20; i++) {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    
    // Position nodes randomly around the core
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const radius = 15 + Math.random() * 10;
    
    node.position.x = radius * Math.sin(phi) * Math.cos(theta);
    node.position.y = radius * Math.sin(phi) * Math.sin(theta);
    node.position.z = core.position.z + radius * Math.cos(phi);
    
    nodesGroup.add(node);

    // Draw line from node to core
    const points = [];
    points.push(node.position);
    points.push(core.position);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, lineMat);
    linesGroup.add(line);
}

// 4. Floating Data Tables (Cubes/Planes representing structure)
const tablesGroup = new THREE.Group();
tablesGroup.position.set(0, 0, -60);
scene.add(tablesGroup);

const tableGeo = new THREE.BoxGeometry(4, 0.2, 3);
const tableMat = new THREE.MeshPhysicalMaterial({
    color: 0x112244,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.8
});

for(let i=0; i<15; i++) {
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.x = (Math.random() - 0.5) * 40;
    table.position.y = (Math.random() - 0.5) * 40;
    table.position.z = (Math.random() - 0.5) * 40;
    
    table.rotation.x = Math.random() * Math.PI;
    table.rotation.y = Math.random() * Math.PI;
    tablesGroup.add(table);
}


// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Subtle ambient rotations
    particlesMesh.rotation.y = elapsedTime * 0.05;
    core.rotation.x = elapsedTime * 0.2;
    core.rotation.y = elapsedTime * 0.3;
    
    nodesGroup.rotation.y = elapsedTime * 0.1;
    nodesGroup.rotation.z = elapsedTime * 0.05;
    
    linesGroup.rotation.y = elapsedTime * 0.1;
    linesGroup.rotation.z = elapsedTime * 0.05;

    tablesGroup.children.forEach((table, index) => {
        table.rotation.y += 0.005;
        table.position.y += Math.sin(elapsedTime + index) * 0.01;
    });

    renderer.render(scene, camera);
}
animate();


// --- GSAP Scroll Animations ---

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Timeline for Camera movement
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // smooth scrubbing
    }
});

// Camera Path
// 1. Move towards the core (Pipelines section)
tl.to(camera.position, {
    z: 10,
    ease: "power1.inOut"
}, 0)
.to(camera.rotation, {
    z: 0.2,
    ease: "power1.inOut"
}, 0);

// 2. Fly past the core into the tables/warehouse
tl.to(camera.position, {
    z: -40,
    ease: "power1.inOut"
}, "+=0.1")
.to(camera.rotation, {
    y: Math.PI / 4,
    z: 0,
    ease: "power1.inOut"
}, "<");

// 3. Move further down to Analytics/Governance
tl.to(camera.position, {
    z: -80,
    x: 10,
    ease: "power1.inOut"
}, "+=0.1")
.to(camera.rotation, {
    y: 0,
    x: 0.1,
    ease: "power1.inOut"
}, "<");

// 4. Final stop (Conversion)
tl.to(camera.position, {
    z: -100,
    x: 0,
    y: -5,
    ease: "power1.inOut"
}, "+=0.1")
.to(camera.rotation, {
    x: 0.2,
    ease: "power1.inOut"
}, "<");


// --- HTML Parallax Effects ---
// Fade in elements based on scroll
const panels = gsap.utils.toArray('.panel');
panels.forEach((panel, i) => {
    // Parallax on text blocks
    const content = panel.querySelector('.content-block');
    if(content) {
        gsap.fromTo(content, 
            { y: 100, opacity: 0 },
            { 
                y: 0, 
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: panel,
                    start: "top 70%", // trigger when panel is 70% from top of viewport
                    end: "top 30%",
                    scrub: 1
                }
            }
        );
    }
});

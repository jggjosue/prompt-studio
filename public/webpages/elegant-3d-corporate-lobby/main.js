// ==========================================
// 1. Three.js Scene Setup
// ==========================================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Add some fog for depth
scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 0); // Start at human height

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ==========================================
// 2. Build 3D Lobby Environment
// ==========================================
// Materials
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a202c,
    roughness: 0.1,
    metalness: 0.8, // Reflective like polished marble/tile
});

const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    roughness: 0.7,
    metalness: 0.2,
});

const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Gold accent
    roughness: 0.2,
    metalness: 1.0,
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9, // glass effect
    transparent: true,
});

// Corridor dimensions
const corridorLength = 100;
const corridorWidth = 12;
const corridorHeight = 6;

// Floor
const floorGeometry = new THREE.PlaneGeometry(corridorWidth, corridorLength);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -corridorLength / 2;
floor.receiveShadow = true;
scene.add(floor);

// Ceiling
const ceilingGeometry = new THREE.PlaneGeometry(corridorWidth, corridorLength);
const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = corridorHeight;
ceiling.position.z = -corridorLength / 2;
scene.add(ceiling);

// Walls & Columns
const wallGeometry = new THREE.PlaneGeometry(corridorLength, corridorHeight);
const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -corridorWidth / 2;
leftWall.position.y = corridorHeight / 2;
leftWall.position.z = -corridorLength / 2;
scene.add(leftWall);

const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.x = corridorWidth / 2;
rightWall.position.y = corridorHeight / 2;
rightWall.position.z = -corridorLength / 2;
scene.add(rightWall);

// Add architectural columns and accents along the corridor
for (let i = 0; i < corridorLength; i += 10) {
    // Left column
    const colGeo = new THREE.BoxGeometry(1, corridorHeight, 1);
    const leftCol = new THREE.Mesh(colGeo, accentMaterial);
    leftCol.position.set(-corridorWidth / 2 + 0.5, corridorHeight / 2, -i);
    leftCol.castShadow = true;
    leftCol.receiveShadow = true;
    scene.add(leftCol);

    // Right column
    const rightCol = new THREE.Mesh(colGeo, accentMaterial);
    rightCol.position.set(corridorWidth / 2 - 0.5, corridorHeight / 2, -i);
    rightCol.castShadow = true;
    rightCol.receiveShadow = true;
    scene.add(rightCol);
    
    // Add glowing panels between columns
    if (i % 20 === 0 && i > 0) {
        const panelGeo = new THREE.PlaneGeometry(4, 3);
        const leftPanel = new THREE.Mesh(panelGeo, glassMaterial);
        leftPanel.position.set(-corridorWidth / 2 + 0.1, corridorHeight / 2, -i + 5);
        leftPanel.rotation.y = Math.PI / 2;
        scene.add(leftPanel);
        
        const rightPanel = new THREE.Mesh(panelGeo, glassMaterial);
        rightPanel.position.set(corridorWidth / 2 - 0.1, corridorHeight / 2, -i + 5);
        rightPanel.rotation.y = -Math.PI / 2;
        scene.add(rightPanel);
    }
}

// End Wall (Reception Desk Area)
const endWallGeo = new THREE.PlaneGeometry(corridorWidth, corridorHeight);
const endWall = new THREE.Mesh(endWallGeo, wallMaterial);
endWall.position.set(0, corridorHeight / 2, -corridorLength);
scene.add(endWall);

// Reception Desk
const deskGeo = new THREE.BoxGeometry(6, 1.2, 2);
const desk = new THREE.Mesh(deskGeo, accentMaterial);
desk.position.set(0, 0.6, -corridorLength + 4);
desk.castShadow = true;
desk.receiveShadow = true;
scene.add(desk);

// Logo behind desk
const logoGeo = new THREE.BoxGeometry(3, 1, 0.2);
const logoMesh = new THREE.Mesh(logoGeo, new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5}));
logoMesh.position.set(0, 3, -corridorLength + 0.1);
scene.add(logoMesh);

// ==========================================
// 3. Lighting
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Add architectural lights along the corridor
for (let i = 0; i <= corridorLength; i += 20) {
    const pointLight = new THREE.PointLight(0xfff0dd, 0.8, 15);
    pointLight.position.set(0, corridorHeight - 0.5, -i);
    scene.add(pointLight);
    
    // Light fixtures
    const fixtureGeo = new THREE.BoxGeometry(2, 0.1, 2);
    const fixture = new THREE.Mesh(fixtureGeo, new THREE.MeshBasicMaterial({color: 0xffffff}));
    fixture.position.set(0, corridorHeight - 0.05, -i);
    scene.add(fixture);
}

// Spotlight on reception
const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(0, corridorHeight, -corridorLength + 10);
spotLight.target = desk;
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
scene.add(spotLight);


// ==========================================
// 4. GSAP Scroll Animations
// ==========================================
gsap.registerPlugin(ScrollTrigger);

// Animate Camera through the 3D corridor based on scroll
// Total scrollable height maps to the length of the corridor
ScrollTrigger.create({
    trigger: "main",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Smooth scrubbing
    onUpdate: (self) => {
        // self.progress goes from 0 to 1
        const maxZ = -corridorLength + 8; // Don't go through the wall
        camera.position.z = maxZ * self.progress;
        
        // Slight bobbing effect while moving
        camera.position.y = 2 + Math.sin(self.progress * Math.PI * 10) * 0.1;
    }
});

// UI Elements Fade in/out
const panels = document.querySelectorAll('.panel');
panels.forEach((panel, i) => {
    const card = panel.querySelector('.glass-card');
    
    // Create a timeline for each panel
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: panel,
            start: "top 70%",
            end: "bottom 30%",
            toggleActions: "play reverse play reverse",
        }
    });
    
    // Animate the main card
    tl.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
    });
    
    // If there are stagger items inside, animate them sequentially
    const staggerItems = card.querySelectorAll('.stagger-item');
    if (staggerItems.length > 0) {
        tl.to(staggerItems, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.2)"
        }, "-=0.4");
    }
});

// Parallax effect on mouse move (Subtle)
document.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    // Rotate camera slightly based on mouse
    gsap.to(camera.rotation, {
        x: mouseY * 0.05,
        y: -mouseX * 0.05,
        duration: 1,
        ease: "power2.out"
    });
});

// ==========================================
// 5. Render Loop & Resize Handling
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

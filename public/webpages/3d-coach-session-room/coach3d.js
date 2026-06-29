// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 1. Scene Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Warm dark fog for depth
scene.fog = new THREE.FogExp2(0x0a0c10, 0.08);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
// Initial camera position (standing at the entrance)
camera.position.set(0, 1.8, 12); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// 2. Lighting (Warm & Professional)
const ambientLight = new THREE.AmbientLight(0xfff0e6, 0.3); // Warm ambient
scene.add(ambientLight);

// Key light - Warm/Gold
const spotLight = new THREE.SpotLight(0xd4af37, 2.5); 
spotLight.position.set(5, 6, 4);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);

// Fill light - Cool
const fillLight = new THREE.DirectionalLight(0x8899aa, 0.6); 
fillLight.position.set(-5, 4, 2);
scene.add(fillLight);

// 3. Materials
const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x111318, 
    roughness: 0.1,
    metalness: 0.2
});
const woodMat = new THREE.MeshStandardMaterial({ 
    color: 0x221812, 
    roughness: 0.7 
});
const fabricMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2d34, 
    roughness: 0.9 
});
const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 1
});
const accentMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.7,
    roughness: 0.2
});

// 4. Build the "Room"
const roomGroup = new THREE.Group();
scene.add(roomGroup);

// Floor
const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
roomGroup.add(floor);

// Stylized Armchair Function
function createChair(x, z, rotY) {
    const chairGroup = new THREE.Group();
    
    // Base/Legs
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), woodMat);
    base.position.y = 0.1;
    base.castShadow = true;
    chairGroup.add(base);
    
    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), fabricMat);
    seat.position.y = 0.3;
    seat.castShadow = true;
    chairGroup.add(seat);
    
    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.2), fabricMat);
    back.position.set(0, 0.8, -0.35);
    back.castShadow = true;
    chairGroup.add(back);

    // Armrests
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.8), fabricMat);
    armL.position.set(-0.45, 0.7, 0);
    armL.castShadow = true;
    chairGroup.add(armL);
    
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.8), fabricMat);
    armR.position.set(0.45, 0.7, 0);
    armR.castShadow = true;
    chairGroup.add(armR);

    chairGroup.position.set(x, 0, z);
    chairGroup.rotation.y = rotY;
    roomGroup.add(chairGroup);
}

// Stylized Center Table
function createTable(x, z) {
    const tableGroup = new THREE.Group();
    
    // Top
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.05, 32), glassMat);
    top.position.y = 0.6;
    top.castShadow = true;
    tableGroup.add(top);
    
    // Ring accent
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.02, 16, 64), accentMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.6;
    tableGroup.add(ring);

    // Base
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 0.6, 16), woodMat);
    leg.position.y = 0.3;
    leg.castShadow = true;
    tableGroup.add(leg);

    tableGroup.position.set(x, 0, z);
    roomGroup.add(tableGroup);
}

// Stylized Plant
function createPlant(x, z) {
    const plantGroup = new THREE.Group();
    
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.6, 16), woodMat);
    pot.position.y = 0.3;
    pot.castShadow = true;
    plantGroup.add(pot);
    
    const leavesMaterial = new THREE.MeshStandardMaterial({color: 0x1e3a25, roughness: 0.8});
    // Abstract leaves
    for(let i=0; i<3; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), leavesMaterial);
        leaf.position.set(
            (Math.random() - 0.5) * 0.4,
            0.8 + Math.random() * 0.4,
            (Math.random() - 0.5) * 0.4
        );
        leaf.castShadow = true;
        plantGroup.add(leaf);
    }
    
    plantGroup.position.set(x, 0, z);
    roomGroup.add(plantGroup);
}

// Floating Panels
const panels = [];
function createFloatingPanel(x, y, z, rotY, w = 1.5, h = 1) {
    const panelGroup = new THREE.Group();
    
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat);
    panel.castShadow = true;
    panelGroup.add(panel);
    
    // Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.02), accentMat);
    frame.position.z = -0.01;
    panelGroup.add(frame);
    
    panelGroup.position.set(x, y, z);
    panelGroup.rotation.y = rotY;
    
    roomGroup.add(panelGroup);
    panels.push({mesh: panelGroup, originY: y, speed: 0.5 + Math.random()});
}

// Arrange Scene
createChair(-1.8, 0, Math.PI / 4); // Coach chair
createChair(1.8, 1, -Math.PI / 5); // Client chair
createTable(0, 0.5);

createPlant(-3, -1);
createPlant(3, -2);
createPlant(-2, 3); // Plant in foreground

createFloatingPanel(-3.5, 1.8, -2, Math.PI / 6);
createFloatingPanel(3.5, 2.0, -1, -Math.PI / 6);
createFloatingPanel(0, 2.5, -4, 0, 3, 1.5); // Large back screen

// Abstract background pillars to give a sense of architecture
for(let i=0; i<8; i++) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 0.4), woodMat);
    pillar.position.set(
        -8 + Math.random()*16, 
        3, 
        -5 - Math.random()*5
    );
    pillar.castShadow = true;
    roomGroup.add(pillar);
}


// 5. Scroll Animations (Camera Path)

// We map sections to camera positions. 
// The main scrolling creates a timeline.
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5 // Smooth scrubbing
    }
});

// Calculate total scroll depth roughly.
// Section 1 (Home): z: 12 -> 8
// Section 2 (Sessions): z: 8 -> 5, x: 1
// Section 3 (Method): z: 5 -> 3, x: -1
// Section 4 (Benefits): z: 3 -> 1, x: 0
// Section 5 (Testimonials): z: 1 -> -1
// Section 6 (Pricing): z: -1 -> -2
// Section 7 (Booking): z: -2 -> -3

// Camera Path Sequence
tl.to(camera.position, { z: 8, ease: "power1.inOut" }, 0)
  .to(camera.rotation, { y: -0.15, ease: "power1.inOut" }, 0)
  
  .to(camera.position, { x: 1.5, z: 5, ease: "power1.inOut" }, 0.15) // Move towards client chair
  .to(camera.rotation, { y: 0.15, ease: "power1.inOut" }, 0.15)
  
  .to(camera.position, { x: -1.5, z: 3, ease: "power1.inOut" }, 0.3) // Move towards coach chair
  .to(camera.rotation, { y: -0.1, ease: "power1.inOut" }, 0.3)
  
  .to(camera.position, { x: 0, z: 1, ease: "power1.inOut" }, 0.45) // Center over table
  .to(camera.rotation, { x: -0.2, y: 0, ease: "power1.inOut" }, 0.45)
  
  .to(camera.position, { z: -1, y: 1.5, ease: "power1.inOut" }, 0.6) // Move through table
  .to(camera.rotation, { x: 0, ease: "power1.inOut" }, 0.6)
  
  .to(camera.position, { z: -2, ease: "power1.inOut" }, 0.75) // Move to back panel
  .to(camera.position, { z: -3, ease: "power1.inOut" }, 0.9); // Final area


// 6. Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Float panels
    panels.forEach((p) => {
        p.mesh.position.y = p.originY + Math.sin(time * p.speed) * 0.1;
    });
    
    renderer.render(scene, camera);
}
animate();


// 7. HTML Elements Parallax / Fade in
// When a panel comes into view, its text elements animate in.
gsap.utils.toArray('.panel').forEach((panel) => {
    const texts = panel.querySelectorAll('.parallax-text');
    if(texts.length > 0) {
        gsap.to(texts, {
            scrollTrigger: {
                trigger: panel,
                start: "top 75%",
                toggleActions: "play none none reverse"
            },
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out"
        });
    }
});

// 8. UI Interactions
// Mobile menu toggle
const menuBtn = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if(window.innerWidth <= 768) {
            navLinks.classList.remove('active');
        }
    });
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

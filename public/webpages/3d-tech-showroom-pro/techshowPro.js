// Three.js & GSAP Implementation for 3D Tech Showroom Pro

const canvas = document.getElementById('webgl-canvas');
const tooltip = document.getElementById('hotspot-tooltip');
const tooltipTitle = document.getElementById('hs-title');
const tooltipDesc = document.getElementById('hs-desc');

// 1. Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.03); // Match bg color for depth

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x050505, 1);

// 2. Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x00f0ff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x7000ff, 2, 20);
pointLight.position.set(-5, 0, 2);
scene.add(pointLight);

// 3. 3D Objects / Environment
const objectsGroup = new THREE.Group();
scene.add(objectsGroup);

// Particles for background tech vibe
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 30; // Spread across scene
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Central Hologram / Core (Lobby)
const coreGeometry = new THREE.IcosahedronGeometry(1.5, 1);
const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
objectsGroup.add(coreMesh);

// Inner Core
const innerCoreGeo = new THREE.OctahedronGeometry(0.8, 0);
const innerCoreMat = new THREE.MeshStandardMaterial({
    color: 0x7000ff,
    roughness: 0.2,
    metalness: 0.8
});
const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
coreMesh.add(innerCoreMesh);

// Floating Modules (SaaS Section)
const saasGroup = new THREE.Group();
saasGroup.position.set(5, -10, -5); // Position down the scroll
objectsGroup.add(saasGroup);

for(let i = 0; i < 5; i++) {
    const boxGeo = new THREE.BoxGeometry(1, 0.2, 1);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.1 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set((Math.random() - 0.5) * 4, i * 0.8 - 2, (Math.random() - 0.5) * 4);
    
    // Add glowing edges
    const edges = new THREE.EdgesGeometry(boxGeo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0x00f0ff } ) );
    box.add(line);
    
    saasGroup.add(box);
}

// Hardware AI Node (Hardware Section)
const aiGroup = new THREE.Group();
aiGroup.position.set(-6, -20, -2);
objectsGroup.add(aiGroup);

const aiGeo = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const aiMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    metalness: 1, 
    roughness: 0.2,
    emissive: 0x7000ff,
    emissiveIntensity: 0.2
});
const aiMesh = new THREE.Mesh(aiGeo, aiMat);
aiGroup.add(aiMesh);


// 4. Animation Loop
const clock = new THREE.Clock();
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate core
    coreMesh.rotation.y = elapsedTime * 0.2;
    coreMesh.rotation.x = elapsedTime * 0.1;
    innerCoreMesh.rotation.y = -elapsedTime * 0.5;

    // Rotate SaaS modules
    saasGroup.children.forEach((box, i) => {
        box.rotation.y = elapsedTime * (0.1 + i * 0.05);
        box.position.y += Math.sin(elapsedTime * 2 + i) * 0.005; // Floating effect
    });

    // Animate AI Node
    aiMesh.rotation.x = elapsedTime * 0.3;
    aiMesh.rotation.y = elapsedTime * 0.4;

    // Gentle camera sway based on mouse (parallax)
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    // Smooth camera rotation
    camera.rotation.y += 0.05 * (targetX - camera.rotation.y);
    camera.rotation.x += 0.05 * (targetY - camera.rotation.x);

    // Particles slow rotation
    particlesMesh.rotation.y = elapsedTime * 0.02;

    updateHotspots();

    renderer.render(scene, camera);
}
animate();


// 5. GSAP ScrollTrigger Animations
gsap.registerPlugin(ScrollTrigger);

// Camera path animation
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
    }
});

// Lobby -> SaaS
tl.to(camera.position, {
    x: 3,
    y: -10,
    z: 2,
    ease: "power1.inOut"
})
// SaaS -> Hardware
.to(camera.position, {
    x: -3,
    y: -20,
    z: 4,
    ease: "power1.inOut"
})
// Hardware -> Dashboards/Pricing
.to(camera.position, {
    x: 0,
    y: -30,
    z: 8,
    ease: "power1.inOut"
});

// DOM Parallax Effects
gsap.utils.toArray('.parallax-element').forEach(el => {
    const speed = el.dataset.speed || 1;
    gsap.fromTo(el, 
        { y: 50 * speed, opacity: 0 },
        {
            y: -50 * speed,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
            }
        }
    );
});

// Text & Element Entrance Animations
gsap.utils.toArray('.content-box h2, .content-box p').forEach(el => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
    });
});

gsap.utils.toArray('.feature-list li').forEach((el, index) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el.parentElement,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        x: -30,
        opacity: 0,
        duration: 0.6,
        delay: index * 0.15,
        ease: "power2.out"
    });
});

gsap.utils.toArray('.stats-grid .stat').forEach((el, index) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el.parentElement,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        scale: 0.5,
        opacity: 0,
        duration: 0.6,
        delay: index * 0.2,
        ease: "back.out(1.5)"
    });
});

gsap.utils.toArray('.dashboard-mockup .chart-bar').forEach((el, index) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: '.dashboard-mockup',
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        height: "0%",
        opacity: 0,
        duration: 1,
        delay: index * 0.1,
        ease: "power3.out"
    });
});

gsap.utils.toArray('.pricing-card').forEach((el, index) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: '.pricing-grid',
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.2,
        ease: "power3.out"
    });
});

gsap.utils.toArray('.modern-form .input-group, .modern-form button').forEach((el, index) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: '.modern-form',
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        x: 30,
        opacity: 0,
        duration: 0.5,
        delay: index * 0.1,
        ease: "power2.out"
    });
});


// 6. Hotspots Logic
const hotspots = [
    { el: document.getElementById('hs-saas'), pos: saasGroup.position.clone().add(new THREE.Vector3(0,1,0)) },
    { el: document.getElementById('hs-ai'), pos: aiGroup.position.clone().add(new THREE.Vector3(0,0,2)) }
];

function updateHotspots() {
    hotspots.forEach(hs => {
        if(!hs.el) return;

        // Project 3D position to 2D screen
        const vector = hs.pos.clone();
        vector.project(camera);
        
        // Convert to CSS coordinates
        const x = (vector.x * .5 + .5) * window.innerWidth;
        const y = (vector.y * -.5 + .5) * window.innerHeight;
        
        // Hide if behind camera
        if (vector.z > 1) {
            hs.el.style.display = 'none';
        } else {
            hs.el.style.display = 'block';
            hs.el.style.left = `${x}px`;
            hs.el.style.top = `${y}px`;
        }
    });
}

// Hotspot Interactions
document.querySelectorAll('.hotspot').forEach(hs => {
    hs.addEventListener('mouseenter', (e) => {
        tooltipTitle.textContent = hs.dataset.title;
        tooltipDesc.textContent = hs.dataset.desc;
        tooltip.classList.remove('hidden');
    });
    
    hs.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.clientX + 15 + 'px';
        tooltip.style.top = e.clientY + 15 + 'px';
    });

    hs.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
    });
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 3D Classroom Simulations - Three.js & GSAP Implementation

// --- State & Initialization ---
let scene, camera, renderer;
let particles, coreGroup, dnaGroup, mathGroup;

// Define colors matching the CSS theme
const COLORS = {
    bg: 0x050505,
    primary: 0x5e6ad2,
    accent1: 0x00f0ff,
    accent2: 0xbf00ff,
    white: 0xffffff
};

function init3D() {
    // 1. Setup Scene, Camera, Renderer
    const canvas = document.querySelector('#webgl-canvas');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.bg);
    // Add subtle fog for depth
    scene.fog = new THREE.FogExp2(COLORS.bg, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(COLORS.accent1, 1, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(COLORS.accent2, 1, 20);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // 3. Create Objects
    createParticles();
    createCoreConcept();
    createDNAConcept();
    createMathConcept();

    // Hide sections that are not currently in view initially
    dnaGroup.visible = false;
    mathGroup.visible = false;

    // 4. Setup GSAP ScrollTriggers
    setupScrollAnimations();

    // 5. Start Animation Loop
    window.addEventListener('resize', onWindowResize);
    animate();
}

// --- Object Creation ---

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        // Spread particles in a large volume
        posArray[i] = (Math.random() - 0.5) * 40;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create a circular particle texture procedurally or use a simple point material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: COLORS.accent1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

function createCoreConcept() {
    coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Main Icosahedron (Core)
    const geometry = new THREE.IcosahedronGeometry(1.5, 1);
    const material = new THREE.MeshPhysicalMaterial({
        color: COLORS.primary,
        wireframe: true,
        emissive: COLORS.primary,
        emissiveIntensity: 0.2
    });
    const coreMesh = new THREE.Mesh(geometry, material);
    coreGroup.add(coreMesh);

    // Orbiting rings
    const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: COLORS.accent1, side: THREE.DoubleSide });
    
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 2;
    coreGroup.add(ring2);

    coreGroup.position.set(2, 0, 0); // Position to the right initially
}

function createDNAConcept() {
    dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Abstract DNA-like structure
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: COLORS.accent2, 
        roughness: 0.2, 
        metalness: 0.8 
    });
    const mesh = new THREE.Mesh(geometry, material);
    dnaGroup.add(mesh);
    
    dnaGroup.position.set(-3, 0, -2); // Position to the left
}

function createMathConcept() {
    mathGroup = new THREE.Group();
    scene.add(mathGroup);

    // Geometric abstraction (Box with nodes)
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Edges
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: COLORS.white, linewidth: 2 });
    const lines = new THREE.LineSegments(edges, lineMaterial);
    mathGroup.add(lines);

    // Nodes at vertices
    const nodeGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: COLORS.accent1 });
    
    const positions = geometry.attributes.position;
    for(let i=0; i<positions.count; i++) {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(positions.getX(i), positions.getY(i), positions.getZ(i));
        mathGroup.add(node);
    }

    mathGroup.position.set(0, 0, -5); // Centered but further back
}


// --- Scroll Animations with GSAP ---

function setupScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Home -> Simulations (Transition from Core to DNA)
    gsap.to(camera.position, {
        scrollTrigger: {
            trigger: "#simulations",
            start: "top bottom",
            end: "center center",
            scrub: 1,
            onEnter: () => { dnaGroup.visible = true; },
            onLeaveBack: () => { dnaGroup.visible = false; }
        },
        x: -1,
        z: 4
    });

    gsap.to(coreGroup.position, {
        scrollTrigger: {
            trigger: "#simulations",
            start: "top bottom",
            end: "center center",
            scrub: 1
        },
        y: 5, // move up out of view
        x: 5
    });

    // 2. Simulations -> Features (Bring in DNA structure)
    gsap.fromTo(dnaGroup.position, 
        { y: -5 },
        {
            scrollTrigger: {
                trigger: "#features",
                start: "top bottom",
                end: "center center",
                scrub: 1
            },
            y: 0,
            x: 0,
            z: 0
        }
    );

    gsap.to(camera.position, {
        scrollTrigger: {
            trigger: "#features",
            start: "top bottom",
            end: "center center",
            scrub: 1
        },
        x: 0,
        z: 3
    });

    // 3. Features -> Subjects (Math Concept)
    gsap.to(dnaGroup.position, {
        scrollTrigger: {
            trigger: "#subjects",
            start: "top bottom",
            end: "center center",
            scrub: 1
        },
        y: 5,
        x: -5
    });

    gsap.fromTo(mathGroup.position,
        { y: -5, z: -10 },
        {
            scrollTrigger: {
                trigger: "#subjects",
                start: "top bottom",
                end: "center center",
                scrub: 1,
                onEnter: () => { mathGroup.visible = true; },
                onLeaveBack: () => { mathGroup.visible = false; }
            },
            y: 0,
            z: 0
        }
    );

    // 4. Subjects -> Demo (Zoom out / Overview)
    gsap.to(camera.position, {
        scrollTrigger: {
            trigger: "#demo",
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1
        },
        y: 2,
        z: 8
    });

    gsap.to(mathGroup.rotation, {
        scrollTrigger: {
            trigger: "#demo",
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1
        },
        x: Math.PI * 2,
        y: Math.PI
    });


    // --- HTML Parallax Effects ---
    const htmlElements = document.querySelectorAll('[data-parallax="true"]');
    htmlElements.forEach((el) => {
        gsap.fromTo(el, 
            { y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    end: "top 50%",
                    scrub: 1
                },
                y: 0,
                opacity: 1
            }
        );
    });
}

// --- Animation Loop & Resize ---

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Idle animations
    if(particles) {
        particles.rotation.y = elapsedTime * 0.05;
    }

    if(coreGroup) {
        coreGroup.rotation.y = elapsedTime * 0.2;
        coreGroup.rotation.x = elapsedTime * 0.1;
    }

    if(dnaGroup && dnaGroup.visible) {
        dnaGroup.rotation.y = elapsedTime * 0.3;
    }

    if(mathGroup && mathGroup.visible) {
        mathGroup.rotation.x = elapsedTime * 0.15;
        mathGroup.rotation.y = elapsedTime * 0.2;
    }

    // Gentle camera floating
    camera.position.y += Math.sin(elapsedTime) * 0.002;

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init3D);

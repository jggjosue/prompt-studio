// --- THREE.JS SETUP ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0f0c08, 0.03); // Match bg color for cinematic depth

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Starting position

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xd4af37, 2, 50); // Warm gold
pointLight1.position.set(5, 5, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xe8dfd5, 1, 50); // Cool cream
pointLight2.position.set(-5, -5, 0);
scene.add(pointLight2);

// --- 3D OBJECTS (Procedural Library Elements) ---

// 1. Floating Books (Boxes)
const bookGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.15);
const bookMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a2c1f, 
    roughness: 0.8,
    metalness: 0.1
});

const books = [];
for (let i = 0; i < 30; i++) {
    const book = new THREE.Mesh(bookGeometry, bookMaterial);
    
    // Distribute books along the Z axis (depth) to fly through them
    book.position.x = (Math.random() - 0.5) * 20;
    book.position.y = (Math.random() - 0.5) * 10;
    book.position.z = (Math.random() - 0.5) * -40; // Spread out deep into the scene

    // Random rotation
    book.rotation.x = Math.random() * Math.PI;
    book.rotation.y = Math.random() * Math.PI;

    scene.add(book);
    books.push({
        mesh: book,
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
        floatSpeed: (Math.random() - 0.5) * 0.01,
        baseY: book.position.y
    });
}

// 2. Floating Pages (Planes)
const pageGeometry = new THREE.PlaneGeometry(0.6, 0.9);
const pageMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xe8dfd5, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
});

const pages = [];
for (let i = 0; i < 50; i++) {
    const page = new THREE.Mesh(pageGeometry, pageMaterial);
    
    page.position.x = (Math.random() - 0.5) * 15;
    page.position.y = (Math.random() - 0.5) * 15;
    page.position.z = (Math.random() - 0.5) * -50;

    page.rotation.x = Math.random() * Math.PI;
    page.rotation.y = Math.random() * Math.PI;

    scene.add(page);
    pages.push({
        mesh: page,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02
    });
}

// 3. Glowing Dust Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 50;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xd4af37,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Animate Books
    books.forEach(b => {
        b.mesh.rotation.x += b.rotSpeedX;
        b.mesh.rotation.y += b.rotSpeedY;
        b.mesh.position.y = b.baseY + Math.sin(elapsedTime * b.floatSpeed * 100) * 0.5;
    });

    // Animate Pages
    pages.forEach(p => {
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;
    });

    // Animate Particles
    particlesMesh.rotation.y = elapsedTime * 0.02;

    renderer.render(scene, camera);
}
animate();

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP SCROLL ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// 1. Animate Camera through the 3D scene
gsap.to(camera.position, {
    z: -35, // Move deep into the scene
    ease: "none",
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // Smooth scrubbing
    }
});

// Optional camera slight rotation based on scroll for dynamic feel
gsap.to(camera.rotation, {
    y: 0.2,
    ease: "none",
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 2
    }
});


// 2. Animate HTML Content Blocks (Fade in and slide up)
const panels = gsap.utils.toArray('.content-block');
panels.forEach(panel => {
    gsap.to(panel, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: panel,
            start: "top 80%", // Trigger when top of element hits 80% of viewport
            toggleActions: "play none none reverse" // Play on scroll down, reverse on scroll up
        }
    });
});

// 3. Parallax effect for HTML elements (using data-parallax attribute)
document.addEventListener("mousemove", parallax);
function parallax(e) {
    document.querySelectorAll(".content-block").forEach(function(move){
        var moving_value = move.getAttribute("data-parallax");
        var x = (e.clientX * moving_value) / 250;
        var y = (e.clientY * moving_value) / 250;
        
        // We only want slight translation, but keeping the current scroll Y offset is tricky with raw JS mousemove.
        // GSAP handles scroll position, so we apply a subtle transform on top of it using GSAP's quickSetter or just inline.
        // For simplicity here, we'll apply a slight CSS transform to a wrapper or use GSAP.
        gsap.to(move, {
            x: x,
            y: y,
            duration: 0.5,
            ease: "power1.out"
        });
    });
}

// Basic Audio Player Interactivity
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if(this.innerText === '▶') {
            this.innerText = '⏸';
            // Logic to play audio goes here
        } else {
            this.innerText = '▶';
            // Logic to pause audio goes here
        }
    });
});

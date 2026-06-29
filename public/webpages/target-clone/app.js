// BrightCart 3D - Main Application Logic

// ==========================================
// 1. UI & Cart Logic
// ==========================================
const cartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartCountEl = document.querySelector('.cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

let cart = [];

cartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('open'));

addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const product = e.target.dataset.product;
        const price = parseFloat(e.target.dataset.price);
        
        cart.push({ product, price });
        updateCartUI();
        
        // Simple animation feedback
        gsap.fromTo(e.target, 
            { scale: 0.9, backgroundColor: "#fff", color: "#E63946" }, 
            { scale: 1, backgroundColor: "#E63946", color: "#fff", duration: 0.4 }
        );
    });
});

function updateCartUI() {
    cartCountEl.textContent = cart.length;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        cartTotalEl.textContent = '$0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.product}</span>
            <span>$${item.price.toFixed(2)}</span>
        `;
        cartItemsContainer.appendChild(div);
    });
    
    cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

// Checkout Modal
const finalizeBtn = document.getElementById('finalize-checkout');
const modal = document.getElementById('success-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const checkoutBtn = document.querySelector('.checkout-btn');

function showModal() {
    modal.classList.add('visible');
    cartSidebar.classList.remove('open');
    cart = [];
    updateCartUI();
}

finalizeBtn.addEventListener('click', showModal);
checkoutBtn.addEventListener('click', showModal);

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==========================================
// 2. Three.js 3D Scene Setup
// ==========================================
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background
scene.fog = new THREE.Fog(0x000000, 10, 70);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Start camera position
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xE63946, 1, 20); // Brand accent light
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// ==========================================
// Animated Background Particles
// ==========================================
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles around a wide area along the Z-axis
    posArray[i] = (Math.random() - 0.5) * 40; 
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xE63946,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// More Animations: Background Rotating Rings
const rings = [];
const ringMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xE63946, 
    transparent: true, 
    opacity: 0.5, // Increased opacity
    wireframe: true // Keep wireframe but make it brighter
});
for(let i=0; i<8; i++) {
    // Make rings smaller so they fit better in the view
    const ringGeo = new THREE.TorusGeometry(8 + Math.random()*5, 0.05, 8, 50);
    const ring = new THREE.Mesh(ringGeo, ringMaterial);
    ring.position.z = -10 - (i * 8); // Spread them closer
    ring.position.y = 2; // Center them roughly on the products
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    scene.add(ring);
    rings.push({ mesh: ring, speedX: (Math.random() - 0.5) * 0.02, speedY: (Math.random() - 0.5) * 0.02 });
}

// Arrays to hold animated objects
const floatingProducts = [];

// Helper to create a procedural shelf / structural element
function createShelf(zPos, isLeft) {
    const geometry = new THREE.BoxGeometry(4, 0.2, 2);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.2 
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.x = isLeft ? -4 : 4;
    mesh.position.y = 1;
    mesh.position.z = zPos;
    
    scene.add(mesh);
    return mesh;
}

// Helper to create procedural products that look like real retail items
function createProductGroup(type, color) {
    const group = new THREE.Group();
    const material = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.2,
        roughness: 0.6,
        clearcoat: 0.1
    });

    if (type === 'sofa') { // Home
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.8), material);
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 0.2), material);
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.8), material);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.8), material);
        
        back.position.set(0, 0.5, -0.3);
        armL.position.set(-0.7, 0.45, 0);
        armR.position.set(0.7, 0.45, 0);
        
        group.add(base, back, armL, armR);
    } 
    else if (type === 'shirt') { // Fashion
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.2), material);
        const sleeveL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.2), material);
        const sleeveR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.2), material);
        
        sleeveL.position.set(-0.55, 0.4, 0);
        sleeveL.rotation.z = Math.PI / 4;
        
        sleeveR.position.set(0.55, 0.4, 0);
        sleeveR.rotation.z = -Math.PI / 4;
        
        group.add(body, sleeveL, sleeveR);
    }
    else if (type === 'phone') { // Tech
        const phoneMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
        const screenMat = new THREE.MeshBasicMaterial({ color: color });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.1), phoneMat);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.1), screenMat);
        screen.position.set(0, 0, 0.051);
        group.add(body, screen);
    }
    else if (type === 'toy') { // Toys (Rubik's cube style)
        for(let x=-0.3; x<=0.3; x+=0.3) {
            for(let y=-0.3; y<=0.3; y+=0.3) {
                for(let z=-0.3; z<=0.3; z+=0.3) {
                    const block = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), new THREE.MeshPhysicalMaterial({
                        color: [0xE63946, 0x457B9D, 0xF4A261, 0x2A9D8F][Math.floor(Math.random()*4)]
                    }));
                    block.position.set(x, y, z);
                    group.add(block);
                }
            }
        }
    }
    else {
        // fallback
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), material);
        group.add(mesh);
    }
    
    return group;
}

function createProduct(zPos, isLeft, color, type) {
    const group = createProductGroup(type, color);
    
    group.position.x = isLeft ? -3.5 : 3.5;
    group.position.y = 2;
    group.position.z = zPos;
    
    scene.add(group);
    floatingProducts.push({ mesh: group, baseY: 2, speed: Math.random() * 0.02 + 0.01 });
}

// Build the Aisles along the Z-axis (negative Z is forward)
// Hero at Z=0
// Home at Z=-10
// Fashion at Z=-20
// Tech at Z=-30
// Toys at Z=-40
// Checkout at Z=-50

const categories = [
    { z: -10, align: 'left', color: 0xA8DADC, type: 'sofa' },    // Home
    { z: -20, align: 'right', color: 0x457B9D, type: 'shirt' }, // Fashion
    { z: -30, align: 'left', color: 0xA8DADC, type: 'phone' },    // Tech
    { z: -40, align: 'right', color: 0xE63946, type: 'toy' }, // Toys
];

// Generate endless floor
const floorGeo = new THREE.PlaneGeometry(20, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -40;
scene.add(floor);

// Generate Structural Aisles & Products
categories.forEach(cat => {
    const isLeft = cat.align === 'left';
    
    // Add shelf structures
    createShelf(cat.z, isLeft);
    createShelf(cat.z, !isLeft); // Opposite side empty shelf
    
    // Add main product
    createProduct(cat.z, isLeft, cat.color, cat.type);
    
    // Add decorative floating orbs near products
    for(let i = 0; i < 3; i++) {
        const orbGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const orbMat = new THREE.MeshBasicMaterial({ color: 0xE63946 });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.set(
            (isLeft ? -3 : 3) + (Math.random() - 0.5),
            1.5 + Math.random(),
            cat.z + (Math.random() * 2 - 1)
        );
        scene.add(orb);
        floatingProducts.push({ mesh: orb, baseY: orb.position.y, speed: Math.random() * 0.05 });
    }
});

// Checkout zone archway
const archGeo = new THREE.TorusGeometry(5, 0.5, 16, 100, Math.PI);
const archMat = new THREE.MeshStandardMaterial({ color: 0xE63946, emissive: 0x550000 });
const arch = new THREE.Mesh(archGeo, archMat);
arch.position.set(0, 0, -50);
scene.add(arch);


// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();

    // Floating animation
    floatingProducts.forEach(item => {
        item.mesh.rotation.y += item.speed;
        item.mesh.rotation.x += item.speed * 0.5;
        item.mesh.position.y = item.baseY + Math.sin(time * 2 + item.mesh.position.z) * 0.2;
    });

    // Particle Animation
    particlesMesh.rotation.y = time * 0.05;
    particlesMesh.rotation.x = time * 0.02;

    // Rings Animation
    rings.forEach(ring => {
        ring.mesh.rotation.x += ring.speedX;
        ring.mesh.rotation.y += ring.speedY;
    });

    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 3. GSAP ScrollTrigger Camera Animation
// ==========================================
gsap.registerPlugin(ScrollTrigger);

// Map the scroll progress to the camera Z position and rotation
// The journey goes from Z=5 to Z=-52
const cameraTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // Smooth scrubbing
    }
});

// Animate camera Z position through the aisles
cameraTimeline.to(camera.position, {
    z: -52,
    ease: "none"
}, 0);

// Add slight camera rotations to look at products as passing by
cameraTimeline.to(camera.rotation, { y: -0.15, ease: "power1.inOut" }, 0.1); // Look left (Home)
cameraTimeline.to(camera.rotation, { y: 0.15, ease: "power1.inOut" }, 0.3);  // Look right (Fashion)
cameraTimeline.to(camera.rotation, { y: -0.15, ease: "power1.inOut" }, 0.5); // Look left (Tech)
cameraTimeline.to(camera.rotation, { y: 0.15, ease: "power1.inOut" }, 0.7);  // Look right (Toys)
cameraTimeline.to(camera.rotation, { y: 0, ease: "power1.inOut" }, 0.9);     // Straight to Checkout

// Animate HTML UI Elements appearing (Glass Cards)
const sections = gsap.utils.toArray('.category-card');
sections.forEach((card, i) => {
    gsap.to(card, {
        scrollTrigger: {
            trigger: card.parentElement,
            start: "top center",
            end: "center center",
            scrub: true
        },
        opacity: 1,
        y: 0
    });
});

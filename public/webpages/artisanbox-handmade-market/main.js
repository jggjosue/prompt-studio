// --- UI & Cart Logic ---
let cart = [];
const cartCount = document.getElementById('cart-count');
const checkoutItems = document.getElementById('checkout-items');
const cartTotalPrice = document.getElementById('cart-total-price');

function updateCartUI() {
    cartCount.innerText = cart.length;
    
    if (cart.length === 0) {
        checkoutItems.innerHTML = '<p class="empty-msg">Tu carrito está esperando.</p>';
        cartTotalPrice.innerText = '$0.00';
        return;
    }
    
    checkoutItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item) => {
        total += item.price;
        const itemEl = document.createElement('div');
        itemEl.className = 'checkout-item';
        itemEl.innerHTML = `
            <span class="checkout-item-name">${item.name}</span>
            <span class="checkout-item-price">$${item.price.toFixed(2)}</span>
        `;
        checkoutItems.appendChild(itemEl);
    });
    
    cartTotalPrice.innerText = `$${total.toFixed(2)}`;
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const name = e.target.getAttribute('data-name');
        const price = parseFloat(e.target.getAttribute('data-price'));
        cart.push({ name, price });
        updateCartUI();
        
        // Simple animation feedback
        gsap.fromTo(e.target, { scale: 0.95 }, { scale: 1, duration: 0.2 });
        gsap.fromTo(cartCount, { scale: 1.5, backgroundColor: '#5C4033' }, { scale: 1, backgroundColor: '#D48C70', duration: 0.5 });
    });
});

// --- GSAP Parallax & Scroll Animations ---
gsap.registerPlugin(ScrollTrigger);

// Parallax DOM elements
document.querySelectorAll('.parallax-text').forEach(el => {
    const speed = el.getAttribute('data-speed') || 1;
    gsap.to(el, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed * 0.1,
        ease: "none",
        scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

document.querySelectorAll('.card').forEach(card => {
    gsap.from(card, {
        y: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1
        }
    });
});


// --- Three.js 3D Background ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#FAF6F0'); // Warm off-white
scene.fog = new THREE.FogExp2('#FAF6F0', 0.05);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Start camera position
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight('#ffffff', 0.6); // Soft warm light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffecd2', 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight('#D48C70', 0.3); // Warm terracotta fill
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

// Materials
const woodMaterial = new THREE.MeshStandardMaterial({ 
    color: '#8B5A2B', 
    roughness: 0.8,
    metalness: 0.1
});

const kraftMaterial = new THREE.MeshStandardMaterial({
    color: '#D4B895',
    roughness: 0.9,
    metalness: 0.0
});

const ceramicMaterial = new THREE.MeshStandardMaterial({
    color: '#FDFBF7',
    roughness: 0.2,
    metalness: 0.1
});

const terracottaMaterial = new THREE.MeshStandardMaterial({
    color: '#D48C70',
    roughness: 0.7,
    metalness: 0.1
});


// Procedural Objects Generation along Z-axis
const group = new THREE.Group();
scene.add(group);

const objectCount = 30;
for(let i=0; i<objectCount; i++) {
    // Distribute objects along a long path (-z)
    const zPos = -i * 3;
    const xPos = (Math.random() - 0.5) * 15; // Spread on x
    
    // Add tables (boxes)
    if(i % 3 === 0) {
        const tableGeo = new THREE.BoxGeometry(4, 0.5, 2);
        const table = new THREE.Mesh(tableGeo, woodMaterial);
        table.position.set(xPos, 0, zPos);
        table.castShadow = true;
        table.receiveShadow = true;
        group.add(table);
        
        // Add something on the table
        if(Math.random() > 0.5) {
            const boxGeo = new THREE.BoxGeometry(0.8, 0.6, 0.8);
            const box = new THREE.Mesh(boxGeo, kraftMaterial);
            box.position.set(xPos + 1, 0.55, zPos);
            box.rotation.y = Math.random() * Math.PI;
            box.castShadow = true;
            group.add(box);
        } else {
            const vaseGeo = new THREE.CylinderGeometry(0.3, 0.2, 0.8, 16);
            const vase = new THREE.Mesh(vaseGeo, ceramicMaterial);
            vase.position.set(xPos - 0.5, 0.65, zPos);
            vase.castShadow = true;
            group.add(vase);
        }
    } else {
        // Floating decorative elements / abstract pieces
        const size = Math.random() * 0.5 + 0.2;
        const type = Math.random();
        let mesh;
        if(type < 0.3) {
            mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), kraftMaterial);
        } else if(type < 0.6) {
            mesh = new THREE.Mesh(new THREE.SphereGeometry(size/1.5, 16, 16), terracottaMaterial);
        } else {
            mesh = new THREE.Mesh(new THREE.TorusGeometry(size/2, size/4, 16, 32), ceramicMaterial);
        }
        
        mesh.position.set(xPos, Math.random() * 4 + 1, zPos);
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.castShadow = true;
        
        // Store for animation
        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.02,
            floatSpeed: Math.random() * 0.02 + 0.01,
            initY: mesh.position.y
        };
        group.add(mesh);
    }
}

// Ground Plane
const groundGeo = new THREE.PlaneGeometry(100, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: '#E8DFD5', roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
ground.receiveShadow = true;
scene.add(ground);


// --- Camera Scroll Animation with GSAP ---
// We map the total scroll to moving the camera forward on the Z axis
const pathLength = (objectCount - 2) * 3;

ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Smooth scrub
    onUpdate: (self) => {
        // Move camera forward
        camera.position.z = 5 - (self.progress * pathLength);
        // Slight bobbing and panning
        camera.position.y = 2 + Math.sin(self.progress * Math.PI * 4) * 0.5;
        camera.position.x = Math.sin(self.progress * Math.PI * 2) * 2;
        // Look ahead
        camera.lookAt(camera.position.x * 0.5, 1, camera.position.z - 5);
    }
});


// Animation Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    // Animate floating objects
    group.children.forEach(child => {
        if(child.userData && child.userData.floatSpeed) {
            child.rotation.x += child.userData.rotSpeedX;
            child.rotation.y += child.userData.rotSpeedY;
            child.position.y = child.userData.initY + Math.sin(time * 2 + child.position.x) * 0.2;
        }
    });

    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

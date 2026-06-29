// --- UI Logic ---

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Modals
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-actions')) {
        document.getElementById('profileDropdown').classList.remove('active');
    }
});

function openDetails(title, imgUrl, desc) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalImage').style.backgroundImage = `url(${imgUrl})`;
    if (desc) document.getElementById('modalDesc').innerText = desc;
    document.getElementById('detailsModal').classList.add('active');
}

function openPlayer() {
    closeModals();
    document.getElementById('playerModal').classList.add('active');
}

function openRegistration() {
    closeModals();
    document.getElementById('registrationModal').classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

// --- Three.js & GSAP Setup ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.03); // Cinematic dark fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x6c5ce7, 2, 50);
pointLight.position.set(0, 5, -10);
scene.add(pointLight);

const blueLight = new THREE.PointLight(0x00cec9, 1.5, 30);
blueLight.position.set(5, -2, -20);
scene.add(blueLight);

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Helper to create posters (using Unsplash high quality placeholders for the cinematic feel)
const posterImages = [
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505686994434-e3f532729a65?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=600&q=80'
];

const posters = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Create a 3D Tunnel/Lobby of posters
function createCinematicLobby() {
    const geometry = new THREE.PlaneGeometry(3, 4.5);
    
    // Create random posters along the Z axis (tunnel)
    for (let i = 0; i < 20; i++) {
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        // Assign random texture
        const imgUrl = posterImages[Math.floor(Math.random() * posterImages.length)];
        textureLoader.load(imgUrl, (tex) => {
            material.map = tex;
            material.needsUpdate = true;
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Position them along a tunnel
        const z = - (i * 4) - 5;
        const x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 3); // Left or right side
        const y = Math.random() * 4 - 2;
        
        mesh.position.set(x, y, z);
        
        // Point slightly towards center
        mesh.lookAt(0, y, z);
        mesh.userData = { 
            originalPosition: new THREE.Vector3(x, y, z),
            title: `Cinematic Title ${i+1}`,
            imgUrl: imgUrl,
            desc: "Discover the hidden secrets of this deep narrative in StreamVerse 3D. A breathtaking visual journey."
        };

        scene.add(mesh);
        posters.push(mesh);
    }
}

createCinematicLobby();

// Particles for cinematic dust
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 40;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x6c5ce7,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);


// Initial Camera Position
camera.position.z = 2;
camera.position.y = 0;

// GSAP Scroll Animations
gsap.registerPlugin(ScrollTrigger);

// Move camera forward through the tunnel based on scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-content",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // smooth scrubbing
    }
});

tl.to(camera.position, {
    z: -70,
    ease: "none"
}, 0);

tl.to(camera.rotation, {
    z: Math.PI * 0.05,
    y: Math.PI * 0.02,
    ease: "none"
}, 0);

// Rotate lights as we scroll
tl.to(pointLight.position, {
    z: -75,
    ease: "none"
}, 0);

// Interaction Logic (Clicking 3D objects)
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
    // Check if clicking on UI
    if(event.target.closest('.modal') || event.target.closest('nav') || event.target.tagName.toLowerCase() === 'button') {
        return; 
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(posters);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        openDetails(clicked.userData.title, clicked.userData.imgUrl, clicked.userData.desc);
        
        // Small click animation
        gsap.to(clicked.scale, {
            x: 0.9, y: 0.9, z: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
    }
});

// Render Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Subtle floating for posters
    posters.forEach((poster, i) => {
        poster.position.y = poster.userData.originalPosition.y + Math.sin(elapsedTime * 0.5 + i) * 0.2;
    });

    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Hover effect (raycasting every frame)
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(posters);
    
    // Reset scale for all
    posters.forEach(p => {
        if(!p.userData.isHovered) {
             gsap.to(p.scale, { x: 1, y: 1, z: 1, duration: 0.2, overwrite: "auto" });
        }
        p.userData.isHovered = false;
    });

    if (intersects.length > 0) {
        const hovered = intersects[0].object;
        hovered.userData.isHovered = true;
        document.body.style.cursor = 'pointer';
        gsap.to(hovered.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.2, overwrite: "auto" });
        gsap.to(hovered.rotation, { y: hovered.rotation.y + 0.01, duration: 0.1 });
    } else {
        document.body.style.cursor = 'default';
    }

    renderer.render(scene, camera);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

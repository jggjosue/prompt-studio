// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Three.js Setup
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0b, 0.04); // Match dark background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Start camera position
camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xd4af37, 1); // Gold accent light
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(-5, 5, -5);
scene.add(pointLight);

// 3D Objects Group
const objectsGroup = new THREE.Group();
scene.add(objectsGroup);

const floatingObjects = [];

// Create glowing pages
const pageGeometry = new THREE.PlaneGeometry(1, 1.4);
const pageMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1,
    side: THREE.DoubleSide,
    emissive: 0xd4af37,
    emissiveIntensity: 0.1
});

// Create envelopes
const envGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.05);
const envMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.5
});

// Scatter objects along the Z-axis for the camera to fly through
for(let i=0; i<40; i++) {
    const isPage = Math.random() > 0.5;
    const mesh = new THREE.Mesh(
        isPage ? pageGeometry : envGeometry, 
        isPage ? pageMaterial : envMaterial
    );
    
    // Random positions
    mesh.position.x = (Math.random() - 0.5) * 20;
    mesh.position.y = (Math.random() - 0.5) * 15;
    mesh.position.z = (Math.random() - 0.5) * 50 - 10; // Spread from z=-35 to z=15
    
    // Random rotations
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.rotation.z = Math.random() * Math.PI;
    
    objectsGroup.add(mesh);
    floatingObjects.push({
        mesh,
        speed: 0.001 + Math.random() * 0.003,
        floatOffset: Math.random() * Math.PI * 2
    });
}

// Particle System (Dust/Magic motes)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 500;
const posArray = new Float32Array(particlesCount * 3);

for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 60; // x, y, z spread
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xd4af37,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);


// GSAP Scroll Animations
// Timeline for camera movement along Z axis
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".content-overlay",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // smooth scrubbing
    }
});

// Animate camera moving forward through the scene
tl.to(camera.position, {
    z: -30,
    ease: "none"
}, 0);

// Slightly rotate camera for a dynamic feel
tl.to(camera.rotation, {
    z: 0.2,
    y: 0.1,
    ease: "power1.inOut"
}, 0);

// Parallax/Rotation on the objects group
tl.to(objectsGroup.rotation, {
    y: Math.PI / 4,
    x: 0.2,
    ease: "none"
}, 0);


// Animation Loop (Continuous floating)
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Gently float objects
    floatingObjects.forEach((obj) => {
        obj.mesh.rotation.x += obj.speed;
        obj.mesh.rotation.y += obj.speed;
        obj.mesh.position.y += Math.sin(elapsedTime * 2 + obj.floatOffset) * 0.002;
    });

    // Render
    renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

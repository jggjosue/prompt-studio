// main.js

gsap.registerPlugin(ScrollTrigger);

// 1. Three.js Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.05);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 2. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffeedd, 1);
directionalLight.position.set(5, 5, 2);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xd4af37, 2, 10); // Premium Gold light
pointLight.position.set(-2, 2, 2);
scene.add(pointLight);

// 3. 3D Objects (Magazines/Pages)
const objects = [];
const group = new THREE.Group();
scene.add(group);

// Materials for the "editorial" 3D objects
const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 0.9,
    side: THREE.DoubleSide
});

const paperMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
});

const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.3,
    metalness: 0.8,
    side: THREE.DoubleSide
});

// Create abstract magazine pages and floating elements
for (let i = 0; i < 25; i++) {
    let geometry;
    let material;
    let scale = 1;

    const rand = Math.random();
    if (rand < 0.6) {
        // Pages
        geometry = new THREE.PlaneGeometry(1.5, 2);
        material = paperMaterial;
    } else if (rand < 0.9) {
        // Dark covers
        geometry = new THREE.PlaneGeometry(1.55, 2.05);
        material = darkMaterial;
    } else {
        // Gold accents
        geometry = new THREE.PlaneGeometry(0.5, 3);
        material = goldMaterial;
        scale = 0.5;
    }

    const mesh = new THREE.Mesh(material, geometry);
    mesh.scale.set(scale, scale, scale);
    
    // Spread objects across the scrollable area
    // X: spread out horizontally
    mesh.position.x = (Math.random() - 0.5) * 12;
    // Y: spread out downwards so we scroll past them
    mesh.position.y = (Math.random() - 0.5) * 25 - 5; 
    // Z: depth variations
    mesh.position.z = (Math.random() - 0.5) * 8 - 3;
    
    // Random rotation
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.rotation.z = (Math.random() - 0.5) * 0.5;
    
    group.add(mesh);
    objects.push({
        mesh: mesh,
        originalPos: mesh.position.clone(),
        originalRot: mesh.rotation.clone()
    });
}

// 4. Animation Loop
const clock = new THREE.Clock();
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Mouse parallax effect for the whole group
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    group.position.x += (targetX - group.position.x) * 0.05;
    group.position.y += (-targetY - group.position.y) * 0.05;

    // Subtle floating animation for all objects
    objects.forEach((obj, i) => {
        obj.mesh.position.y = obj.originalPos.y + Math.sin(elapsedTime * 0.5 + i) * 0.2;
        obj.mesh.rotation.x = obj.originalRot.x + Math.sin(elapsedTime * 0.2 + i) * 0.05;
        obj.mesh.rotation.y = obj.originalRot.y + Math.cos(elapsedTime * 0.1 + i) * 0.05;
    });

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();

// 5. ScrollTrigger Animations
// Animate HTML Parallax Elements
gsap.utils.toArray('.parallax-el').forEach(el => {
    const speed = parseFloat(el.dataset.speed) || 1;
    // Calculate movement based on speed factor
    const yMove = (1 - speed) * 100;
    
    gsap.fromTo(el, {
        y: yMove
    }, {
        y: -yMove,
        ease: "none",
        scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// Animate 3D Camera & Group based on scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5 // Smooth scrubbing
    }
});

tl.to(camera.position, {
    y: -15, // Move camera down through the scene
    z: 2,
    ease: "power1.inOut"
}, 0);

tl.to(group.rotation, {
    y: Math.PI * 0.5, // Rotate the whole scene 90 degrees as we scroll
    x: 0.1,
    ease: "power1.inOut"
}, 0);

// Specific section animations (e.g., reveal cards)
gsap.utils.toArray('.editorial-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: "power2.out"
    });
});

// Resize handler
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

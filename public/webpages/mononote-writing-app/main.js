// --- Lenis Smooth Scrolling ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// --- Three.js Setup ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xf5f5f5, 0.05);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.rotation.x = -0.2;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// --- 3D Objects ---
const objects = [];

// Material for minimal look
const pageMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.2, 
    metalness: 0.1,
    side: THREE.DoubleSide
});

const darkMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.4, 
    metalness: 0.1,
});

// Central Editor Plane
const editorGeometry = new THREE.PlaneGeometry(8, 11);
const editor = new THREE.Mesh(editorGeometry, pageMaterial);
editor.position.set(0, 0, 0);
editor.rotation.x = -Math.PI / 2;
scene.add(editor);
objects.push(editor);

// Floating Pages/Notes
for(let i = 0; i < 20; i++) {
    const isSmall = Math.random() > 0.5;
    const geometry = new THREE.PlaneGeometry(isSmall ? 2 : 4, isSmall ? 3 : 5.5);
    const mesh = new THREE.Mesh(geometry, pageMaterial);
    
    mesh.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 10,
        (Math.random() - 0.5) * 30 - 5
    );
    
    mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    
    // Custom animation properties
    mesh.userData = {
        speedRotX: (Math.random() - 0.5) * 0.01,
        speedRotY: (Math.random() - 0.5) * 0.01,
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatOffset: Math.random() * Math.PI * 2
    };
    
    scene.add(mesh);
    objects.push(mesh);
}

// Glowing Cursor Element
const cursorGeometry = new THREE.BoxGeometry(0.1, 1, 0.01);
const cursorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const cursor3D = new THREE.Mesh(cursorGeometry, cursorMaterial);
cursor3D.position.set(-2, 0.01, 2);
cursor3D.rotation.x = -Math.PI / 2;
scene.add(cursor3D);

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Floating animation
    objects.forEach((obj, index) => {
        if(index > 0) { // Skip editor plane
            obj.rotation.x += obj.userData.speedRotX;
            obj.rotation.y += obj.userData.speedRotY;
            obj.position.y += Math.sin(elapsedTime * 2 + obj.userData.floatOffset) * obj.userData.floatSpeed;
        }
    });

    // Blink cursor
    cursor3D.material.opacity = Math.sin(elapsedTime * 5) > 0 ? 1 : 0;
    cursor3D.material.transparent = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP ScrollTrigger Integration ---
gsap.registerPlugin(ScrollTrigger);

// 1. Hero to Features: Move camera over the desk
gsap.to(camera.position, {
    x: 3,
    y: 3,
    z: 5,
    scrollTrigger: {
        trigger: "#features",
        start: "top bottom",
        end: "top top",
        scrub: 1
    }
});
gsap.to(camera.rotation, {
    x: -0.5,
    y: 0.2,
    scrollTrigger: {
        trigger: "#features",
        start: "top bottom",
        end: "top top",
        scrub: 1
    }
});

// 2. Features to Focus (Dark Mode Transition)
ScrollTrigger.create({
    trigger: "#focus",
    start: "top center",
    end: "bottom center",
    onEnter: () => {
        document.body.classList.add('dark-mode');
        scene.fog.color.setHex(0x0f0f0f);
        cursor3D.material.color.setHex(0xffffff);
        gsap.to(ambientLight, {intensity: 0.2, duration: 1});
    },
    onLeaveBack: () => {
        document.body.classList.remove('dark-mode');
        scene.fog.color.setHex(0xf5f5f5);
        cursor3D.material.color.setHex(0x000000);
        gsap.to(ambientLight, {intensity: 0.6, duration: 1});
    },
    onLeave: () => {
        document.body.classList.remove('dark-mode');
        scene.fog.color.setHex(0xf5f5f5);
        cursor3D.material.color.setHex(0x000000);
        gsap.to(ambientLight, {intensity: 0.6, duration: 1});
    },
    onEnterBack: () => {
        document.body.classList.add('dark-mode');
        scene.fog.color.setHex(0x0f0f0f);
        cursor3D.material.color.setHex(0xffffff);
        gsap.to(ambientLight, {intensity: 0.2, duration: 1});
    }
});

// Focus Camera Move (Dive into the editor)
gsap.to(camera.position, {
    x: 0,
    y: 1.5,
    z: 2,
    scrollTrigger: {
        trigger: "#focus",
        start: "top bottom",
        end: "center center",
        scrub: 1
    }
});
gsap.to(camera.rotation, {
    x: -Math.PI / 2, // Look straight down at editor
    y: 0,
    z: 0,
    scrollTrigger: {
        trigger: "#focus",
        start: "top bottom",
        end: "center center",
        scrub: 1
    }
});

// 3. Templates & Pricing: Pull back and rotate
gsap.to(camera.position, {
    x: -5,
    y: 8,
    z: 8,
    scrollTrigger: {
        trigger: "#templates",
        start: "top bottom",
        end: "top top",
        scrub: 1
    }
});
gsap.to(camera.rotation, {
    x: -0.8,
    y: -0.4,
    z: 0,
    scrollTrigger: {
        trigger: "#templates",
        start: "top bottom",
        end: "top top",
        scrub: 1
    }
});

// Parallax for floating objects on scroll
objects.forEach((obj, i) => {
    if(i > 0) {
        gsap.to(obj.position, {
            y: "+=3",
            scrollTrigger: {
                trigger: "#app-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });
    }
});

// Parallax for UI elements
gsap.utils.toArray('.content-block').forEach(block => {
    gsap.fromTo(block, 
        { y: 50, opacity: 0 },
        { 
            y: 0, 
            opacity: 1, 
            duration: 1,
            scrollTrigger: {
                trigger: block,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// scene.js - Three.js setup and objects

let scene, camera, renderer;
let venueGroup;

function init3D() {
    // 1. Setup Scene
    scene = new THREE.Scene();
    // Add some fog for depth
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);

    // 2. Setup Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Initial camera position (will be animated by GSAP)
    camera.position.set(0, 5, 20);

    // 3. Setup Renderer
    const canvas = document.querySelector('#webgl-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x6366f1, 1); // Indigo light
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    
    const spotLight = new THREE.SpotLight(0x06b6d4, 2); // Cyan accent
    spotLight.position.set(-5, 5, -5);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // 5. Create Abstract Venue Elements
    venueGroup = new THREE.Group();
    scene.add(venueGroup);

    // Floor (Grid)
    const gridHelper = new THREE.GridHelper(100, 100, 0x06b6d4, 0x222233);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Floating Abstract Screens/Panels
    const screenGeometry = new THREE.PlaneGeometry(8, 4.5);
    const screenMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x111122, 
        emissive: 0x6366f1,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });

    for(let i=0; i<10; i++) {
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        
        // Random positions along a path
        screen.position.x = (Math.random() - 0.5) * 40;
        screen.position.y = (Math.random() - 0.2) * 15;
        screen.position.z = - (Math.random() * 50) - 10; // spread backwards
        
        // Random rotations
        screen.rotation.y = (Math.random() - 0.5) * Math.PI;
        screen.rotation.x = (Math.random() - 0.5) * 0.5;
        
        venueGroup.add(screen);
    }
    
    // Main Stage Element (far back)
    const stageGeo = new THREE.BoxGeometry(20, 1, 10);
    const stageMat = new THREE.MeshStandardMaterial({ color: 0x222233 });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.set(0, -1.5, -40);
    venueGroup.add(stage);

    // Particles (digital audience/dust)
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.8
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // Handle Resize
    window.addEventListener('resize', onWindowResize);

    // Start Animation Loop
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Slight idle animation for the venue group
    if (venueGroup) {
        venueGroup.rotation.y = Math.sin(Date.now() * 0.0001) * 0.05;
    }
    
    // Slowly move particles
    const particles = scene.children.find(child => child.type === 'Points');
    if (particles) {
        particles.rotation.y -= 0.0005;
    }

    renderer.render(scene, camera);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init3D);

// Expose variables for animations.js
window.app3D = {
    get camera() { return camera; },
    get scene() { return scene; },
    get venueGroup() { return venueGroup; }
};

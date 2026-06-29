// Initialize Three.js Scene
const initScene = () => {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff3366, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const blueLight = new THREE.PointLight(0x3366ff, 1);
    blueLight.position.set(-5, -5, -5);
    scene.add(blueLight);

    // Objects (Artworks in Gallery)
    const objects = [];
    const geometry = new THREE.PlaneGeometry(3, 4); // Canvas shape
    
    // Create multiple floating frames
    const numFrames = 20;
    for (let i = 0; i < numFrames; i++) {
        // Material with random colors to simulate artworks
        const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.4,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position them along the Z axis to create a tunnel/gallery depth
        mesh.position.x = (Math.random() - 0.5) * 15;
        mesh.position.y = (Math.random() - 0.5) * 10;
        mesh.position.z = - (i * 8) - 5; // Spread out in depth
        
        // Random rotation
        mesh.rotation.x = (Math.random() - 0.5) * 0.5;
        mesh.rotation.y = (Math.random() - 0.5) * 0.5;
        
        // Add a frame around the artwork
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
        mesh.add(line);
        
        scene.add(mesh);
        objects.push(mesh);
    }

    // Scroll Animation - Move Camera based on scroll
    let scrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Mouse Parallax for Camera
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

    // Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Animate floating objects slightly
        objects.forEach((obj, i) => {
            obj.position.y += Math.sin(elapsedTime + i) * 0.005;
            obj.rotation.z += Math.sin(elapsedTime + i) * 0.001;
        });

        // Update camera position based on scroll (move forward into gallery)
        // Adjust the multiplier to control speed
        const scrollProgress = scrollY / (document.body.scrollHeight - window.innerHeight);
        const maxDepth = - (numFrames * 8); 
        camera.position.z = 5 + (scrollProgress * maxDepth * 1.2); 

        // Apply mouse parallax to camera
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        
        camera.position.x += 0.05 * (targetX - camera.position.x);
        camera.position.y += 0.05 * (-targetY - camera.position.y);

        // Render
        renderer.render(scene, camera);

        // Call tick again on the next frame
        window.requestAnimationFrame(tick);
    };

    tick();

    // Handle Resize
    window.addEventListener('resize', () => {
        // Update camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
};

initScene();

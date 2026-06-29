// wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // --------------------------------------------------------
    // 1. GSAP HTML UI Animations (Parallax & Fade-ins)
    // --------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger);

    // Animate texts and UI elements as they enter the viewport
    const parallaxElements = document.querySelectorAll(".parallax-text");
    
    parallaxElements.forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        });
    });

    // --------------------------------------------------------
    // 2. Three.js 3D Background Setup
    // --------------------------------------------------------
    const canvas = document.querySelector("#canvas-3d");
    
    const scene = new THREE.Scene();
    
    // Add Fog for depth
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.05);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Initial camera position
    camera.position.z = 10;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // Transparent background to show CSS bg
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1.5, 50); // Blue accent light
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xa5b4fc, 1, 50); // Light purple
    pointLight2.position.set(-5, -5, 2);
    scene.add(pointLight2);

    // --------------------------------------------------------
    // 3. Create 3D Objects (Representing Data, Tables, Nodes)
    // --------------------------------------------------------
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    const materials = [
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.7 }),
        new THREE.MeshStandardMaterial({ color: 0xa5b4fc, roughness: 0.2, metalness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.9 })
    ];

    // Create a scattered visual universe of geometric data representations
    const objectCount = 50;
    for (let i = 0; i < objectCount; i++) {
        // Mix of cubes (tables/records) and spheres (nodes)
        const geometry = Math.random() > 0.5 
            ? new THREE.BoxGeometry(Math.random() * 2 + 0.5, Math.random() * 0.5 + 0.1, Math.random() * 2 + 0.5) // Like spreadsheets/kanban cards
            : new THREE.SphereGeometry(Math.random() * 0.5 + 0.2, 16, 16); // Like automation nodes

        const material = materials[Math.floor(Math.random() * materials.length)];
        const mesh = new THREE.Mesh(geometry, material);

        // Position them in a large 3D space along the Z-axis (scroll path)
        mesh.position.x = (Math.random() - 0.5) * 20;
        mesh.position.y = (Math.random() - 0.5) * 15;
        mesh.position.z = (Math.random() - 0.5) * 40 - 10; // From +10 to -30

        // Random rotations
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        objectsGroup.add(mesh);
    }

    // --------------------------------------------------------
    // 4. Scroll-Based 3D Camera & Object Animation
    // --------------------------------------------------------
    
    // We calculate scroll progress to move the camera through the scene
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    function updateScrollProgress() {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        targetScrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
    }

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Init

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();

        // Smoothly interpolate scroll progress for buttery movement
        scrollProgress += (targetScrollProgress - scrollProgress) * 0.05;

        // Move Camera forward through the Z-axis based on scroll
        // Z goes from 10 down to -20 as we scroll
        camera.position.z = 10 - (scrollProgress * 30);
        
        // Add subtle continuous rotation and floating to the entire group
        objectsGroup.rotation.y = elapsedTime * 0.05;
        objectsGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.5;

        // Slowly rotate individual objects for a dynamic feel
        objectsGroup.children.forEach((child, index) => {
            child.rotation.x += 0.002 * (index % 3 + 1);
            child.rotation.y += 0.003 * (index % 2 + 1);
        });

        renderer.render(scene, camera);
    }

    animate();

    // --------------------------------------------------------
    // 5. Handle Resize
    // --------------------------------------------------------
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});

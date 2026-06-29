// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    initThreeJS();
    initScrollAnimations();
});

let scene, camera, renderer, planes = [];

function initThreeJS() {
    // 1. Setup Scene, Camera, Renderer
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2, 50);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xff0055, 2, 50);
    pointLight2.position.set(-2, -3, 2);
    scene.add(pointLight2);

    // 3. Create Floating Video Planes (Placeholders)
    const planeGeometry = new THREE.PlaneGeometry(1.6, 2.8); // Vertical aspect ratio
    
    // We'll create 15 floating clips distributed in 3D space
    for (let i = 0; i < 15; i++) {
        // Create a canvas texture to simulate a video frame
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 700;
        const ctx = canvas.getContext('2d');
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 700);
        gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 20%)`);
        gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 50%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 700);
        
        // Add some simulated UI to the "video"
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '30px sans-serif';
        ctx.fillText(`CLIP ${i+1}`, 40, 60);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(200, 350, 40, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshPhysicalMaterial({ 
            map: texture,
            roughness: 0.2,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        const plane = new THREE.Mesh(planeGeometry, material);
        
        // Random position along Z axis (depth)
        const zPos = -i * 3; 
        
        // Random X and Y positions
        const xPos = (Math.random() - 0.5) * 10;
        const yPos = (Math.random() - 0.5) * 8;

        plane.position.set(xPos, yPos, zPos);
        
        // Slight random rotation
        plane.rotation.x = (Math.random() - 0.5) * 0.2;
        plane.rotation.y = (Math.random() - 0.5) * 0.4;
        plane.rotation.z = (Math.random() - 0.5) * 0.1;

        scene.add(plane);
        planes.push({
            mesh: plane,
            baseX: xPos,
            baseY: yPos,
            baseZ: zPos,
            speed: Math.random() * 0.5 + 0.5
        });
    }

    // 4. Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        // Subtle floating animation for all planes
        planes.forEach((p, index) => {
            p.mesh.position.y = p.baseY + Math.sin(time * p.speed + index) * 0.2;
            p.mesh.rotation.x += Math.sin(time * 0.5 + index) * 0.001;
        });

        renderer.render(scene, camera);
    }
    animate();

    // 5. Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Camera move on scroll
    // The total distance we want the camera to travel into the depth (-Z)
    const maxZ = 45; 
    
    // Create a master timeline tied to the body scroll
    gsap.to(camera.position, {
        z: -maxZ,
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Smooth scrubbing
        }
    });

    // Animate HTML elements with Parallax
    const parallaxTexts = document.querySelectorAll('.parallax-text');
    parallaxTexts.forEach(text => {
        gsap.to(text, {
            y: -100,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // Fade in sections as they appear
    const sections = document.querySelectorAll('.section:not(.hero-section)');
    sections.forEach(section => {
        const block = section.querySelector('.content-block');
        gsap.fromTo(block, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: "top 70%",
                    end: "top 40%",
                    scrub: 0.5
                }
            }
        );
    });

    // Make navbar blur increase on scroll
    gsap.to('.navbar', {
        backgroundColor: "rgba(5, 5, 5, 0.8)",
        borderBottom: "1px solid rgba(255,255,255,0.2)",
        scrollTrigger: {
            trigger: "body",
            start: "100px top",
            end: "200px top",
            scrub: true
        }
    });
}

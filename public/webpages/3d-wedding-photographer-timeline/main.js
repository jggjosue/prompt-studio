// Ensure GSAP and ScrollTrigger are available
gsap.registerPlugin(ScrollTrigger);

class CinematicTimelineApp {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.sections = document.querySelectorAll('.scene-section');
        
        // 3D Setup properties
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.dioramas = [];
        
        // Mouse parallax properties
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        // Settings for timeline
        this.timelineLength = this.sections.length * 100; // Z-depth distance
        
        this.init();
    }

    init() {
        this.setupThreeJS();
        this.build3DScene();
        this.setupScrollAnimations();
        this.setupEventListeners();
        this.animate();
    }

    setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x1a1715, 0.015); // Matches var(--bg-color)

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 50); // Start position

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.5); // Warm white
        this.scene.add(ambientLight);

        this.pointLight = new THREE.PointLight(0xd4af37, 1, 100); // Gold accent light
        this.pointLight.position.set(0, 0, 40);
        this.scene.add(this.pointLight);
    }

    build3DScene() {
        // Create Particles (Dust/Petals)
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 800;
        const posArray = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i++) {
            // Spread particles along the Z axis based on timeline length
            if (i % 3 === 2) { // Z axis
                posArray[i] = (Math.random() - 0.5) * -this.timelineLength + 50; 
            } else { // X and Y axis
                posArray[i] = (Math.random() - 0.5) * 60;
            }
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.15,
            color: 0xffe6cc, // Warm peach
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particleMesh = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particleMesh);

        // Create abstract floating diorama elements for each section
        this.sections.forEach((section, index) => {
            const zPos = 40 - (index * 40); // Spaced 40 units apart
            
            // Floating Frame
            const frameGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(16, 9));
            const frameMat = new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.3 });
            const frame = new THREE.LineSegments(frameGeo, frameMat);
            
            // Alternate left/right based on HTML content alignment
            const xPos = index % 2 === 0 ? 10 : -10;
            
            frame.position.set(xPos, 0, zPos - 10);
            
            // Random rotation
            frame.rotation.z = (Math.random() - 0.5) * 0.2;
            frame.rotation.y = (Math.random() - 0.5) * 0.4;
            
            this.scene.add(frame);
            this.dioramas.push({
                mesh: frame,
                baseY: frame.position.y,
                speed: 0.01 + Math.random() * 0.02
            });
        });
    }

    setupScrollAnimations() {
        // HTML Parallax text and image elements
        const parallaxElements = document.querySelectorAll('.parallax-text, .parallax-element, .gallery-img');
        
        parallaxElements.forEach(el => {
            // Determine dynamic y-offset based on speed or random factor for photos
            let yOffset = 100;
            if (el.classList.contains('gallery-img')) {
                yOffset = 80 + Math.random() * 60; // Photos float dynamically
            } else if (el.dataset.speed) {
                yOffset = (parseFloat(el.dataset.speed) - 1) * 200; // Text floats based on speed
            }

            // Create smooth scrub animation both up and down
            gsap.fromTo(el, 
                { y: yOffset }, 
                {
                    y: -yOffset,
                    ease: "none",
                    scrollTrigger: {
                        trigger: el.parentElement || el,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.5 // Creates the smooth delay effect when scrolling
                    }
                }
            );
        });

        // Fade in effect for timeline sections
        const timelineSteps = document.querySelectorAll('.timeline-step');
        timelineSteps.forEach(step => {
            gsap.fromTo(step, 
                { opacity: 0.2, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    scrollTrigger: {
                        trigger: step,
                        start: "top 85%",
                        end: "top 35%",
                        scrub: 1
                    }
                }
            );
        });

        // 3D Camera Z-axis movement tied to scroll
        // Calculate total scrollable height of the timeline section
        const timelineEl = document.getElementById('timeline');
        
        gsap.to(this.camera.position, {
            z: 40 - ((this.sections.length - 1) * 40), // Move to the last diorama
            ease: "none",
            scrollTrigger: {
                trigger: "#hero", // Start scrolling from hero
                start: "top top",
                endTrigger: "#party", // End at the last timeline step
                end: "bottom center",
                scrub: 1 // Smooth scrubbing
            },
            onUpdate: () => {
                // Move the point light along with the camera
                this.pointLight.position.z = this.camera.position.z - 10;
                
                // Change light color slightly based on progress
                const progress = ScrollTrigger.getAll()[1].progress; // Get progress of camera movement
                if (progress > 0.8) { // Party time - vibrant
                    gsap.to(this.pointLight.color, { r: 1, g: 0.4, b: 0.6, duration: 0.5 }); // Pinkish
                } else if (progress > 0.4) { // Ceremony - bright natural
                    gsap.to(this.pointLight.color, { r: 1, g: 1, b: 1, duration: 0.5 }); // White
                } else { // Getting ready / morning - Warm gold
                    gsap.to(this.pointLight.color, { r: 0.83, g: 0.68, b: 0.21, duration: 0.5 }); // #d4af37
                }
            }
        });
    }

    setupEventListeners() {
        // Window Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Mouse Move for Parallax
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX - window.innerWidth / 2);
            this.mouseY = (event.clientY - window.innerHeight / 2);
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Smooth Mouse Parallax for Camera
        this.targetX = this.mouseX * 0.005;
        this.targetY = this.mouseY * 0.005;
        
        this.camera.position.x += (this.targetX - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.targetY - this.camera.position.y) * 0.05;

        // Gently rotate particles
        if (this.particleMesh) {
            this.particleMesh.rotation.y += 0.0005;
            this.particleMesh.rotation.x += 0.0002;
        }

        // Float dioramas
        const time = Date.now() * 0.001;
        this.dioramas.forEach((item, i) => {
            item.mesh.position.y = item.baseY + Math.sin(time + i) * 1.5;
            item.mesh.rotation.y += 0.001;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    const app = new CinematicTimelineApp();
});

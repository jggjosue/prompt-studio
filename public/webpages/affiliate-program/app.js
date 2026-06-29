// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Initialize Three.js Canvas
    initThreeJS();

    // 3. Initialize GSAP ScrollTrigger Animations
    initGSAP();
});

function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.x = 2; // Offset to the right since text is on the left

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create a 3D Object (Abstract Digital Product representation)
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    
    // Materials
    const material = new THREE.MeshPhongMaterial({
        color: 0x00F0FF, // Cyan
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    
    const coreMaterial = new THREE.MeshPhongMaterial({
        color: 0x0B132B, // Night blue
        emissive: 0x00C2CB,
        emissiveIntensity: 0.5,
        flatShading: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), coreMaterial);
    
    const group = new THREE.Group();
    group.add(mesh);
    group.add(coreMesh);
    
    // Position group on the right side of the screen
    if (window.innerWidth > 768) {
        group.position.x = 3;
    } else {
        group.position.x = 0;
        group.position.y = -2;
    }
    
    scene.add(group);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00E676, 2, 50); // Success green light
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00F0FF, 2, 50); // Cyan light
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation Loop
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

    function animate() {
        requestAnimationFrame(animate);

        // Base rotation
        group.rotation.y += 0.002;
        group.rotation.x += 0.001;
        
        // Mouse interaction (parallax 3D effect)
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        
        group.rotation.y += 0.05 * (targetX - group.rotation.y);
        group.rotation.x += 0.05 * (targetY - group.rotation.x);
        
        // Floating effect
        group.position.y = Math.sin(Date.now() * 0.001) * 0.2;

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (window.innerWidth > 768) {
            group.position.x = 3;
            group.position.y = 0;
        } else {
            group.position.x = 0;
            group.position.y = -2;
        }
    });
}

function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Benefits Cards Stagger Animation
    gsap.from('.benefit-card', {
        scrollTrigger: {
            trigger: '.benefits',
            start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // 2. Parallax effect for Dashboard UI Cards
    const floatCards = document.querySelectorAll('.dashboard-ui .glass-panel');
    
    floatCards.forEach(card => {
        const speed = card.getAttribute('data-speed') || 1;
        
        gsap.to(card, {
            y: () => -50 * speed,
            scrollTrigger: {
                trigger: '.dashboard-preview',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1, // Smooth scrubbing
            }
        });
    });

    // 3. Steps animation
    gsap.from('.step-item', {
        scrollTrigger: {
            trigger: '.steps',
            start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        rotationX: -15, // 3D flip effect on scroll
        transformPerspective: 1000,
        duration: 0.8,
        stagger: 0.3,
        ease: 'back.out(1.7)'
    });
    
    // 4. Connectors animation
    gsap.from('.step-connector', {
        scrollTrigger: {
            trigger: '.steps',
            start: 'top 70%',
        },
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.8,
        stagger: 0.3,
        delay: 0.4,
        ease: 'power2.inOut'
    });

    // 5. CTA Box Parallax
    gsap.from('.cta-box', {
        scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    // 6. Background Particles Parallax
    const particles = document.querySelectorAll('.bg-particle');
    particles.forEach(particle => {
        const speed = particle.getAttribute('data-speed') || 1;
        gsap.to(particle, {
            y: () => window.innerHeight * speed, // Move down as we scroll down
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5
            }
        });
    });
}

// Form Submission Prevention
document.getElementById('applyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = '¡Aplicación Enviada!';
    btn.style.backgroundColor = 'var(--c-success)';
    btn.style.color = 'var(--c-night-blue-dark)';
    btn.style.boxShadow = '0 0 20px rgba(0, 230, 118, 0.4)';
    
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style = '';
        e.target.reset();
    }, 3000);
});

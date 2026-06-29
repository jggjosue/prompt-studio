document.addEventListener("DOMContentLoaded", () => {
    // Hide Loader
    setTimeout(() => {
        document.querySelector('.loader').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.loader').style.display = 'none';
        }, 500);
    }, 1000);

    initThreeJS();
    initGSAP();
    initHotspots();
    initForm();
});

function initThreeJS() {
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    
    // Add some fog for depth
    scene.fog = new THREE.FogExp2(0x050505, 0.05);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create a cool abstract tech object (TorusKnot)
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ffcc,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 60;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x00ffcc,
        transparent: true,
        opacity: 0.8
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffcc, 2);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    camera.position.z = 30;

    // Mouse interaction
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

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Rotate object
        torusKnot.rotation.y += 0.005;
        torusKnot.rotation.x += 0.002;

        // Animate particles slowly
        particlesMesh.rotation.y = -elapsedTime * 0.02;

        // Mouse parallax for 3D scene
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        
        torusKnot.rotation.y += 0.05 * (targetX - torusKnot.rotation.y);
        torusKnot.rotation.x += 0.05 * (targetY - torusKnot.rotation.x);

        renderer.render(scene, camera);
    }
    animate();

    // Scroll animation for 3D object
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.to(torusKnot.position, {
        y: -20,
        z: -10,
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Parallax text
    gsap.utils.toArray('.parallax-text').forEach(layer => {
        const speed = layer.dataset.speed;
        gsap.to(layer, {
            y: (i, el) => (1 - parseFloat(speed)) * (ScrollTrigger.maxScroll(window) - (ScrollTrigger.maxScroll(window) / 2)),
            ease: "none",
            scrollTrigger: {
                trigger: layer,
                start: "top bottom",
                end: "bottom top",
                scrub: 0,
            }
        });
    });

    // Fade in elements
    gsap.utils.toArray('.feature-row').forEach(row => {
        gsap.from(row, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: row,
                start: "top 80%",
            }
        });
    });
    
    gsap.from('.specs-grid .spec-card', {
        opacity: 0,
        y: 30,
        stagger: 0.2,
        duration: 0.8,
        scrollTrigger: {
            trigger: '.specs-grid',
            start: "top 85%",
        }
    });
}

function initHotspots() {
    const hotspots = document.querySelectorAll('.hotspot');
    const infoCard = document.getElementById('hotspot-info');
    const infoTitle = document.getElementById('info-title');
    const infoDesc = document.getElementById('info-desc');
    const closeBtn = document.getElementById('close-info');

    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', (e) => {
            // Remove active from all
            hotspots.forEach(h => h.querySelector('.pulse').style.background = 'rgba(0, 255, 204, 0.4)');
            
            // Set active
            e.currentTarget.querySelector('.pulse').style.background = 'rgba(255, 255, 255, 0.8)';
            
            const info = e.currentTarget.getAttribute('data-info').split(':');
            infoTitle.textContent = info[0];
            infoDesc.textContent = info[1];
            
            infoCard.classList.remove('hidden');
        });
    });

    closeBtn.addEventListener('click', () => {
        infoCard.classList.add('hidden');
        hotspots.forEach(h => h.querySelector('.pulse').style.background = 'rgba(0, 255, 204, 0.4)');
    });
}

function initForm() {
    const form = document.getElementById('preorder-form');
    const message = document.getElementById('form-message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input').value;
        if(email) {
            message.style.color = 'var(--accent)';
            message.textContent = 'Thank you! Your spot is reserved.';
            form.reset();
            
            setTimeout(() => {
                message.textContent = '';
            }, 5000);
        }
    });
}

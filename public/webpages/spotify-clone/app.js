// Initialize Three.js Background Canvas
const initThreeJS = () => {
    const canvas = document.querySelector('#bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Particles (Stars/Music Dust)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color('#6a11cb');
    const color2 = new THREE.Color('#2575fc');
    const color3 = new THREE.Color('#ff007a');

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Spread particles across a wide area
        posArray[i] = (Math.random() - 0.5) * 100;     // x
        posArray[i + 1] = (Math.random() - 0.5) * 100; // y
        posArray[i + 2] = (Math.random() - 0.5) * 100; // z

        // Random colors
        const mixedColor = color1.clone().lerp(
            Math.random() > 0.5 ? color2 : color3, 
            Math.random()
        );
        
        colorsArray[i] = mixedColor.r;
        colorsArray[i + 1] = mixedColor.g;
        colorsArray[i + 2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    // Custom Shader Material for glowing particles
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Waveform lines (Visualizer effect)
    const waveGeometry = new THREE.BufferGeometry();
    const wavePoints = 100;
    const wavePositions = new Float32Array(wavePoints * 3);
    
    for (let i = 0; i < wavePoints; i++) {
        wavePositions[i * 3] = (i - wavePoints/2) * 0.8; // x
        wavePositions[i * 3 + 1] = 0; // y
        wavePositions[i * 3 + 2] = -10; // z
    }
    
    waveGeometry.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    
    const waveMaterial = new THREE.LineBasicMaterial({
        color: 0x2575fc,
        transparent: true,
        opacity: 0.4,
        linewidth: 2
    });
    
    const waveLine = new THREE.Line(waveGeometry, waveMaterial);
    scene.add(waveLine);

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

    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Rotate particles slowly
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Animate wave
        const positions = waveLine.geometry.attributes.position.array;
        for (let i = 0; i < wavePoints; i++) {
            const x = positions[i * 3];
            // Simulate music wave using sine functions
            positions[i * 3 + 1] = Math.sin(x * 0.5 + elapsedTime * 2) * 2 + Math.cos(x * 0.2 + elapsedTime * 3) * 1;
        }
        waveLine.geometry.attributes.position.needsUpdate = true;

        // Mouse interaction for parallax effect
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Render
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Scroll Interaction (GSAP + Three.js)
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
        trigger: ".discover",
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => {
            gsap.to(particlesMesh.rotation, {
                x: self.progress * Math.PI,
                duration: 0.5,
                ease: "power2.out"
            });
            gsap.to(camera.position, {
                z: 30 - self.progress * 15,
                duration: 0.5
            });
        }
    });
};

// Initialize GSAP Animations
const initGSAP = () => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section
    gsap.from(".hero-content h1", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
    
    gsap.from(".hero-content p", {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out"
    });
    
    gsap.from(".hero-buttons", {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "power3.out"
    });

    // Discover Cards
    gsap.from(".parallax-card", {
        scrollTrigger: {
            trigger: ".discover",
            start: "top 70%",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)"
    });

    // Player Demo
    gsap.from(".player-container", {
        scrollTrigger: {
            trigger: ".player-demo",
            start: "top 70%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    // Lyric Sync Simulation
    const lyrics = document.querySelectorAll('.lyric');
    let currentLyric = 0;
    
    setInterval(() => {
        lyrics.forEach(l => l.classList.remove('active'));
        lyrics[currentLyric].classList.add('active');
        currentLyric = (currentLyric + 1) % lyrics.length;
    }, 3000);
};

// Run on load
window.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initGSAP();
});

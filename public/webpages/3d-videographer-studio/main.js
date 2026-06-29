// Configuración básica de Three.js
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.03); // Niebla para efecto de profundidad

// Cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);

// Renderizador
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Creación del Estudio 3D (Objetos abstractos/representativos) ---

const objects = [];

// Función auxiliar para crear "Lentes"
function createLens(x, y, z) {
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        metalness: 0.8,
        roughness: 0.2
    });
    const lens = new THREE.Mesh(geometry, material);
    
    // Cristal del lente
    const glassGeometry = new THREE.SphereGeometry(0.78, 32, 16, 0, Math.PI * 2, 0, Math.PI / 4);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2244ff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9,
        transparent: true
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.y = 0.75;
    lens.add(glass);

    lens.position.set(x, y, z);
    lens.rotation.x = Math.PI / 2;
    scene.add(lens);
    objects.push(lens);
    return lens;
}

// Función auxiliar para crear "Monitores"
function createMonitor(x, y, z, rotY) {
    const geometry = new THREE.BoxGeometry(3, 1.7, 0.1);
    const material = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const monitor = new THREE.Mesh(geometry, material);
    
    // Pantalla
    const screenGeom = new THREE.PlaneGeometry(2.8, 1.5);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x112233 }); // Azul oscuro como si estuviera editando
    const screen = new THREE.Mesh(screenGeom, screenMat);
    screen.position.z = 0.06;
    monitor.add(screen);

    monitor.position.set(x, y, z);
    monitor.rotation.y = rotY;
    scene.add(monitor);
    objects.push(monitor);
    return monitor;
}

// Poblar la escena a lo largo del eje Z negativo (por donde viajará la cámara)
createLens(-3, 1, 5);
createLens(2, 0, 0);
createMonitor(4, 2, -5, -Math.PI / 6);
createMonitor(-4, 1.5, -12, Math.PI / 4);
createLens(1, -1, -18);

// Partículas (Polvo en el aire / Bokeh)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Distribuir partículas a lo largo del recorrido
    posArray[i] = (Math.random() - 0.5) * 20;
    // Hacer el eje Z mucho más largo
    if (i % 3 === 2) {
        posArray[i] = (Math.random() - 1) * 40 + 10;
    }
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xd4af37, // Gold
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- Luces ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xffffff, 1, 20);
pointLight1.position.set(2, 3, 4);
scene.add(pointLight1);

const accentLight = new THREE.PointLight(0xd4af37, 2, 15);
accentLight.position.set(-3, 2, -10);
scene.add(accentLight);

const blueLight = new THREE.PointLight(0x2244ff, 1.5, 20);
blueLight.position.set(4, -1, -20);
scene.add(blueLight);

// --- Animación Continua ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotar objetos lentamente
    objects.forEach((obj, index) => {
        obj.rotation.y += 0.005 * (index % 2 === 0 ? 1 : -1);
        obj.position.y += Math.sin(elapsedTime + index) * 0.002; // Flotación
    });

    // Animar partículas suavemente
    particlesMesh.rotation.y = elapsedTime * 0.02;

    renderer.render(scene, camera);
}
animate();

// --- Ajuste al cambiar tamaño de ventana ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP y ScrollTrigger ---
gsap.registerPlugin(ScrollTrigger);

// 1. Animar la Cámara a través de la escena 3D en base al scroll
const cameraPath = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1 // Suavizado del scroll
    }
});

// Definir los waypoints de la cámara correspondientes a las secciones
cameraPath
    .to(camera.position, { z: 2, y: 1, x: -1, ease: "power1.inOut" }, 0) // Hacia Preproducción
    .to(camera.rotation, { y: -0.2, ease: "power1.inOut" }, 0)
    
    .to(camera.position, { z: -6, y: 1.5, x: 2, ease: "power1.inOut" }, 1) // Hacia Grabación
    .to(camera.rotation, { y: 0.3, ease: "power1.inOut" }, 1)
    
    .to(camera.position, { z: -15, y: 0.5, x: -1, ease: "power1.inOut" }, 2) // Hacia Post
    .to(camera.rotation, { y: -0.1, ease: "power1.inOut" }, 2)
    
    .to(camera.position, { z: -25, y: 2, x: 0, ease: "power1.inOut" }, 3) // Hacia Galería/Booking
    .to(camera.rotation, { y: 0, ease: "power1.inOut" }, 3);


// 2. Animar los elementos UI (Fade in/up y Parallax)
const panels = gsap.utils.toArray('.panel:not(#hero):not(footer)');

panels.forEach((panel) => {
    const content = panel.querySelector('.content');
    
    // Animación de entrada
    gsap.fromTo(content, 
        { 
            y: 100, 
            opacity: 0 
        },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: panel,
                start: "top 75%", // Inicia cuando el top del panel llega al 75% del viewport
                end: "center center",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Efecto Parallax para elementos específicos
gsap.utils.toArray('.parallax-layer').forEach(layer => {
    gsap.to(layer, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

gsap.utils.toArray('.parallax-text').forEach(text => {
    gsap.to(text, {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
});

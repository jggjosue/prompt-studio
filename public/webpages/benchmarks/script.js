// 1. ANIMACIONES DE INTERFAZ (Reemplazo de Framer Motion)
document.addEventListener("DOMContentLoaded", () => {
  // Configuración de IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos con clases de animación
  const animatedElements = document.querySelectorAll('.fade-up, .scroll-animate, .scroll-animate-scale, .scroll-animate-width');
  animatedElements.forEach(el => observer.observe(el));

  // Efecto Parallax en el Hero
  const heroContent = document.getElementById('hero-content');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    // Hasta unos 500px, mover y desvanecer
    if (scrollY < 600 && heroContent) {
      const yPos = scrollY * 0.5; // parallax speed
      const opacity = Math.max(1 - (scrollY / 400), 0);
      heroContent.style.transform = `translateY(${yPos}px)`;
      heroContent.style.opacity = opacity;
    }
  });
});

// 2. ESCENA 3D (Vanilla Three.js)
const init3DScene = () => {
  const container = document.getElementById('canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // Escena, Cámara y Renderizador
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#050814');
  scene.fog = new THREE.Fog('#050814', 5, 25);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  // Posición inicial (equivalente al R3F: z=10, y=2)
  camera.position.set(0, 2, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const light1 = new THREE.PointLight('#00f3ff', 1.5);
  light1.position.set(10, 10, 10);
  scene.add(light1);

  const light2 = new THREE.PointLight('#7b2cbf', 1);
  light2.position.set(-10, -10, -10);
  scene.add(light2);

  // Grupo Central (Servidor)
  const serverGroup = new THREE.Group();
  serverGroup.position.set(0, -1, 0);
  scene.add(serverGroup);

  // Cilindro Base
  const cylinderGeo = new THREE.CylinderGeometry(2, 2.5, 4, 32);
  const cylinderMat = new THREE.MeshStandardMaterial({ color: '#111827', metalness: 0.9, roughness: 0.2 });
  const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
  serverGroup.add(cylinder);

  // Anillos de Neón
  const torusGeo = new THREE.TorusGeometry(2.2, 0.05, 16, 100);
  const torusMat = new THREE.MeshBasicMaterial({ color: '#00ff9d' });
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(torusGeo, torusMat);
    ring.position.set(0, -1.5 + i * 1.5, 0);
    ring.rotation.x = Math.PI / 2;
    serverGroup.add(ring);
  }

  // Esfera de Wireframe
  const sphereGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const sphereMat = new THREE.MeshStandardMaterial({ 
    color: '#000000', 
    emissive: '#7b2cbf', 
    emissiveIntensity: 2, 
    wireframe: true 
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  serverGroup.add(sphere);

  // Nodos de Datos (Octaedros Flotantes)
  const nodesGroup = new THREE.Group();
  scene.add(nodesGroup);
  
  const octaGeo = new THREE.OctahedronGeometry(1, 0);
  const octaMat = new THREE.MeshStandardMaterial({
    color: '#00f3ff',
    emissive: '#00f3ff',
    emissiveIntensity: 0.5,
    wireframe: true
  });

  const nodes = [];
  for (let i = 0; i < 50; i++) {
    const mesh = new THREE.Mesh(octaGeo, octaMat);
    mesh.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    const scale = Math.random() * 0.2 + 0.05;
    mesh.scale.set(scale, scale, scale);
    
    // Almacenar offsets para la animación de flotación
    nodes.push({
      mesh,
      speedY: Math.random() * 0.02 + 0.01,
      speedRot: Math.random() * 0.02,
      offsetY: Math.random() * Math.PI * 2
    });
    nodesGroup.add(mesh);
  }

  // Línea de conexión decorativa
  const points = [
    new THREE.Vector3(-5, -2, -5),
    new THREE.Vector3(5, 2, 5),
    new THREE.Vector3(2, 5, -2),
    new THREE.Vector3(-2, -5, 2)
  ];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  const lineMat = new THREE.LineBasicMaterial({ color: '#00f3ff', transparent: true, opacity: 0.3 });
  const line = new THREE.LineLoop(lineGeo, lineMat);
  nodesGroup.add(line);

  // Partículas y Estrellas
  const particlesGeo = new THREE.BufferGeometry();
  const particlesCount = 2000;
  const posArray = new Float32Array(particlesCount * 3);
  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 50;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: '#ffffff',
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });
  const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particlesMesh);

  // Efecto de cámara al hacer scroll
  // En R3F se usaba ScrollControls con damping. Aquí lo simulamos.
  let targetCameraZ = 10;
  let targetCameraY = 2;
  
  const updateCameraTarget = () => {
    // Calculamos el progreso del scroll de 0 a 1 (maximo de la pagina)
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY;
    let t = 0;
    if (maxScroll > 0) {
       t = scrollY / maxScroll;
    }
    // Lógica original: state.camera.position.z = 10 - t * 15; y = 2 - t * 4
    targetCameraZ = 10 - t * 15;
    targetCameraY = 2 - t * 4;
  };

  window.addEventListener('scroll', updateCameraTarget);
  updateCameraTarget(); // Inicializar

  // Animación / Render Loop
  const clock = new THREE.Clock();
  
  const animate = () => {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Rotar Servidor
    serverGroup.rotation.y += 0.01;
    serverGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.1;

    // Animar Nodos Flotantes
    nodes.forEach(node => {
      node.mesh.position.y += Math.sin(elapsedTime * node.speedY + node.offsetY) * 0.01;
      node.mesh.rotation.x += node.speedRot;
      node.mesh.rotation.y += node.speedRot;
    });

    // Animar Estrellas/Partículas
    particlesMesh.rotation.y += 0.0005;

    // Movimiento suave de la cámara (Damping)
    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;
    camera.position.y += (targetCameraY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  };

  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

init3DScene();

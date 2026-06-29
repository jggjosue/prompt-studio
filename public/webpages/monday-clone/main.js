// Initialize Three.js Scene
const initThreeJS = () => {
  const container = document.getElementById('webgl-container');
  
  const scene = new THREE.Scene();
  // Add some fog for depth
  scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;
  camera.position.y = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);
  
  const pointLight1 = new THREE.PointLight(0x635bff, 2, 50);
  pointLight1.position.set(-10, 10, -10);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0x00d4ff, 2, 50);
  pointLight2.position.set(10, -10, -5);
  scene.add(pointLight2);

  // Group to hold all objects for rotation
  const group = new THREE.Group();
  scene.add(group);

  // Create floating elements representing "work nodes", boards, and cards
  const geometries = [
    new THREE.BoxGeometry(2, 0.2, 3),   // Board
    new THREE.BoxGeometry(1, 0.1, 1.5), // Card
    new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32), // Node
    new THREE.IcosahedronGeometry(0.8, 0) // Automation
  ];

  const materials = [
    new THREE.MeshPhysicalMaterial({ color: 0x635bff, metalness: 0.1, roughness: 0.5, transmission: 0.9, transparent: true }),
    new THREE.MeshPhysicalMaterial({ color: 0xff3d57, metalness: 0.1, roughness: 0.5, transmission: 0.9, transparent: true }),
    new THREE.MeshPhysicalMaterial({ color: 0x00ca72, metalness: 0.1, roughness: 0.5, transmission: 0.9, transparent: true }),
    new THREE.MeshPhysicalMaterial({ color: 0xffc542, metalness: 0.1, roughness: 0.5, transmission: 0.9, transparent: true })
  ];

  const objects = [];

  for (let i = 0; i < 40; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mat = materials[Math.floor(Math.random() * materials.length)];
    
    const mesh = new THREE.Mesh(geo, mat);
    
    // Random positions
    mesh.position.x = (Math.random() - 0.5) * 40;
    mesh.position.y = (Math.random() - 0.5) * 40 - 10;
    mesh.position.z = (Math.random() - 0.5) * 30 - 5;
    
    // Random rotations
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    const scale = Math.random() * 0.5 + 0.5;
    mesh.scale.set(scale, scale, scale);

    group.add(mesh);
    objects.push({
      mesh,
      rx: (Math.random() - 0.5) * 0.01,
      ry: (Math.random() - 0.5) * 0.01,
      ryPos: mesh.position.y
    });
  }

  // Animation Loop
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Rotate objects slowly
    objects.forEach(obj => {
      obj.mesh.rotation.x += obj.rx;
      obj.mesh.rotation.y += obj.ry;
      obj.mesh.position.y = obj.ryPos + Math.sin(elapsedTime + obj.mesh.position.x) * 0.5;
    });

    // Parallax effect on camera based on mouse
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 2 + 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  };

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Return objects for GSAP ScrollTrigger
  return { camera, group };
};

// Initialize GSAP
const initGSAP = (threeContext) => {
  gsap.registerPlugin(ScrollTrigger);

  const { camera, group } = threeContext;

  // Camera scroll animation
  gsap.to(camera.position, {
    z: 5,
    y: 0,
    ease: "none",
    scrollTrigger: {
      trigger: "#scroll-content",
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });

  gsap.to(group.rotation, {
    y: Math.PI * 2,
    ease: "none",
    scrollTrigger: {
      trigger: "#scroll-content",
      start: "top top",
      end: "bottom bottom",
      scrub: 2
    }
  });

  // UI Elements fade in
  const panels = document.querySelectorAll('.glass-panel, .hero-title, .hero-subtitle, .hero-cta, .section-title, .section-subtitle, .cta-section h2, .cta-section p, .cta-section button');
  
  panels.forEach(panel => {
    gsap.from(panel, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: panel,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  });

  // HTML Parallax based on data-speed
  const parallaxElements = document.querySelectorAll('[data-speed]');
  parallaxElements.forEach(el => {
    const speed = el.getAttribute('data-speed');
    gsap.to(el, {
      y: () => (1 - parseFloat(speed)) * (ScrollTrigger.maxScroll(window) - (scrollTrigger ? scrollTrigger.start : 0)),
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });
};

// Run on load
window.addEventListener('DOMContentLoaded', () => {
  const threeContext = initThreeJS();
  initGSAP(threeContext);
});

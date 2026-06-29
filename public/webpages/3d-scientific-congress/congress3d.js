// 3D Scientific Congress - Scroll-driven 3D Scene

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Scene Setup
  const canvas = document.getElementById('bg-canvas');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030712, 0.02);

  // Camera Setup
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 10);

  // Renderer Setup
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Global Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(10, 20, 10);
  scene.add(mainLight);

  // --- Procedural Geometry for Zones ---

  // 1. Lobby Particles (Hero Section)
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2000;
  const posArray = new Float32Array(particlesCount * 3);

  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 60;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x06b6d4, // Cyan
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // 2. DNA Molecule (Auditorium Section)
  const dnaGroup = new THREE.Group();
  dnaGroup.position.set(15, -15, -20);
  
  const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const matBlue = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, roughness: 0.2 });
  const matCyan = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, roughness: 0.2 });

  for (let i = 0; i < 40; i++) {
    const angle = i * 0.4;
    const y = (i - 20) * 0.8;
    
    const mesh1 = new THREE.Mesh(sphereGeo, matBlue);
    mesh1.position.set(Math.cos(angle) * 2, y, Math.sin(angle) * 2);
    dnaGroup.add(mesh1);

    const mesh2 = new THREE.Mesh(sphereGeo, matCyan);
    mesh2.position.set(Math.cos(angle + Math.PI) * 2, y, Math.sin(angle + Math.PI) * 2);
    dnaGroup.add(mesh2);
  }
  scene.add(dnaGroup);

  // 3. Floating Screens/Panels (Posters Section)
  const panelsGroup = new THREE.Group();
  panelsGroup.position.set(-20, -40, -30);
  const panelGeo = new THREE.PlaneGeometry(4, 3);
  const panelMat = new THREE.MeshBasicMaterial({ 
    color: 0x0f172a, 
    transparent: true, 
    opacity: 0.7,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 10; i++) {
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 20
    );
    panel.rotation.y = Math.random() * Math.PI;
    
    // Add glowing edge
    const edges = new THREE.EdgesGeometry(panelGeo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x06b6d4 }));
    panel.add(line);
    
    panelsGroup.add(panel);
  }
  scene.add(panelsGroup);

  // 4. Abstract Network (Networking Section)
  const networkGroup = new THREE.Group();
  networkGroup.position.set(25, -70, -40);
  
  const nodeGeo = new THREE.IcosahedronGeometry(0.5, 0);
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
  
  for(let i=0; i<15; i++) {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15
    );
    networkGroup.add(node);
  }
  scene.add(networkGroup);

  // --- Animation Loop ---
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    // Gentle continuous rotation
    particlesMesh.rotation.y = time * 0.2;
    dnaGroup.rotation.y = time;
    panelsGroup.children.forEach((panel, i) => {
      panel.position.y += Math.sin(time * 2 + i) * 0.01;
    });
    networkGroup.rotation.x = time * 0.3;
    networkGroup.rotation.y = time * 0.4;

    renderer.render(scene, camera);
  }
  animate();

  // --- GSAP ScrollTrigger Animations ---

  // HTML Element Parallax and Fade
  const revealElements = document.querySelectorAll('.gs-reveal');
  revealElements.forEach((el) => {
    gsap.fromTo(el, 
      { autoAlpha: 0, y: 50 }, 
      {
        duration: 1, 
        autoAlpha: 1, 
        y: 0, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  const parallaxHeadings = document.querySelectorAll('.parallax-heading');
  parallaxHeadings.forEach((heading) => {
    gsap.to(heading, {
      y: -30,
      ease: "none",
      scrollTrigger: {
        trigger: heading.closest('section'),
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });

  // 3D Camera Scroll Timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 1 // Smooth scrubbing
    }
  });

  // 1. Hero to Auditorium
  tl.to(camera.position, {
    x: 10,
    y: -15,
    z: -10,
    ease: "power1.inOut"
  }, "0"); // Start at 0 progress

  tl.to(camera.rotation, {
    y: Math.PI / 6, // Look slightly left towards DNA
    ease: "power1.inOut"
  }, "0");

  // 2. Auditorium to Posters
  tl.to(camera.position, {
    x: -15,
    y: -40,
    z: -15,
    ease: "power1.inOut"
  }, "+=0");

  tl.to(camera.rotation, {
    y: -Math.PI / 4, // Look right towards panels
    ease: "power1.inOut"
  }, "<");

  // 3. Posters to Networking
  tl.to(camera.position, {
    x: 20,
    y: -70,
    z: -25,
    ease: "power1.inOut"
  }, "+=0");

  tl.to(camera.rotation, {
    y: Math.PI / 4, // Look left towards network
    ease: "power1.inOut"
  }, "<");

  // 4. Networking to Registration (End)
  tl.to(camera.position, {
    x: 0,
    y: -90,
    z: -10,
    ease: "power1.inOut"
  }, "+=0");

  tl.to(camera.rotation, {
    y: 0, // Face forward again
    ease: "power1.inOut"
  }, "<");

  // --- Window Resize Handling ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});

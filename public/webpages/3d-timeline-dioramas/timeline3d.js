document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // --- DOM Elements ---
  const canvasContainer = document.getElementById('canvas-container');
  const scrollProgress = document.getElementById('scroll-progress');
  const form = document.getElementById('conversion-form');
  const formFeedback = document.querySelector('.form-feedback');
  const infoModal = document.getElementById('info-modal');
  const modalClose = document.querySelector('.modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  // --- Three.js Setup ---
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030305, 0.04);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  // Initial camera position
  camera.position.set(0, 2, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasContainer.appendChild(renderer.domElement);

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x5e6ad2, 1.5);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x8a8a9a, 2, 20);
  pointLight.position.set(-5, 5, -5);
  scene.add(pointLight);

  // --- Timeline Data (positions for camera per chapter) ---
  const timelineNodes = [
    { z: -5, x: -2 },   // chapter 0
    { z: -25, x: 2 },   // chapter 1
    { z: -45, x: -2 },  // chapter 2
    { z: -65, x: 2 },   // chapter 3
    { z: -85, x: 0 }    // chapter 4
  ];

  // --- Create Dioramas ---
  const dioramaMeshes = [];
  
  // Materials
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a2e, 
    roughness: 0.7, 
    metalness: 0.3 
  });
  
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x5e6ad2,
    emissive: 0x5e6ad2,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.8
  });

  // Helper to create abstract diorama
  function createDiorama(index, pos) {
    const group = new THREE.Group();
    group.position.set(pos.x, 0, pos.z);

    // Platform
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.2, 32), baseMaterial);
    platform.receiveShadow = true;
    group.add(platform);

    // Core abstract object
    let coreGeom;
    if (index === 0) coreGeom = new THREE.BoxGeometry(1, 1, 1);
    else if (index === 1) coreGeom = new THREE.ConeGeometry(0.8, 1.5, 4);
    else if (index === 2) coreGeom = new THREE.TorusGeometry(0.6, 0.2, 16, 100);
    else if (index === 3) coreGeom = new THREE.IcosahedronGeometry(0.8, 0);
    else coreGeom = new THREE.OctahedronGeometry(1, 1);
    
    const core = new THREE.Mesh(coreGeom, accentMaterial);
    core.position.y = 1.2;
    core.castShadow = true;
    
    // Add floating animation data
    core.userData = {
      baseY: 1.2,
      speed: 1 + Math.random(),
      rotSpeed: 0.01 + Math.random() * 0.02
    };
    
    group.add(core);
    dioramaMeshes.push(core); // to animate in render loop

    // Particles/nodes around
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), accentMaterial);
      const angle = (Math.PI * 2 / 5) * i;
      const radius = 1.2;
      p.position.set(Math.cos(angle)*radius, 0.5 + Math.random(), Math.sin(angle)*radius);
      
      p.userData = {
        baseY: p.position.y,
        speed: 2 + Math.random(),
        offset: Math.random() * Math.PI * 2
      };
      
      group.add(p);
      dioramaMeshes.push(p);
    }

    scene.add(group);

    // Connect line to next diorama
    if (index < timelineNodes.length - 1) {
      const nextPos = timelineNodes[index + 1];
      const points = [];
      points.push(new THREE.Vector3(pos.x, 0, pos.z));
      points.push(new THREE.Vector3(nextPos.x, 0, nextPos.z));
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x5e6ad2, transparent: true, opacity: 0.3 });
      const line = new THREE.Line(lineGeom, lineMat);
      scene.add(line);
    }
  }

  // Build the scene
  timelineNodes.forEach((node, index) => {
    createDiorama(index, node);
  });

  // Starfield/Particles background
  const starsGeom = new THREE.BufferGeometry();
  const starsCount = 1000;
  const posArray = new Float32Array(starsCount * 3);
  for(let i=0; i<starsCount*3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
  }
  starsGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const starsMat = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0.5 });
  const starsMesh = new THREE.Points(starsGeom, starsMat);
  scene.add(starsMesh);

  // --- ScrollTrigger Animations ---

  // 1. Scroll Progress Bar
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: self => {
      scrollProgress.style.width = `${self.progress * 100}%`;
    }
  });

  // 2. Camera Animation based on scroll
  // Map sections to camera positions
  const sections = document.querySelectorAll('.chapter-section');
  
  // Initial animation out of hero section
  gsap.to(camera.position, {
    z: timelineNodes[0].z + 6,
    x: timelineNodes[0].x,
    y: 1.5,
    ease: "none",
    scrollTrigger: {
      trigger: "#intro",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  // Animate through chapters
  sections.forEach((sec, i) => {
    const node = timelineNodes[i];
    
    // Animate HTML content fading/parallax
    const textCol = sec.querySelector('.text-column');
    const overlay = sec.querySelector('.hotspot-overlay');
    
    if (textCol) {
      gsap.fromTo(textCol, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1,
          scrollTrigger: {
            trigger: sec,
            start: "top 70%",
            end: "top 30%",
            scrub: 1
          }
        }
      );
    }

    if (overlay) {
      gsap.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 1,
          scrollTrigger: {
            trigger: sec,
            start: "top 60%",
            end: "top 40%",
            scrub: 1
          }
        }
      );
    }

    // Camera movement to next node (if there is one)
    if (i < timelineNodes.length - 1) {
      const nextNode = timelineNodes[i + 1];
      gsap.to(camera.position, {
        z: nextNode.z + 6,
        x: nextNode.x,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: sec,
          start: "center center",
          endTrigger: sections[i+1],
          end: "center center",
          scrub: 1.5
        }
      });
    }
  });

  // Parallax on hero content
  gsap.to(".hero-content", {
    y: 150,
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: "#intro",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  // --- Interaction: Hotspots ---
  const hotspots = document.querySelectorAll('.hotspot-btn');
  hotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const info = e.target.getAttribute('data-info');
      const title = e.target.textContent;
      modalTitle.textContent = title;
      modalBody.textContent = info;
      infoModal.classList.remove('hidden');
    });
  });

  modalClose.addEventListener('click', () => {
    infoModal.classList.add('hidden');
  });
  infoModal.addEventListener('click', (e) => {
    if(e.target === infoModal || e.target.classList.contains('modal-backdrop')) {
      infoModal.classList.add('hidden');
    }
  });

  // --- Form Submission ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = 'Enviando...';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.textContent = 'Comenzar Gratis';
      btn.disabled = false;
      form.reset();
      formFeedback.classList.remove('hidden');
      setTimeout(() => formFeedback.classList.add('hidden'), 3000);
    }, 1500);
  });

  // --- Render Loop ---
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Animate meshes
    dioramaMeshes.forEach(mesh => {
      mesh.position.y = mesh.userData.baseY + Math.sin(time * mesh.userData.speed + (mesh.userData.offset || 0)) * 0.1;
      if (mesh.userData.rotSpeed) {
        mesh.rotation.y += mesh.userData.rotSpeed;
        mesh.rotation.x += mesh.userData.rotSpeed * 0.5;
      }
    });

    // Slow rotation for stars
    starsMesh.rotation.y = time * 0.02;

    renderer.render(scene, camera);
  }
  animate();

  // --- Resize Handler ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});

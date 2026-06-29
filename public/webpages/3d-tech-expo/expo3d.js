document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // --- 1. Three.js Setup ---
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x09090b, 0.02);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // --- 2. 3D Environment (Tech Expo Hall) ---
  const envGroup = new THREE.Group();
  scene.add(envGroup);

  // Floor grid
  const gridHelper = new THREE.GridHelper(200, 100, 0x3b82f6, 0x3b82f6);
  gridHelper.position.y = -2;
  gridHelper.material.opacity = 0.2;
  gridHelper.material.transparent = true;
  envGroup.add(gridHelper);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xca8a04, 2, 50);
  pointLight1.position.set(0, 5, -10);
  envGroup.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xa855f7, 2, 50);
  pointLight2.position.set(10, 5, -30);
  envGroup.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0x22c55e, 2, 50);
  pointLight3.position.set(-10, 5, -50);
  envGroup.add(pointLight3);

  // Create abstract "Stands" and "Screens" along the path
  const createStand = (x, z, color) => {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Base
    const baseGeo = new THREE.CylinderGeometry(2, 2.5, 0.5, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1.75;
    group.add(base);

    // Hologram / Display
    const displayGeo = new THREE.BoxGeometry(2, 3, 0.1);
    const displayMat = new THREE.MeshBasicMaterial({ 
      color: color, 
      transparent: true, 
      opacity: 0.6,
      wireframe: true 
    });
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.y = 1;
    group.add(display);
    
    // Animate display
    gsap.to(display.rotation, {
      y: Math.PI * 2,
      duration: 10 + Math.random() * 5,
      repeat: -1,
      ease: "none"
    });
    gsap.to(display.position, {
      y: 1.5,
      duration: 2 + Math.random(),
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    return group;
  };

  envGroup.add(createStand(8, -15, 0x3b82f6)); // Keynote area
  envGroup.add(createStand(-8, -35, 0xa855f7)); // Demos
  envGroup.add(createStand(8, -55, 0x22c55e)); // Startups
  envGroup.add(createStand(-8, -75, 0xf97316)); // Sponsors

  // Particles
  const particlesGeo = new THREE.BufferGeometry();
  const particlesCount = 1000;
  const posArray = new Float32Array(particlesCount * 3);
  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 50; // Spread x, y, z
    if (i % 3 === 2) {
      posArray[i] = (Math.random() - 0.5) * 100 - 40; // Spread deeper in Z
    }
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xca8a04,
    transparent: true,
    opacity: 0.8
  });
  const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particlesMesh);

  // --- 3. Camera Scroll Path ---
  // Initial camera position
  camera.position.set(0, 0, 5);

  // Define camera path points matching sections
  // Scroll mapping: 0 = Lobby, 1 = Keynote, 2 = Demos, 3 = Startups, 4 = Sponsors, 5 = Tickets
  const path = [
    { z: 5, x: 0, rx: 0, ry: 0 }, // Lobby
    { z: -15, x: -3, rx: 0, ry: -0.1 }, // Keynote
    { z: -35, x: 3, rx: 0, ry: 0.1 }, // Demos
    { z: -55, x: -2, rx: 0, ry: -0.05 }, // Startups
    { z: -75, x: 0, rx: 0, ry: 0 }, // Sponsors
    { z: -85, x: 0, rx: -0.2, ry: 0 }, // Tickets (Look down slightly)
  ];

  // Map scroll progress to camera path
  ScrollTrigger.create({
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Smooth scrubbing
    onUpdate: (self) => {
      const progress = self.progress;
      // Calculate current segment
      const segmentProgress = progress * (path.length - 1);
      const currentIndex = Math.floor(segmentProgress);
      const nextIndex = Math.min(currentIndex + 1, path.length - 1);
      const lerpFactor = segmentProgress - currentIndex;

      const p1 = path[currentIndex];
      const p2 = path[nextIndex];

      // Interpolate position and rotation
      camera.position.z = THREE.MathUtils.lerp(p1.z, p2.z, lerpFactor);
      camera.position.x = THREE.MathUtils.lerp(p1.x, p2.x, lerpFactor);
      camera.rotation.x = THREE.MathUtils.lerp(p1.rx, p2.rx, lerpFactor);
      camera.rotation.y = THREE.MathUtils.lerp(p1.ry, p2.ry, lerpFactor);
    }
  });

  // --- 4. UI Animations ---
  gsap.utils.toArray('.fade-in-up').forEach(element => {
    gsap.fromTo(element, 
      { y: 50, opacity: 0, autoAlpha: 0 },
      {
        y: 0,
        opacity: 1,
        autoAlpha: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%", // Trigger when element is 85% from top of viewport
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  // Glitch text effect logic (optional, for the hero title)
  const glitchText = document.querySelector('.glitch-text');
  if (glitchText) {
    setInterval(() => {
      glitchText.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
      setTimeout(() => {
        glitchText.style.transform = 'translate(0, 0)';
      }, 50);
    }, 3000);
  }

  // --- 5. Render Loop ---
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Slowly rotate particles
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Slowly pulse lights
    pointLight1.intensity = 2 + Math.sin(elapsedTime * 2) * 0.5;
    pointLight2.intensity = 2 + Math.sin(elapsedTime * 1.5) * 0.5;

    renderer.render(scene, camera);
  };

  animate();

  // --- 6. Resize Handler ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Toggle
  const menuToggle = document.getElementById('mobile-menu');
  const navMenu = document.querySelector('.nav-menu');
  
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Amount Selection
  const amountBtns = document.querySelectorAll('.amount-btn');
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // GSAP ScrollTrigger Setup for HTML Elements
  gsap.registerPlugin(ScrollTrigger);

  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    gsap.fromTo(card, 
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  const heroContent = document.querySelector('.hero-content');
  gsap.fromTo(heroContent, 
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 1.5, ease: "power3.out", delay: 0.5 }
  );

  // --- THREE.JS SCENE SETUP ---
  const canvas = document.getElementById('webgl-canvas');
  const scene = new THREE.Scene();
  // Very dark background
  scene.background = new THREE.Color('#030303');
  scene.fog = new THREE.FogExp2('#030303', 0.02);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  
  const goldLight = new THREE.PointLight(0xd4af37, 1.5, 50);
  goldLight.position.set(2, 2, 2);
  scene.add(goldLight);

  const blueLight = new THREE.PointLight(0x2a3d66, 1, 50);
  blueLight.position.set(-2, -2, -2);
  scene.add(blueLight);

  // Objects - Golden Particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1000;
  const posArray = new Float32Array(particlesCount * 3);

  for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles over a long Z-axis for the fly-through effect
    posArray[i] = (Math.random() - 0.5) * 30; // X and Y
    if(i % 3 === 2) {
      posArray[i] = (Math.random() - 0.5) * 50; // Z
    }
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xd4af37,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Objects - Elegant Rings
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  const ringGeo = new THREE.TorusGeometry(3, 0.02, 16, 100);
  const ringMat = new THREE.MeshStandardMaterial({ 
    color: 0xd4af37, 
    metalness: 0.8, 
    roughness: 0.2,
    transparent: true,
    opacity: 0.5
  });

  for(let i = 0; i < 5; i++) {
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = -i * 10;
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    ringGroup.add(ring);
  }

  // --- CAMERA SCROLL ANIMATION ---
  // Mapped to total scroll height
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1 // Smooth scrubbing
    }
  });

  // Move camera forward through the scene
  tl.to(camera.position, {
    z: -40,
    ease: "none"
  }, 0);

  // Rotate camera slightly for cinematic feel
  tl.to(camera.rotation, {
    z: Math.PI * 0.1,
    x: -Math.PI * 0.05,
    ease: "power1.inOut"
  }, 0);
  
  // Rotate rings as we scroll
  tl.to(ringGroup.rotation, {
    z: Math.PI * 1.5,
    y: Math.PI,
    ease: "none"
  }, 0);


  // Mouse Parallax Effect
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Subtle idle animation for particles
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Smooth mouse parallax
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
    // Apply parallax offset without overriding GSAP scroll rotation completely
    // We add it to the camera's current scroll-driven rotation by modifying a parent group or just offsetting slightly
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});

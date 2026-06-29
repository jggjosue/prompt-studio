document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     UI & NAVIGATION
     ========================================================================== */
  const navbar = document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  // Navbar background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  const toggleMobileMenu = () => {
    mobileMenuOverlay.classList.toggle('active');
    // Animate hamburger icon
    const spans = mobileMenuBtn.querySelectorAll('span');
    if (mobileMenuOverlay.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  };

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMobileMenu();
    });
  });

  /* ==========================================================================
     GSAP ANIMATIONS
     ========================================================================== */
  gsap.registerPlugin(ScrollTrigger);

  // Hero Parallax
  const heroElements = document.querySelectorAll('[data-speed]');
  heroElements.forEach(el => {
    const speed = el.getAttribute('data-speed');
    gsap.to(el, {
      y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed * 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  });

  // Experience Cards Fade in
  gsap.from(".glass-card", {
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    scrollTrigger: {
      trigger: "#experience",
      start: "top 80%",
    }
  });

  // Scenes Gallery Reveal
  const scenes = document.querySelectorAll(".scene-item");
  scenes.forEach(scene => {
    gsap.to(scene, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: scene,
        start: "top 85%",
      }
    });
  });

  // Typography Showcase Parallax
  const types = document.querySelectorAll(".huge-text");
  types.forEach((type, index) => {
    const dir = index % 2 === 0 ? 1 : -1;
    gsap.to(type, {
      x: dir * 200,
      scrollTrigger: {
        trigger: "#typography",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });
  });

  // Process Steps Stagger
  gsap.from(".process-steps li", {
    x: -50,
    opacity: 0,
    stagger: 0.2,
    duration: 0.8,
    scrollTrigger: {
      trigger: "#process",
      start: "top 70%",
    }
  });


  /* ==========================================================================
     THREE.JS 3D BACKGROUND
     ========================================================================== */
  const canvas = document.getElementById('bg-canvas');
  
  // Scene Setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.002); // Cinematic fog

  // Camera Setup
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  // Renderer Setup
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting (Cinematic)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  const mainLight = new THREE.PointLight(0xff3366, 2, 200); // Red/pink cinematic light
  mainLight.position.set(20, 20, 20);
  scene.add(mainLight);

  const blueLight = new THREE.PointLight(0x0066ff, 1.5, 200); // Blue contrast
  blueLight.position.set(-20, -20, 20);
  scene.add(blueLight);

  // Particles / Dust
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1500;
  const posArray = new Float32Array(particlesCount * 3);

  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 200; // Spread over space
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.5,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Scroll Interactivity for 3D Camera
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Mouse Interactivity
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
  });

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Move camera based on scroll (Parallax effect in 3D space)
    // Map scroll position to camera Z and Y
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = scrollY / maxScroll;
    
    // Smooth camera movement
    gsap.to(camera.position, {
      y: -scrollPercent * 50,
      z: 50 - (scrollPercent * 20),
      duration: 0.5,
      ease: "power1.out"
    });

    // Slight camera pan on mouse move
    gsap.to(camera.rotation, {
      y: -mouseX * 0.2,
      x: -mouseY * 0.2,
      duration: 1,
      ease: "power1.out"
    });
    
    // Move lights dynamically
    mainLight.position.x = Math.sin(elapsedTime * 0.5) * 30;
    mainLight.position.z = Math.cos(elapsedTime * 0.5) * 30;

    renderer.render(scene, camera);
  }

  animate();
});

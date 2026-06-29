// Anime Data
const trendingAnime = [
  {
    title: 'Cyberpunk: Edge of City',
    image: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['Sci-Fi', 'Acción'],
    rating: 9.8,
    episodes: 12
  },
  {
    title: 'Neon Samurai',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['Samurai', 'Fantasía'],
    rating: 9.5,
    episodes: 24
  },
  {
    title: 'Astral Knights',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['Mecha', 'Drama'],
    rating: 8.9,
    episodes: 12
  },
  {
    title: 'Spirit Detective',
    image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['Sobrenatural', 'Misterio'],
    rating: 9.2,
    episodes: 112
  },
  {
    title: 'Hero Academy X',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['Shounen', 'Superpoderes'],
    rating: 9.7,
    episodes: 64
  },
  {
    title: 'Void Walkers',
    image: 'https://images.unsplash.com/photo-1614729939124-03290b56c9ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['Fantasía Oscura', 'Acción'],
    rating: 9.1,
    episodes: 12
  }
];

// Populate Carousel
const track = document.getElementById('trending-track');
trendingAnime.forEach(anime => {
  const card = document.createElement('div');
  card.className = 'anime-card';
  card.innerHTML = `
    <div class="anime-card-inner">
      <img src="${anime.image}" alt="${anime.title}" class="anime-poster">
      <div class="anime-overlay">
        <div class="anime-tags">
          ${anime.tags.map(tag => `<span class="anime-tag">${tag}</span>`).join('')}
        </div>
        <h3 class="anime-title">${anime.title}</h3>
        <div class="anime-meta">
          <span class="anime-rating"><i data-lucide="star" style="width:12px;height:12px;fill:currentColor"></i> ${anime.rating}</span>
          <span>${anime.episodes} Eps</span>
        </div>
      </div>
    </div>
  `;
  track.appendChild(card);
});

// Three.js Setup
const initThreeJS = () => {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  // Darker background with fog for depth
  scene.background = new THREE.Color('#07070A');
  scene.fog = new THREE.FogExp2('#07070A', 0.001);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles / Energy flow
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2000;
  
  const posArray = new Float32Array(particlesCount * 3);
  const colorsArray = new Float32Array(particlesCount * 3);

  const color1 = new THREE.Color('#FF6B00'); // Orange
  const color2 = new THREE.Color('#9D4EDD'); // Purple

  for(let i = 0; i < particlesCount * 3; i+=3) {
    // Spread particles around
    posArray[i] = (Math.random() - 0.5) * 100;
    posArray[i+1] = (Math.random() - 0.5) * 100;
    posArray[i+2] = (Math.random() - 0.5) * 100;

    // Mix colors
    const mixedColor = color1.clone().lerp(color2, Math.random());
    colorsArray[i] = mixedColor.r;
    colorsArray[i+1] = mixedColor.g;
    colorsArray[i+2] = mixedColor.b;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particlesMesh = new THREE.Points(particlesGeometry, material);
  scene.add(particlesMesh);

  // Floating geometric shapes (representing portals/screens)
  const shapes = [];
  const geo1 = new THREE.TorusGeometry(10, 0.2, 16, 100);
  const geo2 = new THREE.IcosahedronGeometry(4, 1);
  
  const mat1 = new THREE.MeshBasicMaterial({ color: '#FF6B00', wireframe: true, transparent: true, opacity: 0.15 });
  const mat2 = new THREE.MeshBasicMaterial({ color: '#9D4EDD', wireframe: true, transparent: true, opacity: 0.15 });

  const mesh1 = new THREE.Mesh(geo1, mat1);
  mesh1.position.set(-15, 10, -20);
  scene.add(mesh1);
  shapes.push(mesh1);

  const mesh2 = new THREE.Mesh(geo2, mat2);
  mesh2.position.set(20, -5, -30);
  scene.add(mesh2);
  shapes.push(mesh2);

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

  const animate = () => {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    // Smooth camera movement based on mouse
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;

    // Rotate particles
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Rotate shapes
    mesh1.rotation.x = elapsedTime * 0.2;
    mesh1.rotation.y = elapsedTime * 0.3;
    
    mesh2.rotation.x = elapsedTime * -0.1;
    mesh2.rotation.y = elapsedTime * -0.2;

    renderer.render(scene, camera);
  };

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // GSAP integration for Three.js camera based on scroll
  gsap.registerPlugin(ScrollTrigger);

  gsap.to(camera.position, {
    z: 10,
    y: -10,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });
  
  gsap.to(particlesMesh.rotation, {
    y: Math.PI * 2,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 2
    }
  });
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initThreeJS();

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // GSAP Animations
  gsap.registerPlugin(ScrollTrigger);

  // Hero animations
  const tl = gsap.timeline();
  tl.from('.badge', { y: 20, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2 })
    .from('.hero-title', { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.6")
    .from('.hero-desc', { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
    .from('.hero-cta .btn', { y: 20, opacity: 0, duration: 0.6, stagger: 0.2, ease: "power3.out" }, "-=0.4");

  // Player animations
  gsap.to('#player-container', {
    y: 0,
    opacity: 1,
    duration: 1.5,
    ease: "power4.out",
    scrollTrigger: {
      trigger: '.player-section',
      start: 'top 70%',
    }
  });

  // Features stagger
  gsap.from('.feature-card', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "back.out(1.5)",
    scrollTrigger: {
      trigger: '#caracteristicas',
      start: 'top 75%',
    }
  });

  // Pricing pop
  gsap.from('.pricing-card', {
    scale: 0.9,
    opacity: 0,
    duration: 0.8,
    stagger: 0.3,
    ease: "power3.out",
    scrollTrigger: {
      trigger: '#planes',
      start: 'top 75%',
    }
  });
});

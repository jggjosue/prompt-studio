import * as THREE from 'three';

// Wait for GSAP and ScrollTrigger to load
window.addEventListener('load', init);

let scene, camera, renderer, mainLight, ambientLight, fillLight;
let products = [];
let sceneGroup;

const COLORS = {
  natural: { ambient: 0xffffff, main: 0xffeedd, fill: 0xdae2ed, mainInt: 1.5, ambInt: 0.8 },
  warm: { ambient: 0xffddaa, main: 0xffaa55, fill: 0xaa5533, mainInt: 2.0, ambInt: 0.5 },
  cool: { ambient: 0xaaddff, main: 0x88bbff, fill: 0x335588, mainInt: 1.8, ambInt: 0.6 },
  studio: { ambient: 0xffffff, main: 0xffffff, fill: 0xeeeeee, mainInt: 2.5, ambInt: 1.2 },
  dramatic: { ambient: 0x222222, main: 0xffffff, fill: 0x111111, mainInt: 3.0, ambInt: 0.1 },
  night: { ambient: 0x112244, main: 0x3355aa, fill: 0x0a1122, mainInt: 1.0, ambInt: 0.2 },
  gallery: { ambient: 0xeeeeee, main: 0xfff0dd, fill: 0xcccccc, mainInt: 1.2, ambInt: 0.7 },
  color: { ambient: 0xffaadd, main: 0xdd44ff, fill: 0x44ddff, mainInt: 2.0, ambInt: 0.8 },
  spotlight: { ambient: 0x111111, main: 0xffffff, fill: 0x000000, mainInt: 4.0, ambInt: 0.05 }
};

function init() {
  gsap.registerPlugin(ScrollTrigger);

  const container = document.getElementById('scene-root');

  // Scene setup
  scene = new THREE.Scene();
  // Using a very light grey background to act as the "showroom" walls
  scene.background = new THREE.Color(0xf4f6f8); 
  // Add some fog for depth
  scene.fog = new THREE.Fog(0xf4f6f8, 10, 30);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // Group for all objects to easily move them together if needed
  sceneGroup = new THREE.Group();
  scene.add(sceneGroup);

  // Lighting setup (starts with natural)
  ambientLight = new THREE.AmbientLight(COLORS.natural.ambient, COLORS.natural.ambInt);
  scene.add(ambientLight);

  mainLight = new THREE.DirectionalLight(COLORS.natural.main, COLORS.natural.mainInt);
  mainLight.position.set(5, 10, 5);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.bias = -0.0001;
  scene.add(mainLight);

  fillLight = new THREE.DirectionalLight(COLORS.natural.fill, 0.5);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0xeeeeee, 
    roughness: 0.1, // somewhat reflective
    metalness: 0.1
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  sceneGroup.add(floor);

  // Create products
  createShowroom();

  // Handle Resize
  window.addEventListener('resize', onWindowResize);

  // Setup UI interactions
  setupLightingFilters();
  
  // Setup scroll animations
  setupScrollAnimations();



  // Animation Loop
  renderer.setAnimationLoop(animate);
}

function createShowroom() {
  const productData = [
    { type: 'box', color: 0x8a7a6a, x: -2, z: 0 },
    { type: 'sphere', color: 0x2a3a4a, x: 2, z: -2 },
    { type: 'cylinder', color: 0xc4a056, x: 0, z: -4 },
  ];

  productData.forEach((data, index) => {
    const group = new THREE.Group();
    group.position.set(data.x, 0, data.z);

    // Pedestal
    const pedGeo = new THREE.CylinderGeometry(0.5, 0.6, 1, 32);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = 0.5;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    group.add(pedestal);

    // Product
    let geo;
    if (data.type === 'box') geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    else if (data.type === 'sphere') geo = new THREE.SphereGeometry(0.4, 32, 32);
    else geo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32);

    const mat = new THREE.MeshPhysicalMaterial({ 
      color: data.color, 
      metalness: 0.5, 
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const product = new THREE.Mesh(geo, mat);
    product.position.y = 1.5;
    product.castShadow = true;
    
    group.add(product);
    sceneGroup.add(group);
    
    products.push({ mesh: product, group: group, initialY: 1.5 });
  });
}

function setupLightingFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active class
      buttons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const lightType = e.target.dataset.light;
      const config = COLORS[lightType];

      if (config) {
        // Animate lighting transition
        gsap.to(ambientLight.color, { r: new THREE.Color(config.ambient).r, g: new THREE.Color(config.ambient).g, b: new THREE.Color(config.ambient).b, duration: 1 });
        gsap.to(ambientLight, { intensity: config.ambInt, duration: 1 });
        
        gsap.to(mainLight.color, { r: new THREE.Color(config.main).r, g: new THREE.Color(config.main).g, b: new THREE.Color(config.main).b, duration: 1 });
        gsap.to(mainLight, { intensity: config.mainInt, duration: 1 });
        
        gsap.to(fillLight.color, { r: new THREE.Color(config.fill).r, g: new THREE.Color(config.fill).g, b: new THREE.Color(config.fill).b, duration: 1 });
        
        // Update background color based on dramatic/night settings
        let targetBg = 0xf4f6f8;
        if(lightType === 'dramatic' || lightType === 'spotlight') targetBg = 0x111111;
        if(lightType === 'night') targetBg = 0x050a14;
        
        gsap.to(scene.background, { r: new THREE.Color(targetBg).r, g: new THREE.Color(targetBg).g, b: new THREE.Color(targetBg).b, duration: 1 });
        gsap.to(scene.fog.color, { r: new THREE.Color(targetBg).r, g: new THREE.Color(targetBg).g, b: new THREE.Color(targetBg).b, duration: 1 });
      }
    });
  });
}

function setupScrollAnimations() {
  // Hero to Filter Panel Transition
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      // Move camera forward and pan slightly
      camera.position.z = 8 - (self.progress * 4);
      camera.position.x = self.progress * 2;
      camera.lookAt(0, 1.5, 0);
    }
  });

  // Filter to Product Details
  ScrollTrigger.create({
    trigger: '#filter-section',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      // Focus on the first product
      camera.position.z = 4 - (self.progress * 2);
      camera.position.x = 2 - (self.progress * 4);
      camera.lookAt(-2, 1.5, 0);
    }
  });
  
  // Parallax elements in DOM
  gsap.utils.toArray('.parallax-text').forEach(el => {
    gsap.to(el, {
      y: -50,
      opacity: 0,
      scrollTrigger: {
        trigger: el,
        start: 'top center',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  // Reveal animations for collections
  gsap.utils.toArray('.gs-reveal').forEach(el => {
    gsap.fromTo(el, 
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        }
      }
    );
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
  const t = time * 0.001;
  
  // Idle animations for products
  products.forEach((p, index) => {
    p.mesh.rotation.y = t * 0.5 + index;
    p.mesh.position.y = p.initialY + Math.sin(t * 2 + index) * 0.1;
  });

  renderer.render(scene, camera);
}

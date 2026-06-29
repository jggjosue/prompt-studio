// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. THREE.JS SETUP
// ==========================================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0d1117, 0.015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Initial camera position
camera.position.set(0, 10, 50);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ==========================================
// 2. SCENE CONTENT (MOUNTAINS, TRAIL, ETC)
// ==========================================

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x4ade80, 2, 100);
pointLight.position.set(0, 20, 0);
scene.add(pointLight);

// Generate Mountains (Simple procedural terrain)
const terrainGeometry = new THREE.PlaneGeometry(200, 200, 64, 64);
const positionAttribute = terrainGeometry.attributes.position;
const vertex = new THREE.Vector3();

// Create some hills
for (let i = 0; i < positionAttribute.count; i++) {
  vertex.fromBufferAttribute(positionAttribute, i);
  // Simple height generation
  const dist = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
  let h = Math.sin(vertex.x * 0.1) * Math.cos(vertex.y * 0.1) * 10;
  // Add some spikes for mountains far away
  if(Math.abs(vertex.x) > 20 || Math.abs(vertex.y) > 20) {
      h += Math.random() * 15;
  }
  positionAttribute.setZ(i, h);
}
terrainGeometry.computeVertexNormals();

const terrainMaterial = new THREE.MeshStandardMaterial({
  color: 0x111827,
  wireframe: true, // Gives a cool tech/grid look
  transparent: true,
  opacity: 0.6
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.position.y = -5;
scene.add(terrain);

// Glowing Trail (Path)
const pathPoints = [];
for (let i = 0; i < 50; i++) {
  pathPoints.push(new THREE.Vector3(
    Math.sin(i * 0.2) * 15, // x
    (i * 0.2),              // y
    50 - (i * 3)            // z (moves away from camera)
  ));
}
const pathCurve = new THREE.CatmullRomCurve3(pathPoints);
const tubeGeometry = new THREE.TubeGeometry(pathCurve, 100, 0.5, 8, false);
const tubeMaterial = new THREE.MeshBasicMaterial({
  color: 0x4ade80,
  wireframe: true,
  transparent: true,
  opacity: 0.8
});
const trail = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(trail);

// Add some markers along the trail
const markerGeo = new THREE.OctahedronGeometry(1);
const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const markerPositions = [0.2, 0.5, 0.8]; // Percentages along path
markerPositions.forEach(p => {
    const pt = pathCurve.getPointAt(p);
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(pt);
    marker.position.y += 2; // Hover slightly
    scene.add(marker);
});


// Particles (Fireflies / Snow)
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 150;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
  size: 0.2,
  color: 0x4ade80,
  transparent: true,
  opacity: 0.6
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// ==========================================
// 3. ANIMATION & SCROLL LOGIC
// ==========================================

// Animation Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Gentle float for markers
  scene.children.forEach(child => {
      if(child.geometry === markerGeo) {
          child.rotation.y += 0.01;
          child.rotation.x += 0.005;
      }
  });

  // Particle drift
  particlesMesh.rotation.y = elapsedTime * 0.02;

  renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// GSAP ScrollTrigger - Camera Movement
// We map the scroll progress to the camera moving along the path
ScrollTrigger.create({
  trigger: ".scroll-container",
  start: "top top",
  end: "bottom bottom",
  scrub: 1, // Smooth scrubbing
  onUpdate: (self) => {
    const progress = self.progress;
    
    // Calculate position on the curve
    // We only traverse up to 0.9 so we don't fall off the end
    const pt = pathCurve.getPointAt(progress * 0.9);
    
    // Look ahead point
    const lookPt = pathCurve.getPointAt(Math.min(1.0, (progress * 0.9) + 0.1));

    // Move camera
    camera.position.x = pt.x;
    camera.position.y = pt.y + 5; // Offset above path
    camera.position.z = pt.z;

    // Look at next point
    camera.lookAt(lookPt.x, lookPt.y, lookPt.z);
    
    // Add slight rotation based on scroll for dynamic feel
    camera.rotation.z = (pt.x - lookPt.x) * 0.05;
  }
});

// HTML Parallax Elements
gsap.utils.toArray('[data-parallax]').forEach(el => {
  const speed = parseFloat(el.getAttribute('data-parallax'));
  gsap.to(el, {
    y: () => (ScrollTrigger.maxScroll(window) * speed),
    ease: "none",
    scrollTrigger: {
      trigger: ".scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: true
    }
  });
});

// Simple reveal animations for sections
gsap.utils.toArray('.section-content').forEach(section => {
  gsap.from(section, {
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });
});

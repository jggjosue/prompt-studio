import * as THREE from 'three';

// ---- DOM Elements ----
const container = document.getElementById('canvas-container');
const captionPanel = document.getElementById('caption-panel');
const clipTitle = document.getElementById('clip-title');
const clipDesc = document.getElementById('clip-desc');
const scrubberUI = document.getElementById('scrubber-ui');
const videoScrub = document.getElementById('video-scrub');
const btnFullscreen = document.getElementById('btn-fullscreen');

const btnFallback = document.getElementById('btn-fallback');
const btnCloseGallery = document.getElementById('btn-close-gallery');
const fallbackGallery = document.getElementById('fallback-gallery');

// Video elements
const videos = [
  document.getElementById('vid1'),
  document.getElementById('vid2'),
  document.getElementById('vid3')
];

// Data for panels
const galleryData = [
  { title: 'Solitude', desc: 'A study in light and shadow.', video: videos[0] },
  { title: "Nature's Pulse", desc: 'Vibrant energy in stillness.', video: videos[1] },
  { title: 'Urban Echoes', desc: 'Concrete geometry.', video: videos[2] }
];

// Check user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Scene Setup ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0b0a);
scene.fog = new THREE.Fog(0x0c0b0a, 5, 20);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// ---- Lighting ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// ---- Geometry & Materials (Fabric Panels) ----
const panels = [];
const textures = [];

// Curved plane using cylinder geometry
const panelGeo = new THREE.CylinderGeometry(5, 5, 4, 32, 1, true, -Math.PI / 6, Math.PI / 3);

galleryData.forEach((data, i) => {
  const texture = new THREE.VideoTexture(data.video);
  texture.colorSpace = THREE.SRGBColorSpace;
  textures.push(texture);

  const mat = new THREE.MeshBasicMaterial({ 
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });

  const mesh = new THREE.Mesh(panelGeo, mat);
  
  // Position them in a slight arc
  const angle = (i - 1) * (Math.PI / 4);
  mesh.position.x = Math.sin(angle) * 4;
  mesh.position.z = Math.cos(angle) * 4 - 4;
  mesh.rotation.y = angle;
  
  // Custom data
  mesh.userData = {
    index: i,
    data: data,
    basePos: mesh.position.clone(),
    baseRot: mesh.rotation.clone(),
    baseOpacity: 0.7
  };

  scene.add(mesh);
  panels.push(mesh);
  
  // Play videos silently
  data.video.play().catch(e => console.log('Autoplay prevented:', e));
});

// ---- Raycasting & Interaction ----
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredPanel = null;
let activePanel = null;

// Virtual camera target for GSAP
const cameraTarget = {
  x: 0, y: 0, z: 8,
  lookX: 0, lookY: 0, lookZ: 0
};

window.addEventListener('mousemove', (e) => {
  if (activePanel || prefersReducedMotion) return; // Don't process hover if fully viewing one

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(panels);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (hoveredPanel !== object) {
      if (hoveredPanel) gsap.to(hoveredPanel.material, { opacity: hoveredPanel.userData.baseOpacity, duration: 0.5 });
      hoveredPanel = object;
      document.body.style.cursor = 'pointer';
      
      // Expand / Brighten
      gsap.to(hoveredPanel.material, { opacity: 1.0, duration: 0.5 });
      gsap.to(hoveredPanel.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.8, ease: 'power2.out' });
      
      // Update UI
      clipTitle.textContent = hoveredPanel.userData.data.title;
      clipDesc.textContent = hoveredPanel.userData.data.desc;
      captionPanel.classList.add('active');
    }
  } else {
    if (hoveredPanel) {
      gsap.to(hoveredPanel.material, { opacity: hoveredPanel.userData.baseOpacity, duration: 0.5 });
      gsap.to(hoveredPanel.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'power2.out' });
      hoveredPanel = null;
      document.body.style.cursor = 'default';
      captionPanel.classList.remove('active');
    }
  }
  
  // Parallax effect
  if (!activePanel) {
    gsap.to(cameraTarget, {
      x: mouse.x * 0.5,
      y: mouse.y * 0.5,
      duration: 1
    });
  }
});

window.addEventListener('click', () => {
  if (prefersReducedMotion) return;

  if (hoveredPanel && !activePanel) {
    // Zoom in
    activePanel = hoveredPanel;
    const p = activePanel.position;
    
    gsap.to(cameraTarget, {
      x: p.x * 0.8,
      y: p.y,
      z: p.z + 4,
      lookX: p.x,
      lookY: p.y,
      lookZ: p.z,
      duration: 1.5,
      ease: 'power3.inOut'
    });
    
    scrubberUI.classList.remove('hidden');
    
  } else if (activePanel) {
    // Zoom out
    activePanel = null;
    gsap.to(cameraTarget, {
      x: 0, y: 0, z: 8,
      lookX: 0, lookY: 0, lookZ: 0,
      duration: 1.5,
      ease: 'power3.inOut'
    });
    
    scrubberUI.classList.add('hidden');
  }
});

// Fullscreen logic
btnFullscreen.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent zoom out
  if (activePanel) {
    const vid = activePanel.userData.data.video;
    if (vid.requestFullscreen) {
      vid.requestFullscreen();
    } else if (vid.webkitRequestFullscreen) {
      vid.webkitRequestFullscreen();
    }
  }
});

// Scrubber logic
videoScrub.addEventListener('input', (e) => {
  if (activePanel) {
    const vid = activePanel.userData.data.video;
    const time = (e.target.value / 100) * vid.duration;
    if (!isNaN(time)) vid.currentTime = time;
  }
});

// ---- Animation Loop ----
const lookAtVec = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  if (!prefersReducedMotion) {
    camera.position.lerp(new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z), 0.05);
    lookAtVec.lerp(new THREE.Vector3(cameraTarget.lookX, cameraTarget.lookY, cameraTarget.lookZ), 0.05);
    camera.lookAt(lookAtVec);
  }
  
  // Update scrubber position
  if (activePanel) {
    const vid = activePanel.userData.data.video;
    if (vid.duration) {
      videoScrub.value = (vid.currentTime / vid.duration) * 100;
    }
  }

  renderer.render(scene, camera);
}
animate();

// ---- Fallback UI ----
btnFallback.addEventListener('click', () => {
  fallbackGallery.classList.remove('hidden');
});

btnCloseGallery.addEventListener('click', () => {
  fallbackGallery.classList.add('hidden');
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

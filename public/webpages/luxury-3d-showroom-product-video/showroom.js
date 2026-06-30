import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// ---- DOM Elements ----
const container = document.getElementById('canvas-container');
const btnDetail = document.getElementById('btn-detail');
const btnCloseVideo = document.getElementById('btn-close-video');
const videoPanel = document.getElementById('video-panel');
const productVideo = document.getElementById('product-video');
const productInfo = document.getElementById('product-info');

const btnFallback = document.getElementById('btn-fallback');
const btnCloseFallback = document.getElementById('btn-close-fallback');
const fallbackView = document.getElementById('fallback-view');

// Check user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Scene Setup ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.05);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
// Wide initial shot
const initialCameraPos = new THREE.Vector3(0, 1.5, 6);
const macroCameraPos = new THREE.Vector3(-1.5, 0.5, 2.5);
camera.position.copy(initialCameraPos);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go too far below ground
controls.target.set(0, 0.5, 0);

// ---- Lighting ----
RectAreaLightUniformsLib.init();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 15);
spotLight.position.set(2, 5, 2);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.8;
spotLight.decay = 2;
spotLight.distance = 20;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

// Fill light for luxury reflections
const rectLight = new THREE.RectAreaLight(0xd4af37, 2, 4, 4);
rectLight.position.set(-3, 2, 3);
rectLight.lookAt(0, 0.5, 0);
scene.add(rectLight);

// ---- Geometry & Materials ----
// 1. Pedestal
const pedestalGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.2, 64);
const pedestalMat = new THREE.MeshStandardMaterial({ 
  color: 0x111111,
  roughness: 0.8,
  metalness: 0.2
});
const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
pedestal.position.y = -0.1;
pedestal.receiveShadow = true;
scene.add(pedestal);

// Floor
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({ 
  color: 0x050505,
  roughness: 0.1,
  metalness: 0.5
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.2;
floor.receiveShadow = true;
scene.add(floor);

// 2. The Luxury Object (Abstract faceted geometry)
// Using an Icosahedron to look like a precious cut stone or modern artifact
const objectGeo = new THREE.IcosahedronGeometry(0.6, 1);
const objectMat = new THREE.MeshPhysicalMaterial({
  color: 0x0a0a0a,
  metalness: 0.9,
  roughness: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  flatShading: true // Gives it facets
});
const luxuryObject = new THREE.Mesh(objectGeo, objectMat);
luxuryObject.position.y = 0.8;
luxuryObject.castShadow = true;
luxuryObject.receiveShadow = true;
scene.add(luxuryObject);

// Inner glow sphere
const glowGeo = new THREE.SphereGeometry(0.3, 32, 32);
const glowMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
const glowSphere = new THREE.Mesh(glowGeo, glowMat);
glowSphere.position.copy(luxuryObject.position);
scene.add(glowSphere);

// ---- Animation Loop ----
const clock = new THREE.Clock();
let isMacroMode = false;

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Slow rotation
  if (!prefersReducedMotion) {
    luxuryObject.rotation.y += 0.2 * delta;
    luxuryObject.rotation.x = Math.sin(time * 0.5) * 0.1;
    
    // Subtle float
    luxuryObject.position.y = 0.8 + Math.sin(time) * 0.05;
    glowSphere.position.copy(luxuryObject.position);
    
    // Pulse light
    spotLight.intensity = 15 + Math.sin(time * 2) * 2;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ---- Interactions ----

btnDetail.addEventListener('click', () => {
  if (prefersReducedMotion) {
    // Jump instantly
    camera.position.copy(macroCameraPos);
    controls.target.copy(luxuryObject.position);
    openVideoPanel();
    return;
  }

  isMacroMode = true;
  gsap.to(camera.position, {
    x: macroCameraPos.x,
    y: macroCameraPos.y,
    z: macroCameraPos.z,
    duration: 2,
    ease: "power3.inOut",
    onUpdate: () => controls.update()
  });

  gsap.to(controls.target, {
    x: luxuryObject.position.x,
    y: luxuryObject.position.y,
    z: luxuryObject.position.z,
    duration: 2,
    ease: "power3.inOut"
  });

  gsap.to(productInfo, {
    opacity: 0,
    x: -50,
    duration: 1,
    pointerEvents: 'none'
  });

  setTimeout(openVideoPanel, 1000);
});

btnCloseVideo.addEventListener('click', () => {
  isMacroMode = false;
  
  if (prefersReducedMotion) {
    camera.position.copy(initialCameraPos);
    controls.target.set(0, 0.5, 0);
    closeVideoPanel();
    return;
  }

  closeVideoPanel();

  gsap.to(camera.position, {
    x: initialCameraPos.x,
    y: initialCameraPos.y,
    z: initialCameraPos.z,
    duration: 2,
    ease: "power3.inOut",
    onUpdate: () => controls.update()
  });

  gsap.to(controls.target, {
    x: 0,
    y: 0.5,
    z: 0,
    duration: 2,
    ease: "power3.inOut"
  });

  gsap.to(productInfo, {
    opacity: 1,
    x: 0,
    duration: 1,
    delay: 1,
    pointerEvents: 'auto'
  });
});

function openVideoPanel() {
  videoPanel.classList.add('active');
  productVideo.play().catch(e => { /* console.log("Video play error:", e) */ });
}

function closeVideoPanel() {
  videoPanel.classList.remove('active');
  productVideo.pause();
}

// 2D Fallback
btnFallback.addEventListener('click', () => {
  fallbackView.classList.add('active');
});

btnCloseFallback.addEventListener('click', () => {
  fallbackView.classList.remove('active');
});

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

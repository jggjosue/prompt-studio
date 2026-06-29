import * as THREE from 'three';

// Setup GSAP
gsap.registerPlugin(ScrollTrigger);

// Menu logic
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  hamburger.classList.toggle('active');
});

// Scene Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.05);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 5);
spotLight.position.set(2, 5, 2);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);

const blueLight = new THREE.PointLight(0x4466ff, 2, 10);
blueLight.position.set(-2, -2, 2);
scene.add(blueLight);

const goldLight = new THREE.PointLight(0xffaa44, 2, 10);
goldLight.position.set(2, 2, -2);
scene.add(goldLight);

// Group to hold all objects for global rotation based on mouse (parallax)
const worldGroup = new THREE.Group();
scene.add(worldGroup);

// Materials
const goldMaterial = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  metalness: 1,
  roughness: 0.1,
  envMapIntensity: 2
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.1,
  roughness: 0.05,
  transmission: 0.9,
  ior: 1.5,
  thickness: 0.5,
});

const pedestalMaterial = new THREE.MeshStandardMaterial({
  color: 0x111111,
  metalness: 0.8,
  roughness: 0.2
});

// Objects
const centerPiece = new THREE.Group();
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.15, 32, 64), goldMaterial);
torus.castShadow = true;
const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), glassMaterial);
core.castShadow = true;
centerPiece.add(torus);
centerPiece.add(core);
worldGroup.add(centerPiece);

// Pedestal
const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.5, 32), pedestalMaterial);
pedestal.position.y = -1.5;
pedestal.receiveShadow = true;
worldGroup.add(pedestal);

// Floating particles
const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 200;
const posArray = new Float32Array(particleCount * 3);
for(let i = 0; i < particleCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 10;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02,
  color: 0xd4af37,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
worldGroup.add(particles);

// GSAP Scroll Animations
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
  }
});

tl.to(centerPiece.rotation, { x: Math.PI / 2, y: Math.PI, z: Math.PI / 4 }, 0)
  .to(centerPiece.position, { x: -1.5, y: 0, z: 1 }, 0)
  .to(camera.position, { z: 4 }, 0)
  .to(goldLight.position, { x: -2, intensity: 4 }, 0);

tl.to(centerPiece.rotation, { x: Math.PI, y: Math.PI * 2, z: 0 }, 1)
  .to(centerPiece.position, { x: 1.5, y: -0.5, z: 2 }, 1)
  .to(camera.position, { x: 1, z: 3 }, 1)
  .to(blueLight.intensity, { value: 4 }, 1);

tl.to(centerPiece.rotation, { x: Math.PI * 1.5, y: 0, z: Math.PI / 2 }, 2)
  .to(centerPiece.position, { x: 0, y: 0.2, z: 3.5 }, 2)
  .to(camera.position, { x: 0, z: 5 }, 2)
  .to(spotLight.intensity, { value: 10 }, 2);

tl.to(centerPiece.rotation, { x: Math.PI * 2, y: Math.PI, z: 0 }, 3)
  .to(centerPiece.position, { x: 0, y: 0.5, z: 1 }, 3)
  .to(camera.position, { y: 1, z: 6 }, 3)
  .to(pedestal.position, { y: -0.5 }, 3);

// HTML DOM Parallax
gsap.utils.toArray('.parallax-text').forEach(text => {
  const speed = text.getAttribute('data-speed') || 1;
  gsap.fromTo(text, 
    { y: 50 * speed, opacity: 0 },
    {
      y: -50 * speed,
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: text,
        start: "top 80%",
        end: "bottom 20%",
        scrub: true
      }
    }
  );
});

// Mouse Movement Parallax
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

// Render Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;
  
  worldGroup.rotation.y += 0.05 * (targetX - worldGroup.rotation.y);
  worldGroup.rotation.x += 0.05 * (targetY - worldGroup.rotation.x);

  torus.rotation.x += 0.002;
  torus.rotation.y += 0.003;
  core.rotation.y -= 0.005;
  particles.rotation.y = elapsedTime * 0.05;

  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Variants logic
const variantBtns = document.querySelectorAll('.variant-btn');
variantBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    variantBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    const colorStr = e.target.getAttribute('data-color');
    let targetColor = 0xd4af37;
    if(colorStr === 'silver') targetColor = 0xe3e4e5;
    if(colorStr === 'black') targetColor = 0x111111;

    gsap.to(goldMaterial.color, {
      r: new THREE.Color(targetColor).r,
      g: new THREE.Color(targetColor).g,
      b: new THREE.Color(targetColor).b,
      duration: 1
    });
  });
});

import * as THREE from 'three';

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

// Tracks data for the mixer
const tracks = [
  { name: 'Guitarra', stem: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', color: 0xff4a5a },
  { name: 'Voz', stem: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', color: 0x4a90e2 },
  { name: 'Batería', stem: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', color: 0xf5a623 },
  { name: 'Teclado', stem: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', color: 0x50e3c2 }
];

// Initialize Howler
const howlers = [];
if (typeof Howl !== 'undefined') {
  tracks.forEach((t) => {
    const h = new Howl({ src: [t.stem], html5: true, loop: true, volume: 0.5 });
    howlers.push(h);
  });
}

// ----------------------------------------------------
// THREE.JS SCENE SETUP
// ----------------------------------------------------
const sceneRoot = document.getElementById('scene-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07070a);
scene.fog = new THREE.FogExp2(0x07070a, 0.05);

// Camera Setup
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
// Initial camera position (Home)
camera.position.set(0, 3.5, 12.0);
camera.rotation.set(-0.2, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneRoot.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0x222233, 1.5));

const mainLight = new THREE.SpotLight(0xffeedd, 50);
mainLight.position.set(5, 10, 5);
mainLight.angle = Math.PI / 4;
mainLight.penumbra = 0.5;
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 1024;
mainLight.shadow.mapSize.height = 1024;
scene.add(mainLight);

const accentLight1 = new THREE.PointLight(0xff4a5a, 30, 20);
accentLight1.position.set(-4, 2, -2);
scene.add(accentLight1);

const accentLight2 = new THREE.PointLight(0x4a90e2, 20, 20);
accentLight2.position.set(4, 1, 2);
scene.add(accentLight2);

// ----------------------------------------------------
// 3D MODELS (MOCKUP)
// ----------------------------------------------------

// Floor
const floorMat = new THREE.MeshStandardMaterial({ 
  color: 0x111115, 
  roughness: 0.8, 
  metalness: 0.2 
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Mixing Console Group
const consoleGroup = new THREE.Group();
consoleGroup.position.set(0, 0, 0);
scene.add(consoleGroup);

// Desk
const deskMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.4, metalness: 0.3 });
const desk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 2.5), deskMat);
desk.position.set(0, 1.2, 0);
desk.receiveShadow = true;
desk.castShadow = true;
consoleGroup.add(desk);

// Monitors
const monitorMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 0.2, metalness: 0.8 });
const monitorL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), monitorMat);
monitorL.position.set(-2, 2, -0.5);
monitorL.rotation.y = Math.PI / 6;
monitorL.castShadow = true;
consoleGroup.add(monitorL);

const monitorR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), monitorMat);
monitorR.position.set(2, 2, -0.5);
monitorR.rotation.y = -Math.PI / 6;
monitorR.castShadow = true;
consoleGroup.add(monitorR);

// Channels & Faders
const chanCount = 4;
const channelMeshes = [];
for (let i = 0; i < chanCount; i++) {
  const x = (i - 1.5) * 0.8;
  const faderMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
  const faderBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 1.2), faderMat);
  faderBase.position.set(x, 1.32, 0.5);
  consoleGroup.add(faderBase);

  const knobMat = new THREE.MeshStandardMaterial({ color: tracks[i].color, emissive: tracks[i].color, emissiveIntensity: 0.2 });
  const knob = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.2), knobMat);
  knob.position.set(x, 1.4, 0.5); // y and z will be updated by HTML sliders
  knob.userData = { trackIndex: i, isFader: true };
  consoleGroup.add(knob);
  channelMeshes.push(knob);
}

// Floating Particles (Sound waves / Dust)
const particlesGeo = new THREE.BufferGeometry();
const pCount = 300;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  pPos[i * 3] = (Math.random() - 0.5) * 20;
  pPos[i * 3 + 1] = Math.random() * 8;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 15;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ 
  color: 0xffffff, 
  size: 0.05, 
  transparent: true, 
  opacity: 0.4 
});
const particles = new THREE.Points(particlesGeo, pMat);
scene.add(particles);

// Mastering Rack (Off to the side)
const rackGroup = new THREE.Group();
rackGroup.position.set(4, 0, -3);
rackGroup.rotation.y = -Math.PI / 4;
scene.add(rackGroup);

const rackBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 1.2), deskMat);
rackBody.position.y = 2;
rackGroup.add(rackBody);

// ----------------------------------------------------
// HTML INTERACTION LOGIC
// ----------------------------------------------------
const faderSliders = document.querySelectorAll('.fader-slider');
const faderVals = document.querySelectorAll('.fader-val');

function updateFader3D(trackIndex, value) {
  const knob = channelMeshes.find(c => c.userData.trackIndex === trackIndex);
  if (knob) {
    // map value 0-1 to z position on the desk
    knob.position.z = 0.8 - value * 0.6;
    knob.material.emissiveIntensity = 0.1 + value * 0.5;
  }
}

let audioStarted = false;

faderSliders.forEach((slider, idx) => {
  slider.addEventListener('input', () => {
    const val = Number(slider.value);
    faderVals[idx].textContent = `${Math.round(val * 100)}%`;
    updateFader3D(idx, val);
    
    if (howlers[idx]) {
      howlers[idx].volume(val);
      if (!audioStarted) {
        howlers.forEach(h => h.play());
        audioStarted = true;
      }
    }
  });
  
  // Initialize initial positions
  updateFader3D(idx, Number(slider.value));
});

// ----------------------------------------------------
// GSAP SCROLLTRIGGER (3D CAMERA & PARALLAX)
// ----------------------------------------------------

// Parallax for HTML elements
document.querySelectorAll('.parallax-text, .parallax-panel').forEach(el => {
  const speed = el.dataset.speed || 1;
  gsap.fromTo(el, {
    y: 50 * speed,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      end: "top 20%",
      scrub: 1,
      toggleActions: "play reverse play reverse"
    }
  });
});

// Camera Animations based on sections
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1
  }
});

// Section 1: Home to Studio (Move closer to console)
tl.to(camera.position, { x: -2, y: 3.0, z: 6, ease: "power1.inOut" }, 0)
  .to(camera.rotation, { x: -0.1, y: -0.2, z: 0, ease: "power1.inOut" }, 0);

// Section 2: Studio to Mixing (Focus on faders)
tl.to(camera.position, { x: 0, y: 2.5, z: 2.5, ease: "power1.inOut" }, 0.25)
  .to(camera.rotation, { x: -0.5, y: 0, z: 0, ease: "power1.inOut" }, 0.25);

// Section 3: Mixing to Mastering (Pan to mastering rack)
tl.to(camera.position, { x: 3, y: 2.5, z: 0, ease: "power1.inOut" }, 0.5)
  .to(camera.rotation, { x: -0.2, y: 0.5, z: 0, ease: "power1.inOut" }, 0.5);

// Section 4: Mastering to End (Overview)
tl.to(camera.position, { x: 0, y: 4, z: 10, ease: "power1.inOut" }, 0.75)
  .to(camera.rotation, { x: -0.3, y: 0, z: 0, ease: "power1.inOut" }, 0.75);

// Parallax effect on mouse move
const pointer = new THREE.Vector2();
window.addEventListener('mousemove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ----------------------------------------------------
// RENDER LOOP
// ----------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // Animate particles
  const pArr = particles.geometry.attributes.position.array;
  for (let i = 0; i < pCount; i++) {
    pArr[i * 3 + 1] += Math.sin(time + i) * 0.002;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.05;

  // Add slight mouse parallax to camera
  const targetX = pointer.x * 0.5;
  const targetY = pointer.y * 0.5;
  
  // Only apply subtle rotation on top of GSAP rotation
  scene.rotation.y += (targetX * 0.05 - scene.rotation.y) * 0.05;
  scene.rotation.x += (-targetY * 0.05 - scene.rotation.x) * 0.05;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

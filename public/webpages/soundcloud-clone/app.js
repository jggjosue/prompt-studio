// Three.js Scene Setup
const canvas = document.querySelector('#webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Particles (Audio Waveform Simulation)
const particleCount = 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const color1 = new THREE.Color('#00f2fe');
const color2 = new THREE.Color('#ff0844');

for (let i = 0; i < particleCount; i++) {
  const x = (Math.random() - 0.5) * 20;
  const y = (Math.random() - 0.5) * 10;
  const z = (Math.random() - 0.5) * 10;
  positions[i * 3] = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;

  const mixedColor = color1.clone().lerp(color2, Math.random());
  colors[i * 3] = mixedColor.r;
  colors[i * 3 + 1] = mixedColor.g;
  colors[i * 3 + 2] = mixedColor.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Abstract 3D Objects (Vinyl/Disk simulation)
const diskGeometry = new THREE.TorusGeometry(1.5, 0.4, 16, 100);
const diskMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x4facfe, 
  wireframe: true,
  transparent: true,
  opacity: 0.3
});
const disk1 = new THREE.Mesh(diskGeometry, diskMaterial);
disk1.position.set(3, 1, -2);
scene.add(disk1);

const disk2 = new THREE.Mesh(diskGeometry, diskMaterial);
disk2.position.set(-4, -2, -5);
disk2.material.color = new THREE.Color(0xff0844);
scene.add(disk2);

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse tracking for parallax
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

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Wave motion for particles
  const positions = particles.geometry.attributes.position.array;
  for(let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const x = positions[i3];
    // Create a sine wave effect based on x position and time
    positions[i3 + 1] += Math.sin(elapsedTime + x) * 0.01;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = elapsedTime * 0.05;

  // Rotate disks
  disk1.rotation.x += 0.005;
  disk1.rotation.y += 0.01;
  disk2.rotation.x -= 0.005;
  disk2.rotation.y -= 0.01;

  // Mouse Parallax
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;
  
  particles.rotation.y += 0.05 * (targetX - particles.rotation.y);
  particles.rotation.x += 0.05 * (targetY - particles.rotation.x);

  renderer.render(scene, camera);
}
animate();

// GSAP Scroll Animations
gsap.registerPlugin(ScrollTrigger);

// Camera zoom out on scroll
gsap.to(camera.position, {
  z: 10,
  y: -2,
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});

// Disks movement on scroll
gsap.to(disk1.position, {
  y: -5,
  x: -2,
  scrollTrigger: {
    trigger: "#discover",
    start: "top bottom",
    end: "bottom top",
    scrub: 1
  }
});

gsap.to(disk2.position, {
  y: 5,
  x: 2,
  scrollTrigger: {
    trigger: "#studio",
    start: "top bottom",
    end: "bottom top",
    scrub: 1
  }
});

// UI Elements animations
gsap.utils.toArray('.glass').forEach(element => {
  gsap.from(element, {
    y: 50,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      ease: "power2.out"
    }
  });
});

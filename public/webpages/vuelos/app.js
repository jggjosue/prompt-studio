import * as THREE from 'three';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════
   SCENE / CAMERA / RENDERER
════════════════════════════════════════════ */
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 200);
// Initial camera position (close up)
camera.position.set(0, 0, 1.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// No OrbitControls, camera is controlled by scroll

/* ════════════════════════════════════════════
   ASSETS (Globe, Airplane, Particles)
════════════════════════════════════════════ */
const GLOBE_R = 1.0;
const sceneGroup = new THREE.Group(); // Group for all objects to animate together
scene.add(sceneGroup);

// GLOBE TEXTURE
function buildGlobeTexture() {
  const W = 2048, H = 1024;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const cx = cv.getContext('2d');

  cx.fillStyle = '#030e1e';
  cx.fillRect(0, 0, W, H);

  cx.strokeStyle = 'rgba(30,100,180,0.18)';
  cx.lineWidth = 0.8;
  for (let lat = -80; lat <= 80; lat += 15) {
    const y = (1 - (lat + 90) / 180) * H;
    cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke();
  }
  for (let lon = 0; lon < 360; lon += 15) {
    const x = lon / 360 * W;
    cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke();
  }

  function land(paths) {
    cx.fillStyle = '#0e2e1a';
    paths.forEach(p => { cx.beginPath(); p(); cx.fill(); });
  }
  const lx = (lon) => (lon + 180) / 360 * W;
  const ly = (lat) => (90 - lat) / 180 * H;

  land([
    () => { cx.moveTo(lx(-138), ly(60)); cx.lineTo(lx(-60), ly(60)); cx.lineTo(lx(-55),  ly(45)); cx.lineTo(lx(-68), ly(25)); cx.lineTo(lx(-90),  ly(15)); cx.lineTo(lx(-120),ly(15)); cx.lineTo(lx(-138), ly(35)); cx.closePath(); }, // NA
    () => { cx.moveTo(lx(-80), ly(10));  cx.lineTo(lx(-50), ly(10)); cx.lineTo(lx(-35), ly(-5));  cx.lineTo(lx(-35), ly(-35)); cx.lineTo(lx(-55), ly(-55)); cx.lineTo(lx(-75), ly(-40)); cx.lineTo(lx(-80), ly(-15)); cx.closePath(); }, // SA
    () => { cx.moveTo(lx(-10), ly(36)); cx.lineTo(lx(40),  ly(36)); cx.lineTo(lx(40),  ly(60)); cx.lineTo(lx(25),  ly(70)); cx.lineTo(lx(-5),  ly(60)); cx.closePath(); }, // EU
    () => { cx.moveTo(lx(-18), ly(35)); cx.lineTo(lx(52),  ly(35)); cx.lineTo(lx(52),  ly(10)); cx.lineTo(lx(42),  ly(-5)); cx.lineTo(lx(35),  ly(-35));cx.lineTo(lx(18),  ly(-35)); cx.lineTo(lx(10),  ly(-10));cx.lineTo(lx(-18), ly(5)); cx.closePath(); }, // AF
    () => { cx.moveTo(lx(26),  ly(68)); cx.lineTo(lx(190), ly(70)); cx.lineTo(lx(145), ly(40)); cx.lineTo(lx(130), ly(30)); cx.lineTo(lx(100), ly(0));  cx.lineTo(lx(60),  ly(20)); cx.lineTo(lx(40),  ly(36)); cx.lineTo(lx(26),  ly(42)); cx.closePath(); }, // AS
  ]);

  return new THREE.CanvasTexture(cv);
}

const globeMesh = new THREE.Mesh(
  new THREE.SphereGeometry(GLOBE_R, 64, 64),
  new THREE.MeshPhongMaterial({
    map: buildGlobeTexture(),
    specular: new THREE.Color(0x112244),
    shininess: 20,
  })
);
sceneGroup.add(globeMesh);

// Atmosphere
const atmos = new THREE.Mesh(
  new THREE.SphereGeometry(GLOBE_R * 1.05, 64, 64),
  new THREE.MeshPhongMaterial({
    color: 0x1144ff, transparent: true, opacity: 0.04,
    side: THREE.BackSide, depthWrite: false
  })
);
sceneGroup.add(atmos);

// Stars
const count = 2000;
const pos = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  const r = 10 + Math.random() * 20;
  const u = Math.random(), v = Math.random();
  const phi = Math.acos(2 * u - 1);
  const theta = 2 * Math.PI * v;
  pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
  pos[i*3+1] = r * Math.cos(phi);
  pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 });
const stars = new THREE.Points(starGeo, starMat);
sceneGroup.add(stars);

// Airplane Proxy (Simple Mesh since we don't have a model)
const airplaneGrp = new THREE.Group();
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8), new THREE.MeshStandardMaterial({color: 0xffffff}));
body.rotation.z = Math.PI / 2;
const wing = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.12), new THREE.MeshStandardMaterial({color: 0xffffff}));
wing.position.x = -0.02;
airplaneGrp.add(body, wing);
airplaneGrp.position.set(0, 0, GLOBE_R + 0.2); // Positioned above globe
sceneGroup.add(airplaneGrp);

/* ════════════════════════════════════════════
   ROUTES
════════════════════════════════════════════ */
function latLonToVec3(lat, lon, r = GLOBE_R) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

const routesGrp = new THREE.Group();
sceneGroup.add(routesGrp);
// Initially hidden, will animate in via ScrollTrigger
routesGrp.scale.set(0, 0, 0);

const ROUTES = [
  { from:[40.71,-74.01], to:[35.68,139.69], color:0x00d4ff }, // JFK -> NRT
  { from:[51.51,-0.13], to:[40.71,-74.01], color:0xff69b4 },
  { from:[-23.55,-46.63], to:[48.86,2.35], color:0x00ff88 },
];

const arcObjects = [];
ROUTES.forEach((route, idx) => {
  const from = latLonToVec3(...route.from);
  const to = latLonToVec3(...route.to);
  const mid = from.clone().add(to).normalize().multiplyScalar(GLOBE_R * 1.3);
  const curve = new THREE.CatmullRomCurve3([from, mid, to]);
  
  const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.003, 6, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: route.color, transparent: true, opacity: 0.4 });
  routesGrp.add(new THREE.Mesh(tubeGeo, tubeMat));

  const particle = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  routesGrp.add(particle);

  arcObjects.push({ curve, particle, progress: Math.random() });
});

/* ════════════════════════════════════════════
   LIGHTS
════════════════════════════════════════════ */
scene.add(new THREE.AmbientLight(0x223355, 3));
const sun = new THREE.DirectionalLight(0xffeedd, 3.5);
sun.position.set(5, 3, 4);
scene.add(sun);


/* ════════════════════════════════════════════
   GSAP SCROLL ANIMATIONS
════════════════════════════════════════════ */

// Reset initial positions
sceneGroup.rotation.y = -Math.PI / 4;
camera.position.set(0.5, 0.5, 1.2); 

// Create a main ScrollTrigger timeline attached to the whole container
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '#scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1, // Smooth scrubbing
  }
});

// Section 1 (Hero) to Section 2 (Explore)
// Move camera away to see full globe, rotate globe to show routes
tl.to(camera.position, { z: 3.5, x: 0, y: 0.5, ease: 'power2.inOut' }, 0);
tl.to(sceneGroup.rotation, { y: Math.PI / 2, ease: 'power1.inOut' }, 0);
// Pop in routes
tl.to(routesGrp.scale, { x: 1, y: 1, z: 1, duration: 0.1 }, 0.2);

// Section 2 (Explore) to Section 3 (Details)
// Orbit globe
tl.to(sceneGroup.rotation, { y: Math.PI, ease: 'none' }, 0.4);
tl.to(camera.position, { x: -1, y: 0.2, z: 2.8, ease: 'power2.inOut' }, 0.4);

// Section 3 (Details) to Section 4 (Booking)
tl.to(sceneGroup.rotation, { y: Math.PI * 1.5, ease: 'none' }, 0.6);
tl.to(camera.position, { x: 0, y: -0.2, z: 3.2, ease: 'power2.inOut' }, 0.6);

// Section 4 (Booking) to Section 5 (Confirmation)
// Zoom out completely
tl.to(sceneGroup.rotation, { y: Math.PI * 2, ease: 'none' }, 0.8);
tl.to(camera.position, { z: 5, ease: 'power2.inOut' }, 0.8);


/* ════════════════════════════════════════════
   RENDER LOOP
════════════════════════════════════════════ */
function animate() {
  requestAnimationFrame(animate);

  // Animate particles on routes
  arcObjects.forEach(obj => {
    obj.progress = (obj.progress + 0.002) % 1;
    const pos = obj.curve.getPoint(obj.progress);
    obj.particle.position.copy(pos);
  });

  // Keep airplane slowly floating
  airplaneGrp.position.y = Math.sin(Date.now() * 0.002) * 0.02;
  airplaneGrp.rotation.x = Math.sin(Date.now() * 0.001) * 0.05;

  renderer.render(scene, camera);
}
animate();

/* ════════════════════════════════════════════
   RESIZE
════════════════════════════════════════════ */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// UI Interactivity (Simulated)
document.querySelectorAll('.seat.available').forEach(seat => {
  seat.addEventListener('click', (e) => {
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    e.target.classList.add('selected');
  });
});

document.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('click', (e) => {
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
    e.currentTarget.classList.add('active');
  });
});

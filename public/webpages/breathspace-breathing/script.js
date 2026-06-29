// Smooth Scrolling for Navigation
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

// Audio Player functionality
const playAmbientBtn = document.getElementById('play-ambient');
let isPlaying = false;

playAmbientBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    const svg = playAmbientBtn.querySelector('svg');
    if (isPlaying) {
        // Pause icon
        svg.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
        // Here you would play the audio
    } else {
        // Play icon
        svg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
        // Here you would pause the audio
    }
});

// Breathing UI Logic
const breathText = document.getElementById('breath-text');
const breathStates = ['Inhala', 'Sostén', 'Exhala', 'Descansa'];
let currentState = 0;

setInterval(() => {
    currentState = (currentState + 1) % breathStates.length;
    breathText.style.opacity = 0;
    setTimeout(() => {
        breathText.innerText = breathStates[currentState];
        breathText.style.opacity = 1;
    }, 500);
}, 4000); // Change state every 4 seconds to match the 8s breathing circle animation

// ----------------------------------------------------
// THREE.JS SCENE SETUP
// ----------------------------------------------------
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0d131a, 0.035); // Slightly denser soft fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x8cbbe0, 1.5, 50); // Accent light
pointLight1.position.set(2, 2, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 50);
pointLight2.position.set(-2, -2, -2);
scene.add(pointLight2);

const movingLight = new THREE.PointLight(0xa5d8ff, 1, 30);
scene.add(movingLight);

// Objects
const objects = [];
const rings = [];

// Main central sphere (represents breath)
const mainMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8cbbe0,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.9, // glass-like
    thickness: 0.5,
    transparent: true,
    opacity: 0.7
});
const mainGeometry = new THREE.SphereGeometry(2, 64, 64);
const mainSphere = new THREE.Mesh(mainGeometry, mainMaterial);
mainSphere.position.set(0, 0, -10);
scene.add(mainSphere);
objects.push({ mesh: mainSphere, type: 'main' });

// Add meditative floating rings
const ringMat = new THREE.MeshBasicMaterial({ color: 0x8cbbe0, transparent: true, opacity: 0.15, side: THREE.DoubleSide, wireframe: true });
for(let i=1; i<=3; i++) {
    const ringGeo = new THREE.TorusGeometry(2 * i, 0.02, 16, 100);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, -10);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    rings.push({ mesh: ring, offset: i });
}

// Floating particles/orbs
const particleGeo = new THREE.SphereGeometry(0.08, 16, 16);
const particleMat = new THREE.MeshBasicMaterial({ color: 0x8cbbe0, transparent: true, opacity: 0.5 });

for (let i = 0; i < 80; i++) {
    const particle = new THREE.Mesh(particleGeo, particleMat);
    particle.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30 - 10
    );
    scene.add(particle);
    objects.push({ mesh: particle, type: 'particle', speed: Math.random() * 0.02 + 0.01, orbit: Math.random() * Math.PI * 2 });
}

// --- STARS ---
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2000;
const posArray = new Float32Array(starsCount * 3);
for(let i = 0; i < starsCount * 3; i++) {
    // Spread stars widely
    posArray[i] = (Math.random() - 0.5) * 150;
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
});
const starMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starMesh);

// --- GALAXY ---
const galaxyGeometry = new THREE.BufferGeometry();
const galaxyCount = 5000;
const galaxyPos = new Float32Array(galaxyCount * 3);
const galaxyColors = new Float32Array(galaxyCount * 3);

const colorInside = new THREE.Color(0xff6030); // Warm core
const colorOutside = new THREE.Color(0x1b3984); // Blue edges

for(let i = 0; i < galaxyCount; i++) {
    // Math for a simple spiral galaxy
    const radius = Math.random() * 30;
    const spinAngle = radius * 0.2;
    const branchAngle = ((i % 3) / 3) * Math.PI * 2;

    const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2;
    const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2;
    const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2;

    const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
    const y = randomY; // mostly flat
    const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    galaxyPos[i*3] = x;
    galaxyPos[i*3+1] = y;
    galaxyPos[i*3+2] = z - 30; // Push it back

    // Mix colors based on radius
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / 30);

    galaxyColors[i*3] = mixedColor.r;
    galaxyColors[i*3+1] = mixedColor.g;
    galaxyColors[i*3+2] = mixedColor.b;
}

galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

const galaxyMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
});
const galaxyMesh = new THREE.Points(galaxyGeometry, galaxyMaterial);
galaxyMesh.rotation.x = 0.2; // Tilt it slightly
galaxyMesh.rotation.z = -0.2;
scene.add(galaxyMesh);

// --- SUN ---
const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffd38c }); // Warm sun color
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(30, 20, -80);
scene.add(sunMesh);

// Sun Glow / Aura
const sunGlowGeo = new THREE.PlaneGeometry(40, 40);
const sunGlowMat = new THREE.MeshBasicMaterial({
    color: 0xff8c00,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
});
// Using a circular gradient texture would be ideal, but we can simulate soft edges with distance if needed.
// For now, a simple additive plane gives a nice glow. We'll make it face the camera in animate loop.
const sunGlowMesh = new THREE.Mesh(sunGlowGeo, sunGlowMat);
sunGlowMesh.position.copy(sunMesh.position);
scene.add(sunGlowMesh);

// --- COMETS ---
const comets = [];
const cometGeo = new THREE.CylinderGeometry(0.02, 0.2, 5, 8);
cometGeo.rotateX(Math.PI / 2); // Align with Z axis for movement
const cometMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.8,
    blending: THREE.AdditiveBlending 
});

for(let i = 0; i < 5; i++) {
    const comet = new THREE.Mesh(cometGeo, cometMat);
    // Start far away and to the side
    comet.position.set(
        (Math.random() - 0.5) * 100,
        Math.random() * 50,
        -50 + Math.random() * 20
    );
    // Point it in a direction
    comet.lookAt(0, 0, 50); // Fly towards the camera generally
    scene.add(comet);
    
    comets.push({
        mesh: comet,
        speed: 0.5 + Math.random() * 1.5,
        resetTimer: Math.random() * 500
    });
}


// Background soft waves - Bottom
const waveGeo = new THREE.PlaneGeometry(60, 60, 40, 40);
const waveMat = new THREE.MeshBasicMaterial({ 
    color: 0x141e2d, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.12 
});
const waveMesh = new THREE.Mesh(waveGeo, waveMat);
waveMesh.rotation.x = -Math.PI / 2;
waveMesh.position.y = -6;
scene.add(waveMesh);

// Background soft waves - Top (Ceiling)
const waveMeshTop = new THREE.Mesh(waveGeo, waveMat);
waveMeshTop.rotation.x = Math.PI / 2;
waveMeshTop.position.y = 8;
scene.add(waveMeshTop);

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse movement for slight parallax effect in 3D
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

    // Smooth mouse follow
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    camera.position.x += 0.05 * (targetX - camera.position.x);
    camera.position.y += 0.05 * (-targetY - camera.position.y);
    camera.lookAt(scene.position);

    // Moving light animation
    movingLight.position.x = Math.sin(elapsedTime * 0.5) * 10;
    movingLight.position.z = Math.cos(elapsedTime * 0.3) * 10 - 5;
    movingLight.position.y = Math.sin(elapsedTime * 0.4) * 5;

    // Animate main sphere
    mainSphere.position.y = Math.sin(elapsedTime * 0.5) * 0.5 - 10;
    mainSphere.rotation.y = elapsedTime * 0.1;
    mainSphere.rotation.x = elapsedTime * 0.05;
    
    // Simulate breathing on main sphere
    const scale = 1 + Math.sin(elapsedTime * 0.8) * 0.15;
    mainSphere.scale.set(scale, scale, scale);

    // Animate meditative rings
    rings.forEach((ringObj) => {
        const rScale = 1 + Math.sin(elapsedTime * 0.8 - ringObj.offset) * 0.1;
        ringObj.mesh.scale.set(rScale, rScale, rScale);
        ringObj.mesh.rotation.z = elapsedTime * 0.05 * ringObj.offset;
        ringObj.mesh.position.y = Math.sin(elapsedTime * 0.5) * 0.5 - 10;
    });

    // Animate particles
    objects.forEach(obj => {
        if (obj.type === 'particle') {
            obj.mesh.position.y += Math.sin(elapsedTime * obj.speed + obj.orbit) * 0.02;
            obj.mesh.position.x += Math.cos(elapsedTime * obj.speed + obj.orbit) * 0.02;
            obj.mesh.position.z += Math.sin(elapsedTime * obj.speed * 0.5) * 0.01;
        }
    });

    // Animate waves
    const positions = waveMesh.geometry.attributes.position;
    const topPositions = waveMeshTop.geometry.attributes.position;
    
    for(let i = 0; i < positions.count; i++) {
        const px = positions.getX(i);
        const py = positions.getY(i);
        // Bottom wave
        positions.setZ(i, Math.sin(px * 0.3 + elapsedTime) * Math.cos(py * 0.3 + elapsedTime) * 1.5);
        // Top wave
        topPositions.setZ(i, Math.sin(px * 0.4 - elapsedTime * 0.8) * Math.cos(py * 0.4 - elapsedTime * 0.8) * 1.5);
    }
    waveMesh.geometry.attributes.position.needsUpdate = true;
    waveMeshTop.geometry.attributes.position.needsUpdate = true;

    // Slowly rotate the entire scene for a floating effect
    scene.rotation.y = Math.sin(elapsedTime * 0.1) * 0.1;
    
    // Rotate stars and galaxy
    starMesh.rotation.y = elapsedTime * 0.02;
    starMesh.rotation.x = elapsedTime * 0.01;
    galaxyMesh.rotation.y = elapsedTime * -0.05;

    // Make sun glow face camera
    sunGlowMesh.lookAt(camera.position);

    // Animate comets
    comets.forEach(cometObj => {
        if (cometObj.resetTimer > 0) {
            cometObj.resetTimer -= 1;
            cometObj.mesh.visible = false;
        } else {
            cometObj.mesh.visible = true;
            // Move comet forward along its local Z axis
            cometObj.mesh.translateZ(cometObj.speed);
            
            // If it goes too far past the camera, reset it
            if (cometObj.mesh.position.z > 20 || cometObj.mesh.position.y < -30) {
                cometObj.mesh.position.set(
                    (Math.random() - 0.5) * 150,
                    20 + Math.random() * 40,
                    -80 - Math.random() * 40
                );
                // Random target point to fly towards
                cometObj.mesh.lookAt(
                    (Math.random() - 0.5) * 40,
                    -20,
                    20
                );
                cometObj.resetTimer = 200 + Math.random() * 800; // Wait before appearing again
                cometObj.speed = 0.5 + Math.random() * 1.5; // New random speed
            }
        }
    });

    renderer.render(scene, camera);
}
animate();

// ----------------------------------------------------
// GSAP & SCROLLTRIGGER SETUP
// ----------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// 3D Camera Scroll Animation
// When we scroll down, the camera moves deeper into the scene
ScrollTrigger.create({
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Smooth scrub
    onUpdate: (self) => {
        // Move camera deeper (z goes from 5 to -5)
        gsap.to(camera.position, {
            z: 5 - (self.progress * 10),
            overwrite: "auto",
            duration: 0.5
        });
        
        // Change fog density slightly
        scene.fog.density = 0.03 + (self.progress * 0.02);
        
        // Light intensity changes
        pointLight1.intensity = 1 + (self.progress * 0.5);
    }
});

// DOM Parallax Effects
gsap.utils.toArray('.parallax-element').forEach(element => {
    const speed = parseFloat(element.dataset.speed) || 0.1;
    
    gsap.to(element, {
        y: () => (ScrollTrigger.maxScroll(window) - (ScrollTrigger.maxScroll(window) * speed)) * speed * -1,
        ease: "none",
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true
        }
    });
});

// Fade in sections on scroll
gsap.utils.toArray('.section').forEach((section, i) => {
    if(i === 0) return; // Skip hero
    
    gsap.from(section.querySelectorAll('.content > *'), {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 50%",
            scrub: 1
        }
    });
});

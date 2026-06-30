// main.js

gsap.registerPlugin(ScrollTrigger);

// 1. Three.js Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.05);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 2. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffeedd, 1);
directionalLight.position.set(5, 5, 2);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xd4af37, 2, 10); // Premium Gold light
pointLight.position.set(-2, 2, 2);
scene.add(pointLight);

// 3. 3D Objects (Magazines/Pages)
const objects = [];
const group = new THREE.Group();
scene.add(group);

// Materials for the "editorial" 3D objects
const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 0.9,
    side: THREE.DoubleSide
});

const paperMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
});

const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.3,
    metalness: 0.8,
    side: THREE.DoubleSide
});

// Create abstract magazine pages and floating elements
for (let i = 0; i < 25; i++) {
    let geometry;
    let material;
    let scale = 1;

    const rand = Math.random();
    if (rand < 0.6) {
        // Pages
        geometry = new THREE.PlaneGeometry(1.5, 2);
        material = paperMaterial;
    } else if (rand < 0.9) {
        // Dark covers
        geometry = new THREE.PlaneGeometry(1.55, 2.05);
        material = darkMaterial;
    } else {
        // Gold accents
        geometry = new THREE.PlaneGeometry(0.5, 3);
        material = goldMaterial;
        scale = 0.5;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(scale, scale, scale);
    
    // Spread objects across the scrollable area
    // X: spread out horizontally
    mesh.position.x = (Math.random() - 0.5) * 12;
    // Y: spread out downwards so we scroll past them
    mesh.position.y = (Math.random() - 0.5) * 25 - 5; 
    // Z: depth variations
    mesh.position.z = (Math.random() - 0.5) * 8 - 3;
    
    // Random rotation
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.rotation.z = (Math.random() - 0.5) * 0.5;
    
    group.add(mesh);
    objects.push({
        mesh: mesh,
        originalPos: mesh.position.clone(),
        originalRot: mesh.rotation.clone()
    });
}

// Editorial frames form a gallery tunnel through the entire page.
const frameGroup = new THREE.Group();
const frameMaterial = new THREE.MeshBasicMaterial({
    color: 0xd4af37,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending
});
for (let i = 0; i < 14; i++) {
    const frame = new THREE.Mesh(
        new THREE.TorusGeometry(4.8 + (i % 3) * 0.35, 0.025, 6, 96),
        frameMaterial.clone()
    );
    frame.scale.y = 1.25;
    frame.position.set((i % 2 ? 1 : -1) * 0.5, 1 - i * 2.6, -2 - i * 1.4);
    frame.rotation.z = i * 0.11;
    frameGroup.add(frame);
}
scene.add(frameGroup);

// Fine gold dust gives the black background a premium physical texture.
const dustCount = reducedMotion ? 300 : 1000;
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 22;
    dustPositions[i * 3 + 1] = 8 - Math.random() * 38;
    dustPositions[i * 3 + 2] = -Math.random() * 18;
}
const dustGeometry = new THREE.BufferGeometry();
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
        color: 0xd4af37,
        size: 0.035,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })
);
scene.add(dust);

// 4. Animation Loop
const clock = new THREE.Clock();
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Mouse parallax effect for the whole group
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    group.position.x += (targetX - group.position.x) * 0.05;
    group.position.y += (-targetY - group.position.y) * 0.05;

    // Subtle floating animation for all objects
    objects.forEach((obj, i) => {
        obj.mesh.position.y = obj.originalPos.y + Math.sin(elapsedTime * 0.5 + i) * 0.2;
        obj.mesh.rotation.x = obj.originalRot.x + Math.sin(elapsedTime * 0.2 + i) * 0.05;
        obj.mesh.rotation.y = obj.originalRot.y + Math.cos(elapsedTime * 0.1 + i) * 0.05;
    });
    frameGroup.children.forEach((frame, index) => {
        frame.rotation.z += (index % 2 ? -1 : 1) * (reducedMotion ? 0.0001 : 0.0008);
        frame.material.opacity = 0.16 + Math.sin(elapsedTime + index) * 0.07;
    });
    dust.rotation.y = elapsedTime * 0.008;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();

// 5. ScrollTrigger Animations
// Animate HTML Parallax Elements
gsap.utils.toArray('.parallax-el').forEach(el => {
    const speed = parseFloat(el.dataset.speed) || 1;
    // Calculate movement based on speed factor
    const yMove = (1 - speed) * 100;
    
    gsap.fromTo(el, {
        y: yMove
    }, {
        y: -yMove,
        ease: "none",
        scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// Animate 3D Camera & Group based on scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: reducedMotion ? 0 : 1.5
    }
});

tl.to(camera.position, {
    y: -16,
    z: 1.5,
    ease: "power1.inOut"
}, 0);

tl.to(camera.position, {
    keyframes: [
        { x: 1.8 },
        { x: -2.4 },
        { x: 1.2 },
        { x: 0 }
    ],
    ease: "sine.inOut"
}, 0);

tl.to(group.rotation, {
    y: Math.PI * 0.5, // Rotate the whole scene 90 degrees as we scroll
    x: 0.1,
    ease: "power1.inOut"
}, 0);

tl.to(frameGroup.rotation, {
    y: -Math.PI * 0.22,
    x: Math.PI * 0.04,
    ease: "sine.inOut"
}, 0);

// Specific section animations (e.g., reveal cards)
gsap.utils.toArray('.editorial-card').forEach((card, i) => {
    gsap.fromTo(card, {
        y: 90,
        opacity: 0,
        rotateX: 14,
        rotateY: i % 2 ? -12 : 12,
        z: -100,
        scale: 0.9
    }, {
        scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "top 45%",
            scrub: reducedMotion ? false : 0.8
        },
        y: 0,
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        z: 0,
        scale: 1,
        ease: "power2.out"
    });
});

gsap.fromTo('.subscription-box', {
    opacity: 0,
    rotateX: 12,
    z: -140,
    scale: 0.88
}, {
    opacity: 1,
    rotateX: 0,
    z: 0,
    scale: 1,
    ease: 'power2.out',
    scrollTrigger: {
        trigger: '.subscription-box',
        start: 'top 88%',
        end: 'top 52%',
        scrub: reducedMotion ? false : 0.8
    }
});

// Resize handler
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

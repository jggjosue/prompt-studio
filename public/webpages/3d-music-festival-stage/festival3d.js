(function () {
  'use strict';

  // --- UI Interactivity ---
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
  });

  // --- Three.js Setup ---
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  // Add some fog to give a cinematic atmosphere
  scene.fog = new THREE.FogExp2(0x050508, 0.02);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // --- Stage Construction ---
  const stageGroup = new THREE.Group();
  scene.add(stageGroup);

  // Main Stage Platform
  const stageGeo = new THREE.BoxGeometry(40, 2, 20);
  const stageMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 });
  const stage = new THREE.Mesh(stageGeo, stageMat);
  stage.position.set(0, -1, -10);
  stageGroup.add(stage);

  // LED Screen (Center)
  const screenGeo = new THREE.PlaneGeometry(30, 15);
  // Create a dynamic shader material for the screen to simulate visuals
  const screenMat = new THREE.MeshBasicMaterial({ color: 0xff2a5f, side: THREE.DoubleSide });
  
  // Try to use the video if possible, or fallback to shader/color
  const video = document.createElement('video');
  video.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = true;
  video.play().catch(e => { /* console.log('Video autoplay blocked, using color fallback.') */ });
  
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;
  const screenMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
  
  const ledScreen = new THREE.Mesh(screenGeo, screenMaterial);
  ledScreen.position.set(0, 7.5, -19);
  stageGroup.add(ledScreen);

  // Truss / Structure
  const trussGeo = new THREE.CylinderGeometry(0.2, 0.2, 35, 8);
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, wireframe: true });
  const leftTruss = new THREE.Mesh(trussGeo, trussMat);
  leftTruss.position.set(-18, 10, -15);
  stageGroup.add(leftTruss);
  const rightTruss = leftTruss.clone();
  rightTruss.position.set(18, 10, -15);
  stageGroup.add(rightTruss);
  const topTruss = new THREE.Mesh(trussGeo, trussMat);
  topTruss.rotation.z = Math.PI / 2;
  topTruss.position.set(0, 20, -15);
  stageGroup.add(topTruss);

  // Crowd Particles
  const crowdGeo = new THREE.BufferGeometry();
  const crowdCount = 5000;
  const crowdPos = new Float32Array(crowdCount * 3);
  for (let i = 0; i < crowdCount * 3; i += 3) {
    crowdPos[i] = (Math.random() - 0.5) * 80; // x
    crowdPos[i + 1] = (Math.random() * 2) - 1; // y
    crowdPos[i + 2] = Math.random() * 60 + 5; // z (in front of stage)
  }
  crowdGeo.setAttribute('position', new THREE.BufferAttribute(crowdPos, 3));
  const crowdMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.6 });
  const crowd = new THREE.Points(crowdGeo, crowdMat);
  scene.add(crowd);

  // Lasers / Particles
  const laserGeo = new THREE.CylinderGeometry(0.05, 0.05, 100);
  const laserMat = new THREE.MeshBasicMaterial({ color: 0xff2a5f, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
  const lasers = new THREE.Group();
  for(let i=0; i<10; i++) {
    const l = new THREE.Mesh(laserGeo, laserMat);
    l.position.set((Math.random()-0.5)*20, 0, -15);
    l.rotation.x = (Math.random()-0.5) * Math.PI;
    l.rotation.z = (Math.random()-0.5) * Math.PI;
    lasers.add(l);
  }
  stageGroup.add(lasers);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x222244, 1);
  scene.add(ambientLight);

  const mainLight = new THREE.PointLight(0xff2a5f, 2, 100);
  mainLight.position.set(0, 15, -10);
  stageGroup.add(mainLight);

  const blueLight = new THREE.PointLight(0x2a5fff, 2, 100);
  blueLight.position.set(10, 5, -5);
  stageGroup.add(blueLight);

  // --- Initial Camera Setup ---
  camera.position.set(0, 5, 50); // Start far back (entrance)
  
  // --- Animation Loop ---
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Animate Crowd
    const positions = crowd.geometry.attributes.position.array;
    for (let i = 1; i < crowdCount * 3; i += 3) {
      positions[i] += Math.sin(time * 3 + positions[i-1]) * 0.01;
    }
    crowd.geometry.attributes.position.needsUpdate = true;

    // Animate Lasers
    lasers.children.forEach((l, i) => {
      l.rotation.z += Math.sin(time + i) * 0.01;
    });

    // Flickering lights
    mainLight.intensity = 2 + Math.sin(time * 10) * 0.5;

    renderer.render(scene, camera);
  }
  animate();

  // --- GSAP ScrollTrigger ---
  gsap.registerPlugin(ScrollTrigger);

  // Camera Path Timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#scroll-content",
      start: "top top",
      end: "bottom bottom",
      scrub: 1 // smooth scrubbing
    }
  });

  // Home -> Stage
  tl.to(camera.position, {
    z: 10,
    y: 2,
    ease: "power1.inOut"
  }, 0)
  .to(camera.rotation, {
    x: 0.1, // look slightly up
    ease: "power1.inOut"
  }, 0)
  // Stage -> Lineup (Pan right)
  .to(camera.position, {
    x: 15,
    z: 5,
    ease: "power1.inOut"
  }, 1)
  .to(camera.rotation, {
    y: 0.5,
    ease: "power1.inOut"
  }, 1)
  // Lineup -> Schedule (Pan left)
  .to(camera.position, {
    x: -15,
    z: 8,
    ease: "power1.inOut"
  }, 2)
  .to(camera.rotation, {
    y: -0.5,
    ease: "power1.inOut"
  }, 2)
  // Schedule -> Experience (Fly over stage)
  .to(camera.position, {
    x: 0,
    y: 15,
    z: -5,
    ease: "power1.inOut"
  }, 3)
  .to(camera.rotation, {
    x: -0.5,
    y: 0,
    ease: "power1.inOut"
  }, 3)
  // Experience -> Map (Zoom way out)
  .to(camera.position, {
    y: 40,
    z: 20,
    ease: "power1.inOut"
  }, 4)
  .to(camera.rotation, {
    x: -1,
    ease: "power1.inOut"
  }, 4)
  // Map -> Tickets & Contact (Return to normal view, intense colors)
  .to(camera.position, {
    y: 3,
    z: 20,
    ease: "power1.inOut"
  }, 5)
  .to(camera.rotation, {
    x: 0,
    ease: "power1.inOut"
  }, 5)
  .to(mainLight, {
    intensity: 4,
    color: 0xffffff,
    ease: "power1.inOut"
  }, 5)
  .to(blueLight, {
    intensity: 4,
    color: 0xff2a5f,
    ease: "power1.inOut"
  }, 5);

  // HTML Element Animations (Parallax / Fade in)
  gsap.utils.toArray('.section').forEach((sec, i) => {
    if(i === 0) return; // Skip hero for entry animation
    gsap.from(sec.querySelector('.content-wrapper'), {
      scrollTrigger: {
        trigger: sec,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  });

  // --- Resize Handler ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();

/* 
 * sports3d.js — 3D Sports Stadium Landing Page
 * Uses Three.js for rendering and GSAP + ScrollTrigger for scroll-based animations
 */

(function () {
  'use strict';

  // Make sure we have GSAP and Three.js
  if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('Missing dependencies (THREE, GSAP, or ScrollTrigger).');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  let scene, camera, renderer;
  let animFrameId = null;
  const clock = new THREE.Clock();

  // Scene Elements
  let field, stadiumGroup;
  
  const dom = {
    container: document.getElementById('canvas-container'),
    parallaxTexts: document.querySelectorAll('.parallax-text')
  };

  /* ---------- Initialization ---------- */
  function init() {
    initThreeJS();
    buildStadium();
    setupScrollAnimations();
    setupParallax();
    
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
  }

  /* ---------- Three.js Setup ---------- */
  function initThreeJS() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a07, 0.015);

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    // Initial camera position (Hero view)
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Stadium spotlights
    const spotLight1 = new THREE.SpotLight(0x00ff66, 2);
    spotLight1.position.set(-20, 20, -20);
    spotLight1.angle = Math.PI / 6;
    spotLight1.penumbra = 0.5;
    scene.add(spotLight1);

    const spotLight2 = new THREE.SpotLight(0x00ff66, 2);
    spotLight2.position.set(20, 20, 20);
    spotLight2.angle = Math.PI / 6;
    spotLight2.penumbra = 0.5;
    scene.add(spotLight2);
  }

  /* ---------- Build Stadium Assets ---------- */
  function buildStadium() {
    stadiumGroup = new THREE.Group();

    // Field
    const fieldGeo = new THREE.PlaneGeometry(30, 45);
    const fieldMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a4025, 
      roughness: 0.8,
      metalness: 0.1
    });
    field = new THREE.Mesh(fieldGeo, fieldMat);
    field.rotation.x = -Math.PI / 2;
    field.receiveShadow = true;
    stadiumGroup.add(field);

    // Enhanced Field Lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    
    // Outer border
    const borderLineGeo = new THREE.PlaneGeometry(28, 42);
    const borderLine = new THREE.Mesh(borderLineGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.7 }));
    borderLine.rotation.x = -Math.PI / 2;
    borderLine.position.y = 0.05;
    stadiumGroup.add(borderLine);

    // Center line
    const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(28, 0.15), lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.06;
    stadiumGroup.add(centerLine);

    // Center circle
    const centerCircle = new THREE.Mesh(new THREE.RingGeometry(3, 3.15, 32), lineMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.y = 0.06;
    stadiumGroup.add(centerCircle);
    
    // Penalty areas
    const penAreaGeo = new THREE.PlaneGeometry(12, 5);
    const penAreaMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.7 });
    
    const penArea1 = new THREE.Mesh(penAreaGeo, penAreaMat);
    penArea1.rotation.x = -Math.PI / 2;
    penArea1.position.set(0, 0.05, -18.5);
    stadiumGroup.add(penArea1);
    
    const penArea2 = new THREE.Mesh(penAreaGeo, penAreaMat);
    penArea2.rotation.x = -Math.PI / 2;
    penArea2.position.set(0, 0.05, 18.5);
    stadiumGroup.add(penArea2);

    // Goals (Porterías)
    const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
    const createGoal = (zPos, isNorth) => {
      const goalGroup = new THREE.Group();
      
      // Posts
      const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 2);
      const leftPost = new THREE.Mesh(postGeo, goalMat);
      leftPost.position.set(-3, 1, 0);
      leftPost.castShadow = true;
      const rightPost = new THREE.Mesh(postGeo, goalMat);
      rightPost.position.set(3, 1, 0);
      rightPost.castShadow = true;
      
      // Crossbar
      const barGeo = new THREE.CylinderGeometry(0.1, 0.1, 6);
      const crossbar = new THREE.Mesh(barGeo, goalMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, 2, 0);
      crossbar.castShadow = true;
      
      // Net (simplified with transparent wireframe plane)
      const netGeo = new THREE.PlaneGeometry(6, 2);
      const netMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, wireframe: true, transparent: true, opacity: 0.3 });
      const net = new THREE.Mesh(netGeo, netMat);
      net.position.set(0, 1, isNorth ? -1 : 1);
      
      goalGroup.add(leftPost, rightPost, crossbar, net);
      goalGroup.position.set(0, 0, zPos);
      stadiumGroup.add(goalGroup);
    };
    
    createGoal(-21, true); // North goal
    createGoal(21, false); // South goal

    // Stands (Gradas)
    const standMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    
    // Left stand
    const leftStandGeo = new THREE.BoxGeometry(10, 10, 50);
    const leftStand = new THREE.Mesh(leftStandGeo, standMat);
    leftStand.position.set(-20, 5, 0);
    leftStand.rotation.z = -Math.PI / 6; // slope
    leftStand.castShadow = true;
    leftStand.receiveShadow = true;
    stadiumGroup.add(leftStand);

    // Right stand
    const rightStandGeo = new THREE.BoxGeometry(10, 10, 50);
    const rightStand = new THREE.Mesh(rightStandGeo, standMat);
    rightStand.position.set(20, 5, 0);
    rightStand.rotation.z = Math.PI / 6;
    rightStand.castShadow = true;
    rightStand.receiveShadow = true;
    stadiumGroup.add(rightStand);

    // North stand (New)
    const northStandGeo = new THREE.BoxGeometry(32, 10, 10);
    const northStand = new THREE.Mesh(northStandGeo, standMat);
    northStand.position.set(0, 5, -28);
    northStand.rotation.x = Math.PI / 6; // slope
    northStand.castShadow = true;
    northStand.receiveShadow = true;
    stadiumGroup.add(northStand);

    // South stand (New)
    const southStandGeo = new THREE.BoxGeometry(32, 10, 10);
    const southStand = new THREE.Mesh(southStandGeo, standMat);
    southStand.position.set(0, 5, 28);
    southStand.rotation.x = -Math.PI / 6; // slope
    southStand.castShadow = true;
    southStand.receiveShadow = true;
    stadiumGroup.add(southStand);

    // Add everything to scene
    scene.add(stadiumGroup);
    
    // Particle Crowd (floating dots in all stands)
    const crowdGeo = new THREE.BufferGeometry();
    const crowdCount = 3000;
    const crowdPos = new Float32Array(crowdCount * 3);
    const crowdColors = new Float32Array(crowdCount * 3);
    const colorOpts = [new THREE.Color(0xffffff), new THREE.Color(0x00ff66), new THREE.Color(0x333333)];

    for (let i = 0; i < crowdCount; i++) {
      // Pick a random stand (0: Left, 1: Right, 2: North, 3: South)
      const standId = Math.floor(Math.random() * 4);
      let x, y, z;

      if (standId === 0) { // Left
        x = -15 - Math.random() * 8;
        z = -20 + Math.random() * 40;
        y = (Math.abs(x) - 13) * 0.5 + Math.random(); 
      } else if (standId === 1) { // Right
        x = 15 + Math.random() * 8;
        z = -20 + Math.random() * 40;
        y = (Math.abs(x) - 13) * 0.5 + Math.random(); 
      } else if (standId === 2) { // North
        x = -14 + Math.random() * 28;
        z = -23 - Math.random() * 8;
        y = (Math.abs(z) - 21) * 0.5 + Math.random();
      } else { // South
        x = -14 + Math.random() * 28;
        z = 23 + Math.random() * 8;
        y = (Math.abs(z) - 21) * 0.5 + Math.random();
      }

      crowdPos[i*3] = x;
      crowdPos[i*3+1] = y;
      crowdPos[i*3+2] = z;

      const c = colorOpts[Math.floor(Math.random() * colorOpts.length)];
      crowdColors[i*3] = c.r;
      crowdColors[i*3+1] = c.g;
      crowdColors[i*3+2] = c.b;
    }

    crowdGeo.setAttribute('position', new THREE.BufferAttribute(crowdPos, 3));
    crowdGeo.setAttribute('color', new THREE.BufferAttribute(crowdColors, 3));

    const crowdMat = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const crowd = new THREE.Points(crowdGeo, crowdMat);
    stadiumGroup.add(crowd);
  }

  /* ---------- GSAP Scroll Animations ---------- */
  function setupScrollAnimations() {
    // Create a timeline that spans the whole document scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1 // smooth scrubbing
      }
    });

    // We have 5 sections: Hero, Calendar, Tickets, VIP, Store
    // Hero -> Calendar
    tl.to(camera.position, { x: 15, y: 10, z: 15, duration: 1 }, 0)
      .to(camera.rotation, { x: -Math.PI/6, y: Math.PI/4, z: 0, duration: 1 }, 0);
      
    // Calendar -> Tickets (Zoom in to the stands)
    tl.to(camera.position, { x: 5, y: 3, z: 5, duration: 1 }, 1)
      .to(camera.rotation, { x: 0, y: Math.PI/2, z: 0, duration: 1 }, 1);

    // Tickets -> VIP (Look up at VIP box)
    tl.to(camera.position, { x: 0, y: 12, z: 0, duration: 1 }, 2)
      .to(camera.rotation, { x: Math.PI/6, y: -Math.PI/4, z: 0, duration: 1 }, 2);

    // VIP -> Store (Wide cinematic shot of the field)
    tl.to(camera.position, { x: -20, y: 8, z: 20, duration: 1 }, 3)
      .to(camera.rotation, { x: -Math.PI/8, y: -Math.PI/4, z: 0, duration: 1 }, 3);
  }

  /* ---------- UI Parallax Effects ---------- */
  function setupParallax() {
    dom.parallaxTexts.forEach(el => {
      const speed = el.dataset.speed || 1;
      gsap.to(el, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * (speed - 1),
        ease: "none",
        scrollTrigger: {
          trigger: '#scroll-content',
          start: "top top",
          end: "bottom bottom",
          scrub: 0,
          invalidateOnRefresh: true
        }
      });
    });
  }

  /* ---------- Render Loop ---------- */
  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    // Add subtle ambient motion to the stadium
    if (stadiumGroup) {
      const t = clock.getElapsedTime();
      // Very slow breathing effect
      stadiumGroup.position.y = Math.sin(t * 0.5) * 0.2;
    }

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

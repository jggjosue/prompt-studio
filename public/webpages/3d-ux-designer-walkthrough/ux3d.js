(function () {
  'use strict';

  // Registrar ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Referencias DOM
  const canvasContainer = document.getElementById('canvas-container');
  const tooltip = document.getElementById('tooltip-3d');
  
  // Variables de Three.js
  let scene, camera, renderer, raycaster, mouse;
  let stations = [];
  let interactiveObjects = [];
  
  // Materiales globales (Premium / Dark / Neon)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.8, // glass effect
    thickness: 0.5,
    transparent: true,
    opacity: 1
  });
  
  const accentMatPrimary = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.5,
    roughness: 0.4,
    metalness: 0.8
  });
  
  const accentMatSecondary = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x4c1d95,
    emissiveIntensity: 0.5,
    roughness: 0.4,
    metalness: 0.8
  });

  const wireframeMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 });

  function init() {
    initThree();
    buildScene();
    setupScrollAnimation();
    setupDOMAnimations();
    setupInteractions();
    
    // Iniciar loop
    renderer.setAnimationLoop(animate);
  }

  function initThree() {
    scene = new THREE.Scene();
    // Color de fondo oscuro para combinar con el CSS, se usará fog para profundidad
    scene.background = new THREE.Color(0x0b0f19);
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.03);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 10); // Posición inicial

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvasContainer.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 5, 50);
    blueLight.position.set(-5, 2, -10);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 5, 50);
    purpleLight.position.set(5, -2, -20);
    scene.add(purpleLight);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize);
  }

  function createStationGroup(zOffset) {
    const group = new THREE.Group();
    group.position.z = zOffset;
    scene.add(group);
    stations.push(group);
    return group;
  }

  function buildScene() {
    // 0. Hero (Z: 0)
    const gHero = createStationGroup(0);
    const heroShape = new THREE.Mesh(new THREE.TorusKnotGeometry(2, 0.6, 100, 16), glassMat);
    heroShape.position.set(3, 0, -5);
    heroShape.rotation.set(0.5, 0.5, 0);
    gHero.add(heroShape);
    
    // Partículas flotantes alrededor
    const particles = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(Array.from({length: 200}, () => new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 100 - 20
      ))),
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.3 })
    );
    scene.add(particles);

    // 1. Research (Z: -20)
    const gResearch = createStationGroup(-20);
    for(let i=0; i<15; i++) {
      const noteMat = new THREE.MeshStandardMaterial({ 
        color: [0xfde047, 0xfca5a5, 0x86efac][i%3],
        roughness: 0.8
      });
      const note = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), noteMat);
      note.position.set(
        -8 + Math.random() * 4, 
        -2 + Math.random() * 4, 
        -2 + Math.random() * 4
      );
      note.rotation.set(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.5,
        0
      );
      gResearch.add(note);
    }

    // 2. Journey (Z: -40)
    const gJourney = createStationGroup(-40);
    const lineGeo = new THREE.BufferGeometry();
    const pts = [];
    for(let i=0; i<10; i++) {
      const x = -4 + i * 1.5;
      const y = Math.sin(i) * 2;
      pts.push(new THREE.Vector3(x, y, 0));
      
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), accentMatPrimary);
      node.position.set(x, y, 0);
      gJourney.add(node);
      
      node.userData = { tooltip: "Touchpoint " + (i+1) };
      interactiveObjects.push(node);
    }
    lineGeo.setFromPoints(pts);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x8b5cf6, linewidth: 2 }));
    gJourney.add(line);

    // 3. Wireframes (Z: -60)
    const gWire = createStationGroup(-60);
    for(let i=0; i<3; i++) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(plane.geometry), wireframeMat);
      plane.add(edges);
      
      // Añadir cajas internas simulando layout
      const box1 = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.8), new THREE.MeshBasicMaterial({ color: 0x1e293b }));
      box1.position.set(0, 0.9, 0.01);
      plane.add(box1);
      
      plane.position.set(4, 0, i * -2);
      plane.rotation.y = -Math.PI / 6;
      gWire.add(plane);
    }

    // 4. Prototypes (Z: -80)
    const gProto = createStationGroup(-80);
    const phone = new THREE.Mesh(new THREE.BoxGeometry(2.5, 5, 0.2), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 }));
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 4.8), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
    screen.position.z = 0.11;
    phone.add(screen);
    
    const cta = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), accentMatPrimary);
    cta.position.set(0, -1.5, 0.12);
    phone.add(cta);
    
    phone.position.set(-3, 0, 0);
    phone.rotation.y = Math.PI / 8;
    gProto.add(phone);
    
    cta.userData = { tooltip: "Interactive CTA" };
    interactiveObjects.push(cta);

    // 5. Testing (Z: -100)
    const gTest = createStationGroup(-100);
    const heatmap = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    // Simulando heatmap con unas esferas de colores
    const hot1 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 }));
    hot1.scale.z = 0.1; hot1.position.set(-1.5, 1, 0.1);
    const hot2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.5 }));
    hot2.scale.z = 0.1; hot2.position.set(1.5, -0.5, 0.1);
    heatmap.add(hot1); heatmap.add(hot2);
    heatmap.position.set(4, 0, 0);
    heatmap.rotation.y = -Math.PI / 8;
    gTest.add(heatmap);

    // 6. Metrics (Z: -120)
    const gMetrics = createStationGroup(-120);
    for(let i=0; i<5; i++) {
      const h = 1 + Math.random() * 4;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.8, h, 0.8), glassMat);
      bar.position.set(-3 + i * 1.5, h/2 - 2, 0);
      gMetrics.add(bar);
    }

    // 7. Design System (Z: -140)
    const gSystem = createStationGroup(-140);
    const sysItems = [
      new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32),
      new THREE.BoxGeometry(1, 1, 0.2),
      new THREE.TorusGeometry(0.5, 0.1, 16, 32)
    ];
    for(let i=0; i<6; i++) {
      const mesh = new THREE.Mesh(sysItems[i%3], accentMatSecondary);
      mesh.position.set(
        2 + (i%2) * 2,
        2 - Math.floor(i/2) * 2,
        0
      );
      mesh.rotation.set(0.5, 0.5, 0);
      gSystem.add(mesh);
    }

    // 8. Cases (Z: -160)
    // Nada muy pesado aquí, el foco está en el HTML

    // 9. Booking (Z: -180)
    const gBooking = createStationGroup(-180);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 2), glassMat);
    desk.position.set(0, -2, 0);
    gBooking.add(desk);
  }

  function setupScrollAnimation() {
    // Definimos el total de scroll
    const totalPanels = document.querySelectorAll('.panel').length;
    // Cada panel avanza Z en -20
    const endZ = -(totalPanels - 1) * 20;

    // Animamos la posición de la cámara basada en el scroll global
    ScrollTrigger.create({
      trigger: ".scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 1, // Suavidad
      onUpdate: (self) => {
        // Mover cámara en Z
        const progress = self.progress;
        camera.position.z = 10 + (endZ - 10) * progress;
        
        // Ligero movimiento lateral para que se sienta más orgánico
        camera.position.x = Math.sin(progress * Math.PI * 2) * 2;
        // Ligera rotación
        camera.rotation.y = Math.sin(progress * Math.PI * 2) * 0.1;
      }
    });
  }

  function setupDOMAnimations() {
    const panels = document.querySelectorAll('.panel');
    
    panels.forEach(panel => {
      const elements = panel.querySelectorAll('.parallax-text');
      
      gsap.fromTo(elements, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.2, 
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 70%", // Empieza cuando el top del panel llega al 70% del viewport
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }

  function setupInteractions() {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
  }

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Efecto parallax sutil con el ratón
    const targetX = mouse.x * 0.5;
    const targetY = mouse.y * 0.5;
    
    gsap.to(camera.position, {
      x: camera.position.x + (targetX - camera.position.x) * 0.05,
      y: targetY,
      duration: 0.5
    });

    // Raycaster para tooltips
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, false);

    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
      const obj = intersects[0].object;
      if (obj.userData.tooltip) {
        tooltip.innerText = obj.userData.tooltip;
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';
        tooltip.classList.remove('hidden');
      }
    } else {
      document.body.style.cursor = 'default';
      tooltip.classList.add('hidden');
    }
  }

  function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, false);
    if (intersects.length > 0) {
      // Pequeña animación de feedback
      const obj = intersects[0].object;
      gsap.to(obj.scale, {
        x: 1.2, y: 1.2, z: 1.2,
        yoyo: true,
        repeat: 1,
        duration: 0.1
      });
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate(time) {
    // Animaciones constantes de los objetos (flotar/rotar)
    stations.forEach((group, index) => {
      // Rotar suavemente si estamos cerca
      const dist = Math.abs(camera.position.z - group.position.z);
      if (dist < 40) {
        // Solo animar lo que está visible para ahorrar recursos
        group.children.forEach((child, i) => {
          if (child.geometry && child.geometry.type !== 'PlaneGeometry' && child.geometry.type !== 'BoxGeometry') {
             child.rotation.x += 0.002 * (i%2 ? 1 : -1);
             child.rotation.y += 0.005;
          }
          // Flotación sutil
          child.position.y += Math.sin(time / 1000 + i) * 0.002;
        });
      }
    });

    renderer.render(scene, camera);
  }

  // Inicializar todo
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();

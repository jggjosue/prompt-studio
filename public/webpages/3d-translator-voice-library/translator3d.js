(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const EXAMPLES = [
    {
      title: 'Inglés → Español',
      original: { lang: 'English', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', text: 'The future belongs to those who believe in the beauty of their dreams.' },
      translated: { lang: 'Spanish', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', text: 'El futuro pertenece a quienes creen en la belleza de sus sueños.' }
    },
    {
      title: 'Francés → Español',
      original: { lang: 'French', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', text: 'L\'imagination est plus importante que le savoir.' },
      translated: { lang: 'Spanish', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', text: 'La imaginación es más importante que el conocimiento.' }
    },
    {
      title: 'Alemán → Español',
      original: { lang: 'German', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', text: 'Der Mensch ist nur da ganz Mensch, where he plays.' },
      translated: { lang: 'Spanish', audioUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', text: 'El hombre es completamente humano solo cuando juega.' }
    }
  ];

  /* DOM Elements */
  const dom = {
    container: document.getElementById('scene-container'),
    overlay: document.getElementById('player-overlay'),
    closeBtn: document.getElementById('player-close'),
    audioOrig: document.getElementById('audio-orig'),
    audioTrans: document.getElementById('audio-trans'),
    textOrig: document.getElementById('text-orig'),
    textTrans: document.getElementById('text-trans'),
    playBtns: document.querySelectorAll('.play-demo-btn')
  };

  /* Three.js Setup */
  let scene, camera, renderer;
  let particlesMesh, shelvesGroup, waveGroup;
  
  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090a0f, 0.05);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x5e6ad2, 1.5, 20);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x00d4ff, 1, 20);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    createParticles();
    createShelves();
    createSoundWaves();

    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    renderer.setAnimationLoop(animate);
  }

  function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const count = 1500;
    const positions = new Float32Array(count * 3);
    
    for(let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 30;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x5e6ad2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
  }

  function createShelves() {
    shelvesGroup = new THREE.Group();
    
    const colors = [0x5e6ad2, 0x00d4ff, 0x905ed2];
    
    for(let i = 0; i < 15; i++) {
      const w = 1 + Math.random() * 2;
      const h = 0.1;
      const d = 0.5 + Math.random() * 0.5;
      
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ 
        color: colors[i % colors.length], 
        transparent: true, 
        opacity: 0.7,
        roughness: 0.2,
        metalness: 0.8
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      
      // Position them along a path going deep into Z
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        -i * 2
      );
      
      // Add glowing lines (wires)
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
      const line = new THREE.LineSegments(edges, lineMat);
      mesh.add(line);
      
      shelvesGroup.add(mesh);
    }
    scene.add(shelvesGroup);
  }

  function createSoundWaves() {
    waveGroup = new THREE.Group();
    // Create a 3D grid representing audio frequency
    for(let i=0; i<30; i++) {
      const geo = new THREE.CylinderGeometry(0.02, 0.02, Math.random() * 2 + 0.5, 8);
      const mat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(i * 0.3 - 4.5, 0, -5);
      mesh.userData = { origY: mesh.position.y, heightOffset: Math.random() * Math.PI * 2 };
      waveGroup.add(mesh);
    }
    waveGroup.position.set(0, -2, -8);
    scene.add(waveGroup);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    
    // Animate particles
    if(particlesMesh) {
      particlesMesh.rotation.y = t * 0.02;
    }
    
    // Animate sound waves
    if(waveGroup) {
      waveGroup.children.forEach((c, idx) => {
        c.scale.y = 1 + Math.sin(t * 3 + c.userData.heightOffset) * 0.5;
      });
    }

    renderer.render(scene, camera);
  }

  /* GSAP Scroll Animations */
  function initScrollAnimations() {
    // HTML Parallax Elements
    gsap.utils.toArray('.parallax-el').forEach(el => {
      const speed = el.dataset.speed || 1;
      gsap.fromTo(el, {
        y: 50 * speed,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "top 50%",
          scrub: 1
        }
      });
    });

    // 3D Camera Path tied to scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-content",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
      }
    });

    // Sec 2: Library
    tl.to(camera.position, { z: 2, y: -1, x: 2, ease: "power1.inOut" }, 0);
    tl.to(shelvesGroup.rotation, { y: 0.5, ease: "power1.inOut" }, 0);

    // Sec 3: Capabilities
    tl.to(camera.position, { z: -3, y: 1, x: -2, ease: "power1.inOut" }, 1);
    tl.to(shelvesGroup.rotation, { y: -0.5, ease: "power1.inOut" }, 1);
    tl.to(waveGroup.position, { z: -2, ease: "power1.inOut" }, 1);

    // Sec 4: Demo
    tl.to(camera.position, { z: -10, y: 0, x: 0, ease: "power1.inOut" }, 2);
    tl.to(camera.rotation, { y: Math.PI * 0.1, ease: "power1.inOut" }, 2);

    // Sec 5: CTA
    tl.to(camera.position, { z: -15, y: 5, ease: "power1.inOut" }, 3);
    tl.to(camera.rotation, { x: -Math.PI * 0.2, y: 0, ease: "power1.inOut" }, 3);
  }

  /* Interactive UI */
  function initUI() {
    dom.playBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.demo-card');
        const idx = parseInt(card.dataset.idx);
        openPlayer(idx);
      });
    });

    dom.closeBtn.addEventListener('click', closePlayer);
  }

  function openPlayer(idx) {
    const data = EXAMPLES[idx];
    if(!data) return;

    dom.audioOrig.src = data.original.audioUrl;
    dom.textOrig.textContent = `"${data.original.text}"`;
    
    dom.audioTrans.src = data.translated.audioUrl;
    dom.textTrans.textContent = `"${data.translated.text}"`;

    dom.overlay.classList.remove('hidden');
  }

  function closePlayer() {
    dom.overlay.classList.add('hidden');
    dom.audioOrig.pause();
    dom.audioTrans.pause();
  }

  // Init everything
  initThree();
  initScrollAnimations();
  initUI();

})();

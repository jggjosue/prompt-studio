import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const bgVideo = document.getElementById('bg-video');
  const playBtn = document.getElementById('play-toggle');
  const freqIndicator = document.getElementById('freq-indicator');
  const moodBtns = document.querySelectorAll('.mood-btn');
  const stemBtns = document.querySelectorAll('.stem-btn');
  
  // Hamburger Menu
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  let currentMood = 'calm';
  let currentStem = 0;
  let isPlaying = false;

  const letterData = [
    { char: 'T', x: -2.6, y: 0.6, z: -0.6, h: 0.7, w: 0.45, freqBand: 0 },
    { char: 'Y', x: -1.6, y: 0.3, z: -0.3, h: 0.6, w: 0.4, freqBand: 1 },
    { char: 'P', x: -0.6, y: 0.5, z: 0, h: 0.65, w: 0.4, freqBand: 2 },
    { char: 'O', x: 0.4, y: 0.4, z: 0.1, h: 0.6, w: 0.4, freqBand: 0 },
    { char: 'G', x: 1.4, y: 0.7, z: -0.2, h: 0.65, w: 0.4, freqBand: 1 },
    { char: 'R', x: 2.4, y: 0.3, z: -0.5, h: 0.6, w: 0.4, freqBand: 2 },
    { char: 'A', x: -2.0, y: -0.4, z: -1.2, h: 0.5, w: 0.35, freqBand: 0 },
    { char: 'P', x: -1.0, y: -0.2, z: -1.0, h: 0.55, w: 0.35, freqBand: 1 },
    { char: 'H', x: 0, y: -0.3, z: -0.9, h: 0.5, w: 0.35, freqBand: 2 },
    { char: 'Y', x: 1.0, y: -0.1, z: -1.1, h: 0.5, w: 0.35, freqBand: 0 },
  ];

  function makeLetterTexture(ch, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.font = 'bold 80px Fraunces, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const sceneRoot = document.getElementById('scene-root');
  const scene = new THREE.Scene();
  // We use transparent background because CSS has the main gradient
  scene.background = null; 
  scene.fog = new THREE.FogExp2(0x050508, 0.05);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 5.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  sceneRoot.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xf0e0d0, 1.4);
  key.position.set(3, 6, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd2a8ff, 0.8);
  rim.position.set(-3, 2, -4);
  scene.add(rim);
  
  // Group for the main scene elements
  const sceneGroup = new THREE.Group();
  scene.add(sceneGroup);

  const letters = [];
  const baseColors = [0x88aadd, 0xddaa88, 0x88ddaa, 0xdd88aa, 0xaadd88, 0xaa88dd];

  letterData.forEach((ld, idx) => {
    const color = baseColors[idx % baseColors.length];
    const tex = makeLetterTexture(ld.char, color);
    const mat = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.15, metalness: 0.8,
      emissive: new THREE.Color(color), emissiveIntensity: 0.15
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(ld.w, ld.h, 0.1), mat);
    mesh.position.set(ld.x, ld.y, ld.z);
    mesh.userData = {
      baseY: ld.y, baseX: ld.x, baseZ: ld.z,
      freqBand: ld.freqBand, rotSpeed: 0.3 + Math.random() * 0.5,
      floatOff: Math.random() * Math.PI * 2,
      origX: ld.x, origY: ld.y, origZ: ld.z
    };
    sceneGroup.add(mesh);
    letters.push(mesh);

    const glowMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.1, side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(ld.w + 0.15, ld.h + 0.15), glowMat);
    glow.position.set(ld.x, ld.y, ld.z - 0.05);
    mesh.add(glow); // Attach glow to mesh so it moves with it
  });

  // Particles
  const particlesGeo = new THREE.BufferGeometry();
  const pCount = 400;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i += 1) {
    pPos[i * 3] = (Math.random() - 0.5) * 15;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({ color: 0xd2a8ff, size: 0.03, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
  );
  scene.add(particles);

  // Audio Setup
  let audioCtx = null;
  let analyser = null;
  let source = null;
  let frequencyData = null;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    frequencyData = new Uint8Array(analyser.frequencyCount);
    source = audioCtx.createMediaElementSource(bgVideo);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  function getAudioLevels() {
    if (!analyser) return { avg: 0, band: 0 };
    analyser.getByteFrequencyData(frequencyData);
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i += 1) sum += frequencyData[i];
    const avg = sum / frequencyData.length / 255;
    const band = frequencyData.length > 4
      ? (frequencyData[4] + frequencyData[5] + frequencyData[6]) / 3 / 255
      : avg;
    return { avg, band };
  }

  function setMood(mood) {
    currentMood = mood;
    moodBtns.forEach((b) => b.classList.toggle('active', b.dataset.mood === mood));
  }

  function setStem(idx) {
    currentStem = idx;
    stemBtns.forEach((b) => b.classList.toggle('active', Number(b.dataset.stem) === idx));
    const stems = [
      { playbackRate: 1, detune: 0 },
      { playbackRate: 1.15, detune: -200 },
      { playbackRate: 0.9, detune: 200 },
      { playbackRate: 1.05, detune: -400 }
    ];
    const s = stems[idx];
    bgVideo.playbackRate = s.playbackRate;
    if (source && audioCtx) {
      try { source.detune.value = s.detune; } catch {}
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', async () => {
      if (isPlaying) {
        bgVideo.pause();
        playBtn.textContent = 'Play Experience';
        isPlaying = false;
        return;
      }
      try {
        await bgVideo.play();
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
        playBtn.textContent = 'Pause Experience';
        isPlaying = true;
      } catch (err) {
        console.error("Audio play error", err);
      }
    });
  }

  moodBtns.forEach((btn) => btn.addEventListener('click', () => setMood(btn.dataset.mood)));
  stemBtns.forEach((btn) => btn.addEventListener('click', () => setStem(Number(btn.dataset.stem))));

  // --- ScrollTrigger Setup ---
  
  // Hero -> Experience
  gsap.to(camera.position, {
    x: -2, y: 0.5, z: 3.5,
    ease: "power2.inOut",
    scrollTrigger: {
      trigger: "#experience",
      start: "top bottom",
      end: "center center",
      scrub: 1
    }
  });
  
  gsap.to(sceneGroup.rotation, {
    y: Math.PI / 6,
    x: -Math.PI / 12,
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: "#experience",
      start: "top bottom",
      end: "center center",
      scrub: 1
    }
  });

  // Experience -> Track
  gsap.to(camera.position, {
    x: 2, y: 1.5, z: 4.5,
    ease: "power2.inOut",
    scrollTrigger: {
      trigger: "#track",
      start: "top bottom",
      end: "center center",
      scrub: 1
    }
  });

  gsap.to(sceneGroup.rotation, {
    y: -Math.PI / 8,
    z: Math.PI / 16,
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: "#track",
      start: "top bottom",
      end: "center center",
      scrub: 1
    }
  });

  // Explode letters on Track section
  letters.forEach((mesh, i) => {
    gsap.to(mesh.position, {
      x: mesh.userData.origX * 1.5,
      y: mesh.userData.origY * 1.5,
      z: mesh.userData.origZ * 1.5 + (Math.random() * 2 - 1),
      scrollTrigger: {
        trigger: "#track",
        start: "top center",
        end: "bottom center",
        scrub: 1
      }
    });
  });

  // Track -> Visuals
  gsap.to(camera.position, {
    x: 0, y: 0, z: 2.5,
    ease: "power2.inOut",
    scrollTrigger: {
      trigger: "#visuals",
      start: "top bottom",
      end: "center center",
      scrub: 1
    }
  });

  gsap.to(sceneGroup.rotation, {
    x: Math.PI / 4,
    y: 0,
    z: 0,
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: "#visuals",
      start: "top bottom",
      end: "center center",
      scrub: 1
    }
  });

  // Reset letters on Visuals
  letters.forEach((mesh) => {
    gsap.to(mesh.position, {
      x: mesh.userData.origX,
      y: mesh.userData.origY,
      z: mesh.userData.origZ,
      scrollTrigger: {
        trigger: "#visuals",
        start: "top center",
        end: "bottom center",
        scrub: 1
      }
    });
  });

  // Visuals -> Lyrics
  gsap.to(camera.position, {
    x: -3, y: 1, z: 6,
    scrollTrigger: {
      trigger: "#lyrics",
      start: "top bottom",
      end: "center center",
      scrub: 1
    }
  });

  // Lyrics -> Tour -> Contact
  gsap.to(sceneGroup.rotation, {
    y: Math.PI * 2,
    scrollTrigger: {
      trigger: "#tour",
      start: "top bottom",
      end: "bottom center",
      scrub: 2
    }
  });

  gsap.to(camera.position, {
    x: 0, y: 1.2, z: 5.5,
    scrollTrigger: {
      trigger: "#contact",
      start: "top bottom",
      end: "center center",
      scrub: 1
    }
  });


  // --- Animation Loop ---
  function animate() {
    const t = performance.now() * 0.001;
    const levels = getAudioLevels();
    const amp = levels.avg;
    const band = levels.band;

    const moodMul = currentMood === 'energetic' ? 2.5 : 1.0;
    const freqBandMap = [band * moodMul, amp * moodMul, band * moodMul * 0.8];

    letters.forEach((mesh) => {
      const ud = mesh.userData;
      const fb = freqBandMap[ud.freqBand] || 0;
      const float = Math.sin(t * ud.rotSpeed + ud.floatOff) * 0.05;
      const reactY = fb * 0.3;
      const reactS = 1 + fb * 0.4;
      
      mesh.scale.setScalar(reactS);
      mesh.rotation.z = Math.sin(t * ud.rotSpeed * 0.5 + ud.floatOff) * fb * 0.3;
      mesh.rotation.y = t * 0.2 + fb * 0.1;
      mesh.material.emissiveIntensity = 0.15 + fb * 0.5;
    });

    const pArr = particles.geometry.attributes.position.array;
    for (let i = 0; i < pArr.length; i += 3) {
      pArr[i + 1] += Math.sin(t + i * 0.01) * (0.001 + amp * 0.005); // Y
      pArr[i] += Math.sin(t * 0.5 + i * 0.02) * (0.001 + band * 0.003); // X
      
      if (pArr[i + 1] > 6) pArr[i + 1] = -4;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.material.opacity = 0.5 + amp * 0.5;
    particles.material.size = 0.03 + band * 0.05;

    renderer.toneMappingExposure = 1.0 + amp * 0.5;
    key.intensity = 1.4 + amp * 0.8;
    rim.intensity = 0.8 + band * 0.6;

    if (freqIndicator && isPlaying) {
      freqIndicator.textContent = `🎵 Freq: ${(band * 100).toFixed(0)}% | Amp: ${(amp * 100).toFixed(0)}%`;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
});

(function () {
  'use strict';

  const ATMOSPHERIC_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const MOODS = {
    neutral: { bg: 0xfaf8f4, bloom: 0.05, morph: 0.3, color: 0x4a7a8a },
    warm: { bg: 0xf5ede4, bloom: 0.12, morph: 0.5, color: 0xb47a4a },
    cool: { bg: 0xe8f0f5, bloom: 0.08, morph: 0.2, color: 0x4a6a8a },
    dramatic: { bg: 0xf0e8e0, bloom: 0.2, morph: 0.8, color: 0x8a4a4a }
  };

  const WORDS = ['CREA', 'INNOVA', 'TRANSFORMA'];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    scrubRange: document.getElementById('scrub-range'),
    scrubTime: document.getElementById('scrub-time'),
    bgVideo: document.getElementById('bg-video'),
    trackingSlider: document.getElementById('tracking-slider'),
    weightSlider: document.getElementById('weight-slider'),
    moodBtns: document.querySelectorAll('.mood-btn'),
    stemMusic: document.getElementById('stem-music'),
    stemNarration: document.getElementById('stem-narration'),
    stemFx: document.getElementById('stem-fx'),
    exportBtn: document.getElementById('export-btn'),
    fallbackBtn: document.getElementById('fallback-btn'),
    fallbackSection: document.getElementById('fallback-section'),
    fbGrid: document.getElementById('fb-grid'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body')
  };

  let scene, camera, renderer;
  let letterMeshes = [];
  let videoTexture, videoMesh;
  let currentMood = 'neutral';
  let animFrameId = null;
  let clock = new THREE.Clock();
  let audioCtx, analyser, sourceNode;
  let audioData = new Uint8Array(128);
  let isScrubbing = false;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(MOODS.neutral.bg);
    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
    camera.position.set(0, 0.3, 3.2);
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    dom.sceneRoot.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 0.8);
    key.position.set(2, 3, 2);
    scene.add(key);

    /* Atmospheric video plane in background */
    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.src = ATMOSPHERIC_VIDEO;
    vid.loop = true;
    vid.muted = true;
    vid.preload = 'auto';
    vid.load();
    vid.play().catch(() => {});
    dom.bgVideo = vid;

    const tex = new THREE.VideoTexture(vid);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    const vidMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.25 });
    const geo = new THREE.PlaneGeometry(3.2, 1.8);
    videoMesh = new THREE.Mesh(geo, vidMat);
    videoMesh.position.z = -0.5;
    videoMesh.position.y = 0.1;
    scene.add(videoMesh);
    videoTexture = tex;

    /* 3D letter columns */
    const letters = WORDS.join('').split('');
    const cols = 3;
    const spacing = 0.55;
    const startX = -((cols - 1) * spacing) / 2;

    letters.forEach((ch, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacing;
      const y = 0.35 - row * 0.32;

      /* Low‑poly letter: use box as proxy */
      const w = 0.08 + Math.random() * 0.04;
      const h = 0.12 + Math.random() * 0.04;
      const d = 0.04 + Math.random() * 0.02;
      const mat = new THREE.MeshStandardMaterial({
        color: MOODS.neutral.color,
        roughness: 0.3,
        metalness: 0.2,
        emissive: new THREE.Color(MOODS.neutral.color),
        emissiveIntensity: 0.05
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, 0);
      mesh.castShadow = true;

      /* Normal map simulation: slight rotation */
      mesh.userData = {
        baseX: x, baseY: y, baseZ: 0,
        origW: w, origH: h, origD: d,
        speed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        char: ch
      };
      scene.add(mesh);
      letterMeshes.push(mesh);
    });

    /* Room for audio analysis */
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      sourceNode = audioCtx.createMediaElementSource(vid);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) { console.warn('AudioContext not available'); }
  }

  /* ---------- Scrubbing ---------- */
  dom.scrubRange.addEventListener('input', (e) => {
    isScrubbing = true;
    const pct = parseInt(e.target.value) / 1000;
    if (dom.bgVideo && dom.bgVideo.duration) {
      dom.bgVideo.currentTime = pct * dom.bgVideo.duration;
      dom.scrubTime.textContent = formatTime(dom.bgVideo.currentTime);
    }
    updateTypeFromVideo(pct);
  });
  dom.scrubRange.addEventListener('change', () => { isScrubbing = false; });

  dom.bgVideo.addEventListener('timeupdate', () => {
    if (!isScrubbing && dom.bgVideo) {
      const pct = dom.bgVideo.duration ? dom.bgVideo.currentTime / dom.bgVideo.duration : 0;
      dom.scrubRange.value = Math.round(pct * 1000);
      dom.scrubTime.textContent = formatTime(dom.bgVideo.currentTime);
    }
  });

  function updateTypeFromVideo(pct) {
    /* Morphing: scale letters based on video position */
    letterMeshes.forEach((m, i) => {
      const morph = MOODS[currentMood].morph;
      const offset = Math.sin(pct * Math.PI * 2 + i * 0.5) * 0.03 * morph;
      if (!prefersReducedMotion) {
        m.scale.z = 1 + offset;
        m.position.z = m.userData.baseZ + offset * 0.5;
      }
      /* Emissive reacts to video */
      const intensity = 0.05 + Math.sin(pct * Math.PI * 4 + i) * 0.08;
      m.material.emissiveIntensity = Math.max(0, intensity);
    });
  }

  /* ---------- Tracking/Weight sliders ---------- */
  dom.trackingSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    letterMeshes.forEach((m, i) => {
      const spread = i - letterMeshes.length / 2;
      m.position.x = m.userData.baseX + spread * val * 0.3;
    });
  });

  dom.weightSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    letterMeshes.forEach((m) => {
      const s = val;
      m.scale.x = s;
      m.scale.y = s;
    });
  });

  /* ---------- Mood presets ---------- */
  dom.moodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.moodBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setMood(btn.dataset.mood);
    });
  });

  function setMood(mood) {
    currentMood = mood;
    const m = MOODS[mood];
    if (!prefersReducedMotion) {
      gsap.to(scene.background, { r: ((m.bg >> 16) & 0xff) / 255, g: ((m.bg >> 8) & 0xff) / 255, b: (m.bg & 0xff) / 255, duration: 0.5 });
    } else {
      scene.background.setHex(m.bg);
    }
    const c = new THREE.Color(m.color);
    letterMeshes.forEach((mesh) => {
      if (!prefersReducedMotion) {
        gsap.to(mesh.material.color, { r: c.r, g: c.g, b: c.b, duration: 0.4 });
        gsap.to(mesh.material.emissive, { r: c.r, g: c.g, b: c.b, duration: 0.4 });
      } else {
        mesh.material.color.copy(c);
        mesh.material.emissive.copy(c);
      }
    });
    /* Video opacity by mood */
    if (videoMesh) {
      const opacities = { neutral: 0.25, warm: 0.35, cool: 0.2, dramatic: 0.45 };
      if (!prefersReducedMotion) {
        gsap.to(videoMesh.material, { opacity: opacities[mood] || 0.25, duration: 0.5 });
      } else {
        videoMesh.material.opacity = opacities[mood] || 0.25;
      }
    }
  }

  /* ---------- Audio stems ---------- */
  dom.stemMusic.addEventListener('change', updateStems);
  dom.stemNarration.addEventListener('change', updateStems);
  dom.stemFx.addEventListener('change', updateStems);

  function updateStems() {
    if (!audioCtx || !sourceNode) return;
    /* Simple gain staging simulation */
    const gain = audioCtx.createGain();
    let g = 0;
    if (dom.stemMusic.checked) g += 0.4;
    if (dom.stemNarration.checked) g += 0.4;
    if (dom.stemFx.checked) g += 0.2;
    gain.gain.value = g;
    sourceNode.disconnect();
    sourceNode.connect(gain);
    gain.connect(audioCtx.destination);
  }

  /* ---------- Export frame ---------- */
  dom.exportBtn.addEventListener('click', () => {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = `cinetype-mood-${currentMood}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
  });

  /* ---------- 2D fallback ---------- */
  dom.fallbackBtn.addEventListener('click', () => {
    const hidden = dom.fallbackSection.classList.contains('hidden');
    dom.fallbackSection.classList.toggle('hidden');
    if (!hidden) return;
    dom.fbGrid.innerHTML = `
      <div class="fb-card">
        <video controls preload="metadata" src="${ATMOSPHERIC_VIDEO}"></video>
        <div><h3>Video Atmosférico</h3><p>Tipografía cinemática · Moods: Neutral, Cálido, Frío, Dramático</p></div>
      </div>
      <div class="fb-card" style="flex-direction:column">
        <h3 style="font-size:1.2rem;letter-spacing:.15em;text-align:center">CREA INNOVA TRANSFORMA</h3>
        <p style="text-align:center">Ajusta tracking y peso con los sliders. Cambia moods para alterar color grading.</p>
      </div>`;
  });

  /* ---------- Modal ---------- */
  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
  dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

  /* ---------- Lifecycle ---------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    else if (!document.hidden && !animFrameId) animFrameId = requestAnimationFrame(animate);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId) animFrameId = requestAnimationFrame(animate);
      else if (!entry.isIntersecting && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    });
  }, { threshold: 0.05 });

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = dom.sceneRoot.clientWidth / dom.sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.sceneRoot.clientWidth, dom.sceneRoot.clientHeight);
  });

  function animate() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    if (!prefersReducedMotion) {
      letterMeshes.forEach((m, i) => {
        const ud = m.userData;
        const wave = Math.sin(t * ud.speed + ud.phase);
        m.position.y = ud.baseY + wave * 0.02;
        m.rotation.y = Math.sin(t * ud.speed * 0.5 + ud.phase) * 0.05;
        m.rotation.x = Math.cos(t * ud.speed * 0.3 + ud.phase) * 0.03;
      });
    }

    if (analyser && !isScrubbing) {
      analyser.getByteFrequencyData(audioData);
      const avg = audioData.reduce((a, b) => a + b, 0) / audioData.length;
      const intensity = avg / 255;
      letterMeshes.forEach((m) => {
        m.material.emissiveIntensity = 0.05 + intensity * 0.3;
      });
    }

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function init() {
    initScene();
    setMood('neutral');
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

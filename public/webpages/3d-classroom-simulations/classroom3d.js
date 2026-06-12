(function () {
  'use strict';

  /* ── Modules Data ── */
  const MODULES = [
    {
      id: 0,
      title: 'Péndulo Simple',
      desc: 'Estudio del movimiento armónico simple. Ajusta masa y longitud para modificar el período.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      chapters: [
        { time: 0, label: '▶ Intro' },
        { time: 5, label: 'Concepto' },
        { time: 10, label: 'Ecuación' },
        { time: 15, label: 'Ejemplo' },
        { time: 20, label: 'Ejercicio' }
      ],
      exercise: {
        text: 'Ajusta los parámetros para que el período sea exactamente 2.0 s.',
        targetPeriod: 2.0,
        tolerance: 0.05,
        solveParams: { mass: 1.0, length: 1.0, friction: 0.0 }
      },
      transcript: `Bienvenidos al estudio del péndulo simple.\nEn esta lección aprenderemos cómo la masa, la longitud y la fricción afectan el período de oscilación.\nLa ecuación fundamental es T = 2π √(L/g).\nObserva cómo al variar la longitud, el período cambia proporcionalmente a su raíz cuadrada.\nEjercicio: Encuentra la configuración que produce un período exacto de 2.0 segundos.`
    },
    {
      id: 1,
      title: 'Plano Inclinado',
      desc: 'Fuerzas en un plano inclinado. Modifica el ángulo y el coeficiente de rozamiento.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      chapters: [
        { time: 0, label: '▶ Intro' },
        { time: 4, label: 'Diagrama' },
        { time: 9, label: 'Fórmulas' },
        { time: 14, label: 'Demo' },
        { time: 18, label: 'Ejercicio' }
      ],
      exercise: {
        text: 'Ajusta el ángulo para que el bloque se deslice con aceleración 2.0 m/s².',
        targetPeriod: 2.0,
        tolerance: 0.1,
        solveParams: { angle: 30, friction: 0.15 }
      },
      transcript: `Estudio del plano inclinado.\nLas fuerzas que actúan son el peso, la normal y el rozamiento.\nLa aceleración depende del ángulo y del coeficiente de rozamiento.\nDescomponemos el peso en componentes paralela y perpendicular al plano.\nEjercicio: Encuentra el ángulo para una aceleración de 2.0 m/s².`
    },
    {
      id: 2,
      title: 'Sistema Masa-Resorte',
      desc: 'Oscilación armónica de un resorte. Varía la constante k y la masa.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      chapters: [
        { time: 0, label: '▶ Intro' },
        { time: 5, label: 'Ley Hooke' },
        { time: 10, label: 'Ecuación' },
        { time: 14, label: 'Gráfica' },
        { time: 19, label: 'Ejercicio' }
      ],
      exercise: {
        text: 'Ajusta k y masa para que la frecuencia angular sea 2.0 rad/s.',
        targetPeriod: 3.14159,
        tolerance: 0.1,
        solveParams: { mass: 1.0, k: 4.0, friction: 0.02 }
      },
      transcript: `Estudio del sistema masa-resorte.\nLa ley de Hooke establece F = -kx.\nLa frecuencia angular es ω = √(k/m).\nEl período es T = 2π √(m/k).\nEjercicio: Encuentra la combinación que da ω = 2.0 rad/s.`
    }
  ];

  /* ── DOM refs ── */
  const sceneRoot = document.getElementById('scene-root');
  const video = document.getElementById('lesson-video');
  const sidebar = document.getElementById('sidebar');
  const lessonTitle = document.getElementById('lesson-title');
  const lessonDesc = document.getElementById('lesson-desc');
  const timelineTrack = document.getElementById('timeline-track');
  const timelineProgress = document.getElementById('timeline-progress');
  const timeDisplay = document.getElementById('time-display');
  const massSlider = document.getElementById('mass-slider');
  const lenSlider = document.getElementById('len-slider');
  const fricSlider = document.getElementById('fric-slider');
  const massVal = document.getElementById('mass-val');
  const lenVal = document.getElementById('len-val');
  const fricVal = document.getElementById('fric-val');
  const applyBtn = document.getElementById('apply-btn');
  const sandbox = document.getElementById('sandbox');
  const exerciseText = document.getElementById('exercise-text');
  const sandboxFeedback = document.getElementById('sandbox-feedback');
  const solveBtn = document.getElementById('solve-btn');
  const transcriptContent = document.getElementById('transcript-content');
  const fallbackSection = document.getElementById('fallback-section');
  const fallbackToggle = document.getElementById('fallback-toggle');
  const fbGrid = document.getElementById('fb-grid');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  const modalVideo = document.getElementById('modal-video');
  const modalBody = document.getElementById('modal-body');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const moduleBtns = document.querySelectorAll('.module-btn');

  /* ── State ── */
  let currentModule = 0;
  let simParams = { mass: 1.0, length: 2.0, friction: 0.05, k: 2.0, angle: 30 };
  let simState = { theta: 0.3, omega: 0, x: 0.5, v: 0 };
  let isPlaying = false;
  let isSyncing = false;
  let animFrameId = null;
  let dbReady = false;
  let scene, camera, renderer;
  let pendulumPivot, pendulumArm, pendulumBob;
  let springMass, springCoil;
  let inclineBlock, inclinePlane;
  let clock = new THREE.Clock();

  /* ── IndexedDB ── */
  function openDB() {
    const req = indexedDB.open('ClassroomState', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('modules'))
        db.createObjectStore('modules', { keyPath: 'id' });
    };
    req.onsuccess = (e) => {
      dbReady = true;
      loadState();
    };
    req.onerror = () => console.warn('IndexedDB not available');
  }

  function saveState() {
    if (!dbReady) return;
    const tx = indexedDB.open('ClassroomState', 1).result.transaction('modules', 'readwrite');
    tx.objectStore('modules').put({
      id: currentModule,
      params: { ...simParams },
      state: { ...simState },
      videoTime: video.currentTime,
      timestamp: Date.now()
    });
  }

  function loadState() {
    try {
      const db = indexedDB.open('ClassroomState', 1).result;
      const tx = db.transaction('modules', 'readonly');
      const req = tx.objectStore('modules').get(currentModule);
      req.onsuccess = () => {
        const data = req.result;
        if (data && data.params) {
          Object.assign(simParams, data.params);
          Object.assign(simState, data.state || simState);
          if (data.videoTime != null && isFinite(data.videoTime)) {
            video.currentTime = data.videoTime;
          }
          syncSliders();
        }
      };
    } catch (e) { /* ignore */ }
  }

  /* ── Web Worker for physics ── */
  const workerCode = `
    self.onmessage = function(e) {
      const { type, params, dt } = e.data;
      if (type !== 'step') return;
      let { theta, omega, x, v } = e.data.state;
      const { mass, length, friction, k, modId } = params;
      const damping = friction * 2;
      if (modId === 0) {
        const g = 9.81;
        const alpha = -(g / length) * Math.sin(theta) - damping * omega;
        omega += alpha * dt;
        theta += omega * dt;
      } else if (modId === 2) {
        const a = -(k / mass) * x - damping * v;
        v += a * dt;
        x += v * dt;
      }
      self.postMessage({ type: 'result', state: { theta, omega, x, v } });
    };
  `;
  const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(workerBlob);
  const physicsWorker = new Worker(workerUrl);

  /* ── Three.js scene ── */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ece4);

    camera = new THREE.PerspectiveCamera(40, sceneRoot.clientWidth / sceneRoot.clientHeight, 0.1, 20);
    camera.position.set(1.2, 1.5, 2.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(sceneRoot.clientWidth, sceneRoot.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    sceneRoot.appendChild(renderer.domElement);

    /* Lights */
    const amb = new THREE.AmbientLight(0xfff5ee, 0.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff5ee, 1.0);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e4de, 0.3);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xd4c8b4, roughness: 0.8, metalness: 0
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.4;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Desk surface */
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0xe0d8cc, roughness: 0.6, metalness: 0.02
    });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 2.0), deskMat);
    desk.position.set(0, -0.36, 0);
    desk.receiveShadow = true;
    desk.castShadow = true;
    scene.add(desk);

    /* Chalkboard */
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x1b2a4a, roughness: 0.7, metalness: 0.05
    });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), boardMat);
    board.position.set(0, 0.5, -1.1);
    scene.add(board);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xb4a892, roughness: 0.5 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.04, 0.03), frameMat);
    frame.position.set(0, 0.5, -1.08);
    scene.add(frame);

    /* Create simulation objects */
    createPendulum();
    createSpring();
    createIncline();
    showModule(currentModule);
  }

  function createPendulum() {
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, metalness: 0.3, roughness: 0.4 });
    const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.06), pivotMat);
    pivot.position.set(0, 0.3, 0);
    pivot.castShadow = true;
    scene.add(pivot);
    pendulumPivot = pivot;

    const armMat = new THREE.MeshStandardMaterial({ color: 0xb4a892, roughness: 0.5 });
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1), armMat);
    arm.position.set(0, -0.2, 0);
    arm.castShadow = true;
    pendulumArm = arm;
    scene.add(arm);

    const bobMat = new THREE.MeshStandardMaterial({ color: 0x3a6a8a, metalness: 0.2, roughness: 0.3 });
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.08), bobMat);
    bob.position.set(0, -0.7, 0);
    bob.castShadow = true;
    pendulumBob = bob;
    scene.add(bob);
  }

  function createSpring() {
    const springMat = new THREE.MeshStandardMaterial({ color: 0x5a5a6a, metalness: 0.6, roughness: 0.2 });
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), springMat);
    coil.position.set(0.6, -0.1, 0);
    coil.castShadow = true;
    springCoil = coil;
    scene.add(coil);

    const massMat = new THREE.MeshStandardMaterial({ color: 0x8a3a3a, roughness: 0.4 });
    const mass = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.08), massMat);
    mass.position.set(0.6, -0.35, 0);
    mass.castShadow = true;
    springMass = mass;
    scene.add(mass);

    /* Ceiling mount */
    const mount = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.04), springMat);
    mount.position.set(0.6, 0.32, 0);
    scene.add(mount);
  }

  function createIncline() {
    const planeMat = new THREE.MeshStandardMaterial({ color: 0xc4b8a8, roughness: 0.8, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), planeMat);
    plane.position.set(-0.4, -0.2, 0);
    plane.castShadow = true;
    plane.receiveShadow = true;
    inclinePlane = plane;
    scene.add(plane);

    const blockMat = new THREE.MeshStandardMaterial({ color: 0x5a7a4a, roughness: 0.5 });
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.06), blockMat);
    block.position.set(-0.4, -0.12, 0);
    block.castShadow = true;
    inclineBlock = block;
    scene.add(block);
  }

  function showModule(modId) {
    const showPendulum = modId === 0;
    const showIncline = modId === 1;
    const showSpring = modId === 2;
    if (pendulumPivot) {
      pendulumPivot.visible = showPendulum;
      pendulumArm.visible = showPendulum;
      pendulumBob.visible = showPendulum;
    }
    if (inclinePlane) {
      inclinePlane.visible = showIncline;
      inclineBlock.visible = showIncline;
    }
    if (springCoil) {
      springCoil.visible = showSpring;
      springMass.visible = showSpring;
    }
    sandbox.classList.toggle('hidden', modId !== 0);
  }

  /* ── Physics update ── */
  function updateSimulation(dt) {
    if (!dt || dt > 0.05) dt = 0.016;
    const modId = currentModule;

    if (modId === 0) {
      /* Pendulum — use worker */
      physicsWorker.postMessage({
        type: 'step',
        params: { ...simParams, modId },
        state: { ...simState },
        dt
      });
    } else if (modId === 1) {
      /* Incline: simple analytic */
      const angleRad = simParams.angle * Math.PI / 180;
      const g = 9.81;
      const a = g * Math.sin(angleRad) - simParams.friction * g * Math.cos(angleRad);
      simState.v += a * dt;
      simState.x += simState.v * dt;
      if (simState.x > 0.25) { simState.x = 0.25; simState.v = 0; }
      if (simState.x < 0) { simState.x = 0; simState.v = 0; }
    } else if (modId === 2) {
      /* Spring — use worker */
      physicsWorker.postMessage({
        type: 'step',
        params: { ...simParams, modId },
        state: { ...simState },
        dt
      });
    }
  }

  /* Worker response handler */
  physicsWorker.onmessage = (e) => {
    if (e.data.type === 'result') {
      Object.assign(simState, e.data.state);
    }
  };

  /* ── Render 3D objects ── */
  function renderSimulation() {
    const modId = currentModule;
    if (modId === 0 && pendulumArm) {
      const theta = simState.theta || 0;
      const len = simParams.length || 2;
      pendulumArm.scale.y = len;
      pendulumArm.position.y = 0.3 - len * 0.5;
      pendulumArm.rotation.z = theta;
      const bobY = 0.3 - len;
      const bobX = Math.sin(theta) * len;
      pendulumBob.position.set(bobX, bobY + 0.02, 0);
      pendulumBob.position.x = bobX;
      pendulumBob.position.y = bobY + 0.02;
    }
    if (modId === 1 && inclineBlock) {
      const angleRad = simParams.angle * Math.PI / 180;
      inclinePlane.rotation.z = angleRad;
      inclinePlane.position.y = -0.2 + Math.sin(angleRad) * 0.15;
      const blockPos = simState.x || 0;
      inclineBlock.position.set(
        -0.4 + blockPos * Math.cos(angleRad),
        -0.12 + blockPos * Math.sin(angleRad) + Math.cos(angleRad) * 0.02,
        0
      );
    }
    if (modId === 2 && springMass) {
      const x = simState.x || 0;
      springMass.position.y = -0.35 - x;
      springCoil.scale.y = 1 + x * 2;
      springCoil.position.y = -0.1 - x;
    }
  }

  /* ── Video master clock sync ── */
  function setupVideoSync() {
    video.addEventListener('timeupdate', () => {
      if (isSyncing) return;
      const ct = video.currentTime;
      const dur = video.duration || 1;
      timelineProgress.style.width = `${(ct / dur) * 100}%`;
      timeDisplay.textContent = `${fmtTime(ct)} / ${fmtTime(dur)}`;

      /* Fire cues: when crossing a chapter, log it */
      const mod = MODULES[currentModule];
      mod.chapters.forEach((ch) => {
        if (Math.abs(ct - ch.time) < 0.15) {
          sandboxFeedback.textContent = `📍 ${ch.label}`;
        }
      });

      /* Sync simulation to video time for pendulum */
      if (currentModule === 0) {
        const period = 2 * Math.PI * Math.sqrt(simParams.length / 9.81);
        const phase = (ct * 2 * Math.PI) / period;
        if (!isPlaying) {
          simState.theta = 0.3 * Math.sin(phase);
        }
      }
    });

    video.addEventListener('play', () => { isPlaying = true; });
    video.addEventListener('pause', () => { isPlaying = false; });

    /* Scrubbing on timeline */
    timelineTrack.addEventListener('click', (e) => {
      const rect = timelineTrack.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      video.currentTime = pct * (video.duration || 1);
    });
  }

  /* ── AudioContext alignment ── */
  let audioCtx = null;
  function ensureAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }
  document.addEventListener('click', ensureAudioCtx, { once: true });

  /* ── GSAP interpolation helpers ── */
  function gsapInterpolate(target, props, duration, ease) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Object.assign(target, props);
      return;
    }
    gsap.to(target, { ...props, duration: duration || 0.4, ease: ease || 'power2.out' });
  }

  /* ── Module switching ── */
  function loadModule(modId) {
    currentModule = modId;
    const mod = MODULES[modId];
    lessonTitle.textContent = mod.title;
    lessonDesc.textContent = mod.desc;

    /* Load video */
    const wasPaused = video.paused;
    video.src = mod.videoUrl;
    video.load();
    if (!wasPaused) video.play();

    /* Update chapters */
    document.querySelectorAll('.marker').forEach((el, i) => {
      const ch = mod.chapters[i];
      if (ch) {
        el.textContent = ch.label;
        el.style.left = `${(ch.time / 20) * 100}%`;
        el.dataset.time = ch.time;
      }
    });

    /* Exercise */
    exerciseText.textContent = mod.exercise.text;

    /* Transcript */
    transcriptContent.textContent = mod.transcript;

    /* Reset simulation */
    simState = { theta: 0.3, omega: 0, x: 0.5, v: 0 };

    /* Show correct 3D objects */
    showModule(modId);

    /* Load saved state */
    loadState();

    /* Sync sliders */
    syncSliders();
  }

  /* ── Slider sync ── */
  function syncSliders() {
    massSlider.value = simParams.mass;
    lenSlider.value = simParams.length;
    fricSlider.value = simParams.friction;
    massVal.textContent = simParams.mass.toFixed(1);
    lenVal.textContent = simParams.length.toFixed(1);
    fricVal.textContent = simParams.friction.toFixed(2);
  }

  /* ── Event binding ── */
  moduleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      moduleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      loadModule(parseInt(btn.dataset.module));
    });
  });

  massSlider.addEventListener('input', () => {
    simParams.mass = parseFloat(massSlider.value);
    massVal.textContent = simParams.mass.toFixed(1);
  });
  lenSlider.addEventListener('input', () => {
    simParams.length = parseFloat(lenSlider.value);
    lenVal.textContent = simParams.length.toFixed(1);
  });
  fricSlider.addEventListener('input', () => {
    simParams.friction = parseFloat(fricSlider.value);
    fricVal.textContent = simParams.friction.toFixed(2);
  });

  applyBtn.addEventListener('click', () => {
    /* Gently reset simulation with new params via GSAP */
    simState.theta = 0.3;
    simState.omega = 0;
    simState.x = 0.5;
    simState.v = 0;
    sandboxFeedback.textContent = '🔄 Parámetros aplicados — simulación reiniciada.';
    if (currentModule === 0) {
      const period = 2 * Math.PI * Math.sqrt(simParams.length / 9.81);
      sandboxFeedback.textContent += ` Período estimado: ${period.toFixed(2)} s.`;
    }
    checkExercise();
  });

  function checkExercise() {
    if (currentModule === 0) {
      const period = 2 * Math.PI * Math.sqrt(simParams.length / 9.81);
      const diff = Math.abs(period - 2.0);
      if (diff < 0.05) {
        sandboxFeedback.textContent = '✅ ¡Correcto! El período es ~2.0 s.';
      } else {
        sandboxFeedback.textContent = `📐 Período actual: ${period.toFixed(3)} s (objetivo: 2.0 s).`;
      }
    }
  }

  solveBtn.addEventListener('click', () => {
    const mod = MODULES[currentModule];
    const sp = mod.exercise.solveParams;
    Object.assign(simParams, sp);
    syncSliders();
    sandboxFeedback.textContent = '💡 Solución cargada. Observa los parámetros y el resultado.';
    /* Reproduce solución video */
    modalVideo.src = MODULES[currentModule].videoUrl;
    modalVideo.load();
    modalVideo.play();
    modalBody.innerHTML = `<p class="desc">Solución: masa=${sp.mass}, longitud=${sp.length}, fricción=${sp.friction || 0}</p>`;
    modal.classList.remove('hidden');
  });

  /* ── Save / Reset ── */
  saveBtn.addEventListener('click', () => {
    saveState();
    sandboxFeedback.textContent = '💾 Progreso guardado.';
  });
  resetBtn.addEventListener('click', () => {
    const mod = MODULES[currentModule];
    simParams = { mass: 1.0, length: 2.0, friction: 0.05, k: 2.0, angle: 30 };
    simState = { theta: 0.3, omega: 0, x: 0.5, v: 0 };
    syncSliders();
    video.currentTime = 0;
    sandboxFeedback.textContent = '↺ Todo ha sido restablecido.';
  });

  /* ── Fallback 2D ── */
  fallbackToggle.addEventListener('click', () => {
    const isHidden = fallbackSection.classList.contains('hidden');
    fallbackSection.classList.toggle('hidden');
    if (!isHidden) return;
    fbGrid.innerHTML = '';
    MODULES.forEach((mod) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `
        <h3>${mod.title}</h3>
        <video controls preload="metadata" src="${mod.videoUrl}" crossorigin="anonymous"></video>
        <p>${mod.desc}</p>
        <div style="margin-top:.3rem;display:flex;gap:.25rem;flex-wrap:wrap">
          ${mod.transcript.split('\n').slice(0, 2).map((l) => `<span style="font-size:.6rem;background:var(--bg);padding:.1rem .3rem;border-radius:4px;color:var(--muted)">${l}</span>`).join('')}
        </div>
      `;
      fbGrid.appendChild(card);
    });
  });

  /* ── Modal ── */
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modalVideo.pause();
    }
  });
  modalClose.addEventListener('click', () => {
    modal.classList.add('hidden');
    modalVideo.pause();
  });

  /* ── IntersectionObserver for animation loop ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId) {
        animFrameId = requestAnimationFrame(animate);
      } else if (!entry.isIntersecting && animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    });
  }, { threshold: 0.05 });

  /* ── Animation loop ── */
  function animate() {
    const dt = clock.getDelta();
    if (isPlaying || true) {
      updateSimulation(dt);
      renderSimulation();
    }
    if (camera && renderer) {
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animFrameId = requestAnimationFrame(animate);
  }

  function fmtTime(s) {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  /* ── Window resize ── */
  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = sceneRoot.clientWidth / sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneRoot.clientWidth, sceneRoot.clientHeight);
  });

  /* ── Init ── */
  function init() {
    openDB();
    initScene();
    setupVideoSync();
    loadModule(0);
    observer.observe(sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

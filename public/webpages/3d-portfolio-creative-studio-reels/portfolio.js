import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    // ─── STUDIO PORTFOLIO PROJECTS DATA ──────────────────────────────────────────
    const PROJECTS = [
      {
        id: 0,
        num: "I",
        cat: "3D & Augmented Reality",
        title: "Virtuality",
        desc: "Step into a glowing modular simulation. We build immersive holographic grids and high-frequency code arrays that redefine spacial dimensions.",
        dur: 30,
        color: "#c5a059",
        subs: [
          { s: 0,  e: 7,  t: "Welcome to Virtuality. A universe built on clean 3D coordinate mathematics." },
          { s: 7,  e: 15, t: "Here, geometric planes morph to express new topological spatial dimensions." },
          { s: 15, e: 23, t: "We construct holographic code structures that bridges real spaces with digital interfaces." },
          { s: 23, e: 30, t: "Virtuality — Shaping the next generation of creative spatial interaction." }
        ]
      },
      {
        id: 1,
        num: "II",
        cat: "Kinetic Typography",
        title: "Motion",
        desc: "Hypnotic mathematical geometry and typographic grids morphing seamlessly. Elegant kinetic lines conveying message with pristine weight and speed.",
        dur: 30,
        color: "#c5a059",
        subs: [
          { s: 0,  e: 8,  t: "Part II — Kinetic Motion. Text becomes fluid, dancing across grids." },
          { s: 8,  e: 16, t: "Concentric vectors align, reacting instantly to spatial forces and scrolling physics." },
          { s: 16, e: 24, t: "Every movement is calculated with elegant mathematical curves and ease." },
          { s: 24, e: 30, t: "Motion — The voice of message expressed through silent dynamic poetry." }
        ]
      },
      {
        id: 2,
        num: "III",
        cat: "Brand Identity & Luxury",
        title: "Luxury",
        desc: "Sleek fluid gold ripples and high-end editorial layouts. Crafting timeless identity systems for top-tier global enterprise and fashion labels.",
        dur: 30,
        color: "#c5a059",
        subs: [
          { s: 0,  e: 7,  t: "Part III — Luxury Branding. Translating high prestige into pure fluid forms." },
          { s: 7,  e: 15, t: "Metallic gold ripples flow gracefully, embodying editorial elegance." },
          { s: 15, e: 23, t: "We build iconic identity systems that define standard guidelines globally." },
          { s: 23, e: 30, t: "Luxury — Simplicity, restraint, and pristine golden craftsmanship." }
        ]
      },
      {
        id: 3,
        num: "IV",
        cat: "Interactive Audio Visualizer",
        title: "Acoustics",
        desc: "Fusing geometry with acoustic frequencies. Sound waves and visual nodes dancing in perfect unison, synthesizing direct real-time feedback loops.",
        dur: 30,
        color: "#c5a059",
        subs: [
          { s: 0,  e: 8,  t: "Part IV — Acoustics. Sound wave coordinates translated directly to visual structures." },
          { s: 8,  e: 16, t: "Every bar and ring pulses in sintonization with synthesized ambient frequencies." },
          { s: 16, e: 24, t: "A real-time feedback loop between ears and eyes, geometry and math." },
          { s: 24, e: 30, t: "Acoustics — Immersive spatial symphonies synthesized live for your browser." }
        ]
      }
    ];

    // Global Interactive State
    let activeProjectId = 0;
    let scrollPercent = 0;
    
    // Modal play state
    let activeModalProject = null;
    let modalProgress = 0;
    let modalPlaying = false;
    let modalRaf = null;
    let modalLastTime = null;
    let ccEnabled = true;

    // ─── AUDIO ENGINE (Web Audio API Synthesizer) ──────────────────────────────
    let audioCtx = null;
    let mainGain = null;
    let audioEnabled = true;

    // Stems gains
    let stemGains = [];
    let stemNodes = [];

    function initAudio() {
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      mainGain = audioCtx.createGain();
      mainGain.gain.setValueAtTime(0.35, audioCtx.currentTime); // moderate master
      mainGain.connect(audioCtx.destination);

      // Create stem channels for each project
      PROJECTS.forEach((proj, idx) => {
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(idx === 0 ? 0.8 : 0.001, audioCtx.currentTime); // fade-in first project
        gain.connect(mainGain);
        stemGains.push(gain);
        
        // Start synthesizers
        if (idx === 0) startVirtualitySynth(gain);
        if (idx === 1) startMotionSynth(gain);
        if (idx === 2) startLuxurySynth(gain);
        if (idx === 3) startAcousticSynth(gain);
      });
    }

    function startVirtualitySynth(gainNode) {
      // Spacey low pad
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(73.42, audioCtx.currentTime); // D2
      osc2.frequency.setValueAtTime(110.00, audioCtx.currentTime); // A2

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, audioCtx.currentTime);
      filter.Q.setValueAtTime(4, audioCtx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);

      osc1.start();
      osc2.start();

      // Low frequency modulation of filter
      const lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, audioCtx.currentTime);
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(80, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
    }

    function startMotionSynth(gainNode) {
      // Shimmering arpeggiator/ticking clicks
      let step = 0;
      const pitches = [146.83, 164.81, 196.00, 220.00, 293.66]; // D minor pentatonic

      setInterval(() => {
        if (!audioCtx || !audioEnabled) return;
        
        // Calculate dynamic level based on stem gain to avoid generating audio when completely muted
        if (stemGains[1].gain.value < 0.05) return;

        const freq = pitches[step % pitches.length];
        
        const osc = audioCtx.createOscillator();
        const amp = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 1.5, audioCtx.currentTime);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 3, audioCtx.currentTime);

        osc.connect(filter);
        filter.connect(amp);
        amp.connect(gainNode);

        amp.gain.setValueAtTime(0.001, audioCtx.currentTime);
        amp.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
        amp.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);

        step++;
      }, 180);
    }

    function startLuxurySynth(gainNode) {
      // Detuned luxury strings
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(146.83, audioCtx.currentTime); // D3
      osc2.frequency.setValueAtTime(147.30, audioCtx.currentTime); // slight detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, audioCtx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      
      const chorusGain = audioCtx.createGain();
      chorusGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      filter.connect(chorusGain);
      chorusGain.connect(gainNode);

      osc1.start();
      osc2.start();
    }

    function startAcousticSynth(gainNode) {
      // Ambient bell delay pulses
      let step = 0;
      const pitches = [293.66, 329.63, 392.00, 440.00, 587.33];

      setInterval(() => {
        if (!audioCtx || !audioEnabled) return;
        if (stemGains[3].gain.value < 0.05) return;

        if (step % 4 === 0) {
          const freq = pitches[Math.floor(Math.random() * pitches.length)];
          const osc = audioCtx.createOscillator();
          const amp = audioCtx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

          const delay = audioCtx.createDelay();
          delay.delayTime.setValueAtTime(0.2, audioCtx.currentTime);
          const feedback = audioCtx.createGain();
          feedback.gain.setValueAtTime(0.35, audioCtx.currentTime);

          osc.connect(amp);
          amp.connect(gainNode);

          amp.connect(delay);
          delay.connect(feedback);
          feedback.connect(delay);
          delay.connect(gainNode);

          amp.gain.setValueAtTime(0.001, audioCtx.currentTime);
          amp.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
          amp.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

          osc.start();
          osc.stop(audioCtx.currentTime + 0.9);
        }
        step++;
      }, 350);
    }

    // Audio Transition Fader
    function transitionAudioStems(targetIdx) {
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      stemGains.forEach((gainNode, idx) => {
        const targetVol = idx === targetIdx ? 0.8 : 0.001;
        gainNode.gain.cancelScheduledValues(t);
        gainNode.gain.setValueAtTime(gainNode.gain.value, t);
        gainNode.gain.exponentialRampToValueAtTime(targetVol, t + 1.2);
      });
    }

    function toggleAudio() {
      if (!audioCtx) {
        initAudio();
        document.getElementById('btn-toggle-sound').textContent = "Mute Audio";
        document.getElementById('sound-bar').classList.add('playing');
        return;
      }
      audioEnabled = !audioEnabled;
      document.getElementById('btn-toggle-sound').textContent = audioEnabled ? "Mute Audio" : "Unmute Audio";
      if (audioEnabled) {
        audioCtx.resume();
        document.getElementById('sound-bar').classList.add('playing');
        transitionAudioStems(activeProjectId);
      } else {
        stemGains.forEach(g => g.gain.setValueAtTime(0.001, audioCtx.currentTime));
        document.getElementById('sound-bar').classList.remove('playing');
      }
    }
    document.getElementById('btn-toggle-sound').addEventListener('click', toggleAudio);

    // ─── THREE.JS 3D RENDER ENGINE PIPELINE ──────────────────────────────────────────
    const canvas = document.getElementById('c');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080c);
    // Delicate cosmic gold fog
    scene.fog = new THREE.FogExp2(0x07080c, 0.035);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    // Initial camera position zoomed out
    camera.position.set(0, 5, 20);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(80, 40, 0xc5a059, 0x1f2833);
    gridHelper.position.y = -2.25;
    gridHelper.material.opacity = 0.35;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Elegant Lights
    scene.add(new THREE.AmbientLight(0x0c0d12, 0.9));

    // Follow Spotlight that highlights the active cube
    const spotlight = new THREE.SpotLight(0xfff8ea, 8, 25, Math.PI / 6, 0.6);
    spotlight.position.set(0, 10, 0);
    spotlight.castShadow = true;
    scene.add(spotlight);
    scene.add(spotlight.target);

    // Floating Dust Particles
    const dustCount = 800;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 50;
      dustPos[i + 1] = (Math.random() - 0.5) * 20;
      dustPos[i + 2] = (Math.random() - 0.5) * 40;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xc5a059,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // ─── SPINNING CUBES & DYNAMIC CANVAS VIDEO TEXTURES ─────────────────────────────
    // Pre-declare dynamic offscreen canvases for each project video texture
    const CUBES_DATA = [
      { id: 0, pos: [-4.2, 1.2, -4.5] },
      { id: 1, pos: [4.5, 0.4, -11.0] },
      { id: 2, pos: [-4.8, -0.6, -17.5] },
      { id: 3, pos: [4.2, 1.2, -23.5] }
    ];

    const cubesList = [];
    const canvasTextures = [];
    const canvasContexts = [];
    const offscreenCanvases = [];

    function initCubes() {
      CUBES_DATA.forEach((cData) => {
        // Offscreen canvas for procedural showreel render
        const canvasObj = document.createElement('canvas');
        canvasObj.width = 512;
        canvasObj.height = 512;
        const ctx = canvasObj.getContext('2d');
        const texture = new THREE.CanvasTexture(canvasObj);

        offscreenCanvases.push(canvasObj);
        canvasContexts.push(ctx);
        canvasTextures.push(texture);

        // Solid luxury bevel box geometry
        const cubeMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.15,
          metalness: 0.85,
          side: THREE.DoubleSide
        });
        const cube = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.6), cubeMat);
        cube.position.set(...cData.pos);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);

        // Thin golden edge outlines
        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.62, 2.62, 2.62));
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xc5a059, transparent: true, opacity: 0.5 }));
        cube.add(line);

        cubesList.push(cube);
      });
    }
    initCubes();

    // ─── PROCEDURAL NARRATIVE REEL GENERATOR ─────────────────────────────────────────
    function drawProceduralReel(idx, ctx, w, h, t, progress) {
      // Background gradient
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#040508');
      g.addColorStop(1, '#0e1017');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Fine grid background
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(w, x); ctx.stroke();
      }

      const activeProject = PROJECTS[idx];

      if (idx === 0) {
        // VIRTUALITY: Dynamic glowing particle array
        ctx.fillStyle = 'rgba(197, 160, 89, 0.7)';
        const cols = 8, rows = 8;
        for (let col = 0; col < cols; col++) {
          for (let row = 0; row < rows; row++) {
            const angle = t * 1.5 + col * 0.5 + row * 0.3;
            const px = 60 + col * 56 + Math.sin(angle) * 15;
            const py = 60 + row * 56 + Math.cos(angle) * 15;
            ctx.beginPath();
            ctx.arc(px, py, 3 + Math.sin(t * 3 + col) * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Digital scanning coordinates
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(197,160,89,0.4)';
        ctx.fillText(`SYS: AR.COORD_X: ${Math.sin(t).toFixed(4)}`, 30, h - 35);
        ctx.fillText(`SYS: AR.COORD_Y: ${Math.cos(t).toFixed(4)}`, 30, h - 20);

      } else if (idx === 1) {
        // MOTION DESIGN: Rotating kinetic geometry
        ctx.save();
        ctx.translate(w/2, h/2);
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(t * 0.4 + i * (Math.PI / 4));
          const scale = 40 + i * 35 + Math.sin(t * 2 + i) * 10;
          ctx.beginPath();
          ctx.rect(-scale/2, -scale/2, scale, scale);
          ctx.stroke();
        }
        ctx.restore();
        // Kinetic font line
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = 'rgba(197,160,89,0.3)';
        ctx.textAlign = 'center';
        ctx.fillText("K I N E T I C   G R I D", w/2, 45);

      } else if (idx === 2) {
        // LUXURY BRANDING: Elegant fluid liquid gold flows
        ctx.fillStyle = '#c5a059';
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(197,160,89,0.5)';
        for (let wave = 0; wave < 3; wave++) {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 10) {
            const angle = (x / w) * Math.PI * 2.5 + t * 1.8 + wave;
            const y = h/2 + Math.sin(angle) * (45 - wave * 10);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fillStyle = wave === 0 ? 'rgba(197, 160, 89, 0.4)' : 'rgba(197, 160, 89, 0.2)';
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        // Luxury text
        ctx.font = 'italic italic 32px serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.textAlign = 'center';
        ctx.fillText("A U R A", w/2, h/2 - 10);

      } else if (idx === 3) {
        // STELLAR SOUNDS: Sound waveform visualization
        ctx.fillStyle = '#c5a059';
        const barCount = 18;
        const barWidth = 14;
        ctx.save();
        ctx.translate(w/2 - (barCount * 20)/2, h/2);
        for (let i = 0; i < barCount; i++) {
          const oscLevel = Math.abs(Math.sin(t * 3 + i * 0.4)) * 90;
          const px = i * 20;
          ctx.fillRect(px, -oscLevel/2, barWidth, oscLevel);
        }
        ctx.restore();
        // Pulsing circles
        ctx.strokeStyle = 'rgba(197, 160, 89, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 120 + Math.sin(t * 4) * 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Universal overlay details on each cube face
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, w, 52);
      ctx.fillRect(0, h - 35, w, 35);

      ctx.font = '600 11px system-ui';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(activeProject.title.toUpperCase(), 25, 30);

      ctx.font = '10px monospace';
      ctx.fillStyle = 'var(--gold)';
      ctx.textAlign = 'right';
      ctx.fillText(`${fmtT(progress)} / ${fmtT(activeProject.dur)}`, w - 25, 30);

      ctx.font = '9px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.textAlign = 'center';
      ctx.fillText("AURA CREATIVE REEL · SECURE INTERACT", w/2, h - 14);

      // Progress strip
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(25, h - 30, w - 50, 2);
      ctx.fillStyle = 'var(--gold)';
      ctx.fillRect(25, h - 30, (w - 50) * (progress / activeProject.dur), 2);
    }

    // ─── 2D ACCESSIBLE FALLBACK RENDERING ──────────────────────────────────────────
    const fbGrid = document.getElementById('fb-grid');
    // Populate cards
    fbGrid.innerHTML = PROJECTS.map((proj, idx) => `
      <div class="fb-card">
        <div class="fb-card-left">
          <div class="proj-meta">
            <span class="proj-num">${proj.num}</span>
            <span class="proj-cat">${proj.cat}</span>
          </div>
          <h2 class="fb-card-title">${proj.title}</h2>
          <p class="proj-desc">${proj.desc}</p>
          <button class="proj-action" id="fb-action-${idx}">Play Flat Reel</button>
        </div>
        <div class="fb-canvas-wrap">
          <canvas class="fb-canvas-el" id="fb-canvas-${idx}"></canvas>
        </div>
      </div>
    `).join('');

    const fbCanvases = [];
    const fbContexts = [];
    PROJECTS.forEach((proj, idx) => {
      const el = document.getElementById(`fb-canvas-${idx}`);
      el.width = 640; el.height = 360;
      fbCanvases.push(el);
      fbContexts.push(el.getContext('2d'));

      // Event listener for flat reels
      document.getElementById(`fb-action-${idx}`).addEventListener('click', () => {
        openReelModal(proj);
      });
    });

    function update2DFallbackCanvas(t) {
      if (document.getElementById('fallback-2d').style.display === 'block') {
        PROJECTS.forEach((proj, idx) => {
          drawProceduralReel(idx, fbContexts[idx], 640, 360, t, (idx === activeProjectId ? modalProgress : 0));
        });
      }
    }

    // ─── 3D SCROLL-TRIGGER CAMERA CHOREOGRAPHY ─────────────────────────────────────
    // Maps standard scroll depth to interpolation of Three.js camera position
    const scrollSections = document.querySelectorAll('.scroll-section');
    const sideDots = document.querySelectorAll('.side-dot');

    function updateScrollDepth() {
      const scrollY = window.scrollY;
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      scrollPercent = totalH > 0 ? scrollY / totalH : 0;

      // Identify currently focused project/section
      const activeIdx = Math.max(0, Math.min(3, Math.floor(scrollPercent * 4)));
      if (activeIdx !== activeProjectId) {
        activeProjectId = activeIdx;
        
        // Active visual updates
        scrollSections.forEach((sect, idx) => {
          sect.classList.toggle('active', idx === activeIdx);
          sideDots[idx].classList.toggle('active', idx === activeIdx);
        });

        // Spotlight target adjustment
        gsap.to(spotlight.position, {
          x: CUBES_DATA[activeIdx].pos[0],
          y: CUBES_DATA[activeIdx].pos[1] + 6,
          z: CUBES_DATA[activeIdx].pos[2],
          duration: 1.0,
          ease: 'power2.out'
        });
        spotlight.target = cubesList[activeIdx];

        // Smoothly fade audio stem channels
        transitionAudioStems(activeIdx);
      }
    }

    // Initial check
    window.addEventListener('scroll', updateScrollDepth);
    window.addEventListener('load', () => {
      updateScrollDepth();
      scrollSections[0].classList.add('active');
    });

    // Side navigation click
    sideDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const id = +dot.dataset.id;
        const totalH = document.documentElement.scrollHeight - window.innerHeight;
        const targetY = (id / 3) * totalH;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });

    function interpolateCameraChoreography(progress) {
      // Dynamic camera path coordinates mapping scroll percent smoothly
      const pathIndex = Math.max(0, Math.min(3, Math.floor(progress * 4)));
      const activeCubePos = CUBES_DATA[pathIndex].pos;

      // Soft circular offset circling around the focused cube
      const angle = progress * Math.PI * 1.5 - (Math.PI / 3);
      const radius = 6.8 - Math.sin(progress * Math.PI) * 1.2;

      const targetCamX = activeCubePos[0] + Math.cos(angle) * radius;
      const targetCamY = activeCubePos[1] + 1.2 + Math.sin(t * 0.15) * 0.4; // subtle wave drift
      const targetCamZ = activeCubePos[2] + Math.sin(angle) * radius;

      // Lerp camera toward coordinates
      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;

      // Camera lookAt focal interpolation
      const targetLookAt = new THREE.Vector3(...activeCubePos);
      camera.lookAt(targetLookAt);
    }

    // ─── FULLSCREEN VIDEO REEL PLAYER MODAL ───────────────────────────────────────
    const playerModal = document.getElementById('player-modal');
    const pCanvas = document.getElementById('player-canvas');
    const pCtx = pCanvas.getContext('2d');
    pCanvas.width = 854; pCanvas.height = 480;

    const pPlayBtn = document.getElementById('p-btn-play');
    const pTimeLbl = document.getElementById('p-time-lbl');
    const pTimelineFill = document.getElementById('p-timeline-fill');
    const pSubtitlesTxt = document.getElementById('p-subtitles-txt');
    const pCcBtn = document.getElementById('p-btn-cc');

    function openReelModal(proj) {
      activeModalProject = proj;
      modalProgress = 0;
      modalPlaying = true;
      pPlayBtn.textContent = '⏸';
      
      document.getElementById('p-cat-lbl').textContent = proj.cat;
      document.getElementById('p-title').textContent = `${proj.title} Creative Reel`;

      playerModal.classList.add('open');
      initAudio();
      resumeAudio();

      modalLastTime = performance.now();
      
      const tick = (now) => {
        if (!modalPlaying) return;
        const dt = (now - modalLastTime) / 1000;
        modalLastTime = now;

        modalProgress = Math.min(modalProgress + dt, proj.dur);
        if (modalProgress >= proj.dur) {
          modalProgress = 0; // repeat loop
        }

        // Subtitles Update
        if (ccEnabled) {
          const sub = proj.subs.find(s => modalProgress >= s.s && modalProgress < s.e);
          if (sub) {
            pSubtitlesTxt.textContent = sub.t;
            document.getElementById('player-subtitles').style.display = 'block';
          } else {
            document.getElementById('player-subtitles').style.display = 'none';
          }
        } else {
          document.getElementById('player-subtitles').style.display = 'none';
        }

        // UI Updates
        const pct = (modalProgress / proj.dur) * 100;
        pTimelineFill.style.width = pct + '%';
        pTimeLbl.textContent = `${fmtT(modalProgress)} / ${fmtT(proj.dur)}`;

        modalRaf = requestAnimationFrame(tick);
      };
      modalRaf = requestAnimationFrame(tick);

      // Smoothly zoom 3D camera closer into active cube face
      if (document.getElementById('fallback-2d').style.display !== 'block') {
        const [cx, cy, cz] = proj.id === 0 ? proj.subs[0] ? CUBES_DATA[proj.id].pos : [0,0,0] : CUBES_DATA[proj.id].pos;
        gsap.to(camera.position, {
          x: cx, y: cy + 0.1, z: cz + 3.8,
          duration: 1.4,
          ease: 'power3.inOut'
        });
      }
    }

    function closeReelModal() {
      modalPlaying = false;
      if (modalRaf) cancelAnimationFrame(modalRaf);
      playerModal.classList.remove('open');
      
      // zoom camera back to regular scroll level
      updateScrollDepth();
    }

    document.getElementById('player-close').addEventListener('click', closeReelModal);
    
    // Wire Project Play buttons
    PROJECTS.forEach((proj, idx) => {
      document.getElementById(`action-${idx}`).addEventListener('click', () => {
        openReelModal(proj);
      });
    });

    // Play/Pause Modal Video
    pPlayBtn.addEventListener('click', () => {
      modalPlaying = !modalPlaying;
      pPlayBtn.textContent = modalPlaying ? '⏸' : '▶';
      if (modalPlaying) {
        modalLastTime = performance.now();
        openReelModal(activeModalProject);
      }
    });

    // Timeline Modal Scrubbing
    const pTimeline = document.getElementById('p-timeline-container');
    pTimeline.addEventListener('mousedown', e => {
      const r = pTimeline.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      modalProgress = pct * activeModalProject.dur;
      
      const t = performance.now();
      modalLastTime = t;
    });

    // CC Closed Captions Toggle
    pCcBtn.addEventListener('click', () => {
      ccEnabled = !ccEnabled;
      pCcBtn.classList.toggle('active', ccEnabled);
      pCcBtn.textContent = ccEnabled ? "CC ON" : "CC OFF";
    });

    // Keyboard esc closing
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeReelModal();
    });

    // ─── ACCESSIBILITY TRANSCRIPTS MODALS ─────────────────────────────────────────
    const trModal = document.getElementById('transcript-modal');
    const trBody = document.getElementById('tr-body');
    const trClose = document.getElementById('tr-close');
    const pBtnTr = document.getElementById('p-btn-tr');

    pBtnTr.addEventListener('click', () => {
      if (!activeModalProject) return;
      trBody.innerHTML = activeModalProject.subs.map(s => `
        <div class="transcript-line">
          <span class="t-time">${fmtT(s.s)}</span>
          <span>${s.t}</span>
        </div>
      `).join('');
      trModal.classList.add('open');
    });

    trClose.addEventListener('click', () => {
      trModal.classList.remove('open');
    });

    // Time Format helper
    function fmtT(s) {
      return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2, '0')}`;
    }

    // ─── 2D FALLBACK TOGGLING ───────────────────────────────────────────────────────
    const btn2D = document.getElementById('btn-2d');
    const fallback2D = document.getElementById('fallback-2d');
    let is2dOpen = false;

    btn2D.addEventListener('click', () => {
      is2dOpen = !is2dOpen;
      fallback2D.classList.toggle('open', is2dOpen);
      document.getElementById('scroll-wrapper').style.display = is2dOpen ? 'none' : 'block';
      document.getElementById('side-nav').style.display = is2dOpen ? 'none' : 'flex';
      btn2D.textContent = is2dOpen ? "3D Version" : "2D Version";
      btn2D.classList.toggle('ghost', is2dOpen);
      initAudio();
      resumeAudio();
    });

    // ─── INTRO ANIMATIONS ────────────────────────────────────────────────────────────
    const introVeil = document.getElementById('intro-veil');
    const veilTitle = document.getElementById('veil-title');
    const veilSub = document.getElementById('veil-subtitle');
    const btnEnter = document.getElementById('btn-enter');

    window.addEventListener('load', () => {
      gsap.to(veilTitle, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' });
      gsap.to(veilSub, { opacity: 1, y: 0, duration: 1.2, delay: 0.3, ease: 'power2.out' });
      gsap.to(btnEnter, { opacity: 1, y: 0, duration: 1.2, delay: 0.6, ease: 'power2.out' });
    });

    btnEnter.addEventListener('click', () => {
      initAudio();
      introVeil.classList.add('gone');

      // Entry cinematic camera animation
      gsap.to(camera.position, {
        x: CUBES_DATA[0].pos[0] + 3,
        y: CUBES_DATA[0].pos[1] + 1.2,
        z: CUBES_DATA[0].pos[2] + 6.8,
        duration: 2.5,
        ease: 'power3.out',
        onComplete: () => {
          document.getElementById('nav').classList.add('show');
          document.getElementById('side-nav').classList.add('show');
          document.getElementById('sound-bar').classList.add('show');
        }
      });
    });

    // ─── RESIZE PIPELINE ─────────────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });

    // ─── MAIN ANIMATION LOOP ─────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let t = 0;

    function animate() {
      requestAnimationFrame(animate);

      t = clock.getElapsedTime();

      // Render procedural showreels onto offscreen canvases
      PROJECTS.forEach((proj, idx) => {
        // Active project in modal uses activeProgress, others just loop slowly
        let progress = 0;
        if (activeModalProject && activeModalProject.id === idx && modalPlaying) {
          progress = modalProgress;
        } else {
          progress = (t * 2) % proj.dur;
        }
        drawProceduralReel(idx, canvasContexts[idx], 512, 512, t, progress);
      });

      // Update 2D fallback page canvases
      update2DFallbackCanvas(t);

      // Render modal reel player showreel frame
      if (activeModalProject) {
        drawProceduralReel(activeModalProject.id, pCtx, 854, 480, t, modalProgress);
        canvasTextures[activeModalProject.id].needsUpdate = true;
      }

      // Rotate all 3D Cubes slowly in different speeds
      cubesList.forEach((cube, idx) => {
        const speed = 0.28 + idx * 0.08;
        cube.rotation.y = t * speed;
        cube.rotation.x = t * (speed * 0.6);
      });

      // Wobble dust particles slowly
      dustParticles.rotation.y = t * 0.008;
      dustParticles.rotation.z = t * 0.005;

      // Coordinate camera movement based on scroll percent
      if (introVeil.classList.contains('gone') && !activeModalProject && !is2dOpen) {
        interpolateCameraChoreography(scrollPercent);
      }

      renderer.render(scene, camera);
    }
    animate();

    // Browser audio policy helper
    function resumeAudio() {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
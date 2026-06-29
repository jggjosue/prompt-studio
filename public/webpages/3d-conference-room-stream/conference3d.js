(function () {
  'use strict';

  const canvas = document.getElementById('conference-canvas');
  const nav = document.getElementById('site-nav');
  const navToggle = document.querySelector('.nav-toggle');

  const playToggle = document.getElementById('play-toggle');
  const registerForm = document.getElementById('register-form');
  const contactForm = document.getElementById('contact-form');
  const registerMessage = document.getElementById('register-message');
  const contactMessage = document.getElementById('contact-message');
  const selectedPlan = document.getElementById('selected-plan');
  const viewerCount = document.getElementById('viewer-count');

  const state = {
    playing: true,
    selectedSession: 'Executive Keynote',
    selectedPlan: 'Hybrid Event Suite',
    guideProgress: 0
  };

  const data = {
    hotspots: {
      'Live Stream': 'The live stream node blends the presenter stage, studio lights, and broadcast indicators into a single focal point.',
      'Speaker Screen': 'Remote speakers appear on mirrored screens with a cinematic depth effect to reinforce presence.',
      'Audience Chat': 'Audience chat floats on a secondary layer and reacts to scroll motion like a live production HUD.',
      'Stream Controls': 'The control bar represents production switching, audio routing, and show-caller tools.',
      'Agenda Panel': 'Agenda blocks can be previewed and attached to calendar reminders for each session.',
      'Analytics': 'Analytics surfaces audience engagement, questions asked, and stream stability in real time.'
    },
    speakers: {
      'Sofia Grant — Digital Events Strategist': 'Sofia designs keynote journeys that keep hybrid audiences focused from opening frame to final CTA.',
      'Marcus Lee — Enterprise Collaboration Lead': 'Marcus connects remote teams through speaker workflows, whiteboards, and shared decisions.',
      'Elena Ruiz — Hybrid Experience Producer': 'Elena crafts the visual language, motion pacing, and spatial hierarchy for premium event rooms.',
      'Noah Carter — Streaming Technology Director': 'Noah ensures the broadcast stack stays resilient, low-latency, and polished at scale.'
    },
    tools: {
      'Live Polls': 'Collect audience sentiment mid-stream and surface results inside the room architecture.',
      'Q&A Queue': 'Keep questions organized, prioritized, and visible to the speaker team.',
      'Breakout Rooms': 'Split the room into smaller collaboration spaces for deeper conversations.',
      'Shared Notes': 'Capture decisions and links in a persistent shared note layer.',
      'Whiteboard': 'Sketch ideas across teams with a collaborative surface attached to the event.',
      'Audience Reactions': 'Reactions turn into small bursts of motion and light across the room.'
    },
    plans: {
      'Webinar Room': 'Best for polished single-track broadcasts and lead generation webinars.',
      'Pro Conference': 'Adds speaker panels, audience chat, and agenda controls for larger productions.',
      'Enterprise Stream': 'Includes executive-level analytics, sponsor placement, and recording workflows.',
      'Hybrid Event Suite': 'Full premium package for conferences, launches, and live hybrid event orchestration.'
    }
  };

  let scene, camera, renderer, room, glowGroup, particles, raf;
  const scrollTarget = { progress: 0 };
  const scrollState = { y: 0 };

  let appModal, modalTitle, modalBody, modalActions, modalCloseBtn;

  function smoothScrollTo(selector) {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openModal(title, body, actions = []) {
    if (!appModal) return;
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modalActions.innerHTML = '';
    
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = action.primary ? 'btn btn-primary' : 'btn btn-secondary';
      btn.textContent = action.label;
      btn.addEventListener('click', action.onClick);
      modalActions.appendChild(btn);
    });

    appModal.style.display = 'grid';
  }

  function closeModal() {
    if (!appModal) return;
    appModal.style.display = 'none';
  }

  function initThree() {
    if (!window.THREE || !canvas) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x071018, 6, 16);
    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 2.8, 9);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const ambient = new THREE.AmbientLight(0xb9d9ff, 1.6);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 7, 8);
    scene.add(key);

    const rim = new THREE.PointLight(0x7be0ff, 2.2, 30);
    rim.position.set(-4, 3, 5);
    scene.add(rim);

    const stageLight = new THREE.SpotLight(0xffe8c8, 1.8, 30, Math.PI / 7, 0.25);
    stageLight.position.set(0, 8, 6);
    stageLight.target.position.set(0, 0, 0);
    scene.add(stageLight, stageLight.target);

    room = new THREE.Group();
    scene.add(room);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x09161f, roughness: 0.95, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    room.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0b1721, roughness: 0.92, metalness: 0.02 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 0.3), wallMat);
    backWall.position.set(0, 3.5, -8);
    room.add(backWall);

    const sideWallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 18), wallMat);
    sideWallLeft.position.set(-9, 3.5, 0);
    room.add(sideWallLeft);

    const sideWallRight = sideWallLeft.clone();
    sideWallRight.position.x = 9;
    room.add(sideWallRight);

    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.7, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: 0x2a3947, metalness: 0.15, roughness: 0.35 })
    );
    table.position.y = 0.95;
    room.add(table);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x0c1621, emissive: 0x1c3a4d, emissiveIntensity: 0.95 })
    );
    screen.position.set(0, 3.1, -6.75);
    room.add(screen);

    const sideScreenL = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1),
      new THREE.MeshStandardMaterial({ color: 0x112433, emissive: 0x143148, emissiveIntensity: 0.6 })
    );
    sideScreenL.position.set(-4.4, 2.1, -5.7);
    sideScreenL.rotation.y = 0.28;
    room.add(sideScreenL);

    const sideScreenR = sideScreenL.clone();
    sideScreenR.position.x = 4.4;
    sideScreenR.rotation.y = -0.28;
    room.add(sideScreenR);

    // Add Chairs
    const chairGeo = new THREE.BoxGeometry(0.9, 0.1, 0.8);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x182430, metalness: 0.1, roughness: 0.8 });
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4a5a6a, metalness: 0.8, roughness: 0.2 });

    for (let i = 0; i < 5; i++) {
      const chair = new THREE.Group();
      
      const seat = new THREE.Mesh(chairGeo, chairMat);
      seat.position.y = 0.45;
      
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.1), chairMat);
      backrest.position.set(0, 0.85, -0.35);
      
      // Chair legs
      const leg1 = new THREE.Mesh(legGeo, legMat); leg1.position.set(-0.35, 0.225, -0.3);
      const leg2 = new THREE.Mesh(legGeo, legMat); leg2.position.set(0.35, 0.225, -0.3);
      const leg3 = new THREE.Mesh(legGeo, legMat); leg3.position.set(-0.35, 0.225, 0.3);
      const leg4 = new THREE.Mesh(legGeo, legMat); leg4.position.set(0.35, 0.225, 0.3);

      chair.add(seat, backrest, leg1, leg2, leg3, leg4);
      
      // Position around the back half of the table
      const angle = Math.PI * 1.2 + (Math.PI * 0.6 * (i / 4)); 
      chair.position.set(Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5);
      chair.lookAt(0, 0.5, 0);
      
      room.add(chair);
    }

    const cameraRig = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1f2d3c, metalness: 0.2, roughness: 0.4 })
    );
    cameraRig.position.set(0, 2.4, 2.7);
    room.add(cameraRig);

    const mic = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x7e8c99, metalness: 0.5, roughness: 0.4 })
    );
    mic.position.set(0.9, 1.18, 0.5);
    room.add(mic);
    const mic2 = mic.clone();
    mic2.position.set(-0.9, 1.18, 0.5);
    room.add(mic2);

    const livePanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.25, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xff3f5c, emissive: 0xff3f5c, emissiveIntensity: 1.2 })
    );
    livePanel.position.set(-2.2, 3.7, -5.1);
    room.add(livePanel);

    glowGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x7be0ff, emissive: 0x7be0ff, emissiveIntensity: 1.5 })
      );
      bulb.position.set(-4.5 + i * 1.8, 6.2, -1.5 - (i % 2) * 0.7);
      glowGroup.add(bulb);
    }
    room.add(glowGroup);

    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 90;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 5.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: 0x8fdcff, size: 0.05, transparent: true, opacity: 0.35 })
    );
    scene.add(particles);
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    if (!renderer || !camera || !scene) return;

    const t = performance.now() * 0.001;
    const lerpFactor = 0.08;
    room.rotation.y += (scrollTarget.progress * 0.15 - room.rotation.y) * lerpFactor;
    room.position.z += (-scrollState.y * 0.002 - room.position.z) * 0.04;
    camera.position.x += (Math.sin(t * 0.45) * 0.15 - camera.position.x) * 0.03;
    camera.position.y += ((2.7 + scrollTarget.progress * 0.7) - camera.position.y) * 0.05;
    camera.position.z += ((9 - scrollTarget.progress * 5.2) - camera.position.z) * 0.05;
    camera.lookAt(0, 2.2, -3.2 + scrollTarget.progress * -3.5);

    if (particles) {
      particles.rotation.y = t * 0.08;
      particles.rotation.x = Math.sin(t * 0.2) * 0.04;
    }
    if (glowGroup) glowGroup.children.forEach((mesh, i) => { mesh.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.08); });

    renderer.render(scene, camera);
  }

  function updateScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollState.y = window.scrollY;
    scrollTarget.progress = max > 0 ? window.scrollY / max : 0;
  }

  function setSelectedPlan(plan) {
    state.selectedPlan = plan;
    selectedPlan.textContent = plan;
    openModal(plan, data.plans[plan], [
      { label: 'Register Now', primary: true, onClick: () => smoothScrollTo('#register') },
      { label: 'Close', primary: false, onClick: closeModal }
    ]);
  }

  function attachInteractions() {
    document.querySelectorAll('[data-scroll]').forEach((btn) => {
      btn.addEventListener('click', () => smoothScrollTo(btn.dataset.scroll));
    });

    document.querySelectorAll('[data-hotspot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        openModal(btn.dataset.hotspot, data.hotspots[btn.dataset.hotspot], [
          { label: 'Got it', primary: true, onClick: closeModal }
        ]);
      });
    });

    document.querySelectorAll('.speaker-card').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.speaker, data.speakers[btn.dataset.speaker], [
        { label: 'Close', primary: true, onClick: closeModal }
      ]));
    });

    document.querySelectorAll('.tool-card').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.tool, data.tools[btn.dataset.tool], [
        { label: 'Try Tool', primary: true, onClick: closeModal }
      ]));
    });

    document.querySelectorAll('.plan-card').forEach((btn) => {
      btn.addEventListener('click', () => setSelectedPlan(btn.dataset.plan));
    });

    document.querySelectorAll('.timeline-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedSession = btn.dataset.session;
        openModal(btn.dataset.session, `Session selected: ${btn.dataset.session}. Add it to calendar or jump back to the live demo for a preview.`, [
          { label: 'Add to Calendar', primary: true, onClick: () => {
            closeModal();
            registerMessage.textContent = `Added "${btn.dataset.session}" to your event plan.`;
          } },
          { label: 'View Session', primary: false, onClick: closeModal }
        ]);
      });
    });

    document.getElementById('enter-stream')?.addEventListener('click', () => {
      scrollTarget.progress = 0.55;
      openModal('Enter Stream Room', 'The guided camera moves you toward the main table, speaker screens, and the live control surface.', [
        { label: 'Start Guided Tour', primary: true, onClick: closeModal }
      ]);
    });

    document.getElementById('play-toggle').addEventListener('click', () => {
      state.playing = !state.playing;
      playToggle.textContent = state.playing ? 'Pause' : 'Play';
      document.getElementById('player-screen').style.opacity = state.playing ? '1' : '.72';
    });

    document.getElementById('ask-question').addEventListener('click', () => {
      openModal('Ask Question', 'Open the Q&A queue and send a live question to the speaker team.', [
        { label: 'Submit Question', primary: true, onClick: closeModal }
      ]);
    });

    document.getElementById('share-stream').addEventListener('click', () => {
      openModal('Share Stream', 'A share confirmation was generated for the current live room.', [
        { label: 'Copy Link', primary: true, onClick: closeModal }
      ]);
    });

    document.getElementById('view-analytics').addEventListener('click', () => {
      openModal('Analytics', 'Live dashboard: 2,450 viewers, 87% engagement, 320 questions, and 94% stream stability.', [
        { label: 'Close Panel', primary: true, onClick: closeModal }
      ]);
    });

    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(registerForm);
      if (!form.get('name') || !form.get('email') || !form.get('company') || !form.get('role') || !form.get('eventType')) {
        registerMessage.textContent = 'Please complete all registration fields.';
        return;
      }
      registerMessage.textContent = `Thanks, ${form.get('name')}! Your demo request for ${form.get('eventType')} is confirmed.`;
      registerForm.reset();
    });

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(contactForm);
      if (!form.get('name') || !form.get('email') || !form.get('company') || !form.get('need') || !form.get('message')) {
        contactMessage.textContent = 'Please complete all contact fields.';
        return;
      }
      contactMessage.textContent = 'Request received. Our stream team will follow up shortly.';
      contactForm.reset();
    });

    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });


    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', () => {
      if (!renderer || !camera) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('in-view', entry.isIntersecting));
    }, { threshold: 0.2 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  function init() {
    appModal = document.getElementById('app-modal');
    modalTitle = document.getElementById('modal-title');
    modalBody = document.getElementById('modal-body');
    modalActions = document.getElementById('modal-actions');
    modalCloseBtn = document.getElementById('modal-close');

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    attachInteractions();
    updateScrollProgress();
    initThree();
    animate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

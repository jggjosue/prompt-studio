(function () {
  const canvas = document.getElementById('stage-canvas');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalKicker = document.getElementById('modal-kicker');
  const modalClose = document.getElementById('modal-close');
  const form = document.getElementById('interest-form');
  const status = document.querySelector('.form-status');
  const spotlightButtons = document.querySelectorAll('[data-hotspot], [data-action]');
  const reveals = document.querySelectorAll('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stageCanvas = canvas;
  let scene, camera, renderer, clock, stage, propsGroup, audienceGroup, lightsGroup, particles;
  let cameraMode = 'hero';
  let targetScrollProgress = 0;
  let scrollProgress = 0;

  const details = {
    keynote: ['Keynote Stage', 'The central LED wall, podium and spotlight array anchor the opening keynote moments.'],
    podium: ['Speaker Podium', 'A branded podium with camera coverage and audience-focused lighting.'],
    panel: ['Live Panel', 'Side screens and rotating light beams frame the panel discussion zone.'],
    agenda: ['Agenda Screen', 'The timeline screen highlights the next session and syncs with scroll.'],
    sponsor: ['Sponsor Wall', 'Floating logos and reflective surfaces create premium partner visibility.'],
    tickets: ['Tickets', 'Pass tiers with glowing badges and a conversion-ready CTA.'],
    focus: ['Stage Focus', 'The camera advances toward the main stage with deeper LED glow and spotlight intensity.']
  };

  function smoothScrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  }

  function openModal(kicker, title, body) {
    modalKicker.textContent = kicker;
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  menuToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href').slice(1);
      if (id) {
        event.preventDefault();
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        smoothScrollTo(id);
      }
    });
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  spotlightButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const hotspot = button.dataset.hotspot || button.dataset.action;
      if (hotspot === 'enter-stage') {
        cameraMode = 'enter';
        targetScrollProgress = 0.92;
        openModal('Guided tour', 'Enter Main Stage', 'The camera glides from the auditorium entrance to the front of the stage.');
        return;
      }
      if (hotspot === 'focus-stage') {
        cameraMode = 'focus';
        targetScrollProgress = 0.72;
      }
      if (details[hotspot]) openModal(details[hotspot][0], details[hotspot][0], details[hotspot][1]);
      if (hotspot === 'talk') {
        const card = button.closest('.speaker-card');
        openModal('Speaker Talk', card.dataset.talk, 'Open talk details, session focus, and related stage cueing.');
      }
      if (hotspot === 'ticket') {
        const ticket = button.closest('.ticket-card').dataset.ticket;
        openModal('Ticket selection', ticket, 'Your selected pass can be sent to registration with speaker and agenda preferences.');
      }
      if (hotspot === 'sponsor') {
        smoothScrollTo('contact');
        openModal('Sponsor', 'Become a Sponsor', 'Use the contact form below to start a sponsor conversation or request the media kit.');
      }
      if (hotspot === 'location') {
        openModal('Venue', 'Aurora Convention Center', 'Future City venue details, arrival notes, and livestream access are all available here.');
      }
      if (hotspot === 'enter-stage' || hotspot === 'focus-stage') return;
      if (hotspot === 'agenda') smoothScrollTo('agenda');
      if (hotspot === 'tickets') smoothScrollTo('tickets');
    });
  });

  document.querySelectorAll('.agenda-item').forEach((item) => {
    item.addEventListener('click', () => {
      const slot = item.dataset.slot;
      cameraMode = slot === 'closing' ? 'tickets' : 'agenda';
      targetScrollProgress = slot === 'closing' ? 1 : 0.6;
      openModal('Agenda item', item.querySelector('span').textContent, 'This moment is highlighted on the LED wall and synced with the main stage camera.');
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const required = ['name', 'email', 'company', 'role', 'ticketInterest', 'message'];
    const hasMissing = required.some((key) => !String(data.get(key) || '').trim());
    if (hasMissing) {
      status.textContent = 'Please complete every field before registering.';
      status.style.color = 'var(--gold)';
      return;
    }
    status.textContent = 'Registration interest sent. We will follow up soon.';
    status.style.color = 'var(--cyan)';
    form.reset();
    openModal('Registration received', 'Thank you for your interest', 'We received your registration request and will reach out with next steps.');
  });

  function createScene() {
    scene = new THREE.Scene();
    clock = new THREE.Clock();
    camera = new THREE.PerspectiveCamera(42, stageCanvas.clientWidth / stageCanvas.clientHeight, 0.1, 100);
    camera.position.set(0, 2.8, 9.5);
    renderer = new THREE.WebGLRenderer({ canvas: stageCanvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(stageCanvas.clientWidth, stageCanvas.clientHeight, false);
    renderer.setClearColor(0x05070d, 0);

    const ambient = new THREE.AmbientLight(0x7aa7ff, 0.45);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(2, 6, 6);
    scene.add(key);
    const cyan = new THREE.PointLight(0x63d9ff, 3, 30);
    cyan.position.set(-4, 4, 2);
    scene.add(cyan);
    const violet = new THREE.PointLight(0x9f7bff, 2.6, 28);
    violet.position.set(4, 4, -2);
    scene.add(violet);

    propsGroup = new THREE.Group();
    audienceGroup = new THREE.Group();
    lightsGroup = new THREE.Group();
    scene.add(propsGroup, audienceGroup, lightsGroup);
    buildStage();
    buildAudience();
    buildLights();
    buildParticles();
  }

  function buildStage() {
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 48),
      new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.7, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.95;
    scene.add(floor);

    stage = new THREE.Group();
    stage.position.set(0, -0.1, -2.4);
    scene.add(stage);

    const stageBase = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.28, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.2 })
    );
    stageBase.position.y = -0.2;
    stage.add(stageBase);

    const ledWall = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 2.2, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x09121d, emissive: 0x152b44, emissiveIntensity: 0.95, metalness: 0.3, roughness: 0.2 })
    );
    ledWall.position.set(0, 1.55, -0.9);
    stage.add(ledWall);

    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 1.1, 6),
      new THREE.MeshStandardMaterial({ color: 0x1c2433, roughness: 0.35, metalness: 0.3 })
    );
    podium.position.set(-0.9, 0.45, 0.35);
    stage.add(podium);

    const podiumTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.1, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x263245, emissive: 0x14243d, emissiveIntensity: 0.5 })
    );
    podiumTop.position.set(-0.9, 1.05, 0.35);
    stage.add(podiumTop);

    const screenLeft = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.15, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x09121d, emissive: 0x1b3556, emissiveIntensity: 0.8 })
    );
    screenLeft.position.set(-2.1, 1.4, -0.72);
    stage.add(screenLeft);

    const screenRight = screenLeft.clone();
    screenRight.position.x = 2.1;
    stage.add(screenRight);

    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(4.1, 0.25, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x161d2a, emissive: 0x24496b, emissiveIntensity: 0.45 })
    );
    banner.position.set(0, 2.65, -0.9);
    stage.add(banner);

    propsGroup.add(makeSeatRows());
    propsGroup.add(makeSponsorFrames());
    propsGroup.add(makeFloatingCards());
  }

  function makeSeatRows() {
    const group = new THREE.Group();
    for (let row = 0; row < 6; row++) {
      for (let seat = 0; seat < 10; seat++) {
        const seatMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.16, 0.18),
          new THREE.MeshStandardMaterial({ color: 0x1a2231, roughness: 0.8, metalness: 0.05 })
        );
        seatMesh.position.set((seat - 4.5) * 0.45, -0.8 + row * 0.18, 1.5 + row * 0.52);
        group.add(seatMesh);
      }
    }
    return group;
  }

  function makeSponsorFrames() {
    const group = new THREE.Group();
    ['northstar', 'luma', 'vector'].forEach((_, index) => {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.52, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x162033, emissive: 0x223a5a, emissiveIntensity: 0.65, transparent: true, opacity: 0.84 })
      );
      frame.position.set(-2.8 + index * 2.8, 1.35 + (index % 2) * 0.3, 1.25);
      frame.rotation.y = (index - 1) * 0.18;
      group.add(frame);
    });
    return group;
  }

  function makeFloatingCards() {
    const group = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const card = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.46, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x20304a, emissive: 0x304d78, emissiveIntensity: 0.4, transparent: true, opacity: 0.78 })
      );
      card.position.set(-1.5 + i * 1.05, 1.15 + (i % 2) * 0.42, 0.2 + i * 0.08);
      card.rotation.z = (i - 1.5) * 0.08;
      group.add(card);
    }
    return group;
  }

  function buildAudience() {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(7.2, 0.06, 10, 50, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x122033, emissive: 0x0f1b2e, emissiveIntensity: 0.25 })
    );
    arch.rotation.x = Math.PI / 2;
    arch.position.y = 1.7;
    audienceGroup.add(arch);
  }

  function buildLights() {
    for (let i = 0; i < 6; i++) {
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 4.5, 18, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x63d9ff, emissive: 0x63d9ff, emissiveIntensity: 1.1, transparent: true, opacity: 0.14, side: THREE.DoubleSide })
      );
      beam.position.set(-3 + i * 1.2, 3.1, -0.8);
      beam.rotation.x = Math.PI;
      lightsGroup.add(beam);
    }
  }

  function buildParticles() {
    const count = 180;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ color: 0xbad7ff, size: 0.035, transparent: true, opacity: 0.65 })
    );
    scene.add(particles);
  }

  function updateScrollTarget() {
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    scrollProgress = window.scrollY / max;
    targetScrollProgress = scrollProgress;
  }

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const lerpFactor = prefersReduced ? 1 : 0.05;
    scrollProgress += (targetScrollProgress - scrollProgress) * lerpFactor;
    const t = Math.min(1, Math.max(0, scrollProgress));
    const cameraPresets = {
      hero: new THREE.Vector3(0, 2.8 - t * 0.9, 9.5 - t * 6.2),
      enter: new THREE.Vector3(0, 1.7, 7.8),
      focus: new THREE.Vector3(0, 1.35, 5.1),
      agenda: new THREE.Vector3(-0.4, 1.1, 4.6),
      tickets: new THREE.Vector3(0.8, 1.15, 4.1)
    };
    const cam = cameraPresets[cameraMode] || cameraPresets.hero;
    camera.position.lerp(cam, 0.05);
    camera.lookAt(0, 0.75 + Math.sin(performance.now() * 0.0006) * 0.05, -1.2);
    if (stage) {
      stage.rotation.y = Math.sin(performance.now() * 0.00015) * 0.12 - t * 0.18;
      stage.position.y = -0.1 - t * 0.14;
    }
    if (propsGroup) propsGroup.position.z = -t * 0.9;
    if (audienceGroup) audienceGroup.position.z = t * 0.18;
    if (lightsGroup) lightsGroup.children.forEach((light, index) => {
      light.material.opacity = 0.08 + Math.sin(performance.now() * 0.001 + index) * 0.05 + t * 0.08;
      light.rotation.z = Math.sin(performance.now() * 0.0007 + index) * 0.12;
    });
    if (particles) {
      particles.rotation.y += delta * 0.035;
      particles.material.opacity = 0.35 + t * 0.45;
    }
    renderer.render(scene, camera);
  }

  function observeReveals() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { threshold: 0.18 });
    reveals.forEach((el) => observer.observe(el));
  }

  window.addEventListener('scroll', updateScrollTarget, { passive: true });
  window.addEventListener('resize', () => {
    if (!renderer || !camera) return;
    camera.aspect = stageCanvas.clientWidth / stageCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(stageCanvas.clientWidth, stageCanvas.clientHeight, false);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  if (!prefersReduced) {
    gsap.to('.canvas-frame', { boxShadow: '0 34px 110px rgba(0,0,0,.58)', duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  createScene();
  observeReveals();
  updateScrollTarget();
  animate();
})();

(function () {
  const canvas = document.getElementById('boardroomCanvas');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('siteNav');
  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalKicker = document.getElementById('modalKicker');
  const modalAction = document.getElementById('modalAction');
  const bookingForm = document.getElementById('bookingForm');
  const formNote = document.getElementById('formNote');
  const methodSteps = [...document.querySelectorAll('.method-step')];
  const revealEls = [...document.querySelectorAll('.reveal')];
  const caseButtons = [...document.querySelectorAll('.view-case')];
  const learnMoreButtons = [...document.querySelectorAll('.learn-more')];
  const chooseButtons = [...document.querySelectorAll('.choose-engagement')];
  const enterButtons = [...document.querySelectorAll('[data-enter-boardroom]')];
  const resultsButton = document.querySelector('[data-view-results]');
  const breakdownButton = document.querySelector('[data-open-breakdown]');
  const scrollLinks = [...document.querySelectorAll('[data-scroll]')];
  const hotspotButtons = [...document.querySelectorAll('.hotspot')];

  const stories = {
    'Revenue Growth Strategy': 'A funnel rebuild revealed where conversion broke down. The case combines offer redesign, pipeline clarity, and sales enablement.',
    'Operational Efficiency Program': 'This case focuses on workflow simplification, automation, and decision ownership to reduce cost without hurting control.',
    'Digital Transformation Roadmap': 'The roadmap aligns platform modernization with executive governance and a more reliable data layer.',
    'Market Expansion Case': 'A market selection model identified where to expand next, how to localize offers, and which channels to prioritize.',
    'Cost Optimization Initiative': 'A spend map and operating control tower exposed leakage across procurement, vendor management, and delivery.',
    'Customer Experience Redesign': 'Service journey mapping, response standards, and better handoffs improved consistency and retention.'
  };

  const engagementDetails = {
    'Strategy Sprint': 'A fast executive working session with diagnosis, priorities, and next-step recommendations.',
    'Monthly Advisory': 'Ongoing strategic support with leadership check-ins, dashboards, and decision support.',
    'Transformation Project': 'A structured change program covering discovery, roadmap design, execution, and KPI tracking.',
    'Executive Boardroom Retainer': 'A boardroom-as-a-service model for high-stakes decisions and quarterly planning.'
  };

  const methodDetails = {
    Discover: 'We map the current state, the leadership context, and the business constraints.',
    Diagnose: 'We isolate bottlenecks, identify the biggest leaks, and validate the data behind them.',
    Design: 'We shape the strategy, operating model, and decision structure needed for momentum.',
    Execute: 'We turn the plan into a 90-day roadmap with ownership, cadence, and visible action.',
    Measure: 'We track what changed, where it moved, and what the leadership team should do next.',
    Scale: 'We embed the wins into process, governance, and repeatable growth routines.'
  };

  let scene, camera, renderer, rig, table, screenGroup, chartGroup, documentGroup, cityGroup, spotlight;
  let guided = 0;
  let targetScroll = 0;
  let currentPrompt = 'Strategy Deck';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function smoothScrollTo(selector) {
    const target = document.querySelector(selector);
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function openModal(title, body, kicker, actionLabel, actionFn) {
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modalKicker.textContent = kicker;
    modalAction.textContent = actionLabel;
    modal.dataset.action = actionFn ? 'custom' : 'default';
    modalAction.onclick = actionFn || (() => closeModal());
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  function focusPrompt(prompt) {
    currentPrompt = prompt;
    if (!spotlight) return;
    const map = {
      'Strategy Deck': [1.0, 1.55, 1.1],
      'Case Study': [-0.45, 1.15, 0.9],
      'Financial Dashboard': [0.62, 0.82, 0.78],
      'Growth Map': [-1.0, 0.78, -0.25],
      'Decision Board': [0.0, 1.12, 0.52],
      'ROI Results': [0.0, 0.72, 1.65],
      'Book Consultation': [0.95, 0.58, 1.95]
    };
    const target = map[prompt] || map['Strategy Deck'];
    spotlight.position.set(target[0], target[1], target[2]);
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x09111c, 4, 20);
    camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.6, 7.2);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const ambient = new THREE.AmbientLight(0xd9ecff, 0.6);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 6, 5);
    scene.add(key);

    const warm = new THREE.PointLight(0xf6c177, 1.6, 20);
    warm.position.set(-2.6, 1.6, 2.4);
    scene.add(warm);

    spotlight = new THREE.PointLight(0x7dd3fc, 2.1, 14);
    spotlight.position.set(1, 1.5, 1.1);
    scene.add(spotlight);

    rig = new THREE.Group();
    scene.add(rig);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x0d1722, roughness: 0.94, metalness: 0.06 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    scene.add(floor);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(18, 7, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x101c2a, roughness: 0.92, metalness: 0.02 })
    );
    backWall.position.set(0, 2.1, -6.6);
    scene.add(backWall);

    const windowGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 3.6),
      new THREE.MeshBasicMaterial({ color: 0x10263e, transparent: true, opacity: 0.45 })
    );
    windowGlow.position.set(3.6, 2.3, -6.45);
    scene.add(windowGlow);

    cityGroup = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const h = 0.8 + (i % 5) * 0.38;
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.32 + (i % 3) * 0.16, h, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x15253a, emissive: 0x15304b, emissiveIntensity: 0.4 })
      );
      b.position.set(-3.8 + i * 0.58, -0.05 + h / 2, -6.2 - (i % 2) * 0.2);
      cityGroup.add(b);
    }
    scene.add(cityGroup);

    table = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 2.45, 0.16, 10),
      new THREE.MeshStandardMaterial({ color: 0x3c2c25, roughness: 0.35, metalness: 0.08 })
    );
    table.position.set(0, -0.16, 0.25);
    scene.add(table);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.92, 0.98, 1.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x271c17, roughness: 0.55 })
    );
    pedestal.position.set(0, -0.72, 0.25);
    scene.add(pedestal);

    screenGroup = new THREE.Group();
    const mainScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.34),
      new THREE.MeshBasicMaterial({ color: 0x0f2234 })
    );
    mainScreen.position.set(0, 1.58, -2.9);
    screenGroup.add(mainScreen);
    const sideScreen1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.74), new THREE.MeshBasicMaterial({ color: 0x11263b }));
    sideScreen1.position.set(-2.15, 1.48, -1.8);
    sideScreen1.rotation.y = 0.48;
    screenGroup.add(sideScreen1);
    const sideScreen2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.74), new THREE.MeshBasicMaterial({ color: 0x11263b }));
    sideScreen2.position.set(2.15, 1.48, -1.8);
    sideScreen2.rotation.y = -0.48;
    screenGroup.add(sideScreen2);
    scene.add(screenGroup);

    chartGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.4 + i * 0.24, 0.18),
        new THREE.MeshStandardMaterial({ color: i % 2 ? 0x7dd3fc : 0xf6c177, emissive: i % 2 ? 0x335d72 : 0x664d23, emissiveIntensity: 0.35 })
      );
      bar.position.set(-0.52 + i * 0.34, -0.05 + bar.geometry.parameters.height / 2, 1.02);
      chartGroup.add(bar);
    }
    scene.add(chartGroup);

    documentGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const doc = new THREE.Mesh(
        new THREE.PlaneGeometry(0.82, 1.14),
        new THREE.MeshStandardMaterial({ color: 0xeef5ff, roughness: 0.7, metalness: 0.02 })
      );
      doc.position.set(-1.1 + i * 0.86, 0.58 + i * 0.12, 1.2 + i * 0.32);
      doc.rotation.z = -0.32 + i * 0.16;
      documentGroup.add(doc);
    }
    scene.add(documentGroup);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(1.48, 0.92, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x111f2d, roughness: 0.65 })
    );
    board.position.set(-2.85, 0.72, 0.1);
    scene.add(board);

    const laptop = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.04, 0.62),
      new THREE.MeshStandardMaterial({ color: 0x16263a, roughness: 0.4, metalness: 0.2 })
    );
    laptop.position.set(1.3, -0.02, 0.7);
    laptop.rotation.x = -0.2;
    scene.add(laptop);

    const chairs = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const chair = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.6, 0.26),
        new THREE.MeshStandardMaterial({ color: 0x1b2a3d, roughness: 0.7 })
      );
      const angle = (i / 6) * Math.PI * 2;
      chair.position.set(Math.cos(angle) * 2.45, -0.45, Math.sin(angle) * 1.85);
      chair.lookAt(0, -0.35, 0.25);
      chairs.add(chair);
    }
    scene.add(chairs);

    focusPrompt('Strategy Deck');
  }

  function animate() {
    if (!scene) return;
    const scrollMax = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const progress = window.scrollY / scrollMax;
    targetScroll += (progress - targetScroll) * 0.08;
    const t = performance.now() * 0.001;

    camera.position.x = Math.sin(t * 0.25) * 0.12 + (targetScroll - 0.5) * 0.85;
    camera.position.y = 1.6 + Math.sin(t * 0.4) * 0.05 + (0.5 - Math.abs(targetScroll - 0.5)) * 0.12;
    camera.position.z = 7.2 - targetScroll * 4.4;
    camera.lookAt(0, 0.55, 0.4);

    rig.rotation.y = Math.sin(t * 0.18) * 0.05 + (targetScroll - 0.5) * 0.45;
    table.rotation.y = t * 0.08;
    screenGroup.rotation.x = Math.sin(t * 0.4) * 0.02;
    documentGroup.children.forEach((obj, idx) => {
      obj.position.y += Math.sin(t * 0.8 + idx) * 0.002;
      obj.rotation.z = (-0.32 + idx * 0.16) + Math.sin(t * 0.5 + idx) * 0.04;
    });
    chartGroup.children.forEach((bar, idx) => {
      bar.scale.y = 0.85 + Math.max(0, Math.sin(targetScroll * Math.PI * 2 + idx)) * 0.35;
    });
    cityGroup.position.x = (0.5 - targetScroll) * 0.4;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function updateScrollPrompt() {
    const sections = ['#home', '#boardroom', '#cases', '#services', '#method', '#results', '#pricing', '#contact'];
    const index = Math.min(sections.length - 1, Math.floor((window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * sections.length));
    if (index === 0) focusPrompt('Strategy Deck');
    if (index === 1) focusPrompt('Decision Board');
    if (index === 2) focusPrompt('Case Study');
    if (index === 3) focusPrompt('Financial Dashboard');
    if (index === 4) focusPrompt('Growth Map');
    if (index === 5) focusPrompt('ROI Results');
    if (index >= 6) focusPrompt('Book Consultation');
  }

  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  scrollLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        smoothScrollTo(href);
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    if (link.hasAttribute('data-scroll')) return;
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        smoothScrollTo(href);
      }
    });
  });

  enterButtons.forEach((btn) => btn.addEventListener('click', () => {
    guided = 1;
    focusPrompt('Decision Board');
    openModal('Enter Boardroom', 'The camera now moves from the doorway toward the central table, screens, and executive decision surface.', 'Boardroom motion', 'Focus on Case Study', () => {
      smoothScrollTo('#cases');
      closeModal();
    });
    setTimeout(() => { guided = 0; }, 1400);
  }));

  hotspotButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const prompt = btn.dataset.hotspot;
      if (prompt) {
        focusPrompt(prompt);
        openModal(prompt, `This hotspot highlights the ${prompt.toLowerCase()} layer inside the boardroom scene.`, 'Interactive hotspot', 'Close', closeModal);
      } else {
        smoothScrollTo('#contact');
      }
    });
  });

  caseButtons.forEach((btn) => btn.addEventListener('click', () => {
    const title = btn.dataset.case;
    openModal(title, stories[title] || 'A boardroom-ready case with challenge, diagnosis, strategy, execution, and result.', 'Case study', 'View Results', () => {
      smoothScrollTo('#results');
      closeModal();
    });
  }));

  learnMoreButtons.forEach((btn) => btn.addEventListener('click', () => {
    const body = btn.dataset.more || 'Additional information about this service is available through a consultation.';
    openModal('Service detail', body, 'Learn more', 'Book Consultation', () => {
      smoothScrollTo('#contact');
      closeModal();
    });
  }));

  chooseButtons.forEach((btn) => btn.addEventListener('click', () => {
    const plan = btn.dataset.plan;
    openModal(plan, engagementDetails[plan] || 'A custom engagement option for executive advisory work.', 'Engagement model', 'Go to Booking', () => {
      const engagement = bookingForm.querySelector('[name="engagement"]');
      if (engagement) engagement.value = plan;
      smoothScrollTo('#contact');
      closeModal();
    });
  }));

  methodSteps.forEach((step) => step.addEventListener('click', () => {
    methodSteps.forEach((el) => el.classList.remove('active'));
    step.classList.add('active');
    const key = step.dataset.method;
    focusPrompt(key === 'Scale' ? 'ROI Results' : key === 'Execute' ? 'Case Study' : key === 'Design' ? 'Decision Board' : 'Strategy Deck');
    openModal(key, methodDetails[key] || 'A structured consulting step.', 'Method step', 'Close', closeModal);
  }));

  resultsButton?.addEventListener('click', () => {
    openModal('Results Dashboard', 'This panel summarizes revenue impact, efficiency gains, ROI, workshops, markets analyzed, and client retention.', 'Results view', 'Book Consultation', () => {
      smoothScrollTo('#contact');
      closeModal();
    });
  });

  breakdownButton?.addEventListener('click', () => {
    openModal('Featured case breakdown', 'A full breakdown expands the challenge, diagnosis, strategy, execution, and result layers into one executive narrative.', 'Case breakdown', 'View Case Studies', () => {
      smoothScrollTo('#cases');
      closeModal();
    });
  });

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(bookingForm);
    const required = ['name', 'email', 'company', 'role', 'challenge', 'engagement', 'message'];
    const missing = required.filter((field) => !(data.get(field) || '').toString().trim());
    const email = (data.get('email') || '').toString();
    if (missing.length || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formNote.textContent = 'Please complete all fields with a valid email address.';
      formNote.style.color = '#fca5a5';
      return;
    }
    formNote.textContent = `Thanks ${data.get('name')}. Your ${data.get('engagement')} request has been queued for review.`;
    formNote.style.color = '#a7f3d0';
    bookingForm.reset();
    focusPrompt('Book Consultation');
    openModal('Consultation booked', 'Your strategy consultation request was received. We will reply with next steps, time options, and a boardroom agenda.', 'Confirmation', 'Close', closeModal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.querySelectorAll('[data-close-modal]').forEach((btn) => btn.addEventListener('click', closeModal));

  window.addEventListener('scroll', updateScrollPrompt, { passive: true });
  window.addEventListener('resize', () => {
    if (!renderer || !camera) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.18 });
  revealEls.forEach((el) => observer.observe(el));

  initScene();
  updateScrollPrompt();
  requestAnimationFrame(animate);
})();

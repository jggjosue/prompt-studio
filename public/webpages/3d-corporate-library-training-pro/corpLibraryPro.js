(function () {
  'use strict';

  const courses = [
    ['Leadership Essentials Pro', 'Leadership', '8h', 'Intermediate', 'Blend', 'Build modern leadership habits for managers and emerging leaders.'],
    ['Cybersecurity Awareness', 'Security', '4h', 'Beginner', 'Microlearning', 'Teach safe practices, threat spotting and policy awareness.'],
    ['Sales Enablement Masterclass', 'Revenue', '6h', 'Intermediate', 'Workshop', 'Equip sellers with discovery, objection handling and playbooks.'],
    ['Customer Success Operations', 'CX', '5h', 'Intermediate', 'Simulation', 'Improve retention, onboarding and support workflows.'],
    ['Data Literacy for Teams', 'Analytics', '7h', 'Beginner', 'Self-paced', 'Turn reporting into practical decisions for every department.'],
    ['Compliance & Policy Training', 'Governance', '3h', 'Required', 'Assessment', 'Keep teams aligned on policy, audit and risk responsibilities.'],
    ['AI Productivity at Work', 'AI Tools', '4h', 'Intermediate', 'Lab', 'Help teams work faster with responsible AI and automation.'],
    ['Project Management Foundations', 'Operations', '6h', 'Beginner', 'Course', 'Organize execution, milestones, ownership and delivery.']
  ];
  const paths = [
    { name: 'New Hire Onboarding', owner: 'HR', steps: ['Welcome', 'Policy', 'Tools', 'First 30 days'], color: '#7fe7ff' },
    { name: 'Future Leaders', owner: 'Leadership', steps: ['Self-awareness', 'Coaching', 'Delegation', 'Strategy'], color: '#f3c77b' },
    { name: 'Sales Accelerator', owner: 'Revenue', steps: ['Product', 'Discovery', 'Pipeline', 'Closing'], color: '#78d59a' },
    { name: 'Compliance Core', owner: 'Governance', steps: ['Code of conduct', 'Privacy', 'Security', 'Audit'], color: '#c79dff' }
  ];
  const vaultItems = [
    ['Leadership', 'Playbooks', 'Decision frameworks, coaching sheets and executive summaries.'],
    ['Sales', 'SOPs', 'Repeatable workflows for demos, proposals and handoffs.'],
    ['Compliance', 'Policy docs', 'Auditable policy references and training notes.'],
    ['HR', 'Onboarding', 'Checklist packs, orientation guides and welcome docs.'],
    ['Operations', 'Templates', 'Meeting, planning and process templates.'],
    ['Technology', 'Training videos', 'Internal explainers, releases and support clips.'],
    ['AI Tools', 'Assessment guides', 'Prompting best practices and evaluation rubrics.']
  ];
  const plans = [
    ['Starter Library', '$0', 'Up to 20 users', ['Core library', 'Basic analytics', 'Email support']],
    ['Team Training Pro', '$49', 'Up to 100 users', ['Learning paths', 'AI mentor', 'Resource vault']],
    ['Enterprise Academy', '$149', 'Unlimited users', ['Department dashboards', 'SSO', 'Compliance tracking']],
    ['Custom Learning Suite', 'Custom', 'Tailored scope', ['Custom integrations', 'Dedicated success', 'Executive reporting']]
  ];
  const testimonials = [
    'Our training content finally feels organized, measurable and easy to scale.',
    'The 3D library made onboarding feel premium and engaging for new hires.',
    'Managers can see learning progress, skill gaps and certifications in one place.'
  ];
  const metrics = [
    ['Completion by department', '84%'],
    ['Knowledge check pass rate', '96%'],
    ['Departments enrolled', '22'],
    ['Skill gap reduction', '78%']
  ];

  const dom = {
    menuToggle: document.getElementById('menuToggle'),
    siteNav: document.getElementById('siteNav'),
    canvas: document.getElementById('libraryCanvas'),
    callout: document.getElementById('canvasCallout'),
    courseGrid: document.getElementById('courseGrid'),
    pathList: document.getElementById('pathList'),
    pathDetail: document.getElementById('pathDetail'),
    startPathBtn: document.getElementById('startPathBtn'),
    metrics: document.getElementById('metrics'),
    chartPanel: document.getElementById('chartPanel'),
    vaultFilters: document.getElementById('vaultFilters'),
    vaultGrid: document.getElementById('vaultGrid'),
    pricingGrid: document.getElementById('pricingGrid'),
    testimonialGrid: document.getElementById('testimonialGrid'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalClose: document.getElementById('modalClose'),
    demoForm: document.getElementById('demoForm'),
    formStatus: document.getElementById('formStatus'),
    planSelect: document.getElementById('planSelect'),
    mentorAnswer: document.getElementById('mentorAnswer')
  };

  const state = { pathIndex: 0, vaultFilter: 'All', cameraTarget: { x: 0, y: 1.1, z: 8 }, hitPulse: 0 };
  let scene, camera, renderer, raycaster, pointer, library, objects = [], animateId;
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderUI() {
    dom.courseGrid.innerHTML = courses.map((c, i) => `
      <article class="course-card">
        <div class="meta-row"><span class="pill">${c[1]}</span><span class="pill">${c[2]}</span><span class="pill">${c[3]}</span></div>
        <h3>${c[0]}</h3><p>${c[5]}</p>
        <div class="meta-row"><span class="pill">${c[4]}</span></div>
        <button class="mini-btn" data-course="${i}">View Course</button>
      </article>`).join('');
    dom.pathList.innerHTML = paths.map((p, i) => `
      <article class="path-card ${i === 0 ? 'active' : ''}" data-path="${i}">
        <div class="meta-row"><span class="pill">${p.owner}</span></div>
        <h3>${p.name}</h3><p>${p.steps.join(' → ')}</p>
      </article>`).join('');
    dom.pathDetail.innerHTML = pathMarkup(paths[0]);
    dom.metrics.innerHTML = metrics.map(([label, value], i) => `
      <div class="metric reveal visible delay-${Math.min(i, 2)}"><strong>${value}</strong><span>${label}</span></div>`).join('');
    const filterNames = ['All', 'Leadership', 'Sales', 'Compliance', 'HR', 'Operations', 'Technology', 'AI Tools'];
    dom.vaultFilters.innerHTML = filterNames.map(f => `<button class="filter-btn ${f === 'All' ? 'active' : ''}" data-filter="${f}">${f}</button>`).join('');
    dom.vaultGrid.innerHTML = vaultItems.map(([tag, title, desc]) => `
      <article class="glass-card vault-item" data-vault="${tag}"><span class="pill">${tag}</span><h3>${title}</h3><p>${desc}</p><button class="mini-btn" data-resource="${title}">Open Resource</button></article>`).join('');
    dom.pricingGrid.innerHTML = plans.map(([name, price, users, perks]) => `
      <article class="pricing-card">
        <h3>${name}</h3><div class="price">${price}</div><p>${users}</p><ul>${perks.map(p => `<li>${p}</li>`).join('')}</ul>
        <button class="mini-btn" data-plan="${name}">Choose Plan</button>
      </article>`).join('');
    dom.testimonialGrid.innerHTML = testimonials.map(t => `<article class="testimonial"><p>“${t}”</p></article>`).join('');
    dom.planSelect.innerHTML = plans.map(([name]) => `<option>${name}</option>`).join('');
    selectPath(0, false);
    renderVault('All');
  }

  function pathMarkup(path) {
    return `<p>${path.owner} focused journey.</p><ol>${path.steps.map(s => `<li>${s}</li>`).join('')}</ol><p>Built for guided onboarding, role-based progression and measurable outcomes.</p>`;
  }

  function selectPath(index, animate = true) {
    state.pathIndex = index;
    [...dom.pathList.querySelectorAll('.path-card')].forEach((card, i) => card.classList.toggle('active', i === index));
    dom.pathDetail.innerHTML = pathMarkup(paths[index]);
    if (animate) pulseCamera(paths[index].color);
  }

  function renderVault(filter) {
    state.vaultFilter = filter;
    [...dom.vaultFilters.querySelectorAll('.filter-btn')].forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
    [...dom.vaultGrid.children].forEach(card => {
      const match = filter === 'All' || card.dataset.vault === filter;
      card.style.opacity = match ? '1' : '.35';
      card.style.transform = match ? 'translateY(0)' : 'scale(.98)';
    });
    dom.callout.textContent = filter === 'All' ? 'Resource Vault, SOPs and templates are ready for enterprise knowledge delivery.' : `${filter} resources highlighted in the vault.`;
  }

  function openModal(title, body) {
    dom.modalTitle.textContent = title;
    dom.modalBody.innerHTML = body;
    dom.modal.classList.add('open');
    dom.modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    dom.modal.classList.remove('open');
    dom.modal.setAttribute('aria-hidden', 'true');
  }

  function pulseCamera(color) {
    state.hitPulse = 1;
    state.cameraTarget = { x: 0.2, y: 1.2, z: 6.2 };
    dom.callout.textContent = 'The library camera is entering a guided zone with glowing learning tracks and curated content.';
    if (dom.chartPanel) dom.chartPanel.style.boxShadow = `0 0 0 1px ${color}55, var(--shadow)`;
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111f);
    camera = new THREE.PerspectiveCamera(45, dom.canvas.clientWidth / dom.canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.1, 8);
    renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(dom.canvas.clientWidth, dom.canvas.clientHeight, false);
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffe6c0, 1.2); key.position.set(3, 5, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(0x7fe7ff, 0.7); fill.position.set(-3, 2, 2); scene.add(fill);
    const rim = new THREE.PointLight(0x9bffd9, 1.8, 20); rim.position.set(0, 1.5, 3.5); scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 18),
      new THREE.MeshStandardMaterial({ color: 0x0d1726, roughness: 1, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    scene.add(floor);

    library = new THREE.Group();
    scene.add(library);
    addLibrary();
    addHotspots();
  }

  function addLibrary() {
    const wood = new THREE.MeshStandardMaterial({ color: 0x6c5440, roughness: 0.8 });
    const glow = new THREE.MeshStandardMaterial({ color: 0x7fe7ff, emissive: 0x7fe7ff, emissiveIntensity: .7, roughness: .2 });
    for (let i = -3; i <= 3; i += 1) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.15, 0.42), wood);
      shelf.position.set(i < 0 ? -4.2 : 4.2, -0.2, i * 1.6);
      library.add(shelf);
      for (let b = 0; b < 8; b += 1) {
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 0.2), new THREE.MeshStandardMaterial({
          color: [0x4f6b8c, 0x7fe7ff, 0xf3c77b, 0x78d59a, 0xc79dff][b % 5],
          roughness: 0.5
        }));
        book.position.set(i < 0 ? -5.7 : 3.0, 0.2 + (b % 4) * 0.22, i * 1.6 - 1.2 + b * 0.3);
        book.rotation.y = b * 0.08;
        library.add(book);
        objects.push(book);
      }
    }
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.4, .35, 1.2), new THREE.MeshStandardMaterial({ color: 0x1e2d42, roughness: .7 }));
    desk.position.set(0, -.05, 2.8);
    library.add(desk);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(.45, 32, 32), glow);
    orb.position.set(0, 1.2, 1.6);
    library.add(orb);
    objects.push(orb);
  }

  function addHotspots() {
    const labels = ['Course Catalog', 'Learning Paths', 'Certification Wall', 'AI Mentor', 'Employee Analytics', 'Resource Vault', 'Mentorship Room', 'Start Training'];
    labels.forEach((label, i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(.55, .18, .22), new THREE.MeshStandardMaterial({ color: 0x122033, emissive: 0x1f3d55, emissiveIntensity: .9 }));
      m.position.set(Math.cos(i) * 2.5, .9 + (i % 2) * .4, Math.sin(i) * 2.5);
      m.userData = { label };
      scene.add(m);
      objects.push(m);
    });
  }

  function bindActions() {
    dom.menuToggle.addEventListener('click', () => {
      const open = dom.siteNav.classList.toggle('open');
      dom.menuToggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => dom.siteNav.classList.remove('open')));
    document.querySelectorAll('[data-action="enter-library"]').forEach(btn => btn.addEventListener('click', () => {
      pulseCamera('#7fe7ff');
      scrollToSection('courses');
    }));
    document.querySelectorAll('[data-action="ask-mentor"]').forEach(btn => btn.addEventListener('click', () => {
      dom.mentorAnswer.textContent = 'Recommended next step: combine Data Literacy for Teams with Compliance & Policy Training for a well-rounded rollout.';
      openModal('AI Mentor', '<p>Your mentor suggests starting with a quick skills audit, then sequencing learning by role. For leaders, combine coaching with analytics. For employees, keep learning in short modules with certifications.</p>');
    }));
    document.querySelectorAll('[data-action="view-certificate"]').forEach(btn => btn.addEventListener('click', () => openModal('Certificate Preview', '<p>Executive Certificate of Completion</p><p>Digital badge, progress stamp and compliance-ready metadata visible here.</p>')));
    document.querySelectorAll('[data-action="view-dashboard"]').forEach(btn => btn.addEventListener('click', () => openModal('Learning Dashboard', '<p>Completion by department, certification readiness and engagement metrics are shown as enterprise KPI cards.</p>')));
    document.querySelectorAll('[data-action="analyze-team"]').forEach(btn => btn.addEventListener('click', () => openModal('Team Progress Analysis', '<p>Sales and operations have the strongest momentum. The biggest opportunity is to close AI tool adoption gaps in support and HR.</p>')));

    dom.startPathBtn.addEventListener('click', () => openModal('Start Path', `<p>${paths[state.pathIndex].name} activated.</p><p>The path is now set as the active progression track for your team.</p>`));
    dom.pathList.addEventListener('click', e => {
      const card = e.target.closest('.path-card');
      if (!card) return;
      selectPath(Number(card.dataset.path));
    });
    dom.vaultFilters.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (btn) renderVault(btn.dataset.filter);
    });
    dom.vaultGrid.addEventListener('click', e => {
      const btn = e.target.closest('[data-resource]');
      if (!btn) return;
      openModal('Resource Opened', `<p>${btn.dataset.resource} is ready for preview.</p>`);
    });
    dom.pricingGrid.addEventListener('click', e => {
      const btn = e.target.closest('[data-plan]');
      if (!btn) return;
      document.getElementById('planSelect').value = btn.dataset.plan;
      scrollToSection('contact');
      openModal('Plan Selected', `<p>${btn.dataset.plan} has been selected. Use the contact form to request a tailored demo.</p>`);
    });
    document.body.addEventListener('click', e => {
      const c = e.target.closest('[data-course]');
      if (!c) return;
      const course = courses[Number(c.dataset.course)];
      openModal('Course Details', `<p><strong>${course[0]}</strong></p><p>${course[5]}</p><p>Category: ${course[1]} · Duration: ${course[2]} · Level: ${course[3]} · Format: ${course[4]}</p>`);
    });
    document.body.addEventListener('click', e => {
      const hotspot = e.target.closest('.hotspot');
      if (hotspot) {
        dom.callout.textContent = `Hotspot active: ${hotspot.dataset.hotspot}.`;
        openModal(hotspot.dataset.hotspot, `<p>This hotspot highlights the ${hotspot.dataset.hotspot.toLowerCase()} area inside the 3D corporate library.</p>`);
      }
    });
    dom.modal.addEventListener('click', e => { if (e.target === dom.modal) closeModal(); });
    dom.modalClose.addEventListener('click', closeModal);

    dom.demoForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(dom.demoForm).entries());
      const required = ['name', 'email', 'company', 'teamSize', 'trainingNeed', 'message'];
      const missing = required.filter(key => !String(data[key] || '').trim());
      if (missing.length) {
        dom.formStatus.textContent = 'Please complete all required fields.';
        return;
      }
      dom.formStatus.textContent = 'Thanks. Your enterprise demo request has been received.';
      dom.demoForm.reset();
    });

    window.addEventListener('resize', () => {
      if (!camera || !renderer) return;
      camera.aspect = dom.canvas.clientWidth / dom.canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(dom.canvas.clientWidth, dom.canvas.clientHeight, false);
    });
    window.addEventListener('scroll', syncReveal, { passive: true });
    syncReveal();
  }

  function syncReveal() {
    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) el.classList.add('visible');
    });
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function animate() {
    const t = performance.now() * 0.001;
    if (!prefersReducedMotion) {
      objects.forEach((obj, i) => {
        obj.rotation.y += i % 2 ? 0.004 : -0.003;
        obj.position.y += Math.sin(t + i) * 0.0008;
      });
      camera.position.x += (state.cameraTarget.x - camera.position.x) * 0.04;
      camera.position.y += (state.cameraTarget.y - camera.position.y) * 0.04;
      camera.position.z += (state.cameraTarget.z - camera.position.z) * 0.04;
      camera.lookAt(0, 0.9, 0);
      state.hitPulse = Math.max(0, state.hitPulse - 0.03);
      if (state.hitPulse > 0) dom.callout.style.transform = `translateY(${Math.sin(t * 4) * 2}px)`;
    }
    renderer.render(scene, camera);
    animateId = requestAnimationFrame(animate);
  }

  function init() {
    renderUI();
    initScene();
    bindActions();
    animate();
  }

  init();
})();

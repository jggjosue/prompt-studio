(function () {
  const courses = [
    { title: 'Leadership Essentials', category: 'Leadership', duration: '4h', level: 'Core', description: 'Practical leadership habits for managers who need alignment, coaching, and execution.' },
    { title: 'Cybersecurity Awareness', category: 'Compliance', duration: '2h', level: 'All staff', description: 'Build secure behavior with phishing response, password hygiene, and safe data handling.' },
    { title: 'Sales Enablement', category: 'Sales', duration: '3h', level: 'Team', description: 'Give sellers messaging, discovery, and objection handling that shortens the sales cycle.' },
    { title: 'Customer Success Training', category: 'Customer', duration: '3.5h', level: 'Core', description: 'Improve onboarding, retention, and account health with repeatable service rituals.' },
    { title: 'Data Literacy', category: 'Analytics', duration: '3h', level: 'Foundation', description: 'Learn how to read metrics, ask better questions, and turn dashboards into decisions.' },
    { title: 'Compliance Basics', category: 'Operations', duration: '2h', level: 'Mandatory', description: 'A clear walkthrough of policies, escalation, and record keeping across teams.' },
    { title: 'AI Productivity at Work', category: 'Technology', duration: '2.5h', level: 'Modern work', description: 'Use AI responsibly for drafting, summarizing, and accelerating everyday workflows.' },
    { title: 'Project Management Foundations', category: 'Operations', duration: '4h', level: 'Core', description: 'Plan, track, and deliver with realistic scopes, milestones, and stakeholder updates.' },
  ];

  const paths = [
    { title: 'New Employee Onboarding', steps: 5, duration: '1 week', progress: 84, desc: 'Start with policies, systems, culture, and first-week expectations.' },
    { title: 'Manager Development Path', steps: 7, duration: '3 weeks', progress: 68, desc: 'Build coaching, planning, and feedback skills for new and growing leaders.' },
    { title: 'Sales Team Enablement', steps: 6, duration: '2 weeks', progress: 73, desc: 'Ramp reps on messaging, qualification, proposals, and customer discovery.' },
    { title: 'Security & Compliance Path', steps: 4, duration: '1 week', progress: 91, desc: 'Cover security hygiene, documentation, audit readiness, and escalation.' },
    { title: 'Technical Upskilling Path', steps: 8, duration: '4 weeks', progress: 57, desc: 'Raise technical fluency through focused modules and practice scenarios.' },
    { title: 'Executive Leadership Track', steps: 5, duration: '2 weeks', progress: 62, desc: 'Support strategy, communication, and team health for senior leaders.' },
  ];

  const certs = [
    'Certified Team Leader', 'Compliance Ready', 'Data-Driven Professional', 'Customer Experience Specialist', 'AI Workflow Practitioner'
  ];

  const resources = [
    { title: 'Playbooks', group: 'Leadership' }, { title: 'SOPs', group: 'Operations' }, { title: 'Policy Documents', group: 'Compliance' }, { title: 'Training Videos', group: 'Technology' }, { title: 'Templates', group: 'Sales' }, { title: 'Assessment Guides', group: 'HR' }, { title: 'Onboarding Checklists', group: 'HR' }
  ];

  const pricing = [
    { title: 'Starter Library', price: '$19', perks: ['Core resource hub', '5 learning paths', 'Email support'] },
    { title: 'Team Training Hub', price: '$59', perks: ['Course analytics', 'Assignments', 'Manager dashboard'] },
    { title: 'Enterprise Academy', price: '$149', perks: ['Certifications', 'Mentorship tools', 'Department reporting'] },
    { title: 'Custom Learning Suite', price: 'Custom', perks: ['SSO & branding', 'API access', 'Dedicated onboarding'] },
  ];

  const testimonials = [
    'Our training content finally feels organized and easy to explore.',
    'The 3D library made onboarding feel premium and engaging.',
    'Managers can see learning progress without chasing spreadsheets.'
  ];

  const kpis = [
    ['82%', 'Course Completion'],
    ['1,240', 'Active Learners'],
    ['320', 'Certificates Earned'],
    ['94%', 'Knowledge Check Pass Rate'],
    ['18', 'Departments Enrolled'],
  ];

  const departments = [
    ['Operations', 92], ['Sales', 81], ['HR', 77], ['Technology', 88], ['Leadership', 69]
  ];

  const state = { path: paths[0].title, filter: 'All', modal: '', entered: false, canvasMode: 0, formSent: false };
  const $ = (id) => document.getElementById(id);
  const els = {
    canvas: $('libraryCanvas'),
    hotspots: $('hotspots'),
    courseGrid: $('courseGrid'),
    pathGrid: $('pathGrid'),
    certGrid: $('certGrid'),
    resourceGrid: $('resourceGrid'),
    resourceFilters: $('resourceFilters'),
    pricingGrid: $('pricingGrid'),
    testimonialGrid: $('testimonialGrid'),
    kpiRow: $('kpiRow'),
    deptBars: $('deptBars'),
    teamProgress: $('teamProgress'),
    nextCourses: $('nextCourses'),
    demoForm: $('demoForm'),
    formMessage: $('formMessage'),
    menuToggle: $('menuToggle'),
    navMenu: $('navMenu'),
    modal: $('infoModal'),
    modalContent: $('modalContent'),
    toast: $('toast'),
  };

  const ctx = els.canvas.getContext('2d');

  function paintCanvas() {
    const w = els.canvas.width, h = els.canvas.height;
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0b1630');
    grad.addColorStop(1, '#050a13');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    const t = performance.now() / 1000;
    const horizon = h * 0.32;
    ctx.fillStyle = 'rgba(215,179,106,0.06)'; ctx.fillRect(0, horizon - 50, w, h - horizon + 50);
    for (let i = 0; i < 7; i++) {
      const depth = i / 7;
      ctx.fillStyle = `rgba(114,215,255,${0.04 - depth * 0.004})`;
      ctx.fillRect(0, horizon + depth * 60, w, 2);
    }

    const shelves = [
      [120, 170, 0.9], [330, 150, 1.1], [560, 160, 1.3], [760, 145, 1.5]
    ];
    shelves.forEach(([x, y, scale], i) => {
      const sway = Math.sin(t * 0.6 + i) * 8;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x - 30, y, 160 * scale, 220);
      ctx.fillStyle = 'rgba(20,30,48,0.95)';
      ctx.fillRect(x - 20, y + 10, 140 * scale, 200);
      for (let b = 0; b < 7; b++) {
        ctx.fillStyle = ['#7d5e4b', '#446783', '#9b8457', '#566d58'][b % 4];
        const bx = x + 12 + b * 16 * scale;
        ctx.save();
        ctx.translate(bx, y + 28 + (b % 2) * 32);
        ctx.rotate(Math.sin(t * 1.4 + b + i) * 0.04);
        ctx.fillRect(-8, -22 + sway * 0.02, 15 * scale, 44 * scale);
        ctx.restore();
      }
    });

    const deskY = h * 0.72;
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(100, deskY, w - 200, 24);
    ctx.fillStyle = 'rgba(108,79,42,0.65)'; ctx.fillRect(120, deskY + 24, w - 240, 48);
    ctx.fillStyle = 'rgba(114,215,255,0.15)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(220 + i * 150, 160 + Math.sin(t * 1.2 + i) * 10, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(215,179,106,0.35)';
    ctx.fillRect(72, 120, 12, h - 120);
    ctx.fillRect(w - 84, 120, 12, h - 120);
  }

  function renderHotspots() {
    const items = [
      ['Course Catalog', 28, 32, 'Opens the training catalog and highlights the course wall.'],
      ['Learning Paths', 72, 30, 'Moves focus deeper into onboarding and role-based routes.'],
      ['Certification Wall', 78, 56, 'Shows badges, seals, and earned credentials.'],
      ['Employee Progress', 20, 58, 'Surfaces the leadership progress dashboard.'],
      ['Resource Vault', 50, 72, 'Filters documents, playbooks, and templates.'],
      ['Mentorship Room', 28, 84, 'Highlights coaching and booking support.'],
      ['Start Training', 74, 84, 'Jumps the camera toward the active training zone.'],
    ];
    els.hotspots.innerHTML = items.map(([label, x, y, desc]) => `<button class="hotspot" style="left:${x}%;top:${y}%;" data-desc="${desc}">${label}</button>`).join('');
  }

  function renderCards() {
    els.courseGrid.innerHTML = courses.map((c) => `
      <article class="course-card reveal">
        <span class="card-tag">${c.category}</span>
        <h3>${c.title}</h3>
        <div class="course-meta"><span>${c.duration}</span><span>${c.level}</span></div>
        <p>${c.description}</p>
        <button class="ghost-btn inline" data-course="${c.title}">View Course</button>
      </article>`).join('');

    els.pathGrid.innerHTML = paths.map((p) => `
      <article class="path-card reveal">
        <div>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="path-track"><div class="path-fill" style="width:${p.progress}%"></div></div>
        </div>
        <div class="meta-row"><span>${p.steps} steps</span><span>${p.duration}</span></div>
        <button class="ghost-btn inline" data-path="${p.title}">Start Path</button>
      </article>`).join('');

    els.certGrid.innerHTML = certs.map((c) => `
      <article class="cert-card reveal">
        <span class="pill">Certificate</span>
        <h3>${c}</h3>
        <p>Digital proof of progress with a premium badge and visible achievement marker.</p>
        <button class="ghost-btn inline" data-certificate="${c}">View Certificate</button>
      </article>`).join('');

    els.resourceGrid.innerHTML = resources.map((r) => `
      <article class="resource-card reveal" data-group="${r.group}">
        <span class="card-tag">${r.group}</span>
        <h3>${r.title}</h3>
        <p>Open a curated ${r.title.toLowerCase()} collection for your team.</p>
        <button class="ghost-btn inline" data-resource="${r.title}">Open Resource</button>
      </article>`).join('');

    els.pricingGrid.innerHTML = pricing.map((p) => `
      <article class="pricing-card reveal">
        <span class="card-tag">${p.title}</span>
        <h3>${p.price}</h3>
        <ul class="list">${p.perks.map((x) => `<li>${x}</li>`).join('')}</ul>
        <button class="ghost-btn inline" data-plan="${p.title}">Choose Plan</button>
      </article>`).join('');

    els.testimonialGrid.innerHTML = testimonials.map((t) => `<article class="info-card reveal"><p>“${t}”</p></article>`).join('');
    els.kpiRow.innerHTML = kpis.map(([n, l]) => `<div class="kpi"><strong>${n}</strong><span>${l}</span></div>`).join('');
    els.deptBars.innerHTML = departments.map(([name, pct]) => `<div><div class="meta-row"><span>${name}</span><span>${pct}%</span></div><div class="bar"><span style="width:${pct}%"></span></div></div>`).join('');
    els.teamProgress.innerHTML = `<h3>Completion by department</h3><p>Training engagement is strongest in Technology and Operations, with clear upside in Leadership and HR.</p><div class="meta-row"><span>Skill gaps prioritized</span><span>11</span><span>Readiness score 87%</span></div>`;
    els.nextCourses.innerHTML = ['AI Productivity at Work', 'Cybersecurity Awareness', 'Leadership Essentials'].map((x) => `<li>${x}</li>`).join('');

    const filters = ['All', 'Leadership', 'Sales', 'Compliance', 'HR', 'Operations', 'Technology'];
    els.resourceFilters.innerHTML = filters.map((f) => `<button class="filter-btn ${f === 'All' ? 'active' : ''}" data-filter="${f}">${f}</button>`).join('');
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.remove('hidden');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.add('hidden'), 2600);
  }

  function openModal(title, body) {
    els.modalContent.innerHTML = `<h3 id="modalTitle">${title}</h3><p>${body}</p>`;
    els.modal.classList.remove('hidden');
  }

  function closeModal() { els.modal.classList.add('hidden'); }

  function enterLibrary(mode = 1) {
    state.canvasMode = mode;
    state.entered = true;
    showToast('Guided library flight activated.');
  }

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('.hotspot')) openModal(target.textContent, target.dataset.desc);
    if (target.matches('[data-course]')) openModal(target.dataset.course, 'A detailed course panel would expand here with curriculum, outcomes, and enrollment status.');
    if (target.matches('[data-path]')) { state.path = target.dataset.path; showToast(`Activated ${state.path}.`); }
    if (target.matches('[data-certificate]')) openModal(target.dataset.certificate, 'Simulated certificate preview with seal, issuer, and completion metadata.');
    if (target.matches('[data-resource]')) showToast(`Opened ${target.dataset.resource}.`);
    if (target.matches('[data-plan]')) openModal(target.dataset.plan, 'This plan has been selected and can be converted into a demo conversation.');
    if (target.matches('[data-filter]')) {
      document.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.toggle('active', btn === target));
      state.filter = target.dataset.filter;
      document.querySelectorAll('.resource-card').forEach((card) => {
        card.style.opacity = state.filter === 'All' || card.dataset.group === state.filter ? '1' : '.28';
      });
    }
    if (target.dataset.action === 'enter-library') enterLibrary(2);
    if (target.dataset.action === 'view-dashboard') openModal('Training Dashboard', 'This dashboard combines completion metrics, departmental progress, and certification health in a single executive view.');
    if (target.dataset.action === 'book-mentorship') openModal('Book Mentorship', 'Open a booking flow for mentor matching, session topics, and availability slots.');
    if (target.dataset.action === 'analyze-team') openModal('Analyze Team Progress', 'This panel would reveal skill gaps, engagement by department, and recommended next courses.');
    if (target.dataset.close === 'modal') closeModal();
  });

  els.modal.addEventListener('click', (e) => { if (e.target === els.modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  els.menuToggle.addEventListener('click', () => {
    const open = els.navMenu.classList.toggle('open');
    els.menuToggle.setAttribute('aria-expanded', String(open));
  });

  els.demoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(els.demoForm);
    const required = ['name', 'email', 'company', 'teamSize', 'need', 'message'];
    const valid = required.every((key) => String(data.get(key) || '').trim().length > 1) && /.+@.+\..+/.test(String(data.get('email') || ''));
    els.formMessage.textContent = valid ? 'Thanks. Your demo request has been received and the team will follow up shortly.' : 'Please complete all fields with a valid email.';
    if (valid) els.demoForm.reset();
  });

  function animateCanvas() {
    paintCanvas();
    const t = performance.now() / 1000;
    ctx.save();
    const pulse = 0.5 + Math.sin(t * 2.1) * 0.1;
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = `rgba(114,215,255,${0.06 + pulse * 0.08})`;
    ctx.beginPath(); ctx.arc(150 + state.canvasMode * 120, 120, 66 + pulse * 8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    requestAnimationFrame(animateCanvas);
  }

  function revealOnScroll() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.18 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  }

  function init() {
    renderHotspots();
    renderCards();
    revealOnScroll();
    requestAnimationFrame(animateCanvas);
    showToast('Library ready.');
    document.querySelectorAll('[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => els.navMenu.classList.remove('open'));
    });
    els.hotspots.addEventListener('mouseenter', () => {});
  }

  init();
})();

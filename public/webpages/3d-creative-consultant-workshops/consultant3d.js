(function () {
  'use strict';

  const workshops = [
    { title: 'Brand Strategy Sprint', duration: '90 min', outcome: 'Sharper positioning and messaging', audience: 'Founders and marketing leads', description: 'A fast clarity session to align brand territory, tone and next actions.' },
    { title: 'Creative Direction Workshop', duration: 'Half day', outcome: 'A visual and verbal north star', audience: 'Creative teams and studios', description: 'Define a shared aesthetic direction with references, moodboards and guardrails.' },
    { title: 'Innovation Ideation Session', duration: '2 hours', outcome: '40+ ideas and 3 priority bets', audience: 'Product and strategy teams', description: 'Facilitated ideation with convergence rules and opportunity clustering.' },
    { title: 'Customer Journey Mapping', duration: '3 hours', outcome: 'Journey map and friction audit', audience: 'CX and ops teams', description: 'Map the journey, identify moments of truth and plan improvements.' },
    { title: 'Product Positioning Lab', duration: 'Half day', outcome: 'Category story and proof points', audience: 'Startups and product marketers', description: 'Craft a positioning narrative that is concrete, differentiated and testable.' },
    { title: 'Content Strategy Workshop', duration: '2 hours', outcome: 'Pillars and publishing roadmap', audience: 'Content teams and founders', description: 'Turn scattered ideas into a cohesive content system with clear priorities.' },
    { title: 'Design Thinking Sprint', duration: 'Full day', outcome: 'Prototype concepts and validation plan', audience: 'Cross-functional teams', description: 'Move from challenge framing to prototype direction in one guided session.' },
    { title: 'Team Vision Alignment', duration: '90 min', outcome: 'Shared vision statement and commitments', audience: 'Leadership teams', description: 'A facilitated room to align language, ambition and execution priorities.' }
  ];

  const methods = [
    { step: '01', title: 'Discover', body: 'Understand the context, people and the actual problem before jumping to solutions.' },
    { step: '02', title: 'Frame', body: 'Define the right challenge, the scope and the decision lens for the workshop.' },
    { step: '03', title: 'Ideate', body: 'Generate relevant ideas and explore multiple creative directions with structure.' },
    { step: '04', title: 'Prioritize', body: 'Converge on the strongest opportunities using impact and feasibility.' },
    { step: '05', title: 'Prototype', body: 'Translate the selected ideas into a concept, page, journey or system.' },
    { step: '06', title: 'Roadmap', body: 'Package the work into a practical action plan that the team can execute.' }
  ];

  const studioAreas = [
    { title: 'Strategy Board', focus: 'strategy', body: 'A visible frame for the challenge, decision criteria and workshop outcomes.' },
    { title: 'Idea Wall', focus: 'ideas', body: 'A fast-moving surface for clustering notes, patterns and emerging opportunities.' },
    { title: 'Moodboard Station', focus: 'moodboard', body: 'Visual direction, references and texture cues for creative alignment.' },
    { title: 'Journey Mapping Table', focus: 'journey', body: 'Customer touchpoints, friction and moments of delight laid out in sequence.' },
    { title: 'Prototype Corner', focus: 'tools', body: 'A quick space for concept sketches, wireframes and rough validation.' },
    { title: 'Action Plan Desk', focus: 'agenda', body: 'The closing zone where ideas become commitments, owners and dates.' }
  ];

  const caseStudies = [
    { title: 'Repositioning a SaaS Brand', problem: 'The messaging felt generic and the sales team lacked a crisp story.', workshop: 'Brand Strategy Sprint', solution: 'Created a sharper category narrative and a stronger proof-point hierarchy.', result: 'Aligned on a new market-facing direction in one session.' },
    { title: 'Launching a New Product Category', problem: 'The product needed a clear entry point and a narrative that explained why now.', workshop: 'Product Positioning Lab', solution: 'Built a positioning map and priority launch themes.', result: 'Delivered a launch-ready story and roadmap.' },
    { title: 'Redesigning a Customer Journey', problem: 'The handoff between discovery and onboarding caused drop-off.', workshop: 'Customer Journey Mapping', solution: 'Mapped friction points and designed a better journey sequence.', result: 'Generated a focused improvement plan with measurable checkpoints.' },
    { title: 'Building a Creative Content System', problem: 'Content output was inconsistent and hard to scale.', workshop: 'Content Strategy Workshop', solution: 'Defined pillars, cadence and reusable campaign prompts.', result: 'Turned scattered ideas into a repeatable content machine.' }
  ];

  const outcomes = [
    'Clear brand direction',
    'Prioritized creative ideas',
    'Strategic messaging',
    'Customer journey map',
    'Visual concept board',
    '30-day action roadmap'
  ];

  const tools = [
    'Design Thinking', 'Brand Archetypes', 'Customer Journey Mapping', 'Jobs To Be Done', 'Content Pillars', 'Value Proposition Canvas', 'StoryBrand', 'Prioritization Matrix'
  ];

  const packages = [
    { title: 'Creative Clarity Session', price: '$1,500', duration: '90 min', deliverables: 'Core challenge framing, insight summary, immediate next steps.' },
    { title: 'Half-Day Strategy Workshop', price: '$4,800', duration: '4 hours', deliverables: 'Facilitated ideation, prioritization and action roadmap.' },
    { title: 'Full-Day Innovation Sprint', price: '$8,900', duration: 'Full day', deliverables: 'Deep facilitation, prototype direction and stakeholder alignment.' },
    { title: 'Monthly Creative Advisory', price: '$6,400', duration: 'Monthly', deliverables: 'Ongoing advisory, concept reviews and strategic support.' }
  ];

  const testimonials = [
    'The workshop turned a messy idea into a clear strategy.',
    'Our team left aligned, energized and ready to execute.',
    'The 3D creative studio experience made the process feel premium and focused.'
  ];

  const resources = [
    'Creative Brief Template',
    'Workshop Planning Checklist',
    'Brand Strategy Canvas',
    'Idea Prioritization Matrix'
  ];

  const els = {
    menuToggle: document.getElementById('menu-toggle'),
    siteNav: document.getElementById('site-nav'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalClose: document.getElementById('modal-close'),
    modalPrimary: document.getElementById('modal-primary'),
    modalSecondary: document.getElementById('modal-secondary'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalMeta: document.getElementById('modal-meta'),
    modalKicker: document.getElementById('modal-kicker'),
    toast: document.getElementById('toast'),
    bookingForm: document.getElementById('booking-form'),
    bookingFeedback: document.getElementById('booking-feedback'),
    contactForm: document.getElementById('contact-form'),
    contactFeedback: document.getElementById('contact-feedback'),
    workshopsGrid: document.getElementById('workshops-grid'),
    methodGrid: document.getElementById('method-grid'),
    studioGrid: document.getElementById('studio-grid'),
    casesGrid: document.getElementById('cases-grid'),
    outcomesGrid: document.getElementById('outcomes-grid'),
    toolsGrid: document.getElementById('tools-grid'),
    pricingGrid: document.getElementById('pricing-grid'),
    testimonialsGrid: document.getElementById('testimonials-grid'),
    resourcesGrid: document.getElementById('resources-grid'),
    workshopTypeSelect: document.querySelector('select[name="workshopType"]'),
    canvas: document.getElementById('studio-canvas')
  };

  let activePackage = packages[0].title;
  let currentFocus = 'strategy';
  let scene, camera, renderer, groups = {}, clock, rafId = null, baseY = 0;

  function populateSelect() {
    els.workshopTypeSelect.innerHTML = '<option value="">Select one</option>' + workshops.map(w => `<option>${w.title}</option>`).join('');
  }

  function cardTemplate(title, body, extra = '', actions = '') {
    return `<article class="card"><h3>${title}</h3><p>${body}</p>${extra}${actions}</article>`;
  }

  function renderContent() {
    els.workshopsGrid.innerHTML = workshops.map((w, i) => `
      <article class="card">
        <h3>${w.title}</h3>
        <p>${w.description}</p>
        <div class="tag-row">
          <span class="tag">${w.duration}</span>
          <span class="tag">${w.outcome}</span>
          <span class="tag">${w.audience}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary" data-modal="workshop" data-index="${i}">View Workshop</button>
        </div>
      </article>`).join('');

    els.methodGrid.innerHTML = methods.map((m, i) => `
      <article class="timeline-step" data-step="${i}">
        <div class="step-index">${m.step}</div>
        <h3>${m.title}</h3>
        <p>${m.body}</p>
      </article>`).join('');

    els.studioGrid.innerHTML = studioAreas.map((a, i) => `
      <article class="card studio-item" data-area="${i}">
        <h3>${a.title}</h3>
        <p>${a.body}</p>
        <a href="#home" class="action-link" data-focus-area="${a.focus}">Explore Area</a>
      </article>`).join('');

    els.casesGrid.innerHTML = caseStudies.map((c, i) => `
      <article class="card">
        <h3>${c.title}</h3>
        <p><strong>Problem:</strong> ${c.problem}</p>
        <p><strong>Workshop:</strong> ${c.workshop}</p>
        <p><strong>Solution:</strong> ${c.solution}</p>
        <p><strong>Result:</strong> ${c.result}</p>
        <div class="card-actions">
          <button class="btn btn-secondary" data-modal="case" data-index="${i}">View Case</button>
        </div>
      </article>`).join('');

    els.outcomesGrid.innerHTML = outcomes.map((o, i) => `
      <article class="outcome-card"><h3>${o}</h3><p>Delivered through a focused creative process and a clear action plan.</p></article>`).join('');

    els.toolsGrid.innerHTML = tools.map((t) => `
      <article class="card"><h3>${t}</h3><p>Used to structure the conversation, guide creative exploration and converge on useful decisions.</p></article>`).join('');

    els.pricingGrid.innerHTML = packages.map((p, i) => `
      <article class="card ${p.title === activePackage ? 'selected' : ''}">
        <h3>${p.title}</h3>
        <p class="price">${p.price}</p>
        <div class="tag-row"><span class="tag">${p.duration}</span><span class="tag">${p.deliverables}</span></div>
        <div class="card-actions">
          <button class="btn btn-primary" data-package="${p.title}">Choose Package</button>
        </div>
      </article>`).join('');

    els.testimonialsGrid.innerHTML = testimonials.map((t) => `<article class="card"><p>"${t}"</p></article>`).join('');
    els.resourcesGrid.innerHTML = resources.map((r) => `
      <article class="card">
        <h3>${r}</h3>
        <p>Download a practical document to use before, during or after the workshop.</p>
        <div class="card-actions">
          <button class="btn btn-secondary" data-resource="${r}">Download Resource</button>
        </div>
      </article>`).join('');
  }

  function showToast(message) {
    els.toast.textContent = message;
    gsap.killTweensOf(els.toast);
    gsap.to(els.toast, { opacity: 1, y: 0, duration: 0.25, onComplete: () => gsap.to(els.toast, { opacity: 0, y: 12, delay: 2.2, duration: 0.35 }) });
  }

  function openModal({ kicker, title, body, meta, primaryLabel, onPrimary }) {
    els.modalKicker.textContent = kicker;
    els.modalTitle.textContent = title;
    els.modalBody.textContent = body;
    els.modalMeta.innerHTML = meta.map(item => `<span>${item}</span>`).join('');
    els.modalPrimary.textContent = primaryLabel;
    els.modalBackdrop.classList.remove('hidden');
    els.modalBackdrop.dataset.primary = primaryLabel;
    els.modalBackdrop.dataset.title = title;
    els.modalBackdrop.dataset.body = body;
    els.modalBackdrop.dataset.meta = JSON.stringify(meta);
    els.modalBackdrop._handler = onPrimary;
  }

  function closeModal() {
    els.modalBackdrop.classList.add('hidden');
  }

  function bindInteractions() {
    document.addEventListener('click', (event) => {
      const modalBtn = event.target.closest('[data-modal]');
      const packageBtn = event.target.closest('[data-package]');
      const resourceBtn = event.target.closest('[data-resource]');
      const focusBtn = event.target.closest('[data-focus]');
      const focusArea = event.target.closest('[data-focus-area]');
      const chapterBtn = event.target.closest('.hud-pill');

      if (modalBtn) {
        const index = Number(modalBtn.dataset.index);
        if (modalBtn.dataset.modal === 'workshop') {
          const w = workshops[index];
          openModal({
            kicker: 'Workshop detail',
            title: w.title,
            body: `${w.description} Best for ${w.audience.toLowerCase()}.`,
            meta: [w.duration, w.outcome, w.audience],
            primaryLabel: 'Select this workshop',
            onPrimary: () => {
              els.workshopTypeSelect.value = w.title;
              document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
              showToast(`${w.title} selected for booking.`);
              closeModal();
            }
          });
        } else {
          const c = caseStudies[index];
          openModal({
            kicker: 'Case study',
            title: c.title,
            body: `${c.problem} ${c.solution} ${c.result}`,
            meta: [c.workshop, 'Fictional client', 'Premium engagement'],
            primaryLabel: 'Use this case',
            onPrimary: () => { showToast(`Case saved: ${c.title}`); closeModal(); }
          });
        }
      }

      if (packageBtn) {
        const pkg = packages.find(p => p.title === packageBtn.dataset.package);
        activePackage = pkg.title;
        renderContent();
        openModal({
          kicker: 'Package selected',
          title: pkg.title,
          body: `This package includes ${pkg.deliverables.toLowerCase()}.`,
          meta: [pkg.price, pkg.duration, 'Choose for booking'],
          primaryLabel: 'Book this package',
          onPrimary: () => {
            document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
            showToast(`${pkg.title} moved into booking.`);
            closeModal();
          }
        });
      }

      if (resourceBtn) {
        const resource = resourceBtn.dataset.resource;
        showToast(`${resource} download started.`);
        const blob = new Blob([`${resource}\n\nPremium workshop resource for 3D Creative Consultant Workshops.`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resource.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      if (focusBtn) {
        const focus = focusBtn.dataset.focus;
        focusStudio(focus);
      }

      if (focusArea) {
        focusStudio(focusArea.dataset.focusArea);
      }

      if (chapterBtn) {
        const focus = chapterBtn.dataset.focus;
        if (focus) focusStudio(focus);
      }

      if (event.target.matches('[data-action="enter-studio"]')) {
        focusStudio('strategy');
        showToast('Creative studio animation activated.');
      }

      if (event.target.matches('[data-action="book-workshop"]')) {
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
      }
    });

    els.modalClose.addEventListener('click', closeModal);
    els.modalSecondary.addEventListener('click', closeModal);
    els.modalBackdrop.addEventListener('click', (event) => {
      if (event.target === els.modalBackdrop) closeModal();
    });
    els.modalPrimary.addEventListener('click', () => {
      if (typeof els.modalBackdrop._handler === 'function') els.modalBackdrop._handler();
    });

    els.menuToggle.addEventListener('click', () => {
      const open = els.siteNav.classList.toggle('open');
      els.menuToggle.setAttribute('aria-expanded', String(open));
    });

    [els.bookingForm, els.contactForm].forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        const summary = [...data.entries()].map(([k, v]) => `${k}: ${v}`).join(' | ');
        const feedback = form === els.bookingForm ? els.bookingFeedback : els.contactFeedback;
        feedback.textContent = 'Sent successfully. ' + summary;
        showToast(form === els.bookingForm ? 'Booking request submitted.' : 'Consultant contact sent.');
        form.reset();
        if (form === els.bookingForm) els.workshopTypeSelect.value = '';
      });
    });
  }

  function initScene() {
    scene = new THREE.Scene();
    clock = new THREE.Clock();
    const w = els.canvas.clientWidth;
    const h = els.canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 1.6, 8);
    renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);

    const ambience = new THREE.AmbientLight(0xfff0df, 1.7);
    scene.add(ambience);
    const key = new THREE.DirectionalLight(0xffd0a0, 2.2);
    key.position.set(4, 6, 6);
    scene.add(key);
    const glow = new THREE.PointLight(0x7fe0d4, 1.8, 40);
    glow.position.set(-2, 3, 3);
    scene.add(glow);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x1a1f33, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.1;
    scene.add(floor);

    const wall = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 0.4), new THREE.MeshStandardMaterial({ color: 0x12172a, roughness: 1 }));
    wall.position.set(0, 2.6, -6.2);
    scene.add(wall);

    const table = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.32, 2.2), new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.55, metalness: 0.08 }));
    table.position.set(0, -0.1, 0);
    scene.add(table);

    const board = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.8, 0.12), new THREE.MeshStandardMaterial({ color: 0xf1f0e8, roughness: 0.8 }));
    board.position.set(0, 1.8, -4.4);
    scene.add(board);

    const mood = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.08), new THREE.MeshStandardMaterial({ color: 0x7fe0d4, roughness: 0.7, emissive: 0x224444, emissiveIntensity: 0.25 }));
    mood.position.set(3.2, 1.2, -3.8);
    scene.add(mood);

    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 1.8, 16), new THREE.MeshStandardMaterial({ color: 0xf2a65a }));
    lamp.position.set(-3.8, 2.6, -2.8);
    scene.add(lamp);

    const papers = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const note = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.02), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffdc93 : 0x90f0de }));
      note.position.set(-2.2 + i * 0.6, 0.55 + (i % 2) * 0.08, -1.1 + (i % 3) * 0.18);
      note.rotation.z = (i - 3) * 0.11;
      papers.add(note);
    }
    scene.add(papers);

    const laptop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.8), new THREE.MeshStandardMaterial({ color: 0x1d2338, metalness: 0.3, roughness: 0.4 }));
    laptop.position.set(1.5, 0.12, 0.18);
    scene.add(laptop);

    groups = { board, mood, lamp, papers, laptop, table };
    baseY = camera.position.y;
    window.addEventListener('resize', onResize);
    animate();
  }

  function focusStudio(target) {
    currentFocus = target;
    const targets = {
      strategy: { x: 0, y: 1.55, z: 7.3, lookX: 0, lookY: 1.7, lookZ: -3.9 },
      ideas: { x: -1.6, y: 1.45, z: 6.6, lookX: -1.2, lookY: 1.2, lookZ: -1.2 },
      moodboard: { x: 2.3, y: 1.6, z: 6.2, lookX: 2.7, lookY: 1.2, lookZ: -3.2 },
      agenda: { x: 0.7, y: 1.35, z: 5.2, lookX: 0.7, lookY: 0.7, lookZ: 0.1 },
      journey: { x: -1, y: 1.5, z: 6.4, lookX: -0.6, lookY: 0.95, lookZ: -2.2 },
      tools: { x: 1.3, y: 1.5, z: 6.9, lookX: 1.3, lookY: 0.9, lookZ: -0.2 }
    };
    const t = targets[target] || targets.strategy;
    gsap.to(camera.position, { x: t.x, y: t.y, z: t.z, duration: 1.2, ease: 'power3.out' });
    gsap.to(camera.rotation, { x: 0, y: 0, z: 0, duration: 0.8 });
    camera.lookAt(t.lookX, t.lookY, t.lookZ);
    showToast(`Focused on ${target}.`);
  }

  function onResize() {
    const w = els.canvas.clientWidth;
    const h = els.canvas.clientHeight;
    if (!renderer || !camera) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function animate() {
    const t = clock.getElapsedTime();
    if (groups.papers) groups.papers.children.forEach((note, i) => {
      note.position.y += Math.sin(t * 2 + i) * 0.0008;
      note.rotation.y = Math.sin(t + i) * 0.08;
    });
    if (groups.lamp) groups.lamp.rotation.y = Math.sin(t * 0.6) * 0.15;
    if (groups.mood) groups.mood.rotation.y = Math.sin(t * 0.4) * 0.08;
    camera.position.y = baseY + Math.sin(t * 0.8) * 0.05;
    camera.lookAt(0, 1.15, -2.5);
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  function init() {
    populateSelect();
    renderContent();
    bindInteractions();
    initScene();
    showToast('3D Creative Consultant Workshops is ready.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

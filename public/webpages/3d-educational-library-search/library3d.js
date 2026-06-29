(function () {
  'use strict';

  const resources = [
    { title: 'Introduction to Data Science', type: 'Books', category: 'Science', level: 'University', meta: '320 pages · MIT Press', description: 'A guided path into data thinking, analytics, and evidence-based decision making.', tags: ['data', 'science', 'books'] },
    { title: 'World History Visual Guide', type: 'Articles', category: 'History', level: 'High School', meta: '18 min read · Illustrated', description: 'Timeline-led exploration of major civilizations, movements, and turning points.', tags: ['history', 'articles', 'visual'] },
    { title: 'Algebra Practice Workbook', type: 'Worksheets', category: 'Mathematics', level: 'Middle School', meta: '84 exercises · PDF', description: 'Structured drills for equations, functions, and problem solving.', tags: ['math', 'worksheet', 'practice'] },
    { title: 'Creative Writing Essentials', type: 'Courses', category: 'Literature', level: 'All Levels', meta: '6 modules · Self-paced', description: 'Build voice, structure, and confidence with prompts, critiques, and examples.', tags: ['writing', 'course', 'creativity'] },
    { title: 'Physics Experiments for Students', type: 'Videos', category: 'Science', level: 'High School', meta: '12 videos · Lab demos', description: 'Short experiments that translate concepts into visible classroom demonstrations.', tags: ['physics', 'video', 'experiments'] },
    { title: 'English Grammar Toolkit', type: 'Study Guides', category: 'Languages', level: 'Grade Level', meta: 'Compact guide · ESL ready', description: 'Clear rules, examples, and revision templates for fluency and exam prep.', tags: ['grammar', 'guide', 'languages'] },
    { title: 'AI for Beginners', type: 'Books', category: 'Technology', level: 'University', meta: '240 pages · Intro level', description: 'A friendly primer on machine learning, models, and real-world applications.', tags: ['ai', 'technology', 'books'] },
    { title: 'Teacher Lesson Plan Library', type: 'Teachers', category: 'Personal Development', level: 'Teachers', meta: '120 templates · Shared packs', description: 'Ready-made lesson structures, rubrics, and collaborative planning assets.', tags: ['teachers', 'planning', 'resources'] }
  ];

  const categories = ['Science', 'Mathematics', 'History', 'Literature', 'Technology', 'Art', 'Languages', 'Business', 'Health', 'Engineering', 'Social Studies', 'Personal Development'];
  const studyGuides = ['Exam Preparation', 'Chapter Summaries', 'Practice Questions', 'Flashcards', 'Reading Notes', 'Research Templates'];
  const teacherResources = ['Lesson Plans', 'Classroom Activities', 'Worksheets', 'Assessment Rubrics', 'Presentation Slides', 'Student Reading Lists'];
  const pricing = [
    { name: 'Free Student Access', price: '$0', features: 'Basic search, saved list, and a limited library view.', resources: '120 resources', support: 'Community support' },
    { name: 'Student Plus', price: '$9', featured: true, features: 'Unlimited search, study guides, and personalized suggestions.', resources: '1,200 resources', support: 'Priority email support' },
    { name: 'Teacher Toolkit', price: '$19', features: 'Lesson packs, rubrics, reading lists, and classroom bundles.', resources: '2,000 resources', support: 'Teacher support chat' },
    { name: 'School Library Pro', price: '$49', features: 'Team access, analytics, and shared resource governance.', resources: 'Unlimited resources', support: 'Dedicated account help' }
  ];
  const stats = [
    { label: 'Resources Saved', value: 12, suffix: '' , progress: 88},
    { label: 'Courses Viewed', value: 6, suffix: '' , progress: 63},
    { label: 'Study Guides Opened', value: 4, suffix: '' , progress: 52},
    { label: 'Weekly Learning Goal', value: 80, suffix: '%', progress: 80},
    { label: 'Teacher Packs Created', value: 3, suffix: '' , progress: 41}
  ];

  const state = {
    filter: 'All',
    query: '',
    saved: new Set(['AI for Beginners', 'Teacher Lesson Plan Library']),
    currentPreview: resources[0],
    recommendationsSeed: 0,
  };

  const els = {
    header: document.querySelector('.site-header'),
    menuToggle: document.getElementById('menu-toggle'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    results: document.getElementById('search-results'),
    categoryGrid: document.getElementById('category-grid'),
    studyGuideGrid: document.getElementById('study-guide-grid'),
    teacherGrid: document.getElementById('teacher-grid'),
    recommendationRail: document.getElementById('recommendation-rail'),
    statsGrid: document.getElementById('stats-grid'),
    pricingGrid: document.getElementById('pricing-grid'),
    preview: document.getElementById('reading-preview'),
    refreshRecommendations: document.getElementById('refresh-recommendations'),
    buildPackBtn: document.getElementById('build-pack-btn'),
    modal: document.getElementById('resource-modal'),
    modalClose: document.getElementById('modal-close'),
    modalContent: document.getElementById('modal-content'),
    canvas: document.getElementById('library-canvas'),
  };

  let scene, camera, renderer, group, shelves = [], books = [], rafId = null, clock = new THREE.Clock();

  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x08111f, 8, 28);
    camera = new THREE.PerspectiveCamera(42, els.canvas.clientWidth / els.canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 2.8, 10.5);
    renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(els.canvas.clientWidth, els.canvas.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const amb = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(amb);
    const sun = new THREE.DirectionalLight(0xfff1d8, 2.2);
    sun.position.set(-2, 8, 8);
    scene.add(sun);
    const cyan = new THREE.PointLight(0x8cb5ff, 1.8, 30);
    cyan.position.set(4, 2, 6);
    scene.add(cyan);
    const green = new THREE.PointLight(0x93f5c7, 1.6, 24);
    green.position.set(-4, 2, 2);
    scene.add(green);

    group = new THREE.Group();
    scene.add(group);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x102033, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.9;
    scene.add(floor);

    const wall = new THREE.Mesh(new THREE.BoxGeometry(28, 12, 0.5), new THREE.MeshStandardMaterial({ color: 0x0d1c31, roughness: 1 }));
    wall.position.set(0, 4.5, -8);
    scene.add(wall);

    const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x213552, roughness: 0.8 });
    for (let row = 0; row < 4; row++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(12, 0.12, 0.3), shelfMaterial);
      shelf.position.set(0, -0.2 + row * 1.8, -2.2);
      shelves.push(shelf);
      group.add(shelf);
      for (let i = 0; i < 10; i++) {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 1.1, 0.18),
          new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL((row * 10 + i) / 40, 0.55, 0.56), roughness: 0.55 })
        );
        book.position.set(-5.3 + i * 1.1, 0.65 + row * 1.8, -2.0);
        book.rotation.y = 0.08 * Math.sin(i);
        books.push(book);
        group.add(book);
      }
    }

    const desk = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.45, 2.2), new THREE.MeshStandardMaterial({ color: 0x6c5338, roughness: 0.7 }));
    desk.position.set(0, -0.1, 1.8);
    group.add(desk);

    const screen = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 0.12), new THREE.MeshStandardMaterial({ color: 0x0a2236, emissive: 0x163d5f, emissiveIntensity: 0.7 }));
    screen.position.set(0, 2.0, 1.4);
    group.add(screen);

    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 32), new THREE.MeshStandardMaterial({ color: 0x93f5c7, emissive: 0x93f5c7, emissiveIntensity: 0.8 }));
    orb.position.set(-2.8, 2.4, 2.4);
    group.add(orb);

    const spotlight = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.6, 2.2, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2bf73, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    spotlight.position.set(2.8, 2.6, 2.2);
    spotlight.rotation.x = Math.PI;
    group.add(spotlight);
  }

  function animate() {
    const t = clock.getElapsedTime();
    books.forEach((book, index) => {
      book.position.y += Math.sin(t * 1.1 + index) * 0.0015;
      book.rotation.z = Math.sin(t * 0.8 + index) * 0.02;
    });
    group.rotation.y = Math.sin(t * 0.12) * 0.08;
    camera.position.x = Math.sin(t * 0.08) * 0.15;
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  function openModal(html) {
    els.modalContent.innerHTML = html;
    els.modal.classList.remove('hidden');
  }
  function closeModal() { els.modal.classList.add('hidden'); }

  function resourceCard(item) {
    const saved = state.saved.has(item.title);
    return `
      <article class="card">
        <p class="meta-tag">${item.type}</p>
        <h3>${item.title}</h3>
        <div class="meta-row">
          <span class="meta-tag">${item.category}</span>
          <span class="meta-tag">${item.level}</span>
          <span class="meta-tag">${item.meta}</span>
        </div>
        <p>${item.description}</p>
        <div class="button-row">
          <button class="button secondary" data-view="${item.title}">View Resource</button>
          <button class="button ghost" data-save="${item.title}">${saved ? 'Saved' : 'Save'}</button>
        </div>
      </article>`;
  }

  function renderSearchResults() {
    const query = state.query.toLowerCase();
    const filtered = resources.filter((item) => {
      const matchFilter = state.filter === 'All' || item.type === state.filter;
      const text = `${item.title} ${item.description} ${item.category} ${item.level} ${item.tags.join(' ')}`.toLowerCase();
      const matchQuery = !query || text.includes(query);
      return matchFilter && matchQuery;
    });
    els.results.innerHTML = filtered.length ? filtered.map(resourceCard).join('') : `<div class="card"><h3>No results yet</h3><p>Try a different keyword or choose another filter.</p></div>`;
  }

  function renderCategoryGrid() {
    els.categoryGrid.innerHTML = categories.map((name) => `
      <article class="card">
        <p class="meta-tag">Category</p>
        <h3>${name}</h3>
        <p>Curated academic resources, books, and guided paths for ${name.toLowerCase()} learners.</p>
        <div class="meta-row">
          <span class="meta-tag">${Math.floor(80 + Math.random() * 140)} resources</span>
        </div>
        <button class="button secondary" data-category="${name}">Open Category</button>
      </article>
    `).join('');
  }

  function renderStudyGuides() {
    els.studyGuideGrid.innerHTML = studyGuides.map((title) => `
      <article class="card">
        <h3>${title}</h3>
        <p>Practical structure for revision, note taking, and test readiness.</p>
        <button class="button secondary" data-guide="${title}">Open Guide</button>
      </article>
    `).join('');
  }

  function renderTeacherResources() {
    els.teacherGrid.innerHTML = teacherResources.map((title) => `
      <article class="card">
        <h3>${title}</h3>
        <p>Built for lesson planning, classroom workflow, and student support.</p>
        <button class="button secondary" data-teacher="${title}">View Teacher Resource</button>
      </article>
    `).join('');
  }

  function renderRecommendations() {
    const shuffled = resources
      .slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    const blocks = ['Recommended for Students', 'Recommended for Teachers', 'Trending This Week', 'Continue Learning', 'New Resources'];
    els.recommendationRail.innerHTML = blocks.map((title, idx) => `
      <article class="recommendation-card">
        <h3>${title}</h3>
        <p>${shuffled[idx].title}</p>
        <div class="meta-row">
          <span class="meta-tag">${shuffled[idx].type}</span>
          <span class="meta-tag">${shuffled[idx].category}</span>
        </div>
        <button class="button secondary" data-view="${shuffled[idx].title}">View Resource</button>
      </article>
    `).join('');
  }

  function renderStats() {
    els.statsGrid.innerHTML = stats.map((stat) => `
      <article class="stat-card">
        <h3>${stat.label}</h3>
        <div class="metric-value" data-count="${stat.value}" data-suffix="${stat.suffix}">0${stat.suffix}</div>
        <div class="progress"><span style="width:${stat.progress}%"></span></div>
      </article>
    `).join('');
    animateCounters();
  }

  function renderPricing() {
    els.pricingGrid.innerHTML = pricing.map((plan) => `
      <article class="pricing-card ${plan.featured ? 'featured' : ''}">
        <p class="meta-tag">${plan.featured ? 'Most Popular' : 'Access Plan'}</p>
        <h3>${plan.name}</h3>
        <div class="price">${plan.price}</div>
        <p>${plan.features}</p>
        <div class="meta-row">
          <span class="meta-tag">${plan.resources}</span>
          <span class="meta-tag">${plan.support}</span>
        </div>
        <button class="button primary" data-plan="${plan.name}">Choose Plan</button>
      </article>
    `).join('');
  }

  function renderPreview(item = state.currentPreview) {
    els.preview.innerHTML = `
      <div class="preview-title">${item.title}</div>
      <p>${item.description}</p>
      <div class="meta-row">
        <span class="meta-tag">${item.type}</span>
        <span class="meta-tag">${item.level}</span>
        <span class="meta-tag">${item.meta}</span>
      </div>
      <div class="preview-list">
        <div><strong>Summary</strong><span>High-level overview</span></div>
        <div><strong>Index</strong><span>${item.category}</span></div>
        <div><strong>Time</strong><span>${item.type === 'Videos' ? '12 min' : '5 min preview'}</span></div>
      </div>
      <div class="button-row">
        <button class="button primary" data-start-reading="${item.title}">Start Reading</button>
        <button class="button secondary" data-add-list="${item.title}">Add to List</button>
        <button class="button ghost" data-share="${item.title}">Share Resource</button>
      </div>`;
  }

  function animateCounters() {
    document.querySelectorAll('.metric-value').forEach((node) => {
      const target = Number(node.dataset.count || 0);
      const suffix = node.dataset.suffix || '';
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 30));
      const tick = () => {
        current = Math.min(target, current + step);
        node.textContent = `${current}${suffix}`;
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
    });
  }

  function handleAction(name, label) {
    openModal(`<h2>${label}</h2><p>This simulated action is ready for the premium library flow.</p>`);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view],[data-save],[data-category],[data-guide],[data-teacher],[data-plan],[data-start-reading],[data-add-list],[data-share]');
    if (!btn) return;
    const title = btn.dataset.view || btn.dataset.category || btn.dataset.guide || btn.dataset.teacher || btn.dataset.plan || btn.dataset.startReading || btn.dataset.addList || btn.dataset.share;
    if (btn.dataset.view) {
      const item = resources.find((r) => r.title === btn.dataset.view);
      state.currentPreview = item || state.currentPreview;
      renderPreview();
      openModal(`<h2>${item.title}</h2><p>${item.description}</p><p><strong>Type:</strong> ${item.type} | <strong>Level:</strong> ${item.level}</p>`);
      return;
    }
    if (btn.dataset.save) {
      if (state.saved.has(btn.dataset.save)) state.saved.delete(btn.dataset.save); else state.saved.add(btn.dataset.save);
      renderSearchResults();
      renderPreview();
      return;
    }
    if (btn.dataset.category) {
      state.filter = 'All';
      state.query = btn.dataset.category;
      els.searchInput.value = btn.dataset.category;
      renderSearchResults();
      renderPreview(resources.find((r) => r.category === btn.dataset.category) || state.currentPreview);
      return;
    }
    if (btn.dataset.guide) {
      openModal(`<h2>${btn.dataset.guide}</h2><p>A guided study flow with checkpoints, examples, and quick review prompts.</p>`);
      return;
    }
    if (btn.dataset.teacher) {
      openModal(`<h2>${btn.dataset.teacher}</h2><p>Teacher-ready materials with classroom-first structure and flexible delivery.</p>`);
      return;
    }
    if (btn.dataset.plan) {
      openModal(`<h2>${btn.dataset.plan}</h2><p>Plan selected. Continue from Contact to complete the access request.</p>`);
      return;
    }
    if (btn.dataset.startReading) {
      openModal(`<h2>Start Reading</h2><p>${btn.dataset.startReading} is now open in a simulated preview reader.</p>`);
      return;
    }
    if (btn.dataset.addList) {
      openModal(`<h2>Added to List</h2><p>${btn.dataset.addList} has been saved to your reading list.</p>`);
      return;
    }
    if (btn.dataset.share) {
      openModal(`<h2>Share Resource</h2><p>A shareable link has been prepared for ${btn.dataset.share}.</p>`);
    }
  });

  els.searchBtn.addEventListener('click', () => {
    state.query = els.searchInput.value.trim();
    if (!state.query) {
      openModal('<h2>Search library</h2><p>Please enter a topic, author, course, or guide to see results.</p>');
      return;
    }
    renderSearchResults();
  });
  els.clearSearchBtn.addEventListener('click', () => {
    state.query = '';
    els.searchInput.value = '';
    renderSearchResults();
  });
  els.searchInput.addEventListener('input', () => {
    state.query = els.searchInput.value.trim();
  });
  els.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') els.searchBtn.click();
  });

  document.querySelectorAll('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      state.filter = chip.dataset.filter;
      renderSearchResults();
    });
  });

  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => document.querySelector(btn.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  });

  document.querySelectorAll('[data-action="enter-library"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: document.getElementById('search').offsetTop - 80, behavior: 'smooth' });
      camera.position.set(0, 2.2, 7.2);
      group.rotation.y += 0.3;
    });
  });

  els.refreshRecommendations.addEventListener('click', () => {
    state.recommendationsSeed += 1;
    renderRecommendations();
  });

  els.buildPackBtn.addEventListener('click', () => {
    openModal('<h2>Class Resource Pack</h2><p>Your simulated pack includes lesson plans, activities, worksheets, and reading lists curated for a classroom unit.</p>');
  });

  els.menuToggle.addEventListener('click', () => {
    const open = els.header.classList.toggle('nav-open');
    els.menuToggle.setAttribute('aria-expanded', String(open));
  });

  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) closeModal();
  });
  els.modalClose.addEventListener('click', closeModal);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.16 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  function onResize() {
    if (!renderer || !camera) return;
    const w = els.canvas.clientWidth;
    const h = els.canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', onResize);

  function init() {
    initThree();
    renderSearchResults();
    renderCategoryGrid();
    renderStudyGuides();
    renderTeacherResources();
    renderRecommendations();
    renderStats();
    renderPricing();
    renderPreview();
    animate();
    onResize();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

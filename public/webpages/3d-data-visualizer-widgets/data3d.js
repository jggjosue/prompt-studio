(function () {
  'use strict';

  const WIDGETS = [
    ['KPI Card', 'Fast glance metric with delta and trend.', 'Finance'],
    ['Revenue Bar Chart', 'Compare performance across periods.', 'Sales'],
    ['Trend Line', 'Track momentum and anomalies.', 'Forecast'],
    ['Forecast Panel', 'Project future outcomes with confidence bands.', 'Planning'],
    ['Heatmap', 'Spot intensity and behavior clusters.', 'Ops'],
    ['Donut Chart', 'Show share composition at a glance.', 'Marketing'],
    ['Smart Alert', 'Surface changes that need action.', 'Risk'],
    ['Data Table', 'Inspect rows, segments, and outliers.', 'Admin'],
    ['Comparison Grid', 'Benchmark multiple entities in one view.', 'Leadership'],
    ['Progress Tracker', 'Monitor rollout and completion states.', 'Product'],
    ['Geo Map', 'See distribution by region and territory.', 'Global'],
    ['Funnel Chart', 'Measure conversion drop-off.', 'Growth']
  ];

  const ANALYTICS = ['Sales Analytics', 'Finance Performance', 'Operations Monitoring', 'Marketing Funnel', 'Customer Segments', 'Product Usage', 'Team Productivity', 'Executive Overview'];
  const METRICS = ['1.8M Data Points Processed', '98.7% Dashboard Uptime', '42 Active Widgets', '12 Live Data Sources', '87% Faster Reporting', '3.4x Better Insight Discovery'];
  const ALERTS = ['Revenue spike detected.', 'Conversion rate dropped 8%.', 'Inventory risk increasing.', 'Campaign performance exceeded forecast.', 'Customer churn risk detected.'];
  const TEMPLATES = ['Executive KPI Dashboard.', 'Sales Performance Dashboard.', 'Marketing Analytics Dashboard.', 'Finance Overview.', 'Operations Command Center.', 'Product Usage Dashboard.', 'HR Performance Dashboard.', 'Startup Metrics Dashboard.'];
  const INTEGRATIONS = ['CRM', 'ERP', 'Finance Tools', 'Spreadsheets', 'Data Warehouse', 'Analytics APIs', 'Marketing Platforms', 'HR Systems', 'Product Analytics'];
  const SECURITY = ['Encrypted Data', 'Role-Based Access', 'Audit Logs', 'Secure API Keys', 'Data Refresh Controls', 'Permission-Based Dashboards'];
  const PRICING = [
    ['Widget Starter', '$29', '12 widgets'],
    ['Dashboard Pro', '$79', '42 widgets'],
    ['Analytics Team', '$149', '120 widgets'],
    ['Enterprise Visualizer', '$349', 'Unlimited widgets']
  ];

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    canvas: document.getElementById('data-canvas'),
    hotspotPanel: document.getElementById('hotspot-panel'),
    inspectorList: document.getElementById('inspector-list'),
    widgetGrid: document.getElementById('widget-grid'),
    dashboardCanvas: document.getElementById('dashboard-canvas'),
    analyticsGrid: document.getElementById('analytics-grid'),
    metricsGrid: document.getElementById('metrics-grid'),
    alertsGrid: document.getElementById('alerts-grid'),
    templateGrid: document.getElementById('template-grid'),
    integrationCloud: document.getElementById('integration-cloud'),
    customControls: document.getElementById('custom-controls'),
    customPreview: document.getElementById('custom-preview'),
    securityGrid: document.getElementById('security-grid'),
    pricingGrid: document.getElementById('pricing-grid'),
    testimonialGrid: document.getElementById('testimonial-grid'),
    contactCopy: document.getElementById('contact-copy'),
    contactDetails: document.getElementById('contact-details'),
    demoForm: document.getElementById('demo-form'),
    formStatus: document.getElementById('form-status'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalClose: document.getElementById('modal-close'),
    toast: document.getElementById('toast'),
    menuToggle: document.getElementById('menu-toggle'),
    siteNav: document.getElementById('site-nav'),
    applyCustomizationBtn: document.getElementById('apply-customization-btn'),
    viewSecurityBtn: document.getElementById('view-security-btn'),
    addWidgetBtn: document.getElementById('add-widget-btn'),
    saveDashboardBtn: document.getElementById('save-dashboard-btn'),
    resetLayoutBtn: document.getElementById('reset-layout-btn')
  };

  const state = {
    highlight: 0,
    launchMode: 0,
    dashboardWidgets: [],
    selectedPlan: null,
    selectedTemplate: null,
    alertStates: new Set(),
    customization: { theme: 68, density: 42, range: 74 },
    cameraTarget: { x: 0, y: 0, z: 8 }
  };

  let scene, camera, renderer, clock, rootGroup, widgetsGroup, routeGroup, raycaster, pointer;
  const hotspotItems = [];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = sections.indexOf(entry.target.id);
        if (index >= 0) setStoryState(index);
      }
    });
  }, { threshold: 0.4 });

  const sections = ['home', 'visualizer', 'widgets', 'dashboard', 'analytics', 'templates', 'integrations', 'pricing', 'contact'];

  function setStoryState(index) {
    state.highlight = index;
    state.cameraTarget = [
      { x: 0, y: 0.3, z: 9 },
      { x: -1.2, y: .5, z: 7.1 },
      { x: 1.2, y: .35, z: 6.5 },
      { x: 0.4, y: -.1, z: 5.5 },
      { x: -0.9, y: .4, z: 6.2 },
      { x: 1.3, y: .2, z: 6.8 },
      { x: 0, y: -.2, z: 7.5 },
      { x: -1, y: .1, z: 6.6 },
      { x: 0, y: 0, z: 8 }
    ][index] || { x: 0, y: 0, z: 8 };
  }

  function toast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => dom.toast.classList.remove('show'), 2400);
  }

  function openModal(title, body) {
    dom.modalTitle.textContent = title;
    dom.modalBody.innerHTML = body;
    dom.modal.classList.remove('hidden');
  }

  function renderButton(label, onClick) {
    const btn = document.createElement('button');
    btn.className = 'cta cta-secondary';
    btn.type = 'button';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function initDom() {
    dom.contactCopy.textContent = 'Email: hello@3dwidgets.io  |  Phone: +1 (555) 014-2034  |  Office: Austin, Texas';
    dom.contactDetails.innerHTML = '<span class="detail-pill">LinkedIn</span><span class="detail-pill">X / Twitter</span><span class="detail-pill">YouTube</span>';

    WIDGETS.forEach(([title, desc, use], idx) => {
      const card = document.createElement('article');
      card.className = 'widget-card glass';
      card.innerHTML = `<h3>${title}</h3><p class="muted">${desc}</p><div class="card-meta"><span class="pill">${use}</span><span class="status">Live</span></div><div class="widget-preview"></div>`;
      card.appendChild(renderButton('Preview Widget', () => highlightWidget(idx, title, desc)));
      dom.widgetGrid.appendChild(card);
      const hotspot = document.createElement('button');
      hotspot.className = 'hotspot';
      hotspot.textContent = title;
      hotspot.addEventListener('click', () => highlightWidget(idx, title, desc));
      dom.hotspotPanel.appendChild(hotspot);
      hotspotItems.push(hotspot);
    });

    ['KPI Cards', 'Bar Chart Widget', 'Trend Lines', 'Heatmap', 'Forecast Panel', 'Smart Alerts', 'Data Table', 'Build Dashboard'].forEach((item, idx) => {
      const pill = document.createElement('div');
      pill.className = 'inspector-item';
      pill.textContent = `${idx + 1}. ${item}`;
      dom.inspectorList.appendChild(pill);
    });

    ANALYTICS.forEach((title) => {
      const card = document.createElement('article');
      card.className = 'analytics-card glass';
      card.innerHTML = `<h3>${title}</h3><p class="muted">Interactive insight suite with trend, segmentation, and operational controls.</p><div class="widget-preview"></div>`;
      card.appendChild(renderButton('Analyze Data', () => openModal(title, `<p>Insight: ${title} is above target.</p><p>Recommendation: prioritize the highest-friction segment and automate follow-up.</p><p>Next action: export the plan to the team dashboard.</p>`)));
      dom.analyticsGrid.appendChild(card);
    });

    METRICS.forEach((label, idx) => {
      const card = document.createElement('article');
      card.className = 'security-card glass';
      card.innerHTML = `<h3>${label}</h3><div class="mini-row"><span class="pill">Metric ${idx + 1}</span></div><div class="widget-preview"></div>`;
      dom.metricsGrid.appendChild(card);
      animateNumber(card, idx);
    });

    ALERTS.forEach((label, idx) => {
      const card = document.createElement('article');
      card.className = 'alert-card glass';
      card.innerHTML = `<h3>${label}</h3><p class="muted">Severity ${(idx % 3) + 1} · Suggested review for dashboard owners.</p><div class="widget-preview"></div>`;
      card.appendChild(renderButton('Review Alert', () => {
        dom.alertsGrid.children[idx].classList.toggle('reviewed');
        toast(`Alert reviewed: ${label}`);
      }));
      dom.alertsGrid.appendChild(card);
    });

    TEMPLATES.forEach((label, idx) => {
      const card = document.createElement('article');
      card.className = 'template-card glass';
      card.innerHTML = `<h3>${label}</h3><p class="muted">Ready-made structure for fast deployment.</p><div class="widget-preview"></div>`;
      card.appendChild(renderButton('Use Template', () => {
        state.selectedTemplate = label;
        toast(`Template selected: ${label}`);
        pushDashboardBadge(label);
      }));
      dom.templateGrid.appendChild(card);
    });

    INTEGRATIONS.forEach((label, idx) => {
      const node = document.createElement('div');
      node.className = 'node';
      node.textContent = label;
      node.addEventListener('click', () => {
        node.classList.toggle('connected');
        toast(`${label} ${node.classList.contains('connected') ? 'connected' : 'disconnected'}`);
      });
      dom.integrationCloud.appendChild(node);
    });

    ['Theme', 'Chart Type', 'Data Range', 'Widget Size', 'Layout Density', 'Color Rules', 'Alert Thresholds', 'Export Format'].forEach((label, idx) => {
      const item = document.createElement('div');
      item.className = 'control-item';
      item.innerHTML = `<label>${label}</label>`;
      if (idx < 3) {
        const input = document.createElement('input');
        input.type = 'range';
        input.min = '0';
        input.max = '100';
        input.value = state.customization[label === 'Theme' ? 'theme' : label === 'Layout Density' ? 'density' : 'range'];
        input.addEventListener('input', () => {
          state.customization[label === 'Theme' ? 'theme' : label === 'Layout Density' ? 'density' : 'range'] = Number(input.value);
          updateCustomizationPreview();
        });
        item.appendChild(input);
      } else {
        const select = document.createElement('select');
        select.className = 'custom-input';
        select.innerHTML = '<option>Balanced</option><option>Dense</option><option>Enterprise</option>';
        select.addEventListener('change', updateCustomizationPreview);
        item.appendChild(select);
      }
      dom.customControls.appendChild(item);
    });

    SECURITY.forEach((label) => {
      const card = document.createElement('article');
      card.className = 'security-card glass';
      card.innerHTML = `<h3>${label}</h3><p class="muted">Enterprise trust layer for sensitive data workflows.</p>`;
      dom.securityGrid.appendChild(card);
    });

    PRICING.forEach(([title, price, widgets]) => {
      const card = document.createElement('article');
      card.className = 'pricing-card glass';
      card.innerHTML = `<h3>${title}</h3><div class="price">${price}</div><p class="muted">${widgets}, data sources, users, and support included.</p>`;
      card.appendChild(renderButton('Choose Plan', () => {
        state.selectedPlan = title;
        toast(`Plan selected: ${title}`);
        location.hash = '#contact';
      }));
      dom.pricingGrid.appendChild(card);
    });

    [
      'We replaced static reports with interactive visual stories.',
      'The widget library helped our team build dashboards in minutes.',
      'Our executives finally understand metrics at a glance.'
    ].forEach((quote) => {
      const card = document.createElement('article');
      card.className = 'testimonial-card glass';
      card.innerHTML = `<h3>Enterprise Lead</h3><p>“${quote}”</p>`;
      dom.testimonialGrid.appendChild(card);
    });

    updateCustomizationPreview();
    renderDashboard();
  }

  function animateNumber(container, idx) {
    const target = [1800000, 98.7, 42, 12, 87, 3.4][idx];
    const value = document.createElement('strong');
    value.style.display = 'block';
    value.style.fontSize = '1.9rem';
    value.textContent = idx === 1 ? '98.7%' : idx === 5 ? '3.4x' : '0';
    container.prepend(value);
    const start = { n: 0 };
    gsap.to(start, {
      n: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        if (idx === 1) value.textContent = `${start.n.toFixed(1)}%`;
        else if (idx === 5) value.textContent = `${start.n.toFixed(1)}x`;
        else value.textContent = Math.round(start.n).toLocaleString();
      }
    });
  }

  function highlightWidget(idx, title, desc) {
    state.launchMode = idx + 1;
    openModal(title, `<p>${desc}</p><p>Hotspot activated. The canvas camera will emphasize this module and the preview state will update accordingly.</p>`);
    toast(`Preview widget: ${title}`);
  }

  function pushDashboardBadge(label) {
    const badge = document.createElement('div');
    badge.className = 'dash-widget';
    badge.style.left = `${20 + Math.random() * 55}%`;
    badge.style.top = `${18 + Math.random() * 48}%`;
    badge.innerHTML = `<strong>${label}</strong><span class="muted">Template applied</span>`;
    dom.dashboardCanvas.appendChild(badge);
  }

  function renderDashboard() {
    dom.dashboardCanvas.innerHTML = '';
    state.dashboardWidgets = [
      ['KPI', 'Revenue', 14, 12],
      ['Trend', 'Growth', 58, 18],
      ['Alerts', 'Risk', 26, 56]
    ];
    state.dashboardWidgets.forEach(([title, label, left, top]) => {
      const item = document.createElement('div');
      item.className = 'dash-widget';
      item.style.left = `${left}%`;
      item.style.top = `${top}%`;
      item.innerHTML = `<strong>${title}</strong><span class="muted">${label}</span>`;
      dom.dashboardCanvas.appendChild(item);
    });
  }

  function updateCustomizationPreview() {
    const t = state.customization.theme / 100;
    const d = state.customization.density / 100;
    const r = state.customization.range / 100;
    dom.customPreview.innerHTML = '';
    const orb1 = document.createElement('div');
    orb1.className = 'preview-orb';
    orb1.style.width = `${160 + t * 120}px`;
    orb1.style.height = `${160 + r * 60}px`;
    orb1.style.left = `${18 + d * 24}%`;
    orb1.style.top = `${12 + t * 24}%`;
    const orb2 = document.createElement('div');
    orb2.className = 'preview-orb';
    orb2.style.width = `${100 + d * 110}px`;
    orb2.style.height = `${100 + t * 70}px`;
    orb2.style.right = `${14 + r * 18}%`;
    orb2.style.bottom = `${12 + d * 18}%`;
    dom.customPreview.append(orb1, orb2);
  }

  function openSecurityPanel() {
    openModal('Security & Reliability', '<p>Encrypted data, role-based access, audit logs, secure API keys, refresh controls, and permission-based dashboards keep the experience enterprise-ready.</p>');
  }

  function setupThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);
    renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const ambient = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0x9fe8ff, 1.4);
    key.position.set(3, 4, 6);
    scene.add(key);
    const fill = new THREE.PointLight(0x8b8cff, 1.6, 20);
    fill.position.set(-3, 0, 5);
    scene.add(fill);

    rootGroup = new THREE.Group();
    widgetsGroup = new THREE.Group();
    routeGroup = new THREE.Group();
    rootGroup.add(widgetsGroup, routeGroup);
    scene.add(rootGroup);

    const grid = new THREE.GridHelper(30, 40, 0x2f5f8e, 0x183455);
    grid.position.y = -3.2;
    scene.add(grid);

    const cardMat = new THREE.MeshStandardMaterial({ color: 0xb8eaff, emissive: 0x0c1626, transparent: true, opacity: 0.85, roughness: 0.25, metalness: 0.2 });
    const floaters = [];
    for (let i = 0; i < 18; i++) {
      const geo = new THREE.BoxGeometry(0.5 + Math.random() * 0.7, 0.2 + Math.random() * 0.5, 0.08 + Math.random() * 0.1);
      const mesh = new THREE.Mesh(geo, cardMat.clone());
      mesh.position.set((Math.random() - .5) * 8, (Math.random() - .5) * 4, (Math.random() - .5) * 4 - 1);
      mesh.userData.base = mesh.position.clone();
      floaters.push(mesh);
      widgetsGroup.add(mesh);
    }
    widgetsGroup.userData.floaters = floaters;
  }

  function launchVisualizer() {
    state.launchMode = 1;
    gsap.to(camera.position, { x: 0.2, y: 0.2, z: 4.5, duration: 1.2, ease: 'power3.out' });
    toast('Visualizer launched');
  }

  function bindEvents() {
    document.querySelectorAll('[data-scroll]').forEach((btn) => {
      btn.addEventListener('click', () => document.querySelector(btn.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    });
    document.querySelectorAll('[data-action="launch-visualizer"]').forEach((btn) => btn.addEventListener('click', launchVisualizer));
    dom.menuToggle.addEventListener('click', () => {
      const open = dom.siteNav.classList.toggle('open');
      dom.menuToggle.setAttribute('aria-expanded', String(open));
    });
    dom.modalClose.addEventListener('click', () => dom.modal.classList.add('hidden'));
    dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); });
    dom.applyCustomizationBtn.addEventListener('click', () => {
      document.documentElement.style.setProperty('--accent', state.customization.theme > 50 ? '#6ee7ff' : '#43f3b2');
      toast('Customization applied');
    });
    dom.viewSecurityBtn.addEventListener('click', openSecurityPanel);
    dom.addWidgetBtn.addEventListener('click', () => {
      const count = dom.dashboardCanvas.children.length + 1;
      const item = document.createElement('div');
      item.className = 'dash-widget';
      item.style.left = `${10 + (count * 13) % 70}%`;
      item.style.top = `${20 + (count * 17) % 50}%`;
      item.innerHTML = `<strong>Widget ${count}</strong><span class="muted">Simulated add</span>`;
      dom.dashboardCanvas.appendChild(item);
      toast('Widget added');
    });
    dom.saveDashboardBtn.addEventListener('click', () => toast('Dashboard saved successfully'));
    dom.resetLayoutBtn.addEventListener('click', () => { renderDashboard(); toast('Layout restored'); });
    dom.demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData(dom.demoForm);
      const required = ['name', 'email', 'company', 'role', 'need', 'message'];
      const ok = required.every((k) => String(form.get(k) || '').trim().length > 0);
      if (!ok) {
        dom.formStatus.textContent = 'Please complete all fields.';
        return;
      }
      dom.formStatus.textContent = 'Thanks. Your demo request has been submitted.';
      toast('Demo request sent');
      dom.demoForm.reset();
    });
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onScroll() {
    const y = window.scrollY;
    rootGroup.rotation.y = y * 0.00012;
    rootGroup.rotation.x = -0.05 + y * 0.00002;
  }

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (widgetsGroup?.userData.floaters) {
      widgetsGroup.userData.floaters.forEach((mesh, idx) => {
        mesh.position.y = mesh.userData.base.y + Math.sin(t * 0.7 + idx) * 0.18;
        mesh.rotation.x = Math.sin(t * 0.2 + idx) * 0.12;
        mesh.rotation.y = Math.cos(t * 0.25 + idx) * 0.12;
      });
    }
    camera.position.x += (state.cameraTarget.x - camera.position.x) * 0.03;
    camera.position.y += (state.cameraTarget.y - camera.position.y) * 0.03;
    camera.position.z += (state.cameraTarget.z - camera.position.z) * 0.03;
    camera.lookAt(0, 0, 0);
    if (state.launchMode) {
      rootGroup.rotation.y = Math.sin(t * 0.25) * 0.15;
    }
    renderer.render(scene, camera);
  }

  function init() {
    initDom();
    setupThree();
    bindEvents();
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
    onResize();
    animate();
    toast('3D Data Visualizer loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

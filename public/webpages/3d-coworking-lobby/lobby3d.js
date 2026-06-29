(function () {
  'use strict';

  const spaces = [
    { name: 'Hot Desks', cap: '1-6 people', ideal: 'Solo focus and quick drop-ins', availability: 'Open today', copy: 'Bright shared tables with power, task lighting, and easy access to the lobby café.' },
    { name: 'Dedicated Desks', cap: '1-8 people', ideal: 'Regular routines and personal setup', availability: 'Few left', copy: 'Reserved desks with storage, chair comfort, and a quieter acoustic profile.' },
    { name: 'Private Offices', cap: '2-12 people', ideal: 'Teams that need privacy', availability: 'Available later', copy: 'Enclosed rooms with glass walls, soft lighting, and secure team access.' },
    { name: 'Meeting Rooms', cap: '4-10 people', ideal: 'Client calls and presentations', availability: 'Open today', copy: 'Presentation-ready rooms with screens, camera support, and refined seating.' },
    { name: 'Phone Booths', cap: '1 person', ideal: 'Private calls and deep work', availability: 'Open today', copy: 'Acoustic booths with ventilation, warm lighting, and quick-book access.' },
    { name: 'Creative Lounge', cap: '1-20 people', ideal: 'Brainstorms and informal meetings', availability: 'Open now', copy: 'Relaxed lounge seating, coffee tables, and soft textures for collaboration.' },
    { name: 'Event Space', cap: '20-60 people', ideal: 'Talks and launches', availability: 'Booked tonight', copy: 'A flexible room for demos, panels, and community gatherings.' },
    { name: 'Outdoor Terrace', cap: '1-24 people', ideal: 'Fresh-air breaks and social time', availability: 'Open later', copy: 'Natural light, plants, and an easy transition from work to conversation.' }
  ];

  const memberships = [
    { name: 'Day Pass', price: '$29', meta: 'Access from 8:00 to 20:00', benefits: 'Wi-Fi, coffee, hot desks, and lounge access.' },
    { name: 'Flex Desk', price: '$199', meta: 'Weekday access', benefits: 'A fluid desk, meeting credits, and member perks.' },
    { name: 'Dedicated Desk', price: '$349', meta: '24/7 access', benefits: 'Your own desk, storage, and mail handling.' },
    { name: 'Private Office', price: '$1,290', meta: 'Team privacy', benefits: 'Lockable office, rooms credits, and brand signage.' },
    { name: 'Team Suite', price: '$2,750', meta: 'Growing teams', benefits: 'Multiple rooms, shared lounge, and concierge support.' },
    { name: 'Enterprise Workspace', price: 'Custom', meta: 'Scale with confidence', benefits: 'Bespoke buildout, analytics, and dedicated account care.' }
  ];

  const amenities = [
    'High-Speed Wi-Fi', 'Specialty Coffee', 'Meeting Room Credits', 'Printing & Scanning', 'Mail Handling',
    'Lockers', 'Podcast Room', 'Wellness Corner', 'Bike Parking', 'Community Events'
  ];

  const events = [
    { title: 'Monday Coffee Meetup', date: 'Mon Jun 30', time: '8:30 AM', place: 'Lobby Bar', host: 'Community Team' },
    { title: 'Startup Pitch Night', date: 'Wed Jul 02', time: '6:00 PM', place: 'Event Space', host: 'Founders Circle' },
    { title: 'Design Critique Session', date: 'Thu Jul 03', time: '4:00 PM', place: 'Meeting Room B', host: 'Creative Lab' },
    { title: 'Founder Breakfast', date: 'Fri Jul 04', time: '9:00 AM', place: 'Terrace', host: 'Operations Crew' },
    { title: 'AI Productivity Workshop', date: 'Tue Jul 08', time: '12:00 PM', place: 'Workshop Room', host: 'AI Studio' },
    { title: 'Community Networking Hour', date: 'Fri Jul 11', time: '5:30 PM', place: 'Lounge', host: 'Member Hosts' }
  ];

  const community = [
    { role: 'Founders', line: 'Building ideas from the lobby outward.' },
    { role: 'Designers', line: 'Shaping products with sharp taste.' },
    { role: 'Developers', line: 'Shipping from quiet focus zones.' },
    { role: 'Consultants', line: 'Meeting clients in polished rooms.' },
    { role: 'Remote Teams', line: 'A home base that still feels fresh.' },
    { role: 'Creators', line: 'Recording, networking, and collaborating.' }
  ];

  const availabilitySets = {
    today: ['Meeting Room A — Available', 'Meeting Room B — Booked', 'Focus Booth 01 — Available', 'Creative Studio — Available later'],
    tomorrow: ['Meeting Room A — Available', 'Meeting Room B — Available', 'Focus Booth 01 — Booked', 'Creative Studio — Available'],
    meetings: ['Meeting Room A — Available', 'Meeting Room B — Booked', 'Boardroom — Available later'],
    booths: ['Focus Booth 01 — Available', 'Focus Booth 02 — Available', 'Focus Booth 03 — Booked'],
    events: ['Event Space — Booked tonight', 'Lounge Stage — Available later', 'Terrace — Open for private booking']
  };

  const hotSpots = [
    ['Reception', 'A warm welcome and quick member check-in.'],
    ['Coffee Bar', 'Specialty coffee, tea, and a social pause.'],
    ['Hot Desks', 'Flexible seating for focused work.'],
    ['Meeting Rooms', 'Private rooms for calls and team sessions.'],
    ['Private Offices', 'Quiet enclosed rooms for longer projects.'],
    ['Phone Booths', 'Acoustic spaces for private calls.'],
    ['Events Board', 'See what is happening this week.'],
    ['Book Tour', 'Schedule a visit or a custom walkthrough.']
  ];

  const dom = {
    canvasHost: document.getElementById('lobby-canvas'),
    enterLobby: document.getElementById('enter-lobby'),
    mobileToggle: document.getElementById('mobile-toggle'),
    nav: document.getElementById('primary-nav'),
    spaceGrid: document.getElementById('space-grid'),
    membershipGrid: document.getElementById('membership-grid'),
    amenityGrid: document.getElementById('amenity-grid'),
    eventsBoard: document.getElementById('events-board'),
    filters: document.getElementById('availability-filters'),
    availabilityList: document.getElementById('availability-list'),
    reserveRoom: document.getElementById('reserve-room'),
    communityGrid: document.getElementById('community-grid'),
    meetCommunity: document.getElementById('meet-community'),
    viewLocation: document.getElementById('view-location'),
    tourForm: document.getElementById('tour-form'),
    tourStatus: document.getElementById('tour-status'),
    contactForm: document.getElementById('contact-form'),
    contactStatus: document.getElementById('contact-status'),
    selectedSummaryTitle: document.getElementById('selected-summary-title'),
    selectedSummaryCopy: document.getElementById('selected-summary-copy'),
    selectedSummaryBox: document.getElementById('selected-summary-box'),
    modal: document.getElementById('detail-modal'),
    modalClose: document.getElementById('modal-close'),
    modalTitle: document.getElementById('modal-title'),
    modalCopy: document.getElementById('modal-copy'),
    modalMeta: document.getElementById('modal-meta'),
    modalAction: document.getElementById('modal-action'),
    modalSecondary: document.getElementById('modal-secondary')
  };

  const state = { filter: 'today', selected: null, cameraTarget: 0 };
  let scene, camera, renderer, lobbyRoot, clock, raf = 0;
  let drag = false, dragX = 0, dragY = 0, theta = 0.3, phi = 1.0, radius = 12;
  let hotspotMeshes = [];

  function qsa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

  function revealOnScroll() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in-view'); });
    }, { threshold: 0.16 });
    qsa(document, '.reveal').forEach(el => io.observe(el));
  }

  function setSummary(title, copy, meta) {
    dom.selectedSummaryTitle.textContent = title;
    dom.selectedSummaryCopy.textContent = copy;
    dom.selectedSummaryBox.innerHTML = meta.map(item => `<div>${item}</div>`).join('');
  }

  function openModal(title, copy, meta, actionLabel, onAction) {
    dom.modalTitle.textContent = title;
    dom.modalCopy.textContent = copy;
    dom.modalMeta.innerHTML = meta.map(item => `<div>${item}</div>`).join('');
    dom.modalAction.textContent = actionLabel || 'Confirm';
    dom.modalAction.onclick = () => {
      if (onAction) onAction();
      closeModal();
    };
    dom.modal.classList.remove('hidden');
  }

  function closeModal() { dom.modal.classList.add('hidden'); }

  function selectSpace(space) {
    state.selected = space.name;
    setSummary(space.name, space.copy, [space.cap, space.ideal, space.availability]);
    openModal(space.name, space.copy, [space.cap, space.ideal, space.availability], 'View Space', () => scrollToId('book-tour'));
  }

  function scrollToId(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  function buildCards() {
    dom.spaceGrid.innerHTML = spaces.map(space => `
      <article class="space-card reveal">
        <span class="pill">${space.availability}</span>
        <h3>${space.name}</h3>
        <p>${space.copy}</p>
        <div class="space-meta"><div>${space.cap}</div><div>${space.ideal}</div></div>
        <button class="btn btn-secondary" data-space="${space.name}">View Space</button>
      </article>
    `).join('');

    dom.membershipGrid.innerHTML = memberships.map(plan => `
      <article class="pricing-card reveal">
        <span class="pill">${plan.meta}</span>
        <h3>${plan.name}</h3>
        <p><strong style="font-size:2rem;color:var(--text)">${plan.price}</strong></p>
        <p>${plan.benefits}</p>
        <button class="btn btn-primary" data-plan="${plan.name}">Choose Plan</button>
      </article>
    `).join('');

    dom.amenityGrid.innerHTML = amenities.map(amenity => `
      <article class="amenity-card reveal">
        <h3>${amenity}</h3>
        <p>Premium support for the workday with calm, reliable service and a warm lobby feel.</p>
        <button class="btn btn-secondary" data-amenity="${amenity}">View Amenity</button>
      </article>
    `).join('');

    dom.eventsBoard.innerHTML = events.map(event => `
      <article class="event-card reveal">
        <h3>${event.title}</h3>
        <div class="space-meta"><div>${event.date}</div><div>${event.time}</div><div>${event.place}</div><div>${event.host}</div></div>
        <button class="btn btn-primary" data-rsvp="${event.title}">RSVP</button>
      </article>
    `).join('');

    dom.communityGrid.innerHTML = community.map(member => `
      <article class="community-card reveal">
        <h3>${member.role}</h3>
        <p>${member.line}</p>
      </article>
    `).join('');

    qsa(document, '[data-space]').forEach(btn => btn.addEventListener('click', () => {
      const space = spaces.find(s => s.name === btn.dataset.space);
      if (space) selectSpace(space);
    }));
    qsa(document, '[data-plan]').forEach(btn => btn.addEventListener('click', () => {
      const plan = memberships.find(p => p.name === btn.dataset.plan);
      if (!plan) return;
      setSummary(plan.name, plan.benefits, [plan.price, plan.meta, 'Selected for booking']);
      openModal(plan.name, plan.benefits, [plan.price, plan.meta], 'Choose Plan', () => scrollToId('book-tour'));
    }));
    qsa(document, '[data-amenity]').forEach(btn => btn.addEventListener('click', () => {
      const amenity = btn.dataset.amenity;
      openModal(amenity, 'A premium amenity that helps the workspace feel complete and polished.', ['Calm service', 'Member favorite', 'Designed for everyday use'], 'Great', null);
    }));
    qsa(document, '[data-rsvp]').forEach(btn => btn.addEventListener('click', () => {
      openModal(btn.dataset.rsvp, 'Your RSVP has been tentatively saved for the community calendar.', ['RSVP confirmed', 'You will receive a reminder', 'Bring a guest if needed'], 'Confirmed', null);
    }));
  }

  function buildFilters() {
    const tabs = [
      ['today', 'Today'], ['tomorrow', 'Tomorrow'], ['meetings', 'Meeting Rooms'], ['booths', 'Phone Booths'], ['events', 'Event Space']
    ];
    dom.filters.innerHTML = tabs.map(([id, label]) => `<button class="filter-btn ${id === state.filter ? 'active' : ''}" data-filter="${id}">${label}</button>`).join('');
    qsa(dom.filters, '[data-filter]').forEach(btn => btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter;
      buildFilters();
      renderAvailability();
    }));
  }

  function renderAvailability() {
    dom.availabilityList.innerHTML = availabilitySets[state.filter].map(item => `<div class="availability-item">${item}</div>`).join('');
  }

  function buildTourSummary(data) {
    setSummary(
      `${data.name || 'Tour request'}`,
      'A team member will review your preferred date, workspace interest, and company size.',
      [data.email, data.company, data.teamSize ? `${data.teamSize} people` : '']
    );
  }

  function validateForm(form) {
    return Array.from(form.elements).every(el => !el.required || String(el.value || '').trim());
  }

  function initForms() {
    dom.tourForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(dom.tourForm)) {
        dom.tourStatus.textContent = 'Please complete every field before scheduling the tour.';
        return;
      }
      const data = Object.fromEntries(new FormData(dom.tourForm).entries());
      dom.tourStatus.textContent = 'Tour request sent. We will confirm your visit shortly.';
      buildTourSummary(data);
      openModal('Tour scheduled', 'Thanks for booking a guided coworking visit. A coordinator will follow up by email.', [data.name, data.company, data.interest], 'Finish', null);
      dom.tourForm.reset();
    });

    dom.contactForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(dom.contactForm)) {
        dom.contactStatus.textContent = 'Please fill in all contact fields.';
        return;
      }
      const data = Object.fromEntries(new FormData(dom.contactForm).entries());
      dom.contactStatus.textContent = 'Message sent. Our coworking team will reply soon.';
      openModal('Contact sent', 'Thanks for reaching out. A team member will get back to you with details and next steps.', [data.email, data.type, 'Within one business day'], 'Done', null);
      dom.contactForm.reset();
    });
  }

  function buildScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3eee5);
    camera = new THREE.PerspectiveCamera(35, dom.canvasHost.clientWidth / dom.canvasHost.clientHeight, 0.1, 100);
    camera.position.set(0, 4.2, radius);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(dom.canvasHost.clientWidth, dom.canvasHost.clientHeight);
    renderer.shadowMap.enabled = true;
    dom.canvasHost.appendChild(renderer.domElement);
    clock = new THREE.Clock();

    const ambient = new THREE.AmbientLight(0xfff5eb, 0.8);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff0dd, 1.4);
    sun.position.set(-6, 10, 8);
    sun.castShadow = true;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb39e82, 0.65));

    lobbyRoot = new THREE.Group();
    scene.add(lobbyRoot);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), new THREE.MeshStandardMaterial({ color: 0xe5d8c4, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    lobbyRoot.add(floor);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 0.4), new THREE.MeshStandardMaterial({ color: 0xf7f0e6 }));
    backWall.position.set(0, 5, -12);
    lobbyRoot.add(backWall);

    const reception = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x3a2f27, roughness: 0.72 }));
    reception.position.set(0, 0.6, -6);
    reception.castShadow = true;
    lobbyRoot.add(reception);

    const lounge = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.5, 2.4), new THREE.MeshStandardMaterial({ color: 0xb88b6d }));
    lounge.position.set(-6.2, 0.25, -1.8);
    lounge.castShadow = true;
    lobbyRoot.add(lounge);

    const cafe = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.0, 1.8), new THREE.MeshStandardMaterial({ color: 0x6b4c38 }));
    cafe.position.set(5.2, 0.5, -3.2);
    lobbyRoot.add(cafe);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(7, 0.35, 2.2), new THREE.MeshStandardMaterial({ color: 0xdfcdb7 }));
    desk.position.set(0, 0.17, 1.8);
    lobbyRoot.add(desk);

    const glassRoom = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 2.4), new THREE.MeshStandardMaterial({ color: 0xdce9ea, transparent: true, opacity: 0.45, roughness: 0.15 }));
    glassRoom.position.set(7.5, 1.3, 3.5);
    lobbyRoot.add(glassRoom);

    const booth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x5f6a70 }));
    booth.position.set(-9, 1.1, 4.2);
    lobbyRoot.add(booth);

    const board = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2, 0.18), new THREE.MeshStandardMaterial({ color: 0x203f49 }));
    board.position.set(9.5, 1.5, -0.8);
    lobbyRoot.add(board);

    const terrace = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.3, 2.8), new THREE.MeshStandardMaterial({ color: 0x8ca285 }));
    terrace.position.set(-8.2, 0.15, -7.4);
    lobbyRoot.add(terrace);

    addDecor();
    addHotspots();
    updateCamera();
    animate();
  }

  function addDecor() {
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x7d9a7c });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x5f7b5d });
    for (let i = 0; i < 8; i++) {
      const plant = new THREE.Group();
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x9a7a5d }));
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.1), stemMat);
      stem.position.y = 0.7;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 10), plantMat);
      leaf.position.y = 1.35;
      plant.add(pot, stem, leaf);
      plant.position.set(-10 + i * 2.8, 0, i % 2 ? 7 : -9);
      lobbyRoot.add(plant);
    }
    for (let i = 0; i < 10; i++) {
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a8 }));
      light.position.set(-11 + i * 2.2, 6 + (i % 2), -10 + (i % 3));
      lobbyRoot.add(light);
    }
  }

  function addHotspots() {
    const positions = [
      { label: 'Reception', pos: [0, 2, -5.7] },
      { label: 'Coffee Bar', pos: [5.2, 1.6, -3.2] },
      { label: 'Hot Desks', pos: [0, 1.4, 1.8] },
      { label: 'Meeting Rooms', pos: [7.5, 2, 3.5] },
      { label: 'Private Offices', pos: [9.4, 2, 0.8] },
      { label: 'Phone Booths', pos: [-9, 1.8, 4.2] },
      { label: 'Events Board', pos: [9.5, 2.5, -0.8] },
      { label: 'Book Tour', pos: [-8.2, 1.2, -7.4] }
    ];
    positions.forEach((item, idx) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.33, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xd9a76f, emissive: 0x4d2410, emissiveIntensity: 0.35 })
      );
      mesh.position.set(...item.pos);
      mesh.userData = { title: item.label, body: hotSpots[idx][1] };
      lobbyRoot.add(mesh);
      hotspotMeshes.push(mesh);
      const label = makeLabel(item.label);
      label.position.set(item.pos[0], item.pos[1] + 0.75, item.pos[2]);
      lobbyRoot.add(label);
    });
  }

  function makeLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(19,26,30,.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, 40);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.6),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    return sprite;
  }

  function updateCamera() {
    camera.position.x = Math.sin(theta) * Math.cos(phi) * radius;
    camera.position.y = Math.sin(phi) * radius * 0.25 + 4;
    camera.position.z = Math.cos(theta) * Math.cos(phi) * radius;
    camera.lookAt(state.cameraTarget === 0 ? new THREE.Vector3(0, 1.5, -1) : state.cameraTarget);
  }

  function focusZone(name) {
    const targets = {
      reception: [0, 1.6, -4.7],
      cafe: [4.8, 1.3, -2.8],
      desks: [0, 1.3, 1.2],
      rooms: [7, 1.8, 3.2]
    };
    const next = targets[name];
    if (!next) return;
    state.cameraTarget = new THREE.Vector3(...next);
    const camState = { r: radius };
    gsap.to(camState, {
      r: 9.2,
      duration: 1.3,
      ease: 'power2.out',
      onUpdate() { radius = camState.r; updateCamera(); },
      onComplete() { radius = 9.2; updateCamera(); }
    });
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    hotspotMeshes.forEach((mesh, i) => {
      mesh.position.y = mesh.position.y + Math.sin(elapsed * 1.8 + i) * 0.001;
      mesh.scale.setScalar(1 + Math.sin(elapsed * 2.2 + i) * 0.08);
    });
    lobbyRoot.rotation.y = Math.sin(elapsed * 0.08) * 0.06;
    renderer.render(scene, camera);
  }

  function bindCanvas() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hitTest = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(hotspotMeshes, false);
    };

    renderer.domElement.addEventListener('pointerdown', e => {
      drag = true;
      dragX = e.clientX;
      dragY = e.clientY;
      const hits = hitTest(e.clientX, e.clientY);
      if (hits.length) {
        const mesh = hits[0].object;
        openModal(mesh.userData.title, mesh.userData.body, ['Interactive hotspot', 'Tap to browse related sections', 'Premium lobby zone'], 'Explore', () => {
          if (mesh.userData.title === 'Book Tour') scrollToId('book-tour');
          if (mesh.userData.title === 'Events Board') scrollToId('events');
        });
      }
    });
    window.addEventListener('pointermove', e => {
      if (!drag) return;
      theta -= (e.clientX - dragX) * 0.005;
      phi = Math.max(-0.3, Math.min(1.5, phi - (e.clientY - dragY) * 0.005));
      dragX = e.clientX;
      dragY = e.clientY;
      updateCamera();
    });
    window.addEventListener('pointerup', () => { drag = false; });
    renderer.domElement.addEventListener('wheel', e => {
      e.preventDefault();
      radius = Math.max(7.2, Math.min(16, radius + e.deltaY * 0.01));
      updateCamera();
    }, { passive: false });
  }

  function bindUI() {
    dom.mobileToggle.addEventListener('click', () => {
      const open = dom.nav.classList.toggle('open');
      dom.mobileToggle.setAttribute('aria-expanded', String(open));
    });
    dom.enterLobby.addEventListener('click', () => {
      focusZone('reception');
      openModal('Enter the lobby', 'The guided camera moves from the entrance to the reception, lounge, coffee bar, and work zones.', ['Camera guided', 'Lobby tour mode', 'Hotspots active'], 'Start tour', () => scrollToId('spaces'));
    });
    dom.meetCommunity.addEventListener('click', () => scrollToId('events'));
    dom.viewLocation.addEventListener('click', () => openModal('Downtown Creative District', 'Transit, cafés, parking, and bike parking sit within an easy walk of the lobby.', ['Transit access', 'Food nearby', 'Parking and bike storage'], 'Great', null));
    dom.reserveRoom.addEventListener('click', () => openModal('Reserve Room', 'We will lock the room request and send a confirmation after review.', ['Meeting rooms', 'Phone booths', 'Event space'], 'Reserve', null));
    dom.modalClose.addEventListener('click', closeModal);
    dom.modalSecondary.addEventListener('click', closeModal);
    dom.modal.addEventListener('click', e => { if (e.target === dom.modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  function init() {
    revealOnScroll();
    buildCards();
    buildFilters();
    renderAvailability();
    initForms();
    bindUI();
    buildScene();
    bindCanvas();
    if ('IntersectionObserver' in window === false) qsa(document, '.reveal').forEach(el => el.classList.add('in-view'));
  }

  init();
})();

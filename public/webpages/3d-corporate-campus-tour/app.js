const zones = [
  { title: 'Main Lobby', benefit: 'Welcoming arrival point with concierge, visibility, and visitor flow.', tag: 'Offices' },
  { title: 'Office Towers', benefit: 'Premium workspace towers designed for scale, daylight, and efficiency.', tag: 'Offices' },
  { title: 'Innovation Hub', benefit: 'Prototype, workshop, and collaboration center for rapid iteration.', tag: 'Innovation' },
  { title: 'Collaboration Lounge', benefit: 'Open lounge for informal meetings and cross-team conversations.', tag: 'Amenities' },
  { title: 'Event Auditorium', benefit: 'Large-format presentation space for launches, briefings, and town halls.', tag: 'Innovation' },
  { title: 'Green Plaza', benefit: 'Landscaped outdoor core that connects the campus with restorative green space.', tag: 'Green' },
  { title: 'Wellness Center', benefit: 'Fitness and recovery zone supporting healthy, balanced workdays.', tag: 'Amenities' },
  { title: 'Smart Parking', benefit: 'Efficient vehicle access with EV support and guided circulation.', tag: 'Parking' }
];

const innovationSpaces = [
  'AI Research Lab',
  'Product Strategy Rooms',
  'Prototype Studio',
  'Hybrid Collaboration Spaces',
  'Data Visualization Center',
  'Executive Briefing Room'
];

const amenities = [
  'Premium cafeteria', 'Fitness studio', 'Wellness room', 'Outdoor seating',
  'Conference rooms', 'Visitor lounge', 'EV charging', 'Bike storage'
];

const securityItems = [
  'Smart Badge Entry', 'Visitor Check-In', 'Secure Data Zones',
  'Camera Monitoring', 'Emergency Guidance', 'Night Path Safety'
];

const sustainability = [
  { value: '40%', label: 'Lower Energy Use' },
  { value: '30%', label: 'Green Area Coverage' },
  { value: '75%', label: 'Smart Resource Efficiency' },
  { value: '60%', label: 'Walkable Access Routes' }
];

const sceneState = {
  scene: 'entrance',
  filter: 'all',
  progress: 0,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 1,
  animating: false
};

const canvas = document.getElementById('campus-canvas');
const ctx = canvas.getContext('2d');
const hotspotLayer = document.getElementById('hotspot-layer');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const tourStatus = document.getElementById('tour-status');
const visitForm = document.getElementById('visit-form');
const contactForm = document.getElementById('contact-form');
const visitMessage = document.getElementById('visit-message');
const contactMessage = document.getElementById('contact-message');
const visitSummary = document.getElementById('visit-summary');
const zoneDetail = document.getElementById('zone-detail');
const mapCopy = document.getElementById('map-copy');
const menuToggle = document.getElementById('menu-toggle');
const primaryNav = document.getElementById('primary-nav');
const canvasRect = () => canvas.getBoundingClientRect();

const sections = {
  zonesGrid: document.getElementById('zones-grid'),
  innovationGrid: document.getElementById('innovation-grid'),
  amenitiesGrid: document.getElementById('amenities-grid'),
  securityGrid: document.getElementById('security-grid'),
  metricsGrid: document.getElementById('metrics-grid'),
  campusMap: document.getElementById('campus-map')
};

const hotspots = [
  { id: 'entrance', label: 'Main Entrance', x: 0.18, y: 0.6, scene: 'entrance', copy: 'Begin at the ceremonial entry framed by glass and landscaped approach paths.' },
  { id: 'innovation', label: 'Innovation Hub', x: 0.53, y: 0.42, scene: 'innovation', copy: 'Move into labs and product strategy spaces where the campus accelerates ideas.' },
  { id: 'office', label: 'Office Towers', x: 0.74, y: 0.26, scene: 'office', copy: 'See the towers that anchor the campus skyline and provide efficient workplace density.' },
  { id: 'auditorium', label: 'Event Auditorium', x: 0.66, y: 0.66, scene: 'auditorium', copy: 'Large-format events and briefings happen in a formal, flexible presentation venue.' },
  { id: 'green', label: 'Green Plaza', x: 0.39, y: 0.74, scene: 'green', copy: 'Pause in the central plaza with tree canopies, seating, and low-impact water features.' },
  { id: 'wellness', label: 'Wellness Center', x: 0.15, y: 0.28, scene: 'wellness', copy: 'Fitness, recovery, and outdoor circulation keep the workplace balanced.' },
  { id: 'parking', label: 'Smart Parking', x: 0.86, y: 0.78, scene: 'parking', copy: 'Guided vehicle access and EV support keep arrival organized and efficient.' },
  { id: 'data', label: 'Data Center', x: 0.9, y: 0.44, scene: 'data', copy: 'Secure technical infrastructure powers the campus quietly in the background.' }
];

function createCard(title, text, buttonLabel, extra = '') {
  const article = document.createElement('article');
  article.className = 'card glass';
  article.innerHTML = `
    <h3>${title}</h3>
    <p>${text}</p>
    ${extra ? `<p class="metric-label">${extra}</p>` : ''}
    <button class="button button-secondary" type="button">${buttonLabel}</button>
  `;
  return article;
}

function buildGrids() {
  zones.forEach((zone) => {
    const card = createCard(zone.title, zone.benefit, 'Explore Zone', zone.tag);
    card.querySelector('button').addEventListener('click', () => openModal(zone.title, zone.benefit, zone.tag));
    card.addEventListener('mouseenter', () => updateZoneDetail(zone));
    sections.zonesGrid.appendChild(card);
  });

  innovationSpaces.forEach((space, index) => {
    const card = createCard(space, 'Supports strategic planning, experimentation, and high-trust collaboration.', 'View Space', `Space ${String(index + 1).padStart(2, '0')}`);
    card.querySelector('button').addEventListener('click', () => openModal(space, 'Dedicated workspace with immersive displays, data walls, and premium materials.', 'Innovation'));
    sections.innovationGrid.appendChild(card);
  });

  amenities.forEach((amenity) => {
    const card = createCard(amenity, 'Designed for comfort, circulation, and polished day-to-day use.', 'View Amenity');
    card.querySelector('button').addEventListener('click', () => openModal(amenity, 'A premium amenity stop with supportive services and seamless campus access.', 'Amenity'));
    sections.amenitiesGrid.appendChild(card);
  });

  securityItems.forEach((item) => {
    const card = createCard(item, 'Communicates safety, clarity, and seamless access without visual aggression.', 'View Access Flow');
    card.querySelector('button').addEventListener('click', () => openModal('Access Flow', `${item} is part of an organized entry and protection flow for visitors and teams.`, 'Security'));
    sections.securityGrid.appendChild(card);
  });

  sustainability.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'glass';
    article.innerHTML = `
      <div class="metric-value">${item.value}</div>
      <div class="metric-label">${item.label}</div>
    `;
    sections.metricsGrid.appendChild(article);
  });

  sections.campusMap.innerHTML = `
    <div class="hotspot" style="left:18%;top:68%">Lobby</div>
    <div class="hotspot" style="left:41%;top:46%">Innovation</div>
    <div class="hotspot" style="left:70%;top:28%">Offices</div>
    <div class="hotspot" style="left:24%;top:28%">Wellness</div>
    <div class="hotspot" style="left:78%;top:72%">Parking</div>
    <div class="hotspot" style="left:57%;top:69%">Plaza</div>
  `;
}

function updateZoneDetail(zone) {
  zoneDetail.innerHTML = `
    <p class="section-label">${zone.tag}</p>
    <h3>${zone.title}</h3>
    <p>${zone.benefit}</p>
    <button class="button button-primary" type="button">View Space</button>
  `;
  zoneDetail.querySelector('button').addEventListener('click', () => openModal(zone.title, zone.benefit, zone.tag));
}

function openModal(title, copy, tag) {
  modalContent.innerHTML = `
    <p class="section-label">${tag}</p>
    <h3 style="font-family:Cormorant Garamond,serif;font-size:2.4rem;margin:0 0 12px">${title}</h3>
    <p style="color:#aab6c4;line-height:1.7">${copy}</p>
  `;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

function syncNav() {
  primaryNav.classList.toggle('is-open', menuToggle.getAttribute('aria-expanded') === 'true');
}

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  syncNav();
});

document.querySelectorAll('[data-scroll]').forEach((item) => {
  item.addEventListener('click', (event) => {
    const href = item.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    event.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    menuToggle.setAttribute('aria-expanded', 'false');
    syncNav();
  });
});

const sceneButtons = document.querySelectorAll('[data-scene]');
sceneButtons.forEach((button) => {
  button.addEventListener('click', () => {
    sceneButtons.forEach((btn) => btn.classList.remove('is-active'));
    button.classList.add('is-active');
    setScene(button.dataset.scene, true);
  });
});

document.querySelector('[data-tour-start]').addEventListener('click', () => {
  sceneState.animating = true;
  sceneState.progress = 0;
  tourStatus.textContent = 'Guided tour running';
  const steps = ['entrance', 'lobby', 'innovation', 'green', 'security'];
  let index = 0;
  const timer = setInterval(() => {
    setScene(steps[index], true);
    index += 1;
    if (index >= steps.length) {
      clearInterval(timer);
      sceneState.animating = false;
      tourStatus.textContent = 'Tour complete';
    }
  }, 1400);
});

document.getElementById('zones').querySelectorAll('button').forEach((button) => {
  if (button.textContent === 'Reset View') button.remove();
});

document.querySelectorAll('.map-filter').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    if (filter === 'reset') {
      sceneState.filter = 'all';
      mapCopy.textContent = 'A connected corporate campus with a central plaza, office towers, innovation hub, and secure visitor access.';
    } else {
      sceneState.filter = filter;
      mapCopy.textContent = `Filtered view: ${button.textContent} are highlighted within the campus journey.`;
    }
    document.querySelectorAll('.map-filter').forEach((btn) => btn.classList.toggle('is-active', btn === button));
    if (filter === 'reset') document.querySelector('[data-filter="all"]').classList.add('is-active');
  });
});

visitForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(visitForm);
  if (!data.get('type') || !data.get('date') || !data.get('time') || !data.get('name') || !data.get('email')) {
    visitMessage.textContent = 'Please complete all visit fields.';
    return;
  }
  visitMessage.textContent = 'Campus visit scheduled. A confirmation has been prepared for your review.';
  visitSummary.innerHTML = `
    <h3>Visit summary</h3>
    <p><strong>Type:</strong> ${data.get('type')}</p>
    <p><strong>Date:</strong> ${data.get('date')}</p>
    <p><strong>Time:</strong> ${data.get('time')}</p>
    <p><strong>Contact:</strong> ${data.get('name')} · ${data.get('email')}</p>
  `;
  visitForm.reset();
});

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  if (![...data.values()].every(Boolean)) {
    contactMessage.textContent = 'Please complete the contact form.';
    return;
  }
  contactMessage.textContent = 'Thank you. Your request has been received and a campus advisor will follow up.';
  contactForm.reset();
});

function setScene(sceneName, immediate = false) {
  sceneState.scene = sceneName;
  const targets = {
    entrance: { x: 0.5, y: -0.2, z: 1.2 },
    lobby: { x: 0.1, y: -0.4, z: 1.5 },
    innovation: { x: -0.4, y: -0.2, z: 1.6 },
    green: { x: 0.2, y: 0.25, z: 1.1 },
    security: { x: 0.6, y: 0.15, z: 1.4 },
    office: { x: 0.8, y: -0.15, z: 1.8 },
    auditorium: { x: 0.35, y: 0.05, z: 1.7 },
    wellness: { x: -0.55, y: 0.12, z: 1.25 },
    parking: { x: 0.95, y: 0.3, z: 1.8 },
    data: { x: 1.0, y: -0.2, z: 1.7 }
  };
  const target = targets[sceneName] || targets.entrance;
  if (immediate) {
    sceneState.cameraX = target.x;
    sceneState.cameraY = target.y;
    sceneState.cameraZ = target.z;
  } else {
    sceneState.cameraX += (target.x - sceneState.cameraX) * 0.1;
    sceneState.cameraY += (target.y - sceneState.cameraY) * 0.1;
    sceneState.cameraZ += (target.z - sceneState.cameraZ) * 0.1;
  }
  tourStatus.textContent = sceneName.replace(/^[a-z]/, (m) => m.toUpperCase());
}

function resize() {
  canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function drawCampus(time) {
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;
  ctx.clearRect(0, 0, w, h);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#122437');
  sky.addColorStop(0.6, '#08111a');
  sky.addColorStop(1, '#04080d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.22, 80, w * 0.5, h * 0.22, w * 0.42);
  glow.addColorStop(0, 'rgba(129,216,201,0.24)');
  glow.addColorStop(1, 'rgba(129,216,201,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const groundY = h * 0.71;
  ctx.fillStyle = '#0c1621';
  ctx.fillRect(0, groundY, w, h - groundY);

  const path = ctx.createLinearGradient(0, groundY, w, h);
  path.addColorStop(0, 'rgba(241,200,121,.18)');
  path.addColorStop(1, 'rgba(129,216,201,.14)');
  ctx.fillStyle = path;
  ctx.beginPath();
  ctx.moveTo(w * 0.25, groundY);
  ctx.lineTo(w * 0.5, h * 0.48);
  ctx.lineTo(w * 0.75, groundY);
  ctx.fill();

  const depth = Math.max(0.6, sceneState.cameraZ);
  const wobble = Math.sin(time * 0.0012) * 4;
  const buildingAlpha = 0.92;
  const towers = [
    [w * 0.18, h * 0.25, w * 0.13, h * 0.34],
    [w * 0.34, h * 0.18, w * 0.12, h * 0.46],
    [w * 0.66, h * 0.14, w * 0.14, h * 0.5],
    [w * 0.82, h * 0.28, w * 0.11, h * 0.3]
  ];

  towers.forEach((tower, index) => {
    const [x, y, bw, bh] = tower;
    const shift = (index - 1.5) * sceneState.cameraX * 50;
    const scale = 1 + sceneState.cameraZ * 0.06 + index * 0.015;
    const width = bw * scale;
    const height = bh * scale;
    const topY = y + wobble * (index % 2 ? 0.2 : -0.15);
    const gradient = ctx.createLinearGradient(x, topY, x + width, topY + height);
    gradient.addColorStop(0, `rgba(180,214,227,${buildingAlpha})`);
    gradient.addColorStop(1, `rgba(35,57,78,${buildingAlpha})`);
    ctx.fillStyle = gradient;
    roundRect(ctx, x - width / 2 + shift, topY, width, height, 16);
    ctx.fill();
    drawWindows(x - width / 2 + shift, topY, width, height);
  });

  drawPlaza(w, h, groundY, depth);
  drawTrees(w, h, groundY, depth);
  drawPeople(w, h, groundY, time);
  drawSolar(w, h, depth);

  requestHotspots();
  drawFloatingHUD(w, h, time);
}

function drawWindows(x, y, width, height) {
  ctx.fillStyle = 'rgba(129,216,201,.55)';
  const cols = Math.max(3, Math.floor(width / 18));
  const rows = Math.max(5, Math.floor(height / 24));
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      if ((col + row) % 2 === 0) {
        ctx.fillRect(x + 8 + col * (width - 16) / cols, y + 10 + row * (height - 20) / rows, 6, 10);
      }
    }
  }
}

function drawPlaza(w, h, groundY, depth) {
  ctx.fillStyle = 'rgba(10, 19, 28, 0.9)';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, groundY + 24, w * 0.22 * depth, 82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(241,200,121,.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.31, groundY + 20);
  ctx.lineTo(w * 0.69, groundY + 20);
  ctx.stroke();
}

function drawTrees(w, h, groundY, depth) {
  const trees = [
    [w * 0.08, groundY - 20], [w * 0.12, groundY - 8], [w * 0.88, groundY - 6],
    [w * 0.92, groundY - 18], [w * 0.22, groundY - 26], [w * 0.78, groundY - 30]
  ];
  trees.forEach(([x, y], index) => {
    ctx.fillStyle = `rgba(45, 94, 68, ${0.9 - index * 0.03})`;
    ctx.beginPath();
    ctx.arc(x, y, 20 + index * 1.2 * depth, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#684f35';
    ctx.fillRect(x - 3, y + 18, 6, 26);
  });
}

function drawPeople(w, h, groundY, time) {
  const people = [
    [w * 0.45, groundY + 2], [w * 0.54, groundY + 10], [w * 0.58, groundY - 8], [w * 0.62, groundY + 14]
  ];
  people.forEach(([x, y], index) => {
    const bob = Math.sin(time * 0.003 + index) * 3;
    ctx.fillStyle = 'rgba(236,243,247,.8)';
    ctx.beginPath();
    ctx.arc(x, y + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(236,243,247,.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 6 + bob);
    ctx.lineTo(x, y + 22 + bob);
    ctx.stroke();
  });
}

function drawSolar(w, h, depth) {
  ctx.fillStyle = 'rgba(129,216,201,.22)';
  roundRect(ctx, w * 0.7, h * 0.38, 96 * depth, 44 * depth, 8);
  ctx.fill();
}

function drawFloatingHUD(w, h, time) {
  const cards = [
    { x: w * 0.1, y: h * 0.18, label: 'Smart access' },
    { x: w * 0.74, y: h * 0.2, label: 'Innovation data' },
    { x: w * 0.18, y: h * 0.78, label: 'Green plaza' }
  ];
  cards.forEach((card, index) => {
    const off = Math.sin(time * 0.0015 + index) * 10;
    ctx.fillStyle = 'rgba(8,15,22,.72)';
    roundRect(ctx, card.x, card.y + off, 118, 38, 14);
    ctx.fill();
    ctx.fillStyle = 'rgba(236,243,247,.86)';
    ctx.font = '600 12px Inter';
    ctx.fillText(card.label, card.x + 12, card.y + 24 + off);
  });
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function requestHotspots() {
  hotspotLayer.innerHTML = '';
  hotspots.forEach((hotspot) => {
    const el = document.createElement('button');
    el.className = 'hotspot';
    el.type = 'button';
    el.style.left = `${hotspot.x * 100}%`;
    el.style.top = `${hotspot.y * 100}%`;
    el.textContent = hotspot.label;
    el.addEventListener('click', () => {
      setScene(hotspot.scene, true);
      openModal(hotspot.label, hotspot.copy, 'Hotspot');
    });
    hotspotLayer.appendChild(el);
  });
}

function animate(time) {
  drawCampus(time);
  if (!sceneState.animating) {
    const target = {
      x: sceneState.scene === 'innovation' ? -0.4 : sceneState.scene === 'green' ? 0.2 : sceneState.scene === 'wellness' ? -0.55 : sceneState.scene === 'security' ? 0.6 : 0,
      y: sceneState.scene === 'green' ? 0.22 : sceneState.scene === 'wellness' ? 0.08 : 0,
      z: sceneState.scene === 'office' ? 1.8 : sceneState.scene === 'parking' ? 1.75 : sceneState.scene === 'data' ? 1.7 : 1.35
    };
    sceneState.cameraX += (target.x - sceneState.cameraX) * 0.03;
    sceneState.cameraY += (target.y - sceneState.cameraY) * 0.03;
    sceneState.cameraZ += (target.z - sceneState.cameraZ) * 0.03;
  }
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
buildGrids();
updateZoneDetail(zones[0]);
setScene('entrance', true);
requestAnimationFrame(animate);

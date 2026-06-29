(function () {
  'use strict';

  const collections = [
    { name: 'Midnight Silk Coat', category: 'Outerwear', material: 'Silk blend', color: 'Midnight blue', price: '$1,980', description: 'Fluid tailoring with a quiet sheen and couture length.', look: 'Focuses on line, drape and evening movement.', kind: 'View Look' },
    { name: 'Ivory Sculpted Dress', category: 'Eveningwear', material: 'Crepe', color: 'Ivory', price: '$2,450', description: 'Architectural waist shaping with a soft editorial fall.', look: 'Balances structure and light in one silhouette.', kind: 'View Look' },
    { name: 'Graphite Tailored Suit', category: 'Tailoring', material: 'Wool', color: 'Graphite', price: '$2,100', description: 'Sharp shoulders, wide lapels and a runway-ready profile.', look: 'A precise modern suit made for movement.', kind: 'View Look' },
    { name: 'Golden Accent Blazer', category: 'Statement', material: 'Wool silk', color: 'Champagne gold', price: '$1,760', description: 'A luminous accent piece for private showroom styling.', look: 'Adds warm light to the core palette.', kind: 'View Look' },
    { name: 'Crystal Evening Gown', category: 'Gala', material: 'Silk organza', color: 'Pearl', price: '$3,260', description: 'Soft layers with subtle sparkle and elongated lines.', look: 'Designed for camera flashes and editorial motion.', kind: 'View Look' },
    { name: 'Minimal Leather Bag', category: 'Accessories', material: 'Leather', color: 'Black', price: '$680', description: 'Clean geometry with polished hardware.', look: 'A compact finishing piece for the collection.', kind: 'View Look' },
    { name: 'Velvet Statement Boots', category: 'Footwear', material: 'Velvet', color: 'Burgundy', price: '$920', description: 'Tall profile with plush texture and stage presence.', look: 'A strong grounding element for the runway.', kind: 'View Look' },
    { name: 'Runway Signature Set', category: 'Limited', material: 'Mixed', color: 'Mono gold', price: '$2,840', description: 'A composed hero set built for the main runway scene.', look: 'The anchor look for the showroom story.', kind: 'View Look' }
  ];

  const materials = [
    ['Silk', 'Liquid shine with a soft editorial ripple.'],
    ['Wool', 'Crisp warmth and a tailored grain.'],
    ['Leather', 'Polished depth with a bold surface.'],
    ['Velvet', 'Soft absorption with luminous shadows.'],
    ['Organic Cotton', 'Clean texture and breathable structure.'],
    ['Metallic Thread', 'Subtle sparkle that catches the spotlight.'],
    ['Crystal Embellishment', 'Precise highlights with jewelry-like shimmer.']
  ];

  const accessories = [
    ['Handbags', '$480', 'Sculpted carry pieces with refined hardware.'],
    ['Shoes', '$720', 'Editorial heels and boots with runway posture.'],
    ['Jewelry', '$390', 'Light-catching accents with delicate weight.'],
    ['Belts', '$220', 'Sharp finishing lines for silhouette control.'],
    ['Sunglasses', '$260', 'Angled frames with a fashion-week edge.'],
    ['Scarves', '$180', 'Fluid layers that move with the camera.']
  ];

  const experiences = [
    ['Guided runway walkthrough', 'A hosted visit with camera-led storytelling.', 'Explore Experience'],
    ['Private collection preview', 'An intimate view of the current capsule.', 'Explore Experience'],
    ['Designer notes', 'See the concept behind the silhouettes.', 'Explore Experience'],
    ['VIP appointment', 'Reserve a private schedule with the showroom team.', 'Explore Experience']
  ];

  const backstage = [
    ['Styling rack', 'Looks assembled and ready for the line-up.'],
    ['Makeup station', 'Warm lighting and polished final touches.'],
    ['Final fitting table', 'Tailoring checks before the runway.'],
    ['Lighting control', 'The atmosphere board that drives the scene.']
  ];

  const lookbook = [
    ['Eveningwear', 'Silhouettes for candlelit entrances and gala pacing.'],
    ['Tailoring', 'Clean lines, precise shoulders, and movement.',],
    ['Minimal Luxury', 'Monochrome layers with polished restraint.'],
    ['Street Couture', 'City energy translated into elevated fabric.'],
    ['Accessories', 'Finishing details presented as objects of desire.'],
    ['Limited Edition', 'Exclusive capsules with collector appeal.']
  ];

  const dom = {
    navToggle: document.querySelector('.nav-toggle'),
    nav: document.querySelector('.site-nav'),
    canvas: document.getElementById('fashion-canvas'),
    hotspotPanel: document.getElementById('hotspot-panel'),
    cameraReset: document.getElementById('camera-reset'),
    modal: document.getElementById('modal'),
    modalKicker: document.getElementById('modal-kicker'),
    modalTitle: document.getElementById('modal-title'),
    modalCopy: document.getElementById('modal-copy'),
    modalActions: document.getElementById('modal-actions'),
    bookingForm: document.getElementById('booking-form'),
    contactForm: document.getElementById('contact-form'),
    bookingStatus: document.getElementById('booking-status'),
    contactStatus: document.getElementById('contact-status'),
    vipButton: document.getElementById('vip-button'),
    collectionGrid: document.getElementById('collection-grid'),
    materialGrid: document.getElementById('material-grid'),
    accessoryGrid: document.getElementById('accessory-grid'),
    experienceGrid: document.getElementById('experience-grid'),
    backstageGrid: document.getElementById('backstage-grid'),
    lookbookStack: document.getElementById('lookbook-stack')
  };

  let scene, camera, renderer, runway, garments = [], hotspots = [], raycaster, pointer, activeHotspot = null;
  let scrollTarget = 0, cameraFocus = 0, raf = 0;

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function buildCards() {
    collections.forEach((item, index) => {
      const card = el('article', 'product-card reveal');
      card.innerHTML = `
        <div class="product-top">
          <span class="product-index">${String(index + 1).padStart(2, '0')}</span>
          <button class="wishlist-btn" type="button" aria-pressed="false">Add to Wishlist</button>
        </div>
        <h3>${item.name}</h3>
        <div class="product-meta">${item.category} · ${item.material} · ${item.color}</div>
        <p>${item.description}</p>
        <div class="product-footer">
          <strong>${item.price}</strong>
          <button class="btn btn-secondary" type="button" data-modal="look" data-index="${index}">${item.kind}</button>
        </div>
      `;
      card.querySelector('.wishlist-btn').addEventListener('click', (event) => {
        const btn = event.currentTarget;
        btn.classList.toggle('saved');
        btn.setAttribute('aria-pressed', btn.classList.contains('saved'));
        btn.textContent = btn.classList.contains('saved') ? 'Saved' : 'Add to Wishlist';
      });
      dom.collectionGrid.appendChild(card);
    });

    materials.forEach((item) => {
      const card = el('article', 'material-card reveal');
      card.innerHTML = `
        <h3>${item[0]}</h3>
        <p>${item[1]}</p>
        <button class="btn btn-secondary" type="button" data-modal="material" data-title="${item[0]}">View Texture</button>
      `;
      dom.materialGrid.appendChild(card);
    });

    accessories.forEach((item) => {
      const card = el('article', 'accessory-card reveal');
      card.innerHTML = `
        <h3>${item[0]}</h3>
        <div class="product-meta">${item[1]}</div>
        <p>${item[2]}</p>
        <button class="btn btn-secondary" type="button" data-modal="accessory" data-title="${item[0]}">Preview Accessory</button>
      `;
      dom.accessoryGrid.appendChild(card);
    });

    experiences.forEach((item) => {
      const card = el('article', 'info-card reveal');
      card.innerHTML = `<span class="icon">✦</span><h3>${item[0]}</h3><p>${item[1]}</p><button class="btn btn-secondary" type="button" data-modal="experience">${item[2]}</button>`;
      dom.experienceGrid.appendChild(card);
    });

    backstage.forEach((item) => {
      const card = el('article', 'info-card reveal');
      card.innerHTML = `<span class="icon">BK</span><h3>${item[0]}</h3><p>${item[1]}</p><button class="btn btn-secondary" type="button" data-modal="backstage">View Backstage</button>`;
      dom.backstageGrid.appendChild(card);
    });

    lookbook.forEach((item, idx) => {
      const card = el('button', 'lookbook-card reveal', `<span>${String(idx + 1).padStart(2, '0')}</span><strong>${item[0]}</strong><p>${item[1]}</p>`);
      card.type = 'button';
      card.addEventListener('click', () => openModal('lookbook', item[0], item[1], [{ label: 'Open Lookbook', action: () => openModal('lookbook', item[0], item[1]) }]));
      dom.lookbookStack.appendChild(card);
    });
  }

  function openModal(kind, title, copy, actions = []) {
    dom.modalKicker.textContent = kind === 'lookbook' ? 'Open Lookbook' : 'Preview';
    dom.modalTitle.textContent = title || 'Fashion Preview';
    dom.modalCopy.textContent = copy || 'A premium detail preview.';
    dom.modalActions.innerHTML = '';
    actions.forEach((action) => {
      const btn = el('button', 'btn btn-primary', action.label);
      btn.type = 'button';
      btn.addEventListener('click', action.action);
      dom.modalActions.appendChild(btn);
    });
    dom.modal.classList.add('open');
    dom.modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    dom.modal.classList.remove('open');
    dom.modal.setAttribute('aria-hidden', 'true');
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090d);
    scene.fog = new THREE.Fog(0x09090d, 8, 28);

    camera = new THREE.PerspectiveCamera(42, dom.canvas.clientWidth / dom.canvas.clientHeight, 0.1, 80);
    camera.position.set(0, 3.8, 12);

    renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(dom.canvas.clientWidth, dom.canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const ambient = new THREE.AmbientLight(0xf6ede2, 1.4);
    scene.add(ambient);

    const spotA = new THREE.SpotLight(0xe6c79c, 3, 32, Math.PI / 7, 0.4);
    spotA.position.set(0, 10, 6);
    scene.add(spotA);

    const spotB = new THREE.SpotLight(0xc7d0ff, 1.6, 32, Math.PI / 10, 0.4);
    spotB.position.set(-4, 8, -6);
    scene.add(spotB);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.22, metalness: 0.18 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.15;
    scene.add(floor);

    runway = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0xe8e0d6, roughness: 0.14, metalness: 0.28, emissive: 0x1b120a, emissiveIntensity: 0.08 })
    );
    runway.position.set(0, -0.98, -2);
    scene.add(runway);

    const borderMat = new THREE.MeshStandardMaterial({ color: 0xc9ad76, roughness: 0.2, metalness: 0.7 });
    [-1.72, 1.72].forEach((x) => {
      const border = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 24), borderMat);
      border.position.set(x, -0.92, -2);
      scene.add(border);
    });

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(28, 10, 1),
      new THREE.MeshStandardMaterial({ color: 0x101016, roughness: 0.95, metalness: 0.04 })
    );
    backWall.position.set(0, 3.6, -18);
    scene.add(backWall);

    const vipPodium = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 3), new THREE.MeshStandardMaterial({ color: 0x2b2331, roughness: 0.45, metalness: 0.1 }));
    vipPodium.position.set(0, -0.5, 8);
    scene.add(vipPodium);

    for (let i = 0; i < 8; i += 1) {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 10), new THREE.MeshStandardMaterial({ color: 0x88838f, roughness: 0.25, metalness: 0.6 }));
      stand.position.set((i % 2 ? 2.8 : -2.8), -0.7, -12 + i * 2.4);
      scene.add(stand);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1, 0.25, 0.5), new THREE.MeshStandardMaterial({ color: 0x1c1b20, roughness: 0.5 }));
      seat.position.set((i % 2 ? 3.3 : -3.3), -0.25, -12 + i * 2.4);
      scene.add(seat);
    }

    const garmentData = [
      { name: 'Main Runway', x: 0, z: -1.5, color: 0xe6c79c },
      { name: 'New Collection', x: -1.3, z: 1.5, color: 0xb4b8d9 },
      { name: 'Featured Look', x: 1.3, z: 3.5, color: 0xf1e2d1 },
      { name: 'Fabric Details', x: -1.6, z: 6, color: 0xd4a8ac },
      { name: 'Accessories', x: 1.6, z: 8.5, color: 0xb8a074 },
      { name: 'Backstage', x: -1.5, z: 12, color: 0x6e6a7d },
      { name: 'VIP Viewing', x: 1.6, z: 15, color: 0xffdca8 },
      { name: 'Book Private Viewing', x: 0, z: 18, color: 0xa6d3c2 }
    ];

    garmentData.forEach((item) => {
      const group = new THREE.Group();
      group.position.set(item.x, -0.15, item.z);
      const core = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.2, 8, 16), new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.38, metalness: 0.08, emissive: item.color, emissiveIntensity: 0.08 }));
      core.position.y = 0.9;
      group.add(core);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0xefe6dd, roughness: 0.5 }));
      base.position.y = 0.05;
      group.add(base);
      group.userData = item.name;
      scene.add(group);
      garments.push(group);
    });

    const ringGeo = new THREE.TorusGeometry(0.35, 0.05, 10, 24);
    garments.forEach((group, idx) => {
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xe8d4af, transparent: true, opacity: 0.55 }));
      ring.position.set(group.position.x, 1.8, group.position.z);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { idx, name: group.userData };
      scene.add(ring);
      hotspots.push(ring);
    });

    const particle = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 180 }, () => [(Math.random() - 0.5) * 32, Math.random() * 12, (Math.random() - 0.5) * 28]).flat(), 3)),
      new THREE.PointsMaterial({ color: 0xffeed0, size: 0.05, transparent: true, opacity: 0.42 })
    );
    scene.add(particle);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    dom.canvas.addEventListener('pointermove', onPointerMove);
    dom.canvas.addEventListener('click', onPointerClick);
    window.addEventListener('resize', onResize);
  }

  function setHotspot(name, copy) {
    activeHotspot = name;
    dom.hotspotPanel.querySelector('.hotspot-title').textContent = name;
    dom.hotspotPanel.querySelector('.hotspot-copy').textContent = copy;
  }

  function onPointerMove(event) {
    const rect = dom.canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hotspots);
    if (hits.length) {
      const hit = hits[0].object.userData;
      setHotspot(hit.name, `Hover or click to focus ${hit.name.toLowerCase()}.`);
      dom.canvas.style.cursor = 'pointer';
    } else {
      dom.canvas.style.cursor = 'default';
    }
  }

  function onPointerClick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hotspots);
    if (hits.length) {
      const hit = hits[0].object.userData;
      scrollTarget = Math.max(0, hotspots.findIndex((h) => h.userData.name === hit.name) * 0.17);
      cameraFocus = scrollTarget;
      setHotspot(hit.name, `Focused on ${hit.name}. The canvas shifts to this showroom moment.`);
      openModal('preview', hit.name, `This hotspot opens the ${hit.name.toLowerCase()} moment inside the showroom.`, []);
    }
  }

  function onResize() {
    const width = dom.canvas.clientWidth;
    const height = dom.canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? window.scrollY / max : 0;
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    updateScroll();
    cameraFocus += (scrollTarget - cameraFocus) * 0.05;
    const t = cameraFocus;

    camera.position.x = Math.sin(t * Math.PI * 1.5) * 1.4;
    camera.position.y = 3.8 - t * 1.6 + Math.sin(performance.now() * 0.0006) * 0.08;
    camera.position.z = 12 - t * 28;
    camera.lookAt(0, 0.75, -2 - t * 18);

    runway.rotation.y = Math.sin(performance.now() * 0.0003) * 0.02;
    garments.forEach((g, idx) => {
      g.rotation.y = Math.sin(performance.now() * 0.0006 + idx) * 0.25;
      g.position.y = -0.15 + Math.sin(performance.now() * 0.001 + idx) * 0.04;
    });

    hotspots.forEach((h, idx) => {
      h.scale.setScalar(1 + Math.sin(performance.now() * 0.002 + idx) * 0.04);
    });

    renderer.render(scene, camera);
  }

  function bindRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.18 });
    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
  }

  function wireNav() {
    dom.navToggle.addEventListener('click', () => {
      const open = dom.nav.classList.toggle('open');
      dom.navToggle.setAttribute('aria-expanded', open);
    });
    dom.nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        dom.nav.classList.remove('open');
        dom.navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function modalWiring() {
    document.addEventListener('click', (event) => {
      const openBtn = event.target.closest('[data-modal]');
      if (openBtn) {
        const kind = openBtn.dataset.modal;
        if (kind === 'look') {
          const idx = Number(openBtn.dataset.index);
          const item = collections[idx];
          openModal('look', item.name, `${item.category} · ${item.material} · ${item.price}. ${item.look}`, []);
        } else if (kind === 'material') {
          openModal('material', openBtn.dataset.title, 'A zoomed texture study with luminous surface detail.', []);
        } else if (kind === 'accessory') {
          openModal('accessory', openBtn.dataset.title, 'A focused accessory preview with styling notes.', []);
        } else if (kind === 'experience') {
          openModal('experience', 'Explore Experience', 'Use this path to continue toward Booking and private viewing.', [{ label: 'Go to Booking', action: () => { closeModal(); document.getElementById('booking').scrollIntoView({ behavior: 'smooth' }); } }]);
        } else if (kind === 'backstage') {
          openModal('backstage', 'View Backstage', 'The backstage zone opens a closer look at fittings, lights and styling decisions.', []);
        } else if (kind === 'concept') {
          openModal('concept', 'Full Concept', 'The collection is built around architectural silhouettes, editorial contrast and luxury materials with modern minimalism.', []);
        }
      }
      if (event.target.matches('[data-close-modal]')) closeModal();
    });
    dom.modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    });
  }

  function formWiring() {
    dom.bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(dom.bookingForm);
      if (!data.get('name') || !data.get('email') || !data.get('date') || !data.get('interest') || !data.get('type') || !data.get('message')) return;
      dom.bookingStatus.textContent = `Confirmed: ${data.get('type')} on ${data.get('date')} for ${data.get('interest')}. We will contact ${data.get('email')} shortly.`;
      dom.bookingForm.reset();
    });

    dom.contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(dom.contactForm);
      if (!data.get('name') || !data.get('email') || !data.get('type') || !data.get('message')) return;
      dom.contactStatus.textContent = `Message received for ${data.get('type')}. Our fashion team will reply to ${data.get('email')}.`;
      dom.contactForm.reset();
    });

    dom.vipButton.addEventListener('click', () => {
      openModal('vip', 'Join VIP List', 'You are now on the private access list for early collection alerts, previews and invite-only events.', []);
    });
  }

  function resetView() {
    scrollTarget = 0;
    cameraFocus = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init() {
    buildCards();
    bindRevealObserver();
    wireNav();
    modalWiring();
    formWiring();
    initThree();
    animate();
    dom.cameraReset.addEventListener('click', resetView);
    document.querySelector('[data-focus="runway"]').addEventListener('click', () => {
      scrollTarget = 0.16;
      cameraFocus = 0.08;
      document.getElementById('runway').scrollIntoView({ behavior: 'smooth' });
    });
  }

  init();
})();

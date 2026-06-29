/*
 * seatingMap3d.js — Mapa 3D interactivo de coworking
 *
 * Formatos de video optimizados:
 * - Usar H.265 (HEVC) con bitrate 1–2 Mbps para previews de 8–15s a 720p.
 * - Generar versiones proxy (360p, 0.5 Mbps) para scrubbing rápido.
 * - Herramienta recomendada: FFmpeg con `-vf scale=640:-2 -c:v libx265 -crf 28`.
 *
 * Sincronización con backend real:
 * - Endpoint REST: GET /api/availability → devuelve array de { deskId, date, slots[] }.
 * - WebSocket opcional para cambios en tiempo real (ocupación, reservas).
 * - Cachear disponibilidad en IndexedDB con TTL de 60s.
 * - El JSON estático en assets/ simula los datos para este demo.
 */

(function () {
  'use strict';

  const METADATA_URL = 'assets/metadata.json';

  let scene, camera, renderer;
  let desks = [];
  let deskMeshes = [];
  let animFrameId = null;
  let clock = new THREE.Clock();
  let activeDeskIdx = -1;
  let isNight = false;
  let ambLight, dirLight, fillLight;
  let inactivityTimer = null;
  const INACTIVITY_TIMEOUT = 30000;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let analytics = { views: {}, reservations: 0, filters: {} };

  const dom = {
    sceneRoot: document.getElementById('scene-root'),
    deskPanel: document.getElementById('desk-panel'),
    deskPanelClose: document.getElementById('desk-panel-close'),
    deskVideo: document.getElementById('desk-video'),
    deskInfo: document.getElementById('desk-info'),
    deskCalendar: document.getElementById('desk-calendar'),
    deskReserveBtn: document.getElementById('desk-reserve-btn'),
    filterBtns: document.querySelectorAll('#filter-type .btn-filter'),
    amenityBtns: document.querySelectorAll('#filter-amenity .btn-filter'),
    toggleAvailable: document.getElementById('toggle-available'),
    toggleNight: document.getElementById('toggle-night'),
    analyticsBtn: document.getElementById('analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    analyticsClose: document.getElementById('analytics-close'),
    analyticsBody: document.getElementById('analytics-body'),
    reserveToast: document.getElementById('reserve-toast')
  };

  let currentFilter = 'all';
  let currentAmenity = 'all';
  let availableOnly = false;

  /* ---------- IndexedDB ---------- */
  function saveAnalytics() {
    try {
      const req = indexedDB.open('Coworking3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put({ k: 'analytics', v: analytics }); };
    } catch (e) { /* silent */ }
  }
  function loadAnalytics() {
    try {
      const req = indexedDB.open('Coworking3D', 1);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'k' }); };
      req.onsuccess = (e) => { const db = e.target.result; const tx = db.transaction('data', 'readonly'); const get = tx.objectStore('data').get('analytics'); get.onsuccess = () => { if (get.result) analytics = get.result.v; }; };
    } catch (e) { /* silent */ }
  }

  /* ---------- Scene ---------- */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ede8);

    const w = dom.sceneRoot.clientWidth, h = dom.sceneRoot.clientHeight;
    camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 20);
    camera.position.set(0, 0.6, 1.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dom.sceneRoot.appendChild(renderer.domElement);

    ambLight = new THREE.AmbientLight(0xfff8f0, 0.6);
    scene.add(ambLight);
    dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(3, 4, 2);
    dirLight.castShadow = true;
    scene.add(dirLight);
    fillLight = new THREE.DirectionalLight(0xccddcc, 0.2);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);

    /* Floor */
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.7 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    loadMetadata();
  }

  function loadMetadata() {
    fetch(METADATA_URL)
      .then(r => r.json())
      .then(data => {
        desks = data;
        buildDeskMeshes();
      })
      .catch(() => {
        desks = [];
        buildDeskMeshes();
      });
  }

  /* ---------- Desk meshes ---------- */
  function buildDeskMeshes() {
    deskMeshes.forEach(m => scene.remove(m));
    deskMeshes = [];

    desks.forEach((d, idx) => {
      const px = d.position[0], pz = d.position[2];
      const g = new THREE.Group();
      g.position.set(px, 0, pz);

      /* Shape based on type */
      let boxW = 0.15, boxD = 0.12, boxH = 0.02;
      if (d.type === 'dedicated') { boxW = 0.18; boxD = 0.14; boxH = 0.025; }
      if (d.type === 'private') { boxW = 0.22; boxD = 0.16; boxH = 0.03; }

      const color = d.available ? 0x3a5a4a : 0x8a7a6a;
      const deskMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.05 });
      const top = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, boxD), deskMat);
      top.position.y = boxH / 2;
      top.castShadow = true;
      g.add(top);

      /* Number label */
      const c = document.createElement('canvas');
      c.width = 64; c.height = 16;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, 64, 16);
      ctx.fillStyle = d.available ? '#fff' : '#aaa';
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.number, 32, 11);
      const lTex = new THREE.CanvasTexture(c);
      const lMat = new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false });
      const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(boxW * 0.7, 0.02), lMat);
      lMesh.position.set(0, boxH + 0.002, boxD / 2 + 0.005);
      g.add(lMesh);

      /* Screen (video preview) */
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = d.videoUrl;
      vid.loop = true;
      vid.muted = true;
      vid.preload = 'auto';
      vid.load();
      vid.play().catch(() => {});
      const vidTex = new THREE.VideoTexture(vid);
      vidTex.minFilter = THREE.LinearFilter;
      const sMat = new THREE.MeshBasicMaterial({ map: vidTex, transparent: true, opacity: 0.8 });
      const sW = boxW * 0.5, sH = boxD * 0.4;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(sW, sH), sMat);
      screen.position.set(0, boxH + 0.015, 0);
      g.add(screen);

      g.userData = { idx, origPos: [px, pz], boxW, boxD, boxH };
      scene.add(g);
      deskMeshes.push(g);
    });
  }

  /* ---------- Filter ---------- */
  function applyFilters() {
    deskMeshes.forEach((g, i) => {
      const d = desks[i];
      if (!d) return;
      let visible = true;
      if (currentFilter !== 'all' && d.type !== currentFilter) visible = false;
      if (visible && currentAmenity !== 'all' && !d.amenities.includes(currentAmenity)) visible = false;
      if (visible && availableOnly && !d.available) visible = false;
      g.visible = visible;
    });

    /* Staggered reorder */
    const visibleOnes = deskMeshes.filter(g => g.visible);
    if (!prefersReducedMotion) {
      gsap.to(deskMeshes.map(g => g.position), {
        y: (i) => gsap.utils.snap(0.02, deskMeshes[i].visible ? 0 : -0.15),
        duration: 0.4,
        stagger: { each: 0.03, from: 'start' },
        ease: 'power2.out'
      });
    } else {
      deskMeshes.forEach((g, i) => {
        g.position.y = g.visible ? 0 : -0.15;
      });
    }

    analytics.filters[currentFilter] = (analytics.filters[currentFilter] || 0) + 1;
    saveAnalytics();
  }

  dom.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  dom.amenityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.amenityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAmenity = btn.dataset.amenity;
      applyFilters();
    });
  });

  dom.toggleAvailable.addEventListener('change', () => {
    availableOnly = dom.toggleAvailable.checked;
    applyFilters();
  });

  /* ---------- Day/night toggle ---------- */
  dom.toggleNight.addEventListener('click', () => {
    isNight = !isNight;
    dom.toggleNight.textContent = isNight ? '☀️ Día' : '🌙 Noche';
    const targetAmb = isNight ? 0x222244 : 0xfff8f0;
    const targetInt = isNight ? 0.08 : 0.6;
    const dirInt = isNight ? 0.05 : 0.5;
    const dirColor = isNight ? 0x4466aa : 0xffffff;
    const bgColor = isNight ? 0x1a1c24 : 0xf0ede8;

    if (prefersReducedMotion) {
      ambLight.color.setHex(targetAmb); ambLight.intensity = targetInt;
      dirLight.intensity = dirInt; dirLight.color.setHex(dirColor);
      scene.background.setHex(bgColor);
    } else {
      gsap.to(ambLight.color, { r: (targetAmb >> 16 & 255) / 255, g: (targetAmb >> 8 & 255) / 255, b: (targetAmb & 255) / 255, duration: 0.8 });
      gsap.to(ambLight, { intensity: targetInt, duration: 0.8 });
      gsap.to(dirLight, { intensity: dirInt, duration: 0.8 });
      gsap.to(dirLight.color, { r: (dirColor >> 16 & 255) / 255, g: (dirColor >> 8 & 255) / 255, b: (dirColor & 255) / 255, duration: 0.8 });
      gsap.to(scene.background, { r: (bgColor >> 16 & 255) / 255, g: (bgColor >> 8 & 255) / 255, b: (bgColor & 255) / 255, duration: 0.8 });
    }
  });

  /* ---------- Click ---------- */
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const allMeshes = [];
    deskMeshes.forEach(g => { g.children.forEach(c => { if (c.isMesh) allMeshes.push(c); }); });
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length) {
      for (let i = 0; i < deskMeshes.length; i++) {
        for (let c = 0; c < deskMeshes[i].children.length; c++) {
          if (hits[0].object === deskMeshes[i].children[c]) {
            openDeskPanel(deskMeshes[i].userData.idx);
            return;
          }
        }
      }
    }
  });

  /* ---------- Desk panel ---------- */
  function openDeskPanel(idx) {
    activeDeskIdx = idx;
    const d = desks[idx];
    dom.deskVideo.src = d.videoUrl;
    dom.deskVideo.load();
    dom.deskVideo.play().catch(() => {});

    const amenityHtml = d.amenities.map(a => `<span class="amenity">${a}</span>`).join('');
    dom.deskInfo.innerHTML =
      `<div class="number">${d.number}</div><div class="type">${d.type} · ${d.capacity} ${d.capacity > 1 ? 'personas' : 'persona'}</div>` +
      `<div class="amenities">${amenityHtml}</div><div class="desc">${d.description}</div>` +
      `<div class="price">$${d.priceHour}/h · $${d.priceDay}/día</div>`;

    /* Calendar simulation */
    const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    dom.deskCalendar.innerHTML = days.map(dd => `<div class="day" style="font-weight:600;color:var(--text)">${dd}</div>`).join('');
    for (let i = 1; i <= 28; i++) {
      const avail = Math.random() > 0.3;
      dom.deskCalendar.innerHTML += `<div class="day ${avail ? 'available' : 'unavailable'}">${i}</div>`;
    }

    dom.deskReserveBtn.textContent = d.available ? '📅 Reservar' : '❌ No disponible';
    dom.deskReserveBtn.disabled = !d.available;
    dom.deskPanel.classList.remove('hidden');

    /* Fly-to */
    const target = new THREE.Vector3(d.position[0], 0.2, d.position[2] + 0.25);
    const lookAt = new THREE.Vector3(d.position[0], 0, d.position[2]);
    if (prefersReducedMotion) {
      camera.position.copy(target); camera.lookAt(lookAt);
    } else {
      gsap.to(camera.position, { x: target.x, y: target.y, z: target.z, duration: 0.8, ease: 'power2.out', onUpdate: () => camera.lookAt(lookAt), onComplete: () => camera.lookAt(lookAt) });
    }

    analytics.views[idx] = (analytics.views[idx] || 0) + 1;
    saveAnalytics();
  }

  dom.deskPanelClose.addEventListener('click', () => closeDeskPanel());
  dom.deskReserveBtn.addEventListener('click', () => {
    analytics.reservations++;
    saveAnalytics();
    dom.reserveToast.classList.remove('hidden');
    setTimeout(() => dom.reserveToast.classList.add('hidden'), 2500);
  });

  function closeDeskPanel() {
    dom.deskPanel.classList.add('hidden');
    dom.deskVideo.pause();
    dom.deskVideo.src = '';
  }

  /* ---------- Analytics ---------- */
  dom.analyticsBtn.addEventListener('click', () => {
    dom.analyticsPanel.classList.toggle('hidden');
    const totalViews = Object.values(analytics.views).reduce((a, b) => a + b, 0);
    const totalFilters = Object.values(analytics.filters).reduce((a, b) => a + b, 0);
    dom.analyticsBody.innerHTML =
      `<div class="analytics-row"><span>👁 Vistas</span><span>${totalViews}</span></div>` +
      `<div class="analytics-row"><span>📅 Reservas</span><span>${analytics.reservations}</span></div>` +
      `<div class="analytics-row"><span>🔍 Filtros</span><span>${totalFilters}</span></div>`;
  });
  dom.analyticsClose.addEventListener('click', () => dom.analyticsPanel.classList.add('hidden'));

  /* ---------- Inactivity: release textures ---------- */
  function resetInactivityTimer() {
    if (inactivityTimer) { clearTimeout(inactivityTimer); inactivityTimer = null; }
    inactivityTimer = setTimeout(() => {
      deskMeshes.forEach(g => {
        g.children.forEach(c => {
          if (c.isMesh && c.material && c.material.map && c.material.map instanceof THREE.VideoTexture) {
            c.material.map.dispose();
            c.material.map = null;
          }
        });
      });
    }, INACTIVITY_TIMEOUT);
  }

  document.addEventListener('mousemove', resetInactivityTimer);
  document.addEventListener('click', resetInactivityTimer);
  document.addEventListener('touchstart', resetInactivityTimer);

  /* ---------- Lifecycle ---------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    else if (!document.hidden && !animFrameId) animFrameId = requestAnimationFrame(animate);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animFrameId) animFrameId = requestAnimationFrame(animate);
      else if (!entry.isIntersecting && animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    });
  }, { threshold: 0.05 });

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = dom.sceneRoot.clientWidth / dom.sceneRoot.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.sceneRoot.clientWidth, dom.sceneRoot.clientHeight);
  });

  function animate() {
    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    initScene();
    loadAnalytics();
    resetInactivityTimer();
    observer.observe(dom.sceneRoot);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();

(function () {
  "use strict";

  const hotspots = [
    {
      label: "Modern Facade",
      detail: "Layered glass, bronze frames, and deep exterior shadow reveals.",
      position: new THREE.Vector3(-1.35, 1.68, 0.22)
    },
    {
      label: "Interior Design",
      detail: "Minimal living spaces with warm lighting and precise circulation.",
      position: new THREE.Vector3(0.42, 0.72, 0.72)
    },
    {
      label: "Lighting Concept",
      detail: "Cool exterior lines balance warmer interior scenes for dusk previews.",
      position: new THREE.Vector3(1.22, 1.28, -0.36)
    },
    {
      label: "Luxury Materials",
      detail: "Reflective floor, stone podiums, and soft metallic facade surfaces.",
      position: new THREE.Vector3(-0.3, 0.08, 1.18)
    }
  ];

  const projects = {
    villa: {
      title: "Luxury Villa Walkthrough",
      className: "villa-render",
      description: "A guided coastal residence experience with arrival sequence, double-height social areas, private suite framing, and dusk pool terrace lighting.",
      points: ["Exterior cinematic path with facade hotspot notes", "Interior material review for stone, wood, and warm metal finishes", "Sales-ready web presentation for private client previews"]
    },
    tower: {
      title: "Urban Residential Tower",
      className: "tower-render",
      description: "A vertical real estate walkthrough designed for investors, showing skyline presence, lobby arrival, amenity spaces, and premium residential views.",
      points: ["Facade rhythm and night-lighting scenarios", "Lobby and amenity route for high-value buyer tours", "Interactive tower overview for launch presentations"]
    },
    apartment: {
      title: "Modern Interior Apartment",
      className: "apartment-render",
      description: "A polished interior visualization flow where clients can compare spatial layouts, lighting moods, finishes, and furniture packages.",
      points: ["Minimal interior camera path with natural transitions", "Material and lighting approval support", "Compact web experience for design review meetings"]
    },
    commercial: {
      title: "Commercial Concept Space",
      className: "commercial-render",
      description: "A concept-driven commercial walkthrough for retail, hospitality, and mixed-use environments with brand moments and circulation clarity.",
      points: ["Flexible floor plate presentation", "Lighting and signage preview scenes", "Stakeholder-ready interaction for fast feedback"]
    }
  };

  const cameraPresets = {
    exterior: { pos: new THREE.Vector3(3.35, 2.2, 4.35), target: new THREE.Vector3(0.1, 0.75, 0) },
    interior: { pos: new THREE.Vector3(0.36, 0.9, 1.55), target: new THREE.Vector3(0.2, 0.7, -0.35) },
    plans: { pos: new THREE.Vector3(-2.4, 2.75, 2.7), target: new THREE.Vector3(0.15, 0.8, 0.05) }
  };

  const dom = {
    canvas: document.getElementById("arch-canvas"),
    hotspotLayer: document.getElementById("hotspot-layer"),
    tourStatus: document.getElementById("tour-status"),
    menuToggle: document.getElementById("menu-toggle"),
    siteNav: document.getElementById("site-nav"),
    modal: document.getElementById("project-modal"),
    modalClose: document.getElementById("modal-close"),
    modalTitle: document.getElementById("modal-title"),
    modalDescription: document.getElementById("modal-description"),
    modalList: document.getElementById("modal-list"),
    modalRender: document.getElementById("modal-render"),
    form: document.getElementById("contact-form"),
    formMessage: document.getElementById("form-message")
  };

  let scene;
  let camera;
  let renderer;
  let buildingGroup;
  let target = cameraPresets.exterior.target.clone();
  let desiredCamera = cameraPresets.exterior.pos.clone();
  let desiredTarget = cameraPresets.exterior.target.clone();
  let tourActive = false;
  let tourClock = 0;
  let isDragging = false;
  let lastPointer = { x: 0, y: 0 };
  let yaw = -0.66;
  let pitch = 0.42;
  let radius = 5.0;
  let rafId = 0;
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const hotspotMeshes = [];

  function createMaterial(color, options) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color,
      roughness: 0.42,
      metalness: 0.08
    }, options || {}));
  }

  function addBox(group, size, position, material, name) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name || "";
    group.add(mesh);
    return mesh;
  }

  function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05080a);
    scene.fog = new THREE.Fog(0x05080a, 5, 11);

    const rect = dom.canvas.getBoundingClientRect();
    camera = new THREE.PerspectiveCamera(42, rect.width / rect.height, 0.1, 80);
    camera.position.copy(cameraPresets.exterior.pos);

    renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, alpha: false });
    renderer.setSize(rect.width, rect.height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const ambient = new THREE.AmbientLight(0x8fb8d6, 0.32);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffd79d, 2.45);
    key.position.set(-3, 4.7, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    scene.add(key);

    const cool = new THREE.PointLight(0x49b8ff, 2.5, 7);
    cool.position.set(2.2, 0.7, 2.7);
    scene.add(cool);

    const warm = new THREE.PointLight(0xffb45f, 3.8, 5);
    warm.position.set(-0.5, 1.2, 0.8);
    scene.add(warm);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 14),
      new THREE.MeshStandardMaterial({
        color: 0x071018,
        metalness: 0.25,
        roughness: 0.18
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(16, 32, 0x1a74a6, 0x162530);
    grid.material.transparent = true;
    grid.material.opacity = 0.36;
    grid.position.y = 0.003;
    scene.add(grid);

    buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    createArchitecture(buildingGroup);
    createBlueprints();
    createHotspots();
    createHotspotDom();
  }

  function createArchitecture(group) {
    const concrete = createMaterial(0x38424a, { roughness: 0.58, metalness: 0.12 });
    const dark = createMaterial(0x10171d, { roughness: 0.36, metalness: 0.35 });
    const glass = createMaterial(0x7db7d8, {
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.42,
      emissive: 0x123a4c,
      emissiveIntensity: 0.14
    });
    const warmGlass = createMaterial(0xf5c37a, {
      roughness: 0.18,
      metalness: 0.05,
      transparent: true,
      opacity: 0.55,
      emissive: 0x5c3212,
      emissiveIntensity: 0.48
    });
    const stone = createMaterial(0x9a9283, { roughness: 0.68, metalness: 0.02 });
    const wood = createMaterial(0x6f4b32, { roughness: 0.46, metalness: 0.04 });

    addBox(group, new THREE.Vector3(3.9, 0.16, 2.4), new THREE.Vector3(-0.25, 0.08, 0), stone, "Luxury Materials");
    addBox(group, new THREE.Vector3(3.15, 0.92, 1.9), new THREE.Vector3(-0.42, 0.62, 0.05), glass, "Interior Design");
    addBox(group, new THREE.Vector3(3.38, 0.14, 2.08), new THREE.Vector3(-0.42, 1.15, 0.05), concrete);
    addBox(group, new THREE.Vector3(2.28, 1.15, 1.55), new THREE.Vector3(0.34, 1.78, -0.35), glass, "Modern Facade");
    addBox(group, new THREE.Vector3(2.52, 0.15, 1.78), new THREE.Vector3(0.34, 2.41, -0.35), concrete);
    addBox(group, new THREE.Vector3(0.16, 2.15, 0.18), new THREE.Vector3(-1.98, 1.28, 0.9), dark);
    addBox(group, new THREE.Vector3(0.16, 2.15, 0.18), new THREE.Vector3(1.78, 1.28, -1.15), dark);

    for (let i = 0; i < 7; i += 1) {
      addBox(group, new THREE.Vector3(0.035, 1.84, 1.98), new THREE.Vector3(-1.62 + i * 0.52, 1.24, 1.085), dark);
      addBox(group, new THREE.Vector3(0.035, 1.07, 1.56), new THREE.Vector3(-0.8 + i * 0.42, 1.84, -1.155), dark);
    }

    for (let i = 0; i < 5; i += 1) {
      addBox(group, new THREE.Vector3(0.34, 0.035, 1.18), new THREE.Vector3(-1.02 + i * 0.5, 0.44, 0.08), wood);
    }

    const lightStripMat = new THREE.MeshBasicMaterial({ color: 0xffc77d });
    addBox(group, new THREE.Vector3(2.6, 0.022, 0.035), new THREE.Vector3(-0.3, 1.08, 1.09), lightStripMat, "Lighting Concept");
    addBox(group, new THREE.Vector3(2.0, 0.022, 0.035), new THREE.Vector3(0.38, 2.32, -1.16), lightStripMat, "Lighting Concept");

    const blueLineMat = new THREE.MeshBasicMaterial({ color: 0x49b8ff, transparent: true, opacity: 0.9 });
    addBox(group, new THREE.Vector3(2.2, 0.018, 0.018), new THREE.Vector3(1.2, 0.22, 1.3), blueLineMat);
    addBox(group, new THREE.Vector3(0.018, 0.018, 2.2), new THREE.Vector3(2.28, 0.22, 0.22), blueLineMat);

    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(4.2, 2.8, 2.7));
    const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x49b8ff, transparent: true, opacity: 0.22 }));
    wire.position.set(-0.12, 1.38, 0);
    group.add(wire);
  }

  function createBlueprints() {
    const mat = new THREE.LineBasicMaterial({ color: 0x6fc8ff, transparent: true, opacity: 0.44 });
    const planGroup = new THREE.Group();
    planGroup.position.set(2.3, 1.8, -1.65);
    planGroup.rotation.y = -0.5;
    planGroup.name = "floating-plans";

    for (let floor = 0; floor < 2; floor += 1) {
      const y = floor * 0.72;
      const points = [
        new THREE.Vector3(-0.7, y, 0), new THREE.Vector3(0.7, y, 0),
        new THREE.Vector3(0.7, y + 0.42, 0), new THREE.Vector3(-0.7, y + 0.42, 0),
        new THREE.Vector3(-0.7, y, 0)
      ];
      planGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat));
      for (let i = 0; i < 4; i += 1) {
        const x = -0.45 + i * 0.28;
        planGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y + 0.05, 0),
          new THREE.Vector3(x, y + 0.37, 0)
        ]), mat));
      }
    }

    scene.add(planGroup);
  }

  function createHotspots() {
    const geometry = new THREE.SphereGeometry(0.055, 18, 18);
    hotspots.forEach((item) => {
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: 0xe1b866,
        transparent: true,
        opacity: 0.76
      }));
      mesh.position.copy(item.position);
      mesh.userData.hotspot = item;
      scene.add(mesh);
      hotspotMeshes.push(mesh);
    });
  }

  function createHotspotDom() {
    hotspots.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "hotspot";
      button.dataset.index = String(index);
      button.innerHTML = `<span>${item.label}<small>${item.detail}</small></span>`;
      button.addEventListener("click", () => {
        document.querySelectorAll(".hotspot").forEach((node) => node.classList.remove("active"));
        button.classList.add("active");
      });
      dom.hotspotLayer.appendChild(button);
    });
  }

  function setCameraPreset(name) {
    const preset = cameraPresets[name];
    if (!preset) return;
    tourActive = false;
    dom.tourStatus.textContent = `Viewing ${name}`;
    desiredCamera = preset.pos.clone();
    desiredTarget = preset.target.clone();
    document.querySelectorAll("[data-camera]").forEach((button) => {
      button.classList.toggle("active", button.dataset.camera === name);
    });
  }

  function startTour() {
    tourActive = true;
    tourClock = 0;
    dom.tourStatus.textContent = "Guided walkthrough active";
    document.querySelectorAll("[data-camera]").forEach((button) => button.classList.remove("active"));
    document.getElementById("walkthrough").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function updateGuidedTour(delta) {
    if (!tourActive) return;
    tourClock += delta * 0.115;
    const t = tourClock % 1;
    const angle = t * Math.PI * 2;
    const height = 1.25 + Math.sin(t * Math.PI * 2) * 0.42;
    const tourRadius = 3.15 + Math.sin(t * Math.PI * 4) * 0.38;
    desiredCamera.set(Math.cos(angle) * tourRadius, height, Math.sin(angle) * tourRadius);
    desiredTarget.set(Math.sin(angle * 0.7) * 0.18, 0.92, Math.cos(angle * 0.5) * 0.12);
  }

  function updateOrbitCamera() {
    if (tourActive) return;
    desiredCamera.set(
      target.x + Math.sin(yaw) * Math.cos(pitch) * radius,
      target.y + Math.sin(pitch) * radius,
      target.z + Math.cos(yaw) * Math.cos(pitch) * radius
    );
    desiredTarget.copy(target);
  }

  function updateHotspotPositions() {
    const rect = dom.canvas.getBoundingClientRect();
    hotspots.forEach((item, index) => {
      const mesh = hotspotMeshes[index];
      const screen = mesh.position.clone().project(camera);
      const x = (screen.x * 0.5 + 0.5) * rect.width;
      const y = (-screen.y * 0.5 + 0.5) * rect.height;
      const node = dom.hotspotLayer.querySelector(`[data-index="${index}"]`);
      const visible = screen.z < 1 && x > -40 && x < rect.width + 40 && y > -40 && y < rect.height + 40;
      node.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      node.style.display = visible ? "block" : "none";
    });
  }

  function animate(now) {
    const delta = Math.min(0.035, (now - (animate.last || now)) / 1000 || 0.016);
    animate.last = now;
    updateGuidedTour(delta);
    updateOrbitCamera();
    camera.position.lerp(desiredCamera, tourActive ? 0.038 : 0.08);
    target.lerp(desiredTarget, 0.08);
    camera.lookAt(target);
    if (buildingGroup) {
      buildingGroup.rotation.y = Math.sin(now * 0.00018) * 0.018;
    }
    hotspotMeshes.forEach((mesh, index) => {
      const pulse = 1 + Math.sin(now * 0.004 + index) * 0.16;
      mesh.scale.setScalar(pulse);
    });
    renderer.render(scene, camera);
    updateHotspotPositions();
    rafId = requestAnimationFrame(animate);
  }

  function resize() {
    if (!renderer || !camera) return;
    const rect = dom.canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    updateHotspotPositions();
  }

  function bindCanvasInteractions() {
    dom.canvas.addEventListener("pointerdown", (event) => {
      isDragging = true;
      tourActive = false;
      dom.tourStatus.textContent = "Manual exploration";
      lastPointer = { x: event.clientX, y: event.clientY };
      dom.canvas.setPointerCapture(event.pointerId);
    });

    dom.canvas.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      lastPointer = { x: event.clientX, y: event.clientY };
      yaw -= dx * 0.006;
      pitch = Math.max(0.12, Math.min(0.92, pitch + dy * 0.004));
    });

    dom.canvas.addEventListener("pointerup", (event) => {
      isDragging = false;
      if (dom.canvas.hasPointerCapture(event.pointerId)) dom.canvas.releasePointerCapture(event.pointerId);
    });

    dom.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      radius = Math.max(2.6, Math.min(6.2, radius + event.deltaY * 0.002));
    }, { passive: false });

    dom.canvas.addEventListener("click", (event) => {
      const rect = dom.canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hotspotMeshes)[0];
      if (hit) {
        const index = hotspotMeshes.indexOf(hit.object);
        const node = dom.hotspotLayer.querySelector(`[data-index="${index}"]`);
        node.click();
      }
    });
  }

  function bindNavigation() {
    document.querySelectorAll("[data-scroll]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetNode = document.querySelector(button.dataset.scroll);
        if (targetNode) targetNode.scrollIntoView({ behavior: "smooth" });
      });
    });

    document.querySelectorAll("[data-action='start-tour']").forEach((button) => {
      button.addEventListener("click", startTour);
    });

    document.querySelector("[data-action='reset-view']").addEventListener("click", () => {
      yaw = -0.66;
      pitch = 0.42;
      radius = 5.0;
      target.copy(cameraPresets.exterior.target);
      setCameraPreset("exterior");
    });

    document.querySelectorAll("[data-camera]").forEach((button) => {
      button.addEventListener("click", () => setCameraPreset(button.dataset.camera));
    });

    dom.menuToggle.addEventListener("click", () => {
      const isOpen = dom.siteNav.classList.toggle("open");
      document.body.classList.toggle("nav-open", isOpen);
      dom.menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    dom.siteNav.querySelectorAll("a, button").forEach((item) => {
      item.addEventListener("click", () => {
        dom.siteNav.classList.remove("open");
        document.body.classList.remove("nav-open");
        dom.menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function bindProjects() {
    document.querySelectorAll("[data-details]").forEach((button) => {
      button.addEventListener("click", () => {
        const project = projects[button.dataset.details];
        dom.modalTitle.textContent = project.title;
        dom.modalDescription.textContent = project.description;
        dom.modalList.innerHTML = project.points.map((point) => `<li>${point}</li>`).join("");
        dom.modalRender.className = `modal-render ${project.className}`;
        dom.modal.hidden = false;
      });
    });

    function closeModal() {
      dom.modal.hidden = true;
    }

    dom.modalClose.addEventListener("click", closeModal);
    dom.modal.addEventListener("click", (event) => {
      if (event.target === dom.modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  function bindForm() {
    dom.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = Array.from(dom.form.querySelectorAll("input, select, textarea"));
      let valid = true;
      fields.forEach((field) => {
        const fieldValid = field.checkValidity() && String(field.value).trim().length > 0;
        field.classList.toggle("field-error", !fieldValid);
        if (!fieldValid) valid = false;
      });

      if (!valid) {
        dom.formMessage.textContent = "Please complete every field with valid project information.";
        dom.formMessage.classList.add("error");
        return;
      }

      dom.formMessage.textContent = "Request received. Our visualization studio will contact you with a tailored walkthrough proposal.";
      dom.formMessage.classList.remove("error");
      dom.form.reset();
    });
  }

  function bindRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
  }

  function init() {
    if (!window.THREE) {
      dom.tourStatus.textContent = "3D runtime unavailable";
      return;
    }
    createScene();
    bindCanvasInteractions();
    bindNavigation();
    bindProjects();
    bindForm();
    bindRevealAnimations();
    resize();
    window.addEventListener("resize", resize);
    rafId = requestAnimationFrame(animate);
  }

  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  "use strict";

  const canvas = document.getElementById("architecture-canvas");
  const exploreButton = document.getElementById("explore-3d");
  const header = document.querySelector("[data-header]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || !window.THREE) {
    document.documentElement.classList.add("no-webgl");
    return;
  }

  const state = {
    explore: false,
    scrollProgress: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    mouseX: 0,
    mouseY: 0,
    focusIndex: null
  };

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070d, 0.055);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(7.8, 5.2, 10.6);
  camera.lookAt(0, 1.2, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const city = new THREE.Group();
  const blueprint = new THREE.Group();
  const lightRig = new THREE.Group();
  const focusTargets = [];
  scene.add(city, blueprint, lightRig);

  const materials = {
    concrete: new THREE.MeshStandardMaterial({ color: 0x607086, roughness: 0.52, metalness: 0.08 }),
    darkGlass: new THREE.MeshPhysicalMaterial({
      color: 0x14263b,
      roughness: 0.18,
      metalness: 0.18,
      transmission: 0.08,
      transparent: true,
      opacity: 0.86
    }),
    warmGlass: new THREE.MeshStandardMaterial({
      color: 0xd7b46a,
      roughness: 0.24,
      metalness: 0.22,
      emissive: 0x3a2a0c,
      emissiveIntensity: 0.22
    }),
    electric: new THREE.MeshStandardMaterial({
      color: 0x42b9ff,
      roughness: 0.2,
      metalness: 0.4,
      emissive: 0x115a91,
      emissiveIntensity: 0.7
    }),
    plane: new THREE.MeshStandardMaterial({
      color: 0x58d7c4,
      roughness: 0.44,
      metalness: 0.12,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    }),
    ground: new THREE.MeshStandardMaterial({ color: 0x0d1420, roughness: 0.78, metalness: 0.12 })
  };

  function addLights() {
    const ambient = new THREE.HemisphereLight(0x9ad7ff, 0x07090f, 0.74);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xf7d690, 2.2);
    key.position.set(-7, 11, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 36;
    key.shadow.camera.left = -13;
    key.shadow.camera.right = 13;
    key.shadow.camera.top = 13;
    key.shadow.camera.bottom = -13;
    lightRig.add(key);

    const blue = new THREE.PointLight(0x42b9ff, 6, 22);
    blue.position.set(5.5, 4.5, -2);
    lightRig.add(blue);

    const gold = new THREE.PointLight(0xd7b46a, 5, 20);
    gold.position.set(-4.8, 2.8, 3.8);
    lightRig.add(gold);
  }

  function addGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), materials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.04;
    ground.receiveShadow = true;
    city.add(ground);

    const grid = new THREE.GridHelper(34, 34, 0x42b9ff, 0x243447);
    grid.position.y = 0.012;
    grid.material.transparent = true;
    grid.material.opacity = 0.34;
    city.add(grid);

    const axisLine = new THREE.Mesh(
      new THREE.BoxGeometry(24, 0.018, 0.018),
      new THREE.MeshStandardMaterial({ color: 0xd7b46a, emissive: 0x4b3514, emissiveIntensity: 0.5 })
    );
    axisLine.position.set(0, 0.035, -1.8);
    city.add(axisLine);
  }

  function createBuilding({ x, z, width, depth, height, material, crown, focus }) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(body.geometry),
      new THREE.LineBasicMaterial({ color: 0x9ad7ff, transparent: true, opacity: 0.28 })
    );
    edge.position.copy(body.position);
    group.add(edge);

    const floors = Math.max(3, Math.floor(height / 0.48));
    for (let i = 1; i < floors; i += 1) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.014, 0.012, depth + 0.018),
        new THREE.MeshStandardMaterial({
          color: i % 3 === 0 ? 0xd7b46a : 0x42b9ff,
          emissive: i % 3 === 0 ? 0x5c3f12 : 0x0d5b88,
          emissiveIntensity: 0.42
        })
      );
      strip.position.y = i * (height / floors);
      group.add(strip);
    }

    if (crown) {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(width * 0.72, height * 0.2, 4), materials.electric);
      cap.position.y = height + height * 0.1;
      cap.rotation.y = Math.PI / 4;
      cap.castShadow = true;
      group.add(cap);
    }

    if (focus) {
      focusTargets.push({ group, x, z, height });
    }

    city.add(group);
    return group;
  }

  function addBuildings() {
    const specs = [
      { x: -4.5, z: -1.4, width: 1.2, depth: 1.2, height: 4.7, material: materials.darkGlass, crown: true, focus: true },
      { x: -2.7, z: 1.2, width: 1.6, depth: 0.9, height: 2.7, material: materials.concrete },
      { x: -1.1, z: -2.8, width: 1.1, depth: 1.5, height: 3.6, material: materials.warmGlass },
      { x: 1.1, z: -1.7, width: 1.8, depth: 1.3, height: 5.8, material: materials.darkGlass, crown: true, focus: true },
      { x: 2.9, z: 1.1, width: 2.1, depth: 1.2, height: 2.3, material: materials.concrete, focus: true },
      { x: 4.8, z: -2.7, width: 1.1, depth: 1.1, height: 3.2, material: materials.warmGlass },
      { x: 5.5, z: 1.4, width: 0.9, depth: 1.4, height: 4.1, material: materials.darkGlass },
      { x: -5.9, z: 2.7, width: 1.4, depth: 1, height: 2.1, material: materials.concrete }
    ];

    specs.forEach(createBuilding);

    for (let i = 0; i < 18; i += 1) {
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.025, 0.42 + (i % 3) * 0.15),
        new THREE.MeshStandardMaterial({ color: 0x42b9ff, emissive: 0x0b4d74, emissiveIntensity: 0.65 })
      );
      road.position.set(-7 + i * 0.82, 0.055, i % 2 === 0 ? 3.9 : -4.2);
      city.add(road);
    }
  }

  function addBlueprints() {
    const planeA = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 4.8, 8, 4), materials.plane);
    planeA.position.set(0.4, 3.5, -5.6);
    planeA.rotation.x = -0.15;
    blueprint.add(planeA);

    const planeB = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.4, 5, 3), materials.plane.clone());
    planeB.material.opacity = 0.12;
    planeB.position.set(-5.8, 2.2, 0.8);
    planeB.rotation.y = Math.PI / 2.7;
    blueprint.add(planeB);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x58d7c4, transparent: true, opacity: 0.52 });
    for (let i = 0; i < 9; i += 1) {
      const y = 2.3 + i * 0.22;
      const points = [
        new THREE.Vector3(-3.2, y, -5.58),
        new THREE.Vector3(3.4, y + Math.sin(i) * 0.08, -5.58)
      ];
      blueprint.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial));
    }

    for (let i = 0; i < 7; i += 1) {
      const x = -3 + i * 1.0;
      const points = [
        new THREE.Vector3(x, 2.1, -5.56),
        new THREE.Vector3(x + Math.sin(i) * 0.12, 4.7, -5.56)
      ];
      blueprint.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial));
    }
  }

  function addParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 360; i += 1) {
      positions.push((Math.random() - 0.5) * 28, Math.random() * 9 + 0.8, (Math.random() - 0.5) * 22);
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x9ad7ff,
      size: 0.032,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
  }

  function scrollToTarget(selector) {
    const target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  function updateScrollProgress() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    state.scrollProgress = window.scrollY / max;
    header?.classList.toggle("is-scrolled", window.scrollY > 16);
  }

  function focusProject(index) {
    state.focusIndex = index;
    const target = focusTargets[index];
    if (!target) return;
    state.explore = true;
    scrollToTarget("#proyectos");
  }

  function bindInteractions() {
    document.querySelectorAll("[data-scroll-target]").forEach((button) => {
      button.addEventListener("click", () => scrollToTarget(button.dataset.scrollTarget));
    });

    document.querySelectorAll("[data-focus-project]").forEach((card) => {
      card.addEventListener("click", () => focusProject(Number(card.dataset.focusProject)));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") focusProject(Number(card.dataset.focusProject));
      });
      card.tabIndex = 0;
      card.setAttribute("role", "button");
    });

    exploreButton?.addEventListener("click", () => {
      state.explore = !state.explore;
      exploreButton.textContent = state.explore ? "Pausar escena 3D" : "Explorar en 3D";
      canvas.animate(
        [
          { filter: "saturate(1) brightness(1)" },
          { filter: "saturate(1.28) brightness(1.16)" },
          { filter: "saturate(1) brightness(1)" }
        ],
        { duration: 900, easing: "ease-out" }
      );
    });

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("pointermove", (event) => {
      state.targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      state.targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    });

    document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const button = event.currentTarget.querySelector("button");
      const original = button.textContent;
      button.textContent = "Propuesta solicitada";
      setTimeout(() => {
        button.textContent = original;
      }, 1800);
    });
  }

  function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });

    reveals.forEach((el) => observer.observe(el));
  }

  function animate() {
    const time = performance.now() * 0.001;
    state.mouseX += (state.targetMouseX - state.mouseX) * 0.045;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.045;

    const rotateBoost = state.explore && !prefersReducedMotion ? 0.42 : 0.09;
    city.rotation.y += 0.0025 * rotateBoost;
    city.rotation.x = state.mouseY * 0.025;
    city.position.y = Math.sin(time * 0.6) * 0.035;

    blueprint.rotation.y = Math.sin(time * 0.22) * 0.08 + state.mouseX * 0.035;
    blueprint.position.y = Math.sin(time * 0.55) * 0.08;
    lightRig.rotation.y = Math.sin(time * 0.3) * 0.22;

    const scrollLift = state.scrollProgress * 2.6;
    const target = state.focusIndex !== null ? focusTargets[state.focusIndex] : null;
    const baseX = target ? target.x + 3.4 : 7.8 - state.scrollProgress * 3.2;
    const baseY = target ? Math.min(6.8, target.height + 2.1) : 5.2 - scrollLift * 0.58;
    const baseZ = target ? target.z + 5.6 : 10.6 - scrollLift;

    camera.position.x += (baseX + state.mouseX * 0.42 - camera.position.x) * 0.035;
    camera.position.y += (baseY - state.mouseY * 0.24 - camera.position.y) * 0.035;
    camera.position.z += (baseZ - camera.position.z) * 0.035;
    camera.lookAt(target ? new THREE.Vector3(target.x, target.height * 0.45, target.z) : new THREE.Vector3(0, 1.6, -0.3));

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  addLights();
  addGround();
  addBuildings();
  addBlueprints();
  addParticles();
  bindInteractions();
  revealOnScroll();
  updateScrollProgress();
  animate();
})();

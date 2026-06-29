const root = document.documentElement;
const body = document.body;
const cursor = document.querySelector(".cursor");
const hero = document.querySelector(".hero");
const interactive = document.querySelectorAll("a, button");
const reveals = document.querySelectorAll(".reveal");
const menuButton = document.querySelector(".menu-toggle");
const header = document.querySelector(".site-header");
const projects = document.querySelectorAll(".project");
const workSection = document.querySelector(".work");
const motionToggle = document.querySelector(".motion-toggle");
const motionLabel = document.querySelector(".motion-label");
const touchParticles = document.querySelector(".touch-particles");
const speedTrails = document.querySelector(".speed-trails");
const morph = document.querySelector(".project-morph");
const morphMedia = document.querySelector(".morph-media");
const morphTitle = document.querySelector("#morph-title");
const morphIndex = document.querySelector(".morph-index");
const morphType = document.querySelector(".morph-type");
const morphDescription = document.querySelector(".morph-description");
const morphClose = document.querySelector(".morph-close");
const ghostButtons = document.querySelectorAll(".ghost");
const pageMain = document.querySelector("main");

let activated = false;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let touchX = 0;
let touchY = 0;
let tiltEnabled = false;
let lastTouch = null;
let particleStamp = 0;
let activeProject = null;

function activateExperience() {
  if (activated) return;
  activated = true;
  body.classList.add("is-active");
}

window.addEventListener("wheel", activateExperience, { passive: true, once: true });
window.addEventListener("touchmove", activateExperience, { passive: true, once: true });
window.addEventListener("keydown", activateExperience, { once: true });

setTimeout(activateExperience, 2400);

window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 4) activateExperience();
    body.classList.toggle("has-scrolled", window.scrollY > 50);

    const heroProgress = Math.min(1, window.scrollY / Math.max(hero.offsetHeight, 1));
    root.style.setProperty("--scroll-progress", heroProgress.toFixed(3));
    updateMobileProjectDepth();
  },
  { passive: true },
);

window.addEventListener(
  "pointermove",
  (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetY = (event.clientY / window.innerHeight - 0.5) * 2;
  },
  { passive: true },
);

function renderPointerMotion() {
  currentX += (targetX - currentX) * 0.06;
  currentY += (targetY - currentY) * 0.06;
  root.style.setProperty("--mx", currentX.toFixed(3));
  root.style.setProperty("--my", currentY.toFixed(3));
  requestAnimationFrame(renderPointerMotion);
}

renderPointerMotion();

function updateMobileProjectDepth() {
  if (window.innerWidth > 900) return;

  const viewportCenter = window.innerHeight / 2;
  projects.forEach((project) => {
    const rect = project.getBoundingClientRect();
    const projectCenter = rect.top + rect.height / 2;
    const progress = Math.max(-1, Math.min(1, (projectCenter - viewportCenter) / window.innerHeight));
    project.style.setProperty("--project-progress", progress.toFixed(3));
  });
}

function setTouchPosition(clientX, clientY) {
  touchX = (clientX / window.innerWidth - 0.5) * 2;
  touchY = (clientY / window.innerHeight - 0.5) * 2;
  root.style.setProperty("--touch-x", touchX.toFixed(3));
  root.style.setProperty("--touch-y", touchY.toFixed(3));
}

workSection.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    setTouchPosition(touch.clientX, touch.clientY);
    createTouchParticles(touch.clientX, touch.clientY);
    createSpeedEffect(touch.clientX, touch.clientY);
  },
  { passive: true },
);

workSection.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    lastTouch = { x: touch.clientX, y: touch.clientY, time: performance.now() };
    createTouchParticles(touch.clientX, touch.clientY, true);
  },
  { passive: true },
);

workSection.addEventListener(
  "pointermove",
  (event) => {
    if (window.innerWidth > 900) return;
    setTouchPosition(event.clientX, event.clientY);
    createTouchParticles(event.clientX, event.clientY);
    createSpeedEffect(event.clientX, event.clientY);
  },
  { passive: true },
);

workSection.addEventListener(
  "pointerdown",
  (event) => {
    if (window.innerWidth > 900) return;
    lastTouch = { x: event.clientX, y: event.clientY, time: performance.now() };
    createTouchParticles(event.clientX, event.clientY, true);
  },
  { passive: true },
);

function createTouchParticles(x, y, force = false) {
  if (window.innerWidth > 900 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const now = performance.now();
  if (!force && now - particleStamp < 55) return;
  particleStamp = now;

  const count = force ? 12 : 4;
  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("i");
    const angle = Math.random() * Math.PI * 2;
    const distance = 24 + Math.random() * 54;
    const burst = 12 + Math.random() * 28;
    particle.className = "touch-particle";
    particle.style.setProperty("--x", `${x}px`);
    particle.style.setProperty("--y", `${y}px`);
    particle.style.setProperty("--from-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--from-y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--burst-x", `${Math.cos(angle + Math.PI) * burst}px`);
    particle.style.setProperty("--burst-y", `${Math.sin(angle + Math.PI) * burst}px`);
    particle.style.setProperty("--size", `${1 + Math.random() * 3}px`);
    particle.style.setProperty("--particle-color", index % 3 === 0 ? "#7048ff" : "#21e5ff");
    touchParticles.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }
}

function createSpeedEffect(x, y) {
  const now = performance.now();
  if (!lastTouch) {
    lastTouch = { x, y, time: now };
    return;
  }

  const elapsed = Math.max(16, now - lastTouch.time);
  const dx = x - lastTouch.x;
  const dy = y - lastTouch.y;
  const velocity = Math.hypot(dx, dy) / elapsed;
  lastTouch = { x, y, time: now };
  if (velocity < 0.75 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const trail = document.createElement("i");
  trail.className = "speed-trail";
  trail.style.setProperty("--x", `${x - dx}px`);
  trail.style.setProperty("--y", `${y - dy}px`);
  trail.style.setProperty("--angle", `${Math.atan2(dy, dx)}rad`);
  trail.style.setProperty("--trail-width", `${Math.min(150, 40 + velocity * 55)}px`);
  trail.style.setProperty("--travel", `${Math.min(70, velocity * 28)}px`);
  speedTrails.appendChild(trail);
  trail.addEventListener("animationend", () => trail.remove(), { once: true });
}

function openProject(project) {
  if (window.innerWidth > 900) return;
  const visual = project.querySelector(".project-visual");
  const rect = visual.getBoundingClientRect();
  activeProject = project;

  morph.style.setProperty("--morph-left", `${rect.left}px`);
  morph.style.setProperty("--morph-top", `${rect.top}px`);
  morph.style.setProperty("--morph-width", `${rect.width}px`);
  morph.style.setProperty("--morph-height", `${rect.height}px`);
  morphMedia.innerHTML = visual.outerHTML;
  morphIndex.textContent = `PROYECTO / ${project.dataset.project}`;
  morphTitle.textContent = project.querySelector(".project-caption h3").textContent;
  morphType.textContent = project.querySelector(".project-caption span").textContent;
  morphDescription.textContent =
    project.dataset.project === "01"
      ? "Una experiencia arquitectónica digital donde precisión, atmósfera y movimiento convierten cada espacio en una historia."
      : "Un producto móvil financiero que transforma información compleja en una interfaz clara, táctil y profundamente visual.";

  morph.setAttribute("aria-hidden", "false");
  morph.classList.add("is-mounted");
  body.classList.add("morph-open");
  pageMain.inert = true;
  header.inert = true;
  requestAnimationFrame(() => requestAnimationFrame(() => morph.classList.add("is-open")));
  setTimeout(() => morphClose.focus(), 650);
}

function closeProject() {
  if (!activeProject) return;
  const rect = activeProject.querySelector(".project-visual").getBoundingClientRect();
  morph.style.setProperty("--morph-left", `${rect.left}px`);
  morph.style.setProperty("--morph-top", `${rect.top}px`);
  morph.style.setProperty("--morph-width", `${rect.width}px`);
  morph.style.setProperty("--morph-height", `${rect.height}px`);
  morph.classList.remove("is-open");
  body.classList.remove("morph-open");
  pageMain.inert = false;
  header.inert = false;

  setTimeout(() => {
    morph.classList.remove("is-mounted");
    morph.setAttribute("aria-hidden", "true");
    morphMedia.innerHTML = "";
    activeProject.focus({ preventScroll: true });
    activeProject = null;
  }, 640);
}

projects.forEach((project) => {
  project.addEventListener("click", (event) => {
    if (window.innerWidth > 900) return;
    event.preventDefault();
    openProject(project);
  });
});

morphClose.addEventListener("click", closeProject);
morph.addEventListener("click", (event) => {
  if (event.target === morph) closeProject();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeProject) closeProject();
  if (event.key !== "Tab" || !activeProject) return;

  const focusable = [...morph.querySelectorAll("button, a[href]")];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

ghostButtons.forEach((button) => {
  let holdFrame = 0;
  let holdStart = 0;
  let charged = false;

  const resetHold = () => {
    cancelAnimationFrame(holdFrame);
    button.style.setProperty("--hold-progress", "0");
    setTimeout(() => button.classList.remove("is-charged"), 240);
  };

  const updateHold = (time) => {
    const progress = Math.min(1, (time - holdStart) / 900);
    button.style.setProperty("--hold-progress", progress.toFixed(3));
    if (progress >= 1) {
      charged = true;
      button.classList.add("is-charged");
      navigator.vibrate?.(18);
      return;
    }
    holdFrame = requestAnimationFrame(updateHold);
  };

  button.addEventListener("pointerdown", () => {
    if (window.innerWidth > 900) return;
    charged = false;
    holdStart = performance.now();
    holdFrame = requestAnimationFrame(updateHold);
  });
  button.addEventListener("pointerup", resetHold);
  button.addEventListener("pointercancel", resetHold);
  button.addEventListener("pointerleave", resetHold);
  button.addEventListener("click", (event) => {
    if (!charged) return;
    event.preventDefault();
    charged = false;
  });
});

function handleOrientation(event) {
  if (!tiltEnabled) return;
  const x = Math.max(-1, Math.min(1, (event.gamma || 0) / 28));
  const y = Math.max(-1, Math.min(1, (event.beta || 0) / 36));
  root.style.setProperty("--tilt-x", x.toFixed(3));
  root.style.setProperty("--tilt-y", y.toFixed(3));
}

async function enableTilt() {
  if (!("DeviceOrientationEvent" in window)) {
    motionLabel.textContent = "Inclinación no disponible";
    motionToggle.disabled = true;
    return;
  }

  try {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") return;
    }

    tiltEnabled = true;
    motionToggle.setAttribute("aria-pressed", "true");
    motionLabel.textContent = "Inclinación activa";
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
  } catch {
    motionLabel.textContent = "Inclinación no disponible";
  }
}

motionToggle.addEventListener("click", enableTilt);
window.addEventListener("resize", updateMobileProjectDepth, { passive: true });
updateMobileProjectDepth();

interactive.forEach((element) => {
  element.addEventListener("mouseenter", () => cursor.classList.add("is-link"));
  element.addEventListener("mouseleave", () => cursor.classList.remove("is-link"));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

reveals.forEach((element) => revealObserver.observe(element));

menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  header.classList.toggle("menu-open", !expanded);
});

document.querySelectorAll(".desktop-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    header.classList.remove("menu-open");
  });
});

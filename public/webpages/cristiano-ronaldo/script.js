const body = document.body;
const hero = document.querySelector(".hero");
const video = document.querySelector(".hero-video");
const activateButton = document.querySelector("#activate");
const canvas = document.querySelector(".particles");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activated = false;
let particles = [];
let lastScrollY = window.scrollY;
let currentScrollY = window.scrollY;
let scrollTicking = false;
let particleScrollBoost = 0;

function activateExperience() {
  if (activated && !video.paused) return;

  video.play().then(() => {
    activated = true;
    body.classList.add("activated");
    activateButton.querySelector("span").textContent = "Experiencia activa";
  }).catch(() => {
    activated = false;
    body.classList.remove("activated");
    activateButton.querySelector("span").textContent = "Reproducir secuencia";
  });
}

activateButton.addEventListener("click", activateExperience);

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function updateSectionMotion() {
  const viewportCenter = innerHeight * 0.5;
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const pageProgress = maxScroll > 0 ? currentScrollY / maxScroll : 0;
  const direction = currentScrollY >= lastScrollY ? 1 : -1;

  body.classList.toggle("scrolled", currentScrollY > 18);
  body.classList.toggle("is-scrolling-down", direction > 0);
  body.classList.toggle("is-scrolling-up", direction < 0);
  document.documentElement.style.setProperty("--page-progress", clamp(pageProgress).toFixed(4));

  if (currentScrollY > 8 && currentScrollY < hero.offsetHeight) activateExperience();

  const heroRange = Math.max(hero.offsetHeight - innerHeight, 1);
  const heroProgress = clamp(currentScrollY / heroRange);
  document.documentElement.style.setProperty("--hero-progress", heroProgress.toFixed(4));

  document.querySelectorAll(".section").forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height * 0.5;
    const distance = sectionCenter - viewportCenter;
    const normalized = clamp(1 - Math.abs(distance) / (innerHeight + rect.height * 0.5));
    const shift = clamp(distance * -0.12, -92, 92);

    section.style.setProperty("--scroll-progress", normalized.toFixed(4));
    section.style.setProperty("--scroll-shift", `${shift.toFixed(2)}px`);
  });

  document.querySelectorAll(".gallery-grid figure").forEach((figure) => {
    const rect = figure.getBoundingClientRect();
    const distance = rect.top + rect.height * 0.5 - viewportCenter;
    figure.style.setProperty("--item-shift", `${clamp(distance * -0.1, -75, 75).toFixed(2)}px`);
  });

  particleScrollBoost = Math.min(Math.abs(currentScrollY - lastScrollY) * 0.08, 2.6);
  lastScrollY = currentScrollY;
  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  currentScrollY = window.scrollY;
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(updateSectionMotion);
  }
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
  });
});

window.addEventListener("pointermove", (event) => {
  const glow = document.querySelector(".cursor-glow");
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

function resizeCanvas() {
  const ratio = Math.min(devicePixelRatio, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(Math.floor(innerWidth / 24), 70);
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    radius: Math.random() * 1.4 + 0.25,
    velocity: Math.random() * 0.16 + 0.04,
    drift: (Math.random() - 0.5) * 0.08,
    alpha: Math.random() * 0.5 + 0.1,
    gold: Math.random() > 0.65,
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  if (!prefersReducedMotion.matches) {
    for (const particle of particles) {
      particle.y -= particle.velocity * ((activated ? 2.4 : 1) + particleScrollBoost);
      particle.x += particle.drift;
      if (particle.y < -5) {
        particle.y = innerHeight + 5;
        particle.x = Math.random() * innerWidth;
      }

      ctx.beginPath();
      ctx.fillStyle = particle.gold
        ? `rgba(214, 170, 69, ${particle.alpha})`
        : `rgba(255, 255, 255, ${particle.alpha * 0.45})`;
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  particleScrollBoost *= 0.93;
  requestAnimationFrame(drawParticles);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("visible", entry.isIntersecting);
    });
  },
  { threshold: 0.12, rootMargin: "-4% 0px -4% 0px" },
);

const revealItems = document.querySelectorAll(
  ".section-heading, .legacy-image, .year, blockquote, .performance-copy > *, .gallery-grid figure, footer > *",
);

revealItems.forEach((item, index) => {
  item.classList.add("scroll-reveal");
  item.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);

  if (item.matches(".legacy-image, .gallery-grid figure:nth-child(odd)")) {
    item.style.setProperty("--reveal-x", "-44px");
  }
  if (item.matches(".year, .gallery-grid figure:nth-child(even)")) {
    item.style.setProperty("--reveal-x", "44px");
  }
  revealObserver.observe(item);
});

resizeCanvas();
drawParticles();
updateSectionMotion();
window.addEventListener("resize", resizeCanvas);

const body = document.body;
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const canvas = document.querySelector("#particles");
const soundToggle = document.querySelector(".sound-toggle");
const navLinks = [...document.querySelectorAll(".site-header nav a")];
const sections = [...document.querySelectorAll("main section[id]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let awake = false;
let animationFrame = 0;
let particles = [];
let lastScrollY = window.scrollY;
let scrollDirection = "down";
let scrollTicking = false;

const wakeExperience = () => {
  if (awake) return;
  awake = true;
  body.classList.add("is-awake");
};

const updateScrollMotion = () => {
  const scrollY = window.scrollY;
  if (scrollY > 2 || Math.abs(scrollY - lastScrollY) > 1) wakeExperience();

  const delta = scrollY - lastScrollY;
  if (Math.abs(delta) > 2) {
    scrollDirection = delta > 0 ? "down" : "up";
    body.dataset.scrollDirection = scrollDirection;
  }

  header.classList.toggle("is-solid", scrollY > window.innerHeight * 0.7);

  const viewportMiddle = scrollY + window.innerHeight * 0.38;
  let current = "historia";

  for (const section of sections) {
    if (section.offsetTop <= viewportMiddle) current = section.id;
  }

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });

  if (!reducedMotion.matches) {
    const heroProgress = Math.min(
      1,
      Math.max(0, scrollY / Math.max(1, hero.offsetHeight - window.innerHeight)),
    );
    hero.style.setProperty("--hero-progress", heroProgress.toFixed(3));
    hero.style.setProperty("--hero-left-x", `${heroProgress * -8}vw`);
    hero.style.setProperty("--hero-right-x", `${heroProgress * 8}vw`);
    hero.style.setProperty("--hero-media-y", `${heroProgress * -18}px`);
    hero.style.setProperty("--hero-media-scale", (1 + heroProgress * 0.035).toFixed(3));
    hero.style.setProperty("--hero-copy-opacity", (1 - heroProgress * 0.82).toFixed(3));

    document.querySelectorAll("[data-scroll-section]").forEach((section) => {
      const bounds = section.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)),
      );
      section.style.setProperty("--section-progress", progress.toFixed(3));
      section.style.setProperty("--section-y", `${(progress - 0.5) * -160}px`);
      section.style.setProperty("--section-scale", (0.82 + progress * 0.3).toFixed(3));
      section.style.setProperty("--orbit-y", `${(progress - 0.5) * -90}px`);
      section.style.setProperty("--orbit-rotate", `${(progress - 0.5) * 24}deg`);
      section.style.setProperty("--background-y", `${18 + progress * 24}%`);
    });
  }

  lastScrollY = scrollY;
  scrollTicking = false;
};

const handleScroll = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateScrollMotion);
};

window.addEventListener("wheel", wakeExperience, { passive: true, once: true });
window.addEventListener("touchmove", wakeExperience, { passive: true, once: true });
window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "PageDown", " ", "End"].includes(event.key)) wakeExperience();
});
window.addEventListener("scroll", handleScroll, { passive: true });

const particleContext = canvas.getContext("2d");

const resizeCanvas = () => {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.clientWidth * ratio);
  canvas.height = Math.floor(canvas.clientHeight * ratio);
  particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(95, Math.floor(canvas.clientWidth / 15));
  particles = Array.from({ length: count }, () => ({
    x: canvas.clientWidth * (0.22 + Math.random() * 0.56),
    y: canvas.clientHeight * (0.18 + Math.random() * 0.7),
    originX: canvas.clientWidth * 0.5,
    originY: canvas.clientHeight * 0.5,
    speed: 0.16 + Math.random() * 0.42,
    radius: 0.35 + Math.random() * 1.35,
    alpha: 0.12 + Math.random() * 0.65,
    gold: Math.random() > 0.72,
  }));
};

const drawParticles = () => {
  particleContext.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  if (awake) {
    for (const particle of particles) {
      const dx = particle.x - particle.originX;
      const dy = particle.y - particle.originY;
      const distance = Math.hypot(dx, dy) || 1;

      particle.x += (dx / distance) * particle.speed;
      particle.y += (dy / distance) * particle.speed;

      if (
        particle.x < canvas.clientWidth * 0.12 ||
        particle.x > canvas.clientWidth * 0.88 ||
        particle.y < canvas.clientHeight * 0.08 ||
        particle.y > canvas.clientHeight * 0.94
      ) {
        const angle = Math.random() * Math.PI * 2;
        const startRadius = 25 + Math.random() * 120;
        particle.x = particle.originX + Math.cos(angle) * startRadius;
        particle.y = particle.originY + Math.sin(angle) * startRadius;
      }

      particleContext.beginPath();
      particleContext.fillStyle = particle.gold
        ? `rgba(232, 187, 86, ${particle.alpha})`
        : `rgba(119, 213, 255, ${particle.alpha})`;
      particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      particleContext.fill();
    }
  }

  animationFrame = window.requestAnimationFrame(drawParticles);
};

const createAtmosphere = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  const context = new AudioContext();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const oscillator = context.createOscillator();
  const overtone = context.createOscillator();
  const overtoneGain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 48;
  overtone.type = "sine";
  overtone.frequency.value = 96;
  filter.type = "lowpass";
  filter.frequency.value = 180;
  gain.gain.value = 0.018;
  overtoneGain.gain.value = 0.004;

  oscillator.connect(filter);
  overtone.connect(overtoneGain);
  overtoneGain.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  overtone.start();

  return { context, gain };
};

let atmosphere = null;

soundToggle.addEventListener("click", async () => {
  const nextState = soundToggle.getAttribute("aria-pressed") !== "true";
  soundToggle.setAttribute("aria-pressed", String(nextState));

  if (!atmosphere) atmosphere = createAtmosphere();
  if (!atmosphere) return;

  if (atmosphere.context.state === "suspended") {
    await atmosphere.context.resume();
  }

  atmosphere.gain.gain.setTargetAtTime(
    nextState ? 0.018 : 0,
    atmosphere.context.currentTime,
    0.08,
  );
});

const revealElements = [
  ...document.querySelectorAll(
    ".manifesto .section-label, .manifesto-copy > *, .year-rail article, " +
      ".legacy .section-label, .legacy-kicker, .legacy h2, .legacy > p:last-child, " +
      ".now .section-label, .now h2, .now .button, .now footer",
  ),
];

document.querySelectorAll(".manifesto, .legacy, .now").forEach((section) => {
  section.dataset.scrollSection = "";
});

revealElements.forEach((element, index) => {
  element.classList.add("scroll-reveal");
  element.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const element = entry.target;

      if (entry.isIntersecting) {
        element.style.setProperty(
          "--reveal-y",
          scrollDirection === "down" ? "56px" : "-56px",
        );
        window.requestAnimationFrame(() => element.classList.add("is-visible"));
        return;
      }

      const exitedAbove = entry.boundingClientRect.bottom <= 0;
      element.style.setProperty("--reveal-y", exitedAbove ? "-56px" : "56px");
      element.classList.remove("is-visible");
    });
  },
  {
    threshold: 0.18,
    rootMargin: "-6% 0px -8% 0px",
  },
);

revealElements.forEach((element) => {
  sectionObserver.observe(element);
});

resizeCanvas();
drawParticles();
updateScrollMotion();

window.addEventListener("resize", resizeCanvas);
window.addEventListener("beforeunload", () => window.cancelAnimationFrame(animationFrame));

hero.addEventListener("pointermove", (event) => {
  if (!awake || reducedMotion.matches) return;
  const x = (event.clientX / window.innerWidth - 0.5) * 8;
  const y = (event.clientY / window.innerHeight - 0.5) * 5;
  hero.style.setProperty("--pointer-x", `${x}px`);
  hero.style.setProperty("--pointer-y", `${y}px`);
});

const body = document.body;
const hero = document.querySelector(".hero");
const scrollCue = document.querySelector(".scroll-cue");
const soundToggle = document.querySelector(".sound-toggle");
const canvas = document.querySelector("#particles");
const context = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const storySections = [...document.querySelectorAll(".story")];

let awake = false;
let audioContext;
let ambientGain;
let particles = [];
let width = 0;
let height = 0;
let pixelRatio = 1;
let lastScrollY = window.scrollY;
let ticking = false;

body.classList.add("motion-ready", "scroll-down");

function wakeExperience() {
  if (awake) return;
  awake = true;
  body.classList.add("is-awake");
}

function updateScrollState() {
  const scrollY = window.scrollY;
  if (scrollY > 4) wakeExperience();

  const direction = scrollY > lastScrollY ? "down" : scrollY < lastScrollY ? "up" : null;
  if (direction) {
    body.classList.toggle("scroll-down", direction === "down");
    body.classList.toggle("scroll-up", direction === "up");
  }

  body.classList.toggle("is-scrolled", scrollY > 70);
  body.classList.toggle("hero-passed", scrollY > hero.offsetHeight - window.innerHeight * 0.45);
  lastScrollY = scrollY;

  storySections.forEach((section) => {
    const bounds = section.getBoundingClientRect();
    const travel = window.innerHeight + bounds.height;
    const progress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / travel));
    const isVisible = bounds.top < window.innerHeight * 0.84 && bounds.bottom > window.innerHeight * 0.16;
    const horizontalShift = (progress - 0.5) * (direction === "up" ? -180 : 180);
    const auroraY = (0.5 - progress) * window.innerHeight * 0.13;
    const numberY = (progress - 0.5) * window.innerHeight * 0.18;
    section.classList.toggle("is-visible", isVisible);
    section.style.setProperty("--story-progress", progress.toFixed(4));
    section.style.setProperty("--story-shift", `${horizontalShift.toFixed(1)}px`);
    section.style.setProperty("--story-y", `${auroraY.toFixed(1)}px`);
    section.style.setProperty("--number-y", `${numberY.toFixed(1)}px`);
  });

  ticking = false;
}

function requestScrollUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateScrollState);
}

scrollCue.addEventListener("click", () => {
  wakeExperience();
  window.scrollTo({ top: 36, behavior: reducedMotion.matches ? "auto" : "smooth" });
});

window.addEventListener("wheel", wakeExperience, { once: true, passive: true });
window.addEventListener("touchmove", wakeExperience, { once: true, passive: true });
window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "PageDown", " ", "End"].includes(event.key)) wakeExperience();
});
window.addEventListener("scroll", requestScrollUpdate, { passive: true });

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const count = Math.min(140, Math.floor((width * height) / 9000));
  particles = Array.from({ length: count }, createParticle);
}

function createParticle() {
  const palette = ["rgba(24,224,116,", "rgba(255,255,255,", "rgba(215,25,32,"];
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.25,
    speedX: (Math.random() - 0.5) * 0.22,
    speedY: -(Math.random() * 0.35 + 0.08),
    alpha: Math.random() * 0.5 + 0.08,
    color: palette[Math.floor(Math.random() * palette.length)],
    phase: Math.random() * Math.PI * 2,
  };
}

function drawParticles(time = 0) {
  context.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.phase += 0.012;

    if (particle.y < -10) particle.y = height + 10;
    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;

    const shimmer = Math.max(0.05, particle.alpha + Math.sin(particle.phase + time * 0.0005) * 0.12);
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `${particle.color}${shimmer})`;
    context.fill();
  });

  requestAnimationFrame(drawParticles);
}

function createAmbientSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  audioContext = new AudioContext();
  ambientGain = audioContext.createGain();
  ambientGain.gain.value = 0.025;
  ambientGain.connect(audioContext.destination);

  [43.65, 65.41].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = index ? 0.18 : 0.35;
    oscillator.connect(gain);
    gain.connect(ambientGain);
    oscillator.start();
  });
}

soundToggle.addEventListener("click", async () => {
  const isActive = soundToggle.getAttribute("aria-pressed") === "true";

  if (!audioContext) createAmbientSound();
  if (!audioContext) return;

  if (isActive) {
    await audioContext.suspend();
  } else {
    await audioContext.resume();
    wakeExperience();
  }

  soundToggle.setAttribute("aria-pressed", String(!isActive));
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
updateScrollState();

if (!reducedMotion.matches) {
  requestAnimationFrame(drawParticles);
}

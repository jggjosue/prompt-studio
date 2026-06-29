const body = document.body;
const heroScroll = document.querySelector(".hero-scroll");
const motionImage = document.querySelector(".hero-motion");
const activateButton = document.querySelector("[data-activate]");
const soundToggle = document.querySelector(".sound-toggle");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main > section[id]")];
const canvas = document.querySelector(".kinetic-field");
const context = canvas.getContext("2d", { alpha: true });

let activated = false;
let animationFrame = 0;
let particles = [];
let audioContext;
let masterGain;

function activateExperience() {
  if (activated) return;
  activated = true;
  motionImage.src = motionImage.dataset.src;
  body.classList.add("is-active");
}

function updateScrollState() {
  const heroHeight = Math.max(heroScroll.offsetHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);

  if (window.scrollY > 2) activateExperience();
  document.documentElement.style.setProperty("--hero-progress", progress.toFixed(3));

  const activeSection =
    sections
      .slice()
      .reverse()
      .find((section) => window.scrollY + window.innerHeight * 0.42 >= section.offsetTop) ??
    sections[0];

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.hash === `#${activeSection.id}`);
  });
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(90, Math.floor(window.innerWidth / 18));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    length: 8 + Math.random() * 40,
    speed: 0.45 + Math.random() * 1.8,
    alpha: 0.08 + Math.random() * 0.35,
    color: index % 7 === 0 ? "#f20d2e" : index % 3 === 0 ? "#ffffff" : "#087cff",
  }));
}

function drawParticles() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const boost = activated ? 3.4 : 0.65;

  particles.forEach((particle) => {
    particle.x += particle.speed * boost;
    particle.y -= particle.speed * boost * 0.08;

    if (particle.x > window.innerWidth + particle.length) {
      particle.x = -particle.length;
      particle.y = Math.random() * window.innerHeight;
    }

    context.beginPath();
    context.moveTo(particle.x, particle.y);
    context.lineTo(particle.x - particle.length * boost, particle.y + particle.length * 0.06);
    context.strokeStyle = particle.color;
    context.globalAlpha = particle.alpha * (activated ? 1 : 0.36);
    context.lineWidth = activated ? 1.25 : 0.6;
    context.stroke();
  });

  context.globalAlpha = 1;
  animationFrame = requestAnimationFrame(drawParticles);
}

function buildAudio() {
  if (audioContext) return;

  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.035;
  masterGain.connect(audioContext.destination);

  const noiseBuffer = audioContext.createBuffer(
    1,
    audioContext.sampleRate * 2,
    audioContext.sampleRate,
  );
  const noise = noiseBuffer.getChannelData(0);

  for (let index = 0; index < noise.length; index += 1) {
    noise[index] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  source.buffer = noiseBuffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.value = 620;
  filter.Q.value = 0.7;
  source.connect(filter).connect(masterGain);
  source.start();
}

activateButton.addEventListener("click", () => {
  activateExperience();
  window.scrollTo({ top: Math.min(window.innerHeight * 0.46, 420), behavior: "smooth" });
});

soundToggle.addEventListener("click", async () => {
  buildAudio();
  if (audioContext.state === "suspended") await audioContext.resume();

  const enabled = soundToggle.getAttribute("aria-pressed") !== "true";
  soundToggle.setAttribute("aria-pressed", String(enabled));
  soundToggle.setAttribute("aria-label", enabled ? "Silenciar ambiente" : "Activar sonido");
  masterGain.gain.setTargetAtTime(enabled ? 0.035 : 0, audioContext.currentTime, 0.08);
});

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", resizeCanvas);
window.addEventListener(
  "wheel",
  () => {
    activateExperience();
  },
  { passive: true, once: true },
);
window.addEventListener(
  "touchmove",
  () => {
    activateExperience();
  },
  { passive: true, once: true },
);

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  cancelAnimationFrame(animationFrame);
} else {
  resizeCanvas();
  drawParticles();
}

updateScrollState();

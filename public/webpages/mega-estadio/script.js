const body = document.body;
const heroTrack = document.querySelector(".hero-track");
const video = document.querySelector("#arena-video");
const canvas = document.querySelector("#particle-field");
const context = canvas.getContext("2d");

let activated = false;
let particles = [];
let animationFrame = 0;

function activateArena() {
  if (activated) return;
  activated = true;
  body.classList.add("is-active");
  video.play().catch(() => {
    // Muted autoplay can still be deferred by strict browser settings.
  });
}

function updateScrollState() {
  const heroHeight = heroTrack.offsetHeight - window.innerHeight;
  const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);

  if (window.scrollY > 6) activateArena();

  body.classList.toggle(
    "past-hero",
    window.scrollY > heroTrack.offsetHeight - window.innerHeight * 0.5,
  );
  document.documentElement.style.setProperty(
    "--hero-progress",
    `${progress * 100}%`,
  );
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const viewportWidth = document.documentElement.clientWidth;
  canvas.width = viewportWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${viewportWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const density = Math.min(Math.floor(viewportWidth / 18), 90);
  particles = Array.from({ length: density }, () => ({
    x: Math.random() * viewportWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.2 + 0.15,
    speed: Math.random() * 0.18 + 0.04,
    alpha: Math.random() * 0.45 + 0.08,
    cyan: Math.random() > 0.72,
  }));
}

function drawParticles() {
  const viewportWidth = document.documentElement.clientWidth;
  context.clearRect(0, 0, viewportWidth, window.innerHeight);

  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += Math.sin(particle.y * 0.008) * 0.05;

    if (particle.y < -4) {
      particle.y = window.innerHeight + 4;
      particle.x = Math.random() * viewportWidth;
    }

    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = particle.cyan
      ? `rgba(97, 231, 255, ${particle.alpha})`
      : `rgba(189, 143, 255, ${particle.alpha})`;
    context.fill();
  });

  animationFrame = requestAnimationFrame(drawParticles);
}

const videoObserver = new IntersectionObserver(
  ([entry]) => {
    if (!activated) return;
    if (entry.isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  },
  { threshold: 0.05 },
);

videoObserver.observe(heroTrack);
window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", resizeCanvas);
window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));

resizeCanvas();
drawParticles();
updateScrollState();

const hero = document.querySelector("#hero");
const canvas = document.querySelector("#particles");
const ctx = canvas.getContext("2d");
const playButton = document.querySelector("#playButton");
const progress = document.querySelector("#progress");
const timecode = document.querySelector("#timecode");
const soundToggle = document.querySelector(".sound-toggle");

const DURATION = 5000;
const IMPACT_AT = 0.62;
const particles = [];
let animationFrame = 0;
let startTime = 0;
let isPlaying = false;
let hasImpact = false;
let audioContext;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function easeOutExpo(value) {
  return value === 1 ? 1 : 1 - 2 ** (-10 * value);
}

function createBurst() {
  const originX = window.innerWidth * (window.innerWidth < 760 ? 0.66 : 0.68);
  const originY = window.innerHeight * 0.48;

  particles.length = 0;
  for (let index = 0; index < 190; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 12;
    const gold = Math.random() > 0.68;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed * (0.7 + Math.random()),
      vy: Math.sin(angle) * speed - Math.random() * 3,
      size: 0.7 + Math.random() * 3.2,
      life: 0.75 + Math.random() * 0.45,
      decay: 0.007 + Math.random() * 0.012,
      color: gold ? "243, 201, 105" : Math.random() > 0.45 ? "158, 225, 255" : "255, 255, 255",
      streak: Math.random() > 0.55,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.globalCompositeOperation = "lighter";

  particles.forEach((particle) => {
    if (particle.life <= 0) return;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.987;
    particle.vy = particle.vy * 0.987 + 0.035;
    particle.life -= particle.decay;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${particle.color}, ${Math.max(0, particle.life)})`;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = particle.size * 0.55;

    if (particle.streak) {
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particle.x - particle.vx * 2.4, particle.y - particle.vy * 2.4);
      ctx.stroke();
    } else {
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function playImpactSound() {
  if (!soundToggle || soundToggle.getAttribute("aria-pressed") !== "true") return;

  audioContext ||= new AudioContext();
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(84, now);
  oscillator.frequency.exponentialRampToValueAtTime(34, now + 0.75);
  filter.type = "lowpass";
  filter.frequency.value = 220;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.7, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

  oscillator.connect(filter).connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 1.15);
}

function setTimecode(elapsed) {
  const totalFrames = Math.min(300, Math.floor((elapsed / 1000) * 60));
  const seconds = Math.floor(totalFrames / 60);
  const frames = totalFrames % 60;
  timecode.textContent = `00:0${seconds}:${String(frames).padStart(2, "0")}`;
}

function animateScene(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  const rawProgress = Math.min(elapsed / DURATION, 1);
  const impactProgress = Math.max(0, (rawProgress - IMPACT_AT) / (1 - IMPACT_AT));
  const image = document.querySelector(".scene__image");
  const flash = document.querySelector(".scene__flash");
  const shockwave = document.querySelector(".scene__shockwave");
  const sun = document.querySelector(".scene__sun");

  hero.style.setProperty("--sequence-progress", rawProgress);
  progress.style.width = `${rawProgress * 100}%`;
  setTimecode(elapsed);

  if (rawProgress < IMPACT_AT) {
    const orbit = easeOutExpo(rawProgress / IMPACT_AT);
    image.style.transform = `translate3d(${orbit * -2.2}%, ${orbit * 0.8}%, 0) scale(${1.12 + orbit * 0.05}) rotate(${orbit * -0.35}deg)`;
  } else {
    if (!hasImpact) {
      hasImpact = true;
      createBurst();
      playImpactSound();
    }

    const burst = easeOutExpo(impactProgress);
    image.style.transform = `translate3d(${-2.2 + Math.sin(impactProgress * 38) * (1 - impactProgress) * 0.45}%, 0.8%, 0) scale(${1.17 + burst * 0.035}) rotate(-0.35deg)`;
    flash.style.opacity = String(Math.max(0, 1 - impactProgress * 2.8));
    shockwave.style.opacity = String(Math.max(0, 0.8 - impactProgress * 1.2));
    shockwave.style.transform = `scale(${1 + burst * 10})`;
    const sunPulse = Math.min(0.72, impactProgress * 1.7) * Math.max(0, (1 - impactProgress) * 2);
    sun.style.opacity = String(sunPulse);
    sun.style.transform = `rotate(${impactProgress * 45}deg) scale(${0.8 + burst * 0.5})`;
    drawParticles();
  }

  if (rawProgress >= 0.92) hero.classList.add("is-frozen");

  if (rawProgress < 1) {
    animationFrame = requestAnimationFrame(animateScene);
  } else {
    isPlaying = false;
    playButton.setAttribute("aria-label", "Repetir secuencia");
    playButton.querySelector("strong").textContent = "Repetir el momento";
  }
}

function resetScene() {
  cancelAnimationFrame(animationFrame);
  isPlaying = false;
  hasImpact = false;
  startTime = 0;
  particles.length = 0;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  hero.classList.remove("is-playing", "is-frozen");
  hero.style.setProperty("--sequence-progress", 0);
  progress.style.width = "0%";
  timecode.textContent = "00:00:00";

  const image = document.querySelector(".scene__image");
  const flash = document.querySelector(".scene__flash");
  const shockwave = document.querySelector(".scene__shockwave");
  const sun = document.querySelector(".scene__sun");
  image.removeAttribute("style");
  flash.removeAttribute("style");
  shockwave.removeAttribute("style");
  sun.removeAttribute("style");
}

function playSequence() {
  resetScene();
  isPlaying = true;
  hero.classList.add("is-playing");
  playButton.querySelector("strong").textContent = "En juego";
  animationFrame = requestAnimationFrame(animateScene);
}

playButton.addEventListener("click", () => {
  if (!isPlaying) playSequence();
});

soundToggle.addEventListener("click", () => {
  const nextState = soundToggle.getAttribute("aria-pressed") !== "true";
  soundToggle.setAttribute("aria-pressed", String(nextState));
  soundToggle.querySelector(".sound-toggle__label").textContent = nextState ? "Sonido on" : "Sonido";
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  if (isPlaying || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  hero.style.setProperty("--pointer-x", ((event.clientX / window.innerWidth) * 2 - 1).toFixed(2));
  hero.style.setProperty("--pointer-y", ((event.clientY / window.innerHeight) * 2 - 1).toFixed(2));
});

resizeCanvas();

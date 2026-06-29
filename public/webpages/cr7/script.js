const body = document.body;
const video = document.querySelector(".product-video");
const scrollCue = document.querySelector(".scroll-cue");
const header = document.querySelector(".site-header");
const canvas = document.querySelector(".particles");
const context = canvas.getContext("2d");
const hero = document.querySelector(".hero");
const story = document.querySelector(".story");
const formula = document.querySelector(".formula");
const storyVideo = document.querySelector(".story-video");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activated = false;
let particles = [];
let animationFrame;
let scrollFrame;
let currentScroll = window.scrollY;
let targetScroll = window.scrollY;
let lastScroll = window.scrollY;
let scrollVelocity = 0;

function activateExperience() {
  if (activated) return;
  activated = true;
  body.classList.add("activated");
  video.play().catch(() => {
    // The poster remains visible if autoplay is unavailable.
  });
  window.setTimeout(() => window.scrollTo({ top: 1, behavior: "smooth" }), 850);
}

function onFirstIntent(event) {
  if (activated) return;

  if (
    event.type === "keydown" &&
    !["ArrowDown", "PageDown", " ", "Enter"].includes(event.key)
  ) {
    return;
  }

  event.preventDefault();
  activateExperience();
}

window.addEventListener("wheel", onFirstIntent, { passive: false, once: true });
window.addEventListener("touchmove", onFirstIntent, { passive: false, once: true });
window.addEventListener("keydown", onFirstIntent, { once: true });
scrollCue.addEventListener("click", activateExperience);

window.addEventListener(
  "scroll",
  () => {
    if (!activated && window.scrollY > 0) activateExperience();
    header.classList.toggle("scrolled", window.scrollY > 24);
    targetScroll = window.scrollY;
    scrollVelocity = targetScroll - lastScroll;

    if (window.scrollY > window.innerHeight * 0.65) {
      header.classList.toggle("header-hidden", scrollVelocity > 7);
    } else {
      header.classList.remove("header-hidden");
    }

    lastScroll = targetScroll;
    requestScrollAnimation();
  },
  { passive: true },
);

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function sectionProgress(element) {
  const rect = element.getBoundingClientRect();
  return clamp(
    (window.innerHeight - rect.top) / (window.innerHeight + rect.height),
  );
}

function setMotionVariables() {
  scrollFrame = undefined;

  if (reducedMotion.matches) return;

  currentScroll += (targetScroll - currentScroll) * 0.12;

  const heroProgress = clamp(currentScroll / Math.max(hero.offsetHeight, 1));
  const heroCurve = Math.sin(heroProgress * Math.PI);
  const direction = Math.sign(scrollVelocity);

  hero.style.setProperty("--media-y", `${heroProgress * 92}px`);
  hero.style.setProperty("--media-x", `${direction * heroCurve * 7}px`);
  hero.style.setProperty("--media-scale", `${1 + heroProgress * 0.055}`);
  hero.style.setProperty("--video-y", `${heroProgress * -18}px`);
  hero.style.setProperty("--video-scale", `${1 + heroProgress * 0.025}`);
  hero.style.setProperty("--hologram-y", `${heroProgress * -72}px`);
  hero.style.setProperty("--hologram-x", `${direction * heroCurve * 11}px`);
  hero.style.setProperty("--hologram-scale", `${1 + heroProgress * 0.12}`);
  hero.style.setProperty("--copy-left-x", `${heroProgress * -70}px`);
  hero.style.setProperty("--copy-right-x", `${heroProgress * 70}px`);
  hero.style.setProperty("--copy-y", `${heroProgress * 22}px`);
  hero.style.setProperty("--action-left-x", `${heroProgress * -18}px`);
  hero.style.setProperty("--action-right-x", `${heroProgress * 18}px`);
  hero.style.setProperty("--button-y", `${heroProgress * 62}px`);
  hero.style.setProperty("--button-rotate", `${direction * heroCurve * 0.6}deg`);
  hero.style.setProperty("--stadium-y", `${heroProgress * 34}px`);
  hero.style.setProperty("--stadium-scale", `${1 + heroProgress * 0.04}`);
  hero.style.setProperty("--ring-x", `${direction * heroCurve * 28}px`);
  hero.style.setProperty("--ring-y", `${heroProgress * 24}px`);
  hero.style.setProperty("--ring-rotate", `${direction * heroCurve * 1.5}deg`);
  hero.style.setProperty("--mist-one-x", `${heroProgress * 80}px`);
  hero.style.setProperty("--mist-one-y", `${heroProgress * -28}px`);
  hero.style.setProperty("--mist-two-x", `${heroProgress * -90}px`);
  hero.style.setProperty("--mist-two-y", `${heroProgress * 34}px`);

  [story, formula].forEach((section, index) => {
    const progress = sectionProgress(section);
    const centered = progress - 0.5;
    section.style.setProperty("--section-y", `${centered * -56}px`);
    section.style.setProperty(
      "--section-x",
      `${centered * (index === 0 ? 24 : -24)}px`,
    );
    section.style.setProperty("--orb-x", `${centered * 110}px`);
    section.style.setProperty("--orb-y", `${centered * -90}px`);
    section.style.setProperty("--orb-scale", `${0.82 + progress * 0.35}`);

    if (section === story) {
      section.style.setProperty("--story-video-y", `${centered * 74}px`);
      section.style.setProperty(
        "--story-video-scale",
        `${1.12 + Math.abs(centered) * 0.08}`,
      );
    } else {
      section.style.setProperty("--formula-image-x", `${centered * -34}px`);
      section.style.setProperty("--formula-image-y", `${centered * 68}px`);
      section.style.setProperty(
        "--formula-image-scale",
        `${1.12 + Math.abs(centered) * 0.07}`,
      );
    }
  });

  document.body.style.setProperty(
    "--scroll-speed",
    `${Math.min(Math.abs(scrollVelocity), 40)}`,
  );

  scrollVelocity *= 0.86;

  if (
    Math.abs(targetScroll - currentScroll) > 0.15 ||
    Math.abs(scrollVelocity) > 0.15
  ) {
    scrollFrame = requestAnimationFrame(setMotionVariables);
  }
}

function requestScrollAnimation() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(setMotionVariables);
}

function setupRevealAnimations() {
  const revealItems = [
    [story.querySelector(".story-number"), "reveal-left"],
    [story.querySelector("div"), "reveal-right"],
    [formula.querySelector("p"), "reveal-left"],
    [formula.querySelector("h2"), "reveal-right"],
    ...Array.from(document.querySelectorAll("footer > *")).map((element, index) => [
      element,
      index === 0 ? "reveal-left" : "reveal-right",
    ]),
  ];

  revealItems.forEach(([element, direction]) => {
    element.classList.add("reveal", direction);
  });

  if (reducedMotion.matches) {
    revealItems.forEach(([element]) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  revealItems.forEach(([element]) => observer.observe(element));

  const storyVideoObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        storyVideo.play().catch(() => {});
      } else {
        storyVideo.pause();
      }
    },
    { threshold: 0.12 },
  );

  storyVideoObserver.observe(story);
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(76, Math.floor(window.innerWidth / 18));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 2.4 + 0.6,
    speed: Math.random() * 0.34 + 0.12,
    drift: Math.random() * 0.34 - 0.17,
    alpha: Math.random() * 0.55 + 0.15,
    phase: Math.random() * Math.PI * 2,
  }));
}

function drawParticles(time = 0) {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle) => {
    const scrollBoost = Math.min(Math.abs(scrollVelocity) * 0.012, 1.6);
    const scrollDirection = Math.sign(scrollVelocity);

    particle.y += particle.speed + scrollBoost * scrollDirection;
    particle.x +=
      particle.drift +
      Math.sin(time * 0.0005 + particle.phase) * 0.08 +
      scrollDirection * scrollBoost * 0.16;

    if (particle.y > window.innerHeight + 10) {
      particle.y = -10;
      particle.x = Math.random() * window.innerWidth;
    } else if (particle.y < -10) {
      particle.y = window.innerHeight + 10;
      particle.x = Math.random() * window.innerWidth;
    }

    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(time * 0.00025 + particle.phase);
    context.fillStyle = `rgba(232, 192, 88, ${particle.alpha})`;
    context.shadowColor = "rgba(224, 176, 62, 0.55)";
    context.shadowBlur = 5;
    context.fillRect(-particle.size, -particle.size * 0.35, particle.size * 2.2, particle.size * 0.7);
    context.restore();
  });

  animationFrame = requestAnimationFrame(drawParticles);
}

resizeCanvas();
setupRevealAnimations();
requestScrollAnimation();
drawParticles();
window.addEventListener("resize", () => {
  resizeCanvas();
  targetScroll = window.scrollY;
  currentScroll = targetScroll;
  requestScrollAnimation();
});
window.addEventListener("pagehide", () => {
  cancelAnimationFrame(animationFrame);
  cancelAnimationFrame(scrollFrame);
});

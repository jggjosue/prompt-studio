function animateValue(el, target, suffix, duration) {
  const start = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);
    el.textContent = current + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

const metricObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.animated === "true") return;
      el.dataset.animated = "true";
      el.classList.add("counting");
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || "";
      const isDecimal = el.dataset.decimal === "true";
      if (isDecimal) {
        let start = 0;
        const startTime = performance.now();
        const duration = 1500;
        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = (target * eased).toFixed(1) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(tick);
      } else {
        animateValue(el, target, suffix, 1500);
      }
    });
  },
  { threshold: 0.35 }
);

document.querySelectorAll(".metric-value[data-target]").forEach(function (el) {
  metricObserver.observe(el);
});

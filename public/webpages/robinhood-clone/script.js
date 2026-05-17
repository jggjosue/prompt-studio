(function () {
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = start + (target - start) * eased;
      el.textContent =
        prefix +
        (decimals > 0 ? current.toFixed(decimals) : Math.floor(current)) +
        suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  var observed = false;
  var statsSection = document.getElementById("stats");

  if (statsSection && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !observed) {
            observed = true;
            document.querySelectorAll(".stat-value[data-target]").forEach(animateCounter);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(statsSection);
  } else {
    document.querySelectorAll(".stat-value[data-target]").forEach(animateCounter);
  }
})();

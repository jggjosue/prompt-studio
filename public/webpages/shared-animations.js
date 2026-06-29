(() => {
  function staggerIn(elements, { delay = 0, step = 0.08, duration = 0.6, y = 12 } = {}) {
    const nodes = Array.from(elements || []);
    nodes.forEach((node, index) => {
      if (!node) return;
      node.style.opacity = '0';
      node.style.transform = `translateY(${y}px)`;
      node.style.transition = `opacity ${duration}s ease ${delay + index * step}s, transform ${duration}s ease ${delay + index * step}s`;
      requestAnimationFrame(() => {
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
      });
    });
  }

  function fadeIn(node, { delay = 0, duration = 0.5 } = {}) {
    if (!node) return;
    node.style.opacity = '0';
    node.style.transition = `opacity ${duration}s ease ${delay}s`;
    requestAnimationFrame(() => {
      node.style.opacity = '1';
    });
  }

  function revealOnLoad(selector, options = {}) {
    const nodes = document.querySelectorAll(selector);
    if (nodes.length) staggerIn(nodes, options);
  }

  window.PromptStudioAnimations = {
    staggerIn,
    fadeIn,
    revealOnLoad,
  };
})();


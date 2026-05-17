(function () {
  const canvas = document.getElementById("design-canvas");
  if (!canvas) return;

  const shapes = canvas.querySelectorAll(".shape");
  let active = null;
  let offsetX = 0;
  let offsetY = 0;

  shapes.forEach(function (shape) {
    shape.addEventListener("pointerdown", function (e) {
      active = shape;
      const rect = shape.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      shape.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    shape.addEventListener("pointermove", function (e) {
      if (active !== shape) return;
      const canvasRect = canvas.getBoundingClientRect();
      let x = e.clientX - canvasRect.left - offsetX;
      let y = e.clientY - canvasRect.top - offsetY;
      const maxX = canvasRect.width - shape.offsetWidth;
      const maxY = canvasRect.height - shape.offsetHeight;
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));
      shape.style.left = x + "px";
      shape.style.top = y + "px";
    });

    shape.addEventListener("pointerup", function (e) {
      if (active === shape) {
        active = null;
        shape.releasePointerCapture(e.pointerId);
      }
    });
  });
})();

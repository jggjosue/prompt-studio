document.querySelectorAll(".tab-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const brand = btn.getAttribute("data-brand");

    document.querySelectorAll(".tab-btn").forEach(function (b) {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    document.querySelectorAll(".tab-panel").forEach(function (panel) {
      panel.classList.remove("active");
      panel.hidden = true;
    });
    const target = document.querySelector('.tab-panel[data-brand="' + brand + '"]');
    if (target) {
      target.classList.add("active");
      target.hidden = false;
    }
  });
});

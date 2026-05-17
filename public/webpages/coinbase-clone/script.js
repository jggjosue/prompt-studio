(function () {
  var ticks = document.querySelectorAll(".tick em");
  ticks.forEach(function (el) {
    if (Math.random() > 0.5 && el.classList.contains("up")) {
      var v = (Math.random() * 3 + 0.5).toFixed(2);
      el.textContent = "+" + v + "%";
    }
  });
})();

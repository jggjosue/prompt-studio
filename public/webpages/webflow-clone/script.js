(function () {
  document.querySelectorAll("[data-ba]").forEach(function (slider) {
    var input = slider.querySelector(".ba-input");
    var before = slider.querySelector(".ba-before");
    var handle = slider.querySelector(".ba-handle");

    function update() {
      var val = input.value;
      slider.style.setProperty("--pos", val + "%");
      if (before) before.style.width = val + "%";
      if (handle) handle.style.left = val + "%";
    }

    input.addEventListener("input", update);
    update();
  });
})();

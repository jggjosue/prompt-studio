(function () {
  var messages = {
    recetas: "Platos rápidos, postres y menús para cada ocasión.",
    decoracion: "Ideas para salones, dormitorios y espacios con estilo.",
    moda: "Outfits, tendencias y looks para cada temporada.",
    diy: "Proyectos creativos y manualidades paso a paso.",
    viajes: "Destinos, rutas y experiencias para tu próximo viaje."
  };

  var chips = document.querySelectorAll(".chip");
  var panel = document.querySelector("#chip-panel .panel-text");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("active");
      chip.setAttribute("aria-selected", "true");
      var cat = chip.getAttribute("data-cat");
      if (panel && messages[cat]) {
        panel.textContent = messages[cat];
      }
    });
  });
})();

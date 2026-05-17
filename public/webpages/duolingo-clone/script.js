document.querySelectorAll(".lang-card").forEach(function (card) {
  card.addEventListener("click", function () {
    document.querySelectorAll(".lang-card").forEach(function (c) {
      c.classList.remove("selected");
    });
    card.classList.add("selected");
  });
});

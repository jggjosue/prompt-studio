(function () {
  var track = document.querySelector("[data-carousel-track]");
  var prev = document.querySelector("[data-carousel-prev]");
  var next = document.querySelector("[data-carousel-next]");
  var dotsWrap = document.querySelector("[data-carousel-dots]");
  if (!track || !prev || !next) return;

  var cards = track.querySelectorAll(".template-card");
  var index = 0;

  function cardWidth() {
    var card = cards[0];
    if (!card) return 216;
    return card.offsetWidth + 16;
  }

  function goTo(i) {
    index = Math.max(0, Math.min(i, cards.length - 1));
    track.scrollTo({ left: index * cardWidth(), behavior: "smooth" });
    updateDots();
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    for (var d = 0; d < cards.length; d++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "carousel-dot" + (d === index ? " active" : "");
      btn.setAttribute("aria-label", "Ir a plantilla " + (d + 1));
      (function (n) {
        btn.addEventListener("click", function () {
          goTo(n);
        });
      })(d);
      dotsWrap.appendChild(btn);
    }
  }

  prev.addEventListener("click", function () {
    goTo(index - 1);
  });
  next.addEventListener("click", function () {
    goTo(index + 1);
  });

  track.addEventListener("scroll", function () {
    var w = cardWidth();
    if (w > 0) index = Math.round(track.scrollLeft / w);
    updateDots();
  });

  updateDots();
})();

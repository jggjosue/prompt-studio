document.querySelectorAll(".timeline-question").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const item = btn.closest(".timeline-item");
    const answer = item.querySelector(".timeline-answer");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".timeline-item.open").forEach(function (openItem) {
      openItem.classList.remove("open");
      openItem.querySelector(".timeline-answer").style.maxHeight = "0";
    });

    if (!isOpen) {
      item.classList.add("open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

document.querySelector(".newsletter-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]')?.value?.trim();
  if (email) {
    alert("Gracias por suscribirte: " + email);
  }
});

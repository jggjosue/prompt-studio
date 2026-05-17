document.querySelectorAll(".faq-question").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
      openItem.classList.remove("open");
      const openAnswer = openItem.querySelector(".faq-answer");
      openAnswer.style.maxHeight = "0";
      openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      item.classList.add("open");
      answer.style.maxHeight = answer.scrollHeight + "px";
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

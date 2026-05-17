document.querySelectorAll(".category-item").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".category-item").forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
  });
});

document.querySelectorAll(".faq-question").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const item = btn.closest(".faq-item");
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
      openItem.classList.remove("open");
      openItem.querySelector(".faq-toggle").textContent = "+";
    });
    if (!isOpen) {
      item.classList.add("open");
      btn.querySelector(".faq-toggle").textContent = "−";
    }
  });
});

function handleStart(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[type="email"]');
  const email = input ? input.value.trim() : "";
  if (email) {
    alert("Gracias. Te contactaremos en: " + email);
  } else {
    alert("Por favor ingresa un email válido.");
  }
}

document.querySelectorAll(".email-form").forEach(function (form) {
  form.addEventListener("submit", handleStart);
});

document.querySelectorAll(".faq-question").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
      openItem.classList.remove("open");
      const openAnswer = openItem.querySelector(".faq-answer");
      openAnswer.style.maxHeight = "0";
    });

    if (!isOpen) {
      item.classList.add("open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

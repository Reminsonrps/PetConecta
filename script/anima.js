/* Arquivo de script: anima.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: anima.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

const menuLinks = document.querySelectorAll("#menu a");

menuLinks.forEach((link) => {
  const targetId = link.getAttribute("href");

  if (!targetId || !targetId.startsWith("#")) {
    return;
  }

  link.addEventListener("click", (event) => {
    const targetSection = document.querySelector(targetId);

    if (!targetSection) {
      return;
    }

    event.preventDefault();

    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    menuLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

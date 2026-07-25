/* Arquivo de script: parceiros.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: parceiros.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

document.addEventListener("DOMContentLoaded", () => {
  const galeria = document.querySelector(".parceiros");
  if (!galeria) return;

  const parceiros = [
    {
      href: "https://www.instagram.com/peregrinosvet/",
      src: "assets/img/pelegrinos.jpg",
      alt: "Peregrinos Vet",
      className: "pelegrinos-vet",
      title: "Peregrinos Vet",
    },
    {
      href: "https://www.anjosdajuda.org/nossos-pets",
      src: "assets/img/AnjosDajuda.jpg",
      alt: "ONG Anjos D'Ajuda",
      className: "anjosDajuda",
      title: "ONG Anjos D'Ajuda",
    },
  ];

  parceiros.forEach((parceiro) => {
    const link = document.createElement("a");
    link.href = parceiro.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "partner-card";
    link.title = parceiro.title;

    const img = document.createElement("img");
    img.src = parceiro.src;
    img.alt = parceiro.alt;
    img.classList.add(parceiro.className);

    link.appendChild(img);
    galeria.prepend(link);
  });
});

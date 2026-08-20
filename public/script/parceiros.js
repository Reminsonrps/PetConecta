/* Arquivo de script: parceiros.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: parceiros.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

/*
  Script da área de parceiros.
  Cria os cards com imagens e links externos para as instituições apoiadoras.
*/
document.addEventListener("DOMContentLoaded", () => {
  const galeria = document.querySelector(".parceiros");
  if (!galeria) return;

  // Lista dirigida por dados para incluir parceiros sem duplicar a estrutura dos cards.
  const parceiros = [
    {
      href: "https://www.instagram.com/peregrinosvet/",
      src: "assets/img/pelegrinos.jpg",
      alt: "Peregrinos Vet",
      className: "pelegrinos-vet",
      title: "Peregrinos Vet",
      destaque: true,
    },
    {
      href: "https://www.instagram.com/dogsdabalsa_oficial_/",
      src: "assets/img/dogsbalsa.jpg",
      alt: "Dogs da Balsa",
      className: "dogsbalsa",
      title: "Dogs da Balsa",
    },
    {
      href: "https://www.anjosdajuda.org/nossos-pets",
      src: "assets/img/AnjosDajuda.jpg",
      alt: "ONG Anjos D'Ajuda",
      className: "anjosDajuda",
      title: "ONG Anjos D'Ajuda",
    },
    {
      href: "https://wa.me/5573998248286",
      src: "assets/img/paulo_ventura.jpeg",
      alt: "Paulo Ventura - Adestrador",
      className: "paulo-ventura",
      title: "Paulo Ventura - Adestrador | (73) 99824-8286",
    },
  ];

  // Cria links externos com relacao segura e insere as imagens na galeria.
  parceiros.forEach((parceiro) => {
    const link = document.createElement("a");
    link.href = parceiro.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "partner-card";
    link.title = parceiro.title;

    if (parceiro.destaque) {
      link.classList.add("partner-card--destaque");
      link.setAttribute(
        "aria-label",
        `${parceiro.title} (Parceiro recomendado)`,
      );

      const badge = document.createElement("span");
      badge.className = "partner-badge";
      badge.textContent = "Recomendado";
      link.appendChild(badge);
    }

    const img = document.createElement("img");
    img.src = parceiro.src;
    img.alt = parceiro.alt;
    img.classList.add(parceiro.className);

    link.appendChild(img);
    galeria.prepend(link);
  });
});

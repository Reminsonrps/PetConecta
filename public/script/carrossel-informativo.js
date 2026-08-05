/* Carrossel dinamico de informativos com links clicaveis.
   Use apenas imagens locais com permissao de uso para evitar risco autoral. */
(function () {
  const itensInformativos = [
    {
      titulo: "Parceiro em destaque: Peregrinos Vet",
      imagem: "assets/img/carousel/parceiro-peregrinosvet.svg",
      alt: "Destaque para o trabalho do Peregrinos Vet",
      url: "https://www.instagram.com/peregrinosvet/",
    },
    {
      titulo: "Leishmaniose: prevencao",
      imagem: "assets/img/carousel/zoonoses-alerta.svg",
      alt: "Prevencao da leishmaniose em pets",
      url: "informativos.html#zoonoses",
    },
    {
      titulo: "Vacinacao em dia",
      imagem: "assets/img/carousel/vacinacao-calendario.svg",
      alt: "Importancia da vacinacao para caes e gatos",
      url: "informativos.html#vacinacao",
    },
    {
      titulo: "Alimentacao segura",
      imagem: "assets/img/carousel/alimentacao-inteligente.svg",
      alt: "Boas praticas de alimentacao para pets",
      url: "informativos.html#alimentacao",
    },
    {
      titulo: "Bem-estar e exercicios",
      imagem: "assets/img/carousel/bem-estar-ativo.svg",
      alt: "Exercicio e estimulo para o bem-estar dos pets",
      url: "informativos.html#comportamento",
    },
    {
      titulo: "Viagens com seguranca",
      imagem: "assets/img/carousel/viagens-seguras.svg",
      alt: "Cuidados para viagens com pets",
      url: "informativos.html#viagens",
    },
    {
      titulo: "Sinais de emergencia",
      imagem: "assets/img/carousel/emergencia-24h.svg",
      alt: "Sinais de emergencia veterinaria",
      url: "informativos.html#emergencia",
    },
  ];

  const carousel = document.getElementById("carousel_info");
  if (!carousel) return;

  const track = carousel.querySelector(".carousel-track");
  const dotsContainer = carousel.querySelector(".carousel-dots");
  const prevBtn = carousel.querySelector(".carousel-btn-prev");
  const nextBtn = carousel.querySelector(".carousel-btn-next");
  const wrapper = carousel.querySelector(".carousel-track-wrapper");

  if (!track || !dotsContainer || !prevBtn || !nextBtn || !wrapper) return;

  const itensValidos = itensInformativos.filter((item) => {
    return item && item.imagem && item.url;
  });

  if (itensValidos.length === 0) return;

  track.innerHTML = "";
  dotsContainer.innerHTML = "";

  itensValidos.forEach((item, index) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";

    const link = document.createElement("a");
    link.href = item.url;
    link.className = "carousel-slide-link";
    link.setAttribute("aria-label", item.titulo || `Slide ${index + 1}`);

    if (/^https?:\/\//i.test(item.url)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    const image = document.createElement("img");
    image.src = item.imagem;
    image.alt = item.alt || item.titulo || "Informativo PetConecta";
    image.loading = "lazy";

    link.appendChild(image);
    slide.appendChild(link);
    track.appendChild(slide);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    if (index === 0) dot.classList.add("active");
    dot.setAttribute("aria-label", `Slide ${index + 1}`);
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll(".carousel-dot"));
  const total = itensValidos.length;
  let current = 0;
  let timer = null;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  prevBtn.addEventListener("click", () => {
    goTo(current - 1);
    startTimer();
  });

  nextBtn.addEventListener("click", () => {
    goTo(current + 1);
    startTimer();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goTo(index);
      startTimer();
    });
  });

  wrapper.addEventListener("mouseenter", stopTimer);
  wrapper.addEventListener("mouseleave", startTimer);

  if (total <= 1) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    dotsContainer.style.display = "none";
    return;
  }

  goTo(0);
  startTimer();
})();

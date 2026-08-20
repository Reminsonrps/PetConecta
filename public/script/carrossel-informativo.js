/* Carrossel dinâmico de informativos com links clicáveis.
  Use apenas imagens locais com permissão de uso para evitar risco autoral. */
(function () {
  // Os itens ficam separados da montagem para permitir atualizar o conteudo sem duplicar HTML.
  const itensInformativos = [
    {
      titulo: "Parceiro em destaque: Peregrinos Vet",
      imagem: "assets/img/carousel/parceiro-peregrinosvet.svg",
      alt: "Destaque para o trabalho do Peregrinos Vet",
      url: "https://www.instagram.com/peregrinosvet/",
    },
    {
      titulo: "Leishmaniose: prevenção",
      imagem: "assets/img/carousel/zoonoses-alerta.svg",
      alt: "Prevenção da leishmaniose em pets",
      url: "informativos.html#zoonoses",
    },
    {
      titulo: "Vacinação em dia",
      imagem: "assets/img/carousel/vacinacao-calendario.svg",
      alt: "Importância da vacinação para cães e gatos",
      url: "informativos.html#vacinacao",
    },
    {
      titulo: "Alimentação segura",
      imagem: "assets/img/carousel/alimentacao-inteligente.svg",
      alt: "Boas práticas de alimentação para pets",
      url: "informativos.html#alimentacao",
    },
    {
      titulo: "Bem-estar e exercícios",
      imagem: "assets/img/carousel/bem-estar-ativo.svg",
      alt: "Exercício e estímulo para o bem-estar dos pets",
      url: "informativos.html#comportamento",
    },
    {
      titulo: "Viagens com segurança",
      imagem: "assets/img/carousel/viagens-seguras.svg",
      alt: "Cuidados para viagens com pets",
      url: "informativos.html#viagens",
    },
    {
      titulo: "Sinais de emergência",
      imagem: "assets/img/carousel/emergencia-24h.svg",
      alt: "Sinais de emergência veterinária",
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

  // Cria slides e controles somente para itens que possuem imagem e destino validos.
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
    // Mantem o indice circular e sincroniza slide, transformacao e indicador ativo.
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

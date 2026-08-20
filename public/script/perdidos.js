/* Arquivo de script: perdidos.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: perdidos.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("dadosSalvos");

  // Recupera os registros locais e reconstroi os cards ao abrir a pagina.
  function carregarDadosSalvos() {
    const dadosSalvos =
      JSON.parse(localStorage.getItem("animaisPerdidos")) || [];

    dadosSalvos.forEach((animal, index) => {
      criarCard(animal, index);
    });
  }

  function criarCard(animal, index) {
    // Monta o card e guarda o indice para a acao de remocao delegada no container.
    const card = document.createElement("div");
    card.className = "animal-card";

    const img = document.createElement("img");
    img.src = animal.foto || "";
    img.alt = "Foto do animal";
    card.appendChild(img);

    const info = document.createElement("div");
    info.className = "info";

    const title = document.createElement("h3");
    title.textContent = `Raça: ${animal.raca || "Não informada"}`;
    info.appendChild(title);

    const data = document.createElement("p");
    data.textContent = `Data: ${animal.data || "Não informada"}`;
    info.appendChild(data);

    const local = document.createElement("p");
    local.textContent = `Local: ${animal.bairro || "Não informado"}`;
    info.appendChild(local);

    const contato = document.createElement("p");
    contato.textContent = `Contato: ${animal.contato || "Não informado"}`;
    info.appendChild(contato);

    const removerBtn = document.createElement("button");
    removerBtn.className = "remover-btn";
    removerBtn.dataset.index = String(index);
    removerBtn.textContent = "Remover";
    info.appendChild(removerBtn);

    card.appendChild(info);
    container.appendChild(card);
  }

  function comprimirImagem(
    file,
    maxWidth = 300,
    maxHeight = 300,
    qualidade = 0.7,
    callback,
  ) {
    // Reduz a imagem antes de grava-la no localStorage para evitar exceder seu limite.
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
      img.src = e.target.result;
    };

    img.onload = function () {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height *= maxWidth / width;
          width = maxWidth;
        } else {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", qualidade);
      callback(compressedDataUrl);
    };

    reader.readAsDataURL(file);
  }

  // Persiste o formulario e adiciona o novo card depois da compressao da imagem.
  document
    .getElementById("formulario")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const dados = new FormData(this);
      const lista = {};

      dados.forEach((valor, chave) => {
        lista[chave] = valor;
      });

      const fotoArquivo = dados.get("foto");

      if (fotoArquivo && fotoArquivo.type.startsWith("image/")) {
        comprimirImagem(
          fotoArquivo,
          300,
          300,
          0.7,
          function (imagemComprimida) {
            lista.foto = imagemComprimida;

            const dadosSalvos =
              JSON.parse(localStorage.getItem("animaisPerdidos")) || [];
            dadosSalvos.push(lista);
            localStorage.setItem(
              "animaisPerdidos",
              JSON.stringify(dadosSalvos),
            );

            criarCard(lista, dadosSalvos.length - 1);
            document.getElementById("formulario").reset();
          },
        );
      } else {
        alert("Por favor, selecione uma imagem válida.");
      }
    });

  container.addEventListener("click", function (event) {
    if (event.target.classList.contains("remover-btn")) {
      const index = event.target.getAttribute("data-index");
      const dadosSalvos =
        JSON.parse(localStorage.getItem("animaisPerdidos")) || [];
      dadosSalvos.splice(index, 1);
      localStorage.setItem("animaisPerdidos", JSON.stringify(dadosSalvos));
      container.innerHTML = "";
      carregarDadosSalvos();
    }
  });

  carregarDadosSalvos();
});

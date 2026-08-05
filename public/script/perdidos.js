/* Arquivo de script: perdidos.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: perdidos.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("dadosSalvos");

  function carregarDadosSalvos() {
    const dadosSalvos = JSON.parse(localStorage.getItem("animaisPerdidos")) || [];

    dadosSalvos.forEach((animal, index) => {
      criarCard(animal, index);
    });
  }

  function criarCard(animal, index) {
    const card = document.createElement("div");
    card.className = "animal-card";
    card.innerHTML = `
      <img src="${animal.foto}" alt="Foto do animal" />
      <div class="info">
        <h3>Raça: ${animal.raca}</h3>
        <p>Data: ${animal.data}</p>
        <p>Local: ${animal.bairro}</p>
        <p>Contato: ${animal.contato}</p>
        <button class="remover-btn" data-index="${index}">Remover</button>
      </div>
    `;
    container.appendChild(card);
  }

  function comprimirImagem(file, maxWidth = 300, maxHeight = 300, qualidade = 0.7, callback) {
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

  document.getElementById("formulario").addEventListener("submit", function (event) {
    event.preventDefault();

    const dados = new FormData(this);
    const lista = {};

    dados.forEach((valor, chave) => {
      lista[chave] = valor;
    });

    const fotoArquivo = dados.get("foto");

    if (fotoArquivo && fotoArquivo.type.startsWith("image/")) {
      comprimirImagem(fotoArquivo, 300, 300, 0.7, function (imagemComprimida) {
        lista.foto = imagemComprimida;

        const dadosSalvos = JSON.parse(localStorage.getItem("animaisPerdidos")) || [];
        dadosSalvos.push(lista);
        localStorage.setItem("animaisPerdidos", JSON.stringify(dadosSalvos));

        criarCard(lista, dadosSalvos.length - 1);
        document.getElementById("formulario").reset();
      });
    } else {
      alert("Por favor, selecione uma imagem válida.");
    }
  });

  container.addEventListener("click", function (event) {
    if (event.target.classList.contains("remover-btn")) {
      const index = event.target.getAttribute("data-index");
      const dadosSalvos = JSON.parse(localStorage.getItem("animaisPerdidos")) || [];
      dadosSalvos.splice(index, 1);
      localStorage.setItem("animaisPerdidos", JSON.stringify(dadosSalvos));
      container.innerHTML = "";
      carregarDadosSalvos();
    }
  });

  carregarDadosSalvos();
});
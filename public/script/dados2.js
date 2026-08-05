/* Arquivo de script: dados2.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: dados2.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

// Função para gerar um ID único de 4 dígitos
function gerarIdPet() {
  const listaPets = JSON.parse(localStorage.getItem('pets')) || [];
  let novoId;

  do {
    novoId = Math.floor(1000 + Math.random() * 9000); // entre 1000 e 9999
  } while (listaPets.some(pet => pet.id === novoId));

  return novoId;
}

// Cadastro do pet
document.querySelector('#form-container').addEventListener('submit', function(event) {
  event.preventDefault();

  const imagemInput = document.getElementById('imagem');
  const arquivoImagem = imagemInput.files[0];

  removerErros();

  if (!arquivoImagem) {
    mostrarErro(imagemInput, 'Por favor, selecione uma imagem do pet.');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const pet = {
      id: gerarIdPet(),
      nome: document.getElementById("nome").value.trim(),
      localiza: document.getElementById("localizacao").value.trim(),
      raca: document.getElementById("tipo").value.trim(),
      sexo: document.getElementById("sexo").value.trim(),
      idade: document.getElementById("idade").value.trim(),
      data: document.getElementById("data").value.trim(),
      contato: document.getElementById("contato").value.trim(),
      whatsapp: document.getElementById("whatsapp").value.trim(),
      descricao: document.getElementById("descricao").value.trim(),
      imagem: e.target.result,
      status: "desaparecido"
    };

    const camposObrigatorios = [
      'nome', 'localiza', 'raca', 'sexo', 'idade',
      'data', 'contato', 'whatsapp', 'imagem'
    ];

    let valido = true;

    camposObrigatorios.forEach(campo => {
      if (!pet[campo] && pet[campo] !== 0) {
        const input = document.getElementById(campo === 'localiza' ? 'localizacao' : campo);
        mostrarErro(input, 'Campo obrigatório.');
        valido = false;
      }
    });

    // Validação do campo "contato" como e-mail
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pet.contato);
    if (!emailValido) {
      mostrarErro(document.getElementById('contato'), 'Insira um e-mail válido.');
      valido = false;
    }

    // Validação do campo "whatsapp" como número com 10 a 13 dígitos
    const whatsappValido = /^\d{10,13}$/.test(pet.whatsapp);
    if (!whatsappValido) {
      mostrarErro(document.getElementById('whatsapp'), 'Informe apenas números entre 10 e 13 dígitos.');
      valido = false;
    }

    // Validação do campo "data"
    const dataInput = document.getElementById("data");
    const dataValor = pet.data;
    const dataFormatada = new Date(dataValor);
    const hoje = new Date();

    if (isNaN(dataFormatada.getTime())) {
      mostrarErro(dataInput, 'Insira uma data válida.');
      valido = false;
    }

    if (dataFormatada > hoje) {
      mostrarErro(dataInput, 'A data não pode ser no futuro.');
      valido = false;
    }

    if (!valido) return;

    const listaPets = JSON.parse(localStorage.getItem('pets')) || [];
    listaPets.push(pet);
    localStorage.setItem('pets', JSON.stringify(listaPets));

    alert(`Pet cadastrado com sucesso! Código de rastreio: ${pet.id}`);
    document.getElementById('form-container').reset();

    setTimeout(() => {
      window.location.href = "cadastrados.html";
    }, 1000);
  };

  reader.readAsDataURL(arquivoImagem);
});

// Funções auxiliares
function mostrarErro(input, mensagem) {
  const erro = document.createElement('small');
  erro.classList.add('erro');
  erro.textContent = mensagem;
  input.insertAdjacentElement('afterend', erro);
}

function removerErros() {
  document.querySelectorAll('.erro').forEach(el => el.remove());
}
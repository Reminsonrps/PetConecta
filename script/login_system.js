/* Arquivo de script: login_system.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: login_system.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */


// Função para verificar login antes de editar ou excluir
function verificarLogin(idPet, acao) {
  const usuarioInput = prompt("Digite seu usuário:");
  const senhaInput = prompt("Digite sua senha:");

  // Recupera os dados do LocalStorage
  const pets = JSON.parse(localStorage.getItem("pets")) || [];

  // Encontra o pet pelo ID
  const pet = pets.find(p => p.id === idPet);

  if (pet && pet.usuario === usuarioInput && pet.senha === senhaInput) {
    if (acao === "editar") {
      editarPet(pet.id);
    } else if (acao === "excluir") {
      excluirPet(pet.id);
    }
  } else {
    alert("Usuário ou senha incorretos.");
  }
}

// Função para editar pet
function editarPet(idPet) {
  const pets = JSON.parse(localStorage.getItem("pets")) || [];
  const petIndex = pets.findIndex(p => p.id === idPet);

  if (petIndex !== -1) {
    const novoNome = prompt("Novo nome do pet:", pets[petIndex].nome);
    const novaDescricao = prompt("Nova descrição:", pets[petIndex].descricao);
    pets[petIndex].nome = novoNome;
    pets[petIndex].descricao = novaDescricao;

    localStorage.setItem("pets", JSON.stringify(pets));
    alert("Dados atualizados com sucesso!");
    location.reload();
  }
}

// Função para excluir pet
function excluirPet(idPet) {
  let pets = JSON.parse(localStorage.getItem("pets")) || [];
  pets = pets.filter(p => p.id !== idPet);
  localStorage.setItem("pets", JSON.stringify(pets));
  alert("Pet excluído com sucesso!");
  location.reload();
}

// Função para renderizar os cards na página cadastrados.html
function renderizarPets() {
  const pets = JSON.parse(localStorage.getItem("pets")) || [];
  const container = document.getElementById("pet-card");
  container.innerHTML = "";

  pets.forEach(pet => {
    const card = document.createElement("div");
    card.className = "pet-card";
    card.innerHTML = `
      <h3>${pet.nome}</h3>
      <p>${pet.descricao}</p>
      <button onclick="verificarLogin('${pet.id}', 'editar')">Editar</button>
      <button onclick="verificarLogin('${pet.id}', 'excluir')">Excluir</button>
    `;
    container.appendChild(card);
  });
}

// Chama a função ao carregar a página
window.onload = renderizarPets;

/* Arquivo de script: login_system (1).js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: login_system (1).js
   Responsável por comportamentos e regras da página/fluxo correspondente. */


document.querySelector('#formulario').addEventListener('submit', function(event) {
  event.preventDefault();

  const imagemInput = document.getElementById('imagem');
  const arquivoImagem = imagemInput.files[0];

  if (!arquivoImagem) {
    alert('Por favor, selecione uma imagem do pet.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const pet = {
      id: Date.now(),
      nome: document.getElementById('nome').value,
      localiza: document.getElementById('localizacao').value,
      raca: document.getElementById('especie').value,
      data: document.getElementById('data').value,
      contato: document.getElementById('contato').value,
      descricao: document.getElementById('descricao').value,
      imagem: e.target.result,
      usuario: prompt('Crie um nome de usuário para editar/excluir este pet:'),
      senha: prompt('Crie uma senha:')
    };

    if (Object.values(pet).some(valor => !valor && valor !== pet.descricao)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const listaPets = JSON.parse(sessionStorage.getItem('pets')) || [];
    listaPets.push(pet);
    sessionStorage.setItem('pets', JSON.stringify(listaPets));

    alert('Pet cadastrado com sucesso!');
    exibirPets();
    document.getElementById('formulario').reset();
  };

  reader.readAsDataURL(arquivoImagem);
});

function exibirPets() {
  const galeria = document.querySelector('.container-cards');
  if (!galeria) return;
  galeria.innerHTML = '';

  const listaPets = JSON.parse(sessionStorage.getItem('pets')) || [];

  listaPets.forEach(pet => {
    const bloco = document.createElement('div');
    bloco.className = 'pet-card';
    bloco.innerHTML = `
      <img src="\${pet.imagem}" alt="\${pet.nome}" onerror="this.src='https://via.placeholder.com/150'">
      <p><strong>Nome:</strong> \${pet.nome}</p>
      <p><strong>Última localização:</strong> \${pet.localiza}</p>
      <p><strong>Espécie:</strong> \${pet.raca}</p>
      <p><strong>Data:</strong> \${pet.data}</p>
      <p><strong>Contato:</strong> \${pet.contato}</p>
      <p><strong>Descrição:</strong> \${pet.descricao || 'Não informada'}</p>
      <button onclick="editarPet(\${pet.id})">Editar</button>
      <button onclick="excluirPet(\${pet.id})">Excluir</button>
    `;
    galeria.appendChild(bloco);
  });
}

function editarPet(id) {
  const listaPets = JSON.parse(sessionStorage.getItem('pets')) || [];
  const pet = listaPets.find(p => p.id === id);
  if (!pet) return;

  const usuario = prompt('Digite seu nome de usuário:');
  const senha = prompt('Digite sua senha:');

  if (usuario === pet.usuario && senha === pet.senha) {
    const novoNome = prompt('Novo nome do pet:', pet.nome);
    const novaDescricao = prompt('Nova descrição:', pet.descricao);
    pet.nome = novoNome || pet.nome;
    pet.descricao = novaDescricao || pet.descricao;
    sessionStorage.setItem('pets', JSON.stringify(listaPets));
    alert('Pet atualizado com sucesso!');
    exibirPets();
  } else {
    alert('Usuário ou senha incorretos.');
  }
}

function excluirPet(id) {
  const listaPets = JSON.parse(sessionStorage.getItem('pets')) || [];
  const pet = listaPets.find(p => p.id === id);
  if (!pet) return;

  const usuario = prompt('Digite seu nome de usuário:');
  const senha = prompt('Digite sua senha:');

  if (usuario === pet.usuario && senha === pet.senha) {
    const novaLista = listaPets.filter(p => p.id !== id);
    sessionStorage.setItem('pets', JSON.stringify(novaLista));
    alert('Pet excluído com sucesso!');
    exibirPets();
  } else {
    alert('Usuário ou senha incorretos.');
  }
}

window.onload = exibirPets;

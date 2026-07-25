  const btnMobile = document.getElementById('btn-mobile');

  function toggleMenu(event) {
    if (event.type === 'touchstart') event.preventDefault();
    const nav = document.getElementById('nav-menu');
    nav.classList.toggle('active');
  }

  btnMobile.addEventListener('click', toggleMenu);
  btnMobile.addEventListener('touchstart', toggleMenu);


// Recupera todos os pets de todas as ONGs
const dadosPorOng = JSON.parse(localStorage.getItem('dadosPorOng')) || {};
let todosPets = [];

Object.values(dadosPorOng).forEach(ong => {
  if (Array.isArray(ong.pets)) {
    todosPets = todosPets.concat(ong.pets);
  }
});

// Função para exibir os pets
function exibir(pets) {
  const galeria = document.querySelector('.galeria-adocao');
  galeria.innerHTML = '<h1>Adoção Responsável</h1><div class="gallery"></div>';
  const container = galeria.querySelector('.gallery');

  if (pets.length === 0) {
    container.innerHTML = '<p>Nenhum pet encontrado com os filtros selecionados.</p>';
    return;
  }

  pets.forEach(pet => {
    const card = document.createElement('div');
    card.classList.add('animal-card');

    const img = document.createElement('img');
    img.src = pet.fotoPet || 'assets/img/default-pet.png';
    img.alt = `Foto de ${pet.nomePet}`;
    img.classList.add('foto-pet');
    img.style.width = '280px';

    const info = document.createElement('div');
    info.classList.add('info');
    info.innerHTML = `
      <h3>ID: ${pet.id}</h3>
      <h3><strong>Nome:</strong> ${pet.nomePet}</h3>
      <p><strong>Idade:</strong> ${pet.idadePet}</p>
      <p><strong>Tipo:</strong> ${pet.tipoPet}</p>
      <p><strong>Raça:</strong> ${pet.racaPet}</p>
      <p><strong>Sexo:</strong> ${pet.sexoPet}</p>
      <p><strong>Porte:</strong> ${pet.portePet}</p>
      <p><strong>Vacinado:</strong> ${pet.vacinaPet ? 'Sim' : 'Não'}</p>
      <p><strong>Castrado:</strong> ${pet.castradoPet ? 'Sim' : 'Não'}</p>
      <p><strong>Descrição:</strong> ${pet.descricaoPet}</p>
    `;

    const button = document.createElement('button');
    button.classList.add('adopt-btn');
    button.textContent = 'Quero adotar';
    button.addEventListener('click', () => {
      window.location.href = 'https://www.anjosdajuda.org/adote';
    });

    info.appendChild(button);
    card.appendChild(img);
    card.appendChild(info);
    container.appendChild(card);
  });
}

// Filtro por tipo, sexo e porte
document.getElementById('btnFiltrar').addEventListener('click', () => {
  const tipo = document.getElementById('filtroTipo').value;
  const sexo = document.getElementById('filtroSexo').value;
  const porte = document.getElementById('filtroPorte').value;

  const filtrados = todosPets.filter(pet => {
    const tipoOk = !tipo || pet.tipoPet.toLowerCase() === tipo.toLowerCase();
    const sexoOk = !sexo || pet.sexoPet === sexo;
    const porteOk = !porte || pet.portePet === porte;
    return tipoOk && sexoOk && porteOk;
  });

  exibir(filtrados);
});

// Botão de limpar filtros
document.getElementById('btnLimpar').addEventListener('click', () => {
  document.getElementById('filtroTipo').value = '';
  document.getElementById('filtroSexo').value = '';
  document.getElementById('filtroPorte').value = '';
  exibir(todosPets);
});

// Exibe todos ao carregar
exibir(todosPets);
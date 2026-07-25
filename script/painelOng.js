/* Arquivo de script: painelOng.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: painelOng.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */


  // Verifica ONG logada
  const ongLogada = JSON.parse(localStorage.getItem('ongLogada'));
  if (!ongLogada) {
    alert('Nenhuma ONG logada. Faça login primeiro.');
    window.location.href = 'index.html';
  }

  // Carrega dados da ONG logada
  const dadosPorOng = JSON.parse(localStorage.getItem('dadosPorOng')) || {};
  const dadosDaOng = dadosPorOng[ongLogada.id] || { pets: [] };

  const galeria = document.getElementById('galeriaPets');
  const filtroTipo = document.getElementById('filtroTipo');
  const filtroSexo = document.getElementById('filtroSexo');
  const filtroPorte = document.getElementById('filtroPorte');

  // Exibe pets
  function exibirPets(pets) {
    galeria.innerHTML = '';
    if (pets.length === 0) {
      galeria.innerHTML = '<p>Nenhum pet encontrado.</p>';
      return;
    }

    pets.forEach(pet => {
      const card = document.createElement('div');
      card.className = 'pet-card';
      card.style.width = '220px';
      card.style.margin = '10px';
      card.style.padding = '10px';
      card.style.border = '1px solid #ccc';
      card.style.borderRadius = '8px';
      card.style.boxShadow = '0 0 6px rgba(0,0,0,0.1)';
      card.style.display = 'inline-block';
      card.style.verticalAlign = 'top';
      card.style.backgroundColor = '#fff';
      card.style.textAlign = 'center';
card.innerHTML = `
  <img src="${pet.fotoPet}" alt="Foto de ${pet.nomePet}" style="width:100%; height:140px; object-fit:cover; border-radius:6px;">
  <div style="text-align: left;">
    <p><strong>ID:</strong> ${pet.id}</p>
    <h3>${pet.nomePet}</h3>
    <p><strong>Tipo:</strong> ${pet.tipoPet}</p>
    <p><strong>Raça:</strong> ${pet.racaPet}</p>
    <p><strong>Sexo:</strong> ${pet.sexoPet}</p>
    <p><strong>Porte:</strong> ${pet.portePet}</p>
    <p><strong>Vacinado:</strong> ${pet.vacinaPet ? 'Sim' : 'Não'}</p>
    <p><strong>Castrado:</strong> ${pet.castradoPet ? 'Sim' : 'Não'}</p>
  </div>
  <button onclick="editarPet('${pet.id}')" style="margin:5px; background:#4CAF50; color:#fff; border:none; border-radius:4px; padding:6px 10px;">✏️ Editar</button>
  <button onclick="excluirPet('${pet.id}')" style="margin:5px; background:#f44336; color:#fff; border:none; border-radius:4px; padding:6px 10px;">🗑️ Excluir</button>
`;
      galeria.appendChild(card);
    });
  }

  // Cadastro de pet
  document.getElementById('cadastroPet').addEventListener('submit', function(event) {
    event.preventDefault();
    const dados = new FormData(event.target);
    const arquivoFoto = dados.get('fotoPet');

    if (!arquivoFoto || !arquivoFoto.type.startsWith('image/')) {
      alert('Por favor, envie uma imagem válida do pet.');
      return;
    }

    const dadosObj = {
      id: 'pet-' + Date.now(),
      nomePet: dados.get('nomePet'),
      idadePet: dados.get('idadePet'),
      tipoPet: dados.get('tipoPet').toLowerCase(),
      racaPet: dados.get('racaPet'),
      sexoPet: dados.get('sexoPet').toLowerCase(),
      portePet: dados.get('portePet').toLowerCase(),
      descricaoPet: dados.get('descricaoPet'),
      vacinaPet: dados.get('vacinaPet') ? true : false,
      castradoPet: dados.get('castradoPet') ? true : false
    };

    for (let key in dadosObj) {
      if (dadosObj[key] === '' || dadosObj[key] === null) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      dadosObj.fotoPet = e.target.result;
      dadosDaOng.pets.push(dadosObj);
      dadosPorOng[ongLogada.id] = dadosDaOng;
      localStorage.setItem('dadosPorOng', JSON.stringify(dadosPorOng));
      document.getElementById('mensagem-sucesso').style.display = 'block';
      event.target.reset();
      exibirPets(dadosDaOng.pets);
    };
    reader.onerror = function() {
      alert('Erro ao carregar a imagem. Tente novamente.');
    };
    reader.readAsDataURL(arquivoFoto);
  });

  // Filtro
  document.getElementById('btnFiltrar').addEventListener('click', () => {
    const tipo = filtroTipo.value.trim().toLowerCase();
    const sexo = filtroSexo.value.trim().toLowerCase();
    const porte = filtroPorte.value.trim().toLowerCase();

    const filtrados = dadosDaOng.pets.filter(pet => {
      const tipoOk = !tipo || pet.tipoPet.toLowerCase() === tipo;
      const sexoOk = !sexo || pet.sexoPet.toLowerCase() === sexo;
      const porteOk = !porte || pet.portePet.toLowerCase() === porte;
      return tipoOk && sexoOk && porteOk;
    });

    exibirPets(filtrados);
  });

  document.getElementById('btnLimpar').addEventListener('click', () => {
    filtroTipo.value = '';
    filtroSexo.value = '';
    filtroPorte.value = '';
    exibirPets(dadosDaOng.pets);
  });

  // Excluir pet
  window.excluirPet = function(id) {
    dadosDaOng.pets = dadosDaOng.pets.filter(pet => pet.id !== id);
    dadosPorOng[ongLogada.id] = dadosDaOng;
    localStorage.setItem('dadosPorOng', JSON.stringify(dadosPorOng));
    exibirPets(dadosDaOng.pets);
  };

  // Editar pet
  window.editarPet = function(id) {
    const pet = dadosDaOng.pets.find(p => p.id === id);
    if (!pet) return;
    localStorage.setItem('petEditando', JSON.stringify(pet));
    localStorage.setItem('ongEditando', ongLogada.id);
    window.location.href = 'editarAdotado.html';
  };

  // Inicializa
  exibirPets(dadosDaOng.pets);

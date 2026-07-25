import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// Configuração do seu projeto PetConecta (CHAVES COMPLETAS ADICIONADAS) [3]
const firebaseConfig = {
  apiKey: "AIzaSyBpbc3GPkPHzN78cgXQsZWJ8ayzdiIdUYY",
  authDomain: "petconecta-db068.firebaseapp.com",
  projectId: "petconecta-db068",
  storageBucket: "petconecta-db068.firebasestorage.app",
  messagingSenderId: "1030110038715",
  appId: "1:1030110038715:web:151deca61831138159b79e"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- MENU DE NAVEGAÇÃO DINÂMICO COM AUTH ---
onAuthStateChanged(auth, (user) => {
  const menu = document.getElementById("menu");
  if (!menu) return;

  const linksBase = `
    <li><a href="index.html">Página Inicial</a></li>
    <li><a href="animais_encontra.html" style="font-weight: bold; color: #ff914d;">Encontrados</a></li>
    <li><a href="adocao.html">Adoção</a></li>
    <li><a href="dicas.html">Dicas</a></li>
    <li><a href="contato.html">Contato</a></li>
  `;

  if (user) {
    const nomeExibicao = user.displayName || user.email.split('@')[0];
    menu.innerHTML = `
      ${linksBase}
      <li><a href="cadastrados.html">Meus Pets</a></li>
      <li style="display: inline-block; padding: 8px 12px; font-weight: bold; color: #ffe0cc;">Olá, ${nomeExibicao}!</li>
      <li><a href="#" id="btn-logout" style="color: #ffccd5; font-weight: bold; text-decoration: none;">Sair</a></li>
    `;

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
          localStorage.removeItem("usuarioLogado");
          window.location.reload();
        });
      });
    }
  } else {
    menu.innerHTML = `
      ${linksBase}
      <li><a href="criar-conta.html" style="color: #4CAF50; font-weight: bold; text-decoration: none;">Entrar / Cadastrar</a></li>
    `;
  }
});

// Array em memória sincronizado
let encontradosFirestore = [];

// 🔍 Consulta inteligente: Busca apenas os pets com status "encontrado" direto no Firestore
const consultaEncontrados = query(collection(db, "pets"), where("status", "==", "encontrado"));

// Escuta em tempo real somente os pets filtrados no servidor [1]
onSnapshot(consultaEncontrados, (snapshot) => {
  encontradosFirestore = snapshot.docs.map(doc => {
    const pet = doc.data();
    const idCurto = doc.id.slice(0, 4);

    return {
      id: idCurto, 
      idCompleto: doc.id,
      nome: pet.nome || pet.nomePet || "Sem nome",
      raca: pet.raca || pet.tipoPet || "Não informada",
      sexo: pet.sexo || pet.sexoPet || "Indefinido",
      idade: pet.idade || pet.idadePet || "Não informada",
      localiza: pet.localiza || pet.localizacao || "Não informada",
      data: pet.data || "Não informada",
      contato: pet.contato || "Não informado",
      whatsapp: pet.whatsapp || "",
      descricao: pet.descricao || pet.descricaoPet || "Não informada",
      imagem: pet.imagem || pet.fotoPet || ""
    };
  });

  // Re-renderiza a tela automaticamente
  exibirPets();
});

export function exibirPets() {
  const container = document.querySelector('.container-cards');
  if (!container) return;
  container.innerHTML = '';

  // 🔍 Captura os valores dos filtros digitados pelo usuário
  let filtroId = document.getElementById('filtro-id')?.value.trim();
  if (filtroId && filtroId.length > 4) filtroId = filtroId.slice(0, 4);

  const filtroNome = document.getElementById('filtro-nome')?.value.trim().toLowerCase();
  const filtroLocalizacao = document.getElementById('filtro-localizacao')?.value.trim().toLowerCase();
  const filtroEspecie = document.getElementById('filtro-especie')?.value.trim().toLowerCase();

  const especieMap = {
    'cão': ['cachorro', 'cão', 'dog', 'canino', 'vira-lata'],
    'gato': ['gato', 'felino'],
    'outro': ['coelho', 'pássaro', 'tartaruga', 'outro']
  };

  // Os pets abaixo já vêm com o status "encontrado" garantido pelo Firestore!
  const petsFiltrados = encontradosFirestore.filter(pet => {
    const idMatch = !filtroId || pet.id.toString().toLowerCase().includes(filtroId.toLowerCase());
    const nomeMatch = !filtroNome || pet.nome.toLowerCase().includes(filtroNome);
    const localMatch = !filtroLocalizacao || pet.localiza.toLowerCase().includes(filtroLocalizacao);

    let especieMatch = true;
    if (filtroEspecie && especieMap[filtroEspecie]) {
      const racaPet = pet.raca?.toLowerCase() || '';
      especieMatch = especieMap[filtroEspecie].some(e => racaPet.includes(e));
    }

    return idMatch && nomeMatch && localMatch && especieMatch;
  });

  if (petsFiltrados.length === 0) {
    container.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum pet encontrado com os filtros aplicados.</p>';
    return;
  }

  petsFiltrados.forEach(pet => {
    const card = document.createElement('div');
    card.className = 'pet-card';

    card.innerHTML = `
      <img src="${pet.imagem || 'https://via.placeholder.com/150'}" alt="Imagem do pet" onerror="this.src='https://via.placeholder.com/150'">
      <h3>${pet.nome}</h3>
      <p><strong>ID:</strong> ${pet.id}</p>
      <p><strong>Tipo:</strong> ${pet.raca}</p>
      <p><strong>Sexo:</strong> ${pet.sexo}</p>
      <p><strong>Idade:</strong> ${pet.idade}</p>
      <p><strong>Última localização:</strong> ${pet.localiza}</p>
      <p><strong>Data:</strong> ${pet.data}</p>
      <p><strong>Contato:</strong> ${pet.contato}</p>
      ${pet.whatsapp ? `
        <p>
          <a href="https://wa.me/55${pet.whatsapp.replace(/\D/g, '')}" target="_blank" style="text-decoration: none; color: #25D366; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width:20px; vertical-align:middle;">
            Falar no WhatsApp
          </a>
        </p>
      ` : ''}
      <p><strong>Descrição:</strong> ${pet.descricao}</p>
      <p><strong>Status:</strong> <span style="color:green;"><strong>ENCONTRADO</strong></span></p>
    `;

    container.appendChild(card);
  });
}

// Configura os inputs para escutarem digitação e filtrarem em tempo real na tela
document.addEventListener('DOMContentLoaded', () => {
  const filtros = ['filtro-id', 'filtro-nome', 'filtro-localizacao', 'filtro-especie'];
  filtros.forEach(id => {
    const input = document.getElementById(id);  
    if (input) {
      input.addEventListener('input', () => {
        exibirPets(); // CORRIGIDO: Agora aponta corretamente para 'exibirPets'
      });
    }
  });
});

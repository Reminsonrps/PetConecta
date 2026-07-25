// 🚀 ATUALIZADO: Importamos getApps, getApp, os métodos de exclusão do Storage e os métodos de remoção/atualização do Firestore
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc as firestoreDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getStorage, ref as storageRef, deleteObject } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

// Configuração do seu projeto PetConecta
const firebaseConfig = {
  apiKey: "AIzaSyBpbc3GPkPHzN78cgXQsZWJ8ayzdiIdUYY",
  authDomain: "petconecta-db068.firebaseapp.com",
  projectId: "petconecta-db068",
  storageBucket: "petconecta-db068.firebasestorage.app",
  messagingSenderId: "1030110038715",
  appId: "1:1030110038715:web:151deca61831138159b79e"
};

// Inicialização segura do Firebase (evita conflitos com outros scripts)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app); // Inicializa o Storage para gerenciar as mídias

// Variável global na memória para guardar os pets ativos carregados do Firestore
let listaPetsFirestore = [];

// Escuta ativa no Firestore com tratamento de erros de permissão
onSnapshot(collection(db, "pets"), (snapshot) => {
  listaPetsFirestore = snapshot.docs.map((doc) => {
    const pet = doc.data();
    return {
      id: doc.id,
      nome: pet.nome || pet.nomePet || "Sem nome",
      localiza: pet.localiza || pet.localizacao || "Não informada",
      raca: pet.raca || pet.tipo || pet.tipoPet || "Não informada",
      tipo: pet.tipo || pet.tipoPet || pet.raca || "Não informado",
      sexo: pet.sexo || pet.sexoPet || "Não informado",
      porte: pet.porte || pet.portePet || "Não informado",
      data: pet.data || "Não informada",
      contato: pet.contato || pet.whatsapp || "Não informado",
      whatsapp: pet.whatsapp || pet.contato || "",
      descricao: pet.descricao || pet.descricaoPet || "Não informada",
      imagem: pet.imagem || pet.fotoPet || "",
      status: pet.status || "desaparecido",
      usuarioCriador: pet.usuarioCriador || null
    };
  });
  
  // 🚀 ADICIONADO: Ordenação local por data de desaparecimento recente (mais recentes primeiro)
  listaPetsFirestore.sort((a, b) => {
    const dataA = a.data ? new Date(a.data) : new Date(0);
    const dataB = b.data ? new Date(b.data) : new Date(0);
    return dataB - dataA;
  });

  // Renderiza a galeria sempre que houver mudanças no Firestore
  exibirPets();
}, (error) => {
  console.error("Erro na escuta ativa do Firestore (exibir_pets.js):", error);
  const galeria = document.querySelector(".container-cards");
  if (galeria) {
    galeria.innerHTML = `
      <p style="color: #ff3333; text-align: center; font-weight: bold; padding: 20px;">
        Erro de acesso ao banco de dados. Verifique se as regras de segurança 
        do Cloud Firestore estão configuradas para leitura pública no console do Firebase.
      </p>
    `;
  }
});

// Função global unificada para gerenciar as ações seguras (Editar, Excluir, Encontrar)
window.autenticarAcao = async function(acao, petId, usuarioCriador) {
  const usuarioLogadoStr = localStorage.getItem('usuarioLogado');
  const usuarioLogado = usuarioLogadoStr ? JSON.parse(usuarioLogadoStr) : null;

  if (!usuarioLogado) {
    alert("Você precisa estar autenticado para realizar esta ação.");
    return;
  }

  // Segurança no cliente: Garante que apenas o criador pode alterar o pet
  if (usuarioCriador && usuarioLogado.usuario.toLowerCase() !== usuarioCriador.toLowerCase()) {
    alert("Ação não autorizada. Apenas o criador deste pet pode realizar alterações.");
    return;
  }

  const pet = listaPetsFirestore.find(p => p.id === petId);
  if (!pet) return;

  if (acao === "excluir") {
    if (!confirm(`Deseja realmente excluir permanentemente o cadastro de ${pet.nome}?`)) return;

    try {
      // 1. Deleta a imagem física do Cloud Storage se houver url válida [1]
      if (pet.imagem && pet.imagem.includes("firebasestorage.googleapis.com")) {
        console.log("Excluindo foto do Storage...");
        const refDoArquivo = storageRef(storage, pet.imagem);
        await deleteObject(refDoArquivo);
      }

      // 2. Remove o documento do Firestore [2]
      console.log("Excluindo dados do Firestore...");
      await deleteDoc(firestoreDoc(db, "pets", petId));
      
      alert("Cadastro e foto correspondente excluídos com sucesso!");
    } catch (error) {
      console.error("Erro ao realizar exclusão completa:", error);
      alert("Houve um erro ao excluir o cadastro ou a foto do pet.");
    }
  } 
  else if (acao === "encontrei") {
    if (!confirm(`Deseja alterar o status de ${pet.nome} para "Encontrado"?`)) return;

    try {
      await updateDoc(firestoreDoc(db, "pets", petId), { status: "encontrado" });
      alert("Status updated successfully! Parabéns por encontrar seu pet.");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status.");
    }
  } 
  else if (acao === "editar") {
    // 🚀 REDIRECIONAMENTO CORRIGIDO: Agora aponta para a página editar.html [2]
    window.location.href = `editar.html?id=${petId}`;
  }
};


window.exibirPets = function exibirPets() {
  const galeria = document.querySelector(".container-cards");
  if (!galeria) return;

  galeria.innerHTML = "";

  // Agora lemos direto da nossa variável sincronizada com o Firebase
  const listaPets = listaPetsFirestore;

  // Filtros de texto/compatibilidade
  const campoNome = document.getElementById("filtro-nome");
  const campoLocal = document.getElementById("filtro-localizacao");
  const campoEspecie = document.getElementById("filtro-especie");

  const filtroNome = (campoNome?.value || "").toLowerCase();
  const filtroLocal = (campoLocal?.value || "").toLowerCase();
  const filtroEspecie = campoEspecie?.value || "";

  // Filtros dropdown do index.html (Desaparecidos)
  const campoTipo = document.getElementById("filtroTipoDesaparecido");
  const campoSexo = document.getElementById("filtroSexoDesaparecido");
  const campoPorte = document.getElementById("filtroPorteDesaparecido");

  const filtroTipo = (campoTipo?.value || "").trim().toLowerCase();
  const filtroSexo = (campoSexo?.value || "").trim().toLowerCase();
  const filtroPorte = (campoPorte?.value || "").trim().toLowerCase();

  const petsFiltrados = listaPets.filter((pet) => {
    const nomeMatch = !campoNome || pet.nome.toLowerCase().includes(filtroNome);
    const localMatch = !campoLocal || pet.localiza.toLowerCase().includes(filtroLocal);
    const especieMatch = !campoEspecie || filtroEspecie === "" || pet.raca.toLowerCase() === filtroEspecie.toLowerCase();

    let tipoMatch = true;
    if (filtroTipo) {
      const petTipo = (pet.tipo || pet.raca || "").toLowerCase();
      if (filtroTipo === "cão" || filtroTipo === "cao" || filtroTipo === "cachorro") {
        tipoMatch = (petTipo === "cachorro" || petTipo === "cão" || petTipo === "cao");
      } else {
        tipoMatch = petTipo.includes(filtroTipo);
      }
    }

    let sexoMatch = true;
    if (filtroSexo) {
      const petSexo = (pet.sexo || "").toLowerCase();
      sexoMatch = petSexo === filtroSexo;
    }

    let porteMatch = true;
    if (filtroPorte) {
      const petPorte = (pet.porte || "").toLowerCase();
      porteMatch = petPorte === filtroPorte;
    }

    return nomeMatch && localMatch && especieMatch && tipoMatch && sexoMatch && porteMatch;
  });

  if (petsFiltrados.length === 0) {
    if (listaPets.length === 0) {
      galeria.innerHTML = "<p>Nenhum pet cadastrado ainda.</p>";
    } else {
      galeria.innerHTML = "<p>Nenhum pet encontrado com os filtros aplicados.</p>";
    }
    return;
  }

  petsFiltrados.forEach((pet) => {
    const bloco = document.createElement("div");
    bloco.className = "pet-card";
    
    const whatsappNumero = pet.whatsapp ? pet.whatsapp.replace(/\D/g, "") : "";
    const whatsappLink = whatsappNumero && pet.contato !== "Não informado" ? `
      <p><strong>Contato:</strong> 
        <a href="https://wa.me/55${whatsappNumero}" target="_blank" class="whatsapp-link" style="text-decoration: none; color: #25D366; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width: 20px !important; height: 20px !important; border-radius: 0 !important; object-fit: contain !important; margin: 0 !important; display: inline-block;">
          ${pet.contato}
        </a>
      </p>
    ` : `<p><strong>Contato:</strong> ${pet.contato}</p>`;

    const statusColor = pet.status === 'encontrado' ? 'green' : '#ff6600';
    const statusTexto = pet.status ? pet.status.toUpperCase() : 'DESAPARECIDO';

    const usuarioLogadoStr = localStorage.getItem('usuarioLogado');
    const usuarioLogado = usuarioLogadoStr ? JSON.parse(usuarioLogadoStr) : null;
    const ehCriador = usuarioLogado && (!pet.usuarioCriador || usuarioLogado.usuario.toLowerCase() === pet.usuarioCriador.toLowerCase());

    let actionsHTML = '';
    if (ehCriador) {
      actionsHTML = `
        <button class="btn editar" onclick="window.autenticarAcao('editar', '${pet.id}', '${pet.usuarioCriador}')">✏️ Editar</button>
        <button class="btn excluir" onclick="window.autenticarAcao('excluir', '${pet.id}', '${pet.usuarioCriador}')">🗑️ Excluir</button>
      `;
    }

    bloco.innerHTML = `
      <img src="${pet.imagem}" alt="${pet.nome}" class="pet-image" onerror="this.src='https://via.placeholder.com/150'">
      <h3>${pet.nome}</h3>
      <div class="sumido">
        <strong>Status:</strong> <span style="color:${statusColor};"><strong>${statusTexto}</strong></span>
      </div>
      <p><strong>Última localização:</strong> ${pet.localiza}</p>
      <p><strong>Espécie:</strong> ${pet.raca}</p>
      ${pet.porte && pet.porte !== "Não informado" ? `<p><strong>Porte:</strong> ${pet.porte}</p>` : ""}
      <p><strong>Data:</strong> ${pet.data}</p>
      ${whatsappLink}
      <p><strong>Descrição:</strong> ${pet.descricao || "Não informada"}</p>
      <div class="actions" style="display: flex; gap: 5px; margin-top: 10px;">
        ${actionsHTML}
      </div>
    `;

    const actionsDiv = bloco.querySelector('.actions');
    
    // Botão Saiba Mais
    const saibaMaisBtn = document.createElement('button');
    saibaMaisBtn.textContent = 'Saiba Mais';
    saibaMaisBtn.className = 'btn-saiba-mais';
    saibaMaisBtn.style.flex = '1';
    saibaMaisBtn.style.borderRadius = '5px';
    saibaMaisBtn.style.cursor = 'pointer';
    saibaMaisBtn.style.fontSize = '10px';
    saibaMaisBtn.addEventListener('click', () => {
      window.location.href = `detalhes.html?id=${pet.id}`;
    });
    actionsDiv.appendChild(saibaMaisBtn);

    // 🚀 ADICIONADO: Botão "Compartilhar" para WhatsApp (Com correção de URL dinámica para subpastas do GitHub Pages)
    const compartilharBtn = document.createElement('button');
    compartilharBtn.textContent = '📢 Compartilhar';
    compartilharBtn.className = 'btn-compartilhar';
    compartilharBtn.style.flex = '1';
    compartilharBtn.style.backgroundColor = '#25D366';
    compartilharBtn.style.color = '#fff';
    compartilharBtn.style.border = 'none';
    compartilharBtn.style.borderRadius = '5px';
    compartilharBtn.style.cursor = 'pointer';
    compartilharBtn.style.fontSize = '10px';
    compartilharBtn.addEventListener('click', () => {
      // 🚀 CORREÇÃO DE DIRETÓRIO: Descobre a pasta atual dinamicamente (corrige o erro 404)
      const pastaBase = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
      const linkDetalhes = `${pastaBase}/detalhes.html?id=${pet.id}`;
      
      const msg = `🐾 *PetConecta - Pet Desaparecido!* 🐾%0A%0A` +
                  `*Nome:* ${pet.nome}%0A` +
                  `*Tipo:* ${pet.tipo}%0A` +
                  `*Visto por último em:* ${pet.localiza}%0A` +
                  `*Descrição:* ${pet.descricao || 'Sem descrição.'}%0A%0A` +
                  `👉 *Ajude-nos a reencontrar:* ${linkDetalhes}`;
      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
    });
    actionsDiv.appendChild(compartilharBtn);

    // Botão "Encontrei"
    if (ehCriador && pet.status !== 'encontrado') {
      const encontrouBtn = document.createElement('button');
      encontrouBtn.textContent = 'Encontrei';
      encontrouBtn.className = 'btn-encontrou';
      encontrouBtn.style.flex = '1';
      encontrouBtn.style.backgroundColor = '#4CAF50';
      encontrouBtn.style.color = '#fff';
      encontrouBtn.style.border = 'none';
      encontrouBtn.style.borderRadius = '5px';
      encontrouBtn.style.cursor = 'pointer';
      encontrouBtn.style.fontSize = '10px';
      encontrouBtn.addEventListener('click', () => {
        window.autenticarAcao('encontrei', pet.id, pet.usuarioCriador);
      });
      actionsDiv.appendChild(encontrouBtn);
    }

    galeria.appendChild(bloco);
  });
}

function configurarBotaoCadastro() {
  const btnCadastrar = document.getElementById("action-btn");
  if (!btnCadastrar) return;

  btnCadastrar.addEventListener("click", () => {
    window.location.href = "publicar.html";
  });
}

function configurarFiltrosDesaparecidos() {
  const btnFiltrar = document.getElementById("btnFiltrarDesaparecido");
  const btnLimpar = document.getElementById("btnLimparDesaparecido");

  if (btnFiltrar) {
    btnFiltrar.addEventListener("click", () => {
      exibirPets();
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      const campoTipo = document.getElementById("filtroTipoDesaparecido");
      const campoSexo = document.getElementById("filtroSexoDesaparecido");
      const campoPorte = document.getElementById("filtroPorteDesaparecido");

      if (campoTipo) campoTipo.value = "";
      if (campoSexo) campoSexo.value = "";
      if (campoPorte) campoPorte.value = "";

      exibirPets();
    });
  }
}

// Inicializações básicas
function inicializar() {
  configurarBotaoCadastro();
  configurarFiltrosDesaparecidos();
}

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", inicializar);
} else {
  inicializar();
}

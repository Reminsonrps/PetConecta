import { db, storage, buildPetsQuery } from "./firebase.js";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc as firestoreDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import {
  ref as storageRef,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

let listaPetsFirestore = [];
let renderQueued = false;
let filtroProximidade = null;

// Estado compartilhado da listagem: dados recebidos, renderizacao agendada e filtro geografico ativo.

// Mantém o número de pets exibidos por bloco para controlar a paginação.
// O valor escolhido foi 20 porque equilibra velocidade de carregamento,
// uso de rede e experiência em celular.
const PETS_PER_PAGE = 20;
let visiblePetsCount = PETS_PER_PAGE;

function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    exibirPets();
  });
}

// Reinicia a paginação sempre que um filtro muda o conjunto de resultados.
function resetVisiblePetsCount() {
  visiblePetsCount = PETS_PER_PAGE;
}

// Normaliza textos para tornar filtros de localidade independentes de acentos e caixa.
function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Reconstroi o seletor de localidades com os valores atualmente existentes no Firestore.
function atualizarOpcoesFiltroCidade(listaPets) {
  const campoCidade = document.getElementById("filtroCidadeDesaparecido");
  if (!campoCidade) return;

  const valorAtual = campoCidade.value;
  const opcoesUnicas = Array.from(
    new Set(
      listaPets
        .map((pet) => String(pet.localiza || pet.localizacao || "").trim())
        .filter((local) => local && normalizeText(local) !== "nao informada"),
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));

  campoCidade.innerHTML = '<option value="">Localidade</option>';

  opcoesUnicas.forEach((local) => {
    const option = document.createElement("option");
    option.value = local;
    option.textContent = local;
    campoCidade.appendChild(option);
  });

  if (valorAtual && opcoesUnicas.includes(valorAtual)) {
    campoCidade.value = valorAtual;
  }
}

function renderizarBotaoCarregarMais(totalFiltrado) {
  const galeria = document.querySelector(".container-cards");
  if (!galeria) return;

  // Remove qualquer botão antigo antes de criar o novo para evitar duplicação.
  const botaoAntigo = document.getElementById("btn-carregar-mais");
  if (botaoAntigo) {
    botaoAntigo.remove();
  }

  // Só mostra o botão quando ainda houver itens ocultos para exibir.
  if (visiblePetsCount >= totalFiltrado) return;

  const wrapper = document.createElement("div");
  wrapper.style.width = "100%";
  wrapper.style.display = "flex";
  wrapper.style.justifyContent = "center";
  wrapper.style.marginTop = "1rem";

  const button = document.createElement("button");
  button.id = "btn-carregar-mais";
  button.type = "button";
  button.className = "btn";
  button.textContent = "Carregar mais";
  button.addEventListener("click", () => {
    // Ao clicar, adiciona mais 20 pets na lista atual para manter a tela leve.
    visiblePetsCount += PETS_PER_PAGE;
    exibirPets();
  });

  wrapper.appendChild(button);
  galeria.appendChild(wrapper);
}

// Mantem a lista sincronizada com o Firestore e adapta documentos antigos ao formato usado pelos cards.
onSnapshot(
  buildPetsQuery({ maxItems: null }),
  (snapshot) => {
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
        usuarioCriador: pet.usuarioCriador || null,
        lat: Number(pet.lat),
        lng: Number(pet.lng),
      };
    });

    listaPetsFirestore.sort((a, b) => {
      const dataA = a.data ? new Date(a.data) : new Date(0);
      const dataB = b.data ? new Date(b.data) : new Date(0);
      return dataB - dataA;
    });

    atualizarOpcoesFiltroCidade(listaPetsFirestore);

    scheduleRender();
  },
  (error) => {
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
  },
);

function distanciaEmQuilometros(lat1, lng1, lat2, lng2) {
  const raioTerraKm = 6371;
  const diferencaLat = ((lat2 - lat1) * Math.PI) / 180;
  const diferencaLng = ((lng2 - lng1) * Math.PI) / 180;
  const senoLat = Math.sin(diferencaLat / 2);
  const senoLng = Math.sin(diferencaLng / 2);
  const haversine =
    senoLat * senoLat +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      senoLng *
      senoLng;

  return 2 * raioTerraKm * Math.asin(Math.sqrt(haversine));
}

// API usada pela home para ativar ou remover o filtro de pets dentro de um raio.
window.filtrarPetsPorRaio = function filtrarPetsPorRaio(
  latitude,
  longitude,
  raioKm = 10,
) {
  filtroProximidade = { latitude, longitude, raioKm };
  resetVisiblePetsCount();
  scheduleRender();
};

window.limparFiltroProximidade = function limparFiltroProximidade() {
  filtroProximidade = null;
  resetVisiblePetsCount();
  scheduleRender();
};

// Autoriza e executa as acoes de editar, excluir ou marcar um pet como encontrado.
window.autenticarAcao = async function (acao, petId, usuarioCriador) {
  const usuarioLogadoStr = localStorage.getItem("usuarioLogado");
  const usuarioLogado = usuarioLogadoStr ? JSON.parse(usuarioLogadoStr) : null;

  if (!usuarioLogado) {
    alert("Você precisa estar autenticado para realizar esta ação.");
    return;
  }

  // Segurança no cliente: Garante que apenas o criador pode alterar o pet
  if (
    usuarioCriador &&
    usuarioLogado.usuario.toLowerCase() !== usuarioCriador.toLowerCase()
  ) {
    alert(
      "Ação não autorizada. Apenas o criador deste pet pode realizar alterações.",
    );
    return;
  }

  const pet = listaPetsFirestore.find((p) => p.id === petId);
  if (!pet) return;

  if (acao === "excluir") {
    if (
      !confirm(
        `Deseja realmente excluir permanentemente o cadastro de ${pet.nome}?`,
      )
    )
      return;

    try {
      if (pet.imagem && pet.imagem.includes("firebasestorage.googleapis.com")) {
        console.log("Excluindo foto do Storage...");
        const refDoArquivo = storageRef(storage, pet.imagem);
        await deleteObject(refDoArquivo);
      }

      console.log("Excluindo dados do Firestore...");
      await deleteDoc(firestoreDoc(db, "pets", petId));

      alert("Cadastro e foto correspondente excluídos com sucesso!");
    } catch (error) {
      console.error("Erro ao realizar exclusão completa:", error);
      alert("Houve um erro ao excluir o cadastro ou a foto do pet.");
    }
  } else if (acao === "encontrei") {
    if (!confirm(`Deseja alterar o status de ${pet.nome} para "Encontrado"?`))
      return;

    try {
      await updateDoc(firestoreDoc(db, "pets", petId), {
        status: "encontrado",
      });
      alert("Status atualizado com sucesso! Parabéns por encontrar seu pet.");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status.");
    }
  } else if (acao === "editar") {
    window.location.href = `editar.html?id=${petId}`;
  }
};

window.exibirPets = function exibirPets() {
  const galeria = document.querySelector(".container-cards");
  if (!galeria) return;

  const fragment = document.createDocumentFragment();
  const listaPets = listaPetsFirestore;

  // Le os filtros de texto usados pelas paginas que compartilham este modulo.
  const campoNome = document.getElementById("filtro-nome");
  const campoLocal = document.getElementById("filtro-localizacao");
  const campoEspecie = document.getElementById("filtro-especie");

  const filtroNome = (campoNome?.value || "").toLowerCase();
  const filtroLocal = (campoLocal?.value || "").toLowerCase();
  const filtroEspecie = campoEspecie?.value || "";

  // Le os filtros especificos da listagem de pets desaparecidos na home.
  const campoTipo = document.getElementById("filtroTipoDesaparecido");
  const campoSexo = document.getElementById("filtroSexoDesaparecido");
  const campoPorte = document.getElementById("filtroPorteDesaparecido");
  const campoCidade = document.getElementById("filtroCidadeDesaparecido");

  const filtroTipo = (campoTipo?.value || "").trim().toLowerCase();
  const filtroSexo = (campoSexo?.value || "").trim().toLowerCase();
  const filtroPorte = (campoPorte?.value || "").trim().toLowerCase();
  const filtroCidade = normalizeText(campoCidade?.value || "");

  // Combina filtros textuais, selecoes, localidade e distancia geografica.
  const petsFiltrados = listaPets.filter((pet) => {
    const nomeMatch = !campoNome || pet.nome.toLowerCase().includes(filtroNome);
    const localMatch =
      !campoLocal || pet.localiza.toLowerCase().includes(filtroLocal);
    const especieMatch =
      !campoEspecie ||
      filtroEspecie === "" ||
      pet.raca.toLowerCase() === filtroEspecie.toLowerCase();

    let tipoMatch = true;
    if (filtroTipo) {
      const petTipo = (pet.tipo || pet.raca || "").toLowerCase();
      if (
        filtroTipo === "cão" ||
        filtroTipo === "cao" ||
        filtroTipo === "cachorro"
      ) {
        tipoMatch =
          petTipo === "cachorro" || petTipo === "cão" || petTipo === "cao";
      } else {
        tipoMatch = petTipo.includes(filtroTipo);
      }
    }
     // Filtro de sexo é aplicado apenas se o campo estiver preenchido.
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
    // Filtro de cidade é aplicado apenas se o campo estiver preenchido.
    let cidadeMatch = true;
    if (filtroCidade) {
      const localPet = normalizeText(pet.localiza || pet.localizacao || "");
      cidadeMatch = localPet.includes(filtroCidade);
    }
     // Filtro de proximidade geográfica é aplicado apenas se o filtro estiver ativo.
    let proximidadeMatch = true;
    if (filtroProximidade) {
      const possuiCoordenadas =
        Number.isFinite(pet.lat) && Number.isFinite(pet.lng);
      proximidadeMatch =
        possuiCoordenadas &&
        distanciaEmQuilometros(
          filtroProximidade.latitude,
          filtroProximidade.longitude,
          pet.lat,
          pet.lng,
        ) <= filtroProximidade.raioKm;
    }
   // Retorna true apenas se todos os filtros forem satisfeitos.
    return (
      nomeMatch &&
      localMatch &&
      especieMatch &&
      tipoMatch &&
      sexoMatch &&
      porteMatch &&
      cidadeMatch &&
      proximidadeMatch
    );
  });

  if (petsFiltrados.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.textContent =
      listaPets.length === 0
        ? "Nenhum pet cadastrado ainda."
        : "Nenhum pet encontrado com os filtros aplicados.";
    galeria.replaceChildren(mensagem);
    return;
  }

  // Pagina o resultado para evitar renderizar todos os cards de uma vez.
  // para serem carregados sob demanda com o botão "Carregar mais".
  const petsVisiveis = petsFiltrados.slice(0, visiblePetsCount);

  galeria.replaceChildren();

  petsVisiveis.forEach((pet) => {
    // Monta cada card com DOM seguro, evitando inserir dados do Firestore como HTML bruto.
    const bloco = document.createElement("article");
    bloco.className = "pet-card";

    const img = document.createElement("img");
    img.src = pet.imagem || "https://via.placeholder.com/150";
    img.alt = pet.nome;
    img.className = "pet-image";
    img.loading = "lazy";
    img.onerror = () => {
      img.src = "https://via.placeholder.com/150";
    };
    bloco.appendChild(img);

    const titulo = document.createElement("h3");
    titulo.textContent = pet.nome;
    bloco.appendChild(titulo);

    const statusWrap = document.createElement("div");
    statusWrap.className = "sumido";
    const statusLabel = document.createElement("strong");
    statusLabel.textContent = "Status: ";
    const statusValue = document.createElement("span");
    statusValue.style.color = pet.status === "encontrado" ? "green" : "#ff6600";
    statusValue.style.fontWeight = "700";
    statusValue.textContent = pet.status
      ? pet.status.toUpperCase()
      : "DESAPARECIDO";
    statusWrap.appendChild(statusLabel);
    statusWrap.appendChild(statusValue);
    bloco.appendChild(statusWrap);

    const campos = [
      ["Última localização", pet.localiza],
      ["Espécie", pet.raca],
      ["Data", pet.data],
      ["Descrição", pet.descricao || "Não informada"],
    ];

    if (pet.porte && pet.porte !== "Não informado") {
      campos.splice(2, 0, ["Porte", pet.porte]);
    }

    campos.forEach(([label, valor]) => {
      const linha = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      linha.appendChild(strong);
      linha.appendChild(
        document.createTextNode(String(valor ?? "Não informado")),
      );
      bloco.appendChild(linha);
    });

    const contatoLinha = document.createElement("p");
    const contatoTitulo = document.createElement("strong");
    contatoTitulo.textContent = "Contato: ";
    contatoLinha.appendChild(contatoTitulo);
    contatoLinha.appendChild(
      document.createTextNode("Disponível após abrir os detalhes do anúncio."),
    );
    bloco.appendChild(contatoLinha);

    // Acoes administrativas aparecem apenas para o criador autenticado.
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "actions";

    const usuarioLogadoStr = localStorage.getItem("usuarioLogado");
    const usuarioLogado = usuarioLogadoStr
      ? JSON.parse(usuarioLogadoStr)
      : null;
    const ehCriador =
      usuarioLogado &&
      (!pet.usuarioCriador ||
        usuarioLogado.usuario.toLowerCase() ===
          pet.usuarioCriador.toLowerCase());

    if (ehCriador) {
      const editarBtn = document.createElement("button");
      editarBtn.className = "btn editar";
      editarBtn.textContent = "✏️ Editar";
      editarBtn.addEventListener("click", () => {
        window.autenticarAcao("editar", pet.id, pet.usuarioCriador);
      });
      actionsDiv.appendChild(editarBtn);

      const excluirBtn = document.createElement("button");
      excluirBtn.className = "btn excluir";
      excluirBtn.textContent = "🗑️ Excluir";
      excluirBtn.addEventListener("click", () => {
        window.autenticarAcao("excluir", pet.id, pet.usuarioCriador);
      });
      actionsDiv.appendChild(excluirBtn);
    }

    const saibaMaisBtn = document.createElement("button");
    saibaMaisBtn.textContent = "Saiba Mais";
    saibaMaisBtn.className = "btn btn-saiba-mais";
    saibaMaisBtn.addEventListener("click", () => {
      window.location.href = `detalhes.html?id=${pet.id}`;
    });
    actionsDiv.appendChild(saibaMaisBtn);

    const compartilharBtn = document.createElement("button");
    compartilharBtn.textContent = "📢 Compartilhar";
    compartilharBtn.className = "btn btn-compartilhar";
    compartilharBtn.style.backgroundColor = "#25D366";
    compartilharBtn.style.color = "#fff";
    compartilharBtn.addEventListener("click", () => {
      const pastaBase = window.location.href.substring(
        0,
        window.location.href.lastIndexOf("/"),
      );
      const linkDetalhes = `${pastaBase}/detalhes.html?id=${pet.id}`;
      const msg =
        `🐾 *PetConecta - Pet Desaparecido!* 🐾%0A%0A` +
        `*Nome:* ${pet.nome}%0A` +
        `*Tipo:* ${pet.tipo}%0A` +
        `*Visto por último em:* ${pet.localiza}%0A` +
        `*Descrição:* ${pet.descricao || "Sem descrição."}%0A%0A` +
        `👉 *Ajude-nos a reencontrar:* ${linkDetalhes}`;
      window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
    });
    actionsDiv.appendChild(compartilharBtn);

    if (ehCriador && pet.status !== "encontrado") {
      const encontrouBtn = document.createElement("button");
      encontrouBtn.textContent = "Encontrei";
      encontrouBtn.className = "btn btn-encontrou";
      encontrouBtn.style.backgroundColor = "#4CAF50";
      encontrouBtn.style.color = "#fff";
      encontrouBtn.addEventListener("click", () => {
        window.autenticarAcao("encontrei", pet.id, pet.usuarioCriador);
      });
      actionsDiv.appendChild(encontrouBtn);
    }

    bloco.appendChild(actionsDiv);
    fragment.appendChild(bloco);
  });

  galeria.appendChild(fragment);

  // Exibe o controle de paginação somente quando ainda existem cards ocultos.
  renderizarBotaoCarregarMais(petsFiltrados.length);
};

function configurarBotaoCadastro() {
  const btnCadastrar = document.getElementById("action-btn");
  if (!btnCadastrar) return;

  btnCadastrar.addEventListener("click", () => {
    window.location.href = "publicar.html";
  });
}

// Liga os botoes de filtro e limpeza aos campos da home.
function configurarFiltrosDesaparecidos() {
  const btnFiltrar = document.getElementById("btnFiltrarDesaparecido");
  const btnLimpar = document.getElementById("btnLimparDesaparecido");

  if (btnFiltrar) {
    btnFiltrar.addEventListener("click", () => {
      // Quando o usuário filtra, a contagem visível volta ao bloco inicial para
      // evitar que a lista fique em um estado de paginação inconsistente.
      resetVisiblePetsCount();
      exibirPets();
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      const campoTipo = document.getElementById("filtroTipoDesaparecido");
      const campoSexo = document.getElementById("filtroSexoDesaparecido");
      const campoPorte = document.getElementById("filtroPorteDesaparecido");
      const campoCidade = document.getElementById("filtroCidadeDesaparecido");

      if (campoTipo) campoTipo.value = "";
      if (campoSexo) campoSexo.value = "";
      if (campoPorte) campoPorte.value = "";
      if (campoCidade) campoCidade.value = "";

      window.limparFiltroProximidade?.();
      resetVisiblePetsCount();
      exibirPets();
    });
  }
}// Inicializa a pagina atual, ligando os eventos e filtros.
function inicializar() {
  // Inicializa apenas os controles presentes na pagina atual.
  configurarBotaoCadastro();
  configurarFiltrosDesaparecidos();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializar);
} else {
  inicializar();
}

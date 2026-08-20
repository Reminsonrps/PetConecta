import { auth, db, buildPetsQuery } from "./firebase.js?v=20260818-3";
import { onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// --- MENU DE NAVEGACAO DINAMICO COM AUTH ---
// Reconstroi o menu conforme o estado de autenticacao sem inserir dados do usuario como HTML bruto.
onAuthStateChanged(auth, (user) => {
  const menu = document.getElementById("menu");
  if (!menu) return;

  const createLinkItem = (href, label, external = false) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    item.appendChild(link);
    return item;
  };

  const createTextItem = (label, className) => {
    const item = document.createElement("li");
    item.className = className;
    const span = document.createElement("span");
    span.className = className === "menu-user-item" ? "menu-user" : "";
    span.textContent = label;
    item.appendChild(span);
    return item;
  };

  menu.replaceChildren();

  menu.appendChild(createLinkItem("index.html", "Página Inicial"));
  menu.appendChild(createLinkItem("animais_encontra.html", "Encontrados"));
  menu.appendChild(
    createLinkItem("https://www.anjosdajuda.org/adote", "Adoção", true),
  );
  menu.appendChild(createLinkItem("dicas.html", "Cuidados"));
  menu.appendChild(createLinkItem("contato.html", "Contato"));

  if (user) {
    const nomeExibicao = user.displayName || user.email.split("@")[0];
    menu.appendChild(createLinkItem("cadastrados.html", "Meus Pets"));
    menu.appendChild(createTextItem(`Olá, ${nomeExibicao}!`, "menu-user-item"));

    const itemLogout = document.createElement("li");
    const btnLogout = document.createElement("a");
    btnLogout.href = "#";
    btnLogout.textContent = "Sair";
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth).then(() => {
        localStorage.removeItem("usuarioLogado");
        window.location.reload();
      });
    });
    itemLogout.appendChild(btnLogout);
    menu.appendChild(itemLogout);
  } else {
    menu.appendChild(createLinkItem("criar-conta.html", "Entrar / Cadastrar"));
  }
});

let encontradosFirestore = [];
let renderQueued = false;

// Agrupa atualizacoes do Firestore e dos filtros em um unico frame de renderizacao.
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    exibirPets();
  });
}

// Escuta somente documentos marcados como encontrados; a ordenacao ocorre no cliente para evitar indice composto.
onSnapshot(
  buildPetsQuery({ status: "encontrado", maxItems: null, orderByData: false }),
  (snapshot) => {
    encontradosFirestore = snapshot.docs.map((doc) => {
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
        descricao: pet.descricao || pet.descricaoPet || "Não informada",
        imagem: pet.imagem || pet.fotoPet || "",
      };
    });

    encontradosFirestore.sort((petA, petB) => {
      const dataA = new Date(petA.data).getTime() || 0;
      const dataB = new Date(petB.data).getTime() || 0;
      return dataB - dataA;
    });

    scheduleRender();
  },
  (error) => {
    console.error("Erro ao carregar pets encontrados:", error);
    const container = document.querySelector(".container-cards");
    if (container) {
      container.innerHTML = "";
      const mensagem = document.createElement("p");
      mensagem.textContent =
        "Não foi possível carregar os pets encontrados. Tente novamente mais tarde.";
      mensagem.style.color = "#b42318";
      mensagem.style.textAlign = "center";
      container.appendChild(mensagem);
    }
  },
);

export function exibirPets() {
  const container = document.querySelector(".container-cards");
  if (!container) return;
  container.innerHTML = "";

  // Captura os valores dos filtros digitados pelo usuario.
  let filtroId = document.getElementById("filtro-id")?.value.trim();
  if (filtroId && filtroId.length > 4) filtroId = filtroId.slice(0, 4);

  const filtroNome = document
    .getElementById("filtro-nome")
    ?.value.trim()
    .toLowerCase();
  const filtroLocalizacao = document
    .getElementById("filtro-localizacao")
    ?.value.trim()
    .toLowerCase();
  const filtroEspecie = document
    .getElementById("filtro-especie")
    ?.value.trim()
    .toLowerCase();

  const especieMap = {
    cão: ["cachorro", "cão", "dog", "canino", "vira-lata"],
    gato: ["gato", "felino"],
    outro: ["coelho", "pássaro", "tartaruga", "outro"],
  };

  // Os pets abaixo ja chegam com status "encontrado" garantido pela consulta do Firestore.
  const petsFiltrados = encontradosFirestore.filter((pet) => {
    const idMatch =
      !filtroId ||
      pet.id.toString().toLowerCase().includes(filtroId.toLowerCase());
    const nomeMatch =
      !filtroNome || pet.nome.toLowerCase().includes(filtroNome);
    const localMatch =
      !filtroLocalizacao ||
      pet.localiza.toLowerCase().includes(filtroLocalizacao);

    let especieMatch = true;
    if (filtroEspecie && especieMap[filtroEspecie]) {
      const racaPet = pet.raca?.toLowerCase() || "";
      especieMatch = especieMap[filtroEspecie].some((e) => racaPet.includes(e));
    }

    return idMatch && nomeMatch && localMatch && especieMatch;
  });

  if (petsFiltrados.length === 0) {
    const msg = document.createElement("p");
    msg.style.textAlign = "center";
    msg.style.width = "100%";
    msg.textContent = "Nenhum pet encontrado com os filtros aplicados.";
    container.appendChild(msg);
    return;
  }

  // Monta os cards com elementos DOM para manter os dados recebidos como texto seguro.
  petsFiltrados.forEach((pet) => {
    const card = document.createElement("div");
    card.className = "pet-card";

    const img = document.createElement("img");
    img.src = pet.imagem || "https://via.placeholder.com/150";
    img.alt = "Imagem do pet";
    img.loading = "lazy";
    img.className = "pet-image";
    img.onerror = () => {
      img.src = "https://via.placeholder.com/150";
    };
    card.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = pet.nome;
    card.appendChild(title);

    const campos = [
      ["Tipo", pet.raca],
      ["Sexo", pet.sexo],
      ["Idade", pet.idade],
      ["Última localização", pet.localiza],
      ["Data", pet.data],
      ["Descrição", pet.descricao],
    ];

    campos.forEach(([label, valor]) => {
      const linha = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      linha.appendChild(strong);
      linha.appendChild(
        document.createTextNode(String(valor ?? "Não informado")),
      );
      card.appendChild(linha);
    });

    const status = document.createElement("p");
    const statusStrong = document.createElement("strong");
    statusStrong.textContent = "Status: ";
    const statusValue = document.createElement("span");
    statusValue.style.color = "green";
    statusValue.style.fontWeight = "700";
    statusValue.textContent = "ENCONTRADO";
    status.appendChild(statusStrong);
    status.appendChild(statusValue);
    card.appendChild(status);

    container.appendChild(card);
  });
}

// Configura os inputs para escutarem digitação e filtrarem em tempo real na tela
document.addEventListener("DOMContentLoaded", () => {
  const filtros = [
    "filtro-id",
    "filtro-nome",
    "filtro-localizacao",
    "filtro-especie",
  ];
  filtros.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => {
        scheduleRender();
      });
    }
  });
});

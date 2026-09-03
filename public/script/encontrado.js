import { auth, db, buildPetsQuery } from "./firebase.js?v=20260818-3";
import {
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

let usuarioAtual = null;

// --- MENU DE NAVEGACAO DINAMICO COM AUTH ---
// Reconstroi o menu conforme o estado de autenticacao sem inserir dados do usuario como HTML bruto.
onAuthStateChanged(auth, (user) => {
  usuarioAtual = user;
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

  // Atualiza os cards quando a sessão termina de carregar para exibir as ações do criador.
  scheduleRender();
});

let encontradosFirestore = [];
let renderQueued = false;

function anuncioAchadoExpirou(pet) {
  if (pet.status !== "achado" || !pet.expiresAt) return false;
  const expiracao = pet.expiresAt.toDate
    ? pet.expiresAt.toDate().getTime()
    : new Date(pet.expiresAt).getTime();
  return Number.isFinite(expiracao) && expiracao <= Date.now();
}

// Agrupa atualizacoes do Firestore e dos filtros em um unico frame de renderizacao.
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    exibirPets();
  });
}

function dispositivoMovel() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || "",
  );
}

function montarURLContatoEmail(destinatario, assunto, corpo) {
  const emailOrigem = usuarioAtual?.email || "";
  const dominio = (emailOrigem.split("@")[1] || "").toLowerCase();
  const to = encodeURIComponent(destinatario);
  const su = encodeURIComponent(assunto);
  const body = encodeURIComponent(corpo);

  if (!dispositivoMovel() && dominio.includes("gmail.com")) {
    return `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${to}&su=${su}&body=${body}`;
  }

  if (
    !dispositivoMovel() &&
    ["hotmail.com", "outlook.com", "live.com", "msn.com"].some((dominioEmail) =>
      dominio.includes(dominioEmail),
    )
  ) {
    return `https://outlook.live.com/mail/0/?path=/mail/action/compose&to=${to}&subject=${su}&body=${body}`;
  }

  if (!dispositivoMovel() && dominio.includes("yahoo.com")) {
    return `https://compose.mail.yahoo.com/?to=${to}&subject=${su}&body=${body}`;
  }

  return `mailto:${destinatario}?subject=${su}&body=${body}`;
}

// Escuta todos os documentos e mantém nesta página somente os que não estão desaparecidos.
onSnapshot(
  buildPetsQuery({ maxItems: 100, orderByData: false }),
  (snapshot) => {
    encontradosFirestore = snapshot.docs
      .map((doc) => {
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
          whatsapp: pet.whatsapp || "",
          contato: pet.contato || "",
          status: pet.status || "desaparecido",
          usuarioCriador: pet.usuarioCriador || "",
          expiresAt: pet.expiresAt || null,
        };
      })
      .filter(
        (pet) =>
          ["achado", "encontrado"].includes(pet.status) &&
          !anuncioAchadoExpirou(pet),
      );

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

  // A página mostra achados de terceiros e pets já devolvidos ao tutor.
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
    statusValue.style.color =
      pet.status === "encontrado" ? "#2e8b57" : "#d97706";
    statusValue.style.fontWeight = "700";
    statusValue.textContent =
      pet.status === "encontrado"
        ? "DEVOLVIDO / ENCONTRADO"
        : "ENCONTRADO POR TERCEIROS - AGUARDANDO DEVOLUÇÃO";
    status.appendChild(statusStrong);
    status.appendChild(statusValue);
    card.appendChild(status);

    const ehCriador =
      pet.usuarioCriador &&
      usuarioAtual?.email?.toLowerCase() === pet.usuarioCriador.toLowerCase();

    if (ehCriador) {
      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.textContent = "Editar";
      btnEditar.style.marginTop = "12px";
      btnEditar.style.marginRight = "8px";
      btnEditar.style.padding = "8px 12px";
      btnEditar.style.backgroundColor = "#2563eb";
      btnEditar.style.color = "white";
      btnEditar.style.border = "0";
      btnEditar.style.borderRadius = "4px";
      btnEditar.style.fontWeight = "bold";
      btnEditar.addEventListener("click", () => {
        window.location.href = `editar.html?id=${encodeURIComponent(pet.idCompleto)}`;
      });
      card.appendChild(btnEditar);

      const btnExcluir = document.createElement("button");
      btnExcluir.type = "button";
      btnExcluir.textContent = "Excluir";
      btnExcluir.style.marginTop = "12px";
      btnExcluir.style.padding = "8px 12px";
      btnExcluir.style.backgroundColor = "#dc2626";
      btnExcluir.style.color = "white";
      btnExcluir.style.border = "0";
      btnExcluir.style.borderRadius = "4px";
      btnExcluir.style.fontWeight = "bold";
      btnExcluir.addEventListener("click", async () => {
        if (!confirm(`Excluir o cadastro de ${pet.nome}?`)) return;

        try {
          await deleteDoc(doc(db, "pets", pet.idCompleto));
          alert("Cadastro excluído com sucesso.");
        } catch (error) {
          console.error("Erro ao excluir o pet encontrado:", error);
          alert("Não foi possível excluir o cadastro. Tente novamente.");
        }
      });
      card.appendChild(btnExcluir);
    }

    if (ehCriador && pet.status === "achado") {
      const btnDevolvido = document.createElement("button");
      btnDevolvido.type = "button";
      btnDevolvido.textContent = "Devolvido ao Tutor";
      btnDevolvido.style.marginTop = "12px";
      btnDevolvido.style.padding = "8px 12px";
      btnDevolvido.style.backgroundColor = "#4caf50";
      btnDevolvido.style.color = "white";
      btnDevolvido.style.border = "0";
      btnDevolvido.style.borderRadius = "4px";
      btnDevolvido.style.fontWeight = "bold";
      btnDevolvido.addEventListener("click", async () => {
        if (!confirm(`Marcar ${pet.nome} como devolvido ao tutor?`)) return;

        try {
          await updateDoc(doc(db, "pets", pet.idCompleto), {
            status: "encontrado",
            dataResolucao: new Date().toISOString(),
          });
          alert("Status atualizado para devolvido ao tutor.");
        } catch (error) {
          console.error("Erro ao atualizar o status do pet encontrado:", error);
          alert("Não foi possível atualizar o status. Tente novamente.");
        }
      });
      card.appendChild(btnDevolvido);
    }

    if (pet.whatsapp || pet.contato) {
      const contatoWrapper = document.createElement("div");
      contatoWrapper.style.display = "flex";
      contatoWrapper.style.flexDirection = "column";
      contatoWrapper.style.gap = "8px";
      contatoWrapper.style.marginTop = "12px";

      const avisoContato = document.createElement("p");
      avisoContato.textContent =
        "Contato protegido. Revele apenas se pretende ajudar na devolução.";
      avisoContato.style.margin = "0";
      avisoContato.style.fontSize = "0.9rem";
      avisoContato.style.color = "#6b7280";
      contatoWrapper.appendChild(avisoContato);

      const btnRevelarContato = document.createElement("button");
      btnRevelarContato.type = "button";
      btnRevelarContato.textContent = "Revelar contato";
      btnRevelarContato.style.padding = "8px 12px";
      btnRevelarContato.style.backgroundColor = "#d97706";
      btnRevelarContato.style.color = "white";
      btnRevelarContato.style.border = "0";
      btnRevelarContato.style.borderRadius = "4px";
      btnRevelarContato.style.fontWeight = "bold";
      btnRevelarContato.style.cursor = "pointer";
      contatoWrapper.appendChild(btnRevelarContato);

      const canaisContato = document.createElement("div");
      canaisContato.style.display = "none";
      canaisContato.style.flexDirection = "column";
      canaisContato.style.gap = "8px";

      const btnContato = document.createElement("a");
      btnContato.style.display = "block";
      btnContato.style.padding = "8px 12px";
      btnContato.style.backgroundColor = "#28a745";
      btnContato.style.color = "white";
      btnContato.style.textAlign = "center";
      btnContato.style.borderRadius = "4px";
      btnContato.style.textDecoration = "none";
      btnContato.style.fontWeight = "bold";
      btnContato.style.cursor = "pointer";
      btnContato.textContent = "📲 Entrar em contato pelo WhatsApp";

      if (pet.whatsapp) {
        const numeroLimpo = String(pet.whatsapp).replace(/\D/g, "");
        const mensagem = encodeURIComponent(
          `Olá! Vi seu anúncio no PetConecta sobre o pet encontrado (${pet.nome}).`,
        );
        btnContato.href = `https://wa.me/55${numeroLimpo}?text=${mensagem}`;
        btnContato.target = "_blank";
        canaisContato.appendChild(btnContato);
      }

      if (pet.contato) {
        const btnEmail = document.createElement("a");
        btnEmail.style.display = "block";
        btnEmail.style.padding = "8px 12px";
        btnEmail.style.backgroundColor = "#2563eb";
        btnEmail.style.color = "white";
        btnEmail.style.textAlign = "center";
        btnEmail.style.borderRadius = "4px";
        btnEmail.style.textDecoration = "none";
        btnEmail.style.fontWeight = "bold";
        btnEmail.style.cursor = "pointer";
        btnEmail.textContent = "✉️ Entrar em contato por e-mail";
        const assunto = `Sobre o pet encontrado no PetConecta - ${pet.nome}`;
        const corpo = `Olá! Vi o anúncio de ${pet.nome} no PetConecta e gostaria de ajudar.`;
        btnEmail.href = montarURLContatoEmail(pet.contato, assunto, corpo);
        if (!btnEmail.href.startsWith("mailto:")) btnEmail.target = "_blank";
        canaisContato.appendChild(btnEmail);
      }

      btnRevelarContato.addEventListener("click", () => {
        const confirmar = window.confirm(
          "Você está prestes a visualizar os dados de contato do anunciante. Use com responsabilidade e apenas para ajudar na devolução do pet.",
        );
        if (!confirmar) return;

        canaisContato.style.display = "flex";
        btnRevelarContato.textContent = "Contato revelado";
        btnRevelarContato.disabled = true;
      });

      contatoWrapper.appendChild(canaisContato);
      card.appendChild(contatoWrapper);
    }

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

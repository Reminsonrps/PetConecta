(function () {
  // Conteudo e passos ficam agrupados por pagina para manter o componente reutilizavel.
  const guides = {
    cadastro: {
      eyebrow: "Primeiro acesso",
      title: "Comece criando sua conta",
      subtitle:
        "Depois do login você libera o cadastro de pets, acompanhamento e recursos da plataforma.",
      steps: [
        "Digite seu e-mail e senha para criar a conta ou entrar na plataforma.",
        "Se preferir, use o botão <strong>Entrar com o Google</strong> para agilizar o acesso.",
        "Após entrar, siga para <strong>Cadastrar</strong> e envie os dados do pet com foto e localização.",
      ],
      cta: "Entendi, continuar",
    },
    publicar: {
      eyebrow: "Momento do cadastro",
      title: "Preencha o cadastro do pet com atenção",
      subtitle:
        "Siga a ordem abaixo para preencher os campos com mais rapidez e evitar erros no envio.",
      steps: [
        "<strong>Nome do pet:</strong> informe o nome usado pela família ou um apelido conhecido.",
        "<strong>Última localização vista:</strong> pesquise o endereço ou clique no mapa para marcar o ponto dentro do Brasil.",
        "<strong>Tipo, raça, sexo, porte e idade:</strong> preencha o máximo de detalhes possível para facilitar a identificação.",
        "<strong>Data, contato e WhatsApp:</strong> mantenha os dados atualizados para que outras pessoas consigam falar com você.",
        "<strong>Imagem do pet:</strong> envie uma foto nítida e recente; isso aumenta muito as chances de reconhecimento.",
        "<strong>Termos LGPD:</strong> marque a autorização antes de clicar em <strong>Cadastrar</strong>.",
      ],
      cta: "Entendi, vou preencher",
    },
    "meus-pets": {
      eyebrow: "Meus Pets",
      title: "Gerencie seus pets cadastrados",
      subtitle:
        "Nesta tela você acompanha os cards, filtra ocorrências e acessa avistamentos recebidos.",
      steps: [
        "Use os filtros para localizar o pet por nome, ID, localização ou espécie.",
        "Clique em <strong>Ver avistamentos</strong> para abrir os relatos enviados pela comunidade.",
        "Use <strong>Editar</strong> ou <strong>Excluir</strong> apenas quando precisar atualizar ou remover o cadastro.",
      ],
      cta: "Entendi, ver meus pets",
    },
  };

  const storagePrefix = "petconecta_guide_seen_";

  // Resolve a chave da pagina, usada para escolher o guia e registrar a preferencia do usuario.
  function getPageKey() {
    const configuredKey = document.body?.dataset?.guidePage;
    if (configuredKey) return configuredKey;

    const fileName = window.location.pathname.split("/").pop() || "index.html";
    if (fileName === "criar-conta.html") return "cadastro";
    if (fileName === "publicar.html") return "publicar";
    if (fileName === "cadastrados.html") return "meus-pets";
    return "";
  }

  function createGuideShell(config, pageKey) {
    // Cria a estrutura do modal uma unica vez e conecta os botoes por atributos data-*.
    const shell = document.createElement("div");
    shell.className = "guide-shell";
    shell.setAttribute("aria-hidden", "true");
    shell.innerHTML = `
      <div class="guide-shell__backdrop" data-guide-close></div>
      <section class="guide-shell__panel" role="dialog" aria-modal="true" aria-labelledby="guide-title-${pageKey}">
        <div class="guide-shell__header">
          <div>
            <p class="guide-shell__eyebrow">${config.eyebrow}</p>
            <h2 class="guide-shell__title" id="guide-title-${pageKey}">${config.title}</h2>
          </div>
          <button type="button" class="guide-shell__close" aria-label="Fechar guia" data-guide-close>×</button>
        </div>
        <p class="guide-shell__subtitle">${config.subtitle}</p>
        <ol class="guide-shell__steps">
          ${config.steps.map((step) => `<li>${step}</li>`).join("")}
        </ol>
        <div class="guide-shell__actions">
          <button type="button" class="btn" data-guide-close>${config.cta}</button>
          <button type="button" class="btn btn-secondary" data-guide-close data-guide-dont-show>Não mostrar novamente</button>
        </div>
      </section>
    `;
    return shell;
  }

  function initGuide(pageKey) {
    // Inicializa o guia somente quando a pagina possui uma configuracao conhecida.
    const config = guides[pageKey];
    if (!config) return;

    const storageKey = `${storagePrefix}${pageKey}`;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "guide-trigger";
    trigger.textContent = "Guia rápido";
    trigger.setAttribute("aria-label", "Abrir guia rápido da página");

    const shell = createGuideShell(config, pageKey);
    document.body.appendChild(trigger);
    document.body.appendChild(shell);

    function openGuide() {
      shell.classList.add("is-open");
      shell.setAttribute("aria-hidden", "false");
      document.body.classList.add("guide-open");
    }

    function closeGuide(markAsSeen = false) {
      shell.classList.remove("is-open");
      shell.setAttribute("aria-hidden", "true");
      document.body.classList.remove("guide-open");

      if (markAsSeen) {
        localStorage.setItem(storageKey, "1");
      }
    }

    trigger.addEventListener("click", openGuide);

    shell.querySelectorAll("[data-guide-close]").forEach((button) => {
      button.addEventListener("click", () => {
        closeGuide(button.hasAttribute("data-guide-dont-show"));
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && shell.classList.contains("is-open")) {
        closeGuide(false);
      }
    });

    if (!localStorage.getItem(storageKey)) {
      window.setTimeout(openGuide, 650);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      initGuide(getPageKey());
    } catch (error) {
      console.error("Erro ao inicializar o guia de primeira visita:", error);
    }
  });
})();

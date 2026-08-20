/**
 * Cria automaticamente o Google Form de impacto comunitario do PetConecta.
 *
 * Como usar:
 * 1) Acesse script.new
 * 2) Crie um projeto e cole este codigo em Code.gs
 * 3) Execute createPetConectaImpactForm()
 * 4) Autorize o script
 * 5) Copie os links exibidos no Logger
 */
function createPetConectaImpactForm() {
  const siteUrl = "https://petconecta-db068.web.app";
  const title =
    "Entrevista de Impacto Comunitario - PetConecta (Projeto Extensionista)";

  const description = [
    "Este formulario registra entrevistas com ONGs parceiras e usuarios do PetConecta,",
    "com objetivo de comprovar aplicacao real do projeto na comunidade, uso efetivo",
    "da plataforma e alinhamento com os Objetivos de Desenvolvimento Sustentavel (ODS).",
    "As respostas serao usadas exclusivamente para fins acadêmicos e avaliacao extensionista.",
    `Antes de responder, acesse o site: ${siteUrl}`,
  ].join(" ");

  const form = FormApp.create(title)
    .setDescription(description)
    .setProgressBar(true)
    .setAllowResponseEdits(true)
    .setPublishingSummary(false)
    .setConfirmationMessage(
      "Obrigado por contribuir com o PetConecta. Sua resposta foi registrada e sera utilizada para comprovar impacto comunitario, uso real da plataforma e alinhamento com as ODS no contexto extensionista.",
    );

  // Nao restringe a resposta para dominio/login, facilitando participacao da comunidade.
  form.setCollectEmail(false);

  // Planilha vinculada para evidencias e analise.
  const sheet = SpreadsheetApp.create(
    "Respostas - Formulario Impacto Comunitario PetConecta",
  );
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  // ==================================
  // Secao inicial - Acesso e UX do site
  // ==================================
  addSection(
    form,
    "Secao Inicial - Acesso ao PetConecta",
    `Antes de iniciar a entrevista, abra o site em uma nova guia: ${siteUrl}. Navegue pelas paginas, explore o mapa, as buscas e os conteudos. Depois, retorne ao formulario para responder com base nessa experiencia.`,
  );

  addMultipleChoice(
    form,
    "Voce conseguiu acessar o site PetConecta antes de responder?",
    ["Sim", "Nao", "Acesse agora e depois continue"],
    true,
  );

  addParagraph(
    form,
    "Se acessou o site, descreva rapidamente sua primeira impressao de uso (UX)",
    false,
    "Ex.: facilidade de navegação, clareza do mapa, visual do site, entendimento das funcionalidades.",
  );

  // =========================
  // Secao A - Identificacao
  // =========================
  addSection(
    form,
    "Secao A - Identificacao da entrevista",
    "Dados basicos do contato comunitario.",
  );

  addMultipleChoice(
    form,
    "Tipo de respondente",
    [
      "Representante de ONG parceira",
      "Tutor(a) dono(a) de pet",
      "Colaborador(a) da comunidade",
      "Profissional parceiro (vet, adestrador, voluntario)",
    ],
    true,
  );

  addText(form, "Nome completo do respondente", true);
  addText(form, "ONG/Instituicao (quando houver)", false);
  addText(form, "Funcao/Cargo", false);
  addText(form, "Contato principal", true, "Informe email ou WhatsApp.");
  addText(form, "Cidade/UF", true);
  addDate(form, "Data da entrevista", true);

  addMultipleChoice(
    form,
    "Canal de contato utilizado",
    [
      "Presencial",
      "WhatsApp",
      "Ligacao",
      "Videochamada",
      "Instagram/DM",
      "Outro",
    ],
    true,
  );

  addText(form, "Nome do entrevistador(a)", true);
  addText(
    form,
    "Vinculo com o projeto",
    true,
    "Ex.: Atividade extensionista Uninter",
  );

  // ===========================================
  // Secao B - Uso real e interacao com o site
  // ===========================================
  addSection(
    form,
    "Secao B - Comprovacao de uso e interacao com o site",
    "Informacoes para comprovar utilizacao real da plataforma.",
  );

  addMultipleChoice(
    form,
    "Voce ja utilizou o site PetConecta?",
    ["Sim", "Nao"],
    true,
  );

  addMultipleChoice(
    form,
    "Com que frequencia utiliza ou utilizou o site?",
    ["Diario", "Semanal", "Mensal", "Uso pontual", "Ainda nao utilizei"],
    false,
  );

  addCheckboxWithMinOne(
    form,
    "Quais funcionalidades voce utilizou?",
    [
      "Cadastro de pet",
      "Mapa de ocorrencias",
      "Busca e filtros",
      "Visualizacao de detalhes de pet",
      "Registro de avistamento",
      "Conteudo educativo (dicas/informativos)",
    ],
    true,
  );

  addParagraph(
    form,
    "Descreva uma interacao real com o PetConecta",
    true,
    "Informe a pagina usada, o que foi feito e o resultado.",
  );

  addMultipleChoice(
    form,
    "Essa interacao gerou algum resultado pratico?",
    [
      "Sim, ajudou diretamente",
      "Sim, ajudou parcialmente",
      "Ainda sem resultado",
      "Nao ajudou",
    ],
    true,
  );

  addParagraph(form, "Se marcou Sim, qual foi o resultado?", false);

  // ===============================
  // Secao C - ODS e impacto social
  // ===============================
  addSection(
    form,
    "Secao C - ODS e impacto social",
    "Relacao do projeto com desenvolvimento social e territorial.",
  );

  addCheckboxWithMinOne(
    form,
    "Quais ODS se conectam a sua experiencia com o projeto?",
    [
      "ODS 3 - Saude e bem-estar",
      "ODS 10 - Reducao das desigualdades",
      "ODS 11 - Cidades e comunidades sustentaveis",
      "ODS 15 - Vida terrestre",
      "ODS 17 - Parcerias e meios de implementacao",
    ],
    true,
  );

  addParagraph(form, "Relate o impacto percebido na comunidade", true);
  addParagraph(
    form,
    "Justifique o alinhamento do projeto com as ODS marcadas",
    true,
  );

  // ==================================
  // Secao D - Evidencias e consentimento
  // ==================================
  addSection(
    form,
    "Secao D - Evidencias e consentimento",
    "Campos para comprovar autoria, consentimento e rastreabilidade.",
  );

  addText(
    form,
    "Link opcional de evidencia",
    false,
    "Ex.: print, foto, documento ou postagem.",
  );
  addText(
    form,
    "Assinatura digital do respondente",
    true,
    "Digite o nome completo como concordancia.",
  );

  addCheckboxWithMinOne(
    form,
    "Termo de autorizacao",
    [
      "Autorizo o uso das informacoes desta entrevista para fins academicos e avaliacao extensionista do projeto PetConecta.",
    ],
    true,
  );

  // ========================
  // Secao E - Perguntas extra
  // ========================
  addSection(
    form,
    "Secao E - Perguntas extras (apoio ao relatorio)",
    "Perguntas complementares para fortalecer a analise.",
  );

  addMultipleChoice(
    form,
    "Como conheceu o PetConecta?",
    [
      "ONG parceira",
      "Indicacao de conhecido",
      "Redes sociais",
      "Evento/comunidade",
      "Busca no Google",
      "Outro",
    ],
    false,
  );

  addLinearScale(
    form,
    "Em uma escala de 1 a 5, o quanto o projeto foi util para voce?",
    1,
    5,
    "Pouco util",
    "Muito util",
    false,
  );
  addMultipleChoice(
    form,
    "Deseja participar de novos contatos para melhoria da plataforma?",
    ["Sim", "Nao"],
    false,
  );

  Logger.log("Formulario criado com sucesso.");
  Logger.log("URL de edicao: %s", form.getEditUrl());
  Logger.log("URL publica: %s", form.getPublishedUrl());
  Logger.log("Planilha de respostas: %s", sheet.getUrl());
}

function addSection(form, title, helpText) {
  const item = form.addPageBreakItem().setTitle(title);
  if (helpText) item.setHelpText(helpText);
  return item;
}

function addText(form, title, required, helpText) {
  const item = form.addTextItem().setTitle(title).setRequired(required);
  if (helpText) item.setHelpText(helpText);
  return item;
}

function addParagraph(form, title, required, helpText) {
  const item = form
    .addParagraphTextItem()
    .setTitle(title)
    .setRequired(required);
  if (helpText) item.setHelpText(helpText);
  return item;
}

function addDate(form, title, required) {
  return form.addDateItem().setTitle(title).setRequired(required);
}

function addMultipleChoice(form, title, options, required) {
  return form
    .addMultipleChoiceItem()
    .setTitle(title)
    .setChoiceValues(options)
    .setRequired(required);
}

function addCheckboxWithMinOne(form, title, options, required) {
  const item = form
    .addCheckboxItem()
    .setTitle(title)
    .setChoiceValues(options)
    .setRequired(required);

  const validation = FormApp.createCheckboxValidation()
    .requireSelectAtLeast(1)
    .setHelpText("Selecione ao menos uma opcao.")
    .build();

  item.setValidation(validation);
  return item;
}

function addLinearScale(
  form,
  title,
  min,
  max,
  leftLabel,
  rightLabel,
  required,
) {
  return form
    .addScaleItem()
    .setTitle(title)
    .setBounds(min, max)
    .setLabels(leftLabel, rightLabel)
    .setRequired(required);
}

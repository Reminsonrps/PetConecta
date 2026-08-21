# Modelagem do Site PetConecta

## Folha de identificação

| Campo      | Informação                                                 |
| ---------- | ---------------------------------------------------------- |
| Projeto    | PetConecta                                                 |
| Tipo       | Aplicação web responsiva                                   |
| Finalidade | Divulgação, localização e reencontro de animais            |
| Contexto   | Projeto acadêmico de Análise e Desenvolvimento de Sistemas |
| Documento  | Modelagem do site e do sistema                             |
| Versão     | 1.0                                                        |
| Data       | 2026-08-19                                                 |
| Situação   | Modelagem baseada na implementação existente               |

> **Nota de leitura:** este documento registra o sistema que existe hoje e identifica evoluções propostas. A arquitetura atualmente implantada é um frontend estático com serviços Firebase; o backend Node.js + Express descrito em [modelagem-node-express-firebase.md](modelagem-node-express-firebase.md) é uma alternativa de evolução, não uma dependência do fluxo atual.

## 1. Apresentação

O PetConecta é um site para aproximar tutores, pessoas que encontram animais e interessados em adoção. A plataforma permite publicar informações de pets, consultar anúncios em lista e mapa, registrar avistamentos e acompanhar os animais cadastrados pelo usuário.
A modelagem foi elaborada por engenharia reversa do código existente. Por isso, ela serve simultaneamente como documento de Análise e Projeto de Sistemas, especificação funcional e referência para manutenção do site.
Quando um animal desaparece, a divulgação costuma ficar espalhada em redes sociais e grupos de mensagem. Isso dificulta a busca por localização, a atualização do status e o acompanhamento de informações enviadas pela comunidade.

## 2. Problema e justificativa

### 2.1 Problema

Quando um animal desaparece, a divulgação costuma ficar espalhada em redes sociais e grupos de mensagem. Isso dificulta a busca por localização, a atualização do status e o acompanhamento de informações enviadas pela comunidade.

### 2.2 Justificativa

Um ponto centralizado de consulta permite organizar anúncios, tornar a busca mais objetiva e oferecer um canal para que avistamentos cheguem ao tutor. O projeto também contribui para a conscientização sobre cuidados, animais encontrados e adoção responsável.

### 2.3 Beneficiários

- tutores que precisam divulgar e acompanhar um animal;
- pessoas que encontram ou avistam um pet;
- interessados em adoção;
- organizações e projetos de proteção animal;
- comunidade acadêmica, como estudo de uma aplicação web com dados em nuvem.

## 3. Objetivos

### 3.1 Objetivo geral

Desenvolver e modelar uma aplicação web que facilite a divulgação e a localização de animais desaparecidos, encontrados ou disponíveis para adoção.

### 3.2 Objetivos específicos

- permitir autenticação e identificação do responsável pelo anúncio;
- cadastrar pet com imagem, descrição, contato e localização;
- disponibilizar consulta por lista, mapa e detalhes;
- receber avistamentos associados ao pet publicado;
- permitir ao tutor editar, excluir e atualizar o status do anúncio;
- proteger dados de contato de exposição desnecessária;
- oferecer conteúdo informativo sobre cuidados e bem-estar animal.

## 4. Escopo do sistema

### 4.1 Dentro do escopo

- página inicial com listagem e mapa;
- cadastro e login de usuário;
- publicação de pet;
- upload de imagem;
- consulta de detalhes;
- registro de avistamento;
- área Meus Pets;
- edição, exclusão e marcação como encontrado;
- páginas de dicas, informativos, contato e termos;
- persistência no Firestore e imagens no Storage.

### 4.2 Fora do escopo atual

- aplicativo mobile nativo;
- moderação automática por inteligência artificial;
- chat em tempo real entre usuários;
- notificações push;
- pagamento ou doação dentro do site;
- painel administrativo completo;
- integração oficial com abrigos, prefeituras ou serviços veterinários;
- cálculo automático de rota ou busca por distância real.

### 4.3 Premissas e restricoes

- o usuário precisa de acesso à internet e navegador moderno;
- a autenticação é feita pelo Firebase Authentication;
- as regras do Firestore são a autoridade para acesso aos dados;
- os campos existentes usam nomes históricos, como `localiza` e `usuarioCriador`;
- a leitura pública de anúncios é necessária para a finalidade do site;
- a modelagem deve respeitar a implementacao atual sem apresentar funcionalidades futuras como prontas.

## 5. Stakeholders e atores

| Ator                    | Perfil                       | Necessidades                                      |
| ----------------------- | ---------------------------- | ------------------------------------------------- |
| Visitante               | Pessoa sem login             | Consultar anúncios, mapa, detalhes e informativos |
| Colaborador             | Pessoa que avistou um animal | Enviar avistamento com local, descrição e contato |
| Encontrador autenticado | Pessoa que encontrou um pet  | Publicar achado e acompanhar a devolução          |
| Tutor autenticado       | Responsável pelo anúncio     | Publicar, acompanhar e administrar seus pets      |
| Firebase Authentication | Serviço externo              | Identificar usuários e emitir autenticação        |
| Firestore               | Serviço externo              | Persistir pets e avistamentos                     |
| Firebase Storage        | Serviço externo              | Armazenar imagens dos pets                        |
| Administrador futuro    | Papel proposto               | Moderar conteúdo e consultar indicadores          |

Observação: visitante, colaborador e encontrador representam perfis de uso. No sistema atual, o envio de avistamento e o cadastro de achado exigem autenticação conforme as regras do Firestore.

## 6. Requisitos

### 6.1 Requisitos funcionais

| ID   | Requisito                             | Prioridade | Criterio de aceite                                                                   |
| ---- | ------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| RF01 | Cadastrar e autenticar usuário        | Alta       | Usuário válido consegue entrar e permanecer identificado                             |
| RF02 | Publicar pet com dados obrigatórios   | Alta       | Registro é criado somente com autenticação e campos válidos                          |
| RF03 | Enviar imagem do pet                  | Alta       | Imagem e armazenada e sua referencia e salva no pet                                  |
| RF04 | Listar pets por status                | Alta       | Lista exibe registros do Firestore em ordem definida                                 |
| RF05 | Exibir pets em mapa                   | Alta       | Registros com latitude e longitude aparecem no mapa                                  |
| RF06 | Consultar detalhes de um pet          | Alta       | Identificador abre os dados do anúncio selecionado                                   |
| RF07 | Registrar avistamento                 | Alta       | Avistamento fica vinculado ao `petId` correto                                        |
| RF08 | Consultar Meus Pets                   | Alta       | Usuário visualiza apenas seus anúncios                                               |
| RF09 | Editar pet próprio                    | Alta       | Dono consegue atualizar dados permitidos                                             |
| RF10 | Excluir pet próprio                   | Alta       | Dono consegue remover o anúncio autorizado                                           |
| RF11 | Confirmar devolução ou reencontro     | Alta       | Criador altera o status permitido para `encontrado`                                  |
| RF15 | Cadastrar pet encontrado por terceiro | Alta       | Anúncio é criado com status `achado`, prazo de 40 dias e aparece na consulta pública |
| RF16 | Expirar anúncio achado                | Alta       | Anúncio vencido deixa de aparecer e é removido pelo TTL do Firestore                 |
| RF12 | Exibir conteúdo informativo           | Média      | Visitante acessa dicas e informativos sem login                                      |
| RF13 | Enviar mensagem de contato            | Média      | Formulário registra uma mensagem válida                                              |
| RF14 | Proteger contato do anunciante        | Alta       | Cards e detalhes não mostram contato sem o fluxo de confirmação                      |

### 6.2 Requisitos não funcionais

| ID    | Categoria        | Requisito verificavel                                                     |
| ----- | ---------------- | ------------------------------------------------------------------------- |
| RNF01 | Usabilidade      | Fluxos principais devem ser compreensíveis em desktop e celular           |
| RNF02 | Responsividade   | Layout deve se adaptar a larguras móveis sem sobreposição                 |
| RNF03 | Segurança        | Escritas devem ser autorizadas por autenticação e regras do Firestore     |
| RNF04 | Privacidade      | Contatos não devem aparecer diretamente nos cards públicos                |
| RNF05 | Desempenho       | Consultas devem usar ordenação, limite e carregamento por blocos          |
| RNF06 | Disponibilidade  | Site deve ser publicado pelo Firebase Hosting                             |
| RNF07 | Manutenibilidade | Integração Firebase deve permanecer centralizada em módulo próprio        |
| RNF08 | Compatibilidade  | Site deve funcionar em navegadores modernos com ES Modules                |
| RNF09 | Acessibilidade   | Imagens, formulários, foco e contrastes devem ser revisados conforme WCAG |
| RNF10 | Integridade      | Pet deve possuir localização numérica válida para uso no mapa             |

## 7. Casos de uso

### 7.1 Diagrama geral

```mermaid
flowchart LR
    V[Visitante] --> UC01[Consultar anuncios]
    V --> UC02[Visualizar mapa]
    V --> UC03[Consultar detalhes]
    V --> UC04[Consumir informativos]
    V --> UC05[Enviar contato]
    V --> UC14[Revelar contato após confirmação]

    C[Colaborador autenticado] --> UC06[Registrar avistamento]
    T[Tutor autenticado] --> UC07[Publicar pet desaparecido]
    C2[Encontrador autenticado] --> UC12[Publicar pet achado]
    T --> UC08[Consultar Meus Pets]
    T --> UC09[Editar pet proprio]
    T --> UC10[Excluir pet proprio]
    T --> UC11[Confirmar devolução ou reencontro]

    UC03 -. permite .-> UC06
    UC03 -. inclui .-> UC14
    UC07 -. inclui .-> UC13[Enviar imagem]
    UC12 -. inclui .-> UC13
```

### 7.2 Especificacao dos casos de uso

| ID   | Caso de uso                       | Pre-condicao                        | Fluxo principal                                                      | Excecoes                                        |
| ---- | --------------------------------- | ----------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| UC01 | Consultar anuncios                | Site acessivel                      | Sistema busca pets, aplica filtro e renderiza cards                  | Falha de rede mostra estado de erro             |
| UC02 | Visualizar mapa                   | Pet possuir coordenadas             | Sistema cria marcadores e associa detalhes                           | Coordenada invalida e ignorada                  |
| UC03 | Consultar detalhes                | Pet existir                         | Usuario abre anuncio e consulta dados                                | ID inexistente retorna ausencia do registro     |
| UC04 | Consumir informativos             | Nenhuma                             | Usuario navega por dicas e informativos                              | Pagina indisponivel mostra erro de carregamento |
| UC05 | Enviar contato                    | Formulario aberto                   | Usuario preenche e envia mensagem valida                             | Campos invalidos impedem envio                  |
| UC06 | Registrar avistamento             | Usuario autenticado e pet existente | Usuario informa local, descricao e contato; sistema grava subcolecao | Regra de seguranca rejeita dados invalidos      |
| UC07 | Publicar pet                      | Usuario autenticado                 | Preenche formulario, envia imagem e salva pet                        | Upload ou gravacao pode falhar                  |
| UC08 | Consultar Meus Pets               | Usuario autenticado                 | Sistema filtra anuncios pelo responsavel                             | Sessao expirada redireciona para login          |
| UC09 | Editar pet proprio                | Usuario ser dono                    | Sistema valida alteracao e atualiza documento                        | Dono diferente recebe negacao                   |
| UC10 | Excluir pet proprio               | Usuario ser dono                    | Sistema exclui pet e recursos associados conforme fluxo              | Operacao nao autorizada e bloqueada             |
| UC11 | Confirmar devolução ou reencontro | Usuario ser dono                    | Sistema altera status do pet                                         | Status invalido e rejeitado                     |
| UC12 | Publicar pet achado               | Usuário autenticado                 | Sistema cria anúncio com status `achado`                             | Upload ou gravação pode falhar                  |
| UC14 | Revelar contato                   | Visitante                           | Sistema solicita confirmação e libera os canais disponíveis          | Visitante cancela a confirmação                 |

### 7.3 Fluxo alternativo de publicacao

1. Usuario acessa `publicar.html`.
2. Sistema verifica a sessao do Firebase Authentication.
3. Usuario preenche nome, tipo, raca, porte, localizacao, descricao, contato e status.
4. Sistema valida campos e coordenadas.
5. Sistema envia imagem ao Firebase Storage.
6. Sistema grava os metadados na colecao `pets`.
7. Sistema informa sucesso e atualiza a navegacao.

Alternativas: se a autenticacao, validacao, upload ou gravacao falhar, o pet nao deve ser apresentado como publicado e o usuario deve receber uma mensagem clara.

### 7.4 Especificacao formal dos casos criticos

#### UC07 - Publicar pet

- **Ator principal:** tutor autenticado.
- **Pre-condicoes:** sessao valida; formulario de publicacao acessivel.
- **Pos-condicao de sucesso:** imagem armazenada e documento criado em `pets` com o responsavel identificado.
- **Fluxo principal:** autenticar; preencher dados; selecionar local; validar campos; enviar imagem; gravar documento; confirmar publicacao.
- **Fluxos alternativos:** imagem invalida; coordenada ausente; sessao expirada; falha de Storage; falha de Firestore.
- **Regras relacionadas:** RN01, RN02, RN04, RN08 e RN09.

#### UC06 - Registrar avistamento

- **Ator principal:** colaborador autenticado.
- **Pre-condicoes:** pet existente; usuario autenticado; pagina de detalhes aberta.
- **Pos-condicao de sucesso:** novo documento criado em `pets/{petId}/avistamentos`.
- **Fluxo principal:** abrir detalhes; preencher local, descricao e contato; validar dados; gravar ocorrencia; informar sucesso.
- **Fluxos alternativos:** pet inexistente; campos invalidos; sessao expirada; regra do Firestore rejeita a escrita.
- **Regras relacionadas:** RN06, RN07 e RN08.

#### UC09 - Editar pet proprio

- **Ator principal:** tutor autenticado.
- **Pre-condicoes:** pet existente; usuario e responsavel pelo documento.
- **Pos-condicao de sucesso:** dados autorizados atualizados no mesmo documento.
- **Fluxo principal:** abrir Meus Pets; selecionar anuncio; alterar dados; validar; salvar; atualizar a tela.
- **Fluxos alternativos:** outro usuario tenta editar; campo invalido; documento removido durante a edicao.
- **Regras relacionadas:** RN02, RN03 e RN08.

#### UC11 - Confirmar devolução ou reencontro

- **Ator principal:** tutor autenticado.
- **Pre-condicoes:** pet existente com status `desaparecido` ou `achado`; usuario e responsavel.
- **Pos-condicao de sucesso:** status alterado para `encontrado`.
- **Fluxo principal:** abrir anuncio proprio; selecionar a acao compativel com o status; confirmar; atualizar para `encontrado`; informar resultado.
- **Fluxos alternativos:** usuario sem permissao; status invalido; falha de conexao.
- **Regras relacionadas:** RN03, RN04 e RN05.

#### UC12 - Publicar pet achado

- **Ator principal:** pessoa autenticada que encontrou o animal.
- **Pre-condicoes:** sessao valida; localizacao, imagem e dados obrigatorios disponiveis.
- **Pos-condicao de sucesso:** documento criado em `pets` com `status: "achado"` e visivel na consulta publica.
- **Fluxo principal:** abrir `publicar_achado.html`; preencher dados; selecionar localizacao; enviar imagem; gravar anuncio.
- **Fluxos alternativos:** autenticacao, validacao, upload ou gravacao podem falhar.

#### UC14 - Revelar contato

- **Ator principal:** visitante.
- **Pré-condições:** anúncio público possui e-mail ou WhatsApp cadastrado.
- **Pós-condição de sucesso:** visitante confirma a intenção de ajudar e acessa os canais disponíveis.
- **Fluxo principal:** abrir card ou detalhe; selecionar **Revelar contato**; confirmar; abrir WhatsApp ou aplicativo/provedor de e-mail.
- **Fluxo alternativo:** visitante cancela a confirmação e os dados permanecem ocultos.

### 7.5 Diagramas de sequencia dos fluxos principais

#### Publicacao de pet

```mermaid
sequenceDiagram
    actor Tutor
    participant Tela as publicar.html
    participant Auth as Firebase Auth
    participant Storage as Firebase Storage
    participant Firestore as Cloud Firestore

    Tutor->>Tela: Preenche formulario
    Tela->>Auth: Verifica sessao
    Auth-->>Tela: Usuario autenticado
    Tela->>Storage: Envia imagem
    Storage-->>Tela: Retorna referencia da imagem
    Tela->>Firestore: Cria documento em pets
    Firestore-->>Tela: Confirma petId
    Tela-->>Tutor: Exibe sucesso
```

#### Publicação de pet achado por terceiros

```mermaid
sequenceDiagram
    actor Encontrador
    participant Tela as publicar_achado.html
    participant Auth as Firebase Auth
    participant Storage as Firebase Storage
    participant Firestore as Cloud Firestore

    Encontrador->>Tela: Preenche formulário do pet encontrado
    Tela->>Auth: Verifica sessão
    Auth-->>Tela: Usuário autenticado
    Tela->>Storage: Envia imagem
    Storage-->>Tela: Retorna referência da imagem
    Tela->>Firestore: Cria documento com status achado e expiresAt
    Firestore-->>Tela: Confirma petId
    Tela-->>Encontrador: Exibe sucesso e prazo de 40 dias
```

#### Registro de avistamento

```mermaid
sequenceDiagram
    actor Colaborador
    participant Tela as detalhes.html
    participant Auth as Firebase Auth
    participant Firestore as Cloud Firestore

    Colaborador->>Tela: Abre detalhes do pet
    Colaborador->>Tela: Preenche avistamento
    Tela->>Auth: Verifica sessao
    Auth-->>Tela: Usuario autenticado
    Tela->>Firestore: Cria subdocumento de avistamento
    Firestore-->>Tela: Confirma gravacao
    Tela-->>Colaborador: Exibe protocolo ou sucesso
```

#### Edicao e marcacao como encontrado

```mermaid
sequenceDiagram
    actor Tutor
    participant Tela as editar.html
    participant Firestore as Cloud Firestore
    participant Regras as Regras de seguranca

    Tutor->>Tela: Seleciona um pet proprio
    Tutor->>Tela: Edita dados ou status
    Tela->>Firestore: Solicita update
    Firestore->>Regras: Verifica autenticacao e ownership
    Regras-->>Firestore: Autoriza ou rejeita
    Firestore-->>Tela: Retorna resultado
    Tela-->>Tutor: Atualiza a interface
```

#### Expiração do anúncio achado

```mermaid
sequenceDiagram
    participant Firestore as Cloud Firestore
    participant TTL as Política TTL
    participant Telas as Listas e mapa

    Firestore->>Telas: Consulta anúncio achado
    Telas->>Telas: Verifica expiresAt
    Telas-->>Firestore: Oculta anúncio vencido na interface
    TTL->>Firestore: Remove documento vencido
```

#### Revelação protegida de contato

```mermaid
sequenceDiagram
    actor Visitante
    participant Card as Card ou detalhes
    participant Contato as Canais de contato

    Visitante->>Card: Seleciona Revelar contato
    Card-->>Visitante: Solicita confirmação de uso responsável
    Visitante->>Card: Confirma
    Card->>Contato: Exibe WhatsApp e e-mail disponíveis
    Contato-->>Visitante: Abre canal escolhido
```

## 8. Modelagem de processos

### 8.1 Atividade: localizar e registrar um avistamento

```mermaid
flowchart TD
    A([Inicio]) --> B[Acessar lista ou mapa]
    B --> C[Selecionar pet]
    C --> D{Pet existe?}
    D -- Nao --> E[Informar indisponibilidade]
    D -- Sim --> F[Visualizar detalhes]
    F --> G{Usuario autenticado?}
    G -- Nao --> H[Solicitar autenticacao]
    G -- Sim --> I[Preencher avistamento]
    I --> J{Dados validos?}
    J -- Nao --> K[Exibir erros]
    K --> I
    J -- Sim --> L[Gravar avistamento]
    L --> M{Gravacao concluida?}
    M -- Nao --> N[Exibir falha]
    M -- Sim --> O[Confirmar envio]
    E --> P([Fim])
    H --> P
    N --> P
    O --> P
```

### 8.2 Estados de um anuncio

```mermaid
stateDiagram-v2
    [*] --> Desaparecido: publicar pet desaparecido
    [*] --> Achado: publicar pet encontrado por terceiro
    Desaparecido --> Desaparecido: editar dados
    Achado --> Achado: aguardar contato do tutor
    Achado --> Expirado: atingir expiresAt em 40 dias
    Desaparecido --> Encontrado: tutor confirma reencontro
    Achado --> Encontrado: criador confirma devolucao
    Encontrado --> Desaparecido: criador reabre o caso
    Expirado --> [*]: TTL remove anúncio
    Desaparecido --> [*]: excluir anuncio
    Encontrado --> [*]: excluir anuncio
```

Estados permitidos na regra atual: `desaparecido`, `achado` e `encontrado`. O estado `adocao` aparece em documentos de evolucao, mas ainda nao deve ser tratado como permitido pelas regras atuais sem alteracao previa.

## 9. Arquitetura do sistema

### 9.1 Visao logica

```mermaid
flowchart TB
    subgraph Apresentacao[Camada de apresentacao]
        HTML[Paginas HTML]
        CSS[CSS responsivo]
        JS[Modulos JavaScript]
        MAP[Leaflet e OpenStreetMap]
    end

    subgraph Servicos[Servicos gerenciados]
        AUTH[Firebase Authentication]
        DB[Cloud Firestore]
        STORAGE[Firebase Storage]
        HOST[Firebase Hosting]
    end

    HTML --> JS
    CSS --> HTML
    JS --> AUTH
    JS --> DB
    JS --> STORAGE
    JS --> MAP
    HOST --> HTML
```

### 9.2 Componentes e responsabilidades

| Componente      | Responsabilidade                                                |
| --------------- | --------------------------------------------------------------- |
| Paginas HTML    | Estrutura das telas e formularios                               |
| CSS             | Layout, responsividade, estados visuais e acessibilidade visual |
| `firebase.js`   | Inicializacao centralizada de app, Auth, Firestore e Storage    |
| Scripts de tela | Validacao, listeners, filtros, renderizacao e eventos           |
| Authentication  | Login, cadastro e identidade do usuario                         |
| Firestore       | Pets, avistamentos e dados persistentes                         |
| Storage         | Imagens enviadas nos anuncios                                   |
| Leaflet         | Mapa, marcadores e selecao de local                             |
| Hosting         | Distribuicao dos arquivos estaticos                             |

### 9.3 Implantacao

```mermaid
flowchart LR
    U[Navegador do usuario] --> H[Firebase Hosting]
    U --> A[Firebase Authentication]
    U --> F[Cloud Firestore]
    U --> S[Firebase Storage]
    F --> R[Regras do Firestore]
    S --> SR[Regras do Storage]
```

O ambiente atual nao exige servidor de aplicacao para o fluxo principal. O diretorio `src/` contem arquivos auxiliares e uma proposta de servicos Node.js; sua adocao deve ser tratada como evolucao arquitetural.

### 9.4 Modelo de componentes

```mermaid
flowchart TB
    View[Paginas HTML]
    AuthModule[Modulo de autenticacao]
    FirebaseModule[Modulo firebase.js]
    PetModule[Modulo de pets e consultas]
    FormModule[Modulos de formularios]
    MapModule[Modulo de mapa]
    AuthService[Firebase Authentication]
    DataService[Cloud Firestore]
    FileService[Firebase Storage]

    View --> AuthModule
    View --> PetModule
    View --> FormModule
    View --> MapModule
    AuthModule --> FirebaseModule
    PetModule --> FirebaseModule
    FormModule --> FirebaseModule
    MapModule --> PetModule
    FirebaseModule --> AuthService
    FirebaseModule --> DataService
    FirebaseModule --> FileService
```

O modelo de componentes mostra responsabilidades logicas, sem afirmar que todos os modulos possuem uma classe formal. No frontend atual, parte dessas responsabilidades esta distribuida entre scripts de tela.

## 10. Mapa de navegacao

```mermaid
flowchart TD
    HOME[index.html]
    HOME --> PUBLICAR[publicar.html]
    HOME --> PUBLICAR_ACHADO[publicar_achado.html]
    HOME --> DETALHES[detalhes.html]
    HOME --> CADASTRADOS[cadastrados.html]
    HOME --> ENCONTRADOS[animais_encontra.html]
    HOME --> DICAS[dicas.html]
    HOME --> INFORMATIVOS[informativos.html]
    HOME --> CONTATO[contato.html]
    HOME --> TERMOS[termos.html]
    PUBLICAR --> LOGIN[criar-conta.html]
    CADASTRADOS --> EDITAR[editar.html]
    DETALHES --> AVISTAMENTO[registro de avistamento]
    HOME --> ADOCAO[adocao.html - pagina prevista]
```

`adocao.html` e uma pagina prevista na organizacao funcional, mas nao esta presente na estrutura atual; por isso, a navegacao deve ser implementada somente quando o fluxo de adocao for definido.

## 11. Modelagem de dados

### 11.1 Modelo conceitual

```mermaid
erDiagram
    USUARIO ||--o{ PET : cadastra
    PET ||--o{ AVISTAMENTO : recebe
    USUARIO ||--o{ CONTATO : envia

    USUARIO {
        string uid
        string email
        string nomeExibicao
    }
    PET {
        string id
        string nome
        string tipo
        string raca
        string sexo
        string porte
        string idade
        string data
        string localiza
        number lat
        number lng
        string descricao
        string imagem
        string status
        timestamp expiresAt
        string usuarioCriador
        string contato
        string whatsapp
    }
    AVISTAMENTO {
        string id
        string petId
        string petNome
        string petOwnerEmail
        string localAvistado
        string descricao
        string contatoReportador
        string reportadoPor
        string dataRegistro
    }
    CONTATO {
        string id
        string nome
        string email
        string mensagem
        string criadoEm
    }
```

### 11.2 Modelo logico do Firestore

```text
pets/{petId}
pets/{petId}/avistamentos/{avistamentoId}
contatos/{contatoId}                 (fluxo de contato)
usuarios/{uid}                       (estrutura prevista)
```

### 11.3 Dicionario de dados principal

| Entidade/campo                   | Tipo      | Obrigatorio | Descricao                                   |
| -------------------------------- | --------- | ----------: | ------------------------------------------- |
| `pets.id`                        | string    |         Sim | Identificador do documento                  |
| `pets.nome`                      | string    |         Sim | Nome ou identificacao do animal             |
| `pets.tipo`                      | string    |         Sim | Especie ou categoria do animal              |
| `pets.raca`                      | string    |         Sim | Raca informada pelo tutor                   |
| `pets.porte`                     | string    |         Sim | Porte do animal                             |
| `pets.status`                    | string    |         Sim | `desaparecido`, `achado` ou `encontrado`    |
| `pets.expiresAt`                 | timestamp |         Não | Data de expiração dos anúncios `achado`     |
| `pets.localiza`                  | string    |         Sim | Local textual do anuncio                    |
| `pets.lat` / `pets.lng`          | number    |         Sim | Coordenadas para o mapa                     |
| `pets.descricao`                 | string    |         Sim | Caracteristicas e informacoes adicionais    |
| `pets.imagem`                    | string    |         Sim | URL ou referencia da imagem                 |
| `pets.usuarioCriador`            | string    |         Sim | E-mail associado ao usuario autenticado     |
| `pets.contato`                   | string    |         Sim | Meio de contato do tutor                    |
| `pets.whatsapp`                  | string    |         Sim | Contato adicional do tutor                  |
| `avistamentos.petId`             | string    |         Sim | Pet relacionado                             |
| `avistamentos.localAvistado`     | string    |         Sim | Local do avistamento                        |
| `avistamentos.descricao`         | string    |         Sim | Relato do colaborador                       |
| `avistamentos.contatoReportador` | string    |         Sim | Meio de retorno do colaborador              |
| `avistamentos.petOwnerEmail`     | string    |         Sim | Responsavel que pode consultar a ocorrencia |

A padronizacao futura deve preferir `localizacao`, `imagemUrl`, `usuarioCriadorUid`, `criadoEm` e `atualizadoEm`. Essa mudanca exige migracao coordenada entre telas e regras.

### 11.5 Matriz CRUD por ator

| Entidade    | Visitante | Colaborador autenticado | Encontrador dono           | Tutor dono                 |
| ----------- | --------- | ----------------------- | -------------------------- | -------------------------- |
| Pet         | R         | R                       | C, R, U, D                 | C, R, U, D                 |
| Avistamento | R         | C, R conforme regra     | R, U, D conforme ownership | R, U, D conforme ownership |
| Contato     | C         | C                       | C                          | C                          |
| Usuário     | -         | R próprio via Auth      | R próprio via Auth         | R próprio via Auth         |

Legenda: **C** criar, **R** consultar, **U** atualizar, **D** excluir. A matriz representa a regra atual e deve ser revisada caso o sistema passe a separar dados publicos e privados.

### 11.4 Integridade e indices

- todo avistamento deve apontar para um pet existente;
- `usuarioCriador` deve corresponder ao e-mail autenticado no cadastro;
- `lat` e `lng` devem ser numeros dentro dos limites geograficos aceitos;
- consultas de lista devem ordenar por `data` e limitar a quantidade retornada;
- indices adicionais devem ser criados apenas quando uma consulta real exigir.

## 12. Regras de negocio e seguranca

- RN01: somente usuario autenticado pode criar pet.
- RN02: o criador do pet e identificado pelo campo `usuarioCriador`.
- RN03: somente o criador pode atualizar ou excluir seu pet.
- RN04: o status inicial deve ser `desaparecido` ou `achado`, conforme o formulario usado.
- RN05: somente o criador pode alterar o status; `achado` passa para `encontrado` apos confirmacao da devolucao.
- RN11: anúncio `achado` recebe `expiresAt` 40 dias após a publicação e é ocultado após o vencimento.
- RN12: o Firestore deve usar TTL em `expiresAt` para excluir fisicamente os anúncios vencidos.
- RN06: avistamento deve informar o `petId` e os campos obrigatorios.
- RN07: avistamentos podem ser lidos publicamente conforme regra atual, mas a aplicacao deve evitar exposicao desnecessaria de contatos.
- RN08: validacao no navegador melhora a experiencia, mas a regra do Firestore e a protecao efetiva contra escrita indevida.
- RN09: imagens devem respeitar as regras de tipo e tamanho do Storage.
- RN10: dados fornecidos por usuarios devem ser renderizados como texto seguro, evitando injecao de HTML.

### 12.1 Privacidade e LGPD

O sistema trata nome, e-mail, telefone, WhatsApp e relatos de contato como dados pessoais. Para uma evolucao alinhada a LGPD, devem ser observados:

- informar ao usuario a finalidade da coleta antes do cadastro ou envio;
- coletar somente os dados necessarios para localizar o pet e retornar ao colaborador;
- restringir o acesso aos contatos quando a funcionalidade permitir;
- permitir solicitacao de correcao ou exclusao dos dados;
- definir prazo de retencao para anuncios encerrados e avistamentos;
- registrar aceite dos termos quando houver coleta de dados pessoais;
- documentar o responsavel pelo tratamento e um canal de contato;
- evitar expor e-mail e WhatsApp em consultas publicas ou URLs.

No estado atual, os termos e a protecao de contato oferecem uma camada inicial, mas nao substituem uma politica de privacidade completa nem a separacao tecnica de campos publicos e privados.

## 13. Interfaces e experiencia do usuario

| Tela                    | Funcao                           | Acesso                         |
| ----------------------- | -------------------------------- | ------------------------------ |
| `index.html`            | Home, lista, filtros e mapa      | Publico                        |
| `criar-conta.html`      | Login e cadastro                 | Publico                        |
| `publicar.html`         | Formulario de publicacao         | Autenticado                    |
| `detalhes.html`         | Detalhes e avistamento           | Publico/autenticado para envio |
| `cadastrados.html`      | Meus Pets                        | Autenticado                    |
| `editar.html`           | Edicao de anuncio                | Dono autenticado               |
| `animais_encontra.html` | Consulta de achados e devolvidos | Publico                        |
| `publicar_achado.html`  | Cadastro de pet achado           | Autenticado                    |
| `dicas.html`            | Cuidados com animais             | Publico                        |
| `informativos.html`     | Conteudo informativo             | Publico                        |
| `contato.html`          | Mensagem para o projeto          | Publico                        |
| `termos.html`           | Termos de uso                    | Publico                        |

Diretrizes de interface:

- apresentar estados de carregamento, vazio, sucesso e erro;
- manter formularios com rotulos, mensagens de validacao e foco visivel;
- usar texto alternativo em imagens relevantes;
- garantir navegacao por teclado e contraste adequado;
- manter cards e marcadores consistentes entre lista, mapa e detalhes;
- nao revelar contato privado antes da confirmacao prevista no fluxo.

### 13.1 Wireframes funcionais

Os wireframes abaixo representam a organizacao das telas, nao o estilo visual final.

```text
HOME / INDEX
+----------------------------------------------------------+
| Logo | Buscar | Filtros | Entrar                         |
+----------------------------------------------------------+
| Mapa com marcadores                                     |
+----------------------------------------------------------+
| Cards de pets: foto | nome | status | local | detalhes  |
+----------------------------------------------------------+
```

```text
PUBLICAR PET
+----------------------------------------------------------+
| Titulo: Publicar pet                                    |
| Foto | Nome | Tipo | Raca | Porte | Status              |
| Localizacao e selecao no mapa                           |
| Descricao | Contato | WhatsApp                         |
|                         [Cancelar] [Publicar]           |
+----------------------------------------------------------+
```

```text
DETALHES DO PET
+----------------------------------------------------------+
| Foto e identificacao | Status | Localizacao            |
| Descricao e caracteristicas                           |
| Contato protegido [Revelar contato]                    |
| Formulario de avistamento                             |
|                         [Enviar avistamento]           |
+----------------------------------------------------------+
```

```text
MEUS PETS
+----------------------------------------------------------+
| Usuario | Sair                                           |
| Pet 1: status | [Editar] [Devolvido ao Tutor] [Excluir] |
| Pet 2: status | [Editar] [Devolvido ao Tutor] [Excluir] |
+----------------------------------------------------------+
```

## 14.1 Criterios de aceitacao

Os criterios abaixo complementam os requisitos e podem ser usados na demonstracao:

| Requisito | Dado                          | Quando                        | Entao                                       |
| --------- | ----------------------------- | ----------------------------- | ------------------------------------------- |
| RF01      | Usuario sem sessao            | informar credenciais validas  | sistema autentica e identifica o usuario    |
| RF02      | Usuario autenticado           | preencher campos obrigatorios | sistema cria o pet e confirma a publicacao  |
| RF05      | Pet com coordenadas validas   | abrir a home                  | sistema apresenta marcador correspondente   |
| RF07      | Pet existente e sessao valida | enviar avistamento completo   | sistema grava a ocorrencia vinculada ao pet |
| RF09      | Pet do usuario atual          | salvar alteracao valida       | sistema atualiza o documento                |
| RF10      | Pet de outro usuario          | tentar excluir                | regra rejeita a operacao                    |
| RF11      | Pet achado do usuario         | confirmar devolucao           | sistema altera o status para encontrado     |
| RNF02     | Tela em viewport mobile       | navegar e abrir formularios   | conteudo permanece legivel e utilizavel     |
| RNF04     | Listagem publica              | carregar cards                | contato nao e exibido diretamente           |

## 14. Plano de testes e validacao

| ID  | Cenario                                  | Resultado esperado                                       |
| --- | ---------------------------------------- | -------------------------------------------------------- |
| T01 | Visitante abre a home                    | Lista e mapa carregam ou exibem estado vazio/erro        |
| T02 | Usuario tenta publicar sem login         | Acesso e bloqueado ou redirecionado                      |
| T03 | Publicacao com campo obrigatorio vazio   | Formulario informa o campo e nao grava                   |
| T04 | Publicacao com coordenada invalida       | Operacao e rejeitada                                     |
| T05 | Publicacao valida com imagem             | Imagem sobe e pet aparece na lista                       |
| T06 | Usuario tenta editar pet de outro        | Firestore rejeita a operacao                             |
| T07 | Tutor edita o proprio pet                | Alteracoes aparecem nos detalhes                         |
| T08 | Criador confirma devolucao ou reencontro | Status muda para `encontrado`                            |
| T15 | Pessoa autenticada publica pet achado    | Anuncio surge na lista e no mapa com distincao visual    |
| T16 | Visitante tenta alterar status           | Nenhum botao de alteracao e disponibilizado              |
| T17 | Achado ultrapassa 40 dias                | Anuncio deixa de aparecer e aguarda exclusao por TTL     |
| T09 | Colaborador registra avistamento valido  | Ocorrencia e criada no pet correto                       |
| T10 | Avistamento sem autenticacao             | Operacao e bloqueada pela regra vigente                  |
| T11 | Contato na listagem publica              | Contato nao aparece diretamente                          |
| T12 | Navegacao em celular                     | Conteudo nao sobrepoe e controles permanecem utilizaveis |
| T13 | Dado com caracteres especiais            | Texto aparece sem executar HTML                          |
| T14 | Imagem inexistente ou pesada             | Sistema trata erro e preserva o layout                   |

A validacao academica deve combinar testes funcionais, verificacao visual responsiva, inspecao das regras do Firebase e conferencia dos criterios de aceite.

## 15. Matriz de rastreabilidade

| Requisito | Caso de uso | Tela/componente         | Persistencia ou regra      | Teste    |
| --------- | ----------- | ----------------------- | -------------------------- | -------- |
| RF01      | UC07, UC08  | `criar-conta.html`      | Firebase Authentication    | T02      |
| RF02      | UC07        | `publicar.html`         | `pets`, regra `create`     | T03, T05 |
| RF03      | UC07        | Formulario de imagem    | Firebase Storage           | T05, T14 |
| RF04      | UC01        | `index.html`            | Query Firestore            | T01      |
| RF05      | UC02        | Home/mapa               | `lat`, `lng`, Leaflet      | T01, T04 |
| RF06      | UC03        | `detalhes.html`         | `pets/{petId}`             | T01      |
| RF07      | UC06        | Detalhes                | `avistamentos`             | T09, T10 |
| RF08      | UC08        | `cadastrados.html`      | Filtro por responsavel     | T06      |
| RF09      | UC09        | `editar.html`           | Regra `update`             | T07      |
| RF10      | UC10        | `cadastrados.html`      | Regra `delete`             | T06      |
| RF11      | UC11        | `animais_encontra.html` | Acao do criador e `status` | T08      |
| RF15      | UC12        | `publicar_achado.html`  | `pets.status = achado`     | T15      |
| RF16      | UC12        | Listas e mapa           | `pets.expiresAt` + TTL     | T17      |
| RF14      | UC03        | Detalhes e encontrados  | Fluxo de confirmacao       | T11      |

## 16. Riscos e mitigacoes

| Risco                    | Impacto                            | Mitigacao                                  |
| ------------------------ | ---------------------------------- | ------------------------------------------ |
| Exposicao de contato     | Spam e perda de privacidade        | Ocultar na lista e exigir confirmacao      |
| Escrita indevida         | Alteracao de anuncios de terceiros | Authentication e regras do Firestore       |
| XSS por dados de usuario | Comprometimento da sessao          | Renderizacao segura com texto e elementos  |
| Muitas leituras          | Custo e lentidao                   | `limit`, ordenacao e listeners controlados |
| Imagens pesadas          | Carregamento lento                 | Validar tamanho, proporcao e lazy loading  |
| Campos inconsistentes    | Falha entre telas                  | Dicionario e plano de migracao             |
| Falha de servico externo | Indisponibilidade parcial          | Estados de erro e mensagens claras         |

## 17. Evolucao planejada

1. padronizar nomes de campos e adicionar `criadoEm` e `atualizadoEm`;
2. separar dados publicos e privados de contato;
3. implementar filtro por distancia usando coordenadas;
4. criar pagina de adocao com regras proprias;
5. adicionar perfil administrativo e moderacao;
6. configurar App Check em producao;
7. incluir notificacoes de novos avistamentos;
8. avaliar a API Node.js + Express quando a regra de negocio exigir backend proprio;
9. criar indicadores de anuncios, avistamentos e reencontros;
10. executar testes automatizados de regras e fluxos criticos.

### 17.1 Glossario do dominio

| Termo            | Definicao                                                    |
| ---------------- | ------------------------------------------------------------ |
| Pet              | Animal cadastrado na plataforma                              |
| Tutor            | Usuario responsavel por um anuncio                           |
| Colaborador      | Pessoa que informa um avistamento ou contribui com a busca   |
| Avistamento      | Relato de que um animal foi visto em determinado local       |
| Anuncio          | Documento publico com dados de um pet                        |
| Desaparecido     | Status de um pet cuja localizacao esta sendo procurada       |
| Encontrado       | Status de um pet cujo reencontro foi informado pelo tutor    |
| Ownership        | Regra que vincula uma operacao ao responsavel pelo documento |
| Firebase Storage | Servico usado para armazenar imagens                         |
| Firestore        | Banco de dados usado para pets e avistamentos                |

### 17.2 Referencias

- OBJECT MANAGEMENT GROUP. _Unified Modeling Language (UML), Version 2.5.1_. Disponivel em: <https://www.omg.org/spec/UML/2.5.1/>. Acesso em: 19 ago. 2026.
- SOMMERVILLE, Ian. _Engenharia de Software_. Sao Paulo: Pearson, 2019.
- BRASIL. _Lei Geral de Protecao de Dados Pessoais - Lei n. 13.709/2018_. Disponivel em: <https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm>. Acesso em: 19 ago. 2026.
- FIREBASE. _Documentacao do Firebase_. Disponivel em: <https://firebase.google.com/docs>. Acesso em: 19 ago. 2026.
- W3C. _Web Content Accessibility Guidelines (WCAG) 2.2_. Disponivel em: <https://www.w3.org/TR/WCAG22/>. Acesso em: 19 ago. 2026.

### 17.3 Ferramentas utilizadas na modelagem e documentacao

- Mermaid: modelagem textual de diagramas de caso de uso, processo, estados, arquitetura e sequencia.
- Markdown: consolidacao dos artefatos tecnicos e rastreabilidade da modelagem.
- Visual Studio Code: edicao dos diagramas, documentos e revisao de consistencia.
- Python (`python-docx` e `Pillow`): geracao de diagrama em imagem e incorporacao no arquivo DOCX exigido na entrega.

Observacao: na entrega academica, os diagramas tecnicos foram mantidos em Mermaid para rastreabilidade e manutencao, e o diagrama da metodologia foi incorporado no documento final em formato compativel com o modelo da disciplina.

## 18. Conclusao

A modelagem apresenta o PetConecta sob as perspectivas de negocio, requisitos, comportamento, dados, arquitetura, navegacao, seguranca, interface e validacao. Ela representa o estado atual do site sem confundir funcionalidades propostas com funcionalidades implementadas e oferece uma base para apresentacao academica, manutencao e evolucao do sistema.

Os documentos complementares sao:

- [arquitetura.md](arquitetura.md): decisoes tecnicas e operacionais;
- [riscos-e-mitigacoes.md](riscos-e-mitigacoes.md): riscos observados e mitigacoes;
- [modelagem-node-express-firebase.md](modelagem-node-express-firebase.md): alternativa de backend futuro;
- [README.md](../README.md): visao geral e instrucoes de execucao.

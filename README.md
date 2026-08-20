# PetConecta

## Visão geral

O PetConecta é uma aplicação web estática para divulgação de pets perdidos, encontrados e disponíveis para adoção. O projeto é hospedado no Firebase Hosting e tem persistência em Firestore, autenticação com Firebase Authentication e armazenamento de imagens em Firebase Storage.

A versão atual do projeto foi reforçada para produção com:

- inicialização centralizada do Firebase em um único módulo;
- proteção contra listeners duplicados por página;
- query com limite e ordenação explícita;
- paginação por blocos de itens;
- renderização segura do DOM e evitando `innerHTML` em trechos críticos;
- regras de segurança revisadas no Firestore e Storage;
- preparação para App Check com reCAPTCHA v3;
- carregamento de imagens com atenção ao peso e performance;
- proteção de dados sensíveis de contato, ocultando e-mail e WhatsApp na listagem pública;
- fluxo de autenticação com distinção entre primeiro cadastro e retorno de usuário já cadastrado.

## Objetivo do projeto

- permitir cadastro e divulgação de pets desaparecidos;
- facilitar o registro de animais encontrados;
- apoiar adoções responsáveis;
- permitir que o tutor visualize e gerencie os pets cadastrados;
- manter uma interface simples, responsiva e acessível.

## Arquitetura geral

O projeto é composto por:

- páginas estáticas em HTML, CSS e JavaScript na pasta `public/`;
- scripts de integração com Firebase na pasta `public/script/`;
- configuração do Firebase em `firebase.json`;
- regras de segurança em `firestore.rules` e `storage.rules`;
- banco de dados Firestore para registros de pets e avistamentos;
- autenticação e autorização via Firebase Authentication;
- upload de imagens em Firebase Storage;
- mapas interativos com Leaflet.

## Estrutura de pastas

- `public/`: páginas públicas do site e recursos estáticos
- `public/css/`: estilos do frontend
- `public/script/`: lógica do frontend e integrações com Firebase
- `src/`: arquivos auxiliares e configuração de serviços
- `docs/`: documentação de arquitetura, riscos, modelagem e roteiros
- `build/`: artefatos de publicação

## Estado atual do sistema

A aplicação segue o padrão de front-end estático com dados carregados dinamicamente no navegador via Firestore. Isso significa que o site continua sendo estático em termos de hospedagem, mas as telas de pets e encontrados são renderizadas em tempo real a partir de listeners do Firebase.

Principais pontos do estado atual:

- `public/script/firebase.js` centraliza a inicialização do app, DB, Auth, Storage e a query base de pets.
- `buildPetsQuery({ status, maxItems })` usa `orderBy` e `limit` para evitar consultas infinitas.
- listagens com `onSnapshot` usam filtros por página e bloco de itens, evitando carga massiva em um único render.
- o mapa e a lista não fazem polling contínuo; a atualização é acionada por eventos e mudança de dados relevantes.
- a saída DOM é tratada com criação de elementos e `DocumentFragment` sempre que possível, reduzindo risco de re-render completo.
- o contato do anunciante fica oculto na listagem pública e só é revelado no detalhe do pet após confirmação do visitante.
- o fluxo de acesso foi ajustado: primeiro cadastro segue para publicação e usuário já autenticado volta para a home.

## Funcionalidades principais

### 1. Cadastro e publicação de pets

A página de publicação coleta dados do pet, valida campos obrigatórios e salva a imagem no Firebase Storage e os metadados no Firestore.

### 2. Visualização e filtros

A página inicial e as listagens de pets exibem dados diretamente do Firestore, com filtros e paginação por blocos para manter a interface responsiva.

### 3. Registro de avistamentos

Os usuários podem registrar observações de pets perdidos ou encontrados em telas específicas, com registro persistido e visibilidade em fluxos de confirmação do tutor.

### 4. Área “Meus Pets”

Depois do login, o usuário acessa a área de gerenciamento e consulta os pets que cadastrou, com ações e visibilidade de dados associada à sua identidade no Firebase.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript ES Modules
- Firebase Hosting
- Firebase Authentication
- Firestore Database
- Firebase Storage
- Leaflet
- App Check (preparado para reCAPTCHA v3)

## Como executar localmente

1. Instale as dependências:

```bash
npm install
```

2. Em seguida, inicie o ambiente do Firebase local:

```bash
firebase emulators:start
```

3. Acesse o endereço local fornecido pelo emulador.

## Como fazer deploy

```bash
firebase deploy
```

## Regras de negócio e segurança

- o cadastro de pets está associado ao usuário autenticado;
- regras no Firestore e Storage devem continuar sendo revisadas conforme o projeto cresce;
- leitura pública pode continuar sendo usada para lista de pets e busca de ocorrências;
- ações sensíveis precisam depender da autenticação real e das regras do banco como camada principal de segurança;
- App Check deve ser configurado em produção com a chave real do reCAPTCHA v3;
- dados de contato permanecem protegidos em listagens públicas e só são revelados em fluxo específico de confirmação;
- primeiro cadastro segue para publicação e usuário já cadastrado retorna para a página inicial.

## Fluxo técnico de cadastro de pet

1. o usuário acessa a página de publicação;
2. preenche nome, tipo, status, localização, dados de contato e imagem;
3. a imagem é enviada ao Storage;
4. os metadados do pet são persistidos no Firestore;
5. a página de listagem ou detalhes lê o registro e renderiza a informação na interface.

## Estrutura principal dos documentos do Firestore

### Coleção `pets`

Campos esperados em um documento de pet:

- nome
- descricao
- status
- imagem
- localiza ou localizacao
- usuarioCriador
- data
- contato
- whatsapp
- raca

### Uso de limites na consulta

A query base no cliente utiliza:

- `orderBy("data", "desc")`
- `limit(maxItems)`

Isso reduz o custo de leitura e mantém a interface estável mesmo com grande volume de registros.

## Scripts principais do frontend

### `public/index.html`

Página inicial e interface de mapa, com carregamento e atualização de pet por dados do Firestore.

### `public/publicar.html`

Formulário de publicação com validação e persistência no Storage + Firestore.

### `public/detalhes.html`

Detalhes do pet, com nova camada de proteção para contato e confirmação do visitante antes da revelação pública do e-mail/WhatsApp.

### `public/cadastrados.html`

Área do usuário autenticado com seus pets e ações de gerenciamento.

### `public/criar-conta.html`

Fluxo de cadastro/login com diferenciação entre primeiro acesso e retorno de usuário autenticado.

## Documentação complementar

- `docs/arquitetura.md`: visão técnica e arquitetura do projeto;
- `docs/riscos-e-mitigacoes.md`: análise de riscos, causas e mitigação aplicada;
- `docs/modelagem-site.md`: modelagem do fluxo do site e organização visual.

## Recomendações para manutenção

- revisar os campos e regras do Firestore sempre que houver mudança de fluxo;
- manter App Check habilitado em produção com a chave real;
- validar listagens e filtros com volume maior de dados antes de expandir a base;
- revisar rapidamente qualquer nova tela que insira dados do usuário em HTML direto;
- continuar preferindo renderização segura e carregamento por blocos.

## Autores e contexto

Projeto desenvolvido para apoiar a divulgação e o resgate de pets, priorizando simplicidade de uso, segurança básica, performance e manutenção constante do código front-end.

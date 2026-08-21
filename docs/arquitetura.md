# Arquitetura do PetConecta

> Documento complementar para entrega acadêmica e manutenção do projeto: [modelagem-site.md](modelagem-site.md)

## 1. Visão geral

O PetConecta é uma aplicação web estática hospedada no Firebase Hosting, com persistência em Firestore, autenticação em Firebase Authentication e armazenamento de imagens em Firebase Storage. O frontend é composto por páginas HTML e scripts modulares em JavaScript, sem backend tradicional em Node.js para a experiência principal do usuário.

## 2. Componentes principais

### Frontend

- páginas estáticas em HTML/CSS/JS;
- scripts de listagem, filtro, autenticação e formulário;
- integração com o Firebase via SDK Web;
- renderização de cards, mapa e ações do usuário no navegador.

### Serviços do Firebase

- Firebase Hosting: entrega do site estático;
- Firebase Authentication: login e identidade do usuário;
- Firestore: persistência de dados de pets e ocorrências;
- Firebase Storage: upload e armazenamento de imagens;
- App Check: controle de abuso e proteção da API em produção.

## 3. Padrão arquitetural atual

A estrutura atual prioriza simplicidade operacional e baixo custo, mantendo o projeto com arquitetura leve:

- frontend estático sem servidor de aplicação próprio;
- lógica principal no navegador;
- Firestore como fonte principal de dados;
- regras de segurança para validação de acesso e escrita;
- centralização da inicialização do Firebase em `public/script/firebase.js`.

## 4. Inicialização centralizada do Firebase

A aplicação passou a usar um módulo único para inicializar e exportar:

- `app`
- `db`
- `auth`
- `storage`
- `buildPetsQuery()`

Esse padrão evita múltiplas instâncias do SDK e reduz risco de listeners duplicados, falhas de estado e overhead de rede.

## 5. Fluxo de listagem e renderização

A listagem de pets usa `onSnapshot` sobre uma consulta base construída com:

- `where` quando necessário;
- `orderBy("data", "desc")`;
- `limit(maxItems)` para controlar o volume de leitura;

A renderização é feita em blocos, geralmente com criação de elementos do DOM e atualização controlada para evitar re-render completo da interface em cada mudança.

## 6. Fluxo de cadastro de pet

1. o usuário acessa a página de publicação;
2. preenche nome, tipo, status, localização e dados de contato;
3. a imagem é enviada para o Firebase Storage;
4. os metadados do pet são gravados no Firestore;
5. a listagem e a página de detalhes passam a refletir esse registro automaticamente.

### 6.1 Cadastro de pet encontrado por terceiros

O fluxo de `publicar_achado.html` cria um documento em `pets` com `status: "achado"`. Esse estado identifica um animal localizado por uma terceira pessoa, mas ainda não devolvido ao tutor. A página pública `animais_encontra.html` lista registros `achado` e `encontrado`; registros `desaparecido` ficam na busca principal.

Quando o tutor confirma a devolução, somente o usuário identificado por `usuarioCriador` pode acionar **Devolvido ao Tutor**. A operação atualiza o documento para `status: "encontrado"`. A interface orienta essa permissão e as regras do Firestore impedem alterações indevidas.

### 6.2 Retenção de achados por terceiros

Todo anúncio criado por `publicar_achado.html` recebe `expiresAt`, um Timestamp 40 dias após a publicação. As páginas de encontrados, lista principal e mapa filtram anúncios `achado` vencidos imediatamente. A exclusão definitiva do documento é responsabilidade da política TTL do Firestore, configurada no campo `expiresAt` do grupo de coleção `pets`:

```bash
gcloud firestore fields ttls update expiresAt --collection-group=pets --enable-ttl --project=petconecta-db068
```

Como o TTL é assíncrono, pode existir um intervalo entre o vencimento e a remoção física; durante esse intervalo o anúncio já permanece oculto na aplicação.

## 7. Fluxo de autenticação e retorno de usuário

1. o usuário acessa a página de cadastro/login;
2. em caso de primeiro cadastro, o fluxo envia para publicação do pet;
3. em caso de usuário já autenticado, o sistema devolve para a página inicial;
4. a autenticação continua sendo validada pelo Firebase Authentication e pelas regras do banco.

## 8. Proteção de contato e dados sensíveis

O projeto passou a tratar dados de contato como informação sensível. A listagem pública não expõe diretamente e-mail e WhatsApp. O bloco de detalhes do pet apresenta um aviso e um botão de confirmação antes de revelar os dados do anunciante.

O mesmo controle é aplicado em `animais_encontra.html`: os cards exibem apenas o aviso de contato protegido e o botão **Revelar contato**. Depois da confirmação do visitante, são apresentados os canais disponíveis. O e-mail usa a lógica de seleção de provedor do formulário de contato, com Gmail, Outlook, Yahoo ou `mailto:` como fallback; o WhatsApp abre o canal correspondente em nova aba.

Esse padrão reduz o risco de coleta automatizada, spam e exposição indevida, preservando a utilidade do contato para quem realmente deseja ajudar na localização do pet.

## 9. Fluxo de avistamento e confirmação

1. o usuário acessa a página de detalhes ou a ocorrência relacionada;
2. registra um avistamento com descrição e contato;
3. esses dados são persistidos e ficam acessíveis à área do tutor;
4. o processo é validado via regras de segurança e autenticação.

## 10. Estrutura de dados

### Coleção `pets`

Campos comumente usados:

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
- expiresAt (Timestamp de expiração dos achados por terceiros)

#### Estados do campo `pets.status`

- `desaparecido`: pet procurado pelo tutor;
- `achado`: pet encontrado por terceiros e aguardando devolução;
- `encontrado`: devolução ou reencontro confirmado pelo criador do anúncio.

### Coleção de ocorrências / avistamentos

A estrutura varia conforme o fluxo, mas normalmente contém:

- petId
- petNome
- localAvistado
- descricao
- contatoReportador
- reportadoPor
- dataRegistro

## 11. Páginas principais

- `public/index.html`: página inicial, mapa e listagem principal;
- `public/publicar.html`: formulário de cadastro;
- `public/detalhes.html`: detalhes do pet e registro de ocorrência, com proteção para contato privado;
- `public/cadastrados.html`: pets do usuário autenticado;
- `public/criar-conta.html`: autenticação e fluxo de login/cadastro;
- `public/animais_encontra.html`: listagem e mapa de ocorrências encontradas.
- `public/publicar_achado.html`: cadastro de animais encontrados por terceiros.

## 12. Considerações de desempenho

Os pontos de atenção na arquitetura atual incluem:

- evitar polling contínuo do mapa;
- manter apenas um listener por coleção por página;
- limitar a quantidade de itens carregados por bloco;
- utilizar lazy loading em imagens quando necessário;
- atualizar a interface de forma incremental em vez de reconstruir todo o DOM a cada alteração.

## 13. Segurança e produção

A aplicação foi ajustada para um cenário mais próximo de produção:

- regras de segurança no Firestore revisadas;
- regras de Storage com validação de tipo e tamanho;
- Auth como base de autorização;
- App Check preparado para uso com reCAPTCHA v3;
- remoção de padrões frágeis como renderização indiscriminada de HTML com dados do usuário;
- proteção de contato nos detalhes e cards para reduzir a exposição pública de e-mail e WhatsApp;
- fluxo de autenticação ajustado para respeitar primeiro cadastro e retorno de usuários já ativos.

## 14. Riscos e manutenção

- qualquer mudança em campos do documento exige revisão das páginas que leem e exibem esses dados;
- a estrutura do Firestore precisa ser documentada ao incluir novos fluxos;
- alterações de status devem preservar `desaparecido`, `achado` e `encontrado`, sem permitir transição pública;
- validações no cliente ajudam na UX, mas não substituem regras do servidor/banco;
- a chave real do App Check precisa ser configurada no ambiente de produção;
- a revisão de regras e renderização deve continuar em qualquer nova funcionalidade.

## 15. Próximos passos recomendados

- configurar a chave real do App Check em produção;
- revisar acesso de leitura se houver necessidade de reduzir exposição pública de dados sensíveis;
- separar ainda mais dados públicos e dados privados no Firestore quando houver necessidade de maior proteção;
- observar o crescimento de registros e aplicar paginação ou filtros mais agressivos conforme volume;
- manter a padronização de validação e renderização segura em novas telas.

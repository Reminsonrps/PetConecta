# PetConecta

## Visão geral

PetConecta é uma aplicação web voltada para ajudar na divulgação e localização de pets perdidos, além de apoiar a adoção responsável. A solução é hospedada no Firebase e usa Firestore para armazenar os registros de pets e avistamentos.

## Objetivo do projeto

- permitir o cadastro de pets desaparecidos;
- exibir pets em uma interface visual e amigável;
- permitir que a comunidade registre avistamentos;
- mostrar os cadastros do usuário autenticado em uma área própria.

## Arquitetura geral

O projeto é composto por:

- páginas estáticas em HTML, CSS e JavaScript na pasta public;
- arquivos de configuração do Firebase em firebase.json e package.json;
- banco de dados Firestore para persistência dos dados;
- autenticação via Firebase Authentication.

## Estrutura de pastas

- public/: páginas do site e recursos estáticos
  - index.html: página inicial
  - publicar.html: formulário de cadastro de pets
  - detalhes.html: página de detalhes do pet e formulário de avistamento
  - cadastrados.html: área do usuário com seus pets cadastrados
  - css/: folhas de estilo compartilhadas e específicas
  - script/: scripts auxiliares e lógicas do frontend
- src/: arquivos de backend/serviços e configuração da API
- build/: saída de build ou versão publicada

## Funcionalidades principais

### 1. Cadastro de pets

O usuário pode publicar um pet perdido ou disponível para adoção através da página de publicação. Os dados são salvos no Firestore.

### 2. Visualização de pets

A página inicial exibe os pets em um mapa e em cards, permitindo uma navegação rápida pela lista de ocorrências.

### 3. Registro de avistamentos

Na página de detalhes, qualquer pessoa pode registrar um avistamento de um pet perdido, mesmo sem estar logada.

### 4. Área “Meus Pets”

Após autenticar-se, o usuário consegue visualizar os pets que cadastrou e os avistamentos recebidos para cada um deles.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript ES Modules
- Firebase Hosting
- Firebase Authentication
- Firestore Database
- Leaflet para o mapa

## Como executar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de hospedagem local do Firebase:
   ```bash
   firebase emulators:start
   ```
3. Acesse o projeto no navegador através do endereço local disponibilizado pelo Firebase.

## Como fazer deploy

O projeto pode ser publicado com:

```bash
firebase deploy
```

## Regras de negócio importantes

- O cadastro de pets é associado ao e-mail do usuário autenticado.
- Os avistamentos podem ser enviados sem login, desde que a regra de segurança permita.
- A exibição de avistamentos na área do usuário é feita sob demanda, para reduzir leituras no Firestore.

## Pontos de atenção para manutenção

- manter as regras do Firestore atualizadas conforme a segurança exigir;
- revisar a estrutura dos documentos de pets e avistamentos para evitar inconsistências;
- validar se as páginas continuam compatíveis com os caminhos relativos e links internos;
- revisar os estilos responsivos em telas menores.

## Fluxo técnico de cadastro de pet

1. O usuário acessa a página de publicação.
2. Preenche os campos do formulário com nome, descrição, localização e imagem.
3. O formulário envia os dados para o Firestore, criando um documento na coleção pets.
4. O documento contém campos como nome, descrição, status, localização, e-mail do criador e metadados do cadastro.
5. A página de detalhes lê esse documento pelo id recebido na URL e exibe as informações completas.

## Estrutura esperada dos documentos no Firestore

### Coleção pets

Cada documento representa um pet cadastrado e pode conter campos como:

- nome
- descricao
- status
- imagem
- lat / lng
- usuarioCriador
- dataCadastro

### Subcoleção avistamentos

Cada pet pode ter uma subcoleção chamada avistamentos com documentos contendo:

- localAvistado
- descricao
- contatoReportador
- reportadoPor
- petId
- petNome
- petOwnerEmail
- dataRegistro

## Scripts principais do frontend

### public/index.html

Responsável pela página inicial, pelo mapa principal e pelo carregamento inicial dos pets.

### public/publicar.html

Contém o formulário de publicação e a lógica de envio dos dados do pet.

### public/detalhes.html

Exibe os detalhes do pet e inclui o formulário de avistamento.

### public/cadastrados.html

Mostra os pets cadastrados pelo usuário autenticado e carrega os avistamentos sob demanda.

## Guia para novos desenvolvedores

- use o Firebase Authentication para autenticar usuários;
- mantenha a mesma estrutura de nomes de campos para evitar inconsistências entre páginas;
- prefira consultas pontuais em vez de listeners contínuos quando possível;
- revise as regras do Firestore sempre que adicionar novos fluxos de leitura ou escrita;
- teste o fluxo completo em navegadores desktop e mobile antes de publicar.

## Pontos recomendados de melhoria futura

- implementar paginação real para listas grandes;
- adicionar cache local para reduzir consultas repetidas;
- criar uma área administrativa para moderar cadastros e avistamentos;
- melhorar a validação de formulário e mensagens de erro.

## Autores e contexto

Projeto desenvolvido para apoiar a divulgação e o resgate de pets perdidos, com foco em simplicidade de uso e boa experiência na web.

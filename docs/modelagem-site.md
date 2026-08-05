# Modelagem do Site - PetConecta

## 1. Contexto e Objetivo

Este documento apresenta a modelagem do sistema PetConecta a partir da analise do codigo ja implementado (engenharia reversa), com foco em apoiar entrega academica.

Objetivo do sistema:

- apoiar tutores na divulgacao de pets desaparecidos;
- permitir que a comunidade registre avistamentos;
- oferecer conteudo informativo de apoio sobre cuidados e saude animal.

## 2. Escopo Funcional

### 2.1 Atores

- Visitante: visualiza pets, mapa e conteudo informativo.
- Usuario autenticado (tutor): cadastra pet, edita, exclui e marca como encontrado.
- Colaborador da comunidade: registra avistamento em pet publicado.

### 2.2 Requisitos funcionais principais

- RF01: autenticar usuario para cadastro e gestao de pets.
- RF02: cadastrar pet com dados, localizacao e imagem.
- RF03: listar pets em cards e no mapa.
- RF04: exibir detalhes do pet por identificador.
- RF05: registrar avistamento vinculado ao pet.
- RF06: permitir ao tutor editar/excluir seu proprio pet.
- RF07: permitir ao tutor atualizar status para encontrado.
- RF08: exibir area Meus Pets e avistamentos relacionados.

### 2.3 Requisitos nao funcionais principais

- RNF01: responsividade para dispositivos moveis.
- RNF02: persistencia em nuvem com Firebase/Firestore.
- RNF03: controle de acesso por regras de seguranca no Firestore.
- RNF04: disponibilidade web via Firebase Hosting.

## 3. Modelagem de Casos de Uso

```mermaid
flowchart LR
    V[Visitante] --> UC1[Visualizar pets e mapa]
    V --> UC2[Ver detalhes do pet]
    V --> UC3[Registrar avistamento]
    V --> UC4[Consumir conteudo informativo]

    U[Usuario autenticado] --> UC5[Cadastrar pet]
    U --> UC6[Editar pet proprio]
    U --> UC7[Excluir pet proprio]
    U --> UC8[Marcar pet como encontrado]
    U --> UC9[Consultar Meus Pets]

    UC2 --> UC3
```

## 4. Arquitetura Logica

```mermaid
flowchart TB
    subgraph Cliente[Frontend Web]
        H1[index.html]
        H2[publicar.html]
        H3[detalhes.html]
        H4[cadastrados.html]
        H5[informativos e dicas]
        JS[Scripts JS modulares]
        MAP[Leaflet + OpenStreetMap]
    end

    subgraph Firebase[Plataforma Firebase]
        AUTH[Firebase Authentication]
        FS[Cloud Firestore]
        ST[Firebase Storage]
        HOST[Firebase Hosting]
    end

    Cliente --> AUTH
    Cliente --> FS
    Cliente --> ST
    Cliente --> HOST
    JS --> MAP
```

## 5. Mapa de Navegacao (Sitemap)

```mermaid
flowchart TD
    INI[index.html] --> PUB[publicar.html]
    INI --> DET[detalhes.html]
    INI --> CAD[cadastrados.html]
    INI --> ENC[animais_encontra.html]
    INI --> DIC[dicas.html]
    INI --> INF[informativos.html]
    INI --> CON[contato.html]

    DET --> AV[Envio de avistamento]
    CAD --> EDI[editar.html]
```

## 6. Modelo Conceitual de Dados

```mermaid
erDiagram
    PET ||--o{ AVISTAMENTO : possui
    USUARIO ||--o{ PET : cadastra

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
        string localizacao
        float lat
        float lng
        string contato
        string whatsapp
        string descricao
        string imagem
        string status
        string usuarioCriador
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
```

## 7. Modelo Logico (Firestore)

Colecao principal:

- pets/{petId}

Subcolecao:

- pets/{petId}/avistamentos/{avistamentoId}

Observacoes de regra e seguranca (extraidas de firestore.rules):

- leitura de pets e avistamentos: publica;
- criacao de pet: exige usuario autenticado e campo usuarioCriador igual ao email autenticado;
- update/delete de pet: permitido apenas ao criador;
- criacao de avistamento: publica com validacao de campos obrigatorios;
- update/delete de avistamento: permitido ao tutor dono do pet.

## 8. Fluxos Principais (Sequencia)

### 8.1 Cadastro de pet

```mermaid
sequenceDiagram
    participant U as Usuario autenticado
    participant P as publicar.html
    participant S as Firebase Storage
    participant F as Firestore

    U->>P: Preenche formulario e seleciona local no mapa
    P->>S: Upload da imagem
    S-->>P: URL da imagem
    P->>F: addDoc em pets
    F-->>P: Confirmacao de cadastro
    P-->>U: Mensagem de sucesso e redirecionamento
```

### 8.2 Registro de avistamento

```mermaid
sequenceDiagram
    participant V as Visitante
    participant D as detalhes.html
    participant F as Firestore

    V->>D: Abre detalhes do pet
    V->>D: Envia formulario de avistamento
    D->>F: addDoc em pets/{petId}/avistamentos
    F-->>D: Confirmacao
    D-->>V: Mensagem de sucesso
```

## 9. Regras de Negocio

- RN01: somente usuario autenticado pode cadastrar pet.
- RN02: somente criador do pet pode editar, excluir e marcar encontrado.
- RN03: avistamento e sempre vinculado a um pet existente.
- RN04: status padrao do pet no cadastro e desaparecido.
- RN05: localizacao do pet utiliza coordenadas geograficas para mapa e filtros.

## 10. Limites e Evolucao Recomendada

- implementar filtro real de proximidade por distancia geografica (ex.: raio em km com Haversine);
- consolidar padrao de nomes de campos (tipo/raca/localiza/localizacao);
- incluir trilha de auditoria com data de criacao e atualizacao em todos os documentos;
- criar indicadores analiticos para taxa de reencontro por periodo.

## 11. Conclusao

A modelagem acima representa o sistema PetConecta de forma aderente ao estado atual da implementacao e pode ser usada como base de entrega academica em disciplinas de Analise e Projeto de Sistemas, Engenharia de Software ou Banco de Dados.

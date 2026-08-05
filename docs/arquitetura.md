# Arquitetura do PetConecta

> Documento complementar para entrega academica: [modelagem-site.md](modelagem-site.md)

## 1. Visão geral

O PetConecta é uma aplicação web estática hospedada no Firebase Hosting, com persistência de dados em Firestore e autenticação via Firebase Authentication. A interface é composta por páginas HTML independentes, cada uma com seus próprios scripts modulares em JavaScript.

## 2. Componentes principais

### Frontend

- páginas estáticas em HTML
- estilos em CSS
- scripts JavaScript para interação, formulário e integração com o Firebase

### Backend / serviços

- Firebase Hosting para hospedar o site
- Firebase Authentication para login e identificação do usuário
- Firestore para armazenar pets e avistamentos

## 3. Fluxo de cadastro de pet

1. O usuário acessa a página de publicação.
2. Preenche os dados do pet.
3. O formulário envia os dados para a coleção pets no Firestore.
4. O documento criado recebe um identificador único.
5. A página de detalhes usa esse identificador para carregar as informações do pet.

## 4. Fluxo de avistamento

1. O usuário acessa a página de detalhes de um pet.
2. Preenche o formulário de avistamento.
3. O sistema cria um documento na subcoleção avistamentos do pet.
4. O tutor, ao acessar a área “Meus Pets”, consegue visualizar esses registros.

## 5. Estrutura de dados sugerida

### Coleção pets

Cada documento representa um pet. Campos comuns:

- nome
- descricao
- status
- imagem
- lat
- lng
- usuarioCriador
- dataCadastro

### Subcoleção avistamentos

Cada documento representa um relato de avistamento. Campos comuns:

- localAvistado
- descricao
- contatoReportador
- reportadoPor
- petId
- petNome
- petOwnerEmail
- dataRegistro

## 6. Páginas principais

- index.html: página inicial e mapa principal
- publicar.html: formulário de cadastro
- detalhes.html: detalhes do pet e formulário de avistamento
- cadastrados.html: pets do usuário autenticado e avistamentos associados

## 7. Pontos de integração

- integração com Firestore via SDK JavaScript do Firebase
- integração com Authentication para reconhecer usuário logado
- uso de scripts modulares para evitar duplicação de lógica

## 8. Considerações de desempenho

- consultas pontuais são preferíveis a listeners contínuos;
- carregamento sob demanda reduz a quantidade de leituras no Firestore;
- o uso de limite em consultas ajuda a manter o site escalável.

## 9. Riscos e manutenção

- mudanças na estrutura dos documentos exigem atualização em todas as páginas dependentes;
- regras do Firestore precisam ser revisadas ao incluir novos acessos;
- validação de formulário e mensagens de erro devem ser mantidas consistentes.

## 10. Próximos passos recomendados

- implementar paginação real para listas grandes;
- criar cache local para reduzir consultas repetidas;
- adicionar painel administrativo para moderar cadastros;
- melhorar a experiência mobile em telas pequenas.

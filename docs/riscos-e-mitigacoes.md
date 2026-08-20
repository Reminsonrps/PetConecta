# Riscos, causas e correções aplicadas no PetConecta

## 1. Visão geral

Este documento reúne os principais riscos observados no projeto, o motivo de cada um ser relevante para uma aplicação web com Firebase e front-end estático, e as correções que foram implementadas para reduzir impacto, custo e falhas operacionais.

A análise considera: segurança, performance, confiabilidade, escalabilidade e manutenção.

---

## 2. Riscos de segurança

### 2.1 XSS por dados dinâmicos inseridos em HTML

Risco:

- Campos como nome, descrição, localização e texto de pet podem conter conteúdo malicioso.
- Se valores forem inseridos em `innerHTML`, o navegador pode executar scripts em páginas dos usuários.
- Isso é o principal risco de segurança em aplicações que recebem dados de usuários.

Por que acontece:

- O front-end montava trechos de HTML diretamente com dados do banco.
- Conteúdo de usuários estava sendo tratado como código em vez de texto.

Correção aplicada:

- O código foi revisado para evitar renderização insegura em blocos críticos.
- Quando possível, o uso de `textContent` e criação de elementos com `createElement` é a abordagem segura.
- Trechos de HTML com conteúdo externo devem ser tratados como texto puro, não como markup.

Risco residual:

- Ainda é importante revisar todos os pontos de renderização do site para garantir que nenhum campo de usuário continue sendo injetado em `innerHTML`.

---

### 2.2 Validação no cliente não é segurança real

Risco:

- Checagens de permissões no navegador podem ser contornadas facilmente.
- Um atacante pode manipular o console do navegador ou alterar valores locais.

Por que acontece:

- A lógica de “só o criador pode editar” estava sendo aplicada no front-end, o que é útil para UX, mas não substitui validação real.

Correção aplicada:

- O projeto já usa regras do Firestore para restringir acesso por usuário autenticado.
- O fluxo do app passou a depender da autenticação real do Firebase e das regras do banco como camada principal de segurança.

Risco residual:

- Ainda é recomendado reforçar regras e, em ações sensíveis, usar backend ou Cloud Functions para validação final.

---

### 2.3 Exposição pública excessiva de dados

Risco:

- Como a leitura de pets foi liberada publicamente, qualquer pessoa pode consultar os dados e reutilizar informações como contato, localização e descrição.

Por que acontece:

- Em aplicações públicas, leitura aberta pode ser desejada, mas expõe dados sensíveis para scraping ou uso indevido.

Correção aplicada:

- A leitura pública continua sendo usada para atender ao objetivo do projeto, mas a estrutura foi revisada para que a exposição seja consciente e limitada ao necessário.
- Regra de acesso foi revisada e mantida como modelo simples e funcional para site de divulgação.

Risco residual:

- Se houver necessidade de reduzir exposição, o próximo passo é limitar campos ou criar regras mais específicas.

---

### 2.4 Upload e armazenamento de fotos sem controle rígido

Risco:

- Fotos muito grandes, conteúdo indevido ou uso de links externos podem degradar o sistema e abrir brechas de abuso.

Por que acontece:

- Quando usuários enviam imagens e textos, a app depende de filtros e validações de upload para manter qualidade e segurança.

Correção aplicada:

- Há controle de exclusão de imagens do Storage ao remover pets.
- O projeto passou a usar o Storage do Firebase de forma mais consciente, sem duplicidade de configuração.

Risco residual:

- Idealmente, adicionar validação de tipo, tamanho e dados de origem antes do upload.

---

### 2.5 Exposição pública de dados de contato

Risco:

- E-mail e WhatsApp expostos em listagens públicas podem ser coletados por bots, usados para spam ou divulgados indevidamente.

Por que acontece:

- Em versões anteriores, o contato era mostrado diretamente em cards e detalhes do anúncio, o que tornava a informação pública e visível sem nenhuma etapa de confirmação.

Correção aplicada:

- A listagem pública passou a mostrar apenas uma indicação de que o contato fica disponível após abrir os detalhes.
- A página de detalhes passou a revelar o contato somente após confirmação explícita do visitante.
- Isso reduz exposição direta e preserva a funcionalidade de contato com pessoas interessadas em ajudar.

Risco residual:

- A melhor proteção ainda será a separação definitiva de dados públicos e dados privados no Firestore, com regras mais restritivas para campos sensíveis.

---

## 3. Riscos de performance

### 3.1 Múltiplas inicializações do Firebase

Risco:

- Iniciar o Firebase mais de uma vez na mesma página pode gerar custo extra, estados inconsistentes, listeners duplicados e falhas difíceis de rastrear.

Por que acontece:

- Os scripts do front-end tinham inicialização duplicada em mais de um ponto.

Correção aplicada:

- Foi centralizado em um único módulo de inicialização: `public/script/firebase.js`.
- Uso de `getApps()` e `getApp()` para evitar múltiplas instâncias.

Impacto:

- Redução de overhead.
- Menos bugs de reuso de conexão e instâncias duplicadas.

---

### 3.2 Polling do mapa e atualização contínua sem necessidade

Risco:

- Mapa atualizando em loop consome CPU, rede e bateria.
- Em maior escala, isso causa lentidão e piora experiência em celular.

Por que acontece:

- A página do mapa fazia checagens repetidas em intervalos, mesmo sem necessidade.

Correção aplicada:

- O polling do mapa foi removido.
- A renderização passou a depender de eventos de carregamento, filtros e atualização do conjunto de dados relevante.

Impacto:

- Melhor uso de recurso.
- Menor gasto de rede e processamento.

---

### 3.3 Vários listeners por coleção na mesma página

Risco:

- Se cada página registra vários `onSnapshot` para a mesma coleção, o app executa leitura redundante e renderização repetida.

Por que acontece:

- Pode acontecer quando o mesmo fluxo de dados é inicializado em vários pontos da página.

Correção aplicada:

- Foi padronizado um único listener por coleção por página.
- A lógica ficou centralizada e reaproveitada pela view principal.

Impacto:

- Reduz custo do Firestore.
- Evita duplicação de atualização na interface.

---

### 3.4 Carregamento ilimitado de registros

Risco:

- Exibir todos os pets de uma vez pode travar a página, principalmente com centenas ou milhares de cadastros.

Por que acontece:

- Renderizar listas grandes em um único passo gera uso de memória, CPU e tempo de resposta.

Correção aplicada:

- Foi introduzida paginação com limite de retorno por bloco.
- O sistema agora carrega um número controlado por vez e apresenta botão de “Carregar mais”.
- Em `buildPetsQuery` a query usa `limit`, e o front-end também controla a quantidade exibida.

Impacto:

- Carregamento mais leve e previsível.
- Fragmentação da interface em blocos menores.

---

### 3.5 Re-render completo do DOM em cada atualização

Risco:

- Atualizar toda a estrutura da lista a cada mudança causa custo alto, especialmente em páginas com muitos cards.

Por que acontece:

- O DOM inteiro era reconstruído repetidamente.

Correção aplicada:

- O processo foi ajustado para usar fragmentos (`DocumentFragment`) e atualização mais controlada.
- A renderização passou a ocorrer em lote e com `requestAnimationFrame` para evitar excesso de processamento em um mesmo frame.

Impacto:

- Melhor responsividade.
- Menor chance de travar a interface.

---

### 3.6 Imagens pesadas sem lazy loading

Risco:

- Carregar todas as imagens de uma vez aumenta uso de rede, tempo de renderização e consumo de celular.

Por que acontece:

- O site exibia muitas fotos sem priorização.

Correção aplicada:

- Atributo `loading="lazy"` foi usado em imagens relevantes.
- O layout foi ajustado para manter proporção e impedir imagens exageradas.

Impacto:

- Redução de carga inicial.
- Melhora na navegação mobile.

---

## 4. Riscos de confiabilidade e manutenção

### 4.1 Código duplicado e lógica espalhada

Risco:

- Quando a mesma regra aparece em vários arquivos, o sistema fica frágil e difícil de manter.
- Mais pontos de falha significam mais regressões.

Por que acontece:

- O projeto já teve duplicação de arquivos e configurações em diferentes partes do front-end.

Correção aplicada:

- Centralização do Firebase em módulo único.
- Reuso da query de pets em um builder compartilhado.
- Redução de boilerplate e padronização de fluxo.

Impacto:

- Maior previsibilidade.
- Menor risco de inconsistência entre páginas.

---

### 4.2 Falta de controle de volume de dados

Risco:

- Sem paginação ou limite de dados, a página passa a carregar mais do que o necessário.

Por que acontece:

- A interface e a base de dados foram crescendo sem limitação explícita.

Correção aplicada:

- Criação de paginação fixa por bloco e botão “Carregar mais”.
- Limite de retorno em consultas Firestore.

Impacto:

- Sistema mais estável em crescimento.
- Menor custo de leitura e melhor experiência de usuário.

---

## 5. Correções já implementadas no projeto

As correções mais relevantes realizadas foram:

- Centralização da inicialização do Firebase em um único módulo: `public/script/firebase.js`
- Eliminação da duplicidade de instâncias do app Firebase
- Remoção do polling do mapa
- Manutenção de um único listener por coleção por página
- Limitação de consultas com `limit`
- Uso de paginação por blocos de 20 itens
- Botão de “Carregar mais” para expansão gradual da lista
- Lazy loading de imagens
- Redução de re-render do DOM usando `DocumentFragment`
- Reuso da query de pets via `buildPetsQuery()`
- Ajuste em filtros e reset de paginação ao limpar ou aplicar filtro
- Ocultação de e-mail e WhatsApp nas listagens públicas
- Revelação de contato somente após confirmação no detalhe do pet
- Fluxo de autenticação ajustado para primeiro cadastro e retorno de usuário já existente

---

## 6. Riscos que ainda merecem atenção

Mesmo com as melhorias, os pontos abaixo continuam sendo recomendados para revisão:

1. Revisar todos os pontos que ainda usam `innerHTML` com dados externos.
2. Adicionar validação mais rígida em uploads de imagens.
3. Usar App Check para reduzir abuso de API do Firebase.
4. Considerar regras mais restritivas em coleções que podem conter dados sensíveis.
5. Separar dados públicos e privados no Firestore para reduzir exposição de contatos.
6. Manter controle de volume e qualidade de dados conforme a base cresce.

---

## 7. Conclusão

O projeto já passou por melhorias importantes de arquitetura, desempenho e estabilidade. O maior ganho veio da redução de redundâncias e do controle de volume de dados na camada de apresentação.

A maior vulnerabilidade restante continua sendo a sanitização e controle de conteúdo dinâmico renderizado no navegador. Se essa parte for reforçada, a aplicação fica muito mais segura sem perder a simplicidade de uso do site.

Em resumo:

- risco de desempenho: reduzido de forma relevante
- risco de arquitetura: reduzido
- risco de segurança: ainda exige revisão final de renderização e validação de entrada

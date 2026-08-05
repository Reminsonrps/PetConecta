# Como gerar o Google Form via codigo (Apps Script)

## Arquivo de codigo

Use o script em [google-form-impacto.gs](google-form-impacto.gs).

## Passo a passo

1. Acesse https://script.new
2. Substitua o conteudo de Code.gs pelo conteudo do arquivo [google-form-impacto.gs](google-form-impacto.gs)
3. Clique em Salvar
4. No seletor de funcao, escolha createPetConectaImpactForm
5. Clique em Executar
6. Autorize as permissoes solicitadas
7. Abra Exibicoes > Logs para copiar:

- URL de edicao do formulario
- URL publica para respostas
- URL da planilha vinculada

## Ajustes finais no Google Forms

- Configuracoes > Respostas:
  - Nao limitar a 1 resposta
  - Nao exigir login
- Configuracoes > Apresentacao:
  - Manter mensagem final ja configurada
- Aba Respostas:
  - Verifique se a planilha foi vinculada corretamente

## O que o script ja cria para melhorar a UX

- Inclui a URL publica do PetConecta no topo do formulario
- Cria uma secao inicial pedindo que a pessoa acesse o site antes de responder
- Adiciona uma pergunta de confirmacao de acesso ao site
- Adiciona um campo de primeira impressao de uso (UX)

URL configurada no script:

- https://petconecta-db068.web.app

## Evidencias para o relatorio

- Print da tela de perguntas do formulario
- Print da aba Respostas (contagem total)
- Print da planilha Google Sheets com respostas
- Resumo por tipo de respondente e ODS mais citadas

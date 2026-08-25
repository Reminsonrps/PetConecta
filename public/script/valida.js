/* Arquivo de script: valida.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: valida.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

/*
  Script de validação do botão principal.
  Redireciona o usuário para criar conta ou publicar pet conforme o status de login.
*/
// Usa a mesma chave de sessao do fluxo de login para decidir o destino do usuario.
document.getElementById("action-btn").addEventListener("click", () => {
  const usuarioLogado = localStorage.getItem("usuarioLogado");

  if (!usuarioLogado) {
    window.location.href = "criar-conta.html"; // Página para criar usuário e senha
  } else {
    window.location.href = "publicar.html"; // Página de cadastro do pet
  }
});

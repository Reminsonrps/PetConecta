/* Arquivo de script: valida.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: valida.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

document.getElementById('action-btn').addEventListener('click', () => {
  const usuarioLogado = sessionStorage.getItem('usuarioLogado');

  if (!usuarioLogado) {
    window.location.href = 'criar-conta.html'; // Página para criar usuário e senha
  } else {
    window.location.href = 'publicar.html'; // Página de cadastro do pet
  }
});


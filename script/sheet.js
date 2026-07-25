/* Arquivo de script: sheet.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: sheet.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

document.getElementById("meuFormulario").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = {
    nome: e.target.nome.value,
    email: e.target.email.value,
    mensagem: e.target.mensagem.value
  };

  fetch("https://api.sheetmonkey.io/form/ozqbywstCFtqeGFHNboP5p", {
    method: "POST",
    body: JSON.stringify(formData),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => response.text())
  .then(data => {
    alert(data); // ou substitua por algo mais elegante
    document.getElementById("meuFormulario").reset();
    document.getElementById("mensagemStatus").textContent = "Mensagem enviada com sucesso!";
  })
  .catch(error => console.error("Erro:", error));
});

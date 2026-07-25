/* Arquivo de script: contatoAPI.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: contatoAPI.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

const frm = document.querySelector("#contact-form");

if (frm) {
  frm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = frm.nome.value;
    const email = frm.email.value;
    const mensagem = frm.mensagem.value;

    try {
      const response = await fetch("http://localhost:3000/api/contatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, mensagem }),
      });

      if (!response.ok) throw new Error("Erro na resposta do servidor");

      const result = await response.json();
      alert(result.message);

      console.log("Contato criado:", result);

      // Boa prática: limpa o formulário e atualiza a lista após criar um novo
      frm.reset();
      listarContatos();
    } catch (error) {
      alert("Falha na conexão com o servidor.");
      console.error(error);
    }
  });
}

// Função separada para atualizar contato
async function atualizarContato(id, nome, email, mensagem) {
  const response = await fetch(`/api/contatos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, mensagem }),
  });

  const result = await response.json();
  console.log("Contato atualizado:", result);
  listarContatos(); // Atualiza a lista na tela
}

// Função para deletar contato
async function deletarContato(id) {
  const response = await fetch(`/api/contatos/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();
  console.log("Contato deletado:", result);
  listarContatos(); // Atualiza a lista na tela
}

// Listar contatos
async function listarContatos() {
  try {
    const response = await fetch("http://localhost:3000/api/contatos");
    const contatos = await response.json();

    const tabela = document.querySelector("#contatos-list, #tabela-contatos");
    if (!tabela) {
      return;
    }
    tabela.innerHTML = "";

    contatos.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nome}</td>
        <td>${c.email}</td>
        <td>${c.mensagem}</td>
      `;
      tabela.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao listar contatos:", error);
  }
}

// Carrega tabela ao abrir a página (com o nome correto da função)
listarContatos();

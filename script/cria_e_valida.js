/* Arquivo de script: cria_e_valida.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: cria_e_valida.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

// Cadastro de ONG
document.getElementById('cadastroOng').addEventListener('submit', function(event) {
  event.preventDefault();
  const form = event.target;
  const dados = new FormData(form);
  const novaOng = {};
  removerErros(form);

  dados.forEach((value, key) => novaOng[key] = value.trim());

  let valido = true;

  if (!novaOng.nomeOng) {
    mostrarErro(form.nomeOng, 'Informe o nome da ONG.');
    valido = false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novaOng.emailOng)) {
    mostrarErro(form.emailOng, 'Insira um e-mail válido.');
    valido = false;
  }

  if (!novaOng.senhaOng || novaOng.senhaOng.length > 8) {
    mostrarErro(form.senhaOng, 'A senha deve ter no máximo 8 caracteres.');
    valido = false;
  }

  if (!novaOng.cidade) {
    mostrarErro(form.cidade, 'Informe a cidade.');
    valido = false;
  }

  if (!valido) return;

  novaOng.id = 'ong-' + Date.now();
  const todasOngs = JSON.parse(localStorage.getItem('todasOngs')) || [];
  todasOngs.push(novaOng);
  localStorage.setItem('todasOngs', JSON.stringify(todasOngs));
  alert('ONG cadastrada com sucesso!');
  form.reset();
});

// Login de ONG
document.getElementById('loginOng').addEventListener('submit', function(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.emailLogin;
  const senha = form.senhaLogin;
  removerErros(form);

  let valido = true;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    mostrarErro(email, 'Insira um e-mail válido.');
    valido = false;
  }

  if (senha.value.length > 8) {
    mostrarErro(senha, 'A senha deve ter no máximo 8 caracteres.');
    valido = false;
  }

  if (!valido) return;

  const todasOngs = JSON.parse(localStorage.getItem('todasOngs')) || [];
  const ongLogada = todasOngs.find(ong => ong.emailOng === email.value.trim() && ong.senhaOng === senha.value);

  if (!ongLogada) {
    mostrarErro(senha, 'Email ou senha incorretos.');
    return;
  }

  localStorage.setItem('ongLogada', JSON.stringify(ongLogada));
  document.location.href = 'painel_ong.html';
});

// Funções auxiliares
function mostrarErro(input, mensagem) {
  const erro = document.createElement('small');
  erro.classList.add('erro');
  erro.textContent = mensagem;
  input.insertAdjacentElement('afterend', erro);
}

function removerErros(form) {
  form.querySelectorAll('.erro').forEach(el => el.remove());
}
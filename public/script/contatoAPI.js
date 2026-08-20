/*
  Script do formulário de contato.
  Valida os campos e envia a mensagem pelo cliente de e-mail do usuário.
*/
const formularioContato = document.querySelector("#contact-form");
const mensagemStatus = document.querySelector("#mensagemStatus");
const emailDestinoContato = "reminsonrps2023@gmail.com";

// Detecta o ambiente para escolher entre aplicativo de e-mail e webmail.
function dispositivoMovel() {
  const agente = navigator.userAgent || "";
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    agente,
  );
}

function montarURLServidorEmail(emailOrigem, destinatario, assunto, corpo) {
  // Seleciona o provedor pelo dominio do remetente e usa mailto como fallback.
  const dominio = (emailOrigem.split("@")[1] || "").toLowerCase();

  const to = encodeURIComponent(destinatario);
  const su = encodeURIComponent(assunto);
  const body = encodeURIComponent(corpo);

  if (dispositivoMovel()) {
    return {
      url: `mailto:${destinatario}?subject=${su}&body=${body}`,
      servidor: "app de e-mail do celular",
    };
  }

  if (dominio.includes("gmail.com")) {
    return {
      url: `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${to}&su=${su}&body=${body}`,
      servidor: "Gmail",
    };
  }

  if (
    dominio.includes("hotmail.com") ||
    dominio.includes("outlook.com") ||
    dominio.includes("live.com") ||
    dominio.includes("msn.com")
  ) {
    return {
      url: `https://outlook.live.com/mail/0/?path=/mail/action/compose&to=${to}&subject=${su}&body=${body}`,
      servidor: "Outlook",
    };
  }

  if (dominio.includes("yahoo.com") || dominio.includes("yahoo.com.br")) {
    return {
      url: `https://compose.mail.yahoo.com/?to=${to}&subject=${su}&body=${body}`,
      servidor: "Yahoo",
    };
  }

  // Alguns webmails não aceitam parâmetros de destinatário com consistência.
  // Nesses casos, usamos mailto para garantir o campo "Para" preenchido.
  if (
    dominio.includes("icloud.com") ||
    dominio.includes("me.com") ||
    dominio.includes("proton.me") ||
    dominio.includes("protonmail.com")
  ) {
    return {
      url: `mailto:${destinatario}?subject=${su}&body=${body}`,
      servidor: "aplicativo de e-mail padrão",
    };
  }

  return {
    url: `mailto:${destinatario}?subject=${su}&body=${body}`,
    servidor: "aplicativo de e-mail padrão",
  };
}

if (formularioContato) {
  // Valida os campos antes de montar a mensagem e redirecionar para o provedor escolhido.
  formularioContato.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = formularioContato.nome?.value.trim() || "";
    const email = formularioContato.email?.value.trim() || "";
    const mensagem = formularioContato.mensagem?.value.trim() || "";
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!nome || !email || !mensagem) {
      if (mensagemStatus) {
        mensagemStatus.textContent =
          "Preencha todos os campos antes de enviar.";
        mensagemStatus.style.color = "#c0392b";
      }
      return;
    }

    if (!emailValido) {
      if (mensagemStatus) {
        mensagemStatus.textContent = "Informe um e-mail válido para continuar.";
        mensagemStatus.style.color = "#c0392b";
      }
      return;
    }

    const assunto = `Contato PetConecta - ${nome}`;
    const corpoEmail =
      `Nome: ${nome}\n` + `E-mail: ${email}\n\n` + `Mensagem:\n${mensagem}`;

    const destino = montarURLServidorEmail(
      email,
      emailDestinoContato,
      assunto,
      corpoEmail,
    );

    window.location.href = destino.url;

    if (mensagemStatus) {
      mensagemStatus.textContent = `Redirecionando para ${destino.servidor} para finalizar o envio.`;
      mensagemStatus.style.color = "#2e8b57";
    }

    formularioContato.reset();
  });
}

/* Arquivo de script: contatoAPI.js */

const formularioContato = document.querySelector("#contact-form");
const mensagemStatus = document.querySelector("#mensagemStatus");
const emailDestinoContato = "reminsonrps2023@gmail.com";

function montarURLServidorEmail(emailOrigem, destinatario, assunto, corpo) {
  const dominio = (emailOrigem.split("@")[1] || "").toLowerCase();

  const to = encodeURIComponent(destinatario);
  const su = encodeURIComponent(assunto);
  const body = encodeURIComponent(corpo);

  if (dominio.includes("gmail.com")) {
    return {
      url: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`,
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
      url: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}&body=${body}`,
      servidor: "Outlook",
    };
  }

  if (dominio.includes("yahoo.com") || dominio.includes("yahoo.com.br")) {
    return {
      url: `https://compose.mail.yahoo.com/?to=${to}&subject=${su}&body=${body}`,
      servidor: "Yahoo",
    };
  }

  return {
    url: `mailto:${destinatario}?subject=${su}&body=${body}`,
    servidor: "aplicativo de e-mail padrão",
  };
}

if (formularioContato) {
  formularioContato.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = formularioContato.nome?.value.trim() || "";
    const email = formularioContato.email?.value.trim() || "";
    const mensagem = formularioContato.mensagem?.value.trim() || "";

    if (!nome || !email || !mensagem) {
      if (mensagemStatus) {
        mensagemStatus.textContent =
          "Preencha todos os campos antes de enviar.";
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

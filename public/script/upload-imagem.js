import { auth } from "./firebase.js";

const apiBaseUrl = window.PET_CONECTA_API_URL || "";

export async function enviarImagemParaModeracao(arquivo) {
  const usuario = auth.currentUser;
  if (!usuario) {
    const erro = new Error("Usuário não autenticado.");
    erro.code = "AUTH_REQUIRED";
    throw erro;
  }

  const token = await usuario.getIdToken();
  const dados = new FormData();
  dados.append("imagem", arquivo);

  const resposta = await fetch(`${apiBaseUrl}/api/imagens/moderar-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: dados,
  });

  let resultado;
  try {
    resultado = await resposta.json();
  } catch (_error) {
    throw new Error("O servidor de moderação não respondeu corretamente.");
  }

  if (!resposta.ok) {
    const erro = new Error(
      resultado.error || "Não foi possível analisar a imagem.",
    );
    erro.code =
      resultado.code ||
      (resposta.status === 401 ? "AUTH_REQUIRED" : "MODERATION_UNAVAILABLE");
    throw erro;
  }

  return resultado.url;
}
